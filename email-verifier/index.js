import 'dotenv/config';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate a 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save code to db.json
function saveCode(email, code) {
  const db = JSON.parse(fs.readFileSync(dbPath));
  db[email] = { code, verified: false, timestamp: Date.now() };
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Send verification email
async function sendVerification(email) {
  const code = generateCode();
  saveCode(email, code);

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'SkyServers / Sky0Cloud Email Verification',
    text: `Hello!\n\nYour verification code is: ${code}\n\nIf you didn't request this, ignore this email.`
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
}

// Top-level usage check
if (process.argv.length < 3) {
  console.log('Usage: node index.js user@example.com');
  process.exit(1);
}

const email = process.argv[2];
sendVerification(email);
