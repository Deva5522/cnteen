import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// GET ALL ORDERS (For Admin or User specific)
router.get('/', async (req, res) => {
    try {
        // Simple filter by userId query param
        const query = {};
        if (req.query.userId) query.userId = req.query.userId;

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PLACE ORDER
router.post('/', async (req, res) => {
    try {
        const { userId, items, total, paymentMethod } = req.body;

        // Create Order
        const newOrder = new Order({
            userId,
            items,
            total,
            paymentMethod,
            otp: Math.floor(1000 + Math.random() * 9000).toString()
        });
        const savedOrder = await newOrder.save();

        // Deduct Wallet Balance if applicable
        if (paymentMethod === 'Wallet' && userId) {
            const user = await User.findOne({ id: userId });
            if (user) {
                if (user.wallet < total) {
                    // Start transaction rollback ideally, but simple check here
                    await Order.findByIdAndDelete(savedOrder._id);
                    return res.json({ success: false, message: 'Insufficient Balance' });
                }
                user.wallet -= total;
                user.loyalty.totalSpent += total;
                user.loyalty.points += Math.floor(total / 10);
                await user.save();
            }
        }

        res.json({ success: true, order: savedOrder });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE STATUS
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
