# SCRIMED Platform Architecture

Updated: 2026-06-14

SCRIMED is designed as an AI-native healthcare intelligence platform composed of modular services that support clinical workflows, operational automation, healthcare interoperability, and governed AI reliability.

## Current Runtime Surface

The current `scrimed-site` application is a Next.js App Router platform surface with these foundation layers:

- Official public website context: https://www.scrimedsolutions.com through Wix
- Public platform surface: `/`, `/platform`, `/trust`
- Healthcare Intelligence OS foundation: `/healthcare-intelligence-os`, `/api/healthcare-intelligence-os`, and `/api/healthcare-intelligence-os/brief`
- Persistent Agent Workspace v1: `/agent-workspace`, `/api/agent-workspace`, `/api/agent-workspace/brief`, `/api/agent-workspace/proof-packet`, `/api/agent-workspaces/[workspaceSlug]/work-orders`, `/api/agent-workspaces/[workspaceSlug]/work-orders/[workOrderId]`, and `/api/agent-workspaces/[workspaceSlug]/work-orders/[workOrderId]/proof-packet`
- Enterprise pilot evidence dashboard: `/pilot-evidence`, `/api/pilot-evidence`, and `/api/pilot-evidence/brief`
- Executable TrustOS governance surface: `/trust-os`, `/api/trust-os`, and `/api/trust-os/evaluate`
- Trust and enterprise readiness control plane: `/trust-center`, `/trust-center/[slug]`, `/claims`, `/api/enterprise-readiness`, `/api/enterprise-readiness/[slug]`, `/api/enterprise-readiness/claims`, and `/api/enterprise-readiness/diligence-brief`
- Demo and pilot center: `/demos`, `/demos/[slug]`, `/pilots`, `/pilots/[slug]`, `/api/demos`, `/api/demos/[slug]`, `/api/pilots`, and `/api/pilots/[slug]`
- SCRIMED OS Hub: `/hub`, `/hub/readiness`, `/hub/events`
- Master operating context: `/operating-context`, `/atlas`, `/faithcore`, and `/api/operating-context`
- Agent workflow registry: `/agents`, `/agents/[slug]`, `/api/agents/workflows`, and `/api/agents/workflows/[slug]`
- Synthetic workflow execution: `/workflows`, `/workflows/[slug]`, `/api/workflows/executions`, and `/api/workflows/executions/[slug]`
- Workflow execution result fixtures: `/workflows/results`, `/workflows/results/[slug]`, `/api/workflows/results`, and `/api/workflows/results/[slug]`
- Workflow result validation: `/workflows/results/validation` and `/api/workflows/results/validation`
- Workflow promotion review: `/workflows/promotion-review` and `/api/workflows/promotion-review`
- Governed execution API contracts: `/workflows/contracts`, `/workflows/contracts/[slug]`, `/api/workflows/contracts`, and `/api/workflows/contracts/[slug]`
- Identity and access readiness: `/workflows/identity-access` and `/api/workflows/identity-access`
- Execution-attempt readiness: `/workflows/execution-attempts` and `/api/workflows/execution-attempts`
- Governed execution implementation readiness: `/workflows/implementation-readiness`, `/workflows/implementation-readiness/[slug]`, `/api/workflows/implementation-readiness`, and `/api/workflows/governed-execution/[slug]`
- Denied execution audit boundaries: `/workflows/execution-audit`, `/workflows/execution-audit/[slug]`, `/api/workflows/execution-audit`, and `/api/workflows/execution-audit/[slug]`
- Audit persistence readiness: `/workflows/audit-persistence` and `/api/workflows/audit-persistence`
- Product modules: Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower pages under `/modules/*`
- Integration contracts: `/integrations`, `/contracts/[slug]`, `/api/contracts`, and `/api/contracts/[slug]`
- Interoperability control plane: `/interoperability`, `/interoperability/[slug]`, `/api/interoperability/standards`, `/api/interoperability/standards/[slug]`, and `/api/interoperability/conformance`
- Executable interoperability conformance evaluations: `/interoperability/evaluations`, `/interoperability/evaluations/[slug]`, `/api/interoperability/evaluations`, and `/api/interoperability/evaluations/[slug]`
- Integration fixtures: `/integrations/fixtures`, `/integrations/fixtures/[slug]`, `/integrations/fixture-validation`, `/api/integration-fixtures`, `/api/integration-fixtures/[slug]`, and `/api/integration-fixtures/validation`
- Fixture change review: `/fixtures/change-review` and `/api/fixtures/change-review`
- Synthetic validation: `/synthetic`, `/synthetic/[slug]`, `/synthetic/fixtures`, `/synthetic/fixtures/[slug]`, `/synthetic/validation`, `/api/synthetic/scenarios`, `/api/synthetic/scenarios/[slug]`, `/api/synthetic/fixtures`, `/api/synthetic/fixtures/[slug]`, `/api/synthetic/validation`, and `/api/synthetic/validation/[slug]`
- Quality gates: `/quality` and `/api/quality/gates`
- Core operational APIs: `/api/health`, `/api/status`, `/api/readiness`, `/api/events`, and `/api/hub/summary`

## Current Engineering Setup

The current repository is a production-shaped Next.js application, not a static brochure. Its primary technical setup is:

- Framework: Next.js App Router with React, TypeScript, server components, and route handlers.
- Data and auth: Supabase Auth, Supabase Postgres, and Postgres row-level security for protected pilot workspaces.
- Runtime safety: Upstash Redis rate limiting with bounded fallback for protected mutations.
- Deployment: Vercel-hosted product app at `app.scrimedsolutions.com`, linked from the official Wix website at `scrimedsolutions.com`.
- Product boundary: synthetic-only public product, demo, pilot, evidence, and readiness surfaces. Live PHI, production clinical execution, autonomous diagnosis, autonomous treatment, payer submission, and patient routing remain blocked until approved controls exist.
- Architecture style: typed domain libraries under `app/lib`, public pages under `app/*`, route handlers under `app/api/*`, and database migrations under `supabase/migrations`.

## Healthcare Intelligence OS Build Plan

SCRIMED is now organized around a Healthcare Intelligence OS architecture. The goal is to evolve from individual healthcare AI features into the secure operating system, trust layer, workflow engine, and intelligence fabric that healthcare AI runs inside.

### Phase 1: Agent Runtime, Clinical Knowledge Graph, Validation and Trust Lab

Current foundation:

- Agent Runtime: `AgentOS v1` exposes planner, router, specialist registry, memory fabric, RBAC permissions, MCP connector framework, sandbox runtimes, audit channels, human checkpoints, TrustQA, observability, and synthetic task planning.
- Clinical Knowledge Graph: `healthcareIntelligenceOS.ts` defines standards, node types, and relationship contracts for FHIR, HL7 v2, DICOM/DICOMweb, SNOMED CT, ICD-10, ICD-11, LOINC, RxNorm, CPT, HCPCS, X12, NCPDP, and IHE-aligned exchange patterns.
- Validation and Trust Lab: TrustOS and Atlas expose validation fields for clinical correctness, completeness, safety, confidence, source attribution, evidence trail, guideline references, model/provider used, reviewer status, and audit log.

Current boundary:

- Clinical correctness and safety scoring are contract fields, not validated clinical-performance claims.
- TODO: define licensed clinician scoring rubrics before these fields are used in care delivery.
- TODO: complete regulatory intended-use review before any public claim implies diagnosis, treatment, clinical decision support, FDA-regulated functionality, or autonomous care execution.

### Phase 2: Persistent Workspaces, Multi-Model Router, Sovereign Deployment

Current foundation:

- Protected Pilot Workspaces provide tenant-authenticated synthetic sessions, durable proof packets, TrustOS governance packets, and append-only audit events.
- Persistent Agent Workspace v1 composes protected pilot sessions into resumable synthetic work-order templates for RCM denial appeals, trial matching, pre-visit review, post-visit drafting, investor outreach, security scans, and interoperability data transformation.
- Persistent Agent Workspace v1 exposes model-router policy decisions, memory scopes, sandbox/tool scopes, reviewer checkpoints, audit timelines, blocked actions, dedicated RLS-backed work-order/event tables, dashboard filters, RPC-only protected mutations, and audited downloadable proof packets while keeping live PHI and clinical execution blocked.
- TrustOS model-route profiles define the policy frame for vendor-neutral model routing across cost, latency, safety, context, availability, fallback, PHI sensitivity, and regional constraints.
- Sovereign deployment contracts describe managed cloud, private cloud, hospital-controlled, government/sovereign cloud, and edge/on-prem modes.

Required before production:

- Durable state, retry, replay, failure quarantine, deletion, residency, legal hold, access review, and incident export for long-running agent workspaces.
- Provider agreements, BAA/DPA path where applicable, PHI routing policy, regional processing controls, monitoring, and rollback runbooks.
- Deployment validation where customer clinical data cannot leave a customer-controlled environment.

### Phase 3: Clinical Intelligence OS, Risk Horizon Engine, Population Intelligence

Current foundation:

- Synthetic workflows already model care navigation, documentation review, trial screening, prior authorization support, denial-risk review, and care-gap detection.
- Evidence metrics are tied to buyer-approved pilot baselines: time saved, workflow friction reduced, documentation quality improved, revenue leakage identified, and patient access bottlenecks surfaced.

Required before production:

- Clinical validation studies, data-quality review, equity review, buyer baseline measurement, and human operating procedures.
- No risk prediction, diagnosis, treatment, patient instruction, care-plan execution, or population scoring without authorized human review and approved governance.

### Phase 4: Project Ark Healthcare Intelligence Fabric

Project Ark remains a planned expansion that should only proceed after SCRIMED has validated the operating layers above with enterprise deployment evidence, external security/privacy/legal review, clinician governance, and customer-approved production controls.

## System Layers

### Operating Doctrine Layer

- SCRIMED SOLUTIONS mission, slogan, long-term vision, principles, and decision framework
- Shared operating context model in `app/lib/operatingContext.ts`
- Faith-neutral SCRIMED Atlas enterprise model for hospitals, governments, payers, and large organizations
- FaithCore opt-in spiritual support model with explicit boundaries against replacing clinical judgment, emergency care, consent, or professional standards
- Agent workflow registry requiring owner, permissions, inputs, outputs, audit events, guardrails, interoperability targets, and human-review policy before workflow execution
- Quality standard requiring secure, scalable, maintainable, interoperable, compliant, explainable, trustworthy, user-friendly, future-proof, and clinically useful delivery

### Data Layer

- Typed healthcare interoperability standards registry for FHIR, SMART App Launch, HL7 v2, DICOM/DICOMweb, X12, C-CDA, IHE profiles, NCPDP SCRIPT, ISO/IEEE 11073, and clinical terminology
- Contract-to-standard bindings with explicit versions, profiles, conformance artifacts, controls, and pre-live implementation requirements
- Deterministic FHIR R4 and US Core, SMART App Launch, and DICOMweb synthetic conformance test kits with evidence artifacts, agent ownership, and retained live-use blockers
- Claims, utilization, and pricing transparency contract boundaries
- Synthetic request and expected-response fixtures for non-synthetic integration contracts
- Fixture validation diffs for required-signal coverage, safeguard mapping, trace completeness, live-review gating, and expected-output fingerprints
- Fixture change-review records for integration and synthetic expected-output fingerprints
- Workflow execution result fixtures for deterministic synthetic outputs, review state, blocked actions, quality evidence, and Watchtower trace retention
- Workflow result validation diffs for expected output signals, Watchtower traces, review state, route inventory, and blocked-action retention
- Workflow promotion-review records for synthetic-only approval before production automation
- Governed execution API contracts for request schemas, response schemas, preconditions, audit events, observability signals, and denied capabilities
- Identity and access readiness for production identity provider, tenant isolation, role permissions, patient-context authorization, service authentication, session lifecycle, consent, break-glass access, audit linkage, and regional identity controls
- Execution-attempt readiness for attempt identity, idempotency, durable attempt state, concurrency, retry, failure quarantine, rate limits, privacy boundaries, and regional attempt compliance
- Deny-by-default execution endpoints that reject requests before body parsing, connector access, workflow mutation, attempt creation, or patient-facing action
- Denied execution audit boundaries for metadata-only evidence headers, audit-envelope fields, and never-capture policy
- Audit persistence readiness for durable storage, retention, access, encryption, incident response, regional residency, and Watchtower alerting decisions
- Persistent Agent Workspace v1 work-order contracts for resumable state, agent ownership, memory scopes, model routing, Trust Cards, reviewer checkpoints, blocked actions, dashboard filtering, and audited proof packets
- Agent workspace work-order persistence migration for tenant-scoped work-order records, append-only work-order events, explicit authenticated grants, and no direct write grants
- Synthetic clinical fixtures for safe workflow validation
- Future clinical records ingestion after contracts and synthetic checks are stable

### Intelligence Layer

- Clinical reasoning and summarization capabilities
- Reviewable documentation generation through DocuTwin
- Care navigation and triage support through CarePath AI
- Clinical trial matching and evidence-gap reasoning through TrialCore

### Workflow Layer

- Buyer-ready demo and pilot packaging that connects executable proof to workflow outcomes, buyer inputs, governance gates, commercial engagement models, and explicit production exclusions
- Clinical Copilot for clinician-facing decision support
- DocuTwin for structured draft documentation workflows
- CarePath AI for intake, triage, and navigation operations
- Synthetic execution readiness for CarePath high-risk follow-up routing, DocuTwin draft note review, and TrialCore eligibility review queue
- Deterministic result fixtures before workflow execution can move toward live automation
- Validation and promotion gates before result fixtures can move toward governed execution APIs
- Contract-only governed execution API boundaries before executable POST routes are implemented
- Identity and access readiness before governed execution can accept authenticated requests
- Execution-attempt readiness before governed execution can create, persist, retry, replay, or release workflow attempts
- Locked governed execution endpoints that return a controlled rejection until production prerequisites are approved
- Metadata-only audit boundaries for denied governed execution attempts before durable storage is approved
- Audit persistence readiness before denied execution metadata can move into durable storage
- Persistent Agent Workspace work orders before dedicated production work-order mutation tables are introduced
- Protected Agent Workspace work-order routes before live connector execution, patient outreach, payer submission, or production record mutation
- TrialCore for research matching workflows
- Agent Commander registry for specialized governed agents across clinical, administrative, research, interoperability, compliance, and operational workflows
- Watchtower for reliability, safety, and operational traces

### Trust Layer

- Executable TrustOS policy decisions across PHI Shield, Agent Firewall, Clinical Guardian, Agent Registry, Compliance Monitoring, Explainability Engine, Audit Engine, and Policy Engine
- Vendor-neutral model-route evaluation with explicit production vendor, BAA, regional, monitoring, and rollback gates
- Metadata-only Clinical Trace records with confidence, uncertainty, evidence references, approval checkpoints, and outcome-learning hooks
- Watchtower regression and drift monitoring concepts
- Runtime trace visibility
- Safety and review requirements before clinical use
- Deployment and readiness monitoring
- Agent permissions, audit events, human-review triggers, and guardrails
- Explicit quality gates for active, planned, and bypassed checks
- Master operating context as an active doctrine and decision gate before product expansion
- Enterprise readiness and claims control across legal, security, privacy, brand, governance, marketing, PR, sales, and advertising
- Baseline content security policy, content-type, framing, referrer, browser-permissions, and cross-origin-opener response headers

## Quality Gate Model

SCRIMED currently uses a managed quality path instead of letting one blocked tool halt execution.

Active gates:

- Buyer-facing demo and pilot proof packets that preserve synthetic-only evidence boundaries
- Vercel deployment status as the primary deploy gate
- Fixture-backed executable synthetic clinical assertions for workflow validation without live patient data
- Integration contracts for future connector boundaries
- Interoperability standards registry and conformance controls before connector implementation claims
- Executable synthetic interoperability conformance evaluations before partner testing or production connector implementation
- Integration fixture validation for non-synthetic connector coverage and expected-output change review
- Fixture change review for expected-output fingerprint approval
- Synthetic workflow execution readiness and deterministic result fixtures for staged module workflows
- Workflow result validation and synthetic-only promotion review for staged module workflows
- Governed execution API contracts for staged workflows before implementation
- Identity and access readiness before production authentication, tenant boundaries, roles, patient context, service auth, consent, break-glass access, and regional identity controls are implemented
- Execution-attempt readiness before idempotent, durable, replay-safe workflow attempts are implemented
- Deny-by-default governed execution endpoints before production execution
- Denied execution audit boundaries before durable audit logging
- Audit persistence readiness before storage, retention, access, encryption, incident response, residency, and alerting are implemented
- Persistent Agent Workspace v1 before dedicated long-running work-order persistence, retry, replay, assignment, deletion, legal hold, and residency controls are implemented
- Agent Workspace work-order migration verification before protected create, transition, retry, review, close, and audited proof-packet routes are enabled for a tenant pilot
- Agent workflow registry for specialized agent boundaries before execution
- Hub readiness checks for operational visibility

Deferred production gates:

- Live clinical integrations remain gated until identity, consent, purpose-of-use, durable audit, security, deployment profile, certification, and partner-acceptance requirements are approved.
- Known limitations remain resolved only to the honest level possible in code: active controls, safer synthetic quality processes, or named external approval gates. Legal, HIPAA, SOC 2, regulatory, reimbursement, clinical validation, and sovereign-deployment claims require qualified external review.

Replacement process:

- Vercel deployment, GitHub Actions, and local package-manager verification provide independent build evidence.
- Persistent Agent Workspace v1 replaces vague long-running agent promises with inspectable synthetic work orders, model-router policies, reviewer checkpoints, audit timelines, blocked actions, and downloadable proof packets.
- Agent Workspace work-order APIs replace static work-order proof with RLS-backed list filters, dashboard summaries, create, inspect, transition, retry, review, block, close, and audited proof-packet contracts that fail closed when migration verification is missing.
- Integration fixture validation replaces live connector assumptions with synthetic request and expected-response evidence.
- Synthetic interoperability conformance evaluations replace untested standards claims with deterministic checks, linked evidence, and explicit production blockers.
- Fixture change review replaces silent fixture drift with explicit expected-output fingerprint approval.
- Synthetic workflow execution readiness, deterministic result fixtures, result validation, promotion review, governed execution contracts, identity and access readiness, execution-attempt readiness, deny-by-default execution endpoints, denied-execution audit boundaries, and audit persistence readiness replace premature live workflow automation.
- Contract and scenario APIs replace live connector assumptions.
- Readiness, event, and quality endpoints replace manual status tracking.

## Synthetic Validation Checks

Each synthetic scenario now receives deterministic checks for:

- synthetic-only labeling
- absence of obvious production identifiers
- structured request and expected-output fixture presence
- fixture synthetic-only flag
- synthetic clinical test contract binding
- risk marker retention
- workflow trace completeness
- fixture trace alignment
- assertion completeness
- expected output signals and prohibited claims
- human review, draft, no-final-claim, or Watchtower guardrails

## Workflow Execution Result Fixtures

Each staged workflow execution now requires a synthetic-only result fixture that preserves:

- expected output signals
- Watchtower trace steps
- human review state
- reviewer role
- prohibited or blocked actions
- quality evidence before promotion

The current staged workflows cover CarePath AI, DocuTwin, and TrialCore. This keeps the platform moving toward executable workflows while blocking live patient routing, final documentation, enrollment claims, treatment recommendations, and production data ingestion until promotion review and connector governance are explicit.

## Workflow Result Validation and Promotion

Before staged workflows can move toward governed execution APIs, SCRIMED now validates result fixtures against:

- expected output signals
- Watchtower trace steps
- human review state and reviewer role
- prohibited or blocked actions
- quality evidence
- page and API route inventory

Promotion review records approve workflows for synthetic staging only. They retain blocked actions and require result validation, fixture fingerprints, explicit human-review roles, production connector boundary review, and privacy/security approval before any live automation path is considered.

## Governed Execution API Contracts

Each staged workflow now has a synthetic-only governed execution contract before any executable POST route is implemented. The contract layer defines:

- planned endpoint and method
- request schema and response schema
- required preconditions and approval gates
- audit events and observability signals
- human-review requirement
- denied capabilities
- promotion boundary

These contracts are intentionally non-executing. They keep CarePath AI, DocuTwin, and TrialCore moving toward implementation while blocking live patient routing, final documentation, enrollment claims, treatment recommendations, production connector use, and production data ingestion until auth, identity, execution-attempt idempotency, persistence, audit logging, privacy/security review, and connector governance are explicit.

## Identity and Access Readiness

SCRIMED now exposes an identity and access readiness register before any governed execution endpoint can accept authenticated execution requests. The register keeps production execution in `decision-required` status until SCRIMED approves:

- production identity provider, MFA posture, account lifecycle, and enterprise SSO support
- tenant, organization, workspace, facility, department, environment, and customer isolation rules
- least-privilege roles, permission scopes, reviewer authority, admin boundaries, and service-specific execution permissions
- patient-context authorization for care-team relationship, encounter scope, consent, and purpose-of-use
- service-to-service authentication, signed requests, token audience checks, and connector-to-workflow trust boundaries
- session duration, refresh behavior, revocation, device trust, inactivity handling, and emergency lockout
- patient consent, caregiver delegation, staff delegation, proxy access, and opt-in rules
- break-glass access workflow, justification capture, elevated-session expiration, retrospective review, and alerting
- audit linkage between identity decisions and denied execution evidence
- regional identity compliance for priority global markets

Until those decisions are approved, deny-by-default governed execution endpoints remain the active replacement.

## Execution Attempt Readiness

SCRIMED now exposes an execution-attempt readiness register before any governed execution endpoint can create, persist, retry, replay, or release work. The register keeps attempt creation in `decision-required` status until SCRIMED approves:

- idempotency key generation, uniqueness scope, TTL, replay response, conflict response, expiration behavior, and required client headers
- durable storage for attempt identity, idempotency records, state transitions, review state, trace references, retry counters, and audit linkage
- concurrency and lock behavior by workflow, tenant, patient context, and idempotency key
- retry windows, replay eligibility, deterministic response reuse, retry-after behavior, and operator-visible retry history
- failure quarantine, compensation workflow, escalation owners, incident linkage, and blocked-action retention
- tenant, user, service, workflow, region, and emergency shutdown limits
- metadata-only privacy boundaries for attempt-readiness records
- regional retention, residency, failover, export, deletion, and legal-hold behavior for priority global markets

Until those decisions are approved, deny-by-default governed execution endpoints continue to return `attempt-creation-disabled` evidence and do not evaluate idempotency or persist attempts.

## Deny-By-Default Execution Endpoints

SCRIMED now exposes governed execution endpoint stubs under `/api/workflows/governed-execution/[slug]`. These endpoints intentionally reject POST requests with `SCRIMED_EXECUTION_NOT_ENABLED` before parsing request bodies. This converts a vague future endpoint into a controlled safety boundary.

Before any endpoint can move beyond deny-by-default, SCRIMED must explicitly approve:

- production authentication and authorization
- tenant, organization, role, and patient-context identity boundaries
- durable persistence and idempotency
- execution-attempt state, replay, concurrency, and failure quarantine
- auditable execution-attempt logging
- PHI/PII privacy and security handling
- production connector scope
- rate limits, misuse monitoring, and emergency shutdown controls

## Denied Execution Audit Boundaries

Denied execution attempts now have a metadata-only audit boundary before durable logging is selected. The boundary defines:

- event name and event version
- evidence headers returned by locked POST routes
- metadata fields allowed for capture
- request body, PHI, clinical free text, connector payloads, secrets, and insurance identifiers that must never be captured
- durable persistence status as a decision-required item

This creates observability without pretending SCRIMED has approved production audit storage. Durable audit logging remains gated behind storage, retention, access review, incident response, privacy, and security decisions.

## Audit Persistence Readiness

SCRIMED now exposes an audit persistence readiness register before denied execution metadata can move into durable storage. The register keeps durable logging in `decision-required` status until SCRIMED approves:

- storage provider and immutable audit-envelope model
- retention schedule, deletion rules, archive policy, and legal hold behavior
- role-based access control, break-glass process, and access-review cadence
- encryption, key rotation, tenant boundaries, and revocation process
- incident response ownership and evidence export process
- regional residency behavior for priority global markets
- Watchtower alerting, misuse detection, anomaly thresholds, and shutdown triggers

Until those decisions are approved, metadata-only denied execution audit boundaries remain the active replacement.

## Watchtower Monitoring System

The Watchtower system is the trust layer for deployed and staged SCRIMED workflows. It is expected to track:

- workflow quality signals
- latency and cost patterns
- model behavior drift
- approval patterns
- runtime traces
- safety and review signals
- deployment and readiness regressions

This architecture keeps clinical integration work gated until reliability signals, synthetic fixtures, and operational status surfaces are in place.

## Vision

SCRIMED is designed to function as the intelligence layer above existing healthcare systems, enabling providers, payers, researchers, governments, and public health organizations to operate with more insight, automation, interoperability, and trust.
