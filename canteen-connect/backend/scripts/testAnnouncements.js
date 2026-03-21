
import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testAnnouncements() {
    console.log("🚀 Testing Announcements API...");

    // 1. Create Announcement
    console.log("\n1. Creating Announcement...");
    const createRes = await fetch(`${BASE_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Test Announcement", type: "info" })
    });
    const created = await createRes.json();
    console.log("Created:", created);

    if (!created.id) {
        console.error("❌ Failed to create announcement");
        return;
    }

    // 2. Fetch All
    console.log("\n2. Fetching All Announcements...");
    const fetchRes = await fetch(`${BASE_URL}/announcements`);
    const list = await fetchRes.json();
    console.log(`Fetched ${list.length} announcements`);

    const exists = list.find(a => a.id === created.id);
    if (exists) console.log("✅ Created announcement found in list");
    else console.error("❌ Created announcement NOT found in list");

    // 3. Delete
    console.log("\n3. Deleting Announcement...");
    const delRes = await fetch(`${BASE_URL}/announcements/${created.id}`, {
        method: 'DELETE'
    });
    const delData = await delRes.json();
    console.log("Delete Response:", delData);

    // 4. Verify Deletion
    const fetchRes2 = await fetch(`${BASE_URL}/announcements`);
    const list2 = await fetchRes2.json();
    const exists2 = list2.find(a => a.id === created.id);

    if (!exists2) console.log("✅ Announcement successfully deleted");
    else console.error("❌ Announcement still exists after deletion");
}

testAnnouncements();
