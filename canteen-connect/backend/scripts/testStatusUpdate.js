
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/orders';

async function testStatusUpdate() {
    console.log("1. Creating Dummy Order...");
    const orderRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: 'test_user',
            items: [{ id: 1, name: 'Burger', price: 50, qty: 1 }],
            total: 50,
            paymentMethod: 'Cash'
        })
    });
    const orderData = await orderRes.json();

    if (!orderData.success) {
        console.error("Failed to create order:", orderData.message);
        return;
    }

    const orderId = orderData.order.id; // OR _id depending on backend
    const realId = orderData.order._id || orderData.order.id;
    console.log(`Order Created: ${realId} (Status: ${orderData.order.status})`);

    console.log("2. Updating Status to 'Cooking'...");
    const updateRes = await fetch(`${BASE_URL}/${realId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cooking' })
    });
    const updateData = await updateRes.json();
    console.log(`Update Response:`, updateData);

    if (updateData.success && updateData.order.status === 'Cooking') {
        console.log("SUCCESS: Order status updated to Cooking!");
    } else {
        console.error("FAILURE: Order status did not update.");
    }

    console.log("3. Updating Status to 'Ready'...");
    const updateRes2 = await fetch(`${BASE_URL}/${realId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Ready' })
    });
    const updateData2 = await updateRes2.json();
    if (updateData2.success && updateData2.order.status === 'Ready') {
        console.log("SUCCESS: Order status updated to Ready!");
    } else {
        console.error("FAILURE: Order status did not update.");
    }
}

testStatusUpdate();
