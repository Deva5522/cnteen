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

// CREATE ITEM
router.post('/', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE ITEM
router.put('/:id', async (req, res) => {
    try {
        const item = await Item.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE ITEM
router.delete('/:id', async (req, res) => {
    try {
        const item = await Item.findOneAndDelete({ id: req.params.id });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
