# Protected Authority Artifact References

SCRIMED Protected Authority Artifact References v1 is an authenticated, AAL2-gated, no-PHI workspace ledger for recording metadata-only status about externally retained authority artifacts.

Routes:

- `/pilot-workspace/access#authority-artifact-references`
- `GET /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references`
- `POST /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references`
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

It covers live-care authority, PHI processing, legal approval, regional regulatory approval, reimbursement review, security certification, connector acceptance, and production clinical authorization.

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
- protected authority artifact reference API fails closed without authentication
- protected authority artifact reference packet API fails closed without authentication
