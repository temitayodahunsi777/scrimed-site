# SCRIMED QA Buyer Proof Release

Status: `manual-aal2-qa-buyer-proof-release-gate-ready`

SCRIMED QA Buyer Proof Release is the protected go/no-go gate before retained manual AAL2 synthetic QA proof may appear in Buyer Diligence.

It exposes:

- `/qa-buyer-proof-release`
- `/api/qa-evidence/buyer-proof-release`
- `/api/qa-evidence/buyer-proof-release/brief`
- `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/buyer-proof-release`
- `/qa-manual-execution-console`
- `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-execution-console`

## Purpose

Buyer Proof Release consolidates:

- retained Manual QA Evidence packet visibility
- append-only packet audit signals
- Proof Promotion
- Activation Seal
- Claim Guard
- Buyer Diligence packet routing
- hard authority boundaries

Public checks validate candidate metadata only. The protected workspace route must read retained packet and audit evidence before the decision can become `ready-for-protected-buyer-diligence-export`.

## Boundary

Buyer Proof Release does not execute AAL2 workflows, mint tokens, store credentials, store PHI, authorize public distribution, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve connectors, or grant production authority.

## Release Criteria

- Retained protected packet visible
- Proof Promotion permits buyer diligence
- Activation Seal allows buyer use
- Claim Guard keeps language bounded
- External authority remains separately gated

## Hard Stops

- Do not submit bearer tokens, refresh tokens, API keys, passwords, credentials, PHI, patient identifiers, payer member identifiers, medical records, claims, imaging, or production secrets.
- Do not claim live clinical care authority, PHI processing authority, HIPAA/SOC 2/security/FDA/regional/legal approval, reimbursement certainty, production connector approval, autonomous diagnosis, autonomous treatment, payer submission, or patient outreach.
- Do not use public-release or investor claims until qualified legal, privacy, security, clinical, finance, marketing, customer, and release-authority approvals are retained where applicable.

## Operator Path

1. Open `/qa-human-run-packet`.
2. Complete exactly one approved human AAL2 synthetic workflow.
3. Delete or rotate the temporary token secret.
4. Validate safe metadata through `/qa-completion-bridge`.
5. Persist accepted metadata through protected Manual QA Evidence.
6. Confirm `/qa-activation-seal`.
7. Confirm `/qa-proof-promotion`.
8. Run buyer-facing language through `/qa-claim-guard`.
9. Refresh `/pilot-workspace/access#manual-qa-execution-console`.
10. Open `/qa-buyer-proof-release`.
11. Run the protected route `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/buyer-proof-release`.
12. Export Buyer Diligence only when the protected decision is `ready-for-protected-buyer-diligence-export`.

## Current Safe Claim

SCRIMED has a governed synthetic QA path and a protected Buyer Proof Release gate. Retained packet proof remains unavailable for buyer diligence until a protected workspace decision reads retained packet evidence and passes all release criteria.

## Next Step

After the first approved human AAL2 run is persisted, refresh the protected Manual QA Execution Console, then use Buyer Proof Release as the final release decision before exporting Buyer Diligence.
