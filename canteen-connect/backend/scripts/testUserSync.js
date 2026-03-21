
import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:5000/api/auth';

async function testUserSync() {
    console.log("Testing User Sync Endpoint...");

    // We assume 'student' exists from seed or previous tests
    const userId = 'student';

    try {
        const res = await fetch(`${BASE_URL}/${userId}`);
        const data = await res.json();

        if (data.success && data.user && data.user.id === userId) {
            console.log("SUCCESS: User details fetched successfully.");
            console.log("User Wallet:", data.user.wallet);
        } else {
            console.error("FAILURE: Could not fetch user details.", data);
        }

    } catch (err) {
        console.error("FAILURE: Network Error", err);
    }
}

testUserSync();
