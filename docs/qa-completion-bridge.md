# SCRIMED QA Completion Bridge

Updated: 2026-06-22

## Purpose

QA Completion Bridge is the no-secret transition layer after a human AAL2 synthetic QA workflow completes and before SCRIMED persists buyer-proof evidence.

It validates candidate metadata, generates a packet preview hash, and confirms the operator should use the protected Manual QA Evidence route. It does not execute the workflow, store evidence, store tokens, promote buyer proof, or authorize live healthcare activity.

## Routes

- Operator page: `/qa-completion-bridge`
- Public validation API: `/api/qa-evidence/completion-bridge`
- Downloadable brief: `/api/qa-evidence/completion-bridge/brief`
- Public packet generator: `/api/qa-evidence/manual-run-packet`
- Protected persistence route: `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets`
- Proof promotion: `/qa-proof-promotion`

## Operating Sequence

1. Use `/qa-launch-kit` to run exactly one human AAL2 workflow against an explicit synthetic target.
2. Delete or rotate the temporary masked token secret after the workflow completes.
3. Copy only safe run metadata: workflow kind, run ID, run URL, timestamp, target ID, created safe object UUID, packet audit event UUID, outcome, and fixed attestations.
4. POST the candidate metadata to `/api/qa-evidence/completion-bridge`.
5. Continue only if the bridge returns `ready-for-protected-persistence`.
6. Persist the same no-secret metadata through the protected Manual QA Evidence route from the tenant workspace.
7. Verify `/qa-proof-promotion` before any Buyer Diligence export references retained authenticated QA evidence.

## Hard Boundaries

- No PHI.
- No payer member data.
- No patient identifiers.
- No bearer tokens, JWTs, refresh tokens, passwords, API keys, or credentials.
- No legal opinions, signed approvals, security reports, reimbursement determinations, source contracts, production credentials, or clinical records.
- No claim of live clinical authority, HIPAA compliance certification, SOC 2 certification, reimbursement certainty, production connector approval, or autonomous care execution.

## Next Step

After the approved tenant-admin operator completes one Launch Kit workflow, validate the no-secret candidate through QA Completion Bridge, persist the packet through protected Manual QA Evidence, then confirm Proof Promotion before exporting Buyer Diligence.
