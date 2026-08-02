# Non-Production Preview Deployment Packet

**Status:** FOUNDER INTERIM ACCEPTANCE REQUIRED. No preview was deployed in this pass.

## Required Boundaries

- exact reviewed commit only;
- synthetic-only and no-PHI mode;
- no production database, migration, EHR, device, payer, connector, customer, or production alias;
- consequential actions disabled;
- preview-scoped secrets only, no copied production credentials;
- expiry and named removal/rollback owner.

## Environment Manifest

Set existing safe feature flags to synthetic/read-only values. Leave PHI, live clinical,
consequential actions, schedules, provider calls with protected data, production connectors,
EHR/device, payer, migration, and customer-activation flags off. Use only a disposable or mock
data adapter.

## Operator Sequence

1. Resolve worktree attribution and produce an immutable reviewed commit.
2. Obtain founder preview authorization naming commit, project, expiry, operator, and rollback.
3. Create a Vercel preview through the repository's normal preview workflow. Do not add a
   production domain or promote the deployment.
4. Confirm the deployment artifact matches the authorized commit and expected route manifest.
5. Run public smoke, protected fail-closed checks, and:

```bash
SCRIMED_PREVIEW_BASE_URL=https://<preview-host> npm run verify:preview-ui -- --json
```

CI may provide Playwright through its normal module path. If the approved runner uses an
installed Chrome/Chromium binary rather than Playwright-managed browsers, set the absolute
`SCRIMED_PLAYWRIGHT_EXECUTABLE_PATH`; the verifier rejects non-Chrome relative paths.

6. Retain desktop and exact 390px screenshots plus the JSON report.
7. Remove the preview at expiry or immediately on policy, claim, privacy, or security failure.

`.github/workflows/preview-validation.yml` performs the same build and desktop/390px checks on a
local CI server with seven-day evidence retention. It does not deploy a Vercel preview or grant
production authority. Use its artifact to reduce the founder/operator review burden before the
external preview action.

Rollback/removal means disable the preview deployment and revoke preview-scoped credentials;
there is no production database state to restore. Expected routes include Home, Legal,
Validation and Evidence, FaithCore, demos, and synthetic pilot surfaces. Production mutation,
private operator, and connector execution routes must remain unavailable or fail closed.
