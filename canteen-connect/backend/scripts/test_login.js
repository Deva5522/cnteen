
import fetch from 'node-fetch';

async function testLogin() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'student', pass: 'student123' })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);

        if (response.ok && data.success) {
            console.log("✅ Login Successful");
        } else {
            console.log("❌ Login Failed");
        }
    } catch (error) {
        console.error("❌ Connection Error:", error);
    }
}

testLogin();
