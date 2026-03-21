
import express from 'express';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// GET ALL
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE
router.post('/', async (req, res) => {
    try {
        const { message, type } = req.body;
        const newAnnouncement = new Announcement({
            id: Date.now(),
            message,
            type
        });
        const savedAnnouncement = await newAnnouncement.save();
        res.status(201).json(savedAnnouncement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await Announcement.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
