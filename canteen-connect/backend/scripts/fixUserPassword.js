
import mongoose from 'mongoose';
import User from '../models/User.js'; // Adjust path if needed
import dotenv from 'dotenv';

dotenv.config();

const fixPassword = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/canteen-connect');
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ id: 'student' });
        if (user) {
            user.password = 'student123';
            await user.save();
            console.log('✅ Updated password for user: student');
        } else {
            console.log('⚠️ User student not found');
            // Optional: Create if missing
            await User.create({
                id: 'student',
                name: 'Student User',
                password: 'student123',
                role: 'user',
                wallet: 500,
                loyalty: { points: 100, totalSpent: 0, badge: 'Bronze', birthday: '' },
                preferences: { diet: 'None', allergies: [] }
            });
            console.log('✨ Created User: student / student123');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

fixPassword();
