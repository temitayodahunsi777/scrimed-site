# SCRIMED Operator Token Rotation Runbook

Updated: 2026-06-18

## Purpose

Run authenticated Sales Demo Session QA only when a human tenant-admin intentionally verifies an AAL2 browser session and targets a specific Sales Operations opportunity.

This runbook exists to prevent long-lived CI credentials, wrong-opportunity QA writes, leaked bearer tokens, and ungoverned authenticated mutation tests.

## Scope

Applies to:

- `scripts/sales-demo-session-qa-token-policy-selftest.mjs`
- `scripts/sales-demo-session-qa-token-preflight.mjs`
- `scripts/sales-demo-session-qa-smoke.mjs`
- `.github/workflows/sales-demo-session-qa-smoke.yml`
- `POST /api/sales-operations/qa/buyer-demo-sessions`

Does not authorize PHI processing, production clinical execution, autonomous care decisions, payer submission, patient outreach, customer SSO cutover, source contract storage, credential storage, legal conclusions, compliance certification, or reimbursement determinations.

## Required Inputs

- `SCRIMED_SALES_QA_BEARER_TOKEN`: fresh tenant-admin access token from an AAL2 session.
- `SCRIMED_SALES_QA_INTAKE_ID`: explicit Sales Operations opportunity target.
- `SCRIMED_REQUIRE_SALES_QA=1`: required when CI should fail instead of skip.

Optional controls:

- `SCRIMED_BASE_URL`: defaults to `https://app.scrimedsolutions.com`.
- `SCRIMED_SALES_QA_MAX_TOKEN_SECONDS`: defaults to `3900`.
- `SCRIMED_SALES_QA_MIN_REMAINING_SECONDS`: defaults to `60`.

## Token Policy

The token must pass local preflight before any authenticated request is sent:

- JWT shape is valid.
- `aal` equals `aal2`.
- `session_id` exists.
- `exp` exists and is not expired.
- `iat` exists so minted lifetime can be checked.
- Remaining lifetime is no more than `3900` seconds.
- Remaining lifetime is at least `60` seconds.
- `SCRIMED_SALES_QA_INTAKE_ID` is explicit and safe to log.

The preflight does not verify the JWT signature. Signature and user verification remain the responsibility of the protected SCRIMED API through Supabase Auth before any mutation.

## Human Operator Flow

1. Run the no-secret policy self-test after any token-policy code change.

```bash
node scripts/sales-demo-session-qa-token-policy-selftest.mjs
```

2. Open `/sales-operations`.
3. Sign in with approved tenant-admin identity.
4. Complete passkey or passwordless sign-in plus authenticator verification until the session reaches AAL2.
5. Select the target Sales Operations opportunity and copy its `intakeId`.
6. Mint or obtain the current access token only through the approved internal browser-session procedure.
7. Place the token into an ephemeral shell variable only. Do not write it to `.env`, documentation, tickets, chat, logs, or source control.
8. Run preflight:

```bash
SCRIMED_SALES_QA_BEARER_TOKEN="..." SCRIMED_SALES_QA_INTAKE_ID="..." node scripts/sales-demo-session-qa-token-preflight.mjs
```

9. Run the smoke:

```bash
SCRIMED_SALES_QA_BEARER_TOKEN="..." SCRIMED_SALES_QA_INTAKE_ID="..." SCRIMED_REQUIRE_SALES_QA=1 node scripts/sales-demo-session-qa-smoke.mjs
```

10. Unset local shell variables immediately after the run.
11. Sign out of the tenant-admin session if the token was copied outside the browser context.
12. Review the Sales Operations audit trail and latest buyer demo session packet proof.

## GitHub Actions Policy

The workflow `.github/workflows/sales-demo-session-qa-smoke.yml` is manual-only.

Before running it:

- Create or update the repository or environment secret `SCRIMED_SALES_QA_BEARER_TOKEN` only after minting a fresh AAL2 token.
- Start the workflow immediately.
- Supply `intake_id` explicitly in the workflow dispatch form.
- Confirm the preflight step passes before the mutating smoke step runs.
- Delete or overwrite the secret immediately after the workflow finishes.
- Do not schedule this workflow.
- Do not reuse the token for TrustOps, Agent Workspace, Vercel, Supabase administration, or any non-QA workflow.

The workflow is allowed to fail if the token is missing, expired, not AAL2, missing `session_id`, too long-lived, or missing an explicit target.

## Incident Response

If a token is pasted into chat, logs, docs, tickets, screenshots, or source control:

1. Stop the run.
2. Sign out of the affected tenant-admin session.
3. Delete or rotate the GitHub secret.
4. Inspect Sales Operations and protected workspace audit trails.
5. Record a TrustOps incident if the token may have been exposed outside the intended operator environment.
6. Do not rerun authenticated smoke until a new AAL2 session and explicit opportunity target are available.

## Known Limitations

- WebAuthn/passkey ceremonies cannot run unattended in CI.
- GitHub Actions cannot guarantee secret deletion after a run; deletion remains an operator procedure.
- Local preflight only decodes JWT claims. The protected API remains the source of truth for user/session validity.
- Authenticated QA writes a synthetic buyer-demo verification record by design. Use only explicitly selected synthetic pilot or enterprise evaluation opportunities.

## Current Status

Status: `short-lived-aal2-token-preflight-and-manual-ci-policy`

Boundary: governed synthetic pilot and enterprise evaluation only.
