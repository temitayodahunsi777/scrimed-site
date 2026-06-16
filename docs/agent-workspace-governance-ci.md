# SCRIMED Agent Workspace And TrustOps Governance Smoke CI

Status: active CI workflow foundation.

Boundary: this smoke validates governed synthetic/protected-pilot behavior only. It does not authorize PHI ingestion, autonomous clinical execution, payer submission, patient outreach, medical-record mutation, production connector execution, HIPAA certification, SOC 2 certification, or legal/regulatory conclusions.

## Workflow

GitHub Actions workflow:

- `.github/workflows/agent-workspace-governance-smoke.yml`

The workflow runs authenticated governance smoke scripts against the production app:

- `scripts/agent-workspace-authenticated-smoke.mjs`
- `scripts/trustops-authenticated-smoke.mjs`

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

- Unauthenticated work-order, governance-ledger, and TrustOps incident access fails closed.
- Protected workspace activation governance can commit a metadata-only governance pack seed through the same ledger foundation.
- Authenticated work-order creation succeeds.
- Authenticated work-order transition succeeds.
- Authenticated event trail is retained.
- Authenticated work-order proof packet downloads after audit.
- Authenticated retention ledger entry commits.
- Authenticated incident export downloads only after governance-ledger write.
- Authenticated TrustOps incident creation succeeds.
- Authenticated TrustOps incident update succeeds.
- Authenticated TrustOps incident event trail is retained.
- Authenticated TrustOps review packet downloads only after packet-release audit.

## External Gate

The remaining authenticated-mutation gate is operational: GitHub Actions must receive an approved AAL2 tenant-admin or pilot-lead bearer token in the `SCRIMED_BEARER_TOKEN` secret before it can create or mutate protected work orders and TrustOps incidents. This cannot be resolved safely in code because source control must never store production identity credentials.

Passkey authentication does not remove this CI gate. WebAuthn passkey ceremonies require a human/browser interaction and are appropriate for tenant-admin sign-in, not unattended GitHub Actions mutation smoke. CI should continue to use an explicitly issued, short-lived, AAL2-scoped operational token when authenticated mutation smoke is required.

No-secret public readiness is covered by `scripts/public-production-smoke.mjs`. That script verifies the branded app routes, product-console passkey posture, protected-pilot readiness, and unauthenticated fail-closed boundaries without requiring production credentials.

## Code-Side Resolution

The source-side gap is closed by public production smoke, fail-closed unauthenticated checks, optional scheduled authenticated-path skipping when the secret is absent, manual dispatch with `require_authenticated_path=true`, and the protected activation-governance route. The unresolved piece is only the out-of-band secret placement in GitHub Actions for authenticated mutation happy paths.
