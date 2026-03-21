import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { id, pass } = req.body;
        if (!id || !pass) {
            return res.status(400).json({ success: false, message: 'ID and Password are required' });
        }
        const cleanId = String(id).trim();
        const cleanPass = String(pass).trim();
        console.log(`🔍 Try Login: ID=[${cleanId}] Pass=[${cleanPass}]`);

        // Admin hardcoded check (kept for simplicity as per original design)
        if (cleanId.toLowerCase() === 'admin' && cleanPass === 'admin123') {
            return res.json({
                success: true,
                user: { id: 'admin', name: 'Canteen Admin', role: 'admin' }
            });
        }

        const user = await User.findOne({ id: new RegExp('^' + cleanId + '$', 'i') });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.password !== cleanPass) { // In prod, use bcrypt!
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
        if (!id || !name || !pass) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const cleanId = String(id).trim();
        const cleanPass = String(pass).trim();
        const cleanName = String(name).trim();

        const existing = await User.findOne({ id: new RegExp('^' + cleanId + '$', 'i') });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User ID already exists' });
        }

        const newUser = new User({
            id: cleanId,
            name: cleanName,
            password: cleanPass,
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

// UPDATE PROFILE
router.put('/:id/profile', async (req, res) => {
    try {
        const { name, email, phone, password, birthday } = req.body;
        const updates = { name, email, phone };
        if (password) updates.password = password;
        if (birthday) updates['loyalty.birthday'] = birthday;

        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            { $set: updates },
            { new: true }
        );
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE WALLET (ADD MONEY)
router.put('/:id/wallet', async (req, res) => {
    try {
        const { amount } = req.body;


        // Find user first to get current balance (for safety/logging)
        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const newBalance = (user.wallet || 0) + parseFloat(amount);

        user.wallet = newBalance;
        await user.save();

        res.json({ success: true, wallet: newBalance });
    } catch (err) {
        console.error("❌ Wallet Update Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET USER DETAILS
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
