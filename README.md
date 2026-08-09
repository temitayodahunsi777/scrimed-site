# SCRIMED AI Platform

SCRIMED is an AI-driven healthcare operations intelligence platform buyers can evaluate through no-PHI product demos, packaged workflow assessments, synthetic pilots, protected enterprise pilots, buyer diligence, and investor-ready proof. Its public positioning should sell trust, reliability, and safety as buying advantages: proof before production risk, visible limitations before procurement, and human-reviewed evidence before claims expand.

Official website: https://www.scrimedsolutions.com

The mission of SCRIMED is to help healthcare leaders modernize operations, improve decision visibility, reduce systemic inefficiencies, and purchase trustworthy AI workflow intelligence with clear proof, pricing, governance, reliability discipline, and retained safety boundaries.

Current product boundary: this repository presents SCRIMED as a governed synthetic pilot and enterprise evaluation product. Public positioning must remain operations-first: workflow intelligence, evidence organization, audit readiness, buyer diligence, and controlled synthetic evaluation. It does not execute live clinical care, autonomous diagnosis, treatment recommendation, payer submission, patient outreach, or production medical-record workflows.

Workspace hygiene: use `npm run hygiene:workspace` when switching from build/demo work back to implementation work. It clears authoritative generated output and TypeScript build info while retaining only a verified non-authoritative `.next/cache`, verifies ignore rules, rejects stale duplicate-suffixed siblings, checks for disposable temp files, and preserves only contract-backed top-level SCRIMED artifacts. It does not remove source modules, docs, migrations, safety gates, or smoke coverage.

Production architecture boundary: `/production-architecture`, `/api/production-architecture`, and `/api/production-architecture/brief` organize SCRIMED's Agent Runtime, Context Engine, Trust Engine v2, Model Router, Evaluation Engine, ClinSecOps pipeline, and Workflow Engine into a typed, testable architecture contract. The SCRIMED Intelligence Layer can reference OpenAI, Claude, Gemini, Llama, Mistral, Qwen, Z.ai GLM, DeepSeek, and future models only as governed provider routes with telemetry, fallback, and human-review requirements. This does not authorize PHI processing, live patient data, production model routing, autonomous clinical action, payer submission, EHR writeback, claim submission, production connector approval, HIPAA/SOC/HITRUST/FDA certification, or clinical production use.

Execution attempt envelope boundary: `/workflows/execution-attempts`, `/api/workflows/execution-attempts/envelope`, and `/api/workflows/execution-attempts/envelope/brief` convert the next runtime step into metadata-only, no-PHI execution-attempt envelopes with deterministic idempotency keys, replay metadata, model-route telemetry, human review gates, audit traces, failure recovery, and no-PHI scorecards. This does not persist live attempts, authorize PHI processing, approve production model routing, grant live clinical care authority, submit payer or claim actions, write to EHRs, contact patients, approve production connectors, or enable autonomous protected workflow execution.

Execution attempt durable-store boundary: `/api/workflows/execution-attempts/durable-store`, `/api/workflows/execution-attempts/durable-store/brief`, `/api/workflows/execution-attempts/durable-store/record`, `/api/workflows/execution-attempts/durable-store/replay`, and `/api/workflows/execution-attempts/durable-store/review-disposition` add a migration-ready tenant-scoped durable metadata store for known no-PHI envelopes, idempotency TTL, locking, replay lookup, regional retention, immutable events, and protected human-review dispositions. Protected writes require Supabase Auth, AAL2 governance session, tenant workspace access, server runtime token, and the Supabase migration. This does not authorize live clinical production, PHI, autonomous workflow execution, production connectors, patient outreach, payer submission, EHR writeback, final billing, or production model routing.

Durable-store activation risk controls:

- Apply `supabase/migrations/20260627191852_execution_attempt_durable_store.sql`, `supabase/migrations/20260627214607_execution_attempt_durable_store_rpc_hardening.sql`, and `supabase/migrations/20260627222843_execution_attempt_durable_store_advisor_alignment.sql`.
- Verify live migration history, private tables, RLS, deny policies, table grants, public security-invoker RPC wrappers, guarded private implementation RPCs, and foreign-key index coverage before enabling `SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=true`.
- Use `npm run smoke:aal2:token` to preflight a short-lived AAL2 tenant token and store it only in local shell env or gitignored `.env.local`; see `docs/aal2-durable-store-smoke.md`.
- Run `npm run smoke:execution-attempt-durable-store:authenticated` with `SCRIMED_REQUIRE_AUTHENTICATED_SMOKE=true`, `SCRIMED_BEARER_TOKEN`, and `SCRIMED_WORKSPACE_SLUG` before tenant canaries.
- Prefer `npm run smoke:aal2:durable-store:strict` for the authenticated no-PHI durable-store canary once the target app has protected writes enabled.
- Resolve the Supabase leaked-password-protection advisor warning before using password sign-in for protected operations, or keep protected routes passkey/magic-link first with password sign-in excluded.
- Roll back by setting `SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=false`; preserve retained no-PHI audit evidence for review.

Healthcare Intelligence OS boundary: `/healthcare-intelligence-os`, `/api/healthcare-intelligence-os`, and `/api/healthcare-intelligence-os/brief` organize medical capability planning, clinical awareness, patient-safety controls, clinical workflow automation, patient-engagement analysis, interoperability bindings, operations optimization, and clinician administrative burden reduction into synthetic, metadata-only, draft, queueing, readiness, and human-reviewed support. This does not authorize PHI processing, live chart pulls, patient matching, patient outreach, diagnosis, treatment, prescribing, emergency triage, EHR filing, EHR writeback, order entry, payer submission, clinical-risk prediction, reimbursement guarantees, security certification, regulatory approval, or autonomous clinical execution.

SCRIMED OS Upgrade Batch boundary: `/api/scrimed-os/upgrade-batch` and `/api/scrimed-os/upgrade-batch/brief` expose synthetic metadata for runtime optimization, prompt evolution, judge scoring, human oversight, agent lab validation, cost-per-outcome economics, long-horizon agents, clinical knowledge fabric, model regression watch, life-sciences research previews, and public trust/investor narrative. This does not call live models, process PHI, generate clinical recommendations, diagnose, treat, prescribe, interpret imaging, mutate EHRs, submit payer transactions, contact patients, activate production connectors, claim certification, validate clinical performance, or approve customer go-live.

Clinical Data Fabric boundary: `/api/clinical-data-fabric` and `/api/clinical-data-fabric/brief` expose no-live-PHI healthcare source contracts, semantic normalization, provenance, governance, and health-graph projection rules. Agents must request governed semantic concepts only; the layer does not activate production connectors, expose raw schemas, ingest live records, mutate EHRs, submit payer transactions, contact patients, or authorize clinical care.

Clinical Data Governance boundary: `/api/clinical-data-governance` and `/api/clinical-data-governance/brief` evaluate enum-based metadata policy requests for role, purpose, data class, action, destination, consent, review state, contract readiness, tenant scope, minimum necessary access, residency, model authority, and connector authority. The layer does not accept raw patient text, ingest records, process PHI, authorize external model PHI processing, mutate records, submit payer transactions, contact patients, or approve production go-live.

Clinical Context Gateway boundary: `/api/clinical-context-gateway` and `/api/clinical-context-gateway/brief` convert allowed metadata-only source-contract requests into governed semantic context envelopes for agents. The gateway blocks raw schemas, raw connector payloads, credentials, free-text records, live PHI, EHR writeback, payer submission, patient outreach, production connector activation, autonomous diagnosis, treatment, prescribing, imaging interpretation, and customer go-live approval.

Company assessment boundary: `/company-assessment`, `/api/company-assessment`, and `/api/company-assessment/brief` organize whole-company posture across product, services, revenue, margin, legal, accounting, tax, certification, cybersecurity, AI, health records, launch, investors, operations, limitations, team lanes, hard stops, proof routes, audit findings, revenue builders, competitive edge amplifiers, improvement priorities, and missing capability closure records. This is strategic and operational readiness material only. It is not legal advice, accounting advice, tax advice, audited financial reporting, investment advice, securities offering material, solicitation, valuation assurance, certification, security assurance, PHI processing approval, production connector approval, customer permission, public launch approval, contractual SLA, revenue guarantee, profit-margin guarantee, reimbursement assurance, or live clinical care authorization.

Clinical production readiness boundary: `/clinical-production-readiness`, `/api/clinical-production-readiness`, and `/api/clinical-production-readiness/brief` track the tasks required before live clinical production, PHI/ePHI scope, production EHR or payer connectivity, patient-impacting AI, regulated clinical claims, customer go-live, and global clinical deployment. This is a readiness tracker only. It does not grant legal advice, medical advice, regulatory approval, HIPAA compliance, SOC 2/HITRUST/ISO certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, PHI processing authority, production connector approval, customer permission, launch approval, reimbursement assurance, contractual SLA, revenue guarantee, profit-margin guarantee, securities material, investment advice, valuation assurance, or live clinical care authorization. Current allowed use remains no-PHI demos, paid readiness services, synthetic pilots, buyer diligence packets, AI governance reviews, health-record sandbox planning, and investor or clinic readiness conversations.

SCRIMED Work now includes governed agent-team templates, model and agent approval passports,
bounded offline effort routing, and evidence-tagged impact, workforce, procurement, and sovereign
readiness contracts. These controls support synthetic evaluation and human review only; they do
not authorize provider calls, PHI, clinical care, deployment, audited ROI claims, contracts, or
customer go-live.

The same control plane now adds a deterministic twelve-lane AI-assisted review orchestrator,
bounded agent-team cost/runtime/action controls, fail-closed unverified-model admission, and
portable Wix, preview UI, and disposable-migration verification. AI review never substitutes for
named legal, clinical, privacy, security, database, finance, release, deployment, PHI, or customer
approval. See `docs/governance/GATE_CLOSURE_REGISTER.md` for the exact closure path.

Pilot demo commercial readiness boundary: `/pilot-demo-commercial-readiness`, `/api/pilot-demo-commercial-readiness`, and `/api/pilot-demo-commercial-readiness/brief` map public demos into recommended pilot packages, price bands, proof assets, market benchmarks, no-PHI intake routes, margin rules, and hard stops before buyer-specific work expands. This is commercial readiness and pricing guidance only. It is not a signed quote, contract, procurement approval, customer permission, legal/accounting/tax advice, audited financial reporting, securities material, investment advice, valuation assurance, revenue guarantee, profit guarantee, ROI guarantee, reimbursement guarantee, PHI processing authority, production connector approval, EHR writeback approval, payer submission approval, security certification, or live clinical care authorization.

Launch readiness boundary: `/launch-readiness`, `/api/launch-readiness`, and `/api/launch-readiness/brief` organize launch structure, product readiness, service readiness, functional verification, strict branded-domain smoke, sandbox DNS classification, fallback continuity, protected proof boundaries, and launch hard stops. This is operating-readiness evidence only. It does not bypass sandbox restrictions, override DNS, approve production clinical use, authorize PHI processing, certify security or compliance, create a contractual SLA, approve production connectors, approve customer release, provide legal/accounting/tax advice, guarantee revenue or profit, or replace qualified human launch review.

Competitive defense boundary: `/competitive-defense`, `/api/competitive-defense`, and `/api/competitive-defense/brief` organize competitor threat profiles, weakness relief, no-copy counter-positioning, legal/privacy/cybersecurity controls, infiltration-deterrence layers, and external review gates. This is strategic readiness evidence only. It does not copy competitor products, provide legal advice, authorize PHI processing, certify security or compliance, authorize penetration testing, assert competitor partnerships, guarantee protection from attack, approve customer release, or authorize live clinical care.

Strategic execution boundary: `/strategic-intelligence` and `/api/strategic-intelligence` convert public market signals into SCRIMED-specific execution bets, strategic execution commands, execution scorecards, proof metrics, stop conditions, decision gates, allow/block conditions, proof routes, current proof, missing proof, owners, commercial outcomes, revenue motions, promotion criteria, demotion triggers, escalation paths, blocked expansion controls, and retained boundaries. This is strategic operating material only. It does not assert partnerships, copy third-party products, authorize PHI processing, approve production connectors, certify compliance/security, create public API SLAs, release customer proof, provide legal/accounting/tax/investment advice, guarantee revenue or profit, or authorize live clinical care.

Enterprise readiness boundary: `/trust-center` and `/claims` expose accountable legal, security, privacy, brand, governance, marketing, PR, sales, advertising, and claims-control readiness. These surfaces are operational registers, not legal advice, certification, regulatory approval, or authorization for live clinical execution.

Limitations and boundary control plane: `/boundary-resolution`, `/api/boundary-resolution`, and `/api/boundary-resolution/brief` centralize clinical, PHI, health-records, legal, regional, reimbursement, security, QA, public-market, global certification, continuous review, innovation, enterprise legal/finance, revenue, investor, securities, and production-readiness limits into owned records, safe workarounds, proof routes, prohibited claims, and retained gates. This is limitation management only. It does not authorize live clinical care, PHI processing, legal/accounting/tax advice, certification, audited financial reporting, securities material, revenue or profit guarantees, managed 24/7 SOC/MDR coverage, public quantum capability claims, autonomous remediation, production connectors, or customer release authority.

Boundary release approval matrix: `/boundary-release-approvals`, `/api/boundary-release-approvals`, and `/api/boundary-release-approvals/brief` document the approval path for live PHI, clinical decision support, autonomous clinical action, EHR writeback, payer submission, research/outcomes learning, certification claims, global operation, and customer go-live. This is release-path documentation only. It does not relieve any preserved boundary or grant PHI authority, clinical authority, payer submission authority, EHR writeback authority, production connector approval, certification claims, or customer go-live approval.

Limitations workaround boundary: `/limitations-workarounds`, `/api/limitations-workarounds`, and `/api/limitations-workarounds/brief` turn hard boundaries, defects, bottlenecks, unsupported claims, blocked buyer requests, and current build/smoke/tooling blockers into safe workaround packets, a boundary escalation matrix, a known-limit resolution queue, escalation owners, proof routes, expiration rules, fail-closed checks, next proof commands, and graduation gates. This is containment only. It does not authorize PHI processing, live clinical care, production connectors, public API SLAs, autonomous remediation, live autonomous AI, production model routing, legal/accounting/tax advice, audited financial reporting, security certification, accessibility certification, regulatory approval, buyer release, public quantum capability claims, revenue guarantees, or profit-margin guarantees.

Investor and audience readiness boundary: `/investor-audience-readiness`, `/api/investor-audience-readiness`, and `/api/investor-audience-readiness/brief` turn known weaknesses, competitive edge, sellable value, and target audiences into owned relief tracks, proof-backed pitch packets, next moves, and qualified-review gates. This is readiness material only. It is not investment advice, securities offering material, solicitation, audited financial reporting, valuation assurance, legal advice, tax advice, accounting advice, nonprofit tax advice, donor advice, faith-based endorsement, customer revenue guarantee, profit guarantee, reimbursement assurance, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.

Protected release governance: `/pilot-workspace/access` includes no-PHI finance methodology, external approval evidence, release decisions, named reviewer sign-offs, disabled distribution lockbox, release authority attestation controls, evidence-room recipient/access-log/provider-adapter controls, provider security review readiness, procurement evidence routing, the Protected Clinical Authority Evidence Room, the Protected Clinical Authority Owner Matrix, the Protected Clinical Authority Artifact Intake Checklist, Protected Authority Artifact References, and the Protected Authority Renewal Queue with authenticated QA harness. These controls produce audited synthetic pilot evidence only and do not authorize public release, external distribution, legal claims, customer proof, advertising claims, security approval, procurement approval, BAA/DPA execution, production use, live integration, PHI processing, or clinical care.

QA evidence activation boundary: `/api/qa-evidence/activation-plan` and `/api/qa-evidence/activation-plan/brief` define the no-secret sequence for human AAL2 Sales Demo Session QA and Authority Reference QA runs before evidence is persisted into Buyer Diligence. This is an operator activation plan only. It does not mint tokens, execute passkey ceremonies, bypass AAL2, store secrets, store PHI, certify compliance, or grant clinical authority.

Global reach boundary: `/global-reach`, `/api/global-reach`, and `/api/global-reach/brief` expose region focus, buyer localization packs, partner channels, procurement questions, competitive edge, and contained boundary workarounds for global expansion. This is localization and go-to-market readiness only. It is not legal advice, regional regulatory approval, public-sector procurement approval, compliance certification, reimbursement assurance, production authorization, or live clinical execution authority.

Global certification readiness boundary: `/global-certification-readiness`, `/api/global-certification-readiness`, and `/api/global-certification-readiness/brief` organize future domestic and global approval preparation across HIPAA/BAA, FDA CDS/SaMD, SOC 2, HITRUST, ISO 27001, ISO 42001, EU AI Act, GDPR, NHS DTAC, MHRA, Australia Essential Eight, and regional buyer gates. This is readiness planning only. It is not legal advice, HIPAA compliance certification, SOC 2/HITRUST/ISO certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, NHS approval, MHRA approval, Australian cyber certification, PHI processing authority, public-sector procurement approval, reimbursement assurance, production authorization, or live clinical care authority.

Continuous review and innovation boundary: `/continuous-review-audit`, `/api/continuous-review-audit`, and `/api/continuous-review-audit/brief` organize 24/7 agent-assisted accuracy review, evidence attribution, claims guard, security drift, QA regression, incident learning, and internal innovation research. This is review and readiness infrastructure only. It is not managed 24/7 SOC/MDR coverage, autonomous production remediation, legal advice, security certification, regulatory approval, PHI processing authority, clinical care authority, public quantum capability claim, product commitment, investment advice, or permission to bypass human review.

Clinical authority boundary: `/clinical-authority-readiness`, `/api/clinical-authority-readiness`, `/api/clinical-authority-readiness/brief`, `/pilot-workspace/access#clinical-authority-evidence-room`, `/pilot-workspace/access#clinical-authority-owner-matrix`, `/pilot-workspace/access#clinical-authority-artifact-intake`, `/pilot-workspace/access#authority-artifact-references`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room/packet`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix/packet`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake/packet`, `/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references`, `/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue`, and `/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet` expose hard-gate preparation and protected no-PHI evidence, owner routing, external artifact intake criteria, metadata-only external reference status, renewal queue actions, and authenticated QA verification for live clinical care authority, PHI processing, legal approval, regional regulatory approval, reimbursement review, security certification, connector acceptance, and production clinical authorization. This is readiness only. It is not legal advice, privacy advice, reimbursement advice, security certification, clinical validation, regional regulatory approval, PHI processing authority, production authorization, artifact storage, signed approval, or live clinical-care authority.

Approvals readiness boundary: `/approvals-readiness`, `/api/approvals-readiness`, and `/api/approvals-readiness/brief` organize the operating ladder for public claims, HIPAA/BAA readiness, SOC 2/HITRUST assurance, FDA/CDS/SaMD classification, ONC/interoperability acceptance, state care-delivery review, and buyer-specific release gates. This is approval preparation only. It is not legal approval, HIPAA certification, SOC 2 certification, HITRUST certification, FDA clearance, ONC certification, reimbursement certainty, PHI processing authority, production connector approval, public customer permission, or live clinical-care authority.

Health records safety boundary: `/health-records`, `/api/health-records`, `/api/health-records/brief`, and `/api/health-records/extract` organize no-PHI record extraction planning, standards mapping, source attribution, patient-safety checks, synthetic extraction evaluation, and retained live-data workarounds for FHIR, HL7 v2, C-CDA, DICOM/DICOMweb, X12, USCDI, TEFCA, and CMS API readiness. This is synthetic and metadata-only readiness. It does not authorize live PHI ingestion, production EHR/HIE/payer/imaging/device connectors, patient matching, diagnosis, treatment, emergency triage, order entry, prescribing, patient outreach, payer submission, EHR writeback, record mutation, clinical validation, or live-care authority.

Release continuity boundary: `/release-continuity`, `/api/release-continuity`, and `/api/release-continuity/brief` tie production deployment proof, source-control checkpoints, public smoke, protected fail-closed checks, and the human AAL2 operator boundary into one operating lane. This is release evidence only. It does not mint tokens, store secrets, bypass AAL2, approve buyer release, authorize PHI processing, certify security or compliance, grant legal approval, or authorize live clinical care.

Navigation audit boundary: `/navigation`, `/api/navigation-audit`, and `/api/navigation-audit/brief` organize page route inventory, API route pattern counts, app-wide navigation groups, role-based journeys, limitation-control links, smoke coverage, protected fail-closed checks, and retained AAL2 or external-review bottlenecks. This is route-control evidence only. It does not approve release, certify every protected workflow execution, bypass AAL2, authorize PHI processing, certify security/compliance, grant legal approval, approve production connectors, or authorize live clinical care.

Service reliability boundary: `/service-reliability`, `/api/service-reliability`, and `/api/service-reliability/brief` map product/service controls, fault classes, efficiency improvements, owners, proof routes, and retained approval boundaries. This is reliability hardening only. It does not approve release, certify security/compliance, grant legal approval, authorize PHI processing, bypass AAL2, approve production connectors, authorize public customer proof, guarantee reimbursement, or authorize live clinical care.

Operational efficiency boundary: `/operational-efficiency`, `/api/operational-efficiency`, and `/api/operational-efficiency/brief` centralize gaps, inefficiencies, bottlenecks, fault classes, release gates, route coverage gaps, discrepancy and fault triage, growth constraints, enterprise controls, continuous-review hard stops, owners, proof routes, and resolution sprints. This is execution discipline only. It does not authorize autonomous production remediation, bypass AAL2, process PHI, approve live clinical care, certify security or compliance, provide legal/accounting/tax advice, approve production connectors, guarantee revenue, guarantee profit margin, approve buyer release, or replace qualified human review.

Product and services portfolio boundary: `/offerings`, `/api/offerings`, and `/api/offerings/brief` package SCRIMED offers, service tiers, delivery playbooks, proof routes, qualification gates, margin controls, and retained boundaries into one sellable operating layer. This is product/service packaging readiness only. It does not approve contracts, provide legal/accounting/tax advice, create audited financial reporting, provide securities material, guarantee revenue or profit, authorize PHI processing, certify compliance/security, approve production connectors, approve EHR writeback or payer submission, or authorize live clinical care.

Service delivery boundary: `/service-delivery`, `/api/service-delivery`, and `/api/service-delivery/brief` convert SCRIMED offers into scoped work orders, acceptance criteria, delivery artifacts, buyer handoffs, margin protections, and authority gates. This is product and services execution control only. It is not a statement of work, contract approval, legal/accounting/tax advice, audited financial reporting, contractual SLA, uptime guarantee, managed-service commitment, customer permission, revenue guarantee, profit-margin guarantee, PHI processing authority, production connector approval, clinical validation, compliance certification, security certification, EHR writeback approval, payer submission approval, or live clinical care authorization.

Client onboarding and communications boundary: `/client-onboarding`, `/api/client-onboarding`, and `/api/client-onboarding/brief` organize buyer onboarding, demos, pilots, presentations, meeting cadences, email-ready copy, calendar-ready agendas, internal handoffs, follow-up SLAs, and no-PHI communication controls. This is communication readiness only. It does not send email, create calendar invites, bind contracts, approve procurement, approve BAA/security posture, store PHI, process live clinical records, create customer permission, provide legal/accounting/tax advice, certify compliance, approve production connectors, guarantee revenue or ROI, or authorize live clinical care.

Capital vitality boundary: `/capital-vitality`, `/api/capital-vitality`, and `/api/capital-vitality/brief` organize revenue capabilities, competitive moat evidence, investor-readiness milestones, funding workstreams, proof routes, and retained external-review gates. This is growth readiness only. It is not investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, reimbursement assurance, customer revenue guarantee, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.

Commercial growth engine boundary: `/growth-engine`, `/api/growth-engine`, and `/api/growth-engine/brief` organize buyer segments, sellable offers, revenue motions, conversion lanes, revenue proof steps, bottlenecks, owners, and proof routes. This is growth execution readiness only. It is not a customer revenue guarantee, investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, reimbursement assurance, procurement approval, customer permission, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.

Enterprise business operations boundary: `/enterprise-business-ops`, `/api/enterprise-business-ops`, and `/api/enterprise-business-ops/brief` organize revenue capability, profit-margin discipline, legal operations, finance/accounting controls, tax-awareness routing, deal-desk approval, contract authority, billing readiness, and audit evidence for qualified human review. This is operating-readiness material only. It is not legal advice, accounting advice, tax advice, audited financial reporting, securities offering material, investment advice, valuation assurance, contract approval, revenue guarantee, profit-margin guarantee, reimbursement assurance, customer permission, certification, PHI processing authority, production connector approval, or live clinical care authorization.

Enterprise scalability operations boundary: `/enterprise-scalability`, `/api/enterprise-scalability`, and `/api/enterprise-scalability/brief` organize capacity planning, tenant isolation, queueing, observability, SLO readiness, incident/change operations, support load, global deployment preparation, disaster recovery planning, and usage-cost governance. This is readiness and operating-design material only. It is not a contractual SLA, uptime guarantee, managed service commitment, 24/7 production support commitment, security certification, production hosting approval, data-residency approval, PHI authority, production connector approval, customer-specific tenancy approval, revenue guarantee, profit-margin guarantee, legal/accounting/tax advice, or live clinical care authorization.

Platform power operations boundary: `/platform-power`, `/api/platform-power`, and `/api/platform-power/brief` organize API contract governance, operator-grade UI navigation, AI model-routing readiness, agent approval, eval loops, evidence retrieval, accessibility readiness, rate limits, idempotency, observability, and platform cost controls. This is enterprise platform readiness only. It is not a public API SLA, production API marketplace launch, live autonomous AI authority, production model-routing approval, PHI processing authority, EHR access approval, production connector approval, model-safety certification, security certification, accessibility certification, clinical validation, contractual uptime guarantee, managed service commitment, or proof of trillion-dollar-company-equivalent capacity.

---

## Core Vision

Healthcare systems today operate with fragmented data, administrative overload, and limited operational visibility. SCRIMED aims to serve as an intelligence layer that sits above existing healthcare infrastructure and enables organizations to:

- Improve operational decision visibility
- Automate operational workflows
- Enhance healthcare accessibility
- Reduce administrative burden on clinicians
- Improve transparency in healthcare costs and care pathways

---

## Platform Architecture

SCRIMED is being designed as a modular AI platform consisting of several core components:

### Clinical Operations Copilot
AI-assisted synthetic-pilot support that helps organize operational evidence, prepare documentation workflows, and route human review without creating diagnosis, treatment, or live-care authority.

### DocuTwin
Automated medical documentation generation from structured and conversational inputs.

### CarePath AI
Synthetic care-navigation and operational pathway optimization for enterprise evaluation. It does not triage patients or authorize clinical action.

### TrialCore
AI-assisted clinical trial discovery and patient matching.

### TrustWatch (Watchtower)
Continuous post-deployment monitoring system designed to detect AI performance regressions, model drift, trust signals, and system reliability across healthcare workflows.

### SCRIMED AgentOS
Governed multi-agent orchestration layer with planner, router, specialist registry, memory fabric, TrustQA verification, audit logging, human approval checkpoints, RBAC posture, MCP connector framework, sandbox runtime, and task-planning endpoints.

### SCRIMED Atlas Intelligence Core
Enterprise intelligence layer for structural document understanding, evidence-backed reasoning, Trust Cards, agent sandbox posture, continuous validation, AI asset governance, shadow-AI detection, and reimbursement-aware operating design.

### SCRIMED Interoperability Control Plane
Standards-aware connector governance for FHIR, SMART App Launch, USCDI, TEFCA, HL7 v2, DICOM/DICOMweb, X12, CMS prior-authorization APIs, C-CDA, IHE profiles, NCPDP SCRIPT, ISO/IEEE 11073, and clinical terminology. The control plane binds standards to synthetic connector contracts, conformance evidence, required controls, and explicit pre-live gates.

### SCRIMED Health Records Safety Exchange
No-PHI health-record extraction and patient-safety control plane for synthetic FHIR bundles, HL7 v2 messages, C-CDA/document intelligence, DICOM metadata, X12/prior-auth context, CSV exports, and note-like fixtures. The exchange produces source-attributed extraction plans, patient-safety lint, hard-stop workarounds, and reviewer packets without processing live records or approving production connectors.

### SCRIMED Intelligence & Safety Stack
Metadata-only safety infrastructure at `/scrimed-intelligence-safety-stack`, `/api/scrimed-intelligence-safety-stack`, and `/api/scrimed-intelligence-safety-stack/brief`. This layer adds Project SENTINEL zero-trust agent execution, deny-by-default permissions, human approval gates for irreversible actions, kill-switch metadata, AI Flight Recorder traces, local write-ahead log scaffolding, human review queues, pytest-compatible regression evaluation scaffolds, clinical capability-vs-correctness envelopes, model cards, healthcare data adapters, local-first de-identification hooks, DocLang-style document structure, outcome review after the first 100-200 approved pilot patients, state-aware orchestration, provider-neutral model-route placeholders, compliance policy scaffolds, and emotional/anthropomorphic AI safeguards.

It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production deploys, cloud IAM changes, payment execution, credential rotation, encryption-key generation, external communications, certification claims, clinical validation claims, or customer go-live.

---

## Watchtower Monitoring System

SCRIMED includes a continuous regression monitoring system designed for healthcare-grade AI systems. The Watchtower system monitors:

- workflow performance
- AI output consistency
- trust and safety signals
- latency and cost metrics
- deployment scorecards
- approval patterns and system drift

This enables early detection of regressions and operational risks before they impact healthcare delivery.

---

## Development Status

SCRIMED is currently under active development. The platform is being designed and iterated through AI-assisted development workflows and modern engineering tooling.

Current focus areas include:

- company-wide operating assessment with readiness score, dimensions, strengths, weakness relief, missing capability closure records, upgrade workstreams, legal/finance/security/AI/health-record hard stops, team lanes, and proof routes
- production architecture contract across Agent Runtime, Context Engine, Trust Engine v2, vendor-neutral Model Router, Evaluation Engine, ClinSecOps, and deterministic Workflow Engine
- healthcare intelligence OS clinical workflow automation tracks for patient safety, patient-engagement analysis, interoperability, operations optimization, and clinician administrative burden reduction
- buyer-ready product demos and structured pilot programs
- client onboarding, demos, pilots, presentations, meetings, email/calendar-ready communication, and handoff controls
- scoped service delivery, work-order templates, acceptance criteria, artifacts, buyer handoffs, and retained no-PHI/no-SLA/no-contract gates
- AI agent architecture
- SCRIMED AgentOS v1 multi-agent orchestration
- SCRIMED Atlas Intelligence Core v1
- Trust Cards, evidence attribution, and TrustQA checks
- memory fabric, audit surfaces, and observability dashboards
- enterprise pilot intake and CRM-ready buyer handoff
- tenant-admin sales opportunity operations with audited proposals and controlled CRM synchronization
- synthetic workflow execution readiness
- deterministic workflow execution result fixtures
- workflow result validation and synthetic-only promotion review
- governed execution API contracts
- identity and access readiness
- execution-attempt readiness
- runtime safety readiness
- product console and commercial pilot packaging
- governed synthetic pilot request capture at `/pilot` and `/api/pilot/intake`
- deny-by-default governed execution endpoints
- denied execution audit boundaries
- audit persistence readiness
- clinical workflow automation
- healthcare data interoperability
- fixture change review and quality gates
- safety and governance infrastructure
- deployment monitoring systems
- public-market claim controls with external approval evidence, versioned release decisions, named reviewer sign-off metadata packets, disabled distribution lockbox controls, release authority attestations, metadata-only evidence-room recipient attestations, access-log reconciliation, provider-adapter contract readiness, provider security review readiness, and procurement evidence routing
- global partner and buyer localization with region packs, audience packs, partner channels, procurement questions, competitive edge, and retained legal/privacy/clinical gates
- clinical authority readiness with hard-gate preparation for live care, PHI, legal approval, regional approval, reimbursement, security certification, connectors, and production authorization
- protected clinical authority evidence rooms with AAL2 no-PHI reviewer owners, retained authority gates, expiration posture, audit history, and audited authority evidence packets
- protected clinical authority owner matrices with customer, SCRIMED, and qualified external approver routing for every hard gate
- release continuity with production-domain smoke, GitHub commit/tag checkpointing, no-secret AAL2 operator workarounds, and protected fail-closed route proof
- navigation audit with page route inventory, API route pattern counts, persistent grouped navigation, role journeys, limitation controls, smoke coverage, protected fail-closed checks, and retained AAL2 or external-review bottlenecks
- service reliability with product/service controls, fault classes, efficiency improvements, owners, proof routes, and retained approval boundaries
- operational efficiency with cross-system gap records, open-bottleneck pressure, hard-stop visibility, proof-route density, and resolution sprints
- product and services portfolio packaging with sellable offers, package tiers, delivery playbooks, qualification gates, proof routes, margin controls, and retained boundaries
- capital vitality with revenue capabilities, competitive moat evidence, investor-readiness milestones, funding workstreams, proof routes, and retained external-review gates
- commercial growth engine with buyer segments, sellable offers, conversion lanes, revenue proof steps, bottlenecks, owners, and proof routes
- enterprise business operations with deal desk, price floors, margin controls, legal/accounting/tax review roles, billing readiness, contract authority, operating cadences, profit levers, and blocked enterprise claims
- enterprise scalability operations with capacity planning, tenant scale, queue/backpressure controls, SLO/SLA guards, incident/change operations, support load, global deployment readiness, disaster recovery planning, usage-cost thresholds, and blocked scale claims
- API, UI, and AI platform power with contract-backed APIs, operator-grade command paths, model-route readiness, agent approval gates, eval/red-team loops, evidence retrieval, accessibility readiness, platform cost telemetry, and blocked scale-equivalence claims
- launch readiness with strict branded-domain smoke, sandbox DNS classification, fallback continuity boundaries, product/service launch tracks, protected proof gates, and launch hard stops
- continuous review, audit, and innovation loops for accuracy review, evidence attribution, claims guard, security drift, QA regression, incident learning, and internal-only quantum-safe research

---

## Repository Purpose

This repository serves as part of the SCRIMED development environment and will contain components related to the SCRIMED web platform and supporting infrastructure.

Additional repositories and modules will be added as the SCRIMED platform expands.

---

## Enterprise Pilot Intake

SCRIMED now includes a governed buyer-intake surface at `/pilot` and a validated API endpoint at `/api/pilot/intake`.

The intake captures business-contact information, buyer segment, target workflows, readiness needs, governance requirements, timeline, interoperability context, and pilot goals. It explicitly rejects protected health information, patient identifiers, live clinical records, diagnosis details, payer member identifiers, and production clinical data.

Validated intake is retained in a private, token-gated Supabase ledger before follow-up. If `SCRIMED_PILOT_INTAKE_WEBHOOK_URL` is configured in Vercel, the API also forwards the sanitized handoff payload to the configured HubSpot, Wix, Zapier/Make, or secure CRM webhook. The API does not report an intake as accepted unless a durable destination accepted it.

Approved SCRIMED tenant-admins manage retained intake at `/sales-operations`. The console supports AAL2 passwordless access, opportunity assignment, due-action cadence, audited non-binding proposal downloads, vendor-neutral CRM imports, optional webhook synchronization, human-reviewed follow-up drafts, audited assessment invitations, and an append-only sales audit trail. Direct access to private lead and audit tables remains denied.

## Demo and Pilot Center

SCRIMED now packages existing executable proof into buyer-ready product and service paths:

- `/demos` and `/api/demos` expose five governed product demos for CarePath AI, DocuTwin, TrialCore, Atlas interoperability readiness, and AgentOS governance evaluation.
- `/pilots` and `/api/pilots` expose four structured enterprise programs with duration, engagement model, deliverables, buyer inputs, success metrics, governance gates, and production exclusions.
- `/demos/[slug]`, `/api/demos/[slug]`, `/pilots/[slug]`, and `/api/pilots/[slug]` expose detailed proof and program packets.
- `/api/demos/[slug]/brief` and `/api/pilots/[slug]/proposal` generate downloadable buyer-ready demo briefs and non-binding pilot proposals.
- `/pilot-demo-commercial-readiness`, `/api/pilot-demo-commercial-readiness`, and `/api/pilot-demo-commercial-readiness/brief` make the demo-to-pilot path seamless by pairing each demo with a recommended pilot, price band, proof asset list, market benchmark context, no-PHI intake route, and retained hard stops.

All demos and programs preserve the synthetic evaluation boundary. They do not authorize live clinical execution, production data exchange, autonomous diagnosis, payer submission, or patient outreach.

---

## AgentOS and Atlas Core Routes

Core enterprise evaluation surfaces:

- `/agents` - SCRIMED AgentOS v1 control plane, service registry, and governance controls
- `/sales-operations` - AAL2 tenant-admin opportunity pipeline, cadence control, audited commercial artifacts, assessment scheduling, and vendor-neutral CRM handoff
- `/demos` - executable buyer demos with guided proof paths and retained production exclusions
- `/pilots` - structured sellable programs with measurable decision criteria and governance gates
- `/pricing` - pricing tiers, sales motion, value metrics, and commercial guardrails
- `/workflows/execution-attempts` - metadata-only execution-attempt envelopes plus migration-ready durable attempt storage with idempotency, replay lookup, model-route telemetry, human review dispositions, audit traces, failure recovery, and no-PHI scorecards
- `/pilot-demo-commercial-readiness` - market-aligned demo-to-pilot accelerator with price bands, proof assets, no-PHI intake routes, and margin hard stops
- `/offerings` - packaged product and service offers, tiers, proof routes, delivery playbooks, margin controls, and retained boundaries
- `/service-delivery` - scoped work orders, acceptance criteria, delivery artifacts, buyer handoffs, margin protections, and authority gates
- `/clinical-authority-readiness` - hard-gate readiness for live clinical care authority, PHI, legal approval, regional approval, reimbursement, security certification, connectors, and production clinical authorization
- `/approvals-readiness` - operating ladder for public claims, HIPAA/BAA, SOC 2/HITRUST, FDA/CDS/SaMD, ONC/connectors, state care-delivery review, and buyer release gates
- `/global-certification-readiness` - domestic and global approval/certification evidence tracks, official-source implications, regional packs, and blocked certification claims
- `/health-records` - no-PHI health-record extraction, source attribution, patient-safety checks, and live-data workarounds
- `/launch-readiness` - launch structure, sandbox DNS workaround, strict branded-domain gates, service paths, hard stops, and fallback-only boundaries
- `/competitive-defense` - competitor threat profiles, weakness relief, legal/privacy/cyber controls, infiltration-deterrence layers, and external review gates
- `/continuous-review-audit` - 24/7 agent-assisted review, audit, mistake-reduction, incident-learning, and internal innovation research control plane
- `/release-continuity` - production/source checkpoint, public smoke, protected fail-closed checks, AAL2 operator boundary, and no-secret workaround lane
- `/service-reliability` - product/service reliability controls, known fault classes, efficiency improvements, owners, proof routes, and retained approval boundaries
- `/operational-efficiency` - cross-system gap, inefficiency, bottleneck, hard-stop, proof-route, owner, and resolution-sprint map
- `/limitations-workarounds` - safe workaround packets, boundary escalation matrix, escalation owners, proof routes, expiration rules, and graduation gates for blocked issues
- `/investor-audience-readiness` - weakness relief, competitive edge, sellable value, and audience-specific packets for investors, clinics, buyers, and partners
- `/capital-vitality` - revenue capability, competitive moat, investor-readiness, funding workstream, proof-route, and external-review gate map
- `/growth-engine` - buyer segment, sellable offer, conversion lane, revenue proof step, bottleneck, owner, and proof-route execution map
- `/enterprise-business-ops` - revenue capability, margin discipline, deal desk, legal/accounting/tax roles, contract authority, billing readiness, operating cadence, and blocked enterprise-claim map
- `/enterprise-scalability` - capacity planning, tenant scale, queueing, SLO readiness, support, incident/change, global deployment, DR, and cost-control map
- `/pilot-workspace/access#clinical-authority-evidence-room` - AAL2 protected no-PHI clinical authority evidence assembly for reviewer owners, retained gates, audit history, expiration posture, and readiness packet export
- `/pilot-workspace/access#clinical-authority-owner-matrix` - AAL2 protected no-PHI approver routing for customer, SCRIMED, and qualified external authority owners
- `/pilot-workspace/access#clinical-authority-artifact-intake` - AAL2 protected no-PHI checklist for external artifact systems, reviewer roles, validation timestamps, expiration cadences, and prohibited-content controls
- `/pilot-workspace/access#authority-artifact-references` - AAL2 protected no-PHI metadata-only capture for external authority artifact reference IDs, reviewer labels, expiration dates, renewal alerts, and status flags
- `/global-reach` - region focus, buyer localization packs, partner channels, procurement questions, and retained approval gates
- `/operations` - company operations readiness, blockers, owners, fallbacks, and buyer route checklist
- `/competitive-intelligence` - public competitor signals translated into original SCRIMED product build paths, target-audience conversion plays, proof metrics, API posture, payer workflows, sales language, and no-copy guardrails
- `/strategic-intelligence` - strategic execution bets, command-plan lanes, execution scorecards, proof metrics, stop conditions, decision gates, allow/block conditions, current proof, missing proof, revenue motions, promotion/demotion controls, blocked expansion controls, and retained boundaries
- `/trust-center` - enterprise readiness domains, owners, evidence, required actions, launch gates, and external-review requirements
- `/claims` - approved, evidence-required, and prohibited public claims
- `/evaluation` - interactive AgentOS synthetic evaluation workspace
- `/trust-os` - executable synthetic governance decisions with PHI Shield, Agent Firewall, Clinical Guardian, model routing, explainability, and Clinical Trace
- `/workflows` - workflow engine and sandbox runtime
- `/memory` - session, operational, and knowledge memory fabric
- `/audit` - audit channels, AI Asset Registry, and approval checkpoints
- `/trust` - TrustQA, Trust Cards, and evidence governance
- `/observability` - continuous validation and operational metrics
- `/atlas` - Atlas Intelligence Core v1 subsystems
- `/interoperability` - standards registry, conformance controls, terminology resolution, and connector bindings
- `/interoperability/evaluations` - executable FHIR R4 and US Core, SMART App Launch, and DICOMweb synthetic conformance test kits
- `/integrations` - standards-bound connector contracts and synthetic fixture validation

Core APIs:

- `/api/agent-os`
- `/api/demos`
- `/api/pilots`
- `/api/commercial/pricing`
- `/api/pilot-demo-commercial-readiness`
- `/api/pilot-demo-commercial-readiness/brief`
- `/api/competitive-intelligence`
- `/api/strategic-intelligence`
- `/api/clinical-authority-readiness`
- `/api/clinical-authority-readiness/brief`
- `/api/approvals-readiness`
- `/api/approvals-readiness/brief`
- `/api/global-certification-readiness`
- `/api/global-certification-readiness/brief`
- `/api/health-records`
- `/api/health-records/brief`
- `/api/health-records/extract`
- `/api/continuous-review-audit`
- `/api/continuous-review-audit/brief`
- `/api/release-continuity`
- `/api/release-continuity/brief`
- `/api/service-reliability`
- `/api/service-reliability/brief`
- `/api/offerings`
- `/api/offerings/brief`
- `/api/service-delivery`
- `/api/service-delivery/brief`
- `/api/operational-efficiency`
- `/api/operational-efficiency/brief`
- `/api/limitations-workarounds`
- `/api/limitations-workarounds/brief`
- `/api/investor-audience-readiness`
- `/api/investor-audience-readiness/brief`
- `/api/capital-vitality`
- `/api/capital-vitality/brief`
- `/api/growth-engine`
- `/api/growth-engine/brief`
- `/api/enterprise-business-ops`
- `/api/enterprise-business-ops/brief`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room/packet`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix/packet`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake/packet`
- `/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references`
- `/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet`
- `/api/global-reach`
- `/api/global-reach/brief`
- `/api/operations/readiness`
- `/api/enterprise-readiness`
- `/api/enterprise-readiness/claims`
- `/api/enterprise-readiness/diligence-brief`
- `/api/agent-os/evaluation`
- `/api/trust-os`
- `/api/trust-os/evaluate`
- `/api/agent-os/tasks`
- `/api/atlas/intelligence-core`
- `/api/memory`
- `/api/audit`
- `/api/trust/cards`
- `/api/observability`
- `/api/interoperability/standards`
- `/api/interoperability/conformance`
- `/api/interoperability/evaluations`

The task-planning API accepts synthetic pilot and enterprise assessment requests only. Production requests are explicitly denied until tenant identity, live connector controls, durable audit logging, privacy/security review, business associate agreement readiness, and human approval controls are approved.

Interoperability evaluations execute deterministic checks against synthetic fixtures and connector contracts while retaining exact live-use blockers. A synthetic pass does not mean a live connector is implemented, certified, trading-partner approved, or authorized to exchange production healthcare data.

Health Records Safety Exchange turns buyer record-extraction requests into no-PHI synthetic extraction plans, safety checks, source attribution, boundary resolutions, and retained approval gates. It rejects live PHI, patient identifiers, patient matching, production connector requests, EHR writeback, payer submission, diagnosis, treatment, and clinical action requests.

Recommended buyer path: keep the official Wix site at `scrimedsolutions.com`, link product CTAs to `app.scrimedsolutions.com`, and route buyers into `/product`, `/competitive-intelligence`, `/strategic-intelligence`, `/pricing`, `/evaluation`, and `/pilot` without requiring buyers to have Vercel accounts.

Current go-live blockers and manual actions are tracked in `/operations`: the public-versus-protected route policy remains open. GitHub push authentication, Wix CTA routing, `app.scrimedsolutions.com`, local package-manager verification, and Vercel Git deployment are working.

The Product Console and readiness brief also include operations readiness so buyer, investor, and operator reviews see launch blockers, owners, fallback paths, and remaining manual actions in one place.

Protected pilot workspaces now include metadata-only evidence-room access-log reconciliation, provider-adapter contract readiness, provider security review readiness, procurement evidence routing, Protected Clinical Authority Evidence Room assembly, Protected Clinical Authority Owner Matrix routing, and Protected Clinical Authority Artifact Intake Checklist preparation. This gives SCRIMED a buyer/investor diligence path for externally retained access logs, provider contract references, audit-log import stubs, security/procurement review metadata, clinical authority readiness packets, customer-specific approver routing, and external artifact intake criteria while keeping raw logs, recipient identifiers, provider credentials, URLs, tokens, signed approvals, legal opinions, sensitive artifacts, PHI, export approval, artifact uploads, live integration approval, and live clinical execution outside the product boundary.

---

## Vision for the Future

The long-term vision for SCRIMED is to become a foundational healthcare intelligence platform capable of supporting hospitals, healthcare systems, insurers, and global health initiatives with scalable, trustworthy AI systems.

---

## Founder

Temitayo Dahunsi  
Founder, SCRIMED Solutions

Atlanta, Georgia
