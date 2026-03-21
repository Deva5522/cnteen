
import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'offer'], default: 'info' },
    date: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
