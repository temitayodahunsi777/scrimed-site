# Protected Clinical Authority Owner Matrix

SCRIMED Protected Clinical Authority Owner Matrix v1 is an authenticated, AAL2-gated, no-PHI workspace surface for mapping every clinical authority hard gate to required customer, SCRIMED, and qualified external approver roles.

Routes:

- `/pilot-workspace/access#clinical-authority-owner-matrix`
- `/pilot-workspace/access#clinical-authority-artifact-intake`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix/packet`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake/packet`

## Purpose

The matrix turns the Protected Clinical Authority Evidence Room into a customer-specific owner-routing control:

- live clinical care authority
- PHI and ePHI processing authority
- legal and contracting approval
- regional regulatory approval
- reimbursement, coverage, coding, and payer policy review
- security certification and procurement approval
- production clinical authorization
- certified health IT and connector approval

Each domain maps to customer owners, SCRIMED owners, and qualified external reviewers while preserving the rule that approval artifacts stay outside SCRIMED.

## Boundaries

The matrix does not grant clinical authority, PHI processing authority, legal approval, reimbursement certainty, regional approval, security certification, production connector activation, production authorization, or live clinical-care authority.

It must not store PHI, patient identifiers, payer member data, credentials, URLs, signed agreements, legal opinions, security reports, reimbursement determinations, regional approvals, certifications, connector approvals, production credentials, or approval artifacts.

## Implementation

The matrix derives from the existing Protected Clinical Authority Evidence Room instead of introducing a new database table. Packet downloads use the existing enterprise proof-packet audit RPC with packet metadata `clinical-authority-owner-matrix`.

The downstream Protected Clinical Authority Artifact Intake Checklist converts owner assignments into external system-of-record criteria, qualified reviewer roles, validation timestamps, expiration cadences, prohibited-content rules, and acceptance criteria while continuing to store no artifacts.

## Verification

Run:

```bash
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run typecheck
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run lint
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run build
SCRIMED_BASE_URL=http://127.0.0.1:3025 SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation /Applications/Codex.app/Contents/Resources/cua_node/bin/node scripts/public-production-smoke.mjs
```

Production smoke should verify:

- product console proof stack includes `aal2-clinical-authority-owner-matrix-no-phi`
- product console packet proof stack includes `aal2-audited-clinical-authority-owner-matrix-packet-no-phi`
- protected owner-matrix API fails closed without authentication
- protected owner-matrix packet API fails closed without authentication
- protected artifact-intake API fails closed without authentication
- protected artifact-intake packet API fails closed without authentication
