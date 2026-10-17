# Feature 2: Professional Business Registration Fields

Independent branch: DevLink2026-ProBusinessFields, based on origin/dev at 35ed1c9df41fe8ab89a05deb31e36af366234618 (fetched October 17, 2026 UTC).
Work in a separate checkout of DevLink2026-ProBusinessFields to preserve other feature branches and uncommitted work. The branch has been pushed and [PR #75](https://github.com/hcuriel2/MyTechiePro-Computotal/pull/75) has been created targeting dev. Nothing has been merged; PRs #73 and #74 remain unchanged.

## Behavior and data flow
Professional signup only: DBA, GST Number and PST Number required; Business Number and D-U-N-S Number optional. Whitespace-only values rejected. DBA limit 200 characters; all identifiers 50. Identifiers are strings so leading zeroes survive. These are presence/type/length checks, not government registry or tax-number verification. No unapproved country-specific format rules.

SignUpComponent -> User -> AuthService.registerUser -> POST /api/auth/register -> validationMiddleware(CreateUserDto) -> AuthenticationController.registration -> AuthenticationService.register -> userModel.create({...userData,...}). New Mongoose paths prevent strict-schema loss and trim values. Both registration routes already share the DTO. No authentication controller/service or email-verification code changes needed.

Client controls, payload construction and submission behavior are unchanged. New business controls/rendering/payload assignments exist only in the forPro path. API DTO business requirements depend on userType === Professional, not the route name.

New Professional model documents require the three business fields. Existing Professional documents may save without them (including email verification); no migration or database writes were performed. New field values are present in registration's existing user response. This change does not add admin/profile display or registry lookups.

## Isolated demo and safety
Run ONLY business-fields-demo.cjs, not server.ts, app.ts, npm start or npm startall for this demonstration. The standalone harness does not read dotenv, forbids mongoose.connect/createConnection, replaces User.findOne/find/create in memory, and replaces the SendGrid module before importing registration code. It uses the real Express controller, DTO middleware, registration service, password hashing, token generation and Mongoose document validation. It does not save documents or send mail. It accepts only demo registration API routes; other application API routes are disabled. Captured records reset when the process stops. The UI banner explicitly says MOCKED LOCAL DEMO; captured results are at /mock-status. A local Google Places stub allows manual address entry; remote requests are blocked by the demo page's CSP. No live DB/SendGrid verification is claimed.

## Run locally
Use a PowerShell terminal at the repository root in the DevLink2026-ProBusinessFields checkout. Install the repository dependencies using its documented setup first. Use a working Node.js executable on PATH (`node --version`); the isolated test runner requires a runtime with built-in `fetch` (Node.js 18 or newer). Angular 11 may require the OpenSSL compatibility option below on these newer runtimes. These instructions do not start the production backend.

```powershell
node Backend/node_modules/typescript/bin/tsc -p Backend/tsconfig.json
$env:NODE_OPTIONS = '--openssl-legacy-provider'
$env:NG_CLI_ANALYTICS = 'false'
Push-Location ClientFront
try {
  node node_modules/@angular/cli/bin/ng build --progress=false
} finally {
  Pop-Location
}
node Backend/scripts/test-business-fields.cjs
node Backend/scripts/business-fields-demo.cjs
```
Open http://127.0.0.1:8182/sign-up?forPro=true. Stop with Ctrl+C. Use port 8182 exclusively; if occupied, stop/report instead of selecting an unknown running server. Stop the demo before running the browser test, which starts its own isolated server on the same port. No package or lockfile changes are needed for this documentation update.

The browser runner requires Microsoft Edge and currently loads Playwright from the Codex bundled runtime relative to `USERPROFILE`. This existing script dependency is a portability limitation: the browser command requires that runtime layout; installing Playwright only in the repository is not sufficient. The script is unchanged. Use an output directory outside the repository so generated screenshots and results cannot be committed accidentally:

```powershell
$demoOutput = Join-Path ([System.IO.Path]::GetTempPath()) ('pro-business-fields-' + [guid]::NewGuid().ToString())
node Backend/scripts/test-business-fields-browser.cjs $demoOutput
Write-Host "Mocked demo evidence: $demoOutput"
```

## Monday October 19 demo (about 3 minutes)
1. Keep the MOCKED banner visible. Open Professional signup and scroll to Business Registration. Blur empty DBA/GST/PST to show required errors and disabled Submit. Optional fields can remain empty.
2. Fill existing signup requirements too: names, example.com email, password DemoPass1!, matching confirmation, phone, company, rate type Hour, rate 100, bio, and manually entered address fields. Demo values: DBA Demo Tech; GST 001234567RT0001; PST PST-001234; optional business/D-U-N-S 001234567. These are fabricated demonstration values.
3. Submit and open View captured business values. Explain these values passed real backend validation and are stored only in memory; email was captured, never delivered. The verification instructions screen is application behavior, not evidence of email delivery.
4. Open /sign-up without forPro=true to show Client signup has no added fields.
5. For backend rejection evidence, run test-business-fields.cjs: missing required values return HTTP 400 before mock persistence/mail. A valid request returns HTTP 201.

Screenshots generated by the browser test: 01-professional-required.png; 02-professional-valid.png; 03-mock-backend-capture.png; 04-client-unchanged.png. The browser fixture sets existing address/form controls directly; it does not claim to test Google Places or government identifiers. Manual demo uses normal inputs.

## Validation performed
Backend TypeScript build passed. Angular 11 development/AOT build passed (existing pro-profile SCSS autoprefixer and Google Places CommonJS warnings; runtime deprecation warning). No AdminFront changes, so no AdminFront build needed.
All 28 isolated backend checks passed. The focused isolated backend suite covers DTO missing/null/empty/whitespace/type/length cases, optional omission, Client compatibility, schema validation and legacy Professional verification-save compatibility, actual HTTP routes, captured persistence values including leading zeroes and DBA trim, and generation/capture of verification token/session/email link.
Browser checks exercise actual compiled Angular controls, submission guard, valid Angular-to-HTTP registration through the real service/schema, Client field absence and no page errors. Manual mocked-demo testing also passed, as reported by the author. Screenshots and browser-results.json are local evidence. This is mocked integration, NOT real end-to-end MongoDB persistence or email delivery. No production/shared database was read or written.

## Integration overlap with Features 1 and 3
PR #73 branch DevLink2026-ProEmailRestriction modifies signup.component.ts/html and backend authentication.controller.ts/service.ts (plus environments/readme). PR #74 branch DevLink2026-SignupControls modifies signup.component.ts/html, backend authentication.controller.ts, server.ts and adds settings/admin files. Feature 2 overlaps both in signup.component.ts/html; its DTO/User/model additions are independent in the inspected local branch diffs.
Before any future integration, resolve signup imports, Professional email validator composition, createForm additions, submit early-return checks, payload mapping and API-error handling deliberately. Preserve Feature 3 closed/unavailable signup guard and notices, Feature 1 Professional-only email rule and backend enforcement, Feature 2 required business fields and payload, and Client behavior. Recheck shared controller middleware order if Features 1/3 conflict there. Run a matrix: Client vs Professional; signup open/closed/unavailable; allowed/restricted email; absent/valid business values; duplicate email and verification paths. Do not replace one component wholesale with another branch's version. No branches were merged to investigate this.

## Remaining limits
Real DB persistence and delivery/verification round trips remain untested by design. Existing app issues outside this scope remain. Final production integration needs separate authorization and validation; presence checks do not establish legal registration validity. Implementation was conservatively estimated at 2–4 hours before inspection. Further pushes or PR changes require user authorization; PR #75 is the existing Feature 2 review, and nothing has been merged.
