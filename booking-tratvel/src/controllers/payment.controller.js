import Stripe from 'stripe';
import { Op } from 'sequelize';
import { deleteConflict } from '../middleware/error.middleware.js';
import { Payment, Booking, Tour } from '../models/index.js';
import { sendBookingConfirmationEmail } from '../utils/email.js';
import { broadcast } from '../utils/events.js';

// `booking.email` / `payment.email` do not exist as columns — the address lives
// on the booking's contact fields, or on the account that placed it.
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
            console.warn(`[booking ${bookingId}] paid but no email address to notify`);
            return;
        }

        await sendBookingConfirmationEmail(recipient, booking);
        console.log(`[booking ${bookingId}] confirmation email sent to ${recipient}`);
    } catch (error) {
        // A mail failure must not turn a successful payment into a 400.
        console.error(`[booking ${bookingId}] could not send confirmation email:`, error.message);
    }
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// GET all payments
// A payment belongs to a booking, and a booking is either a tour or a stay.
// Callers can ask for one kind with ?type=tour or ?type=hotel; every row also
// carries a `type` so the client never has to infer it.
const bookingTypeFilter = (type) => {
    if (type === 'tour') return { tour_id: { [Op.ne]: null } };
    if (type === 'hotel') return { hotel_id: { [Op.ne]: null } };
    return undefined;
};

const withType = (payment) => {
    const row = payment.toJSON();
    row.type = row.booking?.hotel_id ? 'hotel' : row.booking?.tour_id ? 'tour' : 'unknown';
    return row;
};

const getAll = async (req, res) => {
    try {
        const type = req.query.type;
        const bookingWhere = bookingTypeFilter(type);

        const payments = await Payment.findAll({
            order: [['payment_date', 'DESC']],
            include: [
                {
                    association: 'booking',
                    // user_id/tour_id used to be stripped here, which left the
                    // admin's Booking ID column rendering nothing.
                    where: bookingWhere,
                    required: Boolean(bookingWhere),
                    include: [
                        { association: 'user', attributes: ['id', 'name', 'email'] },
                        { association: 'tour', attributes: ['id', 'title', 'price'] },
                        // Hotel stays were missing entirely, so a hotel payment
                        // showed no idea what it was for.
                        { association: 'hotel', attributes: ['id', 'name', 'price_per_night'] },
                    ],
                },
            ],
        });

        const rows = payments.map(withType);
        const sum = (kind) => rows
            .filter((r) => r.type === kind)
            .reduce((total, r) => total + Number(r.amount || 0), 0);

        return res.json({
            success: true,
            data: rows,
            meta: {
                total: rows.length,
                tour: { count: rows.filter((r) => r.type === 'tour').length, amount: sum('tour') },
                hotel: { count: rows.filter((r) => r.type === 'hotel').length, amount: sum('hotel') },
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET payment by ID
const getById = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            attributes: { exclude: ['booking_id'] },
            include: [
                {
                    association: 'booking',
                    attributes: { exclude: ['user_id', 'tour_id'] },
                    include: [
                        {
                            association: 'user',
                            attributes: ['name', 'email']
                        },
                        {
                            association: 'tour',
                            attributes: ['title', 'price']
                        }
                    ]
                }
            ],
        });
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        return res.json({ success: true, data: payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE payment
const create = async (req, res) => {
    try {
        const { booking_id, amount, payment_method } = req.body;
        // Verify booking exists
        const booking = await Booking.findByPk(booking_id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const payment = await Payment.create({
            booking_id,
            amount: amount || booking.total_price,
            payment_method,
            payment_date: new Date(),
        });

        // Update booking payment_status
        await booking.update({ payment_status: 'paid' });
        broadcast('payment.paid', {
            id: booking.id, user_id: booking.user_id,
            payment_status: 'paid', at: new Date().toISOString(),
        }, { userId: booking.user_id });
        void notifyTraveller(booking.id);

        return res.status(201).json({ success: true, data: payment });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE payment (status only)
const update = async (req, res) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        await payment.update({ status });
        if (status === 'success') void notifyTraveller(payment.booking_id);
        return res.json({ success: true, message: 'Payment updated successfully', data: payment });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE payment
const remove = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        await payment.destroy();
        return res.json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        // RESTRICT refusals are a normal outcome here, not a server fault.
        const conflict = await deleteConflict(error, 'This payment');
        if (conflict) return res.status(409).json({ success: false, message: conflict });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id, {
            include: [{ association: 'tour' }, { association: 'hotel' }]
        });

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (booking.payment_status === 'paid') return res.status(400).json({ success: false, message: 'Booking is already paid' });

        // :3001 is the storefront; :3000 is the admin console, so a wrong or
        // missing FRONTEND_URL drops paying customers into the wrong app.
        const storefront = process.env.FRONTEND_URL || 'http://localhost:3001';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            // A hotel booking has no tour, and Stripe rejects an
                            // empty product name.
                            name: booking.tour?.title || booking.hotel?.name || 'Booking',
                            description: booking.hotel
                                ? `Stay ${booking.check_in} to ${booking.check_out} · ${booking.number_of_people} guest(s)`
                                : `Number of people: ${booking.number_of_people}`,
                        },
                        unit_amount: Math.round(booking.total_price * 100), // Stripe requires amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // booking_id rides along so the return pages can show the real
            // booking without having to resolve the Stripe session first.
            success_url: `${storefront}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
            cancel_url: `${storefront}/payment-cancel?booking_id=${booking.id}`,
            client_reference_id: booking.id.toString(),
            metadata: {
                booking_id: booking.id.toString(),
            }
        });

        return res.json({ success: true, id: session.id, url: session.url });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Handle Stripe Webhook
const handleStripeWebhook = async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } else {
            // If no webhook secret is configured (e.g., local dev without CLI), just use the parsed body
            // Note: req.body is a Buffer here because of express.raw(), so we must parse it if we aren't using constructEvent
            event = JSON.parse(payload.toString());
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata.booking_id || session.client_reference_id;

        if (bookingId) {
            try {
                const booking = await Booking.findByPk(bookingId);
                if (booking && booking.payment_status !== 'paid') {
                    // Update booking
                    await booking.update({ payment_status: 'paid' });

                    // Create payment record
                    await Payment.create({
                        booking_id: bookingId,
                        amount: session.amount_total / 100, // Convert cents back to dollars
                        payment_method: 'card',
                        payment_date: new Date(),
                        status: 'success'
                    });
                    console.log(`Successfully completed payment for booking ${bookingId}`);

                    // The customer paid on Stripe's page and never came back
                    // through our own create/update endpoints, so this is the
                    // only chance to send them a confirmation. Not awaited:
                    // Stripe retries the webhook if we are slow to ack.
                    // The customer is sitting on /payment-success waiting for
                    // exactly this; without it they poll five times and give up.
                    broadcast('payment.paid', {
                        id: booking.id, user_id: booking.user_id,
                        payment_status: 'paid', at: new Date().toISOString(),
                    }, { userId: booking.user_id });
                    void notifyTraveller(bookingId);
                }
            } catch (err) {
                console.error(`Error processing payment for booking ${bookingId}:`, err);
            }
        }
    }

    res.status(200).send();
};

export { getAll, getById, create, update, remove, createCheckoutSession, handleStripeWebhook };
