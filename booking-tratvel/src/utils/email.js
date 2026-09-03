// Side-effect import: hoisted, so the env is populated before the transporter
// below is built. Without it this module depends on whichever module happened
// to call dotenv.config() first.
import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT === '465',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const sendResetCodeEmail = async (toEmail, code) => {
    const mailOptions = {
        from: `"Travel Booking System" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Password Reset Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 12px;">
                <h2 style="color: #333; text-align: center;">Password Reset</h2>
                <p style="color: #555; text-align: center;">You requested a password reset. Use the code below:</p>
                <div style="background: #4f46e5; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    ${code}
                </div>
                <p style="color: #888; text-align: center; font-size: 14px;">This code expires in <strong>15 minutes</strong>.</p>
                <p style="color: #888; text-align: center; font-size: 13px;">If you did not request this, please ignore this email.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const row = (label, value) => `
    <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;text-align:right;font-weight:600;">${value}</td>
    </tr>`;

// `booking` should come with its `tour` (and the tour's `destination`) loaded,
// otherwise those lines are simply skipped rather than printing "undefined".
const sendBookingConfirmationEmail = async (toEmail, booking) => {
    if (!toEmail) {
        throw new Error('No recipient address for booking ' + booking?.id);
    }

    const paid = booking.payment_status === 'paid';
    const reference = `BK-${new Date(booking.createdAt || Date.now()).getFullYear()}-${String(booking.id).padStart(4, '0')}`;

    // A booking is either a tour or a stay, so describe whichever it is.
    const place = booking.tour || booking.hotel;
    const rows = [
        row('Reference', reference),
        booking.tour?.title ? row('Tour', booking.tour.title) : '',
        booking.hotel?.name ? row('Hotel', booking.hotel.name) : '',
        place?.destination?.name ? row('Destination', place.destination.name) : '',
        booking.hotel
            ? row('Stay', `${formatDate(booking.check_in)} → ${formatDate(booking.check_out)}`)
            : row('Travel date', formatDate(booking.booking_date)),
        row('Guests', booking.number_of_people),
        row('Booking status', booking.status),
        row('Payment', booking.payment_status),
        row(paid ? 'Total paid' : 'Total due', money(booking.total_price)),
    ].join('');

    const mailOptions = {
        from: `"Travel Booking System" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: `✅ Booking confirmed — ${reference}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 12px;">
                <h2 style="color: #0f172a; text-align: center; margin: 0 0 8px;">Your booking is confirmed</h2>
                <p style="color: #64748b; text-align: center; margin: 0 0 24px; font-size: 14px;">
                    Hi${booking.contact_name ? ' ' + booking.contact_name : ''}, we're all set for your trip.
                </p>

                <div style="background: #ffffff; border-radius: 8px; padding: 8px 20px;">
                    <table style="width:100%;border-collapse:collapse;">${rows}</table>
                </div>

                ${paid
                ? '<p style="color:#16a34a;text-align:center;font-size:14px;margin:20px 0 0;">Payment received — nothing further to do.</p>'
                : '<p style="color:#d97706;text-align:center;font-size:14px;margin:20px 0 0;">Your seat is held. Please complete the payment to finalise it.</p>'}

                <p style="color: #94a3b8; text-align: center; font-size: 12px; margin-top: 24px;">
                    Questions about this booking? Just reply to this email.
                </p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

const sendContactEmailToAdmin = async (userEmail) => {
    const mailOptions = {
        from: `"Travel Booking System" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_USER, // Send to admin
        subject: '📬 New Newsletter Subscription / Contact',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 12px;">
                <h2 style="color: #333; text-align: center;">New Contact Submission</h2>
                <p style="color: #555; text-align: center;">A user has submitted their email via the newsletter form.</p>
                <div style="background: #e0e7ff; color: #3730a3; font-size: 18px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    ${userEmail}
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

export { transporter, sendResetCodeEmail, sendBookingConfirmationEmail, sendContactEmailToAdmin };
