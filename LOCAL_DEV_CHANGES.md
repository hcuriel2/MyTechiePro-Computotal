# Local Development Changes

This team-ready copy contains the following development-environment changes from the legacy project:

- Standardized the verified local toolchain on Node `14.16.1` and npm `6.14.12`.
- Added root `.nvmrc` with `14.16.1`.
- Set exact Node/npm engine metadata in the root and all three subprojects.
- Added `.npmrc` files with `engine-strict=true` so an incompatible Node/npm environment fails early.
- Normalized all three `package-lock.json` files to npm 6 `lockfileVersion: 1` while preserving the resolved dependency versions from the working project state.
- Added root scripts for installing, building, and running each application.
- Pinned Angular frontend TypeScript to `4.1.5`.
- Configured both frontend development environments to use the deployed API at `https://mytechie.pro/api`, so the AdminFront and ClientFront can run without requiring a local Backend or MongoDB connection.
- Configured local AdminFront to use `/` as its base path and production builds to use `/admin/`.
- Added local Backend CORS origins for AdminFront (`4200`) and ClientFront (`4201`).
- Added `Backend/.env.example`; the real `.env` remains local and ignored by Git.
- Kept generated directories and secrets (`node_modules`, `dist`, `.env`, Angular cache, IDE metadata) out of the team-ready archive.

Do not run `npm audit fix --force` unless the project is intentionally being upgraded and tested as a separate migration task.
