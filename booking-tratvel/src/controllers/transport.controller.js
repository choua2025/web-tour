import { Transport } from '../models/index.js';

// GET all transports
const getAll = async (req, res) => {
    try {
        const transports = await Transport.findAll();
        return res.json({ success: true, data: transports });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET transport by ID
const getById = async (req, res) => {
    try {
        const transport = await Transport.findByPk(req.params.id);
        if (!transport) return res.status(404).json({ success: false, message: 'Transport not found' });
        return res.json({ success: true, data: transport });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE transport
const create = async (req, res) => {
    try {
        const transport = await Transport.create(req.body);
        return res.status(201).json({ success: true, data: transport });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE transport
const update = async (req, res) => {
    try {
        const transport = await Transport.findByPk(req.params.id);
        if (!transport) return res.status(404).json({ success: false, message: 'Transport not found' });
        await transport.update(req.body);
        return res.json({ success: true, data: transport });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE transport
const remove = async (req, res) => {
    try {
        const transport = await Transport.findByPk(req.params.id);
        if (!transport) return res.status(404).json({ success: false, message: 'Transport not found' });
        await transport.destroy();
        return res.json({ success: true, message: 'Transport deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { getAll, getById, create, update, remove };
