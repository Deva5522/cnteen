const test = async () => {
    try {
        console.log("Testing Wallet Update...");
        const res = await fetch('http://localhost:5000/api/auth/student/wallet', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 100 })
        });
        const data = await res.json();
        console.log("Response:", data);
        if (data.success) {
            console.log("✅ Wallet Updated Successfully!");
        } else {
            console.error("❌ Update Failed:", data.message);
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
    }
};

test();
