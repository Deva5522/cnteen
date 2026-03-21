
import fetch from 'node-fetch';

const checkLogin = async () => {
    console.log("🔍 Checking Login for 'student'...");
    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'student', pass: 'student123' })
        });

        const data = await response.json();

        if (data.success) {
            console.log("✅ Login Successful!");
            console.log("User:", data.user);
        } else {
            console.log("❌ Login Failed:", data.message);
        }
    } catch (error) {
        console.log("❌ Connection Error:", error.message);
        console.log("   (Make sure the backend server is running on port 5000)");
    }
};

checkLogin();
