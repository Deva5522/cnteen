
import http from 'http';

function testOrderPlacement() {
    console.log("🚀 Starting Order Placement Test...");

    const payload = JSON.stringify({
        userId: "student",
        items: [
            { id: 1, name: "Burger", price: 50, qty: 2 }
        ],
        total: 100,
        paymentMethod: "Wallet"
    });

    const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log("Response Status:", res.statusCode);
            try {
                const json = JSON.parse(data);
                console.log("Response Data:", JSON.stringify(json, null, 2));

                if (json.success) {
                    console.log("✅ Order Test PASSED");
                } else {
                    console.log("❌ Order Test FAILED: " + json.message);
                }
            } catch (e) {
                console.log("Response (Raw):", data);
            }
        });
    });

    req.on('error', (error) => {
        console.error("❌ Network or Server Error:", error);
    });

    req.write(payload);
    req.end();
}

testOrderPlacement();
