
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const USER_ID = 'student';

const updateProfile = async () => {
    try {
        console.log("Testing Profile Update...");
        const res = await fetch(`${BASE_URL}/api/auth/${USER_ID}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Updated Name",
                email: "test@example.com"
            })
        });

        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Raw Response: '${text}'`);

        if (text) {
            const data = JSON.parse(text);
            console.log("JSON Parsed:", data);
        } else {
            console.error("❌ Empty Response Body!");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    }
};

const updateBirthday = async () => {
    try {
        console.log("\nTesting Birthday Update...");
        const res = await fetch(`${BASE_URL}/api/auth/${USER_ID}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                birthday: "2000-01-01"
            })
        });

        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Raw Response: '${text}'`);

        if (text) {
            const data = JSON.parse(text);
            console.log("JSON Parsed:", data);
        } else {
            console.error("❌ Empty Response Body!");
        }
    } catch (err) {
        console.error("❌ Error:", err);
    }
};

const run = async () => {
    await updateProfile();
    await updateBirthday();
};

run();
