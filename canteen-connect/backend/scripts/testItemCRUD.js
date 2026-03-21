
import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:5000/api/items';

async function testItemCRUD() {
    console.log("1. Creating New Item...");
    const newItem = {
        id: Date.now(),
        name: "Test Item " + Date.now(),
        price: 99,
        category: "Test",
        stock: 100,
        available: true,
        dietary: "Veg",
        image: "https://example.com/image.jpg"
    };

    // CREATE
    const createRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
    });
    const createdItem = await createRes.json();

    if (createdItem.id === newItem.id) {
        console.log("SUCCESS: Item Created!", createdItem.name);
    } else {
        console.error("FAILURE: Create Failed", createdItem);
        return;
    }

    // UPDATE
    console.log("2. Updating Item Stock...");
    const updateRes = await fetch(`${BASE_URL}/${newItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: 50 })
    });
    const updatedItem = await updateRes.json();

    if (updatedItem.stock === 50) {
        console.log("SUCCESS: Item Updated!", updatedItem.stock);
    } else {
        console.error("FAILURE: Update Failed", updatedItem);
    }

    // DELETE
    console.log("3. Deleting Item...");
    const deleteRes = await fetch(`${BASE_URL}/${newItem.id}`, {
        method: 'DELETE'
    });
    const deleteData = await deleteRes.json();

    if (deleteData.message === 'Item deleted') {
        console.log("SUCCESS: Item Deleted!");
    } else {
        console.error("FAILURE: Delete Failed", deleteData);
    }
}

testItemCRUD();
