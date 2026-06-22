# SCRIMED QA Claim Guard

Updated: 2026-06-22

## Purpose

QA Claim Guard keeps buyer, investor, sales, PR, advertising, and operator language aligned with retained evidence.

It classifies claims into:

- `safe-current-claim`
- `requires-retained-packet`
- `blocked-authority-claim`
- `needs-qualified-review`

## Routes

- Operator page: `/qa-claim-guard`
- Public API: `/api/qa-evidence/claim-guard`
- Downloadable brief: `/api/qa-evidence/claim-guard/brief`
- Activation seal: `/qa-activation-seal`

## Current Safe Position

SCRIMED may say it has a governed no-secret synthetic QA readiness path with human AAL2 gates, Completion Bridge validation, protected persistence, and Proof Promotion boundaries.

SCRIMED may not yet say it has retained authenticated manual AAL2 QA proof unless the protected packet hash is visible and Proof Promotion allows packet-backed language.

## Blocked Claims

Do not claim:

- live clinical care authority
- PHI processing authority
- HIPAA certification
- SOC 2 certification
- FDA clearance or approval
- reimbursement certainty
- production connector approval
- autonomous diagnosis or treatment
- payer submission authority
- patient outreach authority
- clinical validation completion
- regional regulatory approval

## Operating Sequence

1. Route every buyer, investor, sales, PR, advertising, and operator claim through `/qa-claim-guard`.
2. Use only safe current-state language until retained packet evidence exists.
3. If a claim references retained authenticated QA proof, require protected packet SHA-256, audit event ID, workflow run ID, and Proof Promotion ready state.
4. Use `/qa-activation-seal` to confirm public candidate completeness has not been mistaken for protected packet visibility.
5. If a claim references clinical, PHI, compliance, security, reimbursement, production, or public distribution authority, route it to qualified reviewers and Boundary Resolution.

## Boundary

Claim Guard is guidance, not legal approval, security certification, clinical authority, PHI authority, reimbursement review, production connector approval, or retained authenticated QA proof.
