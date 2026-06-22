# SCRIMED Boundary Resolution Register

Updated: 2026-06-21

SCRIMED exposes the Boundary Resolution Register at `/boundary-resolution`, `/api/boundary-resolution`, and `/api/boundary-resolution/brief`.

The register aggregates known limits from:

- Clinical Authority Readiness
- Clinical Care Activation
- Persistent Agent Workspace limitations
- QA Evidence Ledger and Manual AAL2 Activation Plan
- Public Market Readiness limitations

## Operating Purpose

The register exists to keep hard boundaries visible, owned, and actionable. A boundary is considered addressed only when it has:

- a current control
- a safe workaround
- an accountable owner path
- proof routes
- a retained gate before higher-risk use
- prohibited claims that must not be made

## Current Boundary

The register does not authorize live clinical care, PHI processing, legal approval, regional regulatory approval, reimbursement certainty, security certification, production clinical authorization, autonomous clinical decisions, patient outreach, payer submission, EHR writeback, public customer claims, or securities offering material.

## Operator Rule

Use the register as the central no-secret operating map before buyer conversations, investor diligence, clinical authority review, protected pilot escalation, or production-readiness planning.

Do not treat a safe workaround as external approval. If a record says `human-aal2-required`, `customer-specific-required`, `external-approval-required`, or `blocked-before-approval`, keep the gate closed until retained evidence exists.

## Next Step

Use `/qa-execution-readiness` to run the first deliberate short-lived human AAL2 QA workflow, persist the safe packet metadata through the protected workspace, then link that retained proof into Buyer Pilot Room and Boundary Resolution evidence.
