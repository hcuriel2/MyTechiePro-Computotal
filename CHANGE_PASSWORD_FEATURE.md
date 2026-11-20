# Change Password feature — MyTechiePro/Computotal

## What changed

- **Client / Professional:** Log in and visit **Settings → Change Password**.
- **Admin:** Log in to the admin panel, click the **gear icon → Account Security → Change password**.
- All account types use **POST `/api/auth/change-password`**; it is protected by the existing authentication middleware and never accepts an account ID from the browser.
- The server verifies the current password and, if MFA is enabled, requires a **fresh, unused six-digit authenticator code**. The MFA verification service provides rate limiting and replay protection.
- The new password must contain 8–16 characters, including uppercase, lowercase, a digit, and one of `!@#$%^&*`. This matches the project's existing signup/reset rules.
- The backend uses bcrypt to hash the new password and updates MongoDB atomically. Password reset credentials and pending MFA setup are invalidated.
- Other sign-in sessions are invalidated using `sessionVersion`; this browser receives a refreshed secure, HttpOnly cookie and remains signed in.
- Neither the password nor the hash is returned in the API response.

## Apply the patch ZIP

1. Copy your project before replacing files if you want to keep a rollback point.
2. Extract the contents of `Computotal-Change-Password-Patch.zip` **into your existing `MyTechiePro-Computotal` project root**, allowing the listed source files to overwrite files of the same names.
3. Install dependencies normally if your local working tree does not already have them, then compile and restart your Backend and rebuild your ClientFront / AdminFront.
4. Log in to each applicable frontend and use the paths described above.

The patch ZIP contains only relevant source changes and an isolated test; it does **not** include `node_modules`, your `.env`, MongoDB content, Git history, or deployment credentials.

## API example

`POST /api/auth/change-password` (requires an authenticated session cookie)

```json
{
  "currentPassword": "(your old password)",
  "newPassword": "(your chosen new password)",
  "confirmNewPassword": "(repeat your new password)",
  "currentToken": "(six digits, only if MFA enabled)"
}
```

Response: HTTP 200 with `{ "message": "Password changed successfully." }`; the refreshed cookie is set in `Set-Cookie`. HTTP 400 indicates invalid input, HTTP 401 indicates missing/invalid credentials or MFA, and HTTP 429 indicates verification throttling.

## Verification performed

- Backend: `node node_modules/typescript/bin/tsc` — passed.
- Frontend TypeScript: `tsc --noEmit --project tsconfig.app.json` in each frontend — passed.
- Both Angular AOT builds (Chrome-only target used temporarily to skip legacy ES5 bundle generation) — passed.
- `node scripts/test-password-reset.cjs` — 13 groups passed.
- `node scripts/test-mfa-totp.cjs` — passed.
- `node scripts/test-admin-levels.cjs` — 78 checks passed.
- `node scripts/test-change-password.cjs` — 6 groups passed.

These tests use in-memory mocks for persistence and do not verify actual production database, browsers, email delivery, or server deployment. **Deploy to staging and test with a disposable test account before using this in production.**
