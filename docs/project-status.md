# SCRIMED Project Status

Updated: 2026-06-21

## Latest Manual AAL2 QA Execution Readiness Release

- Added `/qa-execution-readiness`, `/api/qa-evidence/execution-readiness`, and `/api/qa-evidence/execution-readiness/brief` as the no-secret go/no-go layer for the remaining human AAL2 QA workflows.
- Added execution stages for human AAL2 session confirmation, explicit synthetic target selection, token preflight, authenticated smoke, secret disposal, no-secret packet persistence, and Buyer Diligence export sequencing.
- Added workflow readiness for Sales Demo Session QA and Authority Reference QA with dispatch path, preflight script, smoke script, target input, temporary secret name, safe evidence fields, hard stops, and retained evidence requirements.
- Updated `/qa-evidence`, `/product`, Product Readiness Brief, Product Console proof stack, Boundary Resolution proof routes, and public smoke coverage with manual AAL2 QA execution readiness.
- Preserved the boundary: execution readiness does not mint tokens, execute passkey ceremonies, bypass AAL2, store secrets, store PHI, run unattended authenticated CI, certify compliance, grant reimbursement certainty, authorize production connectors, authorize live clinical care, or claim authenticated proof before retained no-secret evidence exists.

## Latest Boundary Resolution Register Release

- Added `/boundary-resolution`, `/api/boundary-resolution`, and `/api/boundary-resolution/brief` as SCRIMED's cross-system boundary register for clinical authority, clinical care activation, PHI, legal, regional, reimbursement, security, QA, public-market, and production-readiness limits.
- Aggregated Clinical Authority Readiness domains, Clinical Care Activation gates, Persistent Agent Workspace limitation resolutions, QA Evidence Ledger manual AAL2 gates, and Public Market Readiness limitations into one no-secret register with state, owner, control, workaround, proof routes, retained gate, next action, and prohibited claims.
- Updated Product Console and Product Readiness Brief with boundary record counts, human AAL2 gates, external gates, safe workaround counts, and proof-stack entries.
- Added public smoke coverage for the Boundary Resolution page, API, brief, no-authority headers, Product Console proof-stack posture, record coverage, and human AAL2 visibility.
- Preserved the boundary: this register addresses known boundaries operationally, but it does not authorize live clinical care, PHI processing, legal approval, regional regulatory approval, reimbursement certainty, security certification, production clinical authorization, autonomous clinical decisions, patient outreach, payer submission, EHR writeback, public customer claims, or securities offering material.

## Latest Buyer Diligence QA Activation Posture Release

- Added the Manual AAL2 QA Evidence Activation Plan into protected Buyer Pilot Room summaries and audited Buyer Diligence Exports.
- Updated Buyer Diligence controls so missing retained manual QA packets now show the activation workflow count, safe evidence path, completion criteria, and remaining human AAL2 gate instead of a vague empty state.
- Added protected Buyer Pilot Room UI coverage for Sales Demo Session QA activation and Authority Reference QA activation with target inputs, temporary secret names, safe evidence fields, and buyer diligence impact.
- Updated Buyer Diligence export Markdown with a dedicated `Manual AAL2 QA Activation Plan` section, activation brief route, completion criteria, workflow paths, safe-copy fields, and retained boundary.
- Preserved the boundary: this is buyer-safe activation posture only. It does not mint tokens, execute authenticated QA, store bearer tokens, store PHI, authorize live clinical execution, certify compliance, grant reimbursement certainty, or replace the required human AAL2 run.

## Latest Manual AAL2 QA Evidence Activation Plan Release

- Added `GET /api/qa-evidence/activation-plan` and `GET /api/qa-evidence/activation-plan/brief` as a no-secret operator activation layer for the remaining human AAL2 QA gates.
- Added typed activation workflows for Sales Demo Session QA and Authority Reference QA with workflow paths, preflight scripts, smoke scripts, target inputs, temporary secret names, safe evidence fields, prohibited inputs, operator steps, persistence target, Buyer Diligence impact, and retained boundaries.
- Updated `/qa-evidence`, `/api/qa-evidence`, `/api/qa-evidence/brief`, Product Console proof stack, Product Readiness Brief, and public smoke coverage with `manual-aal2-qa-evidence-activation-plan-ready`.
- Fixed manual evidence packet downloads so Authority Reference QA packets use an authority-reference filename instead of the sales-demo filename.
- Preserved the boundary: the activation plan coordinates human-run QA only. It does not mint tokens, execute passkey ceremonies, bypass AAL2, store secrets, store PHI, certify compliance, grant security approval, create reimbursement certainty, authorize production connectors, or enable live clinical care.

## Latest Authority Reference QA Evidence Bridge Release

- Added manual-only GitHub Actions workflow `.github/workflows/authority-reference-qa-smoke.yml` for protected Authority Reference QA execution against a short-lived AAL2 operator token and explicit workspace slug.
- Added `scripts/authority-artifact-reference-qa-token-preflight.mjs` and `npm run smoke:authority-reference-qa:preflight` to validate JWT shape, AAL2 posture, session claim, expiry, minted lifetime, and workspace targeting before any authenticated request is sent.
- Extended the Authority Reference QA smoke so a passing authenticated run prints only safe evidence fields: workflow kind, workspace target, created authority reference UUID, and packet audit event UUID.
- Extended Manual QA Evidence capture in `/pilot-workspace/access` to support both Sales Demo Session QA and Authority Reference QA without changing the protected evidence table or storing secrets.
- Updated `POST /api/qa-evidence/manual-run-packet`, the Product Console proof stack, and public smoke coverage with `authority-reference-qa-evidence-bridge-ready`.
- Preserved the boundary: authenticated Authority Reference QA still requires a human-run short-lived AAL2 token. SCRIMED now provides the safe CI path, preflight, no-secret evidence bridge, and protected persistence process, but it does not store tokens, artifacts, URLs, PHI, signed approvals, legal opinions, security reports, reimbursement determinations, certification evidence, production approvals, or live clinical authority.

## Latest Protected Authority Renewal Queue And QA Harness Release

- Added the protected Authority Artifact Renewal Queue as a risk-ranked operating layer inside `/pilot-workspace/access#authority-artifact-references`.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue` for AAL2 tenant-scoped, no-PHI renewal queue reads derived from existing authority checklist and reference records.
- Added `aal2-authority-renewal-queue-no-artifact-storage` and `aal2-authority-reference-qa-harness-token-boundary` to the Product Console proof stack.
- Added `scripts/authority-artifact-reference-qa-smoke.mjs` and `npm run smoke:authority-reference-qa` so operators can verify fail-closed behavior, authenticated synthetic metadata recording, renewal queue derivation, audited packet download, and token-disposal reminders.
- Updated the protected workspace panel and authority-reference packet so buyers and operators can see blocked, urgent, and scheduled renewal actions without storing artifacts or expanding live-care authority.
- Preserved the boundary: the renewal queue and QA harness are operational readiness controls only. They do not store artifacts, URLs, PHI, credentials, signed approvals, legal opinions, security reports, clinical validation artifacts, reimbursement determinations, certification evidence, production approvals, or live clinical authority.

## Previous Protected Authority Artifact References Release

- Added Protected Authority Artifact References inside `/pilot-workspace/access#authority-artifact-references`.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references` and `POST /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references` for AAL2 tenant-scoped, no-PHI, metadata-only external authority artifact reference status capture.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet` for audited Markdown reference-status packet downloads through the existing write-before-release proof-packet audit path.
- Added `app/lib/protectedAuthorityArtifactReferences.ts`, `ProtectedAuthorityArtifactReferencePanel`, guarded store helpers, and Supabase migration `20260621120000_protected_authority_artifact_references.sql` with RLS, strict forbidden-content checks, guarded RPC writes, and append-only audit event `protected-authority-artifact-reference-recorded`.
- Updated protected workspace UI, Product Console proof stack, Hub route catalog, clinical authority evidence packs, readiness CTA, protected workspace runbook, and public smoke checks with `aal2-authority-artifact-reference-status-capture-no-artifact-storage` and `aal2-audited-authority-artifact-reference-status-packet-no-artifact-storage`.
- Preserved the boundary: the ledger records sanitized reference metadata only. It does not store artifacts, URLs, PHI, signed approvals, legal opinions, security reports, clinical validation artifacts, reimbursement determinations, certification evidence, production approvals, or live clinical authority.

## Previous Protected Clinical Authority Artifact Intake Checklist Release

- Added the Protected Clinical Authority Artifact Intake Checklist inside `/pilot-workspace/access#clinical-authority-artifact-intake`.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake` for AAL2 tenant-scoped, no-PHI external artifact intake criteria derived from the protected Clinical Authority Owner Matrix.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake/packet` for audited Markdown checklist downloads through the existing write-before-release proof-packet audit path.
- Added `app/lib/protectedClinicalAuthorityArtifactIntake.ts` with required external systems of record, qualified reviewer roles, validation timestamps, expiration cadences, prohibited content, acceptance criteria, and safe workarounds for every live-care, PHI, legal, regional, reimbursement, security, connector, and production authority gate.
- Updated protected workspace UI, Product Console proof stack, Hub route catalog, clinical authority evidence packs, README, roadmap/runbooks, and public smoke checks with `aal2-clinical-authority-artifact-intake-checklist-no-phi` and `aal2-audited-clinical-authority-artifact-intake-checklist-packet-no-phi`.
- Preserved the boundary: the checklist records metadata criteria only. It does not store artifacts, PHI, signed contracts, signatures, legal opinions, security reports, reimbursement decisions, regional approvals, certification evidence, connector approvals, production approvals, or live clinical authority.

## Latest Protected Clinical Authority Owner Matrix Release

- Added the Protected Clinical Authority Owner Matrix inside `/pilot-workspace/access#clinical-authority-owner-matrix`.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix` for AAL2 tenant-scoped, no-PHI approver-role routing derived from the protected Clinical Authority Evidence Room.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix/packet` for audited Markdown owner-matrix packet downloads through the existing write-before-release proof-packet audit path.
- Added `app/lib/protectedClinicalAuthorityOwnerMatrix.ts` with customer, SCRIMED, and qualified external owner roles for live-care, PHI, legal, regional, reimbursement, security, connector, and production authority gates.
- Updated protected workspace UI, Product Console proof stack, Hub route catalog, clinical authority evidence packs, README, roadmap, protected workspace runbook, and public smoke checks with `aal2-clinical-authority-owner-matrix-no-phi` and `aal2-audited-clinical-authority-owner-matrix-packet-no-phi`.
- Preserved the boundary: owner labels are metadata-only routing records. They do not store signatures, contracts, PHI, legal opinions, security reports, reimbursement decisions, certifications, regional approvals, production credentials, connector approvals, or live clinical authority.

## Latest Protected Clinical Authority Evidence Room Release

- Added the Protected Clinical Authority Evidence Room inside `/pilot-workspace/access#clinical-authority-evidence-room`.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room` for AAL2 tenant-scoped, no-PHI authority evidence assembly.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room/packet` for audited Markdown authority evidence packet downloads through the existing write-before-release proof-packet audit path.
- Added `app/lib/protectedClinicalAuthorityEvidenceRoom.ts` to consolidate clinical authority readiness domains, clinical activation dossier posture, clinical activation approval workflow posture, protected external approval evidence, provider security reviews, procurement evidence registry, audit history, reviewer ownership, retained gates, expiration posture, and safe workarounds.
- Updated protected pilot workspace UI, Product Console proof stack, Hub routes, clinical authority readiness routing, README, roadmap, protected workspace runbook, and public smoke checks with `aal2-clinical-authority-evidence-room-no-phi` and `aal2-audited-clinical-authority-evidence-room-packet-no-phi`.
- Preserved the boundary: the room assembles metadata-only readiness evidence and does not authorize live clinical care, PHI processing, diagnosis, treatment, prescribing, patient outreach, medical-record mutation, payer submission, legal approval, regulatory approval, reimbursement certainty, security certification, regional launch, production connector activation, or production clinical authorization.

## Latest Clinical Authority Readiness Release

- Added `/clinical-authority-readiness`, `/api/clinical-authority-readiness`, and `/api/clinical-authority-readiness/brief` as SCRIMED's hard-gate authority readiness layer.
- Added `app/lib/clinicalAuthorityReadiness.ts` with authority domains for live clinical care authority, PHI/ePHI processing, legal approval, regional regulatory approval, reimbursement review, security certification, production clinical authorization, and certified health IT connector approval.
- Added boundary-resolution workarounds for live care, PHI, legal approval, regional approval, reimbursement certainty, security certification, and production clinical authorization while retaining signed external approval gates.
- Added evidence-pack routing into protected no-PHI clinical activation dossier, external approval evidence, provider security review, procurement evidence registry, and public authority readiness brief surfaces.
- Updated Product Console, Hub, homepage, Clinical Care Activation, README, roadmap, and public smoke checks with `clinical-authority-readiness-hard-gates-contained` and `clinical-authority-readiness-brief-no-authority-claim`.
- Preserved the boundary: this layer prepares evidence and operating paths only. It is not legal advice, privacy advice, reimbursement advice, security certification, clinical validation, regional regulatory approval, PHI processing authority, production authorization, or live clinical-care authority.

## Latest Global Partner And Buyer Localization Release

- Added `/global-reach`, `/api/global-reach`, and `/api/global-reach/brief` as SCRIMED's Global Partner and Buyer Localization Layer.
- Added `app/lib/globalPartnerLocalization.ts` with region focus packs for the United States, UAE, Saudi Arabia, Kuwait, Nigeria, Kenya, Rwanda, Ghana, and Europe.
- Added buyer localization packs for provider health systems, payers, governments and public health, life sciences and research, employers, global channel partners, and investor or board reviewers.
- Added partner-channel paths, global competitive edges, activation sequence, and boundary-resolution workarounds for legal/privacy, PHI, clinical authority, security procurement, finance claims, localization, partner authority, and PR or advertising release.
- Updated Product Console, Hub, homepage, Market Activation, README, roadmap, and public smoke checks with `global-partner-localization-layer-ready` and `global-partner-localization-brief-ready-no-legal-advice`.
- Preserved the boundary: Global Reach is localization and go-to-market readiness only. It is not legal advice, privacy advice, tax advice, regional regulatory approval, public-sector procurement approval, reimbursement assurance, compliance certification, clinical validation, production authorization, partner authority, or live clinical execution.

## Latest Protected Procurement Evidence Registry Release

- Added Protected Procurement Evidence Registry inside `/pilot-workspace/access` after Provider Security Review Workbench.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/procurement-evidence` for AAL2 metadata-only routing across security questionnaires, privacy questionnaires, legal procurement, vendor risk, technical diligence, commercial procurement, data governance, and implementation readiness.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/procurement-evidence/packet` for audited procurement evidence registry packet downloads.
- Added `app/lib/protectedProcurementEvidenceRegistry.ts` with typed buyer audiences, procurement domains, evidence classes, risk tiers, required procurement controls, no-sensitive-artifact validation, provider-security-review readiness linkage, target audience expansion, competitive edge signals, safe workarounds, and packet generation.
- Added `public.protected_procurement_evidence_registry` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-procurement-evidence-recorded` audit events, and runtime schema `2026-06-20.10`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, hub/home navigation, docs, and public smoke coverage with `aal2-procurement-evidence-registry-no-sensitive-artifacts` and `aal2-audited-procurement-evidence-registry-packets-no-sensitive-artifacts`.
- Preserved the boundary: this layer stores procurement routing metadata only and keeps questionnaire answers, SOC reports, penetration-test reports, vulnerability reports, source contracts, signed legal artifacts, credentials, URLs, PHI, external distribution, procurement approval, production authorization, reimbursement assurance, compliance certification, and live clinical execution disabled.

## Latest Protected Provider Security Review Workbench Release

- Added Protected Provider Security Review Workbench inside `/pilot-workspace/access` after Evidence Room Provider Adapter Contracts.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/provider-security-reviews` for AAL2 no-PHI metadata references to externally retained security, privacy, BAA/DPA, credential-handling, incident-response, retention/residency, vendor-risk, and go-live rollback review.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/provider-security-reviews/packet` for audited provider security review packet downloads.
- Added `app/lib/protectedProviderSecurityReviews.ts` with typed review domains, risk tiers, required security controls, no-sensitive-artifact validation, provider-adapter readiness linkage, safe workarounds, and packet generation.
- Added `public.protected_provider_security_reviews` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-provider-security-review-recorded` audit events, and runtime schema `2026-06-20.9`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-provider-security-review-workbench-no-phi` and `aal2-audited-provider-security-review-packets-no-phi`.
- Preserved the boundary: this layer stores provider security review metadata only and keeps PHI processing, credential storage, signed agreement storage, live integration, production authorization, public release, external distribution, reimbursement assurance, compliance certification, and live clinical execution disabled.

## Latest Protected Evidence Room Provider Adapter Contracts Release

- Added protected Evidence Room Provider Adapter Contracts inside `/pilot-workspace/access` after Evidence Room Access Log Reconciliation.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/evidence-room-provider-adapters` for AAL2 no-PHI metadata references to externally retained evidence-room provider contracts, adapter design references, and audit-log import stubs.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/evidence-room-provider-adapters/packet` for audited provider-adapter packet downloads.
- Added `app/lib/protectedEvidenceRoomProviderAdapters.ts` with typed provider classes, disabled integration modes, supported audit-log summary formats, risk-tier handling, access-log reconciliation linkage, no-credential validation, safe workarounds, and packet generation.
- Added `public.protected_evidence_room_provider_adapters` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-evidence-room-provider-adapter-recorded` audit events, and runtime schema `2026-06-20.8`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-evidence-room-provider-adapter-contracts-disabled-no-phi` and `aal2-audited-evidence-room-provider-adapter-packets-no-phi`.
- Preserved the boundary: this layer stores provider-adapter metadata only and keeps integration and export disabled. It does not store PHI, patient identifiers, payer member data, raw access logs, recipient identifiers, provider credentials, URLs, tokens, source contracts, signed BAAs/DPAs, legal opinions, sensitive artifacts, public release approval, external distribution approval, live integration approval, compliance certification, production authorization, reimbursement assurance, or live clinical execution.

## Latest Protected Evidence Room Access Log Reconciliation Release

- Added protected Evidence Room Access Log Reconciliation inside `/pilot-workspace/access` after Evidence Room Recipient Attestations.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation` for AAL2 no-PHI metadata references to externally retained evidence-room access logs, reconciliation windows, event-count summaries, anomaly posture, and revocation review.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation/packet` for audited access-log reconciliation packet downloads.
- Added `app/lib/protectedEvidenceRoomAccessLogReconciliation.ts` with typed reconciliation scopes, no-raw-log validation, recipient-attestation readiness linkage, export-disabled state, safe workarounds, and packet generation.
- Added `public.protected_evidence_room_access_log_reconciliations` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-evidence-room-access-log-reconciliation-recorded` audit events, and runtime schema `2026-06-20.7`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-evidence-room-access-log-reconciliation-disabled-no-phi` and `aal2-audited-evidence-room-access-log-reconciliation-packets-no-phi`.
- Preserved the boundary: this layer stores access-log reconciliation metadata only and keeps export disabled. It does not store raw access logs, recipient identifiers, recipient emails, exact recipient lists, IP addresses, device identifiers, access grants, signed approvals, legal opinions, customer permission artifacts, public release approval, external distribution approval, audited financial reporting, securities materials, advertising substantiation, clinical validation, compliance certification, production authorization, reimbursement assurance, or live clinical execution.

## Latest Protected Evidence Room Recipient Attestations Release

- Added protected Evidence Room Recipient Attestations inside `/pilot-workspace/access` after Release Authority Attestations.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations` for AAL2 no-PHI metadata references to intended recipient segments, evidence-room references, packet references, access windows, and revocation posture.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations/packet` for audited recipient attestation packet downloads.
- Added `app/lib/protectedEvidenceRoomRecipientAttestations.ts` with typed recipient segments, no-recipient-list validation, release-authority readiness linkage, export-disabled state, safe workarounds, and packet generation.
- Added `public.protected_evidence_room_recipient_attestations` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-evidence-room-recipient-attestation-recorded` audit events, and runtime schema `2026-06-20.6`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-evidence-room-recipient-attestations-disabled-no-phi` and `aal2-audited-evidence-room-recipient-attestation-packets-no-phi`.
- Preserved the boundary: this layer stores recipient metadata only and keeps export disabled. It does not store exact recipient lists, recipient emails, access grants, signed approvals, legal opinions, customer permission artifacts, public release approval, external distribution approval, audited financial reporting, securities materials, advertising substantiation, clinical validation, compliance certification, production authorization, reimbursement assurance, or live clinical execution.

## Latest Protected Release Authority Attestations Release

- Added protected Release Authority Attestations inside `/pilot-workspace/access` after Distribution Lockbox.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/release-authority-attestations` for AAL2 no-PHI metadata references to externally retained counsel, customer permission, executive, privacy/security, finance, clinical-governance, and marketing-claims authority.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/release-authority-attestations/packet` for audited release authority attestation packet downloads.
- Added `app/lib/protectedReleaseAuthorityAttestations.ts` with typed authority domains, metadata-only validation, lockbox readiness linkage, release-disabled state, safe workarounds, and packet generation.
- Added `public.protected_release_authority_attestations` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-release-authority-attestation-recorded` audit events, and runtime schema `2026-06-20.5`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-external-release-authority-attestations-disabled-no-phi` and `aal2-audited-release-authority-attestation-packets-no-phi`.
- Preserved the boundary: this layer stores metadata references only and keeps release disabled. It does not approve public release, external distribution, legal claims, audited financial reporting, securities materials, customer references, advertising substantiation, clinical validation, compliance certification, production authorization, reimbursement assurance, or live clinical execution.

## Latest Protected Distribution Lockbox Release

- Added protected Distribution Lockbox inside `/pilot-workspace/access` after Named Reviewer Sign-Off Packets.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/distribution-lockbox` for AAL2 no-PHI disabled-by-default metadata records linked to externally retained reviewer sign-offs, customer permission references, counsel review references, and artifact manifest locators.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/distribution-lockbox/packet` for audited protected lockbox packet downloads.
- Added `app/lib/protectedDistributionLockbox.ts` with typed audiences, channel controls, disabled distribution validation, sign-off coverage, release authorities, workflow derivation, safe workarounds, and packet generation.
- Added `public.protected_distribution_lockboxes` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-distribution-lockbox-recorded` audit events, and runtime schema `2026-06-20.4`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-external-distribution-lockbox-disabled-no-phi` and `aal2-audited-distribution-lockbox-packets-no-phi`.
- Preserved the boundary: the lockbox is metadata-only and distribution-disabled. It does not approve public release, external distribution, legal claims, audited financial reporting, securities materials, customer references, advertising substantiation, clinical validation, compliance certification, production authorization, or live clinical execution.

## Latest Protected Named Reviewer Sign-Off Packets Release

- Added protected Named Reviewer Sign-Off Packets inside `/pilot-workspace/access` after Release Decision Workflow.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs` for AAL2 no-PHI metadata references to externally retained finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission reviewer sign-offs.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs/packet` for audited named reviewer sign-off packet downloads.
- Added `app/lib/protectedNamedReviewerSignoffs.ts` with typed reviewer roles, claim-version linkage, expiry checks, controlled distribution review state, release authorities, workflow derivation, safe workarounds, and packet generation.
- Added `public.protected_named_reviewer_signoffs` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-named-reviewer-signoff-recorded` audit events, and runtime schema `2026-06-20.3`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-named-reviewer-signoff-metadata-no-phi` and `aal2-audited-named-reviewer-signoff-packets-no-phi`.
- Preserved the boundary: this layer stores metadata references only and can indicate readiness for controlled distribution review. It does not approve public release, external distribution, legal claims, audited financial reporting, securities materials, customer references, advertising substantiation, clinical validation, compliance certification, production authorization, or live clinical execution.

## Latest Protected Release Decision Workflow Release

- Added protected Release Decision Workflow inside `/pilot-workspace/access` after External Approval Evidence Linkage.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/release-decisions` for AAL2 no-PHI versioned claim registry release decisions across buyer diligence, investor data room, PR, marketing site, sales collateral, board, and case-study audiences.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/release-decisions/packet` for audited release decision claim registry packet downloads.
- Added `app/lib/protectedReleaseDecisionWorkflow.ts` with typed audiences, claim categories, validation, approval-domain coverage, release authorities, workflow derivation, safe workarounds, and packet generation.
- Added `public.protected_release_decisions` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-release-decision-recorded` audit events, and runtime schema `2026-06-20.2`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-qualified-release-decision-workflow-no-phi` and `aal2-audited-release-decision-claim-registry-packets-no-phi`.
- Preserved the boundary: this layer can mark claims ready for qualified release review only. It does not approve public release, legal claims, audited financial reporting, securities materials, customer references, advertising substantiation, clinical validation, compliance certification, production authorization, or live clinical execution.

## Latest Protected External Approval Evidence Linkage Release

- Added protected External Approval Evidence Linkage inside `/pilot-workspace/access` after Protected Finance Methodology Gates.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/external-approval-evidence` for AAL2 no-PHI metadata references to externally retained finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission approval artifacts.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/external-approval-evidence/packet` for audited external approval evidence linkage packet downloads.
- Added `app/lib/protectedExternalApprovalEvidence.ts` with typed domains, validation, metadata-only reference boundaries, external storage authority, release blockers, workflow derivation, safe workarounds, and packet generation.
- Added `public.protected_external_approval_evidence_references` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-external-approval-evidence-recorded` audit events, and runtime schema `2026-06-20.1`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-qualified-external-approval-evidence-links-no-phi` and `aal2-audited-external-approval-evidence-link-packets-no-phi`.
- Preserved the boundary: this layer stores bounded reference metadata only. It does not store PHI, source contracts, signed BAAs/DPAs, legal opinions, audited financials, securities material, customer permission artifacts, advertising substantiation, clinical validation, compliance certification, production authorization, or live clinical execution approval.

## Latest Protected Finance Methodology Gates Release

- Added protected Finance Methodology Gates inside `/pilot-workspace/access` after Protected Board Scorecards.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/finance-methodology` for AAL2 no-PHI finance cost-allocation, counsel external-use, executive release, privacy/security, clinical-governance boundary, marketing-claims, and buyer-permission gate records.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/finance-methodology/packet` for audited protected finance methodology gate packet downloads.
- Added `app/lib/protectedFinanceMethodology.ts` with typed gate catalog, validation, external-use authority boundaries, workflow derivation, safe workarounds, and packet generation.
- Added `public.protected_finance_methodology_gates` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-finance-methodology-gate-recorded` audit events, and runtime schema `2026-06-19.6`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-finance-methodology-gates-no-phi` and `aal2-audited-finance-methodology-gate-packets-no-phi`.
- Preserved the boundary: finance methodology gates are internal no-PHI readiness attestations only. They do not create audited financial reporting, legal approval, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, customer permission, production authorization, or live clinical execution approval.

## Latest Protected Board Scorecard Release

- Added protected Board Scorecards inside `/pilot-workspace/access` after Protected Metric Trend Reviews.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/board-scorecards` for AAL2 no-PHI rolling-quarter board scorecards, finance-allocation readiness, buyer-segment cohort strategy, competitive advantage tracking, and agent improvement priorities.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet` for audited internal board scorecard packet downloads.
- Added `app/lib/protectedBoardScorecards.ts` with typed scorecard validation, finance-allocation pending profiles, buyer-segment cohorts, strategic actions, agent priorities, limitations, and packet generation.
- Added `public.protected_board_scorecards` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-board-scorecard-created` and `protected-board-scorecard-packet-downloaded` audit events, and runtime schema `2026-06-19.5`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-rolling-quarter-board-scorecards-no-phi` and `aal2-audited-board-scorecard-packets-no-phi`.
- Preserved the boundary: protected scorecards and packets are internal no-PHI operating evidence only. They do not create audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, production authorization, or live clinical execution approval.

## Latest Protected Metric Trend Review Release

- Added protected Metric Trend Reviews inside `/pilot-workspace/access` after Protected Metric Rollups.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/metric-trends` for AAL2 no-PHI monthly variance review, reach expansion signals, competitive advantage tracking, and agent improvement actions.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet` for audited internal board trend packet downloads.
- Added `app/lib/protectedMetricTrends.ts` with typed trend comparison, snapshot-order validation, board trend state derivation, cost-allocation status, buyer-reach signals, agent improvement actions, limitations, and packet generation.
- Added `public.protected_metric_trend_reviews` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-metric-trend-review-created` and `protected-metric-trend-packet-downloaded` audit events, and runtime schema `2026-06-19.4`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-board-trend-review-no-phi` and `aal2-audited-board-trend-packets-no-phi`.
- Preserved the boundary: protected trend reviews and packets are internal no-PHI operating evidence only. They do not create audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, reimbursement assurance, clinical validation, compliance certification, production authorization, or live clinical execution approval.

## Latest Protected Metric Rollup Release

- Added protected finance-reviewed Metric Rollups inside `/pilot-workspace/access` after Public Market Operator Metrics.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/metric-rollups` for AAL2 no-PHI board-rollup review and snapshot creation.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet` for audited internal board metric packet downloads.
- Added `app/lib/protectedMetricRollups.ts` with typed rollup derivation, reporting-window validation, ratio math, safe workarounds, packet generation, and fixed finance/securities/clinical boundaries.
- Added `public.protected_metric_rollup_snapshots` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `protected-metric-rollup-created` and `protected-metric-rollup-packet-downloaded` audit events, and runtime schema `2026-06-19.3`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-finance-reviewed-metric-rollups-no-phi` and `aal2-audited-board-metric-packets-no-phi`.
- Preserved the boundary: protected rollups and packets are internal no-PHI operating evidence only. They do not create audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, reimbursement assurance, clinical validation, compliance certification, PHI authorization, production authorization, or live clinical execution approval.

## Latest Protected Operator Metric Capture Release

- Added protected Public Market Operator Metrics inside `/pilot-workspace/access` after the Command Intelligence Hub.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/operator-metrics` for AAL2 no-PHI operating metric review and capture.
- Added `app/lib/protectedOperatorMetrics.ts` with typed metric catalog, input validation, dashboard aggregation, forbidden-content checks, safe workarounds, and fixed finance/securities boundaries.
- Added `public.protected_operator_metrics` with select-only RLS, guarded RPC writes, no direct authenticated write grants, append-only `operator-metric-recorded` audit events, and runtime schema `2026-06-19.2`.
- Updated Public Market Readiness, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with `aal2-protected-operator-metric-capture-no-phi`.
- Preserved the boundary: operator metrics are aggregate no-PHI operating metadata only. They do not create audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, reimbursement assurance, clinical validation, compliance certification, PHI authorization, production authorization, or live clinical execution approval.

## Latest Public Market Readiness Release

- Added `/public-market-readiness`, `/api/public-market-readiness`, and `/api/public-market-readiness/brief` as SCRIMED's capital-efficiency and public-company operating-discipline layer.
- Added `app/lib/publicMarketReadiness.ts` with KPI definitions, unit-economics packages, model-efficiency controls, compliance logs, customer proof ladder, board cadence, investor narrative, known limitations, workarounds, and graduation gates.
- Updated the Product Console and product readiness brief with Public Market Readiness proof-stack fields, route references, KPI counts, unit-economics counts, compliance-log counts, and customer-proof stages.
- Updated `/hub` navigation and public smoke coverage so the public-market route, API, Markdown brief, and financial/securities boundary headers are verified.
- Preserved the boundary: Public Market Readiness is internal operating discipline and diligence preparation. It is not audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, or live clinical execution authorization.

## Latest Clinical Activation Approval Workflow Release

- Added protected Clinical Activation Approval Workflow v1 inside `/pilot-workspace/access` after the Clinical Activation Dossier.
- Added `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals` for AAL2 no-PHI readiness attestation review and capture.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals/packet` for an audited Markdown approval workflow export.
- Added `app/lib/clinicalActivationApprovals.ts` to derive approval domains, latest attestations, retained blockers, safe workarounds, persistence posture, and legal/clinical/financial/brand value lines from the protected dossier and approval ledger.
- Added `public.clinical_activation_approvals` with select-only RLS, guarded AAL2 RPC writes, append-only audit events, no direct write grants, fixed no-PHI attestation, and runtime schema `2026-06-19.1`.
- Updated Product Console proof stack and public smoke coverage with `aal2-clinical-activation-approval-workflow-no-phi`.
- Preserved the boundary: approval workflow records are no-PHI readiness attestations only. They do not create legal advice, clinical approval, FDA clearance, HIPAA compliance certification, reimbursement determination, PHI authorization, patient outreach permission, production connector authorization, diagnosis, treatment, record mutation, payer submission, autonomous clinical authority, or live clinical execution approval.

## Latest Clinical Activation Dossier Release

- Added protected Clinical Activation Dossier v1 inside `/pilot-workspace/access`.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier` for tenant-scoped AAL2 dossier review.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier/packet` for an audited Markdown export that commits a protected audit event before release.
- Added `app/lib/clinicalActivationDossier.ts` to derive gate ownership, reviewer assignments, unsigned approval metadata, no-PHI evidence references, required sign-off packets, go-live blockers, and rollback controls from the current workspace evidence and Clinical Care Activation Readiness model.
- Updated Product Console proof stack and public smoke coverage with `aal2-clinical-activation-dossier-no-phi`.
- Preserved the boundary: the dossier is a protected no-PHI readiness artifact. It does not create signatures, approve PHI processing, certify HIPAA/SOC/regulatory status, validate clinical safety, authorize live connectors, permit patient outreach, approve payer submission, or allow live clinical execution.

## Latest Clinical Care Activation Readiness Release

- Added `/clinical-care-activation`, `/api/clinical-care-activation`, and `/api/clinical-care-activation/brief` as a first-class clinical-care activation readiness surface.
- Added `app/lib/clinicalCareActivation.ts` with hard gates for intended-use review, licensed clinical governance, clinical safety case, customer scope, BAA/DPA/privacy review, HIPAA Security Rule safeguard mapping, production identity, PHI data architecture, connector validation, human authority/override logging, clinical validation, incident response, continuous monitoring, reimbursement review, patient communication/consent, and go-live rollback.
- Added Trust Card style activation outputs for readiness decisions and clinical recommendation-like outputs, including confidence, risk score, source attribution, reviewer state, human-review triggers, and audit events.
- Added a staged path from governed synthetic evaluation to shadow-mode readiness, clinician-supervised prospective pilot, and limited production go-live.
- Updated the Product Console proof stack and public smoke checks with `clinical-care-activation-readiness-gated`.
- Public smoke now verifies the clinical activation page, JSON API, Markdown brief, synthetic-only boundary, `not-authorized-live-care` header, hard-gate count, blocked live diagnosis, and non-100% readiness score.
- Preserved the boundary: SCRIMED can prepare enterprise buyers for clinical-care activation, but the current product does not authorize live clinical care, PHI processing, diagnosis, treatment, order entry, patient outreach, emergency triage, medical-device use, payer submission, record mutation, or autonomous clinical execution. Production clinical care requires signed customer scope, BAA/DPA where applicable, privacy/security/legal review, regulatory classification, licensed clinical governance, validated human-review workflow, approved connectors, monitoring, incident response, rollback, and explicit customer go-live approval.

## Latest Sales Command Center Release

- Added a protected Sales Command Center route at `GET /api/sales-operations/opportunities/{intakeId}/command-center`.
- The route ties Sales Operations opportunities to buyer-specific protected workspaces, retained Command Intelligence snapshots, command packet exports, Buyer Diligence Export posture, sales audit events, protected workspace audit events, commercial readiness, and next buyer actions.
- Added a Sales Operations console section showing commercial readiness score, command snapshot count, latest command score, score trend, packet export count, degraded sections, and posture timeline.
- Extended Buyer Pilot Room JSON and Markdown exports with Command Intelligence snapshot counts, latest score, score delta, trend, packet exports, and next action.
- Added `scripts/sales-command-center-smoke.mjs` and `npm run smoke:sales-command-center` so operators can verify the read-only authenticated Command Center happy path with the existing short-lived AAL2 sales QA token policy and explicit `SCRIMED_SALES_QA_INTAKE_ID`.
- Updated Product Console proof stack and public smoke coverage with `aal2-sales-command-intelligence-timeline`.
- Preserved the boundary: this is business-contact, workflow-scope, and synthetic command-posture intelligence only. It does not store PHI, payer member data, medical records, imaging, production credentials, source contracts, legal/security/compliance certification, reimbursement determinations, production connector approval, patient outreach authorization, autonomous clinical authority, or live healthcare execution approval.

## Latest Durable Command Intelligence Snapshot Release

- Added tenant-scoped durable Command Intelligence snapshots so protected workspace operators can retain AAL2 human-reviewed command posture across sessions.
- Added `POST /api/pilot-workspaces/{workspaceSlug}/command-intelligence` with fixed operator attestation, AAL2 governance context, evidence recomputation, rate limiting, Supabase RPC persistence, and append-only `command-intelligence-snapshot-created` audit events.
- Added audited `GET /api/pilot-workspaces/{workspaceSlug}/command-intelligence/{snapshotId}/packet` so Command Intelligence packets commit `command-intelligence-packet-downloaded` before releasing Markdown evidence.
- Added `public.command_intelligence_snapshots` with RLS select, explicit authenticated grants, guarded private RPC writes, JSON size/type checks, no direct write grants, and runtime schema `2026-06-18.2`.
- Updated `/pilot-workspace/access`, Product Console proof stack, protected workspace API contracts, docs, and public smoke coverage with durable command snapshots and audited command packets.
- Preserved the boundary: this stores synthetic command posture only. It does not store PHI, payer member data, medical records, imaging, source contracts, production credentials, secrets, legal/security/compliance certification, reimbursement determinations, production connector approval, patient outreach authorization, autonomous clinical authority, or live healthcare execution approval.

## Latest Command Intelligence Hub Release

- Added the protected SCRIMED Command Intelligence Hub inside `/pilot-workspace/access` so operators can review Agent Commander posture, Buyer Pilot Room readiness, Trust Engine outputs, continuous evaluation gates, MCP/tool-access plans, observability, safe-mode controls, limitations, workarounds, and next actions before external buyer diligence.
- Added `GET /api/pilot-workspaces/{workspaceSlug}/command-intelligence` with AAL2 governance context, workspace membership, no-store response headers, synthetic-only data boundary, rate limiting, degraded-section disclosure, and no new storage requirement.
- Added `app/lib/commandIntelligenceHub.ts` as the typed intelligence layer connecting agents, tenant evidence, protected workspace data, buyer-room posture, QA evidence, MCP/tool plans, safe-mode controls, and operator decisions.
- Updated Product Console proof stack, protected workspace API contract, protected workspace capability list, docs, and public smoke expectations with `aal2-command-intelligence-hub`.
- Preserved the boundary: the hub remains protected, synthetic-only, metadata-only, tenant-scoped, and does not accept PHI, store credentials, certify compliance/security, guarantee reimbursement, approve production connectors, or authorize live clinical, payer, imaging, device, or patient-facing execution.

## Latest Buyer Diligence Export Release

- Upgraded the protected Buyer Pilot Room export into a one-click Buyer Diligence Export at `/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet`.
- The export now bundles readiness, QA evidence, pricing posture, competitive edge, demo and pilot proof, legal/privacy/security/safety controls, degraded-section disclosure, known limitations, safe workarounds, and production hard gates.
- Added a typed diligence control matrix to the Buyer Pilot Room model so buyer questions, evidence, boundaries, workarounds, and production gates stay consistent across UI and Markdown export.
- Updated the protected UI copy, download filename, product proof-stack status, API contract, operator runbook, and smoke expectations.
- Preserved the boundary: the export remains synthetic-only, metadata-only, tenant-scoped, audited before release, and does not certify compliance, authorize live clinical execution, guarantee reimbursement, provide legal advice, or approve production connectors.

## Latest Browser-Session Manual QA Capture Release

- Added a protected Manual QA Evidence panel inside `/pilot-workspace/access` so operators can persist manual Sales Demo Session QA evidence from the existing AAL2 browser session instead of copying bearer tokens into local scripts.
- The panel captures only non-secret workflow metadata, fixed operator attestations, token-disposal attestation, synthetic-only boundary, generated packet download, retained packet hashes, and existing packet downloads.
- Updated Buyer Pilot Room UI wiring so retained manual QA evidence counts are visible before exporting buyer diligence packets.
- Added the protected manual QA evidence route to tenant-session verification so workspace operators can verify the capability without storing CI credentials.
- Updated the protected pilot API contract and capability list with browser-session manual QA evidence capture.
- Preserved the boundary: the panel does not accept bearer tokens, credentials, PHI, patient identifiers, payer member data, source contracts, legal advice, compliance certification, production authorization, or live healthcare execution approval.

## Latest Manual QA Evidence Persistence Release

- Added tenant-scoped durable manual QA evidence packet storage through `POST /api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets`.
- Added protected packet listing through `GET /api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets` so AAL2 governance users can inspect retained manual QA packets.
- Added `public.qa_manual_run_evidence_packets` with RLS select, guarded AAL2 RPC writes, packet SHA-256 hashing, duplicate workflow-run protection, append-only audit events, and no-secret/no-PHI validation.
- Updated Buyer Pilot Room JSON and Markdown packets so manual QA evidence packet counts, workflow run IDs, and packet hashes appear in enterprise diligence when captured.
- Updated `/qa-evidence`, `/pilot-evidence`, `/hub`, `/product`, and public smoke coverage with `tenant-scoped-aal2-manual-qa-evidence-ledger`.
- Preserved the boundary: persistence requires AAL2 tenant governance authorization and server-held runtime authorization. It does not store tokens, PHI, patient identifiers, payer member identifiers, source contracts, legal advice, compliance certification, security certification, production authorization, or live healthcare execution approval.

## Latest Manual QA Evidence Packet Release

- Added `POST /api/qa-evidence/manual-run-packet` to validate non-secret manual Sales Demo Session QA run metadata and return a Markdown evidence packet after the AAL2 workflow completes.
- Added `GET /api/qa-evidence/manual-run-packet` so operators can inspect required fields, accepted attestations, forbidden content, and the no-persistence boundary before submitting evidence.
- Extended `app/lib/qaEvidenceLedger.ts` with a manual-run capture contract, secret-like content rejection, UUID/run URL/intake/timestamp validation, token-disposal attestation, and packet generation.
- Updated `/qa-evidence`, `/pilot-evidence`, `/hub`, `/product`, and public smoke coverage so the manual AAL2 run no longer has an undefined evidence-capture process.
- Public smoke now verifies the packet contract, rejects token-like payloads, and accepts a sanitized synthetic packet payload.
- Preserved the boundary: the packet generator does not mint tokens, execute authenticated QA, accept PHI, accept credentials, certify compliance, or authorize live healthcare execution. Durable storage is handled only by the protected workspace evidence route.

## Latest QA Evidence Ledger Release

- Added `/qa-evidence`, `/api/qa-evidence`, and `/api/qa-evidence/brief` as a buyer-safe ledger for release QA, fail-closed controls, token-policy readiness, known limitations, and the remaining manual AAL2 gate.
- Added `app/lib/qaEvidenceLedger.ts` as the typed source of truth for QA entries, contained limitations, token policy references, current deployment evidence, and the next authenticated QA action.
- Updated `/quality`, `/pilot-evidence`, `/hub`, `/api/hub/summary`, `/product`, and `/api/product/console` so QA evidence appears in the main proof stack rather than only in docs.
- Updated `scripts/public-production-smoke.mjs` to verify the QA evidence page, JSON API, Markdown brief, synthetic-only data boundary, and manual AAL2 gate visibility.
- Addressed the remaining Sales Demo Session QA limitation with a clearer, safer workaround: SCRIMED now proves every surrounding control automatically and shows that the only unactioned item is a deliberate short-lived AAL2 operator-token run against an explicit synthetic opportunity.
- Preserved the boundary: the ledger is not a clinical validation report, legal opinion, compliance certification, SOC report, HIPAA attestation, or authorization for live healthcare execution.

## Latest Operator Token Rotation Release

- Added `docs/operator-token-rotation.md` for Sales Demo Session QA token handling, human operator flow, GitHub Actions policy, incident response, and retained production boundaries.
- Added `scripts/lib/sales-demo-session-qa-token-policy.mjs` as the reusable short-lived AAL2 token policy for buyer-demo QA.
- Added `scripts/sales-demo-session-qa-token-preflight.mjs` and `npm run smoke:sales-demo-session-qa:preflight` so operators can validate token claims and explicit opportunity targeting before any authenticated request is sent.
- Added `scripts/sales-demo-session-qa-token-policy-selftest.mjs` and `npm run smoke:sales-demo-session-qa:policy-test` so the AAL2, expiry, minted-lifetime, `iat`, and explicit-target guards can be tested without secrets.
- Updated `scripts/sales-demo-session-qa-smoke.mjs` to refuse tokens that are expired, not AAL2, missing `session_id`, missing `iat`/`exp`, too long-lived, too close to expiry, or missing an explicit `SCRIMED_SALES_QA_INTAKE_ID`.
- Added manual-only GitHub Actions workflow `.github/workflows/sales-demo-session-qa-smoke.yml` for governed CI execution without scheduled mutation smoke or committed credentials.
- Updated `/product`, `/api/product/console`, Sales Operations summary, and public smoke checks with `short-lived-aal2-token-preflight-and-manual-ci-policy`.
- Preserved the hard boundary: the token policy does not create long-lived credentials, bypass WebAuthn/passkey ceremony requirements, store tokens in source control, authorize production healthcare execution, or replace protected API verification through Supabase Auth.

## Latest Sales Demo Session QA Harness Release

- Added protected `GET` and `POST /api/sales-operations/qa/buyer-demo-sessions` for AAL2 tenant-admin buyer-demo QA.
- The QA harness targets the selected opportunity from `/sales-operations` or an explicit `SCRIMED_SALES_QA_INTAKE_ID`, creates a synthetic buyer-demo session through the existing guarded session RPC, and immediately verifies packet audit creation through the existing guarded packet RPC.
- Added `/sales-operations` operator UI support with a Run QA Harness action and proof line showing the created session and packet audit event.
- Added `scripts/sales-demo-session-qa-smoke.mjs` and `npm run smoke:sales-demo-session-qa`. The smoke skips by default, or runs the authenticated happy path when `SCRIMED_SALES_QA_BEARER_TOKEN` is supplied as a short-lived AAL2 tenant-admin token and `SCRIMED_SALES_QA_INTAKE_ID` names the explicit QA target.
- Updated `/product`, `/hub`, `/api/product/console`, product readiness brief, and public production smoke coverage with the buyer-demo QA proof-stack posture.
- Resolved the prior authenticated happy-path limitation with a free, safer workaround: browser AAL2 operator QA is available now, and CI can exercise the same route only when a short-lived external token and explicit opportunity target are intentionally provided.
- Resolved the local Turbopack native-binding build failure by making `dev` and `build` use Next.js Webpack mode by default while the macOS SWC binding remains unavailable in this environment.
- Preserved the hard boundary: the QA harness stores synthetic business workflow metadata only and does not accept PHI, patient identifiers, live clinical records, payer member data, diagnosis details, source contracts, secrets, credentials, legal advice, compliance certification, reimbursement determinations, patient outreach approval, autonomous care approval, or live healthcare execution authorization.

## Latest Persisted Buyer Demo Sessions Release

- Added guarded persisted buyer demo sessions through `GET` and `POST /api/sales-operations/opportunities/{intakeId}/demo-sessions`.
- Added audited buyer demo session packets through `GET /api/sales-operations/opportunities/{intakeId}/demo-sessions/{sessionId}/packet` so tenant-admins can retain no-PHI operator notes, buyer questions, blockers, workarounds, next actions, follow-up plan, current demo path snapshot, and selected proof-packet routes.
- Added a private `sales_buyer_demo_sessions` table with deny-all direct RLS and tenant-admin AAL2 plus server-held authorization for session recording and packet release.
- Updated `/sales-operations` with no-PHI demo-session capture, persisted session history, latest-session packet export, and current path score visibility inside the existing Authenticated Buyer Demo Execution panel.
- Updated `/product`, `/hub`, `/api/product/console`, public smoke coverage, and product readiness brief with buyer demo session proof-stack posture.
- Resolved the previous demo-persistence limitation with a free workaround: SCRIMED can now record buyer demo outcomes and release audited follow-up packets without a paid CRM, object storage, or PHI-bearing evidence vault.
- Preserved the hard boundary: buyer demo sessions do not accept PHI, patient identifiers, live clinical records, payer member data, diagnosis details, source contracts, credentials, legal advice, compliance certification, reimbursement determinations, patient outreach approval, autonomous care approval, or live healthcare execution authorization.
- Authenticated happy-path coverage is now handled by the AAL2 buyer-demo QA harness. Public smoke continues to verify fail-closed behavior, and tokenized happy-path smoke runs only when a short-lived external bearer token and explicit opportunity target are supplied.

## Latest Authenticated Buyer Demo Execution Release

- Added protected `GET /api/sales-operations/opportunities/{intakeId}/demo-execution` to build a tenant-admin, no-PHI buyer demo execution path from existing opportunities, audit events, deal-room readiness, protected workspace routing, and packet availability.
- Added protected `GET /api/sales-operations/opportunities/{intakeId}/demo-execution/brief` for a downloadable Markdown operator runbook. The brief is explicitly non-audited and keeps existing audited packet routes as the source of truth.
- Updated `/sales-operations` with an Authenticated Buyer Demo Execution panel that shows path score, next action, workspace mapping mode, sequenced gates, current blocker, and quick links to Product Console, Pilot Deal Room, Buyer Room, and the demo brief.
- Updated `/product`, `/hub`, `/api/product/console`, and public smoke coverage with buyer demo execution proof-stack posture.
- Resolved the current demo-orchestration limitation with a free workaround: SCRIMED can run enterprise buyer demos from one protected checklist without adding a new database table, paid CRM dependency, or sensitive evidence store.
- Preserved the hard boundary: the execution path does not create new audit evidence, accept PHI, authorize live clinical workflows, approve customer SSO cutover, certify compliance, submit payer transactions, contact patients, or provide medical, legal, security, regulatory, or reimbursement determinations.
- Authenticated write-path QA is now covered by the dedicated buyer-demo QA harness; the demo execution brief remains non-audited and existing packet routes remain the evidence source of truth.

## Latest Secure Evidence Vault Readiness Release

- Added guarded secure evidence vault readiness for buyer-diligence-prepared Sales Operations opportunities through `/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness`.
- Added audited secure evidence vault readiness packets through `/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness/packet` so tenant-admins can retain storage-provider decisioning, encryption/key management, DLP, malware scanning, retention, legal hold, access review, evidence classification, upload approval, incident response, regional data residency, target audience, and revenue-path controls.
- Added a private `sales_secure_evidence_vault_readiness` table with deny-all RLS and tenant-admin AAL2 plus server-held authorization for readiness preparation and packet release.
- Updated `/sales-operations` with vault mode, readiness status, storage provider decision, DLP/malware posture, target audience count, preparation action, and vault packet download action.
- Updated `/pilot-deal-room`, `/product`, `/hub`, `/api/product/console`, and public smoke coverage with secure evidence vault readiness proof-stack posture.
- Resolved the local run-failure pattern: duplicate-suffixed generated `.next` artifacts can appear when rebuilding while `next start` is still serving the build output. Stop the local server, quarantine or remove `.next`, rebuild cleanly, then run `scripts/check-generated-integrity.mjs` before TypeScript or smoke checks.
- Addressed the sensitive-document storage limitation with a stronger workaround: SCRIMED can now sell and run enterprise evidence-vault implementation planning while storage remains disabled and only metadata, owners, approval status, secure-channel labels, dates, blockers, and production gates are retained.
- Expanded target-audience reach for CIO, CISO, privacy, legal, compliance, procurement, clinical operations, payer operations, government health buyers, investors, and strategic partners.
- Preserved the hard boundary: vault readiness does not create upload URLs, buckets, object storage, PHI/ePHI processing, source-document storage, legal advice, compliance certification, breach determination, reimbursement guarantees, customer SSO approval, production connector authorization, payer submission, patient outreach, autonomous diagnosis, treatment decisions, or live healthcare execution.
- Applied the production Supabase migration and verified the private table, RLS, public RPC wrappers, runtime schema `2026-06-17.2`, and secure evidence vault readiness status. Supabase advisors show the existing leaked-password protection warning for password-based Auth; SCRIMED protected product flows remain passkey or passwordless magic-link based, so password sign-in should remain disabled unless that dashboard setting is enabled.
- Remaining gate: actual evidence storage requires approved provider, BAA/DPA path, encryption/key management, DLP, malware scanning, retention/deletion/legal hold, access reviews, incident response, regional residency, support ownership, buyer authorization, and qualified legal/privacy/security review.

## Latest Buyer Evidence And Signed Controls Diligence Release

- Added guarded buyer evidence and signed controls diligence rooms for activation-approved Sales Operations opportunities through `/api/sales-operations/opportunities/{intakeId}/buyer-diligence`.
- Added audited buyer diligence packets through `/api/sales-operations/opportunities/{intakeId}/buyer-diligence/packet` so tenant-admins can retain domain proof status, IdP metadata readiness, legal/privacy/security controls, BAA/DPA posture, transactional provider decisions, production connector readiness, signed controls, retained blockers, and next approvals.
- Added a private `sales_buyer_diligence_rooms` table with deny-all RLS and tenant-admin AAL2 plus server-held authorization for room preparation and packet release.
- Updated `/sales-operations` with buyer diligence status, metadata-only evidence scope, BAA/DPA status, production connector readiness, preparation action, and diligence packet download action.
- Updated `/pilot-deal-room`, `/product`, `/hub`, `/api/product/console`, and public smoke coverage with buyer diligence proof-stack posture.
- Addressed the current sensitive-document limitation with a safe workaround: SCRIMED now tracks only diligence metadata, owners, status, dates, approvals, blockers, and external secure-channel references until storage, DLP, malware scanning, retention, legal hold, and access controls are approved.
- Preserved the hard boundary: buyer diligence rooms do not accept PHI, patient identifiers, live clinical records, payer member data, IdP certificates, private keys, production credentials, legal advice, compliance certification, reimbursement determinations, customer SSO cutover approval, automated invitation delivery, production connector authorization, payer submission, patient outreach, autonomous diagnosis, treatment decisions, or live healthcare execution.
- Remaining gate: secure evidence vaulting, customer SSO cutover, automated invitations, live connectors, BAA/DPA execution, and production healthcare operations still require separate signed enterprise controls and qualified review.

## Latest Customer Activation Approval Workflow Release

- Added guarded customer activation approvals for production-readiness-prepared Sales Operations opportunities through `/api/sales-operations/opportunities/{intakeId}/activation-approvals`.
- Added audited activation approval packets through `/api/sales-operations/opportunities/{intakeId}/activation-approvals/packet` so tenant-admins can retain the paid-pilot setup approval scope, allowed setup actions, domain evidence status, IdP metadata review status, invitation template signoff, transactional provider gate, legal/privacy/security approval state, retained blockers, and competitive advantage signals.
- Added a private `sales_customer_activation_approvals` table with deny-all RLS and tenant-admin AAL2 plus server-held authorization for approval recording and packet release.
- Updated `/sales-operations` with customer activation approval status, paid-pilot setup approval action, approval packet download action, and visible retained blockers.
- Updated `/pilot-deal-room`, `/product`, `/hub`, `/api/product/console`, and public smoke coverage with customer activation approval proof-stack posture.
- Addressed the written-approval hard gate: SCRIMED founder/operator approval can now unblock paid pilot setup and diligence work inside the governed synthetic evaluation boundary.
- Preserved the hard boundary: activation approvals do not authorize PHI, live clinical records, customer SSO cutover, automated bulk invitations, production connectors, payer submission, patient outreach, autonomous diagnosis, treatment decisions, compliance certification, reimbursement determinations, or legal/security/privacy conclusions.
- Remaining gate: separate buyer and SCRIMED written approval, signed legal/privacy/security controls, BAA/DPA path if applicable, clinical governance, connector validation, transactional provider approval, and production operating procedures are still required before live healthcare operations.

## Latest Production SSO And Invitation Readiness Release

- Added guarded production SSO and invitation delivery readiness preparation for lifecycle-activated Sales Operations opportunities through `/api/sales-operations/opportunities/{intakeId}/production-readiness`.
- Added audited readiness packets through `/api/sales-operations/opportunities/{intakeId}/production-readiness/packet` so tenant-admins can retain buyer-domain verification policy, SSO redirect/origin registry, invitation template approval requirements, transactional delivery controls, access-review attestation automation, archive runbook, launch blockers, and competitive advantage signals.
- Added a private `sales_production_activation_readiness` table with deny-all RLS and tenant-admin AAL2 plus server-held authorization for readiness preparation and packet release.
- Updated `/sales-operations` with production readiness status, transactional-send posture, readiness packet history, preparation action, and packet download action.
- Updated `/pilot-deal-room`, `/product`, `/hub`, `/api/product/console`, and public smoke coverage with production readiness proof-stack posture.
- Strengthened the competitive edge: SCRIMED now shows enterprise buyers that customer SSO, automated invitations, access attestations, and archive execution are handled through auditable readiness gates instead of ad hoc setup.
- Preserved the boundary: readiness preparation does not enable automated email sending, approve customer SSO, create a BAA/DPA, authorize PHI, execute live clinical workflows, submit payer transactions, contact patients, certify compliance, or provide legal/security/regulatory determinations.
- Remaining gate: verified buyer domain, approved IdP metadata, approved transactional provider and sender domain, approved templates, legal/privacy/security sign-off, retention deletion controls, and production connector authorization still require written enterprise approval.

## Latest Buyer Tenant Lifecycle Release

- Added guarded tenant-per-buyer lifecycle activation for provisioned Sales Operations opportunities through `/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle`.
- Added audited lifecycle packets through `/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet` so tenant-admins can retain SSO/domain policy, manual invitation delivery posture, access-review cadence, retention/archive controls, activation checklist, and competitive advantage signals.
- Added a private `sales_buyer_tenant_lifecycles` table with deny-all RLS and tenant-admin AAL2 plus server-held authorization for lifecycle activation and packet release.
- Updated `/sales-operations` with buyer tenant lifecycle status, access-review due date, lifecycle packet history, activation action, and packet download action.
- Updated `/pilot-deal-room`, `/product`, `/hub`, `/api/product/console`, and public smoke coverage with buyer tenant lifecycle proof-stack posture.
- Strengthened the competitive edge: SCRIMED can now show buyers a governed path from intake to opportunity, buyer-specific workspace, lifecycle controls, proof packets, and paid synthetic pilot without accepting PHI or pretending production SSO/live connectors are already approved.
- Preserved the boundary: lifecycle automation is for governed synthetic enterprise evaluations only. It does not authorize PHI, live clinical execution, payer submission, patient outreach, autonomous diagnosis, compliance certification, legal advice, or reimbursement guarantees.
- Remaining gate: production customer SSO configuration, transactional invitation sending, customer-specific tenant architecture, BAA/DPA stack, retention deletion, and production connector authorization still require signed enterprise controls.

## Latest Opportunity Workspace Provisioning Release

- Added guarded per-opportunity workspace provisioning for qualified Sales Operations opportunities through `/api/sales-operations/opportunities/{intakeId}/workspace-provisioning`.
- Added audited provisioning packets through `/api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet` so tenant-admins can retain buyer-specific workspace slug, invitation policy, onboarding plan, retention schedule, and packet history.
- Added a private `sales_opportunity_workspaces` mapping table with deny-all RLS and tenant-admin AAL2 plus server-held authorization for all mutations.
- Updated Deal Room packets so provisioned opportunities route to their buyer-specific protected workspace instead of the default synthetic fallback.
- Updated `/sales-operations` with buyer workspace status, provision action, workspace packet download, and Buyer Room link.
- Updated `/pilot-deal-room`, `/product`, `/hub`, `/api/product/console`, and public smoke coverage with the opportunity workspace proof-stack posture.
- Preserved the boundary: opportunity workspaces are governed synthetic enterprise evaluation rooms only. They do not accept PHI, authorize live clinical execution, certify compliance, guarantee reimbursement, submit payer transactions, contact patients, or provide medical, legal, regulatory, or billing advice.
- Remaining gate: production customer SSO configuration, automated invitation sending, signed customer tenant architecture, retention deletion, and production connector authorization still require formal enterprise controls.

## Latest Pilot Deal Room Release

- Added `/pilot-deal-room` and `/api/pilot-deal-room` to organize the buyer path from official website discovery to product proof, pilot intake, Sales Operations, protected Buyer Pilot Room diligence, premium pricing, and paid synthetic pilot.
- Added protected `/api/sales-operations/opportunities/{intakeId}/deal-room-packet` so tenant-admins can generate an audited Markdown Pilot Deal Room packet for a retained no-PHI opportunity.
- Added `buyer-deal-room-packet-downloaded` to the private sales audit event model and retained `last_buyer_deal_room_packet_at` on the no-PHI intake opportunity record.
- Updated `/sales-operations` with a Deal Room Packet action and status tile for each opportunity.
- Updated `/product`, `/hub`, `/`, `/api/product/console`, `/api/hub/summary`, and public smoke coverage so the deal-room layer is visible across the product surface.
- Preserved a default synthetic workspace fallback (`atlas-synthetic-evaluation`) for opportunities that have not yet been qualified and provisioned.
- Preserved the boundary: the Pilot Deal Room is a non-binding enterprise diligence and sales artifact. It does not accept PHI, authorize live clinical execution, certify compliance, guarantee reimbursement, submit payer transactions, or provide medical, legal, or regulatory advice.

## Latest Trust Safety Operations Release

- Added passkey-aware Supabase Auth clients for `/pilot-workspace/access` and `/sales-operations`, with enrolled-passkey sign-in, signed-in passkey registration, and continued TOTP/AAL2 gates for governed tenant actions.
- Added authenticated passkey management panels for listing, renaming, registering, refreshing, and revoking passkeys inside protected pilot and Sales Operations.
- Added a tenant-admin aggregate enterprise proof packet route at `/api/pilot-workspaces/{workspaceSlug}/enterprise-proof-packet`, plus a protected workspace download action that combines synthetic sessions, TrustOS decisions, Agent Workspace work orders, Trust Safety incidents, tenant access posture, governance ledger records, and recent audit activity after a write-before-release audit event.
- Added an authenticated tenant-session verification panel inside `/pilot-workspace/access` so an approved AAL2 browser session can validate protected workspace routes and the audited enterprise proof-packet artifact without storing bearer tokens in CI.
- Added an authenticated Pilot Demo Readiness Command Center inside `/pilot-workspace/access` so buyer-demo operators can see readiness score, blockers, required actions, buyer brief lines, and a repeatable runbook from durable synthetic sessions, audit activity, proof packets, and tenant-session verification.
- Added durable Pilot Demo Readiness snapshots and audited Demo Readiness Packet exports so buyer-demo evidence can be retained, downloaded, and traced through append-only audit events without storing CI bearer tokens.
- Added a protected Buyer Pilot Room inside `/pilot-workspace/access`, plus `/api/pilot-workspaces/{workspaceSlug}/buyer-room` and audited `/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet`, to package readiness, premium sales path, competitive edge, evidence counts, limitations, workarounds, and write-before-release buyer diligence.
- Added `/competitive-edge` and `/api/competitive-edge` so public SCRIMED positioning clearly broadcasts healthcare intelligence infrastructure, TrustOS proof, interoperability sidecar strategy, premium enterprise motion, FaithCore/Atlas separation, and global deployment optionality without implying live clinical execution.
- Added `passkey-or-magic-link` tenant identity readiness posture, API validation, and migration support so tenant administration can reflect the current phishing-resistant sign-in path without breaking legacy magic-link-only records.
- Added `smoke:public` and `scripts/public-production-smoke.mjs` for no-secret production route, product posture, readiness, and fail-closed verification, including the aggregate enterprise proof packet protected route.
- Added `smoke:trustops` as a package script for the TrustOps authenticated smoke path.
- Reclassified the remaining auth limitation: leaked-password protection is a Supabase dashboard control for password-based auth, while SCRIMED product flows continue to avoid password sign-in and require passkey or magic-link sign-in plus AAL2 where protected mutations are involved.
- Added a trust-ops incident queue with severity, owner, accountable agent, source channel, containment action, remediation plan, legal-hold status, SLA tier, improvement actions, and audit-ready report exports.
- Added `/api/trust-safety-operations/incidents/{incidentId}/report` for downloadable no-PHI trust safety incident reports.
- Added tenant-scoped durable TrustOps incident storage contract with private Supabase tables, deny-all RLS, guarded RPCs, AAL2 tenant mutation gates, append-only events, legal-hold fields, notification decisions, and review-packet exports.
- Added protected tenant TrustOps APIs at `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents`, `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}`, and `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}/review-packet`.
- Applied the tenant TrustOps incident migration to the `scrimed-protected-pilot` Supabase project.
- Added FK index hardening for TrustOps and Agent Workspace tables after Supabase performance advisor review.
- Added the authenticated `/pilot-workspace/access` Tenant TrustOps incident workspace panel for dashboard metrics, no-PHI incident creation, status/legal-hold/notification review updates, event inspection, and audited review-packet download.
- Added `scripts/trustops-authenticated-smoke.mjs` for TrustOps fail-closed and authenticated happy-path verification.
- Added target-audience positioning for CIO, CISO, privacy, compliance, clinical operations, RCM, payer, government, investor, and strategic partner review.
- Added a dedicated Supabase migration for `attribution-analytics-packet-downloaded`, plus a rollout fallback to the existing sales artifact event until the production migration is verified.
- Added `/trust-safety-operations` and `/api/trust-safety-operations` for SCRIMED's 24/7 trust, safety, copyright, legal, security, monitoring, auditing, fixing, and continuous-improvement operating model.
- Added named trust agents for PHI shielding, agent firewalling, copyright/IP provenance, claims/legal guardrails, clinical safety, security incident watch, and continuous improvement.
- Strengthened Enterprise Readiness with copyright registration candidates, trademark strategy, third-party license/provenance controls, generated-media review, and 24/7 incident-response readiness gates.
- Added tenant-admin attribution analytics into `/sales-operations` and added a protected audited attribution analytics packet export under `/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet`.
- Preserved the boundary: this is not legal advice, compliance certification, managed SOC/MDR coverage, production clinical monitoring, breach determination, PHI storage, or live clinical execution authorization.
- Remaining gate: place CI-held short-lived AAL2 tenant smoke tokens before using unattended authenticated TrustOps, Agent Workspace, Demo Readiness Packet, Buyer Diligence Export, and aggregate enterprise proof-packet happy paths. Buyer-demo session write-and-packet QA now has its own short-lived-token-compatible harness. Public readiness smoke runs without secrets, while human-run buyer diligence exports, demo readiness snapshots, packet exports, and protected verification can be executed from `/pilot-workspace/access` or `/sales-operations` with the current browser session. If password sign-in remains enabled anywhere in the Supabase project, enable leaked-password protection in the dashboard; SCRIMED product flows remain passwordless/passkey-first.

## Latest Attribution Analytics Release

- Added `/attribution-analytics` and `/api/attribution-analytics` for public synthetic source-to-pilot cohort analytics across source category, campaign, buyer type, deployment profile, offer, cadence, proof packet, and sales outcome.
- Added protected `/api/sales-operations/attribution-analytics` so authenticated tenant-admins can derive cohort analytics from persisted no-PHI Sales Operations opportunities.
- Added Attribution Analytics to `/product`, `/hub`, `/sales-attribution`, `/market-activation`, and product readiness brief output.
- Kept the durable source aligned to existing retained buyer-intake metadata at `private.pilot_intake_submissions.payload.attribution`, avoiding a new database migration or paid connector dependency.
- Preserved the boundary: public analytics are synthetic fixtures and do not represent real customers, revenue, patient outcomes, clinical validation, or guaranteed ROI.

## Latest Sales Attribution And Source Intelligence Release

- Added `/sales-attribution` and `/api/sales-attribution` for CRM-safe source tracking, UTM/referrer capture, target audience routing, revenue-stream mapping, deployment-profile selection, source-informed strategy signals, and human follow-up cadence.
- Added `/source-intelligence` and `/api/source-intelligence` to encode official public signals from HL7/FHIR, Notion, Figma release notes, Cursor, Hugging Face, Siemens Healthineers, Snowflake, Sierra, and Anthropic into SCRIMED-specific implementation themes and governance boundaries.
- Extended `/api/pilot/intake` to capture no-PHI attribution metadata and return the routing packet with the accepted intake response.
- Updated `/pilot` to safely capture browser route, referrer, and UTM fields without exposing the buyer to extra form friction.
- Added a manual no-PHI review-packet fallback for pilot intake when Supabase durable retention or CRM routing is unavailable, so demos and buyer flows do not fail while retention remains explicitly unconfirmed.
- Updated Sales Operations exports, CRM webhook payloads, follow-up drafts, assessment invitations, proposals, and opportunity detail UI with attribution, audience, deployment profile, and cadence context.
- Added Sales Attribution and Source Intelligence to `/hub`, `/product`, readiness brief output, and route registry.
- Corrected the operations quality blocker to reflect the current direct-Node quality path when `npm` is unavailable locally.

## Latest Deployment And Market Activation Release

- Added `/deployment-profiles` and `/api/deployment-profiles` for managed cloud, private cloud, hospital-controlled, sovereign/public-sector, and edge/on-prem deployment readiness fixtures.
- Added deployment profile readiness to protected pilot proof packets so buyer diligence can see environment, cost model, residency posture, metrics, production gates, and blocked claims.
- Added `/market-activation` and `/api/market-activation` for revenue streams, target audiences, message house, public relations, communications, advertising, and FaithCore market programs.
- Strengthened `/faithcore` with opt-in programs, revenue use, communications rules, and explicit clinical, emergency, consent, and spiritual-authority boundaries.
- Added Market Activation and Deployment Profiles to `/hub` and `/product`.
- Addressed known limitations through code-side workarounds and honest gates: direct Node entrypoints for local `npm` unavailability, Webpack fallback for local Turbopack/SWC code-signature constraints, and external-secret-only handling for authenticated GitHub smoke.

## Latest Strategic Intelligence And Activation Governance Release

- Added `/strategic-intelligence` and `/api/strategic-intelligence` to translate public platform signals into SCRIMED-specific agents, interoperability, governance, deployment, proof metrics, and next-build paths.
- Added protected `/api/pilot-workspaces/{workspaceSlug}/activation-governance` so tenant-admins can record the selected governance workflow pack as an append-only activation ledger seed.
- Added activation governance visibility to tenant activation proof packets after the seed is recorded.
- Added a tenant-admin runbook step for recording the governance pack seed before invitation, onboarding, activation, and proof export.
- Preserved the boundary: source-informed strategy is not a partnership claim, certification, live connector authorization, medical device control, payer approval, or autonomous clinical execution.

## Latest Governance Pack Routing Release

- Added deterministic governance workflow pack routing to enterprise pilot intake.
- Attached the selected governance pack to the durable no-PHI intake payload for sales operations and future protected workspace activation.
- Added governance-ledger-ready metadata for selected pack slug, status, route, brief route, matched signals, no-PHI boundary, and synthetic pilot boundary.
- Added selected governance pack visibility to intake confirmation, Sales Operations opportunity detail, audited proposal generation, CRM CSV export, CRM webhook payload, calendar invitation, and follow-up draft.
- Added `docs/governance-pack-routing.md` as the operator runbook for pack selection, product boundary, sales use, and the remaining authenticated CI secret gate.
- Preserved the commercial boundary: governance packs are operating templates for synthetic pilots and enterprise evaluations, not legal advice, compliance certification, production authorization, payer approval, or clinical authorization.

## Latest Sales Operations Release

- Enforced passkey or passwordless magic-link sign-in plus free TOTP authentication for `/sales-operations`, with AAL2 verification, a twelve-hour maximum session, a two-hour inactivity boundary, and global session termination.
- Added native vendor-neutral CRM CSV exports so SCRIMED sales operations does not depend on a paid CRM; approved webhook synchronization remains optional.
- Added durable next-action due dates, automatic due and overdue triage, audited human-reviewed email drafts, and audited follow-up completion.
- Added audited enterprise assessment calendar invitations with durable schedule state and optional HTTPS meeting links.
- Added protected APIs for opportunity assignment, cadence, proposals, CRM exports, follow-up drafts, follow-up completion, assessment invitations, and controlled CRM synchronization.
- Bound new governed buyer intake to the first SCRIMED tenant while retaining the business-contact and workflow-scope-only boundary.
- Added append-only sales audit events for opportunity updates, commercial artifact releases, follow-up completion, assessment invitations, and CRM outcomes.
- Kept direct private lead and audit-table access denied; authorization remains enforced inside Postgres through verified tenant-admin membership.
- Added proposal generation that maps buyer offer interest to the appropriate sellable SCRIMED pilot program without implying live clinical execution.
- Added a deterministic generated-cache preflight so local quality gates no longer depend on npm availability or fail on duplicated disposable `.next` artifacts.

## Latest Protected Pilot Workspace Release

- Added `/pilot-workspace` as the protected enterprise pilot control surface.
- Added `/pilot-workspace/access` as the invite-only authenticated tenant workspace console.
- Selected Supabase Auth plus Postgres row-level security for tenant identity, isolation, durable synthetic sessions, and append-only audit events.
- Provisioned the `scrimed-protected-pilot` Supabase project in `us-east-1`, applied both protected-pilot migrations, confirmed RLS on every exposed pilot table, and cleared all database security and missing-index advisor findings.
- Connected Supabase to the Vercel Production and Preview runtimes, configured the production Auth site and redirect URLs, and disabled public user signups.
- Provisioned the `scrimed-protected-pilot-rate-limit` Upstash Redis database on the Vercel Marketplace free plan in `iad1` and connected Production and Preview credentials.
- Verified the branded production runtime against Supabase and Upstash; `/api/pilot-workspaces/readiness` now reports `productionActivationVerified: true`.
- Activated `scrimedsolutions@gmail.com` as the first tenant-admin, bootstrapped the SCRIMED tenant and Atlas governed synthetic workspace, and verified authenticated workspace access.
- Created the first durable synthetic evaluation, downloaded its audited proof packet, and confirmed the committed `synthetic-session-created` then `proof-packet-downloaded` event sequence.
- Verified cross-tenant RLS isolation, anonymous access denial, and withheld direct mutation privileges without retaining synthetic verification artifacts.
- Added append-only audit-trail visibility to the authenticated protected-pilot workspace.
- Hardened repository quality gates to ignore quarantined generated Next.js caches, preventing recurrence of generated-cache lint stalls.
- Added authenticated protected APIs for tenant workspace discovery, durable sessions, audit inspection, and audited proof-packet downloads.
- Added a hardened SQL migration that withholds direct mutation rights and commits synthetic sessions with audit events transactionally.
- Added downloadable synthetic enterprise proof packets and a public preview export.
- Added active rate limiting to public pilot intake and protected session creation, with Upstash Redis connected for distributed production enforcement.
- Added live runtime verification for the migrated protected pilot schema and distributed Redis provider so configuration presence cannot masquerade as activation.
- Fixed the recurring generated-cache build fault by expanding integrity checks across the full `.next` tree.
- Preserved the commercial boundary: protected pilot evidence is synthetic only; live clinical execution remains denied.

## Current Baseline

The active `scrimed-site` baseline is a Next.js App Router site on `main`. PR #10 established the deployable Vercel foundation, and subsequent execution converted the placeholder root page into a serious SCRIMED platform surface with an OS Hub command layer, master operating context, integration contract boundary, synthetic clinical validation layer, and explicit quality gates.

Current baseline includes:

- Official public website context for https://www.scrimedsolutions.com through Wix
- Next.js App Router project structure
- Root page at `/`
- Product console at `/product`
- Pricing and sales strategy at `/pricing`
- Company operations readiness at `/operations`
- Trust and enterprise readiness center at `/trust-center`
- Public claims register at `/claims`
- Enterprise pilot intake at `/pilot`
- Tenant-admin sales operations at `/sales-operations`
- Protected pilot workspace at `/pilot-workspace`
- AgentOS Evaluation Workspace at `/evaluation`
- SCRIMED AgentOS v1 at `/agents`
- Memory fabric at `/memory`
- Audit and governance layer at `/audit`
- Observability and continuous validation dashboard at `/observability`
- SCRIMED OS Hub console at `/hub`
- Hub readiness console at `/hub/readiness`
- Hub events console at `/hub/events`
- Platform page at `/platform`
- Master operating context at `/operating-context`
- Agent workflow registry at `/agents`
- Agent workflow detail routes under `/agents/[slug]`
- Synthetic workflow execution readiness at `/workflows`
- Workflow execution detail routes under `/workflows/[slug]`
- Workflow execution result fixtures at `/workflows/results`
- Workflow execution result detail routes under `/workflows/results/[slug]`
- Workflow result validation at `/workflows/results/validation`
- Workflow promotion review at `/workflows/promotion-review`
- Governed execution API contracts at `/workflows/contracts`
- Governed execution API contract detail routes under `/workflows/contracts/[slug]`
- Identity and access readiness at `/workflows/identity-access`
- Execution-attempt readiness at `/workflows/execution-attempts`
- Governed execution implementation readiness at `/workflows/implementation-readiness`
- Governed execution implementation detail routes under `/workflows/implementation-readiness/[slug]`
- Denied execution audit boundaries at `/workflows/execution-audit`
- Denied execution audit boundary detail routes under `/workflows/execution-audit/[slug]`
- Audit persistence readiness at `/workflows/audit-persistence`
- SCRIMED Atlas Intelligence Core v1 at `/atlas`
- FaithCore operating model at `/faithcore`
- Integration contracts page at `/integrations`
- Interoperability control plane at `/interoperability`
- Interoperability standard detail routes under `/interoperability/[slug]`
- Executable interoperability conformance evaluations at `/interoperability/evaluations`
- Conformance evaluation detail routes under `/interoperability/evaluations/[slug]`
- Integration fixture contracts at `/integrations/fixtures`
- Integration fixture validation at `/integrations/fixture-validation`
- Fixture change review at `/fixtures/change-review`
- Detailed contract routes under `/contracts/[slug]`
- Synthetic clinical environment at `/synthetic`
- Synthetic scenario routes under `/synthetic/[slug]`
- Synthetic fixture contracts at `/synthetic/fixtures`
- Synthetic fixture detail routes under `/synthetic/fixtures/[slug]`
- Synthetic validation page at `/synthetic/validation`
- Quality gates page at `/quality`
- Trust and Watchtower page at `/trust`
- Module pages for Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower
- Shared Hub model in `app/lib/scrimedHub.ts`
- Shared Hub operations model in `app/lib/hubOperations.ts`
- Shared operating context model in `app/lib/operatingContext.ts`
- Shared agent workflow model in `app/lib/agentWorkflows.ts`
- Shared workflow execution model in `app/lib/workflowExecutions.ts`
- Shared workflow execution result model in `app/lib/workflowExecutionResults.ts`
- Shared workflow result validation model in `app/lib/workflowResultValidation.ts`
- Shared workflow promotion-review model in `app/lib/workflowPromotionReviews.ts`
- Shared workflow execution contract model in `app/lib/workflowExecutionContracts.ts`
- Shared identity and access readiness model in `app/lib/identityAccessReadiness.ts`
- Shared execution-attempt readiness model in `app/lib/executionAttemptReadiness.ts`
- Shared workflow implementation readiness model in `app/lib/workflowImplementationReadiness.ts`
- Shared workflow execution audit-boundary model in `app/lib/workflowExecutionAudit.ts`
- Shared audit persistence readiness model in `app/lib/auditPersistenceReadiness.ts`
- Shared integration contract model in `app/lib/integrationContracts.ts`
- Shared interoperability standards and conformance model in `app/lib/interoperabilityStandards.ts`
- Shared executable interoperability conformance evaluation model in `app/lib/interoperabilityConformanceEvaluations.ts`
- Shared integration fixture model in `app/lib/integrationFixtures.ts`
- Shared integration fixture validation model in `app/lib/integrationFixtureValidation.ts`
- Shared fixture change-review model in `app/lib/fixtureChangeReviews.ts`
- Shared synthetic scenario model in `app/lib/syntheticClinical.ts`
- Shared synthetic fixture model in `app/lib/syntheticFixtures.ts`
- Shared synthetic validation model in `app/lib/syntheticValidation.ts`
- Shared quality gate model in `app/lib/qualityGates.ts`
- Shared product console model in `app/lib/productConsole.ts`
- Shared pilot intake model in `app/lib/pilotIntake.ts`
- Shared sales operations model in `app/lib/salesOperations.ts`
- Shared protected sales operations store in `app/lib/salesOperationsStore.ts`
- Shared AgentOS model in `app/lib/agentOS.ts`
- Shared Atlas Intelligence Core model in `app/lib/atlasIntelligenceCore.ts`
- Global visual system in `app/globals.css`
- Health endpoint at `/api/health`
- Platform status endpoint at `/api/status`
- Product console endpoint at `/api/product/console`
- Product readiness brief endpoint at `/api/product/readiness-brief`
- Pricing and sales strategy endpoint at `/api/commercial/pricing`
- Company operations readiness endpoint at `/api/operations/readiness`
- Enterprise pilot intake endpoint at `/api/pilot/intake`
- Tenant-admin sales operations endpoint at `/api/sales-operations`
- Protected opportunity mutation, proposal, and CRM synchronization endpoints under `/api/sales-operations/opportunities/[intakeId]`
- Protected pilot readiness endpoint at `/api/pilot-workspaces/readiness`
- Tenant-authenticated workspace discovery at `/api/pilot-workspaces`
- Tenant-authenticated durable session endpoints under `/api/pilot-workspaces/[workspaceSlug]/sessions`
- Tenant-authenticated append-only audit inspection under `/api/pilot-workspaces/[workspaceSlug]/audit`
- Audited downloadable proof packets under `/api/pilot-workspaces/[workspaceSlug]/sessions/[sessionId]/proof-packet`
- AgentOS Evaluation Workspace endpoint at `/api/agent-os/evaluation`
- AgentOS summary endpoint at `/api/agent-os`
- AgentOS task planning endpoint at `/api/agent-os/tasks`
- Atlas Intelligence Core endpoint at `/api/atlas/intelligence-core`
- Memory fabric endpoint at `/api/memory`
- Audit and governance endpoint at `/api/audit`
- Observability endpoint at `/api/observability`
- Trust Card endpoint at `/api/trust/cards`
- Readiness endpoint at `/api/readiness`
- Platform events endpoint at `/api/events`
- Operating context endpoint at `/api/operating-context`
- Agent workflow registry endpoint at `/api/agents/workflows`
- Per-agent workflow endpoints under `/api/agents/workflows/[slug]`
- Workflow execution endpoint at `/api/workflows/executions`
- Per-workflow execution endpoints under `/api/workflows/executions/[slug]`
- Workflow execution result endpoint at `/api/workflows/results`
- Per-workflow execution result endpoints under `/api/workflows/results/[slug]`
- Workflow result validation endpoint at `/api/workflows/results/validation`
- Workflow promotion-review endpoint at `/api/workflows/promotion-review`
- Workflow execution contract endpoint at `/api/workflows/contracts`
- Per-workflow execution contract endpoints under `/api/workflows/contracts/[slug]`
- Identity and access readiness endpoint at `/api/workflows/identity-access`
- Execution-attempt readiness endpoint at `/api/workflows/execution-attempts`
- Workflow implementation readiness endpoint at `/api/workflows/implementation-readiness`
- Workflow execution audit-boundary endpoint at `/api/workflows/execution-audit`
- Per-workflow execution audit-boundary endpoints under `/api/workflows/execution-audit/[slug]`
- Audit persistence readiness endpoint at `/api/workflows/audit-persistence`
- Deny-by-default governed execution endpoints under `/api/workflows/governed-execution/[slug]`
- Fixture change-review endpoint at `/api/fixtures/change-review`
- Integration fixture endpoint at `/api/integration-fixtures`
- Per-fixture integration endpoints under `/api/integration-fixtures/[slug]`
- Integration fixture validation endpoint at `/api/integration-fixtures/validation`
- Integration contracts endpoint at `/api/contracts`
- Interoperability standards endpoint at `/api/interoperability/standards`
- Interoperability conformance endpoint at `/api/interoperability/conformance`
- Interoperability conformance evaluation endpoints at `/api/interoperability/evaluations` and `/api/interoperability/evaluations/[slug]`
- Per-contract API routes under `/api/contracts/[slug]`
- Synthetic scenario endpoint at `/api/synthetic/scenarios`
- Per-scenario synthetic API routes under `/api/synthetic/scenarios/[slug]`
- Synthetic fixture endpoint at `/api/synthetic/fixtures`
- Per-fixture synthetic API routes under `/api/synthetic/fixtures/[slug]`
- Synthetic validation endpoint at `/api/synthetic/validation`
- Per-scenario validation API routes under `/api/synthetic/validation/[slug]`
- Quality gates endpoint at `/api/quality/gates`
- Hub summary endpoint at `/api/hub/summary`
- Vercel deployment configuration
- TypeScript configuration and Next.js environment references
- GitHub Actions build workflow in `.github/workflows/ci.yml`
- Runtime scripts for development, type checking, build, and start

## Deployment Status

Vercel is the current working deploy gate and has repeatedly reported success for the `scrimed-site` deployment. The Vercel connector now resolves the `scrimed-site` project under the `temitayo-dahunsis-projects` team. GitHub CLI authentication is configured for local pushes, and Vercel production deploys from pushed GitHub `main` commits have reached READY for the current SCRIMED product build path. A controlled local Node.js 22 and npm toolchain independently verifies deterministic dependency installation, security audit, lint, TypeScript validation, and production builds. GitHub Actions run visibility is available and recent CI runs pass.

Vercel, GitHub Actions, local package-manager verification, and the committed lockfile provide active independent build-quality paths.

Direct unauthenticated HTTP requests to protected Vercel deployment URLs can return Vercel Authentication instead of the app response. Connector-authenticated Vercel checks are the current source of truth for protected deployment API smoke tests unless SCRIMED intentionally disables deployment protection or configures public API access.

## Quality Process

Current active quality path:

1. Vercel deployment status is the primary deploy gate.
2. Synthetic fixture contracts and executable assertions validate workflow behavior without live patient data.
3. The master operating context defines the mission, decision framework, Atlas boundary, FaithCore boundary, and delivery standard.
4. The agent workflow registry defines owner, permissions, inputs, outputs, audit events, guardrails, interoperability targets, and human-review policy before agent execution.
5. Fixture change review records expected-output fingerprints before workflows or connectors depend on fixture changes.
6. Synthetic workflow execution readiness maps staged module workflows to agent, synthetic, integration, quality, result-fixture, and Watchtower gates.
7. Workflow execution result fixtures capture deterministic outputs, review state, blocked actions, and quality evidence for each staged workflow.
8. Workflow result validation compares expected outputs, result output signals, Watchtower traces, review state, and blocked actions before promotion.
9. Workflow promotion review records synthetic-only approval and retained blocked actions before production automation.
10. Governed execution API contracts define request schema, response schema, preconditions, audit events, observability signals, and denied capabilities before implementation.
11. Identity and access readiness defines production identity provider, tenant isolation, role permissions, patient-context authorization, service authentication, session lifecycle, consent, break-glass access, audit linkage, and regional identity controls before governed execution can accept authenticated requests.
12. Execution-attempt readiness defines attempt identity, idempotency policy, durable state, concurrency, retry, failure quarantine, rate limits, privacy boundaries, and regional compliance before any governed execution route can create or replay work.
13. Deny-by-default governed execution endpoints reject execution before request-body parsing, connector access, workflow mutation, attempt creation, or patient-facing action.
14. Denied execution audit boundaries define metadata-only capture, evidence headers, audit-envelope fields, and never-capture policy before durable logging.
15. Audit persistence readiness defines durable storage, retention, access, encryption, incident response, regional residency, and Watchtower alerting decisions before denied-event metadata can be persisted.
16. Integration fixtures define synthetic request and expected-response shapes for non-synthetic connector contracts.
17. Interoperability standards, profiles, conformance evidence, and integration contracts define the data boundary before real connectors are implemented.
18. Hub readiness and event endpoints expose operational status.
19. Quality gates make every active, planned, and bypassed validation path explicit.
20. Enterprise pilot intake validates buyer requests, blocks PHI-style content, durably retains accepted no-PHI submissions in a private ledger, and packages sanitized CRM-ready handoff payloads for secure CRM routing.
21. Pricing and sales strategy defines public preview, paid assessment, synthetic pilot, protected enterprise pilot, enterprise license, strategic partnership, buyer routing, value metrics, and commercial guardrails.
22. Company operations readiness defines publishing, deployment, app domain, Wix routing, local quality tooling, deployment protection, owners, resolution paths, and fallbacks.
23. AgentOS v1 defines planner, router, specialist registry, memory fabric, TrustQA, audit logging, human approval checkpoints, MCP connector framework, task planning, RBAC, sandbox runtime, observability, and HIPAA-ready architecture controls.
24. Atlas Intelligence Core v1 defines structural document intelligence, evidence retrieval contracts, Trust Cards, agent sandbox runtime, continuous validation metrics, AI Asset Registry, shadow AI detection, and reimbursement readiness boundaries.
25. AgentOS Evaluation Workspace converts synthetic document packets into bounded task plans, structural document-intelligence assignments, Atlas Trust Cards, audit previews, and observability-ready outcome records.
26. React and React DOM package pins are held at the current 19.2.4 patch line for the Next.js App Router security baseline.
27. Protected pilot workspaces define tenant-authenticated discovery, row-level isolation, durable synthetic sessions, append-only audit events, audited proof packets, and fail-closed activation gates.
28. Public pilot intake and protected session creation enforce active request limits, with Upstash Redis connected and verified for distributed production counters.

Current bypassed or deferred checks:

- Live clinical integrations remain planned until synthetic fixtures and contracts are stable.

Replacement path:

- Vercel deployment plus pilot intake validation and fixture-backed executable synthetic validation is the current active build-quality path.
- Fixture change review, workflow execution readiness, workflow execution result fixtures, result validation, promotion review, governed execution contracts, identity and access readiness, execution-attempt readiness, deny-by-default execution endpoints, denied-execution audit boundaries, and audit persistence readiness replace silent fixture drift and premature live workflow automation.
- Contract pages and APIs replace live connector assumptions until connector implementation is explicitly approved.
- Readiness, events, and quality gate endpoints replace ambiguous manual status tracking.

## CI Dependency Hardening

The repository now has a controlled, committed `package-lock.json`, allowing reproducible installs and npm caching without the earlier missing-lockfile failure mode.

Fix applied:

- Restored `cache: npm` in `.github/workflows/ci.yml`.
- Replaced `npm install` with deterministic `npm ci`.
- Added `npm audit --audit-level=moderate` as a CI security gate.
- Replaced the removed Next.js `next lint` command with the supported ESLint CLI and matching Next.js configuration.
- Migrated internal anchors to Next.js links and removed effect-driven pilot-prefill state so lint completes without errors.
- Added `npm run typecheck` to CI.
- Added a `typecheck` script to `package.json`.
- Added a generated-workspace integrity precheck so duplicate-suffixed `@types` or `.next` artifacts fail with a precise repair path before TypeScript resolution or builds are corrupted.
- Upgraded GitHub Actions checkout and Node setup steps to their Node 24-based v6 releases and set explicit read-only repository contents permission.
- Updated Next.js to `16.2.7` and overrode its vulnerable transitive PostCSS dependency with patched `8.5.15`.
- Verified zero audit findings, TypeScript success, and a successful production build locally.

## Product Direction

SCRIMED remains focused on becoming an AI healthcare intelligence platform with these primary tracks:

- Clinical Copilot for clinician decision support
- DocuTwin for medical documentation workflows
- CarePath AI for patient intake, triage, and navigation
- TrialCore for clinical trial discovery and matching
- Watchtower / TrustWatch for AI reliability, drift detection, and safety monitoring
- SCRIMED Atlas for faith-neutral enterprise governance, compliance, interoperability, ROI, and agentic operations
- FaithCore for opt-in spiritually aligned encouragement and trust support with explicit clinical boundaries
- Agent Commander and governed specialized agents for prior authorization, revenue cycle, scheduling, trial matching, documentation, compliance, interoperability, clinical intelligence, research, governance, and supply chain workflows
- Enterprise pilot intake and CRM-ready buyer handoff for synthetic SCRIMED Atlas evaluations and healthcare AI readiness assessments
- Pricing and sales strategy for public preview, assessment, synthetic pilot, protected pilot, enterprise license, and strategic partnerships
- Company operations readiness for GitHub auth, Vercel deployment, app subdomain DNS, Wix CTA routing, local build tooling, and deployment protection
- SCRIMED AgentOS v1 for governed planner/router/specialist orchestration, memory, audit, TrustQA, RBAC, MCP connectors, sandbox runtime, and task planning
- AgentOS Evaluation Workspace for interactive synthetic buyer packets, Trust Cards, audit previews, and observability records
- SCRIMED Atlas Intelligence Core v1 for structural document understanding, evidence-backed reasoning, Trust Cards, continuous validation, AI governance, and reimbursement-aware operating design
- Standards-bound integration contracts for future FHIR, HL7 v2, DICOM/DICOMweb, X12, pricing, and synthetic clinical test data
- Interoperability registry and conformance controls for exchange, imaging, payer, pharmacy, device, profile, and terminology standards
- Integration fixtures and validation diffs before live connector implementation
- Fixture change review, synthetic workflow execution readiness, deterministic workflow result fixtures, result validation, synthetic-only promotion review, governed execution API contracts, identity and access readiness, execution-attempt readiness, deny-by-default execution endpoints, denied-execution audit boundaries, and audit persistence readiness before module automation
- Synthetic validation before live clinical data or production integrations

## Completed Execution

- Closed stale PRs #1 through #9 as superseded by PR #10.
- Added `docs/project-status.md` to preserve the operating baseline and next-step plan.
- Rebuilt the homepage from a placeholder into a platform-oriented SCRIMED web presence.
- Added `/api/status` for module readiness metadata.
- Added `tsconfig.json`, `next-env.d.ts`, and global styling to strengthen the Next.js foundation.
- Added GitHub Actions CI for dependency installation, type checking, and Next.js build verification.
- Confirmed Vercel deployment success for the strengthened `main` state.
- Added `/platform` and `/trust` as first product detail surfaces.
- Added `/api/readiness` and `/api/events` as stable foundation-level operational endpoints.
- Added dedicated pages for Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower.
- Linked module pages from `/platform` and exposed module routes from `/api/status`.
- Added the SCRIMED OS Hub data model, `/hub` console, and `/api/hub/summary` endpoint.
- Wired homepage, status, and readiness surfaces to the Hub layer.
- Added integration contracts for FHIR, HL7 v2, DICOM/DICOMweb, claims/utilization, pricing transparency, and synthetic clinical testing.
- Added the interoperability control plane with typed standards, official-source references, conformance requirements, APIs, and contract bindings.
- Added executable synthetic conformance test kits for FHIR R4 and US Core, SMART App Launch, and DICOMweb with deterministic checks, evidence artifacts, Interoperability Agent ownership, and exact live-use blockers.
- Added `/integrations` and `/api/contracts`, then wired contracts into Hub, readiness, and homepage surfaces.
- Fixed the likely CI workflow failure caused by npm caching without a lockfile.
- Added shared Hub operations data and backed `/api/readiness` and `/api/events` with it.
- Added `/hub/readiness` and `/hub/events` console views.
- Added detailed pages and per-contract API routes for every integration contract.
- Added synthetic clinical scenarios, `/synthetic`, scenario detail pages, `/api/synthetic/scenarios`, and per-scenario API routes.
- Added structured synthetic request and expected-output fixture contracts for CarePath AI, DocuTwin, and TrialCore validation.
- Added deterministic synthetic validation checks, `/synthetic/validation`, `/api/synthetic/validation`, and per-scenario validation APIs.
- Added quality gate modeling, `/quality`, and `/api/quality/gates`.
- Promoted executable synthetic validation into the quality gates summary.
- Wired quality gates into the Hub route inventory, readiness checks, event stream, homepage, and Hub console.
- Replaced the failing or unavailable verification path with a documented Vercel plus synthetic validation process.
- Codified the SCRIMED SOLUTIONS master operating context in `docs/master-operating-context.md`, `app/lib/operatingContext.ts`, `/operating-context`, and `/api/operating-context`.
- Added SCRIMED Atlas and FaithCore surfaces with explicit enterprise, faith, and clinical-safety boundaries.
- Added a governed agent workflow registry in `app/lib/agentWorkflows.ts`, `/agents`, `/agents/[slug]`, `/api/agents/workflows`, and `/api/agents/workflows/[slug]`.
- Added synthetic request and expected-response fixtures for FHIR, HL7 v2, DICOM/DICOMweb, claims/utilization, and pricing transparency contracts.
- Added integration fixture validation and diff fingerprints in `/integrations/fixture-validation` and `/api/integration-fixtures/validation`.
- Recorded https://www.scrimedsolutions.com as the official SCRIMED SOLUTIONS website through Wix.
- Added fixture change-review fingerprints in `app/lib/fixtureChangeReviews.ts`, `/fixtures/change-review`, and `/api/fixtures/change-review`.
- Added the first synthetic workflow execution readiness surface for CarePath AI in `app/lib/workflowExecutions.ts`, `/workflows`, `/workflows/[slug]`, `/api/workflows/executions`, and `/api/workflows/executions/[slug]`.
- Expanded synthetic workflow execution readiness to CarePath AI, DocuTwin, and TrialCore.
- Added deterministic workflow execution result fixtures in `app/lib/workflowExecutionResults.ts`, `/workflows/results`, `/workflows/results/[slug]`, `/api/workflows/results`, and `/api/workflows/results/[slug]`.
- Promoted workflow result fixtures into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow detail pages.
- Added workflow result validation diffs in `app/lib/workflowResultValidation.ts`, `/workflows/results/validation`, and `/api/workflows/results/validation`.
- Added workflow promotion review records in `app/lib/workflowPromotionReviews.ts`, `/workflows/promotion-review`, and `/api/workflows/promotion-review`.
- Promoted workflow result validation and promotion review into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow detail pages.
- Added governed execution API contracts in `app/lib/workflowExecutionContracts.ts`, `/workflows/contracts`, `/workflows/contracts/[slug]`, `/api/workflows/contracts`, and `/api/workflows/contracts/[slug]`.
- Promoted governed execution API contracts into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation.
- Added deny-by-default governed execution readiness in `app/lib/workflowImplementationReadiness.ts`, `/workflows/implementation-readiness`, `/workflows/implementation-readiness/[slug]`, `/api/workflows/implementation-readiness`, and `/api/workflows/governed-execution/[slug]`.
- Promoted locked execution endpoints into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation.
- Added denied execution audit boundaries in `app/lib/workflowExecutionAudit.ts`, `/workflows/execution-audit`, `/workflows/execution-audit/[slug]`, `/api/workflows/execution-audit`, and `/api/workflows/execution-audit/[slug]`.
- Added evidence headers to locked governed execution POST responses without parsing request bodies.
- Promoted denied-execution audit boundaries into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation.
- Added audit persistence readiness in `app/lib/auditPersistenceReadiness.ts`, `/workflows/audit-persistence`, and `/api/workflows/audit-persistence`.
- Promoted audit persistence readiness into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation while keeping durable logging decision-required.
- Added identity and access readiness in `app/lib/identityAccessReadiness.ts`, `/workflows/identity-access`, and `/api/workflows/identity-access`.
- Promoted identity and access readiness into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation while keeping governed execution deny-by-default.
- Added execution-attempt readiness in `app/lib/executionAttemptReadiness.ts`, `/workflows/execution-attempts`, and `/api/workflows/execution-attempts`.
- Promoted execution-attempt readiness into Hub route inventory, readiness checks, events, quality gates, homepage signals, workflow console navigation, and deny-by-default evidence headers while keeping attempt creation disabled.
- Added the expanded Product Console operating layer with services, agents, workflow engine examples, governance controls, evidence metrics, buyer actions, and downloadable readiness brief.
- Added `/demos`, `/demos/[slug]`, `/api/demos`, and `/api/demos/[slug]` with five executable buyer demos that connect named products and agents to guided steps, proof routes, outcomes, governance boundaries, and production exclusions.
- Added `/pilots`, `/pilots/[slug]`, `/api/pilots`, and `/api/pilots/[slug]` with four sellable enterprise programs that define duration, engagement model, included demos, deliverables, buyer inputs, success metrics, governance gates, and production exclusions.
- Promoted the Demo and Pilot Center into the Product Console, Hub, readiness checks, event stream, quality gates, homepage buyer path, platform catalog, commercial routing, readiness brief, and documentation.
- Added `/pilot`, `/api/pilot/intake`, and `app/lib/pilotIntake.ts` for governed enterprise pilot intake, no-PHI validation, synthetic/evaluation-only acknowledgement, qualification, and CRM-ready handoff packaging.
- Added a private, token-gated Supabase intake ledger so the API does not report a buyer request as accepted unless a durable destination retained it.
- Added downloadable buyer-ready demo briefs and non-binding pilot proposals for every configured product demo and pilot program.
- Added `/pricing`, `/api/commercial/pricing`, and `app/lib/commercialStrategy.ts` for recommended pricing tiers, sales motion, value metrics, buyer route strategy, and commercial guardrails.
- Added `/operations`, `/api/operations/readiness`, and `app/lib/companyOperations.ts` for go-live blocker tracking, buyer-route checklist, owner assignments, resolution paths, and fallback processes.
- Added SCRIMED AgentOS v1 in `app/lib/agentOS.ts`, `/agents`, `/api/agent-os`, and `/api/agent-os/tasks` with planner, router, specialist registry, memory fabric, TrustQA, audit logging, human approval checkpoints, MCP connector framework, sandbox runtime, RBAC, observability, and production-gated task planning.
- Added SCRIMED Atlas Intelligence Core v1 in `app/lib/atlasIntelligenceCore.ts`, `/atlas`, and `/api/atlas/intelligence-core` with structural document intelligence, evidence source contracts, Trust Cards, continuous validation metrics, AI Asset Registry, shadow-AI detection, and reimbursement-aware posture.
- Added `/memory`, `/audit`, `/observability`, `/api/memory`, `/api/audit`, `/api/observability`, and `/api/trust/cards` to expose the memory fabric, audit/governance layer, continuous validation dashboard, and Trust Card system.
- Promoted AgentOS and Atlas Core into the homepage, Hub, Product Console, Workflow Console, Trust surface, readiness brief, route inventory, and commercial positioning while preserving the synthetic pilot and enterprise assessment boundary.
- Added the interactive AgentOS Evaluation Workspace in `/evaluation`, `app/lib/agentEvaluationWorkspace.ts`, and `/api/agent-os/evaluation` to generate synthetic task plans, structural parser assignments, Atlas Trust Cards, evidence sources, audit previews, blocked capabilities, and observability outcome records.
- Added executable TrustOS v1 in `/trust-os`, `app/lib/trustOS.ts`, `/api/trust-os`, and `/api/trust-os/evaluate` with deterministic PHI Shield, Agent Firewall, Clinical Guardian, policy, model-route, explainability, compliance, human-escalation, and metadata-only Clinical Trace decisions.
- Embedded TrustOS decisions into AgentOS synthetic evaluations so durable protected-pilot sessions and proof packets carry request governance evidence.
- Repaired Sales Operations TOTP enrollment recovery so pending factors survive refresh, can be verified into AAL2, or can be safely restarted when a QR setup is lost.
- Promoted company operations readiness into the Product Console proof stack and downloadable readiness brief so go-live blockers, manual actions, owners, and fallbacks are visible during buyer and investor review.
- Updated `react` and `react-dom` to `19.2.4`, Next.js to `16.2.7`, and committed a controlled lockfile with patched PostCSS `8.5.15`.
- Authenticated GitHub CLI, pushed queued `main` commits, confirmed Vercel production deployments reach READY through the Git integration path, and verified `app.scrimedsolutions.com` returns SCRIMED health status.
- Added authenticated Agent Workspace cockpit controls for governed synthetic work-order creation, protected state transitions, reviewer assignment, outcome metric capture, local governance export, and append-only event review while preserving no-PHI/no-clinical-execution boundaries.
- Added `npm run smoke:agent-workspace` for fail-closed public verification and optional authenticated tenant-admin/pilot-lead happy-path testing when an approved AAL2 bearer token is supplied.

## Recommended Next Steps

1. Use `/trust-os` to evaluate every new synthetic agent action and retain the TrustOS decision inside AgentOS evaluation and proof-packet evidence.
2. Operate new buyer opportunities through `/sales-operations`, assign an accountable owner, set a due action, release audited commercial artifacts, and prepare assessment invitations.
3. Use the vendor-neutral native CRM export immediately; configure `SCRIMED_PILOT_INTAKE_WEBHOOK_URL` and optional `SCRIMED_PILOT_INTAKE_WEBHOOK_TOKEN` only when an approved CRM destination is selected.
4. Operationalize tenant onboarding, access review, proof-packet retention, buyer-specific pilot activation, and the Agent Workspace authenticated smoke script with approved tenant secrets.
5. Implement the server-audited retention/legal-hold and incident-export ledger before representing dashboard governance exports as retained legal or incident evidence.
6. Add scoped evidence upload only after identity, privacy, malware scanning, retention, and durable audit controls are approved.
7. Keep Vercel, GitHub Actions, local build verification, demo proof packets, and quality gates as independent active deploy-quality paths.
8. Promote governed execution beyond deny-by-default only after auth, identity, execution-attempt idempotency, persistence, durable audit logging, privacy/security review, connector boundary decisions, rate limits, and shutdown controls are explicit.

## Notes

Future work should branch from `main` and treat the current Next.js site as the execution foundation. The older FastAPI and one-off Vercel repair branches should remain closed unless a specific implementation detail is being intentionally reused.
