# SCRIMED QA Buyer Proof Release

Status: `manual-aal2-qa-buyer-proof-release-gate-ready`

Latest AAL2 Evidence Package: `retained-evidence-visible-release-review-required`

Current Release Recommendation: `ready-for-protected-buyer-diligence-export`

Buyer-Specific Share State: `internal-only-export-retained-until-qualified-release-chain-complete`

SCRIMED QA Buyer Proof Release is the protected go/no-go gate before retained manual AAL2 synthetic QA proof may appear in Buyer Diligence.

It exposes:

- `/qa-buyer-proof-release`
- `/api/qa-evidence/buyer-proof-release`
- `/api/qa-evidence/buyer-proof-release/brief`
- `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/buyer-proof-release`
- `/qa-manual-execution-console`
- `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-execution-console`
- `/buyer-release-control-run`
- `/api/buyer-release-control-run`
- `/api/buyer-release-control-run/brief`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/remediation`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/reconciliation`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist`

## Purpose

Buyer Proof Release consolidates:

- retained Manual QA Evidence packet visibility
- append-only packet audit signals
- Proof Promotion
- Activation Seal
- Claim Guard
- Buyer Diligence packet routing
- Buyer-specific share-readiness gates
- Buyer Release Control Runbook sequence
- hard authority boundaries

Public checks validate candidate metadata only. The protected workspace route must read retained packet and audit evidence before the decision can become `ready-for-protected-buyer-diligence-export`.

## Boundary

Buyer Proof Release does not execute AAL2 workflows, mint tokens, store credentials, store PHI, authorize public distribution, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve connectors, or grant production authority.

Buyer-specific share readiness is stricter than export creation. A retained Buyer Diligence Export is internal protected diligence evidence until the buyer-specific release chain is complete: external approval evidence references, versioned release decision, named reviewer signoffs, disabled distribution lockbox, release authority attestations, recipient attestations, and access-log reconciliation. These controls remain metadata-only and do not create release approval.

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
13. Before sending the export externally, review Buyer-Specific Share Readiness in the protected Buyer Pilot Room and complete every release-readiness gate in the approved external systems of record.
14. Use `/buyer-release-control-run` as the no-secret operator checklist for external approval references, release decision, reviewer signoffs, distribution lockbox, release authority, recipient controls, access-log reconciliation, and Buyer Diligence refresh.
15. Prefer `/pilot-workspace/access#buyer-release-control-verifier` to run `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run` with the active AAL2 browser session after the protected records are retained.
16. Load `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline` from the protected verifier panel to confirm what is durable audit evidence versus ephemeral verifier-read state.
17. Load `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/remediation` from the protected verifier panel when any gate remains blocked; use only the recommended no-PHI metadata references and keep hard approvals external.
18. Load `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/reconciliation` from the protected verifier panel to compare retained records, missing domains/roles/controls, latest audit signals, and safe metadata templates.
19. Load `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts` from the protected verifier panel to prepare draft-only no-PHI payload guidance for missing gates. Replace placeholders manually and submit through the target protected route only after qualified human review.
20. Load `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist` from the protected verifier panel to validate draft payloads against target protected write schemas before any human records them.
21. Download `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet` from the protected verifier panel to create the audited release-control chain packet before refreshing Buyer Diligence for any qualified human review.
22. When a deliberate command-line proof run is safer than browser review, use `npm run smoke:buyer-proof-operator-run` with `SCRIMED_REQUIRE_BUYER_PROOF_OPERATOR_RUN=1`, `SCRIMED_WORKSPACE_SLUG`, and a fresh short-lived `SCRIMED_BEARER_TOKEN`; retain only the resulting packet audit event ID and no-secret status fields.

## Current Safe Claim

SCRIMED has retained one no-secret protected AAL2 synthetic QA evidence packet for the Authority Reference QA workflow. Buyer diligence may reference only the workflow run ID, packet hash, audit event reference, synthetic boundary, and blocked production-authority language.

## Buyer Release Control Runbook

Status: `buyer-release-control-runbook-ready`.

The runbook is the safe workaround when the current Codex session does not have a fresh compact JWT or when CI secret handling is not the right execution path. It does not bypass AAL2. It tells the human operator exactly which protected routes to use, which no-secret metadata fields are allowed, which external artifacts must stay outside SCRIMED, and when to stop.

Required protected sequence:

1. External approval evidence references
2. Versioned release decision
3. Named reviewer signoffs
4. Disabled distribution lockbox
5. Release authority attestations
6. Recipient attestations
7. Access-log reconciliation
8. Buyer Diligence Export refresh

Current share decision remains `internal-only-until-release-chain-retained`.

Protected verifier: `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run`.

Audited chain packet: `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet`.

Release readiness timeline: `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline`.

Protected remediation plan: `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/remediation`.

Protected gate reconciliation: `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/reconciliation`.

Protected metadata drafts: `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts`.

Protected draft checklist: `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist`.

Operator run script: `scripts/buyer-proof-release-operator-run.mjs`.

Operator run command: `SCRIMED_REQUIRE_BUYER_PROOF_OPERATOR_RUN=1 SCRIMED_WORKSPACE_SLUG={workspaceSlug} SCRIMED_BEARER_TOKEN=<fresh-aal2-jwt> npm run smoke:buyer-proof-operator-run`.

Preferred operator UI: `/pilot-workspace/access#buyer-release-control-verifier`.

The remediation plan converts blocked verifier gates into sequenced operator actions, safe metadata fields, blocked data fields, no-bypass decisions, and protected route references. It does not approve release, bypass human approval, store signed artifacts, store recipient lists, store raw logs, process PHI, certify security/compliance, authorize live clinical care, or permit external buyer sharing.

The gate reconciliation layer converts the same protected chain into per-gate retained record counts, packet-audit counts, missing items, latest audit signals, and safe prefilled metadata templates. It remains read-only and does not store approval artifacts, recipient lists, raw logs, PHI, secrets, legal opinions, security reports, or customer permission artifacts.

The metadata draft layer converts missing reconciliation items into draft-only no-PHI payload guidance with target protected routes, packet routes, human-review steps, blocked data fields, and explicit no-auto-submit controls. It remains read-only and does not write records, approve release, store artifacts, store recipient lists, store raw logs, store secrets, process PHI, certify security/compliance, authorize production connectors, guarantee reimbursement, or permit live clinical execution.

The draft checklist layer validates each draft against its target protected write-schema before a human records anything. It separates schema-ready drafts from prerequisite-record blockers and draft-field corrections while remaining read-only, no-PHI, no-auto-submit, and not release approval.

## 2026-06-22 Readiness Assessment

Readiness state: `ready-for-protected-buyer-diligence-export`.

Passed controls:

- Synthetic-only QA posture remains active.
- Public AAL2 evidence package is available at `/qa-aal2-run-evidence`.
- Public AAL2 evidence API is available at `/api/qa-evidence/aal2-run-evidence`.
- Protected AAL2 evidence route is defined at `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/aal2-run-evidence`.
- Manual QA Execution Console remains the protected operator command lane.
- Completion Bridge, Claim Guard, Activation Seal, Proof Promotion, and Buyer Proof Release remain in the required sequence.
- Protected Manual QA Evidence retained workflow `20260622133928` with packet hash `1691df702a114a940330fd892eebae2ebeabb0e2f8a052f483a18bb7ce0543ae`.
- Append-only Manual QA Evidence audit event `1feb64fd-d1d4-443c-84c4-d07847bda7d8` is visible in the protected workspace.
- Protected Buyer Proof Release state is `ready-for-protected-buyer-diligence-export`.
- Buyer Pilot Room now exposes Buyer Diligence Export audit posture as retained/pending, retained export count, latest audit event ID, latest timestamp, latest actor, and next action.
- Buyer Diligence Export audit event `7de8b162-ab77-41e7-94b3-49a11172dc40` is retained in the protected workspace.
- Buyer Pilot Room now exposes Buyer-Specific Share Readiness with eight gates, latest retained signals, required human approvals, prohibited uses, and a clear internal-only/export-review state before external distribution.
- No PHI, production systems, live patient workflows, autonomous clinical action, certification claim, reimbursement certainty, or production connector approval was introduced.

Remaining blockers:

- Sales Demo Session QA remains available as a separate future authenticated evidence path.
- Buyer-room packet download audit now shows `retained`; external sharing still requires human review, customer-specific scope review, and qualified release approvals.
- Buyer-specific external sharing remains internal-only until external approval references, release decision, reviewer signoffs, distribution lockbox, release authority, recipient controls, and access-log reconciliation are complete and independently reviewed.
- Clinical validation, PHI processing authority, legal approval, regional regulatory approval, reimbursement review, security certification, production connector approval, and live clinical care authority remain unresolved external gates.
- Public, investor, PR, advertising, customer-reference, and production claims still require qualified review and retained external approval artifacts.

Required next steps:

1. Export Buyer Diligence from the protected workspace only if the current protected release state remains ready.
2. Include only workflow run ID, packet hash, audit event reference, synthetic boundary, and blocked authority language.
3. Confirm buyer-specific scope and qualified release approvals before external sharing.
4. Stop for human review before commit, push, merge, public release, customer-specific release, production use, PHI processing, or clinical authority claims.
5. Treat `qualified-share-review-ready-not-release-approval` as a final review posture only; exact release approval must remain in the approved external authority channel.
6. Run `npm run smoke:buyer-proof-operator-run` only with a fresh AAL2 token when command-line evidence is needed; otherwise use the browser operator panel and keep token material out of scripts, chat, CI, and documentation.

GO / NO-GO: `GO-protected-buyer-diligence-export`; `NO-GO-live-clinical-care`; `NO-GO-public-release-without-qualified-approval`.

## Next Step

Download the protected Buyer Diligence Export, verify the retained export-audit posture, and pause for explicit human review before any commit, push, release approval, public claim, or production escalation.
