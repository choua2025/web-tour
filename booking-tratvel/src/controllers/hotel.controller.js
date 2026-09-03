import { Hotel } from '../models/index.js';
import { deleteFromCloudinary, getPublicIdFromUrl } from '../utils/upload.js';
import { deleteConflict } from '../middleware/error.middleware.js';

// GET all hotels
const getAll = async (req, res) => {
    try {
        const hotels = await Hotel.findAll({
            include: ['destination'],
        });
        return res.json({ success: true, data: hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET hotel by ID
const getById = async (req, res) => {
    try {
        const hotel = await Hotel.findByPk(req.params.id, {
            include: ['destination'],
        });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        return res.json({ success: true, data: hotel });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE hotel
const create = async (req, res) => {
    try {
        const data = { ...req.body };

        // multer/Cloudinary already stored the upload; req.file.path is its URL.
        if (req.file) data.image = req.file.path;

        const hotel = await Hotel.create(data);
        return res.status(201).json({ success: true, data: hotel });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE hotel
const update = async (req, res) => {
    try {
        const hotel = await Hotel.findByPk(req.params.id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        const data = { ...req.body };

        // Replacing the picture should not leave the old one paid for in
        // Cloudinary forever.
        if (req.file) {
            if (hotel.image) {
                const oldPublicId = getPublicIdFromUrl(hotel.image);
                if (oldPublicId) await deleteFromCloudinary(oldPublicId).catch(() => {});
            }
            data.image = req.file.path;
        }

        await hotel.update(data);
        return res.json({ success: true, data: hotel });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE hotel
const remove = async (req, res) => {
    try {
        const hotel = await Hotel.findByPk(req.params.id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        await hotel.destroy();
        return res.json({ success: true, message: 'Hotel deleted successfully' });
    } catch (error) {
        // RESTRICT refusals are a normal outcome here, not a server fault.
        const conflict = await deleteConflict(error, 'This hotel');
        if (conflict) return res.status(409).json({ success: false, message: conflict });
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { getAll, getById, create, update, remove };
