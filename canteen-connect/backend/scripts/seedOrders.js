
// Use fetch to seed via API since In-Memory DB is isolated
const seedViaApi = async () => {
    const orders = [
        {
            userId: 'student',
            items: [
                { id: 1, name: 'Samosa', price: 15, qty: 2 },
                { id: 6, name: 'Chai', price: 10, qty: 1 }
            ],
            total: 40,
            paymentMethod: 'Wallet'
        },
        {
            userId: 'student',
            items: [
                { id: 3, name: 'Masala Dosa', price: 50, qty: 1 }
            ],
            total: 50,
            paymentMethod: 'Wallet'
        }
    ];

    console.log("🌱 Seeding Orders via API...");

    for (const order of orders) {
        try {
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            const data = await res.json();
            if (data.success) {
                console.log(`✅ Created Order #${data.order._id}`);

                // Hack: Manually update status and date to look "past"
                // This requires an endpoint or we just accept they look "new"
                // For now, let's just create them. If we really need them to be "past", 
                // we'd need a debug endpoint to force-set date/status.

                // Let's try to update status to Completed at least
                await fetch(`http://localhost:5000/api/orders/${data.order._id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Completed' })
                });
                console.log(`   Updated status to Completed`);

            } else {
                console.log(`❌ Failed: ${data.message}`);
            }
        } catch (e) {
            console.error("Error:", e.message);
        }
    }
};

seedViaApi();
