# Protected Authority Artifact References

SCRIMED Protected Authority Artifact References v1 is an authenticated, AAL2-gated, no-PHI workspace ledger for recording metadata-only status about externally retained authority artifacts.

Routes:

- `/pilot-workspace/access#authority-artifact-references`
- `GET /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references`
- `POST /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references`
- `GET /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue`
- `GET /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet`

## Purpose

The reference ledger turns the Protected Clinical Authority Artifact Intake Checklist into durable operator status:

- artifact intake item
- external system label
- non-secret external reference ID
- reviewer label and role
- validation timestamp
- expiration timestamp
- renewal alert timestamp
- reference status
- retained blockers and storage restrictions
- renewal queue state and risk level
- authenticated QA harness steps and pass criteria

It covers live-care authority, PHI processing, legal approval, regional regulatory approval, reimbursement review, security certification, connector acceptance, and production clinical authorization.

## Renewal Queue

The renewal queue is derived from the existing checklist and reference ledger. It does not create a new source of authority.

Queue states:

- missing reference
- review pending
- renewal alert due
- expiration due
- expired reference
- rejected reference

Risk levels:

- blocked
- urgent
- scheduled

The queue lets operators work the authority gates in priority order while preserving the rule that signed artifacts, approval documents, security reports, clinical validation, regional approvals, reimbursement determinations, URLs, credentials, PHI, and production records stay outside SCRIMED.

## Authenticated QA Harness

Run:

```bash
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run smoke:authority-reference-qa:preflight
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run smoke:authority-reference-qa
```

Default behavior:

- verifies the renewal queue route fails closed without authentication
- skips authenticated write checks unless `SCRIMED_BEARER_TOKEN` is present

Required authenticated run:

```bash
SCRIMED_REQUIRE_AUTHORITY_REFERENCE_QA=1 SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation SCRIMED_BEARER_TOKEN={short-lived-aal2-token} /usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run smoke:authority-reference-qa:preflight
SCRIMED_REQUIRE_AUTHORITY_REFERENCE_QA=1 SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation SCRIMED_BEARER_TOKEN={short-lived-aal2-token} /usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run smoke:authority-reference-qa
```

The harness records one synthetic metadata-only authority reference, verifies the renewal queue, downloads the audited packet, and reminds the operator to dispose of the short-lived token outside the application.

## Manual CI Evidence Bridge

The manual GitHub workflow `.github/workflows/authority-reference-qa-smoke.yml` runs the same preflight and smoke path without scheduling authenticated mutations or committing credentials.

After a passing authenticated workflow run, copy only these safe values into `/pilot-workspace/access -> Manual QA Evidence`:

- `workflowKind`: `authority-reference-qa`
- `workflowRunId`: GitHub Actions run ID
- `intakeId`: protected workspace slug
- `createdSessionId`: created authority reference UUID printed by the smoke as `referenceId`
- `packetAuditEventId`: authority reference packet audit event UUID printed by the smoke
- fixed attestations: `pass`, `no-secrets-no-phi-aal2-human-run`, `temporary-token-deleted-or-rotated`, `synthetic-business-workflow-only`

The protected Manual QA Evidence panel labels `createdSessionId` as `Created authority reference ID` for this workflow kind. The storage column remains generic so SCRIMED can reuse the no-secret packet ledger without another migration.

Do not copy bearer tokens, refresh tokens, credentials, PHI, artifact URLs, signed artifacts, legal opinions, security reports, reimbursement determinations, certification evidence, or approval documents into the evidence panel.

## Boundaries

This ledger stores metadata only. It does not store PHI, patient identifiers, payer member data, URLs, production credentials, source files, source contracts, signed artifacts, signatures, legal opinions, security reports, reimbursement determinations, regional approvals, clinical validation artifacts, certification evidence, production approvals, or uploaded documents.

Reference status does not grant clinical authority, PHI processing authority, legal approval, reimbursement certainty, regional approval, security certification, connector approval, production authorization, procurement approval, public distribution, or live clinical-care authority.

## Implementation

The migration `20260621120000_protected_authority_artifact_references.sql` adds:

- `public.protected_authority_artifact_references`
- RLS select for AAL2 governance-session tenant members
- guarded RPC `public.record_protected_authority_artifact_reference`
- append-only audit event `protected-authority-artifact-reference-recorded`
- runtime status keys for reference capture and packets

Packet downloads use the existing enterprise proof-packet audit RPC with `packetType: protected-authority-artifact-references`.

## Verification

Run:

```bash
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run typecheck
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run lint
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run build
SCRIMED_BASE_URL=http://127.0.0.1:3025 SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation /Applications/Codex.app/Contents/Resources/cua_node/bin/node scripts/public-production-smoke.mjs
```

Production smoke should verify:

- product console proof stack includes `aal2-authority-artifact-reference-status-capture-no-artifact-storage`
- product console packet proof stack includes `aal2-audited-authority-artifact-reference-status-packet-no-artifact-storage`
- product console proof stack includes `aal2-authority-renewal-queue-no-artifact-storage`
- product console proof stack includes `aal2-authority-reference-qa-harness-token-boundary`
- product console proof stack includes `authority-reference-qa-evidence-bridge-ready`
- protected authority artifact reference API fails closed without authentication
- protected authority artifact renewal queue API fails closed without authentication
- protected authority artifact reference packet API fails closed without authentication
