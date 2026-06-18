# SCRIMED Development Roadmap

Updated: 2026-06-18

SCRIMED is being developed as a modular AI healthcare intelligence platform designed to modernize healthcare decision support, automation, trust monitoring, and data interoperability.

## Operating Standard

Execution should move through explicit gates instead of ambiguous blockers:

- Vercel is the active deploy gate.
- The SCRIMED master operating context is an active decision gate for mission alignment, quality standard, Atlas, FaithCore, interoperability, and security.
- The agent workflow registry is the active scope gate for specialized agents before workflow execution.
- Fixture change review is the active expected-output approval gate before implementation depends on changed fixtures.
- Synthetic workflow execution is the active staged-module execution gate before live workflow automation.
- Workflow execution result fixtures are the active output, trace, review-state, and blocked-action gate before implementation.
- Workflow result validation is the active diff gate before result fixtures can support governed execution APIs.
- Workflow promotion review is the active synthetic-only approval gate before production automation.
- Governed execution API contracts are the active request, response, precondition, audit, observability, and denied-capability gate before executable POST routes.
- Identity and access readiness is the active decision gate before governed execution can accept authenticated requests.
- Execution-attempt readiness is the active decision gate before governed execution can create, retry, replay, persist, or release work.
- Deny-by-default governed execution endpoints are the active runtime safety gate before production execution.
- Denied execution audit boundaries are the active metadata and never-capture gate before durable audit logging.
- Audit persistence readiness is the active decision gate before denied-event metadata moves into durable storage.
- Integration fixture validation is the active connector-readiness gate for non-synthetic contracts.
- Fixture-backed executable synthetic clinical assertions validate workflows before live clinical data is connected.
- The interoperability control plane defines FHIR, HL7 v2, DICOM/DICOMweb, X12, IHE, pharmacy, device, terminology, pricing, and synthetic data boundaries before connector implementation.
- Executable synthetic conformance evaluations are the active evidence gate for FHIR R4 and US Core, SMART App Launch, and DICOMweb before partner testing or live connector work.
- Quality gates document active and planned checks, with explicit replacement paths whenever a future bypass is required.
- GitHub Actions, local package-manager verification, and Vercel deployment are active independent build-quality paths.
- Buyer-ready demos and pilot programs bind executable proof to measurable outcomes, commercial scope, governance gates, and production exclusions.
- Pilot Deal Room is the active commercial conversion gate from public product proof to Sales Operations, buyer-specific protected workspace provisioning, tenant-per-buyer lifecycle activation, production readiness, activation approvals, buyer evidence and signed controls diligence, secure evidence vault readiness, protected Buyer Pilot Room proof, audited packet release, and paid synthetic pilot.
- Authenticated Buyer Demo Execution Path is the active operator gate for sequencing no-PHI buyer demos, audited packet release, known workarounds, retained hard gates, and paid implementation next steps.
- The Trust and Enterprise Readiness Center governs company-level launch gates and public claims before marketing, PR, sales, advertising, protected pilots, or production use.

Reasoning level:

- Use high reasoning for SCRIMED architecture, healthcare workflow design, quality gates, safety, integration boundaries, and company-level sequencing.
- Use medium reasoning for routine implementation after the architecture and acceptance criteria are clear.
- Use low reasoning only for mechanical edits, formatting, and one-line maintenance tasks.

## Phase 1 - Core Platform Foundations

Objective: Establish the foundational architecture, deployment surface, documentation, and operational status model.

Completed foundations:

- Five executable product demos and four structured enterprise pilot programs
- Nine-domain enterprise readiness and claims-control plane with downloadable diligence brief
- Baseline browser response-security headers across application routes
- Protected pilot workspace contract with Supabase Auth, Postgres row-level security, durable synthetic sessions, append-only audit events, and audited proof packets
- Invite-only protected pilot access console with authenticated tenant workspace discovery, governed synthetic session creation, and audited proof downloads
- Invite-only tenant-admin sales operations console with durable opportunity assignment, pipeline control, audited proposals, and controlled CRM synchronization
- Pilot Deal Room public route, API, and tenant-admin audited deal-room packet for linking sales opportunities to Buyer Pilot Room proof
- Opportunity-linked protected workspace provisioning with manual invitation policy, retention schedule, buyer-specific workspace slug, and audited provisioning packet
- Tenant-per-buyer lifecycle automation with buyer-domain SSO policy, manual invitation delivery posture, access-review cadence, retention/archive controls, competitive proof signals, and audited lifecycle packet
- Production SSO and invitation delivery readiness with buyer-domain verification, redirect/origin registry, invitation template approval, transactional delivery guardrails, access-review attestation, archive runbook, launch blockers, and audited readiness packet
- Customer activation approval workflow with paid-pilot setup approval, allowed setup actions, retained hard blockers, approval-domain status, private audit storage, and audited approval packet
- Buyer evidence and signed controls diligence rooms with metadata-only domain proof, IdP metadata readiness, legal/privacy/security controls, BAA/DPA posture, transactional provider decisions, production connector readiness, signed-control tracking, retained blockers, and audited diligence packets
- Secure evidence vault readiness with disabled-by-default storage-provider decisioning, encryption/key management, DLP, malware scanning, retention/legal hold, access reviews, evidence classification, upload approval, incident response, regional residency, target audience, revenue-path controls, and audited readiness packets
- Authenticated buyer demo execution path with protected JSON runbook, non-audited operator brief, sequenced packet readiness, known-limit workarounds, and buyer-room/product-console/deal-room routing
- Persisted buyer demo sessions with no-PHI operator notes, buyer questions, blockers, workarounds, next actions, follow-up plan, current path snapshot, selected packet routes, private deny-all RLS storage, and audited session packets
- AAL2 buyer-demo session QA harness with selected-opportunity targeting, synthetic session creation, packet-audit verification, UI trigger, public fail-closed smoke, and optional short-lived-token authenticated smoke
- Runtime activation verification against the migrated Supabase schema and distributed Redis provider
- Active public intake and protected session rate limiting with Upstash Redis connected and verified for distributed enforcement
- Next.js App Router application baseline
- Vercel deployment configuration
- Homepage and public platform surface
- Master operating context model, documentation, page, and API
- SCRIMED Atlas and FaithCore operating-model surfaces with explicit boundaries
- Agent workflow registry with permissions, audit events, guardrails, interoperability targets, and human-review policies
- SCRIMED OS Hub at `/hub`
- Readiness and events consoles
- Health, status, readiness, events, and hub summary APIs
- TypeScript configuration and CI workflow definition
- Project status, architecture, and roadmap documentation

Current status: foundation online.

## Phase 2 - Contracts and Synthetic Validation

Objective: Validate product workflows without live patient data and define connector boundaries before clinical integration.

Completed foundations:

- Integration contracts page and API
- Typed interoperability standards registry, detail routes, APIs, and conformance controls
- Executable FHIR R4 and US Core, SMART App Launch, and DICOMweb synthetic conformance evaluations with evidence artifacts and retained live-use blockers
- Integration fixture pages and APIs
- Integration fixture validation with coverage checks, safeguard mapping, and diff fingerprints
- Fixture change-review page and API for expected-output fingerprint approval
- Synthetic workflow execution readiness surfaces for CarePath AI, DocuTwin, and TrialCore
- Deterministic workflow execution result fixtures for staged workflow outputs, traces, review states, blocked actions, and quality evidence
- Workflow result validation diffs for expected outputs, result output signals, Watchtower traces, review state, and blocked actions
- Workflow promotion-review records for synthetic-only staging approval and retained blocked actions
- Governed execution API contracts for staged workflows after validation and promotion review
- Identity and access readiness for production identity provider, tenant isolation, role permissions, patient-context authorization, service authentication, session lifecycle, consent, break-glass access, audit linkage, and regional identity controls
- Execution-attempt readiness for attempt identity, idempotency policy, durable attempt state, concurrency, retry, failure quarantine, rate limits, privacy boundaries, and regional attempt compliance
- Deny-by-default governed execution endpoints that reject workflow execution before body parsing or connector access
- Denied execution audit boundaries with evidence headers, metadata capture policy, and never-capture policy
- Audit persistence readiness for storage, retention, access, encryption, incident response, regional residency, and Watchtower alerting
- Detailed contract routes for FHIR, HL7 v2, DICOM/DICOMweb, claims/utilization, pricing transparency, and synthetic clinical testing
- Synthetic clinical scenario model
- Synthetic request and expected-output fixture model
- Synthetic scenario page and API
- Scenario detail pages and per-scenario API routes
- Fixture contract pages and APIs
- Synthetic validation page and API
- Deterministic checks for labels, identifier safety, fixture presence, contract boundaries, trace alignment, assertions, expected outputs, prohibited claims, and human review guardrails
- Quality gates page and API
- Synthetic validation status promoted into quality gates
- Workflow execution result fixture status promoted into quality gates
- Workflow result validation and promotion-review status promoted into quality gates

Next build targets:

- Add an operator-token rotation runbook and CI secret policy for running `npm run smoke:sales-demo-session-qa` on demand with short-lived bearer credentials and explicit `SCRIMED_SALES_QA_INTAKE_ID` targeting.
- Convert secure evidence vault readiness into limited controlled evidence storage only after provider, BAA/DPA path, encryption/key ownership, DLP, malware scanning, retention, legal hold, deletion, access review, incident response, regional residency, support ownership, buyer authorization, and qualified review are complete.
- Convert activation approval, buyer diligence, and vault readiness packets into approved customer SSO setup, transactional invitation delivery, retention deletion execution, workspace archive execution, and production connector setup only after signed enterprise controls.
- Operate the activated sales ownership, due-action cadence, vendor-neutral CRM export, proposal follow-up, and assessment invitation workflows through the protected Sales Operations console
- Continue cross-tenant isolation verification and extend AAL2/session policy from Sales Operations to future tenant-administration surfaces
- Continue monitoring verified Upstash Redis distributed intake and protected mutation limits across Vercel regions
- Add approved customer SSO configuration and automated invitation delivery after buyer-domain evidence, message templates, legal/privacy/security review, provider monitoring, and abuse controls are approved
- Complete qualified counsel, privacy, regulatory, trademark, insurance, incident-response, and independent security reviews
- Add tenant administration and approved membership lifecycle workflows after identity policy is approved
- Decide whether selected protected Vercel deployment smoke-test routes should be public or remain connector-authenticated
- Add tenant-authenticated persisted conformance runs and downloadable partner evidence packets after storage and identity controls are approved
- Select and test deployment-specific standards profiles, conformance artifacts, identity, consent, audit, security, and partner acceptance controls before live connector work
- Promote governed execution beyond deny-by-default only after auth, identity, execution-attempt idempotency, persistence, durable audit logging, privacy/security review, connector boundaries, rate limits, and shutdown controls are explicit

## Phase 3 - Intelligence Layer

Objective: Build AI intelligence capabilities that power SCRIMED workflows.

Focus areas:

- Clinical reasoning and summarization
- Reviewable documentation workflows
- Care navigation and triage support
- Trial eligibility reasoning and evidence-gap detection
- Population health and operational insight modules

Entry condition:

- Intelligence work should use synthetic scenarios first and avoid live clinical data until governance, review, and connector requirements are explicit.

## Phase 4 - Workflow Automation Systems

Objective: Deploy AI-powered operational systems for healthcare workflows.

Modules include:

- Clinical Copilot for clinician decision support
- DocuTwin for medical documentation workflows
- CarePath AI for patient intake, triage, and navigation
- TrialCore for clinical trial discovery and matching
- Watchtower for trust, safety, and reliability operations
- Agent Commander for governed specialized agents and workflow promotion control

Entry condition:

- Each workflow should have a route, API contract, governed execution contract, identity and access readiness, execution-attempt readiness, deny-by-default endpoint, denied-execution audit boundary, audit persistence readiness, integration fixture, synthetic fixture, deterministic result fixture, expected outcome, blocked-action list, and review requirement before production integration.

## Phase 5 - Trust and Safety Infrastructure

Objective: Ensure healthcare-grade reliability and governance.

Systems include:

- TrustOS executable governance decisions
- PHI Shield, Agent Firewall, Clinical Guardian, Policy Engine, Explainability Engine, Audit Engine, Compliance Monitoring, and Agent Registry
- Vendor-neutral Model Router evaluation and metadata-only Clinical Trace generation
- Watchtower regression monitoring
- AI safety evaluation pipelines
- Runtime observability dashboards
- Deployment validation checks
- Quality gate reporting

These systems continuously monitor:

- performance drift
- model behavior changes
- safety signals
- cost and latency metrics
- workflow trace quality
- human review requirements

## Phase 6 - Platform Expansion

Objective: Scale SCRIMED into a full healthcare intelligence ecosystem.

Expansion areas:

- hospital integrations
- payer analytics systems
- research collaboration tools
- population health insights platform
- partner connector certification
- region-aware deployment packages for the United States, UAE, Saudi Arabia, Kuwait, Nigeria, Kenya, Rwanda, Ghana, and Europe

Entry condition:

- Live connectors should remain gated behind synthetic validation, integration contracts, privacy review, and deployment quality checks.

## Long-Term Vision

SCRIMED aims to become the intelligence layer above healthcare infrastructure, enabling organizations to operate with more insight, automation, and trust.

The platform is designed to support healthcare providers, payers, researchers, and public health organizations through advanced artificial intelligence systems governed by explicit safety, quality, and integration boundaries.
