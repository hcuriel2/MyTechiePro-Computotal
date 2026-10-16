# MyTechiePro — Computotal

## Local Development Setup

This guide explains how to run the Computotal `dev` branch locally on Windows.

The application consists of three components:

| Component | Description | Local URL |
|---|---|---|
| Backend | Node.js/Express API with MongoDB | http://localhost:2424 |
| ClientFront | Angular client website | http://localhost:8080 |
| AdminFront | Angular admin dashboard | http://localhost:4200 |

## 1. Requirements

Install the following tools:

- Node.js **14.16.1**
- npm **6.14.12**
- NVM for Windows
- Visual Studio Code
- Git

The project uses Angular 11.

Open PowerShell and select the required Node.js version:

```powershell
nvm use 14.16.1
node -v
npm -v
```

Expected versions:

```text
v14.16.1
6.14.12
```

## 2. Project Setup

After cloning the repository, ensure you're on the `dev` branch:

```powershell
git switch dev
```

The project structure should contain:

```text
MyTechiePro-Computotal/
├── AdminFront/
├── ClientFront/
├── Backend/
└── README.md
```

## 3. Backend Configuration

Obtain the shared development `.env` file from the project maintainer through the team's approved secure channel.

Place it in:

```text
Backend/.env
```

Do not rename the file, commit it to GitHub, or publish its credentials.

The development configuration uses port `2424` and contains the required MongoDB, JWT, Stripe, and other service settings.

## 4. Install Dependencies

From the project root, run:

```powershell
cd Backend
npm install

cd ../ClientFront
npm install

cd ../AdminFront
npm install
```

Some dependency warnings are expected because the project uses an older Angular and Node.js toolchain.

Do not run `npm audit fix --force` without coordinating dependency upgrades with the team.

## 5. Run the Application

Open **three separate PowerShell terminals** in VS Code.

### Terminal 1 — Backend

```powershell
cd Backend
npm start
```

Expected output:

```text
App listening on the port 2424
```

Keep this terminal running.

### Terminal 2 — ClientFront

```powershell
cd ClientFront
npx ng serve --port 8080
```

Wait for `Compiled successfully`.

Open: http://localhost:8080

### Terminal 3 — AdminFront

```powershell
cd AdminFront
npx ng serve --port 4200
```

Wait for `Compiled successfully`.

Open: http://localhost:4200

Keep all three terminals running simultaneously.

## 6. Environment Configuration

For local development, both frontend `src/environments/environment.ts` files should contain these URLs:

```typescript
apiEndpoint: 'http://localhost:2424/api',
clientUrl: 'http://localhost:8080',
adminUrl: 'http://localhost:4200'
```

The production environment files (`environment.prod.ts`) must retain the production URLs.

## 7. Admin Dashboard Access

AdminFront requires an authenticated user with the `Admin` role.

If the user is not authenticated as an administrator, the application redirects to ClientFront on port `8080`.

Obtain an authorized development Admin account from the project sponsor or maintainer.

Normal Client and Professional accounts cannot access the Admin dashboard.

## 8. Troubleshooting

**Wrong Node.js version**

Run `nvm use 14.16.1` and verify using `node -v`.

**Backend fails because environment variables are missing**

Confirm the shared `.env` file is inside `Backend/`, not the repository root.

**Stripe initialization error**

Confirm that `STRIPE_SECRET_KEY` is configured with an authorized Stripe test key.

**SendGrid API key warning**

Check whether the shared development configuration contains a valid SendGrid key. Email features may not work until this is corrected.

**Frontend opens but API requests fail**

Ensure the backend is running on port `2424`, both frontend API endpoints use that port, and the backend permits CORS requests from the local frontend origins.

**AdminFront redirects to ClientFront**

This is expected when the Admin session check fails or the logged-in user does not have the `Admin` role.

**Website cannot be reached**

Check that the appropriate Angular terminal remains running.

To test a port, use:

```powershell
Test-NetConnection 127.0.0.1 -Port 4200
```

Replace `4200` with `8080` or `2424` as needed.

**npm reports dependency vulnerabilities**

The legacy dependencies have reported security issues. Avoid automatically applying breaking upgrades. Coordinate remediation with the team before production deployment.

## 9. Notes for Developers

- Work from the team's designated development branch.
- Do not commit `.env` files or API secrets.
- Use Stripe test mode when developing payment features.
- Avoid deleting or modifying shared MongoDB records without authorization.
- Report any new setup requirements so this README remains accurate.
