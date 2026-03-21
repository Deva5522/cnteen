
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testStockDeduction() {
    console.log("Testing Stock Deduction on Failed Order...");

    const itemId = 1; // Veg Burger
    const userId = 'student';

    // 1. Get Initial Stock
    // We don't have a public GET /items/:id, but we can GET /items and find it.
    console.log("1. Fetching current stock...");
    const itemsRes = await fetch(`${BASE_URL}/items`);
    const items = await itemsRes.json();
    const item = items.find(i => i.id === itemId);

    if (!item) {
        console.error("Item not found!");
        return;
    }

    const initialStock = item.stock;
    console.log(`Initial Stock: ${initialStock}`);

    // 2. Place Order that FAILS due to Balance
    // Student has 500 wallet (or less if previous tests ran). 
    // We send total = 10000 to force failure.
    console.log("2. Placing expensive order to force balance failure...");

    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            items: [{ id: itemId, name: item.name, price: item.price, qty: 1 }],
            total: 100000,
            paymentMethod: 'Wallet'
        })
    });
    const data = await res.json();
    console.log("Order Response:", data);

    if (data.success) {
        console.error("CRITICAL: Order succeeded but should have failed!");
        return;
    }

    // 3. Check Stock Again
    console.log("3. Fetching stock after failed order...");
    const itemsRes2 = await fetch(`${BASE_URL}/items`);
    const items2 = await itemsRes2.json();
    const item2 = items2.find(i => i.id === itemId);
    const finalStock = item2.stock;
    console.log(`Final Stock: ${finalStock}`);

    if (finalStock < initialStock) {
        console.error("FAILURE: Stock was deducted even though order failed!");
    } else {
        console.log("SUCCESS: Stock remained unchanged.");
    }
}

testStockDeduction();
