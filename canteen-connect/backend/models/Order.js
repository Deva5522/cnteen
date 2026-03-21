import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    _id: { type: String },
    userId: { type: String, required: true },
    items: [
        {
            id: Number,
            name: String,
            price: Number,
            qty: Number
        }
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Cooking', 'Ready', 'Completed', 'Cancelled'], default: 'Pending' },
    otp: { type: String }, // For verification
    paymentMethod: { type: String, default: 'Wallet' },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Order', orderSchema);
