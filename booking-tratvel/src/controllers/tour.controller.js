import { Tour } from '../models/index.js';
import { deleteConflict } from '../middleware/error.middleware.js';

// GET all tours
const getAll = async (req, res) => {
    try {
        const tours = await Tour.findAll({
            include: [
                { association: 'destination' },
                { association: 'reviews' },
            ],
        });
        return res.json({ success: true, data: tours });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET tour by ID
const getById = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id, {
            include: [
                { association: 'destination' },
                { association: 'bookings' },
                { association: 'reviews' },
            ],
        });
        if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
        return res.json({ success: true, data: tour });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE tour
const create = async (req, res) => {
    try {
        const tour = await Tour.create(req.body);
       return res.status(201).json({ success: true, data: tour });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE tour
const update = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);
        if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
        await tour.update(req.body);
        return res.json({ success: true, data: tour });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE tour
const remove = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);
        if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
        await tour.destroy();
        return res.json({ success: true, message: 'Tour deleted successfully' });
    } catch (error) {
        // RESTRICT refusals are a normal outcome here, not a server fault.
        const conflict = await deleteConflict(error, 'This tour');
        if (conflict) return res.status(409).json({ success: false, message: conflict });
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { getAll, getById, create, update, remove };
