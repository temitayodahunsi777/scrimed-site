# SCRIMED Manual AAL2 QA Run Control

Status: `manual-aal2-qa-run-control-ready`

SCRIMED Manual AAL2 QA Run Control is the operator mission-control layer for the first human-run authenticated synthetic QA workflows.

It provides:

- Workflow-specific GitHub dispatch inputs.
- Preflight and smoke command templates.
- Safe no-secret evidence payload templates.
- Abort conditions and hard stops.
- Buyer-proof promotion rules.
- Links into Execution Readiness, Launch Kit, Human Run Packet, Completion Bridge, Manual QA Evidence, Claim Guard, Activation Seal, Proof Promotion, and Buyer Diligence.

## Boundary

Run Control does not execute passkey ceremonies, mint tokens, store credentials, run unattended authenticated CI, process PHI, authorize clinical care, certify security or compliance, guarantee reimbursement, approve production connectors, or claim retained authenticated proof before protected no-secret evidence is persisted.

## Operator Path

1. Open `/qa-run-control`.
2. Open `/qa-launch-kit` for the single operator handoff.
3. Select the workflow brief for Sales Demo Session QA or Authority Reference QA.
4. Confirm a fresh human AAL2 session.
5. Use exactly one synthetic target.
6. Validate the bounded dispatch candidate through `/qa-human-run-packet`.
7. Run the token preflight.
8. Dispatch the manual GitHub workflow with authenticated path required.
9. Copy only the safe IDs printed by the workflow.
10. Delete or rotate the temporary secret.
11. Validate the candidate metadata through `/qa-completion-bridge`.
12. Persist the accepted packet through `/pilot-workspace/access` -> Manual QA Evidence.
13. Open `/qa-activation-seal` and confirm the retained packet is not being confused with public preview evidence.
14. Open `/qa-proof-promotion` and confirm retained-packet promotion is allowed.
15. Export Buyer Diligence only after the retained packet hash and audit event are visible.

## Prohibited Content

Do not paste bearer tokens, refresh tokens, passwords, API keys, JWT strings, PHI, patient identifiers, payer member identifiers, artifact URLs, signed approvals, legal opinions, security reports, reimbursement determinations, source contracts, production credentials, or clinical records into any evidence field.

## Next Step

Use `/qa-human-run-packet` during the first human AAL2 synthetic QA run, validate the no-secret candidate through `/qa-completion-bridge`, persist only accepted packet metadata, confirm `/qa-activation-seal`, `/qa-proof-promotion`, and `/qa-claim-guard`, then update Buyer Diligence and Boundary Resolution after retained proof exists.
