// Native fetch in Node 18+

async function checkOrders() {
    try {
        const res = await fetch('http://localhost:5000/api/orders');
        const orders = await res.json();
        console.log(`Total Orders in DB: ${orders.length}`);
        if (orders.length > 0) {
            console.log('Sample Order:', JSON.stringify(orders[0], null, 2));
        } else {
            console.log('No orders found.');
        }
    } catch (err) {
        console.error('Error fetching orders:', err.message);
    }
}

checkOrders();
