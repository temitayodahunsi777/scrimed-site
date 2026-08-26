# SCRIMED CI Workflow Governance

SCRIMED keeps its validation path explicit and no-secret. The CI Workflow Governance contract verifies that GitHub Actions continue to enforce build, lint, type, nonsecret safety contracts, dependency audit, dependency security floor, and protected smoke workflow hygiene.

Run:

```bash
npm run contract:ci-workflows
npm run test:nonsecret
```

The contract checks:

- main CI uses `npm ci`, dependency audit, dependency security floor, generated integrity, durable-store contract, Intelligence & Safety Stack contract, nonsecret suite, lint, typecheck, and build.
- workflows use read-only repository permissions.
- workflows use Node 24 through `actions/setup-node@v6`; the dedicated Node 24 certification workflow repeats p.33, nonsecret, secret, SBOM, build, route-inventory, and generated-integrity gates.
- protected smoke workflows keep explicit timeouts, concurrency controls, and human-provided short-lived AAL2 token paths.
- workflow files do not include common secret-printing or fail-open patterns.

This is workflow integrity evidence only. It does not mint tokens, store credentials, bypass AAL2, authorize PHI, approve customer go-live, certify security, or replace external CI/CD security review.
