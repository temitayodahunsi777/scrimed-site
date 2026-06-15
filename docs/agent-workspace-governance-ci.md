# SCRIMED Agent Workspace Governance Smoke CI

Status: active CI workflow foundation.

Boundary: this smoke validates governed synthetic/protected-pilot behavior only. It does not authorize PHI ingestion, autonomous clinical execution, payer submission, patient outreach, medical-record mutation, production connector execution, HIPAA certification, SOC 2 certification, or legal/regulatory conclusions.

## Workflow

GitHub Actions workflow:

- `.github/workflows/agent-workspace-governance-smoke.yml`

The workflow runs `scripts/agent-workspace-authenticated-smoke.mjs` against the production app.

## Required Secret

Store this repository secret in GitHub Actions:

- `SCRIMED_BEARER_TOKEN`

The token must belong to an approved tenant-admin or pilot-lead identity with AAL2 assurance for the protected pilot workspace. Do not commit this token to source control.

## Optional Inputs

Manual workflow dispatch supports:

- `base_url`, default `https://app.scrimedsolutions.com`
- `workspace_slug`, default `atlas-synthetic-evaluation`
- `require_authenticated_path`, default `true`

Scheduled runs use the defaults. If the secret is present, the authenticated path runs. If the secret is absent during scheduled runs, the script still validates fail-closed unauthenticated behavior and skips authenticated mutations.

## What The Smoke Validates

- Unauthenticated work-order access fails closed.
- Unauthenticated governance-ledger access fails closed.
- Protected workspace activation governance can commit a metadata-only governance pack seed through the same ledger foundation.
- Authenticated work-order creation succeeds.
- Authenticated work-order transition succeeds.
- Authenticated event trail is retained.
- Authenticated work-order proof packet downloads after audit.
- Authenticated retention ledger entry commits.
- Authenticated incident export downloads only after governance-ledger write.

## External Gate

The only remaining gate is operational: GitHub Actions must receive an approved AAL2 tenant-admin or pilot-lead bearer token in the `SCRIMED_BEARER_TOKEN` secret. This cannot be resolved safely in code because source control must never store production identity credentials.

## Code-Side Resolution

The source-side gap is closed by fail-closed unauthenticated checks, optional scheduled authenticated-path skipping when the secret is absent, manual dispatch with `require_authenticated_path=true`, and the protected activation-governance route. The unresolved piece is only the out-of-band secret placement in GitHub Actions.
