import { Review, User, Tour } from '../models/index.js';

// GET all reviews
const getAll = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { association: 'user', attributes: ['id', 'name', 'email'] },
                { association: 'tour', attributes: ['id', 'title'] },
            ],
        });
        return res.json({ success: true, data: reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET review by ID
const getById = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id, {
            include: [
                { association: 'user', attributes: ['id', 'name', 'email'] },
                { association: 'tour', attributes: ['id', 'title'] },
            ],
        });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        return res.json({ success: true, data: review });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE review
const create = async (req, res) => {
    try {
        const { user_id, tour_id, rating, comment } = req.body;

        // Verify user and tour exist
        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const tour = await Tour.findByPk(tour_id);
        if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });

        const review = await Review.create({ user_id, tour_id, rating, comment });
        return res.status(201).json({ success: true, data: review });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE review
const update = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        await review.update(req.body);
        return res.json({ success: true, data: review });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE review
const remove = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        await review.destroy();
        return res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { getAll, getById, create, update, remove };
