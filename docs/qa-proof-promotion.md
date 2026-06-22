# SCRIMED Manual QA Proof Promotion

Status: `manual-aal2-qa-proof-promotion-gate-ready`

SCRIMED Manual QA Proof Promotion is the retained-packet gate for buyer-facing manual AAL2 synthetic QA claims.

It exposes:

- `/qa-proof-promotion`
- `/api/qa-evidence/proof-promotion`
- `/api/qa-evidence/proof-promotion/brief`

## Purpose

Proof Promotion decides when SCRIMED can move from activation-ready language to retained authenticated QA evidence language.

Before a protected no-secret packet hash is visible, buyer proof may reference:

- QA Evidence Ledger
- Execution Readiness
- Run Control
- Launch Kit
- Completion Bridge candidate validation
- fail-closed protected route checks
- no-secret packet contract
- protected persistence route

After a protected no-secret packet hash is visible, buyer proof may reference:

- workflow kind
- workflow run ID
- execution timestamp
- synthetic target ID
- created safe object UUID
- packet audit event UUID
- token disposal attestation
- packet SHA-256
- protected workspace audit visibility

## Boundary

Proof Promotion does not execute AAL2 workflows, mint tokens, store credentials, store PHI, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve production connectors, or allow authenticated-proof claims before a protected packet hash is visible.

## Hard Stops

- No retained packet hash, no retained authenticated QA proof claim.
- No bearer token, refresh token, password, credential, PHI, payer data, artifact URL, legal opinion, security report, reimbursement determination, source contract, or production credential may become evidence.
- Retained QA proof improves buyer diligence only; it does not unlock live clinical execution.

## Operator Path

1. Open `/qa-run-control`.
2. Open `/qa-launch-kit`.
3. Complete the human AAL2 workflow with exactly one synthetic target.
4. Delete or rotate the temporary token secret.
5. Validate only safe candidate metadata through `/qa-completion-bridge`.
6. Persist accepted metadata through `/pilot-workspace/access` -> Manual QA Evidence.
7. Open `/qa-proof-promotion`.
8. Confirm the state is `ready-for-buyer-diligence`.
9. Export Buyer Diligence with only safe run metadata and packet SHA-256.

## Next Step

Run the first human AAL2 Sales Demo Session QA or Authority Reference QA workflow through `/qa-launch-kit`, validate the no-secret candidate through `/qa-completion-bridge`, persist the accepted packet, then use `/qa-proof-promotion` before releasing buyer-facing retained QA proof.
