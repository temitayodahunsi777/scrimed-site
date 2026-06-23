# SCRIMED Boundary Resolution Register

Updated: 2026-06-23

SCRIMED exposes the Boundary Resolution Register at `/boundary-resolution`, `/api/boundary-resolution`, and `/api/boundary-resolution/brief`.

The register aggregates known limits from:

- Clinical Authority Readiness
- Clinical Care Activation
- Persistent Agent Workspace limitations
- QA Evidence Ledger, Manual AAL2 Activation Plan, Execution Readiness, Run Control, Launch Kit, Human Run Packet, Manual QA Execution Console, Completion Bridge, Claim Guard, Activation Seal, Proof Promotion, and Buyer Proof Release
- Public Market Readiness limitations

## Operating Purpose

The register exists to keep hard boundaries visible, owned, and actionable. A boundary is considered addressed only when it has:

- a current control
- a safe workaround
- an accountable owner path
- proof routes
- a retained gate before higher-risk use
- prohibited claims that must not be made

## Current Boundary

The register does not authorize live clinical care, PHI processing, legal approval, regional regulatory approval, reimbursement certainty, security certification, production clinical authorization, autonomous clinical decisions, patient outreach, payer submission, EHR writeback, public customer claims, or securities offering material.

## 2026-06-22 AAL2 Synthetic QA Boundary Inventory

Validation status:

- No PHI: validated for this evidence package; no production PHI or regulated identifiers were entered.
- No live patient data: validated for this evidence package; synthetic-only posture remains active.
- No live clinical care authority: validated; all clinical execution remains blocked.
- No autonomous clinical execution: validated; human review remains required.
- No reimbursement certainty claim: validated; reimbursement authority remains false.
- No HIPAA certification claim: validated; HIPAA readiness posture is not certification.
- No SOC certification claim: validated; SOC readiness posture is not certification.
- No FDA clearance/certification claim: validated; no FDA authority is claimed.
- No security certification claim: validated; independent certification remains external-review required.
- No production connector approval: validated; connector work remains approval-gated.
- Buyer proof release: validated for protected buyer diligence only; Buyer Proof Release passed after retained no-secret AAL2 evidence became visible. This does not authorize public release, production use, PHI processing, clinical care, reimbursement, security certification, or connector activation.

Unresolved risks:

- Sales Demo Session QA remains a separate future authenticated evidence path.
- Buyer-room packet download audit should be captured before sending any diligence packet externally.
- Buyer release-control blocked gates should be remediated through `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/remediation`, reconciled through `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/reconciliation`, prepared through `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts`, and schema-prechecked through `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist` using no-PHI metadata references only.
- Retained synthetic QA category evidence is bounded to the Authority Reference QA workflow and does not create clinical validation.
- Legal, privacy, security, regulatory, reimbursement, connector, regional, customer go-live, and production clinical approvals remain outside this QA package.

Recommended mitigations:

- Use retained workflow `20260622133928`, packet hash `1691df702a114a940330fd892eebae2ebeabb0e2f8a052f483a18bb7ce0543ae`, and audit event `1feb64fd-d1d4-443c-84c4-d07847bda7d8` only inside protected buyer diligence.
- Download Buyer Diligence only after protected review and retain the packet-download audit event.
- Keep all public, buyer, investor, sales, marketing, PR, and advertising claims routed through `/qa-claim-guard` and qualified approval workflows.

## Operator Rule

Use the register as the central no-secret operating map before buyer conversations, investor diligence, clinical authority review, protected pilot escalation, or production-readiness planning.

Do not treat a safe workaround as external approval. If a record says `human-aal2-required`, `customer-specific-required`, `external-approval-required`, or `blocked-before-approval`, keep the gate closed until retained evidence exists.

## Next Step

Use `/qa-aal2-run-evidence` as the buyer-safe AAL2 QA evidence package, `/qa-claim-guard` to keep buyer and external language inside current evidence, `/qa-manual-execution-console` to coordinate protected operator state, `/qa-activation-seal` to confirm final seal posture, `/qa-proof-promotion` to gate retained packet language, `/qa-buyer-proof-release` to keep protected Buyer Diligence bounded to retained no-secret proof, `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/remediation` to sequence blocked buyer release-control gates, `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/reconciliation` to expose missing gate evidence without storing sensitive approval artifacts, `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts` to prepare draft-only no-PHI payload guidance without writing records or approving release, and `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist` to validate draft payloads against protected write schemas before human recording.
