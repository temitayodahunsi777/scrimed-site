# SCRIMED Manual AAL2 QA Execution Readiness

Updated: 2026-06-21

SCRIMED exposes Manual AAL2 QA Execution Readiness at `/qa-execution-readiness`, `/api/qa-evidence/execution-readiness`, and `/api/qa-evidence/execution-readiness/brief`.

## Purpose

This layer turns the remaining authenticated QA boundary into a controlled go/no-go path. It coordinates:

- human AAL2 session confirmation
- explicit synthetic target selection
- token preflight
- manual GitHub workflow dispatch
- temporary secret disposal
- no-secret evidence packet generation
- protected workspace persistence
- Buyer Diligence export after retained packet visibility

## Boundary

This layer does not mint tokens, execute passkey ceremonies, store secrets, run unattended authenticated CI, process PHI, authorize clinical care, certify compliance, grant reimbursement certainty, approve production connectors, or claim authenticated proof before retained no-secret evidence exists.

## Claim Rules

Allowed now:

- SCRIMED has a controlled human-run AAL2 QA execution path.
- SCRIMED has no-secret packet generation and protected persistence contracts.
- Public smoke verifies fail-closed protected routes and execution-readiness boundaries.

Not allowed yet:

- SCRIMED has retained authenticated AAL2 QA proof for the pending workflows.
- SCRIMED is authorized for live clinical care, PHI processing, payer submission, production connectors, security certification, or reimbursement certainty.

## Next Step

Open `/qa-launch-kit`, use its no-secret operator handoff for the first fresh human AAL2 run, delete or rotate the temporary secret, persist only safe metadata, then export Buyer Diligence after the packet hash appears.

Before exporting, open `/qa-proof-promotion` and confirm retained-packet promotion is allowed. If the promotion state is still `pending-retained-packet`, keep buyer-facing language at activation readiness only.
