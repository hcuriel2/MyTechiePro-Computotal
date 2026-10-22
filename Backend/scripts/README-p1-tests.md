# Isolated P1 regression checks

From Backend, after installing the repository dependencies:

    node node_modules/typescript/bin/tsc
    node scripts/test-integration.cjs
    node scripts/test-signup-store.cjs

Use the project's supported Node runtime. These checks use the compiled production controllers, validation, services and schemas with memory-only persistence and captured mail. The helper blocks MongoDB connections and replaces the email module before loading authentication. HTTP listens on an ephemeral loopback port. No environment file, application server or demo route is loaded.

Expected: 18 HTTP groups and 5 adapter checks. These checks do not certify real MongoDB durability/index races, real Admin login, or email delivery. Browser demo assets and presentation scripts are intentionally excluded. Run the separately retained isolated presentation checkout for the previously verified browser demo.
