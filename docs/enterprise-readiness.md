# SCRIMED Enterprise Readiness and Claims Control

Updated: 2026-06-20

SCRIMED maintains a public Trust and Enterprise Readiness Center at `/trust-center`, a controlled claims register at `/claims`, and machine-readable readiness APIs under `/api/enterprise-readiness`.

## Current Commercial Boundary

SCRIMED is sellable as a governed synthetic pilot and enterprise evaluation product. This allows SCRIMED to provide workflow intelligence assessments, AI readiness and governance audits, synthetic pilot evaluations, and clinical operations automation blueprints.

SCRIMED is not currently authorized for live clinical execution, autonomous diagnosis, treatment, payer submission, patient outreach, production record mutation, or live protected-health-information processing.

The Trust Center is an operational readiness register. It is not legal advice, a compliance certification, a regulatory determination, or authorization for production clinical use.

SCRIMED now exposes Public Market Readiness at `/public-market-readiness`, `/api/public-market-readiness`, and `/api/public-market-readiness/brief`. This surface organizes KPI definitions, unit economics, compliance logs, customer proof, margin discipline, model-efficiency controls, board cadence, and investor narrative. It helps SCRIMED prepare legally, financially, clinically, and brand-wise by requiring explicit boundaries before public or investor-facing claims. It is not audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, reimbursement assurance, clinical validation, compliance certification, or live clinical execution authorization.

Protected workspaces now expose Public Market Operator Metrics at `/api/pilot-workspaces/{workspaceSlug}/operator-metrics`. This route stores AAL2 no-PHI operating metadata for model cost, review time, delivery hours, proof-packet count, and workflow volume so SCRIMED can build unit-economics discipline before finance-reviewed dashboards. It must not be used as audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, reimbursement assurance, clinical validation, compliance certification, or live clinical execution authorization.

Protected workspaces now expose finance-reviewed Metric Rollups at `/api/pilot-workspaces/{workspaceSlug}/metric-rollups` and audited packet downloads at `/api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet`. This converts no-PHI operator captures into internal board operating snapshots and write-before-release packet evidence. It must not be used as audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, reimbursement assurance, clinical validation, compliance certification, or live clinical execution authorization.

Protected workspaces now expose Metric Trend Reviews at `/api/pilot-workspaces/{workspaceSlug}/metric-trends` and audited packet downloads at `/api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet`. This compares no-PHI rollup snapshots for monthly variance review, reach expansion planning, competitive advantage tracking, and agent improvement loops. It must not be used as audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, or live clinical execution authorization.

Protected workspaces now expose Board Scorecards at `/api/pilot-workspaces/{workspaceSlug}/board-scorecards` and audited packet downloads at `/api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet`. This converts no-PHI trend reviews into rolling-quarter board evidence, finance-allocation readiness, buyer-segment cohort strategy, competitive advantage tracking, and agent improvement priorities. It must not be used as audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, or live clinical execution authorization.

Protected workspaces now expose Finance Methodology Gates at `/api/pilot-workspaces/{workspaceSlug}/finance-methodology` and audited packet downloads at `/api/pilot-workspaces/{workspaceSlug}/finance-methodology/packet`. This records no-PHI internal readiness attestations for cost allocation, counsel external-use review, executive release, privacy/security, clinical-governance boundary, marketing claims, and buyer permission. It must not be used as audited financial reporting, legal approval, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, customer permission, or live clinical execution authorization.

Protected workspaces now expose External Approval Evidence Linkage at `/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence` and audited packet downloads at `/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence/packet`. This records bounded no-PHI metadata references to externally retained qualified approval artifacts across finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission domains. It must not be used as legal approval, audited financial reporting, securities offering material, source contract retention, signed BAA/DPA retention, customer permission, advertising substantiation, clinical validation, compliance certification, reimbursement assurance, production authorization, or live clinical execution authorization.

Protected workspaces now expose Release Decision Workflow at `/api/pilot-workspaces/{workspaceSlug}/release-decisions` and audited packet downloads at `/api/pilot-workspaces/{workspaceSlug}/release-decisions/packet`. This records no-PHI versioned claim registry decisions for buyer diligence, investor data rooms, public relations, marketing site language, sales collateral, internal board review, and case-study readiness. It can mark language ready for qualified release review only after required external approval evidence domains are linked. It must not be used as public release approval, legal advice, audited financial reporting, securities offering material, investment advice, valuation assurance, customer permission, advertising substantiation, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution authorization.

Protected workspaces now expose Named Reviewer Sign-Off Packets at `/api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs` and audited packet downloads at `/api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs/packet`. This records no-PHI metadata references to externally retained reviewer sign-offs across finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission roles. It can indicate readiness for controlled distribution review only. It must not be used as public release approval, external distribution approval, legal advice, audited financial reporting, securities offering material, investment advice, valuation assurance, customer permission, advertising substantiation, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution authorization.

SCRIMED now exposes Clinical Care Activation Readiness at `/clinical-care-activation`, `/api/clinical-care-activation`, and `/api/clinical-care-activation/brief`. This surface tracks the hard gates required before clinical execution can move beyond synthetic evaluation: intended-use and regulatory classification, licensed clinical governance, clinical safety case, customer scope, BAA/DPA and privacy review, HIPAA Security Rule safeguard mapping, production identity, PHI-ready data architecture, FHIR/HL7/DICOM/X12 connector validation, human-review authority, clinical validation, incident response, continuous monitoring, reimbursement review, patient communication/consent, and go-live rollback approval.

The activation surface is a readiness control, not a care-delivery authorization. It must not be used to imply FDA clearance, HIPAA compliance certification, clinical validation, reimbursement certainty, live connector approval, patient-facing authorization, or production clinical care readiness.

Protected workspaces now expose Clinical Activation Dossier v1 at `/api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier` and `/api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier/packet`. The dossier creates tenant-specific gate ownership, reviewer assignments, unsigned approval metadata, no-PHI evidence references, required sign-off packet inventory, go-live blockers, and rollback controls. It does not create actual legal, clinical, regulatory, privacy, security, or customer signatures; those approvals must be captured through qualified external and customer-specific processes before live care.

Protected workspaces now expose Clinical Activation Approval Workflow v1 at `/api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals` and `/api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals/packet`. The workflow persists no-PHI AAL2 readiness attestations for the dossier domains and retains the live-care blocked boundary. It is useful for buyer diligence, counsel review, clinical-governance planning, pricing confidence, and brand protection because it proves SCRIMED distinguishes readiness evidence from regulated production authorization. It does not replace external legal signatures, licensed clinical governance approval, BAA/DPA execution, FDA intended-use review, privacy/security sign-off, reimbursement review, customer go-live authorization, or connector validation.

## Controlled Domains

The readiness model tracks:

- Legal readiness
- Security readiness
- Privacy readiness
- Brand readiness
- AI and enterprise governance
- Marketing readiness
- Public relations readiness
- Sales readiness
- Advertising readiness

Every domain includes an accountable owner, current evidence, required action, launch gate, public commitments, prohibited actions, and authoritative sources where applicable.

## Claims Control

Claims have one of three states:

- `approved-current-boundary`: may be used with the required qualifier.
- `evidence-required`: requires a dated, approved evidence packet before publication.
- `prohibited`: cannot be used under the current product boundary.

SCRIMED must not make unsupported claims of HIPAA compliance, regulatory approval, certification, autonomous care, guaranteed outcomes, certified live connectors, production clinical readiness, or zero errors.

## Baseline Web Security

All application routes receive baseline response headers for content security policy, content-type protection, framing protection, referrer handling, browser permissions, and cross-origin opener isolation.

These headers are one security control. They are not a complete security program or compliance attestation.

## Required External Actions

Before protected enterprise pilots or production clinical use, SCRIMED still requires:

- qualified legal and regulatory counsel review
- approved enterprise agreement stack, including DPA and BAA where applicable
- privacy notices, processing register, retention schedule, and regional assessments
- product regulatory classification and intended-use review
- licensed clinical governance, clinical safety case, clinical validation protocol, and patient-communication/emergency-boundary approval before patient-specific care workflows
- trademark clearance, insurance decisions, and formal brand standards
- formal security program, incident response exercise, and independent penetration test
- production identity, tenant isolation, durable audit, runtime safety, and connector controls
- rate limiting, bot protection, monitoring, and abuse response before scaled public campaigns
- external CRM activation where required, campaign approval, and crisis communications workflows

## Active Sales And Governance Controls

SCRIMED now routes new no-PHI buyer intakes through deterministic governance workflow pack selection. The selected pack is attached to the durable intake payload, shown in Sales Operations, included in audited proposals, exported in CRM CSV files, and sent in the optional CRM webhook payload.

This improves diligence readiness, but it does not replace qualified legal, privacy, security, or regulatory review.

SCRIMED also exposes a Pilot Deal Room at `/pilot-deal-room`, protected opportunity packet route at `/api/sales-operations/opportunities/{intakeId}/deal-room-packet`, guarded buyer workspace provisioning at `/api/sales-operations/opportunities/{intakeId}/workspace-provisioning`, audited provisioning packets at `/api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet`, guarded tenant lifecycle activation at `/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle`, audited lifecycle packets at `/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet`, guarded production readiness preparation at `/api/sales-operations/opportunities/{intakeId}/production-readiness`, audited production readiness packets at `/api/sales-operations/opportunities/{intakeId}/production-readiness/packet`, guarded activation approvals at `/api/sales-operations/opportunities/{intakeId}/activation-approvals`, audited activation approval packets at `/api/sales-operations/opportunities/{intakeId}/activation-approvals/packet`, guarded buyer diligence rooms at `/api/sales-operations/opportunities/{intakeId}/buyer-diligence`, audited buyer diligence packets at `/api/sales-operations/opportunities/{intakeId}/buyer-diligence/packet`, guarded secure evidence vault readiness at `/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness`, audited secure evidence vault packets at `/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness/packet`, authenticated buyer demo execution path at `/api/sales-operations/opportunities/{intakeId}/demo-execution`, and non-audited operator brief at `/api/sales-operations/opportunities/{intakeId}/demo-execution/brief`. These artifacts organize public proof, protected Buyer Pilot Room routing, premium pricing posture, governance pack context, buyer-specific workspace readiness, manual invitation policy, SSO/domain posture, redirect/origin policy, invitation template approval, transactional delivery controls, access-review cadence, retention/archive controls, paid-pilot setup approval, metadata-only buyer evidence requirements, signed controls, secure evidence vault controls, target audience positioning, revenue-path evidence, retained hard blockers, demo workarounds, and next-step diligence. They remain non-binding business artifacts and do not create production authorization, legal conclusions, compliance certification, clinical validation, payer approval, automated invitation delivery, customer SSO approval, sensitive-document storage approval, upload approval, PHI authorization, live connector approval, patient outreach approval, or reimbursement guarantees.

## Routes

- `/trust-center`
- `/trust-center/[slug]`
- `/claims`
- `/api/enterprise-readiness`
- `/api/enterprise-readiness/[slug]`
- `/api/enterprise-readiness/claims`
- `/api/enterprise-readiness/diligence-brief`
- `/public-market-readiness`
- `/api/public-market-readiness`
- `/api/public-market-readiness/brief`
- `/api/pilot-workspaces/{workspaceSlug}/operator-metrics`
- `/api/pilot-workspaces/{workspaceSlug}/metric-rollups`
- `/api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet`
- `/api/pilot-workspaces/{workspaceSlug}/metric-trends`
- `/api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet`
- `/api/pilot-workspaces/{workspaceSlug}/board-scorecards`
- `/api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet`
- `/clinical-care-activation`
- `/api/clinical-care-activation`
- `/api/clinical-care-activation/brief`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier/packet`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals/packet`
- `/pilot-deal-room`
- `/api/pilot-deal-room`
