import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { id, pass } = req.body;
        console.log(`🔍 Try Login: ID=[${id}] Pass=[${pass}]`);

        // Admin hardcoded check (kept for simplicity as per original design)
        if (id.toLowerCase() === 'admin' && pass === 'admin123') {
            return res.json({
                success: true,
                user: { id: 'admin', name: 'Canteen Admin', role: 'admin' }
            });
        }

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.password !== pass) { // In prod, use bcrypt!
            return res.status(401).json({ success: false, message: 'Invalid Credentials' });
        }

        res.json({ success: true, user });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { id, name, pass } = req.body;

        const existing = await User.findOne({ id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User ID already exists' });
        }

        const newUser = new User({
            id,
            name,
            password: pass,
            role: 'user'
        });

        await newUser.save();
        res.json({ success: true, user: newUser });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE PREFERENCES
router.put('/:id/preferences', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            { $set: { preferences: req.body } },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
