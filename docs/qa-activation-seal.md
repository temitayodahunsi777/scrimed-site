# SCRIMED QA Activation Seal

SCRIMED QA Activation Seal is the final no-secret control between manual AAL2 QA execution and packet-backed buyer proof language.

It exists to prevent a common failure mode: treating a public packet preview, operator assertion, or successful route check as retained authenticated QA proof.

## Routes

- Operator page: `/qa-activation-seal`
- Public API: `/api/qa-evidence/activation-seal`
- Downloadable brief: `/api/qa-evidence/activation-seal/brief`
- Launch Kit: `/qa-launch-kit`
- Completion Bridge: `/qa-completion-bridge`
- Claim Guard: `/qa-claim-guard`
- Proof Promotion: `/qa-proof-promotion`

## Current Safe Position

SCRIMED has an activation-ready no-secret human AAL2 synthetic QA path.

The Activation Seal remains unsealed until:

- the human AAL2 workflow run is complete;
- Completion Bridge accepts the no-secret candidate;
- protected Manual QA Evidence shows the retained packet SHA-256;
- an append-only packet audit event is visible;
- Proof Promotion returns buyer-diligence-ready;
- Claim Guard confirms language stays bounded;
- token disposal is attested;
- production clinical, PHI, reimbursement, certification, connector, and authority claims remain blocked.

## Boundary

Activation Seal is not legal approval, security certification, compliance certification, clinical authority, PHI authority, reimbursement review, production connector approval, public release approval, or production go-live approval.

Public checks can validate candidate completeness only. They cannot prove protected workspace packet visibility.

## Operating Sequence

1. Use `/qa-launch-kit` before touching a short-lived AAL2 token.
2. Complete exactly one human-run synthetic workflow.
3. Delete or rotate the temporary token secret.
4. Validate the no-secret candidate through `/qa-completion-bridge`.
5. Persist the same safe metadata through protected Manual QA Evidence.
6. Confirm `/qa-proof-promotion` sees retained packet evidence.
7. Run `/qa-claim-guard` against buyer, investor, sales, PR, or operator language.
8. Use `/qa-activation-seal` as the final buyer-proof posture check.

## Allowed Language

Allowed now:

- SCRIMED has an activation-ready no-secret human AAL2 synthetic QA path.
- SCRIMED has a public Activation Seal control that keeps buyer proof unsealed until protected packet evidence is visible.
- SCRIMED blocks live clinical care, PHI, reimbursement, security-certification, connector, and production authority claims from this QA evidence path.

Allowed only after protected packet visibility:

- SCRIMED has retained no-secret manual AAL2 synthetic QA evidence metadata for the specific workflow run.
- Buyer diligence can reference the retained packet SHA-256, workflow run ID, audit event reference, data boundary, and blocked production claims.

Never allowed from this seal alone:

- SCRIMED is authorized for live clinical care.
- SCRIMED is authorized for PHI processing.
- SCRIMED is HIPAA certified, SOC 2 certified, FDA cleared, or reimbursement guaranteed.
- SCRIMED production connectors are approved.
- SCRIMED can autonomously diagnose, treat, contact patients, or submit payer actions.
