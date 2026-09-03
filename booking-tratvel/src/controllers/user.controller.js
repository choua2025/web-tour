import { User } from '../models/index.js';
import { deleteConflict } from '../middleware/error.middleware.js';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/roles.js';

// GET all users
const getAll = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET user by ID
const getById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: ['bookings', 'reviews'],
        });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE user
const create = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const user = await User.create({ name, email, password, phone, role });
        const userData = user.toJSON();
        delete userData.password;
        res.status(201).json({ success: true, data: userData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE user
const update = async (req, res) => {
    try {
        const isAdmin = req.user.role === ROLES.ADMIN;

        // A customer may only edit their own record
        if (!isAdmin && String(req.user.id) !== String(req.params.id)) {
            return res.status(403).json({ success: false, message: "Forbidden. You don't have permission." });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // ...and never their own role — that would be self-promotion to admin
        const { role, ...changes } = req.body;
        await user.update(isAdmin ? req.body : changes);
        const userData = user.toJSON();
        delete userData.password;
        res.json({ success: true, data: userData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE user
const remove = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        await user.destroy();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        // RESTRICT refusals are a normal outcome here, not a server fault.
        const conflict = await deleteConflict(error, 'This customer');
        if (conflict) return res.status(409).json({ success: false, message: conflict });
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { getAll, getById, create, update, remove };
