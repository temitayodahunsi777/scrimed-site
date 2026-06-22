# SCRIMED Manual AAL2 QA Run Control

Status: `manual-aal2-qa-run-control-ready`

SCRIMED Manual AAL2 QA Run Control is the operator mission-control layer for the first human-run authenticated synthetic QA workflows.

It provides:

- Workflow-specific GitHub dispatch inputs.
- Preflight and smoke command templates.
- Safe no-secret evidence payload templates.
- Abort conditions and hard stops.
- Buyer-proof promotion rules.
- Links into Execution Readiness, Manual QA Evidence, and Buyer Diligence.

## Boundary

Run Control does not execute passkey ceremonies, mint tokens, store credentials, run unattended authenticated CI, process PHI, authorize clinical care, certify security or compliance, guarantee reimbursement, approve production connectors, or claim retained authenticated proof before protected no-secret evidence is persisted.

## Operator Path

1. Open `/qa-run-control`.
2. Select the workflow brief for Sales Demo Session QA or Authority Reference QA.
3. Confirm a fresh human AAL2 session.
4. Use exactly one synthetic target.
5. Run the token preflight.
6. Dispatch the manual GitHub workflow with authenticated path required.
7. Copy only the safe IDs printed by the workflow.
8. Delete or rotate the temporary secret.
9. Persist the packet through `/pilot-workspace/access` -> Manual QA Evidence.
10. Open `/qa-proof-promotion` and confirm retained-packet promotion is allowed.
11. Export Buyer Diligence only after the retained packet hash and audit event are visible.

## Prohibited Content

Do not paste bearer tokens, refresh tokens, passwords, API keys, JWT strings, PHI, patient identifiers, payer member identifiers, artifact URLs, signed approvals, legal opinions, security reports, reimbursement determinations, source contracts, production credentials, or clinical records into any evidence field.

## Next Step

Use `/qa-run-control` during the first human AAL2 synthetic QA run, persist only safe packet metadata, confirm `/qa-proof-promotion`, then update Buyer Diligence and Boundary Resolution after retained proof exists.
