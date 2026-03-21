
import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:5000/api/auth';

async function testWhitespaceLogin() {
    console.log("🚀 Testing Whitespace Login...");

    // Test 1: ID with trailing space
    console.log("\n1. Testing 'student ' (with space)...");
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'student ', pass: 'student123' })
        });
        const data = await res.json();
        if (data.success) console.log("✅ Login Successful with trailing space in ID");
        else console.error("❌ Failed:", data.message);
    } catch (err) { console.error("Error:", err.message); }

    // Test 2: Admin with space
    console.log("\n2. Testing 'admin ' (with space)...");
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'admin ', pass: 'admin123' })
        });
        const data = await res.json();
        if (data.success) console.log("✅ Admin Login Successful with trailing space");
        else console.error("❌ Failed:", data.message);
    } catch (err) { console.error("Error:", err.message); }
}

testWhitespaceLogin();
