import express from 'express';
import Item from '../models/Item.js';

const router = express.Router();

// GET ALL ITEMS
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// INITIAL SEED (Internal use to populate DB)
router.post('/seed', async (req, res) => {
    try {
        await Item.deleteMany({});
        const items = req.body; // Expects array of items
        const created = await Item.insertMany(items);
        res.json(created);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
