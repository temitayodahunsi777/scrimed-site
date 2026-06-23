# SCRIMED QA Human Run Packet

Status: `manual-aal2-qa-human-run-packet-ready`

Latest AAL2 Evidence Package: `retained-evidence-visible-release-review-required`

Buyer Proof Recommendation: `GO-protected-buyer-proof-release`

SCRIMED QA Human Run Packet is the no-secret dispatch artifact for the first approved human AAL2 synthetic QA workflow.

Routes:

- `/qa-human-run-packet`
- `/api/qa-evidence/human-run-packet`
- `/api/qa-evidence/human-run-packet/brief`
- `/qa-manual-execution-console`
- `/pilot-workspace/access#manual-qa-execution-console`

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
12. Refresh `/pilot-workspace/access#manual-qa-execution-console`.
13. Confirm `/qa-activation-seal`, `/qa-proof-promotion`, `/qa-claim-guard`, and `/qa-buyer-proof-release` before Buyer Diligence export.

## Boundary

The packet is the dispatch artifact. The first Authority Reference QA run now has retained no-secret protected evidence, but packet-backed buyer language must stay bounded to the retained workflow run ID, packet SHA-256, audit event reference, synthetic-only boundary, and blocked production-authority claims.

## 2026-06-22 Protected AAL2 Synthetic QA Evidence Update

Test scope:

- Clinical summary generation
- Missing-data handling
- Evidence attribution and traceability
- Escalation behavior
- Refusal behavior
- Boundary enforcement
- Human approval requirements
- Audit logging
- QA packet generation

Synthetic data confirmation: active. No PHI, live patient data, payer member data, medical records, imaging, claims, production credentials, or production connector data were entered.

Execution result:

- Workflow kind: `authority-reference-qa`
- Workspace: `scrimed-atlas-protected-pilot`
- Run Control witness: `20260622133928`
- Created authority reference ID: `3bd89df0-2b2e-42b5-8666-f382a3f153db`
- Source packet audit event ID: `b902a4fe-63ed-4c78-8206-f5ebd4c7c251`
- Manual QA evidence audit event ID: `1feb64fd-d1d4-443c-84c4-d07847bda7d8`
- Packet SHA-256: `1691df702a114a940330fd892eebae2ebeabb0e2f8a052f483a18bb7ce0543ae`
- Boundary enforcement: passed for the protected synthetic workflow.
- Human approval requirements: passed through protected AAL2 browser-session evidence capture.
- Clinical summary generation, missing-data handling, evidence attribution, escalation, refusal, audit logging, and QA packet generation: passed as synthetic QA evidence-gate categories for the retained authority-reference workflow only. This is not clinical validation or live-care authority.

Reviewer note: the first retained protected AAL2 evidence packet is visible and Buyer Proof Release passed for bounded buyer diligence. Production clinical care, PHI processing, reimbursement certainty, security certification, public claims, and connector approval remain separately gated.

GO / NO-GO: `GO-protected-buyer-proof-release`; `GO-controlled-synthetic-demo`; `NO-GO-live-clinical-care`.

## Next Step

Export Buyer Diligence from the protected workspace only with bounded retained evidence fields, then stop for human review before any public, clinical, legal, security, reimbursement, production, or customer-specific authority claim.
