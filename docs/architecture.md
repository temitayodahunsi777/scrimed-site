# SCRIMED Platform Architecture

Updated: 2026-05-31

SCRIMED is designed as an AI-native healthcare intelligence platform composed of modular services that support clinical workflows, operational automation, healthcare interoperability, and governed AI reliability.

## Current Runtime Surface

The current `scrimed-site` application is a Next.js App Router platform surface with these foundation layers:

- Official public website context: https://www.scrimedsolutions.com through Wix
- Public platform surface: `/`, `/platform`, `/trust`
- SCRIMED OS Hub: `/hub`, `/hub/readiness`, `/hub/events`
- Master operating context: `/operating-context`, `/atlas`, `/faithcore`, and `/api/operating-context`
- Agent workflow registry: `/agents`, `/agents/[slug]`, `/api/agents/workflows`, and `/api/agents/workflows/[slug]`
- Synthetic workflow execution: `/workflows`, `/workflows/[slug]`, `/api/workflows/executions`, and `/api/workflows/executions/[slug]`
- Workflow execution result fixtures: `/workflows/results`, `/workflows/results/[slug]`, `/api/workflows/results`, and `/api/workflows/results/[slug]`
- Workflow result validation: `/workflows/results/validation` and `/api/workflows/results/validation`
- Workflow promotion review: `/workflows/promotion-review` and `/api/workflows/promotion-review`
- Governed execution API contracts: `/workflows/contracts`, `/workflows/contracts/[slug]`, `/api/workflows/contracts`, and `/api/workflows/contracts/[slug]`
- Product modules: Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower pages under `/modules/*`
- Integration contracts: `/integrations`, `/contracts/[slug]`, `/api/contracts`, and `/api/contracts/[slug]`
- Integration fixtures: `/integrations/fixtures`, `/integrations/fixtures/[slug]`, `/integrations/fixture-validation`, `/api/integration-fixtures`, `/api/integration-fixtures/[slug]`, and `/api/integration-fixtures/validation`
- Fixture change review: `/fixtures/change-review` and `/api/fixtures/change-review`
- Synthetic validation: `/synthetic`, `/synthetic/[slug]`, `/synthetic/fixtures`, `/synthetic/fixtures/[slug]`, `/synthetic/validation`, `/api/synthetic/scenarios`, `/api/synthetic/scenarios/[slug]`, `/api/synthetic/fixtures`, `/api/synthetic/fixtures/[slug]`, `/api/synthetic/validation`, and `/api/synthetic/validation/[slug]`
- Quality gates: `/quality` and `/api/quality/gates`
- Core operational APIs: `/api/health`, `/api/status`, `/api/readiness`, `/api/events`, and `/api/hub/summary`

## System Layers

### Operating Doctrine Layer

- SCRIMED SOLUTIONS mission, slogan, long-term vision, principles, and decision framework
- Shared operating context model in `app/lib/operatingContext.ts`
- Faith-neutral SCRIMED Atlas enterprise model for hospitals, governments, payers, and large organizations
- FaithCore opt-in spiritual support model with explicit boundaries against replacing clinical judgment, emergency care, consent, or professional standards
- Agent workflow registry requiring owner, permissions, inputs, outputs, audit events, guardrails, interoperability targets, and human-review policy before workflow execution
- Quality standard requiring secure, scalable, maintainable, interoperable, compliant, explainable, trustworthy, user-friendly, future-proof, and clinically useful delivery

### Data Layer

- Healthcare interoperability contracts for FHIR and HL7
- Claims, utilization, and pricing transparency contract boundaries
- Synthetic request and expected-response fixtures for non-synthetic integration contracts
- Fixture validation diffs for required-signal coverage, safeguard mapping, trace completeness, live-review gating, and expected-output fingerprints
- Fixture change-review records for integration and synthetic expected-output fingerprints
- Workflow execution result fixtures for deterministic synthetic outputs, review state, blocked actions, quality evidence, and Watchtower trace retention
- Workflow result validation diffs for expected output signals, Watchtower traces, review state, route inventory, and blocked-action retention
- Workflow promotion-review records for synthetic-only approval before production automation
- Governed execution API contracts for request schemas, response schemas, preconditions, audit events, observability signals, and denied capabilities
- Synthetic clinical fixtures for safe workflow validation
- Future clinical records ingestion after contracts and synthetic checks are stable

### Intelligence Layer

- Clinical reasoning and summarization capabilities
- Reviewable documentation generation through DocuTwin
- Care navigation and triage support through CarePath AI
- Clinical trial matching and evidence-gap reasoning through TrialCore

### Workflow Layer

- Clinical Copilot for clinician-facing decision support
- DocuTwin for structured draft documentation workflows
- CarePath AI for intake, triage, and navigation operations
- Synthetic execution readiness for CarePath high-risk follow-up routing, DocuTwin draft note review, and TrialCore eligibility review queue
- Deterministic result fixtures before workflow execution can move toward live automation
- Validation and promotion gates before result fixtures can move toward governed execution APIs
- Contract-only governed execution API boundaries before executable POST routes are implemented
- TrialCore for research matching workflows
- Agent Commander registry for specialized governed agents across clinical, administrative, research, interoperability, compliance, and operational workflows
- Watchtower for reliability, safety, and operational traces

### Trust Layer

- Watchtower regression and drift monitoring concepts
- Runtime trace visibility
- Safety and review requirements before clinical use
- Deployment and readiness monitoring
- Agent permissions, audit events, human-review triggers, and guardrails
- Explicit quality gates for active, planned, and bypassed checks
- Master operating context as an active doctrine and decision gate before product expansion

## Quality Gate Model

SCRIMED currently uses a managed quality path instead of letting one blocked tool halt execution.

Active gates:

- Vercel deployment status as the primary deploy gate
- Fixture-backed executable synthetic clinical assertions for workflow validation without live patient data
- Integration contracts for future connector boundaries
- Integration fixture validation for non-synthetic connector coverage and expected-output change review
- Fixture change review for expected-output fingerprint approval
- Synthetic workflow execution readiness and deterministic result fixtures for staged module workflows
- Workflow result validation and synthetic-only promotion review for staged module workflows
- Governed execution API contracts for staged workflows before implementation
- Agent workflow registry for specialized agent boundaries before execution
- Hub readiness checks for operational visibility

Managed bypasses:

- GitHub Actions CI is configured but not treated as a blocking gate until workflow run visibility is available.
- Local package-manager builds are not available in the current Codex workspace because npm, pnpm, yarn, and corepack are not installed.
- Live clinical integrations remain gated until synthetic scenarios and contracts are stable.

Replacement process:

- Vercel deployment plus fixture-backed executable synthetic validation replaces unavailable local build verification.
- Integration fixture validation replaces live connector assumptions with synthetic request and expected-response evidence.
- Fixture change review replaces silent fixture drift with explicit expected-output fingerprint approval.
- Synthetic workflow execution readiness, deterministic result fixtures, result validation, promotion review, and governed execution contracts replace premature live workflow automation.
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

These contracts are intentionally non-executing. They keep CarePath AI, DocuTwin, and TrialCore moving toward implementation while blocking live patient routing, final documentation, enrollment claims, treatment recommendations, production connector use, and production data ingestion until auth, identity, persistence, audit logging, privacy/security review, and connector governance are explicit.

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
