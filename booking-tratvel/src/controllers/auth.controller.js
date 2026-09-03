import { User, ResetCode } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendResetCodeEmail } from '../utils/email.js';
import { Op } from 'sequelize';
import { ROLES } from '../constants/roles.js';

// ── REGISTER ───────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // `role` is deliberately NOT taken from the body: self-signup would
        // otherwise let anyone mint an admin. Elevated accounts are created by
        // an existing admin through POST /api/users.
        const newUser = await User.create({ name, email, password, phone, role: ROLES.USER });

        // Generate token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: newUser,
            token: token,
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// ── LOGIN ──────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }


        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userData = user.toJSON();
        delete userData.password;

        return res.json({
            success: true,
            message: 'Login successful',
            // data: userData,
            token,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET PROFILE (me) ───────────────────────────
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [
                'bookings',
                'reviews'
            ],
        });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ── FORGOT PASSWORD ───────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal whether email exists (security best practice)
            return res.json({ success: true, message: 'If an account exists with this email, a reset code has been sent' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Remove existing codes for this email
        await ResetCode.destroy({ where: { email } });

        // Store new code with 15-minute expiry in DB
        await ResetCode.create({
            email,
            code,
            expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });

        // Send code via email
        try {
            await sendResetCodeEmail(email, code);
        } catch (mailError) {
            // Don't leave an unusable code behind if the mail never went out
            await ResetCode.destroy({ where: { email } });
            console.error('[forgot-password] Failed to send reset email:', mailError.message);
            return res.status(502).json({
                success: false,
                message: 'Could not send the reset email right now. Please try again later.',
            });
        }

        return res.json({
            success: true,
            message: 'Reset code sent to your email',
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ── RESET PASSWORD ────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Verify reset code from DB
        const stored = await ResetCode.findOne({
            where: {
                email,
                code,
                expires_at: {
                    [Op.gt]: new Date() // Must not be expired
                }
            }
        });

        if (!stored) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code. Please request a new one.' });
        }

        // Find user and update password
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.update({ password: newPassword });

        // Clean up used code
        await ResetCode.destroy({ where: { email } });

        return res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { register, login, getProfile, forgotPassword, resetPassword };
