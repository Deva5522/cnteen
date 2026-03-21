
import mongoose from 'mongoose';
import User from '../models/User.js';

const listUsers = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/canteen-connect');
        console.log('✅ Connected to MongoDB');

        const users = await User.find({});
        console.log("\n--- USER LIST ---");
        if (users.length === 0) {
            console.log("No users found in database.");
        } else {
            users.forEach(u => {
                console.log(`ID: [${u.id}] | Name: ${u.name} | Role: ${u.role} | Password: ${u.password}`);
            });
        }
        console.log("-----------------\n");

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

listUsers();
