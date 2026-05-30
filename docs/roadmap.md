# SCRIMED Development Roadmap

Updated: 2026-05-29

SCRIMED is being developed as a modular AI healthcare intelligence platform designed to modernize healthcare decision support, automation, trust monitoring, and data interoperability.

## Operating Standard

Execution should move through explicit gates instead of ambiguous blockers:

- Vercel is the active deploy gate.
- The SCRIMED master operating context is an active decision gate for mission alignment, quality standard, Atlas, FaithCore, interoperability, and security.
- Fixture-backed executable synthetic clinical assertions validate workflows before live clinical data is connected.
- Integration contracts define FHIR, HL7, claims, pricing, and synthetic data boundaries before connector implementation.
- Quality gates document active, planned, and bypassed checks.
- GitHub Actions and local package-manager builds remain hardening items until tooling and run visibility are available.

Reasoning level:

- Use high reasoning for SCRIMED architecture, healthcare workflow design, quality gates, safety, integration boundaries, and company-level sequencing.
- Use medium reasoning for routine implementation after the architecture and acceptance criteria are clear.
- Use low reasoning only for mechanical edits, formatting, and one-line maintenance tasks.

## Phase 1 - Core Platform Foundations

Objective: Establish the foundational architecture, deployment surface, documentation, and operational status model.

Completed foundations:

- Next.js App Router application baseline
- Vercel deployment configuration
- Homepage and public platform surface
- Master operating context model, documentation, page, and API
- SCRIMED Atlas and FaithCore operating-model surfaces with explicit boundaries
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
- Detailed contract routes for FHIR, HL7, claims/utilization, pricing transparency, and synthetic clinical testing
- Synthetic clinical scenario model
- Synthetic request and expected-output fixture model
- Synthetic scenario page and API
- Scenario detail pages and per-scenario API routes
- Fixture contract pages and APIs
- Synthetic validation page and API
- Deterministic checks for labels, identifier safety, fixture presence, contract boundaries, trace alignment, assertions, expected outputs, prohibited claims, and human review guardrails
- Quality gates page and API
- Synthetic validation status promoted into quality gates

Next build targets:

- Agent workflow registry for specialized governed agents, permissions, human review, audit events, and observability requirements
- Generated request and response fixtures for every non-synthetic integration contract
- Fixture diffing for expected output changes
- First module workflow implementation against fixture-backed synthetic inputs

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

Entry condition:

- Each workflow should have a route, API contract, synthetic fixture, expected outcome, and review requirement before production integration.

## Phase 5 - Trust and Safety Infrastructure

Objective: Ensure healthcare-grade reliability and governance.

Systems include:

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
