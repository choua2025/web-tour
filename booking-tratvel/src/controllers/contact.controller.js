import { sendContactEmailToAdmin } from '../utils/email.js';

export const submitContact = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Send email to admin
        await sendContactEmailToAdmin(email);

        res.status(200).json({ message: 'Subscription successful. Admin has been notified.' });
    } catch (error) {
        console.error('Submit contact error:', error);
        res.status(500).json({ message: 'Failed to submit contact', error: error.message });
    }
};
