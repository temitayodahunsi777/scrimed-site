# SCRIMED Manual AAL2 QA Run Control

Status: `manual-aal2-qa-run-control-ready`

SCRIMED Manual AAL2 QA Run Control is the operator mission-control layer for the first human-run authenticated synthetic QA workflows.

It provides:

- Workflow-specific GitHub dispatch inputs.
- Preflight and smoke command templates.
- Safe no-secret evidence payload templates.
- Abort conditions and hard stops.
- Buyer-proof promotion rules.
- Links into Execution Readiness, Launch Kit, Manual QA Evidence, Proof Promotion, and Buyer Diligence.

## Boundary

Run Control does not execute passkey ceremonies, mint tokens, store credentials, run unattended authenticated CI, process PHI, authorize clinical care, certify security or compliance, guarantee reimbursement, approve production connectors, or claim retained authenticated proof before protected no-secret evidence is persisted.

## Operator Path

1. Open `/qa-run-control`.
2. Open `/qa-launch-kit` for the single operator handoff.
3. Select the workflow brief for Sales Demo Session QA or Authority Reference QA.
4. Confirm a fresh human AAL2 session.
5. Use exactly one synthetic target.
6. Run the token preflight.
7. Dispatch the manual GitHub workflow with authenticated path required.
8. Copy only the safe IDs printed by the workflow.
9. Delete or rotate the temporary secret.
10. Persist the packet through `/pilot-workspace/access` -> Manual QA Evidence.
11. Open `/qa-proof-promotion` and confirm retained-packet promotion is allowed.
12. Export Buyer Diligence only after the retained packet hash and audit event are visible.

## Prohibited Content

Do not paste bearer tokens, refresh tokens, passwords, API keys, JWT strings, PHI, patient identifiers, payer member identifiers, artifact URLs, signed approvals, legal opinions, security reports, reimbursement determinations, source contracts, production credentials, or clinical records into any evidence field.

## Next Step

Use `/qa-launch-kit` during the first human AAL2 synthetic QA run, persist only safe packet metadata, confirm `/qa-proof-promotion`, then update Buyer Diligence and Boundary Resolution after retained proof exists.
