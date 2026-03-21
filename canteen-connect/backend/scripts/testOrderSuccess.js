
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testOrderSuccess() {
    console.log("Testing Successful Order...");

    const itemId = 1; // Veg Burger
    const userId = 'student';

    // 1. Get Initial State
    console.log("1. Fetching initial state...");
    const itemsRes = await fetch(`${BASE_URL}/items`);
    const items = await itemsRes.json();
    const item = items.find(i => i.id === itemId);
    const initialStock = item.stock;

    // We can't easily fetch user wallet via public API without auth, 
    // but the order response might show updated wallet or we trust the order success.

    console.log(`Initial Stock: ${initialStock}`);

    // 2. Place Valid Order
    console.log("2. Placing valid order...");
    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            items: [{ id: itemId, name: item.name, price: item.price, qty: 1 }],
            total: item.price,
            paymentMethod: 'Wallet'
        })
    });
    const data = await res.json();
    console.log("Order Response:", data);

    if (!data.success) {
        console.error("FAILURE: Valid order failed!", data.message);
        return;
    }

    // 3. Check Final State
    console.log("3. Fetching final state...");
    const itemsRes2 = await fetch(`${BASE_URL}/items`);
    const items2 = await itemsRes2.json();
    const item2 = items2.find(i => i.id === itemId);
    const finalStock = item2.stock;
    console.log(`Final Stock: ${finalStock}`);

    if (finalStock === initialStock - 1) {
        console.log("SUCCESS: Stock decreased correctly.");
    } else {
        console.error(`FAILURE: Stock mismatch! Expected ${initialStock - 1}, got ${finalStock}`);
    }
}

testOrderSuccess();
