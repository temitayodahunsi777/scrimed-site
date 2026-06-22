# SCRIMED Manual AAL2 QA Launch Kit

Status: `manual-aal2-qa-launch-kit-ready`

SCRIMED Manual AAL2 QA Launch Kit is the no-secret operator handoff for the first human-run authenticated synthetic QA workflows.

It exposes:

- `/qa-launch-kit`
- `/api/qa-evidence/launch-kit`
- `/api/qa-evidence/launch-kit/brief`

## Purpose

The Launch Kit packages the final human-run workflow handoff before authenticated QA evidence can exist.

It includes:

- workflow dispatch inputs
- temporary secret names
- preflight command templates
- smoke command templates
- safe evidence packet templates
- post-run safe-copy fields
- secret-disposal requirements
- protected persistence routes
- QA Human Run Packet dispatch validation
- QA Completion Bridge validation
- Claim Guard and Activation Seal checks
- Proof Promotion checks
- blocked production and clinical claims

## Boundary

The Launch Kit does not execute passkey ceremonies, mint tokens, store credentials, store PHI, run unattended authenticated CI, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve production connectors, or claim retained authenticated QA proof before protected no-secret packet hashes are visible.

## Operator Sequence

1. Open `/qa-launch-kit`.
2. Confirm a fresh approved human AAL2 browser session.
3. Select exactly one synthetic target.
4. Create only the workflow-specific temporary masked GitHub Actions secret.
5. Open `/qa-human-run-packet` and validate the bounded dispatch candidate.
6. Run the workflow preflight.
7. Dispatch the manual workflow with `require_authenticated_path=true`.
8. Copy only safe IDs and timestamps.
9. Delete or rotate the temporary secret.
10. Validate the no-secret candidate metadata through `/qa-completion-bridge`.
11. Generate and persist the no-secret evidence packet through `/pilot-workspace/access` -> Manual QA Evidence only after the bridge accepts it.
12. Open `/qa-activation-seal`.
13. Open `/qa-proof-promotion`.
14. Export Buyer Diligence only after the retained packet hash and audit event are visible.

## Hard Stops

- Do not run without a fresh human AAL2 session.
- Do not use production patient, payer, EHR, imaging, device, or claims data.
- Do not paste tokens, credentials, PHI, patient identifiers, payer member identifiers, artifact URLs, legal opinions, source contracts, security reports, reimbursement determinations, or clinical records into evidence.
- Do not claim retained authenticated QA proof before packet hash visibility.
- Do not convert retained synthetic QA evidence into live clinical care, PHI, reimbursement, security-certification, connector, or production authority.

## Next Step

Have an approved tenant-admin operator use `/qa-human-run-packet` to dispatch one workflow with a fresh short-lived AAL2 token, validate safe metadata through `/qa-completion-bridge`, persist only accepted metadata, then confirm `/qa-activation-seal`, `/qa-proof-promotion`, and `/qa-claim-guard` before exporting Buyer Diligence.
