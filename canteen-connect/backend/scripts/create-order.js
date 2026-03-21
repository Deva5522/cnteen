// Native fetch in Node 18+

async function createOrder() {
    try {
        const orderData = {
            userId: "student",
            items: [
                { id: 1, name: "Veg Burger", price: 50, qty: 1 }
            ],
            total: 50,
            paymentMethod: "Cash"
        };

        console.log("Creating order...");
        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();
        if (data.success) {
            console.log('Order Created:', data.order.id);
        } else {
            console.log('Failed to create order:', data.message);
        }
    } catch (err) {
        console.error('Error creating order:', err.message);
    }
}

createOrder();
