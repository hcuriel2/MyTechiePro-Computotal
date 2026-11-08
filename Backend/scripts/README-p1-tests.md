# Isolated P1 regression checks

From Backend, after installing the repository dependencies:

    node node_modules/typescript/bin/tsc
    node -r ./scripts/fetch-node14.cjs scripts/test-integration.cjs
    node scripts/test-signup-store.cjs
    node scripts/test-admin-levels.cjs
    node scripts/test-password-reset.cjs
    node scripts/test-mfa-totp.cjs

Use the project's supported Node runtime. These checks use the compiled production controllers, validation, services and schemas with memory-only persistence and captured mail. The helper blocks MongoDB connections and replaces the email module before loading authentication. HTTP listens on an ephemeral loopback port. No environment file, application server or demo route is loaded.

Expected: 18 HTTP groups and 5 adapter checks. These checks do not certify real MongoDB durability/index races, real Admin login, or email delivery. Browser demo assets and presentation scripts are intentionally excluded. Run the separately retained isolated presentation checkout for the previously verified browser demo.

The additional admin-level suite exercises 78 HTTP checks against the production routers and JWT middleware. It verifies Admin/legacy Admin compatibility, Editor content updates, Read-only write rejection, invalid roles, Admin-only signup controls, role creation, and partial content updates. Database writes and email are replaced in memory; Stripe is initialized with a disposable test string and no payment handler is executed. The Node 14 fetch adapter allows loopback HTTP only.

The recovery suite runs 13 groups against the production request/reset routes and service with a memory adapter and captured mail. It checks valid, missing, malformed, wrong, expired and reused credentials; wrong-account rejection; superseded credentials and cooldown; password validation; generic request responses; and storage/mail failure behavior. Its concurrent-submit check models an atomic adapter; real MongoDB concurrency still needs independent verification. It never loads an environment file, uses real accounts, or delivers email.

Frontend unit suites: from each frontend directory, run `npm test -- --watch=false`. Karma uses headless Chrome by default, honors `CHROME_BIN`, and detects standard Chrome/Edge installations on Windows. Component fixtures mount the app modules with mock HTTP, inert Maps and dialog providers. The retained browser story helpers remain outside the application repository.

## Disposable MongoDB MFA/recovery integration

With a compatible modern Node runtime and the test-only `mongodb-memory-server` package installed **outside this application**, set `DISPOSABLE_MONGO_HELPER` to that package's absolute path and run `node scripts/test-mfa-recovery-mongo.cjs`. Optionally set `MONGOMS_DOWNLOAD_DIR` to a test cache. The script starts its own MongoDB 7.0.14 on `127.0.0.1` and an ephemeral port; it accepts no database URI, reads no `.env`, captures mail and shuts down its disposable database in `finally`. Initial execution may download the official MongoDB binary. Do not substitute a shared database.

The suite runs 23 HTTP groups covering normal login, factor enrollment/confirmation/expiry, recovery with active MFA, old-session invalidation, Admin authorization, real concurrent recovery, replacement/disable proof, legacy migration and recovery-link invalidation on factor changes. A separately reported current-code replay observation is an **open security finding**, not a passing control. Neither the utility test nor this suite certifies login throttling, complete OTP replay defenses, actual email delivery or production cookie/CORS behavior.
