# Dummy Sign-In Test

Multi-step dummy sign-in with random OTPs (Nodemailer + Gmail SMTP), admin notifications, and admin approval.

## Flow

1. **Email + Password** → admin notified  
2. **Username + Confirm Password** (must match step 1) → **OTP 1** emailed to **user and admin**  
3. User enters **OTP 1** → **OTP 2** emailed to **user and admin**  
4. User enters **OTP 2** → **waiting for admin approval**  
5. Admin clicks **Approve** on `/admin` → user sees:  
   *“Congratulations your account has been verified and restrictions is removed”*

## URLs

| Page | Path |
|------|------|
| User flow | `/` |
| Admin panel (hidden) | `/admin` |

## Local setup

```bash
cp .env.example .env
# Edit .env – add Gmail App Password
npm install
npm start
```

- User: http://localhost:3000/  
- Admin: http://localhost:3000/admin  

### Gmail App Password
1. Google Account → Security → 2-Step Verification → App passwords  
2. Create one for Mail → paste into `GMAIL_APP_PASSWORD`

## Deploy to Vercel

1. Import this GitHub repo on [vercel.com](https://vercel.com)  
2. Set **Environment Variables**:
   - `GMAIL_USER` = `blessedresult6@gmail.com`
   - `GMAIL_APP_PASSWORD` = your 16-char App Password
   - `ADMIN_PASSWORD` = a password you choose (**required on Vercel** for reliable admin login)
3. Deploy  

Then:
- User: `https://your-project.vercel.app/`
- Admin: `https://your-project.vercel.app/admin`

## Admin

- First visit without `ADMIN_PASSWORD` env → “Set Your Admin Password”  
- With `ADMIN_PASSWORD` set → normal login  
- Dashboard lists **pending approvals**; Approve unlocks the user’s congrats screen  

## Important (Vercel)

Sessions are stored **in memory**. On serverless, a cold start can drop an in-progress flow or pending approval. For a dummy test this is usually fine; keep the tab open and approve while the user is still on the waiting page.

Repo: https://github.com/Dennisbed1234/dummy-signin-test
