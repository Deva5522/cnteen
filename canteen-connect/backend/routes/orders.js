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

        // 1. Validate Items & Stock
        const importItem = (await import('../models/Item.js')).default;

        for (const orderItem of items) {
            const dbItem = await importItem.findOne({ id: orderItem.id });
            if (!dbItem) {
                return res.status(400).json({ success: false, message: `Item not found: ${orderItem.name}` });
            }
            if (dbItem.stock < orderItem.qty) {
                return res.json({ success: false, message: `Out of Stock: ${dbItem.name} (Only ${dbItem.stock} left)` });
            }
        }

        // 2. Validate Wallet Balance (Before Deducting Stock)
        let user;
        if (paymentMethod === 'Wallet' && userId) {
            user = await User.findOne({ id: userId });
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            if (user.wallet < total) {
                return res.json({ success: false, message: 'Insufficient Balance' });
            }
        }

        // 3. Deduct Stock
        for (const orderItem of items) {
            await importItem.findOneAndUpdate(
                { id: orderItem.id },
                { $inc: { stock: -orderItem.qty } }
            );
        }

        // 4. Create Order
        let orderId;
        let isUnique = false;
        while (!isUnique) {
            orderId = Math.floor(1000 + Math.random() * 99000).toString(); // 4-5 digits
            const existing = await Order.findById(orderId);
            if (!existing) isUnique = true;
        }

        const newOrder = new Order({
            _id: orderId,
            userId,
            items,
            total,
            paymentMethod,
            otp: Math.floor(1000 + Math.random() * 9000).toString()
        });
        const savedOrder = await newOrder.save();

        // 5. Deduct Wallet Balance
        if (user) {
            user.wallet -= total;
            user.loyalty.totalSpent += total;
            user.loyalty.points += Math.floor(total / 10);
            await user.save();
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
