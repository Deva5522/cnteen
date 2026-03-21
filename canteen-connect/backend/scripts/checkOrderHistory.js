
const fetchOrderHistory = async () => {
    try {
        const userId = 'student';
        console.log(`🔍 Fetching orders for userId: ${userId}...`);

        const response = await fetch(`http://localhost:5000/api/orders?userId=${userId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();

        if (Array.isArray(orders)) {
            console.log(`✅ Successfully fetched ${orders.length} orders.`);
            if (orders.length > 0) {
                console.log("Sample Order:", JSON.stringify(orders[0], null, 2));
            } else {
                console.log("No orders found for this user.");
            }
        } else {
            console.log("❌ Response is not an array:", orders);
        }

    } catch (err) {
        console.error("❌ Error fetching orders:", err.message);
    }
};

fetchOrderHistory();
