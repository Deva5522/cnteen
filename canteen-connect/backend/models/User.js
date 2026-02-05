import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Using simpler ID (like 'user123') for compatibility with existing frontend
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    wallet: { type: Number, default: 0 },
    preferences: {
        diet: { type: String, default: 'None' },
        allergies: [{ type: String }]
    },
    loyalty: {
        points: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        badge: { type: String, default: 'Bronze' },
        birthday: { type: String, default: '' }
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
