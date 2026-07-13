# SCRIMED Intelligence Control Plane Implementation Map

Updated: 2026-07-11

## Existing Components To Extend

- `app/lib/scrimed-work`: Definition of Done, sessions, AAL2-protected durable writes, model routing, provider registry, agent/tool orchestration, context retrieval, verification, artifacts, voice simulation, learning proposals, audit, cancellation, rollback, and value telemetry.
- `app/lib/scrimedComputeFabric.ts`: model candidate metadata, private/edge deployment modes, benchmarking, cost/latency classes, and confidence-versus-correctness controls.
- `app/lib/scrimedClinicalBenchmarkSuite.ts`: synthetic specialty, administrative, interoperability, and compliance benchmark definitions.
- `app/lib/scrimedReasoningStability.ts`: loop, repetition, consistency, hallucination-risk, retry, confidence, and safety metadata.
- `app/lib/capitalVitality.ts`: claims-safe capital readiness, revenue capability, moat, milestone, and external-review evidence.
- `app/lib/scrimedSafetyGovernance.ts`, protected pilot identity utilities, and SCRIMED Work durable-store migration: central fail-closed policy and mutation authority.

## New Components

- A typed control-plane facade over the existing engines.
- Versioned agent, skill, workflow, provider-policy, and healthcare ontology registries.
- Context Fabric scoring with tenant isolation, ontology/graph boosts, freshness, citations, and prompt-injection classification.
- Sol/Terra/Luna policy profiles over provider-neutral model routing.
- Effective-cost accounting and workflow-specific efficiency frontiers.
- ConsequenceBench with consequence-weighted and worst-group reporting.
- A structured Reasoning Observatory with objective-drift and nonprogress detection, without hidden chain-of-thought.
- Internal-only Capital Intelligence, Compute Resilience, and baseline-first Outcome Intelligence.
- A dated Cross-Platform Evidence Reconciler for source, deployment, data-plane, public-claims, and design-governance drift.
- A unified `/scrimed-control-plane` executive surface and `/api/scrimed-control-plane/*` dispatch layer.

## Consolidation Decisions

- SCRIMED Work remains the only work-session runtime and protected mutation authority. The control plane delegates to it instead of creating another session store.
- Existing model and compute registries remain provider adapters; the Sol/Terra/Luna names are policy classes, not hard-coded vendor models.
- Existing safety governance remains authoritative. Control-plane checks add context but cannot relax a denial.
- Existing clinical benchmark definitions seed ConsequenceBench; no parallel clinical leaderboard is created.
- Capital Intelligence extends Capital Vitality and remains preparation-only. It cannot contact investors or make securities representations.

## API Plan

One App Router optional catch-all route serves the root summary and the documented subpaths. Read endpoints expose synthetic metadata. Every POST delegates to SCRIMED Work protected authorization, requires idempotency, and fails closed unless approved AAL2 durable-write controls are enabled.

- Root and brief
- Sessions and governed transitions
- Agents, skills, workflows, and providers
- Model routing and Context Fabric search
- Artifact preparation and ConsequenceBench execution
- Voice simulation
- Compute resilience, Capital Intelligence, outcomes, approvals, and cross-platform evidence

## Test Plan

- Source contract for required files, API dispatch paths, registries, flags, navigation, and prohibited claims.
- Deterministic checks for Definition of Done, context isolation, provider privacy, consequence weighting, drift/loop escalation, capital outbound blocking, voice emergency escalation, compute resilience, outcome baselines, cancellation, rollback, and telemetry redaction.
- Existing SCRIMED Work, safety, compute, benchmark, nonsecret, typecheck, lint, build, and generated-integrity gates remain mandatory.

## Migration Plan

No new migration is introduced. Protected control-plane session and artifact writes reuse `supabase/migrations/20260709193000_scrimed_work_durable_store.sql`. The deterministic in-memory adapter remains nonproduction and is never represented as durable proof.

## Safety Boundaries

Synthetic and de-identified fixtures only. No live PHI, autonomous diagnosis, treatment, prescribing, final imaging interpretation, EHR writeback, payer submission, investor outreach, financing negotiation, securities representation, production deployment, certification claim, customer activation, raw secret logging, private prompt logging, or hidden chain-of-thought storage.
