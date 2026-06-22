# SCRIMED Manual QA Execution Console

Status: `manual-aal2-qa-execution-console-ready`

SCRIMED Manual QA Execution Console is the protected command lane for human AAL2 synthetic QA execution, no-secret evidence capture, retained packet visibility, audit-signal review, and Buyer Proof Release readiness.

Routes:

- `/qa-manual-execution-console`
- `/api/qa-evidence/manual-execution-console`
- `/api/qa-evidence/manual-execution-console/brief`
- `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-execution-console`
- `/pilot-workspace/access#manual-qa-execution-console`

## Purpose

The console converts the remaining manual AAL2 QA boundary into an operator-visible workflow:

- confirm fresh human AAL2 protected workspace context
- select exactly one synthetic target
- use the approved Human Run Packet command templates
- dispose of temporary token material after the run
- persist only no-secret metadata through Manual QA Evidence
- refresh protected retained packet and audit visibility
- keep Buyer Proof Release locked until all release criteria pass

## Boundary

The console does not execute passkey ceremonies, mint tokens, store credentials, store PHI, run unattended authenticated CI, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve production connectors, or create public release authority.

## Protected Decision States

- `operator-aal2-run-required`: no retained packet is visible; a human AAL2 run is still required.
- `retained-evidence-visible-release-review-required`: packet metadata exists, but Buyer Proof Release still has criteria to resolve.
- `ready-for-buyer-proof-release`: retained packet and release criteria allow protected Buyer Diligence export.
- `blocked-boundary-review`: protected evidence visibility is inconsistent or unavailable.

## Operator Sequence

1. Open `/pilot-workspace/access#manual-qa-execution-console` with the tenant-admin identity.
2. Refresh the console to confirm retained packet and audit visibility.
3. Open `/qa-human-run-packet` for workflow-specific command templates.
4. Run exactly one approved synthetic workflow with `require_authenticated_path=true`.
5. Delete or rotate the temporary workflow secret.
6. Validate safe candidate metadata through `/qa-completion-bridge`.
7. Persist accepted metadata through Manual QA Evidence in the protected workspace.
8. Refresh the Manual QA Execution Console.
9. Confirm `/qa-buyer-proof-release`.
10. Export Buyer Diligence only when the protected release decision allows it.

## Hard Stops

- No fresh human AAL2 tenant governance session.
- Missing or non-synthetic target.
- Unattended, scheduled, or optional-authenticated workflow.
- Failed token preflight or long-lived credential request.
- Any evidence field includes tokens, credentials, PHI, patient identifiers, payer member identifiers, clinical records, artifact URLs, legal opinions, security reports, reimbursement determinations, or production credentials.
- Temporary token material is not deleted or rotated.
- Protected Manual QA Evidence cannot show packet SHA-256 and append-only audit visibility.
- Buyer, investor, sales, PR, or operator language claims retained proof or production authority before protected release.

## Current Safe Claim

SCRIMED has a protected operator console for human AAL2 synthetic QA execution. Packet-backed buyer proof remains locked until retained no-secret packet evidence and Buyer Proof Release pass.

## Next Step

Use the console during the first approved human AAL2 synthetic QA workflow, persist safe packet metadata, then refresh Buyer Proof Release before Buyer Diligence export.
