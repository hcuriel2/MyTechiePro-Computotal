# MyTechiePro / Computotal - Team Local Development

This repository contains three applications:

- `AdminFront` - Angular 11 admin UI
- `ClientFront` - Angular 11 customer UI
- `Backend` - Node/Express/TypeScript API with MongoDB

## Standard Toolchain

Everyone should use:

- Node.js `14.16.1`
- npm `6.14.12`

The repository includes `.nvmrc` with:

```text
14.16.1
```

Using NVM for Windows:

```powershell
nvm install 14.16.1
nvm use 14.16.1
node --version
npm --version
```

Expected:

```text
v14.16.1
6.14.12
```

Docker is not required.

Do not use a newer global Angular CLI for this project. The Angular applications use their local CLI versions.

## Clone and Switch to the Team Branch

```powershell
git clone https://github.com/hcuriel2/MyTechiePro-Computotal.git
cd MyTechiePro-Computotal
git checkout devLink-ready
```

## First-Time Install

From the repository root:

```powershell
npm run install:all
```

This runs `npm ci` in:

- `AdminFront`
- `ClientFront`
- `Backend`

The project uses npm 6 compatible lockfiles so teammates install the same resolved package versions.

Do not run:

```powershell
npm audit fix --force
```

on this legacy Angular project unless the team has specifically agreed to upgrade dependencies.

## Frontend Development

The development environment files currently point to:

```text
https://mytechie.pro/api
```

This means frontend developers do not need MongoDB credentials or a running local backend for the normal AdminFront and ClientFront workflow.

### AdminFront

From the repository root:

```powershell
npm run dev:admin
```

Open:

```text
http://localhost:4200/
```

### ClientFront

In another terminal:

```powershell
npm run dev:client
```

Open:

```text
http://localhost:4201/
```

## Backend Development

The backend is only required if you are modifying or testing backend/API functionality locally.

Copy:

```text
Backend/.env.example
```

to:

```text
Backend/.env
```

Example PowerShell command:

```powershell
Copy-Item .\Backend\.env.example .\Backend\.env
```

Fill in the real values.

MongoDB credentials are database-user credentials and may be different from the credentials used to sign in to the MongoDB Atlas website.

`Backend/.env` is ignored by Git and must not be committed.

Start the backend:

```powershell
npm run dev:backend
```

The backend listens on:

```text
http://localhost:2424
```

If the backend compiles and says that it is listening on port 2424 but then shows a MongoDB connection error, check the values in `Backend/.env`.

## Using the Local Backend with the Frontends

The current frontend environment files use:

```text
https://mytechie.pro/api
```

If backend developers need the frontends to call the local API instead, change the development `apiEndpoint` to:

```text
http://localhost:2424/api
```

in:

```text
AdminFront/src/environments/environment.ts
ClientFront/src/environments/environment.ts
```

Do not change the production environment files unless the deployment configuration is intentionally being changed.

The backend CORS configuration allows:

```text
http://localhost:4200
http://localhost:4201
```

for local frontend testing.

## AdminFront Base Path

For local development:

```html
<base href="/">
```

is used in:

```text
AdminFront/src/index.html
```

The AdminFront production configuration uses:

```text
/admin/
```

through `angular.json`.

This prevents the local AdminFront application from loading as a blank page while preserving the production deployment path.

## Build Commands

Build all projects using their normal build scripts:

```powershell
npm run build:all
```

Production Angular builds:

```powershell
npm --prefix AdminFront run build:prod
npm --prefix ClientFront run build:prod
```

Backend TypeScript build:

```powershell
npm --prefix Backend run build
```

## Common Problems

### Wrong Node or npm Version

Run:

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

If NVM says Node 14.16.1 is selected but another version appears:

```powershell
where.exe node
where.exe npm
nvm list
```

Check the Windows PATH/NVM configuration before installing dependencies.

### EBADENGINE

Do not change packages to work around this first.

Verify:

```text
Node 14.16.1
npm 6.14.12
```

### Angular / NGCC / TypeScript Problems

Both Angular applications pin TypeScript to:

```text
4.1.5
```

Check with:

```powershell
npm --prefix AdminFront exec -- tsc --version
npm --prefix ClientFront exec -- tsc --version
```

or from inside either project:

```powershell
npx tsc --version
```

Expected:

```text
Version 4.1.5
```

### AdminFront Blank Page

Check:

```text
AdminFront/src/index.html
```

and verify:

```html
<base href="/">
```

for local development.

### Frontend Loads but Data Is Missing

Verify the development environment file contains:

```text
https://mytechie.pro/api
```

for the normal team frontend workflow.

If you intentionally switched to the local backend, make sure:

- Backend is running on port `2424`
- MongoDB is connected
- the frontend uses `http://localhost:2424/api`

### MongoDB Connection Error

Check:

```text
Backend/.env
```

The backend may compile and start listening before the database connection fails.

### CORS Error

The backend local CORS configuration allows:

```text
http://localhost:4200
http://localhost:4201
```

for local frontend development.
