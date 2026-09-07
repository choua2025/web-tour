import { Destination } from '../models/index.js';
import { deleteConflict } from '../middleware/error.middleware.js';
import { deleteFromCloudinary, getPublicIdFromUrl } from '../utils/upload.js';

// GET all destinations
const getAll = async (req, res) => {
    try {
        const destinations = await Destination.findAll({
            include: ['tours', 'hotels'],
        });
        return res.json({ success: true, data: destinations });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllDestinations = async (req, res) => {
    try {
        const destinations = await Destination.findAll({
            include: ['tours', 'hotels'],
        });
        return res.json({ success: true, data: destinations });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET destination by ID
const getById = async (req, res) => {
    try {
        const destination = await Destination.findByPk(req.params.id, {
            include: ['tours', 'hotels'],
        });
        if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
        return res.json({ success: true, data: destination });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE destination
const create = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.file) {
            data.image = req.file.path;
        }

        const destination = await Destination.create(data);
        return res.status(201).json({ success: true, data: destination });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE destination
const update = async (req, res) => {
    try {
        const destination = await Destination.findByPk(req.params.id);
        if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });

        const data = { ...req.body };

        // If a new image was uploaded, delete the old one from Cloudinary
        if (req.file) {
            if (destination.image) {
                const oldPublicId = getPublicIdFromUrl(destination.image);
                if (oldPublicId) await deleteFromCloudinary(oldPublicId);
            }
            data.image = req.file.path;
        }

        await destination.update(data);
        return res.json({ success: true, data: destination });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE destination
const remove = async (req, res) => {
    try {
        const destination = await Destination.findByPk(req.params.id);
        if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });

        // Delete image from Cloudinary before removing the record
        if (destination.image) {
            const publicId = getPublicIdFromUrl(destination.image);
            if (publicId) await deleteFromCloudinary(publicId);
        }

        await destination.destroy();
        return res.json({ success: true, message: 'Destination deleted successfully' });
    } catch (error) {
        // RESTRICT refusals are a normal outcome here, not a server fault.
        const conflict = await deleteConflict(error, 'This destination');
        if (conflict) return res.status(409).json({ success: false, message: conflict });
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { getAll, getAllDestinations, getById, create, update, remove };
