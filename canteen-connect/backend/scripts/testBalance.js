
import fetch from 'node-fetch';
import mongoose from 'mongoose';

// Ensure we can connect to DB to check user state directly if needed, 
// or just use API. API is better for black-box testing.

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testBalance() {
    // 1. Reset User Wallet to known amount
    // We can't easily reset via API without separate admin endpoint or restarting server with seed.
    // Let's assume the 'student' user exists from seed.
    // We'll check their balance first if possible? API doesn't have "get user details" easily accessible without auth?
    // Actually detailed in routes/auth.js probably? Or we can just try to place an order that SHOULD pass.

    console.log("1. Attempting to place order within balance...");

    // We need a user ID. 'student' is the seeded user id.
    const userId = 'student';
    // Seeded wallet is 500.

    const items = [
        { id: 1, name: 'Veg Burger', price: 50, qty: 1 }
    ];
    const total = 50;

    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            items,
            total,
            paymentMethod: 'Wallet'
        })
    });

    const data = await res.json();
    console.log("Order Response:", data);

    if (data.success) {
        console.log("SUCCESS: Order placed. Balance should be deducted.");
    } else {
        console.error("FAILURE: Order failed.", data.message);
    }

    // 2. Try to place order EXCEEDING balance
    console.log("2. Attempting to place order exceeding balance...");
    const expensiveTotal = 10000;
    const res2 = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            items,
            total: expensiveTotal,
            paymentMethod: 'Wallet'
        })
    });
    const data2 = await res2.json();
    console.log("Order Response (Expensive):", data2);

    if (!data2.success && data2.message.includes('Insufficient')) {
        console.log("SUCCESS: Order correctly rejected for insufficient balance.");
    } else {
        console.error("FAILURE: Order should have been rejected.", data2);
    }
}

testBalance();
