#!/usr/bin/env node
const { execSync } = require('child_process');

async function runTests() {
    console.log("🚀 Starting MVP API Tests...\n");

    const BASE_URL = "http://localhost:3000/api";

    console.log("1. Creating test user in Database directly...");
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./prisma/myday.db');

    const testUserId = "test-user-id";
    const testSessionToken = "test-session-uuid-123";

    await new Promise((resolve) => {
        db.serialize(() => {
            db.run(`INSERT OR IGNORE INTO User (id, displayName, sessionToken, createdAt) VALUES ('${testUserId}', 'Test User', '${testSessionToken}', datetime('now'))`, resolve);
        });
    });
    console.log("✅ User created.\n");

    const headers = {
        "X-Session-Token": testSessionToken,
        "Content-Type": "application/json"
    };

    const todayStr = new Date().toISOString().split('T')[0];

    console.log("2. Testing POST /api/items...");
    const createResp = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            title: "Test Task 1",
            type: "TASK",
            priority: "IMPORTANT",
            date: new Date().toISOString()
        })
    });

    if (!createResp.ok) throw new Error(`POST /api/items failed: ${await createResp.text()}`);
    const createdItem = await createResp.json();
    console.log(`✅ Item created successfully. ID: ${createdItem.id}\n`);

    console.log("3. Testing GET /api/items?date=...");
    // Use the exact date of the created item to bypass timezone mismatch in test
    const getResp = await fetch(`${BASE_URL}/items?date=${todayStr}`, { headers });
    if (!getResp.ok) throw new Error(`GET /api/items failed: ${await getResp.text()}`);
    const itemsList = await getResp.json();
    if (!Array.isArray(itemsList) || !itemsList.find(i => i.id === createdItem.id)) {
        throw new Error("Item not found in GET response");
    }
    console.log(`✅ Item retrieved successfully.\n`);

    console.log("4. Testing PATCH /api/items/:id...");
    const patchResp = await fetch(`${BASE_URL}/items/${createdItem.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ completedAt: new Date().toISOString() })
    });
    if (!patchResp.ok) throw new Error(`PATCH /api/items failed: ${await patchResp.text()}`);
    const updatedItem = await patchResp.json();
    if (!updatedItem.completedAt) throw new Error("Item was not marked completed");
    console.log(`✅ Item marked completed successfully.\n`);

    console.log("5. Testing DELETE /api/items/:id...");
    const delResp = await fetch(`${BASE_URL}/items/${createdItem.id}`, { method: 'DELETE', headers });
    if (!delResp.ok) throw new Error(`DELETE /api/items failed: ${await delResp.text()}`);
    console.log(`✅ Item deleted successfully.\n`);

    console.log("6. Testing Unauthorized Access...");
    const unauthResp = await fetch(`${BASE_URL}/items?date=${todayStr}`, { headers: { "X-Session-Token": "bad-token" } });
    if (unauthResp.status !== 401) throw new Error(`Expected 401, got ${unauthResp.status}`);
    console.log("✅ Unauthorized access blocked.\n");

    console.log("🎉 All tests passed successfully!");
    process.exit(0);
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
