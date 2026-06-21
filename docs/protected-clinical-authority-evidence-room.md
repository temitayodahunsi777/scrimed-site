# Protected Clinical Authority Evidence Room

SCRIMED Protected Clinical Authority Evidence Room v1 is an authenticated, AAL2-gated, no-PHI workspace surface for assembling clinical authority readiness evidence.

Routes:

- `/pilot-workspace/access#clinical-authority-evidence-room`
- `/pilot-workspace/access#clinical-authority-owner-matrix`
- `/pilot-workspace/access#clinical-authority-artifact-intake`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room/packet`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix/packet`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake/packet`

## Purpose

The room consolidates existing protected workspace evidence into one authority-control plane:

- live clinical care authority
- PHI and ePHI processing authority
- legal and contracting approval
- regional regulatory approval
- reimbursement, coverage, coding, and payer policy review
- security certification and procurement approval
- production clinical authorization
- certified health IT and connector approval

It tracks reviewer owners, metadata-only evidence references, retained gates, 90-day expiration posture, audit history, safe workarounds, and packet export readiness.

The downstream Protected Clinical Authority Owner Matrix converts this room into customer, SCRIMED, and qualified external approver-role routing while retaining the same no-PHI and no-authority boundary. The downstream Protected Clinical Authority Artifact Intake Checklist converts those owner assignments into external system-of-record criteria, qualified reviewer roles, validation timestamps, expiration cadences, prohibited-content rules, and acceptance criteria without storing artifacts.

## Boundaries

The room does not authorize live clinical care, PHI processing, diagnosis, treatment, prescribing, patient outreach, medical-record mutation, payer submission, legal approval, regulatory approval, reimbursement certainty, security certification, regional launch, production connector activation, or production clinical authorization.

It must not store PHI, patient identifiers, payer member data, live clinical records, source contracts, signed BAAs/DPAs, legal opinions, security reports, credentials, URLs, tokens, clinical validation artifacts, reimbursement determinations, certifications, regional approvals, production credentials, or approval artifacts.

## Implementation

The room derives from existing protected workspace evidence instead of introducing a new database table:

- Clinical Activation Dossier
- Clinical Activation Approval Workflow
- Protected External Approval Evidence
- Provider Security Reviews
- Procurement Evidence Registry
- Finance Methodology Gates
- Command Intelligence
- QA evidence, sessions, and audit events

Packet downloads use the existing enterprise proof-packet audit RPC with packet metadata `clinical-authority-evidence-room`, preserving append-only audit history without requiring a new Supabase migration.

## Verification

Run:

```bash
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run typecheck
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run lint
/usr/bin/env PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run build
SCRIMED_BASE_URL=http://127.0.0.1:3025 SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation /Applications/Codex.app/Contents/Resources/cua_node/bin/node scripts/public-production-smoke.mjs
```

Production smoke should verify:

- product console proof stack includes `aal2-clinical-authority-evidence-room-no-phi`
- product console packet proof stack includes `aal2-audited-clinical-authority-evidence-room-packet-no-phi`
- protected room API fails closed without authentication
- protected packet API fails closed without authentication
