# SCRIMED Platform Architecture

Updated: 2026-05-29

SCRIMED is designed as an AI-native healthcare intelligence platform composed of modular services that support clinical workflows, operational automation, healthcare interoperability, and governed AI reliability.

## Current Runtime Surface

The current `scrimed-site` application is a Next.js App Router platform surface with these foundation layers:

- Public platform surface: `/`, `/platform`, `/trust`
- SCRIMED OS Hub: `/hub`, `/hub/readiness`, `/hub/events`
- Product modules: Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower pages under `/modules/*`
- Integration contracts: `/integrations`, `/contracts/[slug]`, `/api/contracts`, and `/api/contracts/[slug]`
- Synthetic validation: `/synthetic`, `/synthetic/[slug]`, `/synthetic/validation`, `/api/synthetic/scenarios`, `/api/synthetic/scenarios/[slug]`, `/api/synthetic/validation`, and `/api/synthetic/validation/[slug]`
- Quality gates: `/quality` and `/api/quality/gates`
- Core operational APIs: `/api/health`, `/api/status`, `/api/readiness`, `/api/events`, and `/api/hub/summary`

## System Layers

### Data Layer

- Healthcare interoperability contracts for FHIR and HL7
- Claims, utilization, and pricing transparency contract boundaries
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
- TrialCore for research matching workflows
- Watchtower for reliability, safety, and operational traces

### Trust Layer

- Watchtower regression and drift monitoring concepts
- Runtime trace visibility
- Safety and review requirements before clinical use
- Deployment and readiness monitoring
- Explicit quality gates for active, planned, and bypassed checks

## Quality Gate Model

SCRIMED currently uses a managed quality path instead of letting one blocked tool halt execution.

Active gates:

- Vercel deployment status as the primary deploy gate
- Executable synthetic clinical assertions for workflow validation without live patient data
- Integration contracts for future connector boundaries
- Hub readiness checks for operational visibility

Managed bypasses:

- GitHub Actions CI is configured but not treated as a blocking gate until workflow run visibility is available.
- Local package-manager builds are not available in the current Codex workspace because npm, pnpm, yarn, and corepack are not installed.
- Live clinical integrations remain gated until synthetic scenarios and contracts are stable.

Replacement process:

- Vercel deployment plus executable synthetic validation replaces unavailable local build verification.
- Contract and scenario APIs replace live connector assumptions.
- Readiness, event, and quality endpoints replace manual status tracking.

## Synthetic Validation Checks

Each synthetic scenario now receives deterministic checks for:

- synthetic-only labeling
- absence of obvious production identifiers
- synthetic clinical test contract binding
- risk marker retention
- workflow trace completeness
- assertion completeness
- human review, draft, no-final-claim, or Watchtower guardrails

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

SCRIMED is designed to function as the intelligence layer above existing healthcare systems, enabling providers, payers, researchers, and public health organizations to operate with more insight, automation, and trust.
