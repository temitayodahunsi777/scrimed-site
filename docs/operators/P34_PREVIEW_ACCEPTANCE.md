# p.34 Preview Acceptance Operator Action

Status: **OPERATOR_ACTION_REQUIRED**

Target operator time: **3 minutes or less**

## Exact Target

- Deployment: `dpl_53TJzzb6Yd2D23k6LNdmw1QonMYC`
- URL: `https://scrimed-site-xe09c4wvj-temitayo-dahunsis-projects.vercel.app`
- Commit: `a7cfd5d4ad851199261d001a51aabba012aab93b`
- Candidate: `31cfd44e50345caecf852bbb0a9b431543fd8fc8ecc975fde9594a0105e35aee`
- Runtime: Node 24
- Environment: nonproduction preview
- Production alias: none

## Exact Operation

From a clean checkout of the exact commit:

```bash
TARGET_URL=https://scrimed-site-xe09c4wvj-temitayo-dahunsis-projects.vercel.app \
  npm run scrimed:p34:verify-preview
```

If Vercel Authentication is enabled, provide an approved short-lived same-origin share URL through
`SCRIMED_VERCEL_SHARE_URL` in the process environment. Never paste that value into evidence or
documentation.

## Expected Result

The verifier must return `NONPRODUCTION_PREVIEW_ACCEPTED` and record:

- exact deployment and candidate binding;
- Node 24 and preview environment;
- no production alias;
- public/API smoke success;
- protected operations denied without authorization;
- desktop and 390px checks passed;
- no prohibited public claims or PHI;
- production and customer authority remain false.

Evidence is written to `artifacts/release/p34-preview-verification.json` and preview observability is
recorded under `artifacts/vercel/`. The current repository receipt remains fail-closed because its
local browser helper was unavailable, even though a separate connected-browser observation passed.
The release steward must rerun the exact command in a supported environment before acceptance.

## Acceptance Action

After the command passes, the release steward records an attributable acceptance against the exact
deployment, commit, candidate, verification fingerprint, timestamp, and the statement:

`ACCEPT_NONPRODUCTION_PREVIEW_ONLY`

Any candidate, deployment, runtime, or alias change invalidates the acceptance. Acceptance grants no
merge, migration, production, PHI, clinical, payer, EHR/device, provider, protected-pilot, customer,
contract, certification, compliance, or external-distribution authority.
