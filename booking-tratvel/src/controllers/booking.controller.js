import { Booking, User, Tour, Hotel } from '../models/index.js';
import { deleteConflict } from '../middleware/error.middleware.js';

// Whole nights between two YYYY-MM-DD dates; null when either is unparseable.
const nightsBetween = (checkIn, checkOut) => {
    const from = new Date(checkIn);
    const to = new Date(checkOut);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
    return Math.round((to - from) / (1000 * 60 * 60 * 24));
};
import { sendBookingConfirmationEmail } from '../utils/email.js';
import { broadcast } from '../utils/events.js';

// Sends the confirmation to whoever the traveller asked us to contact, falling
// back to the account holder. Never lets a mail problem fail the API call —
// the booking really was updated, and the admin should not see an error for it.
// Kept deliberately small: enough for the bell to show a line and decide
// whether it cares, not a second copy of the record.
const eventPayload = (booking) => ({
    id: booking.id,
    user_id: booking.user_id,
    status: booking.status,
    payment_status: booking.payment_status,
    total_price: booking.total_price,
    contact_name: booking.contact_name,
    tour_id: booking.tour_id,
    hotel_id: booking.hotel_id,
    at: new Date().toISOString(),
});

const notifyTraveller = async (bookingId) => {
    try {
        const booking = await Booking.findByPk(bookingId, {
            include: [
                { association: 'user' },
                { association: 'tour', include: ['destination'] },
                { association: 'hotel', include: ['destination'] },
            ],
        });
        if (!booking) return;

        const recipient = booking.contact_email || booking.user?.email;
        if (!recipient) {
            console.warn(`[booking ${bookingId}] confirmed but no email address to notify`);
            return;
        }

        await sendBookingConfirmationEmail(recipient, booking);
        console.log(`[booking ${bookingId}] confirmation email sent to ${recipient}`);
    } catch (error) {
        console.error(`[booking ${bookingId}] could not send confirmation email:`, error.message);
    }
};

// First argument that holds actual characters, trimmed; null when none do.
const firstFilled = (...values) => {
    for (const value of values) {
        const text = typeof value === 'string' ? value.trim() : value;
        if (text) return text;
    }
    return null;
};

// GET all bookings
// This endpoint used to return every row with four joins attached, which the
// admin bell then polled every 30 seconds and sliced to 15 client-side. The
// payload grew with the table forever; at a thousand bookings that poll alone
// was moving gigabytes a day.
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;

const readPaging = (query) => {
    const rawLimit = Number.parseInt(query.limit, 10);
    const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const rawPage = Number.parseInt(query.page, 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawOffset = Number.parseInt(query.offset, 10);
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0
        ? rawOffset
        : (page - 1) * limit;

    return { limit, offset, page };
};

const getAll = async (req, res) => {
    try {
        // Admins see the whole book; a customer only ever sees their own
        const scope = req.user.role === 'admin' ? {} : { user_id: req.user.id };
        const { limit, offset, page } = readPaging(req.query);

        // findAndCountAll with `distinct` so the joins do not inflate the count.
        const { rows, count } = await Booking.findAndCountAll({
            where: scope,
            order: [['createdAt', 'DESC']], // newest first — the admin feed reads off this
            attributes: { exclude: ['user_id', 'tour_id'] },
            include: [
                { association: 'user', attributes: { exclude: ['password'] } },
                { association: 'tour', include: ['destination'] },
                { association: 'hotel', include: ['destination'] },
                { association: 'payments', include: ['booking'] },
            ],
            limit,
            offset,
            distinct: true,
        });

        return res.json({
            success: true,
            data: rows,
            meta: {
                total: count,
                limit,
                offset,
                page,
                pages: Math.max(1, Math.ceil(count / limit)),
                hasMore: offset + rows.length < count,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET booking by ID
const getById = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            attributes: { include: ['user_id'], exclude: ['tour_id'] },
            include: [
                { association: 'user', attributes: { exclude: ['password'] } },
                { association: 'tour', include: ['destination'] },
                { association: 'hotel', include: ['destination'] },
                { association: 'payments', include: ['booking'] },
            ],
        });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Anyone signed in could otherwise walk the ids and read every
        // customer's name, email and phone.
        if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "Forbidden. You don't have permission." });
        }

        const data = booking.toJSON();
        delete data.user_id;
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE booking
const create = async (req, res) => {
    try {
        const {
            user_id, tour_id, hotel_id, number_of_people,
            check_in, check_out,
            contact_name, contact_email, contact_phone,
            // the storefront form posts these under plain names
            name, email, phone,
        } = req.body;

        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // A booking is one thing or the other. Accepting both would leave an
        // ambiguous row that no price rule fits.
        if (tour_id && hotel_id) {
            return res.status(400).json({ success: false, message: 'Provide either a tour or a hotel, not both' });
        }
        if (!tour_id && !hotel_id) {
            return res.status(400).json({ success: false, message: 'A booking needs either a tour or a hotel' });
        }

        const guests = Number(number_of_people) || 1;
        let calculated_price;
        let stay = {};

        if (tour_id) {
            const tour = await Tour.findByPk(tour_id);
            if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
            calculated_price = Number(tour.price) * guests;
        } else {
            const hotel = await Hotel.findByPk(hotel_id);
            if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

            if (!check_in || !check_out) {
                return res.status(400).json({ success: false, message: 'Check-in and check-out dates are required' });
            }

            const nights = nightsBetween(check_in, check_out);
            if (nights === null) {
                return res.status(400).json({ success: false, message: 'Check-in or check-out is not a valid date' });
            }
            if (nights < 1) {
                return res.status(400).json({ success: false, message: 'Check-out must be at least one night after check-in' });
            }

            // Hotels are priced per night; guests are recorded but do not multiply.
            calculated_price = Number(hotel.price_per_night) * nights;
            stay = { check_in, check_out };
        }

        const booking = await Booking.create({
            user_id,
            tour_id: tour_id || null,
            hotel_id: hotel_id || null,
            ...stay,
            number_of_people: guests,
            total_price: calculated_price,
            // For a stay the trip starts on check-in, not on the day it was booked.
            booking_date: stay.check_in ? new Date(stay.check_in) : new Date(),
            // Fall back to the account so the admin always has someone to call.
            // A blank form field arrives as '' or ' ' (e.g. "firstName lastName"
            // with both empty), which is truthy enough to defeat a plain ||.
            contact_name: firstFilled(contact_name, name, user.name),
            contact_email: firstFilled(contact_email, email, user.email),
            contact_phone: firstFilled(contact_phone, phone, user.phone),
        });

        // Admins get every new booking; the customer gets their own.
        broadcast('booking.created', eventPayload(booking), { userId: booking.user_id });

        return res.status(201).json({ success: true, data: booking });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE booking (status changes)
const update = async (req, res) => {
    try {
        const { status, payment_status } = req.body;
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const wasConfirmed = booking.status === 'confirmed';
        const wasPaid = booking.payment_status === 'paid';

        // Only touch the fields actually sent — a partial update used to blank
        // out whichever of the two was omitted.
        const changes = {};
        if (status !== undefined) changes.status = status;
        if (payment_status !== undefined) changes.payment_status = payment_status;
        await booking.update(changes);

        // Tell the traveller once, on the transition into a good state — not on
        // every save, or an admin editing anything would re-send the email.
        const justConfirmed = !wasConfirmed && booking.status === 'confirmed';
        const justPaid = !wasPaid && booking.payment_status === 'paid';
        if (justConfirmed || justPaid) {
            broadcast(
                justPaid ? 'payment.paid' : 'booking.confirmed',
                eventPayload(booking),
                { userId: booking.user_id }
            );

            // Deliberately not awaited: an SMTP round trip took ~5s, which the
            // admin was left staring at. notifyTraveller swallows its own
            // errors and logs them, so nothing escapes here.
            void notifyTraveller(booking.id);
        }

        return res.json({ success: true, data: booking });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE booking
const remove = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        await booking.destroy();
        return res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        // RESTRICT refusals are a normal outcome here, not a server fault.
        const conflict = await deleteConflict(error, 'This booking');
        if (conflict) return res.status(409).json({ success: false, message: conflict });
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { getAll, getById, create, update, remove };
