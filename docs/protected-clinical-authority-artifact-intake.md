# Protected Clinical Authority Artifact Intake Checklist

SCRIMED Protected Clinical Authority Artifact Intake Checklist v1 is an authenticated, AAL2-gated, no-PHI workspace surface for converting authority owner assignments into external artifact intake criteria.

Routes:

- `/pilot-workspace/access#clinical-authority-artifact-intake`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake/packet`

## Purpose

The checklist turns the Protected Clinical Authority Owner Matrix into external artifact reference requirements:

- external system of record
- qualified reviewer role
- validation timestamp
- expiration or renewal cadence
- required metadata fields
- prohibited content
- acceptance criteria
- retained gate and next action

It covers live-care authority, PHI processing, legal approval, regional regulatory approval, reimbursement review, security certification, connector acceptance, and production clinical authorization.

## Boundaries

The checklist does not store artifacts, signatures, contracts, PHI, legal opinions, security reports, reimbursement decisions, regional approvals, certification evidence, production credentials, connector approvals, or production authorizations.

It does not grant clinical authority, PHI processing authority, legal approval, reimbursement certainty, regional approval, security certification, production connector activation, production authorization, or live clinical-care authority.

## Implementation

The checklist derives from the Protected Clinical Authority Owner Matrix instead of introducing a new database table. Packet downloads use the existing enterprise proof-packet audit RPC with packet metadata `clinical-authority-artifact-intake-checklist`.

This preserves a no-upload, metadata-reference-only operating model while giving operators a concrete authority-preparation checklist for buyer diligence and future approval workflows.

## Verification

Run:

```bash
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run typecheck
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run lint
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run build
SCRIMED_BASE_URL=http://127.0.0.1:3025 SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation /Applications/Codex.app/Contents/Resources/cua_node/bin/node scripts/public-production-smoke.mjs
```

Production smoke should verify:

- product console proof stack includes `aal2-clinical-authority-artifact-intake-checklist-no-phi`
- product console packet proof stack includes `aal2-audited-clinical-authority-artifact-intake-checklist-packet-no-phi`
- protected artifact-intake API fails closed without authentication
- protected artifact-intake packet API fails closed without authentication
