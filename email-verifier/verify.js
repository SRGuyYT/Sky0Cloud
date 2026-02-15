import fs from "fs";
import path from "path";

const email = process.argv[2];
const code = process.argv[3];

if (!email || !code) {
    console.log("Usage: node verify.js user@example.com 123456");
    process.exit(1);
}

// Path to database file
const dbPath = path.join(new URL('.', import.meta.url).pathname, 'db.json');

// Load existing database
let db = {};
if (fs.existsSync(dbPath)) {
    const raw = fs.readFileSync(dbPath, "utf8");
    db = JSON.parse(raw);
}

// Check if email exists and code matches
if (!db[email]) {
    console.log(`No verification request found for ${email}`);
    process.exit(1);
}

if (db[email].code !== code) {
    console.log("Verification code is incorrect!");
    process.exit(1);
}

// Mark as verified
db[email].verified = true;

// Save back to file
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`${email} is now verified! ✅`);
