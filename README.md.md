# Computer Guy / MyTechiePro Computotal

## Team Setup Guide

This branch is set up so teammates can clone the project and run the two Angular frontends with as little setup as possible.

The project contains:

- `AdminFront` - Angular 11 admin UI
- `ClientFront` - Angular 11 customer UI
- `Backend` - Node/Express/TypeScript API with MongoDB

For normal frontend work, you **do not need to run the Backend**. Both frontends currently use the deployed API:

```text
https://mytechie.pro/api
```

---

# Step 1 - Use the Correct Node.js Version

This project was verified with:

```text
Node.js 14.16.1
npm 6.14.12
```

If you use NVM for Windows:

```powershell
nvm install 14.16.1
nvm use 14.16.1
```

Then verify:

```powershell
node --version
npm --version
```

### Expected result

```text
v14.16.1
6.14.12
```

### Troubleshooting

If `nvm` says Node 14 is active but `node --version` shows another version:

```powershell
where.exe node
where.exe npm
nvm list
```

Fix the NVM/PATH problem before continuing.

Do not use a newer Node/npm version for this project.

Docker is not required.

---

# Step 2 - Install the Project Dependencies

Make sure you are in the repository root:

```powershell
pwd
```

Then run:

```powershell
npm run install:all
```

This installs dependencies for:

- `AdminFront`
- `ClientFront`
- `Backend`

### Expected result

The command should finish without a fatal npm error and return you to the PowerShell prompt.

Warnings from old Angular packages may appear. That is normal for this legacy project.

### Troubleshooting

If you see `EBADENGINE`, check:

```powershell
node --version
npm --version
```

They must be:

```text
v14.16.1
6.14.12
```

Do **not** run:

```powershell
npm audit fix --force
```

because it may upgrade old dependencies and break the project.

---

# Step 3 - Run AdminFront

From the repository root:

```powershell
npm run dev:admin
```

### Expected result

Angular should compile successfully and show that the development server is running.

Open:

```text
http://localhost:4200/
```

You should see the AdminFront application.

### Troubleshooting

If the page is blank, check:

```text
AdminFront/src/index.html
```

It should contain:

```html
<base href="/">
```

If port `4200` is already in use, close the other process using that port and run the command again.

---

# Step 4 - Run ClientFront

Open a **second PowerShell window** in the same repository.

Run:

```powershell
npm run dev:client
```

### Expected result

Angular should compile successfully and show that the development server is running.

Open:

```text
http://localhost:4201/
```

You should see the ClientFront application.

### Troubleshooting

If the application opens but data is missing, check:

```text
ClientFront/src/environments/environment.ts
```

It should use:

```text
https://mytechie.pro/api
```

AdminFront should also use the same API in:

```text
AdminFront/src/environments/environment.ts
```

---

# Step 5 - Normal Frontend Development

At this point, frontend developers only need these two terminals running:

### Terminal 1

```powershell
npm run dev:admin
```

### Terminal 2

```powershell
npm run dev:client
```

URLs:

```text
AdminFront  http://localhost:4200/
ClientFront http://localhost:4201/
```

Because both frontends use the deployed API, MongoDB credentials and a local Backend are not required for normal frontend work.

---

# Optional - Run the Backend Locally

Only do this if you are working on backend/API functionality.

## 1. Create the environment file

From the repository root:

```powershell
Copy-Item .\Backend\.env.example .\Backend\.env
```

Then open:

```text
Backend/.env
```

and fill in the real MongoDB and JWT values.

Do not commit `Backend/.env`.

## 2. Start the Backend

Run:

```powershell
npm run dev:backend
```

### Expected result

You should see:

```text
App listening on the port 2424
```

The local backend is:

```text
http://localhost:2424/
```

### Troubleshooting

If the app says it is listening on port `2424` and then shows a MongoDB connection error, the code compiled correctly but the database connection failed.

Check the values in:

```text
Backend/.env
```

MongoDB credentials are database-user credentials and may be different from your MongoDB Atlas website login.

---

# Optional - Make the Frontends Use the Local Backend

Only do this when testing backend changes locally.

Change the development `apiEndpoint` in:

```text
AdminFront/src/environments/environment.ts
ClientFront/src/environments/environment.ts
```

to:

```text
http://localhost:2424/api
```

Then make sure the Backend is running.

The Backend already allows local frontend requests from:

```text
http://localhost:4200
http://localhost:4201
```

When you are finished testing the local API, change the development endpoint back to:

```text
https://mytechie.pro/api
```

---

# Build the Project

To build all three applications:

```powershell
npm run build:all
```

For production Angular builds:

```powershell
npm --prefix AdminFront run build:prod
npm --prefix ClientFront run build:prod
```

For the Backend TypeScript build:

```powershell
npm --prefix Backend run build
```

---

# Quick Troubleshooting

## Wrong Node/npm version

```powershell
nvm use 14.16.1
node --version
npm --version
```

Expected:

```text
v14.16.1
6.14.12
```

## TypeScript / Angular NGCC error

Check the local TypeScript version:

```powershell
cd ClientFront
npx tsc --version
```

Expected:

```text
Version 4.1.5
```

The AdminFront and ClientFront projects both pin TypeScript to `4.1.5`.

## AdminFront blank page

Verify:

```html
<base href="/">
```

in:

```text
AdminFront/src/index.html
```

## Frontend opens but no data appears

Verify both development environment files use:

```text
https://mytechie.pro/api
```

## Backend MongoDB error

Check:

```text
Backend/.env
```

The Backend can successfully compile and start listening on port `2424` even if the MongoDB connection then fails.
