# SCRIMED Operator Token Rotation Runbook

Updated: 2026-06-18

## Purpose

Run authenticated Sales Demo Session QA and read-only Sales Command Center verification only when a human tenant-admin intentionally verifies an AAL2 browser session and targets a specific Sales Operations opportunity.

This runbook exists to prevent long-lived CI credentials, wrong-opportunity QA writes, leaked bearer tokens, and ungoverned authenticated tests.

## Scope

Applies to:

- `/qa-evidence`
- `/api/qa-evidence`
- `/api/qa-evidence/brief`
- `/api/qa-evidence/manual-run-packet`
- `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets`
- `scripts/sales-demo-session-qa-token-policy-selftest.mjs`
- `scripts/sales-demo-session-qa-token-preflight.mjs`
- `scripts/sales-demo-session-qa-smoke.mjs`
- `scripts/sales-command-center-smoke.mjs`
- `.github/workflows/sales-demo-session-qa-smoke.yml`
- `POST /api/sales-operations/qa/buyer-demo-sessions`
- `GET /api/sales-operations/opportunities/{intakeId}/command-center`

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

10. Optional read-only Command Center verification:

```bash
SCRIMED_SALES_QA_BEARER_TOKEN="..." SCRIMED_SALES_QA_INTAKE_ID="..." SCRIMED_REQUIRE_SALES_COMMAND_CENTER_QA=1 node scripts/sales-command-center-smoke.mjs
```

11. Unset local shell variables immediately after the run.
12. Sign out of the tenant-admin session if the token was copied outside the browser context.
13. Review the Sales Operations audit trail, latest buyer demo session packet proof, and current Sales Command Center timeline.
14. Preferred path: open `/pilot-workspace/access` with the same AAL2 browser session and use the Manual QA Evidence panel to persist the non-secret run metadata.
15. Fallback path: POST only the non-secret run metadata to `/api/qa-evidence/manual-run-packet` to generate the sanitized evidence packet, then POST the same payload to `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets` with the current AAL2 tenant governance session.
16. Export the Buyer Diligence Export after persistence so the manual QA evidence count, workflow run ID, packet hash, legal/privacy/security/safety boundaries, command-posture timeline, and production hard gates appear in enterprise diligence.

Manual evidence packet payload:

```json
{
  "workflowRunId": "123456789",
  "workflowRunUrl": "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/123456789",
  "executedAt": "2026-06-18T19:00:00.000Z",
  "baseUrl": "https://app.scrimedsolutions.com",
  "intakeId": "synthetic-intake-target",
  "createdSessionId": "11111111-1111-4111-8111-111111111111",
  "packetAuditEventId": "22222222-2222-4222-8222-222222222222",
  "qaOutcome": "pass",
  "operatorAttestation": "no-secrets-no-phi-aal2-human-run",
  "tokenDisposalAttestation": "temporary-token-deleted-or-rotated",
  "dataBoundary": "synthetic-business-workflow-only"
}
```

The packet route rejects token, secret, password, credential, bearer, refresh, JWT-like, API-key-like, patient identifier, or payer member identifier content.

Protected persistence route:

```text
POST /api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets
```

Preferred browser-session path:

```text
/pilot-workspace/access -> Manual QA Evidence
```

Persistence controls:

- Requires a verified tenant governance bearer session with AAL2.
- Requires server-held runtime authorization before the database RPC can write.
- Stores the generated Markdown packet, packet hash, workflow run metadata, operator attestations, and append-only audit event only.
- Rejects token-like, secret-like, PHI-like, patient-identifier-like, and payer-member-identifier-like payloads.
- Does not store the bearer token, source contracts, clinical data, production credentials, legal conclusions, compliance certification, or live healthcare authorization.

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

Evidence ledger: `/qa-evidence`

Manual evidence packet route: `/api/qa-evidence/manual-run-packet`

Protected manual evidence persistence route: `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets`
