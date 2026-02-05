import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping numeric ID to match frontend data
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    dietary: { type: String, required: true }, // Veg, Non-Veg
    image: { type: String, required: true },
    description: { type: String },
    calories: { type: Number },
    protein: { type: String },
    allergens: [{ type: String }],
    tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
