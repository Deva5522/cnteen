
import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:5000/api/auth';

async function testLogin() {
    console.log("🚀 Testing Login...");

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'student', pass: 'student123' })
        });

        const data = await res.json();
        console.log("Login Response:", data);

        if (data.success) {
            console.log("✅ Login Successful!");
        } else {
            console.error("❌ Login Failed:", data.message);
            process.exit(1);
        }
    } catch (err) {
        console.error("❌ Network Error:", err.message);
        process.exit(1);
    }
}

testLogin();
