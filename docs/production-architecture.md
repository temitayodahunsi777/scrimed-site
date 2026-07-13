# SCRIMED Production Architecture

Updated: 2026-06-27

SCRIMED Production Architecture v1 is the governed contract for building SCRIMED into an AI-native healthcare intelligence operating system while preserving current clinical, PHI, certification, and production-use boundaries.

## Surfaces

- `/production-architecture`
- `/api/production-architecture`
- `/api/production-architecture/brief`
- `/workflows/execution-attempts`
- `/api/workflows/execution-attempts/envelope`
- `/api/workflows/execution-attempts/envelope/brief`
- Product Console: `/product` and `/api/product/console`

## What This Adds

- Agent Runtime contract for persistent identity, scoped permissions, memory hooks, tool registry, approval gates, audit logging, failure recovery, and replayable traces.
- Context Engine domains for patient, clinical, operational, payer/RCM, evidence, and organization policy context with strict PHI-safe handling and compression rules.
- Trust Engine v2 controls for evidence cards, confidence and uncertainty scoring, source attribution, human-review status, clinical risk, refusal boundaries, and immutable audit events.
- Vendor-neutral Model Router mesh covering OpenAI, Claude, Gemini, Llama, Mistral, Qwen, Z.ai GLM, DeepSeek, and future models without hard-coding SCRIMED to one provider.
- Evaluation Engine scenarios for agent scorecards, hallucination checks, clinical safety, evidence quality, regression, synthetic patient missing data, and adversarial prompt-injection tests.
- ClinSecOps controls for HIPAA-aware design, no-PHI fixtures, SBOM readiness, secret scanning, prompt-injection defense, RBAC, and audit trails.
- Workflow Engine tracks for billing/coding, scheduling/referral routing, prior authorization, revenue-cycle denial review, and organization policy rules.
- Execution Attempt Envelope contract with no-PHI validation, deterministic idempotency keys, replay metadata, model-route telemetry, human review gates, audit traces, failure recovery, and no-PHI release scorecards.

## Current Boundary

This is an architecture contract and synthetic evaluation layer only. It does not authorize PHI processing, live patient data, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, claim submission, HIPAA/SOC/HITRUST/FDA certification, production connector approval, production model routing, or clinical production use.

## GO / NO-GO

- GO: governed synthetic evaluation, buyer diligence, no-PHI pilot planning, internal architecture review, model-provider benchmarking, release smoke coverage, and protected proof preparation.
- NO-GO: live clinical production, production PHI routing, autonomous clinical action, payer submission, patient outreach, record mutation, final billing/coding, certification claims, and customer go-live.

## Next Engineering Steps

- Add a production model registry table and provider/version telemetry schema before any live model routing.
- Persist execution-attempt envelopes in a tenant-scoped durable store with idempotency TTL, locking, replay lookup, retention, encryption, and regional residency.
- Wire the no-PHI eval runner into CI and release evidence so scorecard failures block production promotion.
- Add CI secret scanning and SBOM generation before enterprise security review.
- Design tenant-scoped context authorization for future PHI-enabled deployments without enabling PHI now.
