# SCRIMED QA Human Run Packet

Status: `manual-aal2-qa-human-run-packet-ready`

SCRIMED QA Human Run Packet is the no-secret dispatch artifact for the first approved human AAL2 synthetic QA workflow.

Routes:

- `/qa-human-run-packet`
- `/api/qa-evidence/human-run-packet`
- `/api/qa-evidence/human-run-packet/brief`

## Purpose

The packet turns Launch Kit readiness into an operator-run sequence with explicit workflow kind, role, protected workspace slug, synthetic target, accepted attestations, post-run proof gates, and blocked claims.

It does not execute passkey ceremonies, mint tokens, store credentials, persist evidence, process PHI, authorize clinical care, certify security or compliance, guarantee reimbursement, approve production connectors, or claim retained authenticated QA proof.

## Accepted Candidate Metadata

- `workflowKind`: `sales-demo-session-qa` or `authority-reference-qa`
- `operatorRole`: `tenant-admin` or `pilot-lead`
- `protectedWorkspaceSlug`: lowercase synthetic workspace slug
- `syntheticTargetId`: bounded synthetic target metadata
- `plannedExecutionWindow`: bounded no-secret operator window metadata
- `dispatchAttestation`: `human-aal2-required-no-code-bypass`
- `proofBlockedAttestation`: `no-retained-proof-until-protected-packet-visible`
- `dataBoundary`: `synthetic-business-workflow-only`

## Required Sequence

1. Open `/qa-human-run-packet`.
2. Confirm a fresh human AAL2 protected workspace session.
3. Select one synthetic workflow target.
4. Create only the temporary masked workflow secret required for the run.
5. Run preflight.
6. Dispatch the manual workflow with `require_authenticated_path=true`.
7. Copy only safe metadata.
8. Delete or rotate the temporary secret.
9. Validate the no-secret result through `/qa-completion-bridge`.
10. Generate the post-run packet through `/api/qa-evidence/manual-run-packet`.
11. Persist only accepted metadata through `/pilot-workspace/access` -> Manual QA Evidence.
12. Confirm `/qa-activation-seal`, `/qa-proof-promotion`, and `/qa-claim-guard` before Buyer Diligence export.

## Boundary

The packet is a dispatch artifact, not retained authenticated proof. Packet-backed buyer language remains blocked until protected Manual QA Evidence shows packet SHA-256 and append-only audit visibility.

## Next Step

Have an approved tenant-admin or pilot-lead run exactly one synthetic workflow with this packet, persist the no-secret metadata through the protected workspace, then export Buyer Diligence only after the proof gates permit it.
