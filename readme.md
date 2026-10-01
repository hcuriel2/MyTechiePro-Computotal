# Computer Guy

## COMP 3800 Practicum Project

### Original Team Members

- Tristan Engen
- Benjamin Lui
- Maikol Chow Wang
- Timmy Lau
- Michael Lin

## Project Structure

This repository contains three applications:

- `AdminFront` - Angular 11 admin UI
- `ClientFront` - Angular 11 customer UI
- `Backend` - Node/Express/TypeScript API with MongoDB

For detailed setup and troubleshooting, see [TEAM_SETUP.md](TEAM_SETUP.md).

## Required Versions

This branch is standardized on:

- Node.js `14.16.1`
- npm `6.14.12`

Use NVM for Windows:

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

A global Angular CLI is not required because the Angular projects use their local CLI versions.

## Install Dependencies

From the repository root:

```powershell
npm run install:all
```

This runs `npm ci` for:

- `AdminFront`
- `ClientFront`
- `Backend`

Each application has its own committed npm 6 lockfile.

## Run the Frontend Applications

The frontend applications currently use the deployed API:

```text
https://mytechie.pro/api
```

Therefore, MongoDB credentials and the local backend are not required for normal frontend development.

Run AdminFront:

```powershell
npm run dev:admin
```

Open:

```text
http://localhost:4200/
```

Run ClientFront in a second terminal:

```powershell
npm run dev:client
```

Open:

```text
http://localhost:4201/
```

## Run the Backend

Only run the backend if you are working on API/backend functionality.

Copy:

```text
Backend/.env.example
```

to:

```text
Backend/.env
```

Then add the real MongoDB and JWT values.

Do not commit `Backend/.env`.

Start the backend with:

```powershell
npm run dev:backend
```

The backend listens on:

```text
http://localhost:2424/
```

## Build

Build all three projects:

```powershell
npm run build:all
```

For production Angular builds:

```powershell
npm --prefix AdminFront run build:prod
npm --prefix ClientFront run build:prod
```

Build the backend:

```powershell
npm --prefix Backend run build
```

## Branch

Team-ready development changes are maintained on:

```text
devLink-ready
```
