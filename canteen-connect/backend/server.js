import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import orderRoutes from './routes/orders.js';

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/canteen-connect');
        console.log('✅ MongoDB Connected (Local)');
    } catch (err) {
        console.log('⚠️ Local MongoDB not found, starting in-memory database...');
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('✅ MongoDB Connected (In-Memory Fallback)');

            // Seed Default User for Testing
            try {
                const User = (await import('./models/User.js')).default;
                const existing = await User.findOne({ id: 'student' });
                if (!existing) {
                    await User.create({
                        id: 'student',
                        name: 'Student User',
                        password: '123', // Clean password for demo
                        role: 'user',
                        wallet: 500,
                        loyalty: { points: 100, totalSpent: 0, badge: 'Bronze', birthday: '' },
                        preferences: { diet: 'None', allergies: [] }
                    });
                    console.log('✨ Seeded User: student / 123');
                }
            } catch (seedErr) {
                console.error("Seed Error:", seedErr);
            }
        } catch (memErr) {
            console.error('❌ MongoDB Connection Error (Both Local & In-Memory):', memErr);
        }
    }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('API is Running...');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
