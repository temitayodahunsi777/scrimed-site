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
- Human run packet: `/qa-human-run-packet`
- Activation seal: `/qa-activation-seal`
- Buyer proof release: `/qa-buyer-proof-release`

## Current Safe Position

SCRIMED may say it has a governed no-secret synthetic QA readiness path with human AAL2 gates, Human Run Packet dispatch controls, Completion Bridge validation, protected persistence, Proof Promotion boundaries, and a protected Buyer Proof Release gate.

SCRIMED may not yet say it has retained authenticated manual AAL2 QA proof unless the protected packet hash is visible, Proof Promotion allows packet-backed language, and Buyer Proof Release permits protected buyer diligence export.

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
3. If a claim references retained authenticated QA proof, require protected packet SHA-256, audit event ID, workflow run ID, Proof Promotion ready state, and Buyer Proof Release readiness.
4. Use `/qa-activation-seal` to confirm public candidate completeness has not been mistaken for protected packet visibility.
5. Use `/qa-buyer-proof-release` before Buyer Diligence export references retained QA proof.
6. If a claim references clinical, PHI, compliance, security, reimbursement, production, or public distribution authority, route it to qualified reviewers and Boundary Resolution.

## Boundary

Claim Guard is guidance, not legal approval, security certification, clinical authority, PHI authority, reimbursement review, production connector approval, or retained authenticated QA proof.
