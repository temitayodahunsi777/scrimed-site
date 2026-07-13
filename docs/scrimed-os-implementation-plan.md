# SCRIMED OS Implementation Plan

SCRIMED OS is a Healthcare Intelligence Operating System roadmap, not a chatbot roadmap. It is designed to orchestrate frontier models, agents, clinical workflows, FHIR/EHR data, imaging systems, memory, governance, auditability, outcome tracking, and enterprise deployment.

## Routes

- UI: `/scrimed-os`
- JSON: `/api/scrimed-os/implementation-plan`
- Brief: `/api/scrimed-os/implementation-plan/brief`
- Upgrade batch JSON: `/api/scrimed-os/upgrade-batch`
- Upgrade batch brief: `/api/scrimed-os/upgrade-batch/brief`

The current upgrade batch is documented in `docs/scrimed-os-upgrade-batch.md` and remains synthetic, metadata-only, and production-disabled.

## Current GO Scope

- No-PHI architecture planning.
- Synthetic workflow design.
- Registry contracts.
- Event contracts.
- Investor, buyer, and enterprise technical diligence.

## Current NO-GO Scope

- Live PHI.
- Autonomous diagnosis, treatment, prescribing, triage, or patient advice.
- Direct LLM-to-database access.
- Patient outreach.
- Payer submission.
- EHR writeback.
- Production connector use.
- Kubernetes or infrastructure mutation.
- Clinical validation, certification, or customer go-live.

## Capabilities Covered

1. SCRIMED Event Mesh
2. Agent Identity Registry
3. Secure MCP Gateway
4. CodeMode Runtime for agents
5. Clinical Workflow Orchestrator
6. Agent Registry
7. Prompt Registry
8. Policy Registry
9. Model Registry
10. Evaluation Registry
11. FHIR Validation Agent
12. Imaging Integration Layer
13. Configuration Drift Agent
14. AI Cost Intelligence Agent
15. Observability Platform
16. Autonomous Remediation Agent
17. Clinical QA Engine
18. Continuous Outcome Learning Engine
19. Infrastructure-as-Code Engine
20. Kubernetes Deployment Engine
21. Zero-Trust Audit Ledger
22. SQL/FHIR Query Validation Middleware
23. Deployment Approval Pipeline
24. Secure RAG/Data Ingestion Pipeline
25. Human-in-the-loop Clinical Safety Sandbox

## Roadmap Phases

1. Safety and architecture contract.
2. Governance backbone.
3. Tool and runtime plane.
4. Clinical and data workflows.
5. Operations intelligence.
6. Deployment platform.
7. Outcome learning.

## Starter Repository Direction

- `app/lib/scrimedOSImplementationPlan.ts` for typed architecture contracts.
- `packages/event-mesh` for event envelopes, outbox, broker adapters, and replay.
- `packages/agent-runtime` for identity, scopes, CodeMode, MCP gateway clients, and traces.
- `packages/registries` for agent, prompt, policy, model, and evaluation registry schemas.
- `packages/clinical-workflows` for orchestrator, FHIR validation, imaging contracts, and clinical QA.
- `infra/` for IaC, Kubernetes, policy-as-code, canary, and rollback templates.

## Agents To Build

- Clinical Intake Agent.
- FHIR Validation Agent.
- Imaging Integration Agent.
- Clinical QA Agent.
- Patient Engagement Agent.
- Configuration Drift Agent.
- AI Cost Intelligence Agent.
- Autonomous Remediation Agent.

The Patient item from the originating request is modeled safely as Patient Engagement Agent: general education drafts only, no patient-specific medical advice, no outreach authority, and human review required.

## First Implementation Step

Build the Event Mesh plus Agent Identity Registry first, then bind Secure MCP Gateway and CodeMode Runtime to those identities before any clinical workflow or data connector receives tool access.

This document is a roadmap and starter architecture. It does not authorize PHI, live clinical care, payer submission, EHR writeback, production connectors, infrastructure mutation, clinical validation, certification, or customer go-live.
