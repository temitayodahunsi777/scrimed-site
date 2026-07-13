# SCRIMED Build Roadmap

Updated: 2026-06-30

Routes:
- `/scrimed-build-roadmap`
- `/api/scrimed-build-roadmap`
- `/api/scrimed-build-roadmap/brief`
- `/api/scrimed-build-roadmap/context-manifest`
- `/api/scrimed-build-roadmap/context-manifest/brief`
- `/api/scrimed-build-roadmap/strategic-execution`
- `/api/scrimed-build-roadmap/strategic-execution/brief`

## Boundary

SCRIMED Build Roadmap is a no-PHI, architecture-and-governance planning layer. It does not authorize live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, billing submission, EHR writeback, production connector use, certification claims, clinical validation claims, compliance completion claims, or customer go-live.

## Applied Directives

1. Treat LLMs as the interface layer, not the whole system.
2. Add world-model/context layers for messy healthcare data.
3. Build active ontology and semantic graph for clinical, payer, RCM, patient-access, and operations logic.
4. Store agent decision trace metadata, audit logs, and reviewer decisions as long-term memory without storing hidden chain-of-thought or PHI.
5. Add dynamic context injection for session-start planning summaries, every-turn skill/module listing, and updated task reminders.
6. Avoid the self-correction trap by validating with schemas, evidence, external data hooks, deterministic rules, and human review.
7. Add workforce/talent intelligence for healthcare hiring, onboarding, vacancy-risk, and labor-cost-savings assumptions.
8. Add project/resource management intelligence for compute, storage, quota, model usage, pipeline cost, and agent workload.
9. Build healthcare world models for time-series, geography, physical constraints, clinical workflow state, payer rules, and patient journey state.
10. Add benchmark layer for structured outputs, schema fidelity, reasoning validity, semantic graph consistency, and operational accuracy.

## New Modules

- Dynamic Context Injection Engine
- Active Ontology + Semantic Graph
- Decision Memory Ledger
- Workforce / Talent Intelligence
- Project / Resource Management Intelligence
- Operational Benchmark Layer

## Governed Healthcare Meta-Harness Priority Stack

SCRIMED must be a governed healthcare meta-harness: orchestrating agents, data, documentation, evidence, and outcomes with human oversight at every high-stakes step.

Priority items now tracked in code:
- Omnigent-style Meta-Harness: one orchestrator across coding, clinical, documentation, evidence, and operations agents with shared sessions, policies, guardrails, auditability, and human approval checkpoints.
- Documentation-Before-Authorization Engine: pre-submission prior-auth documentation checks for symptom language, functional status, visit timing, medical necessity phrasing, policy criteria, missing evidence, and denial risk. SCRIMED does not submit payer work.
- Edge Clinical Trial Evidence Layer: site/device-level trial evidence envelopes with validation, deterministic hashing, provenance, offline sync status, and reviewer queues. No live participant data or regulatory submission authority.
- On-Device De-Identification: local-first PHI detection/redaction roadmap for PDFs, scans, images, HL7 v2, CDA, FHIR, CSV, NDJSON, and chat logs before any external inference path.
- Clinical AI Benchmark Lab: specialty benchmark suites with physician-style grader rubrics for accuracy, utility, source quality, verifiability, and completeness without claiming clinical validation.
- Automation Orchestrator: workflow state machines, permissioned tool calls, approvals, retries, rollback plans, and audit logs that move SCRIMED beyond chatbot behavior while preserving protected-action blocks.
- Pre-Indexed Intelligence: ingest-time document pipelines, structure-preserving indexes, provenance, grounding reports, and retrieval evaluation instead of relying only on thin MCP connectors.
- AI Medical Education Layer: SCRIMED University clinician training, AI literacy, skill assessment, feedback loops, and personalized learning plans with non-certification disclaimers.

Every priority item remains synthetic/no-PHI or metadata-only until protected approvals, customer authorization, legal/compliance review, clinical governance, and security controls are complete.

## Omnigent-Style Meta-Harness

SCRIMED now includes a typed synthetic/no-PHI Omnigent-style Meta-Harness in `app/lib/scrimedMetaHarness.ts`, exposed through the SCRIMED Build Roadmap summary.

The meta-harness coordinates:
- coding agent
- clinical agent
- documentation agent
- evidence agent
- operations agent
- trust and safety agent

Each agent identity declares:
- purpose
- risk tier
- allowed tools
- blocked tools
- reviewer role
- no-PHI access boundary
- no protected-action authority
- telemetry requirement

The shared session model tracks:
- synthetic-only status
- no-PHI confirmation
- raw connector payload block
- shared context references
- policy references
- guardrails
- human approval gate for high-stakes actions

The evaluator returns allowed, human-review-required, or blocked decisions. Protected payer submission, patient outreach, EHR writeback, production connector activation, and raw-payload logging remain blocked. High-risk clinical, payer, connector, and trust/safety work routes to human review. The meta-harness does not execute tools against systems of record and does not grant autonomous clinical authority.

## Pre-Indexed Intelligence

SCRIMED now includes a typed synthetic/no-PHI Pre-Indexed Intelligence scaffold in `app/lib/preIndexedIntelligence.ts`, exposed through the SCRIMED Build Roadmap summary.

The scaffold prepares ingest-time intelligence without activating live ingestion:
- synthetic FHIR bundle metadata
- synthetic prior-auth policy metadata
- synthetic referral packet metadata
- synthetic clinical guideline metadata
- synthetic trial protocol metadata
- synthetic RCM denial playbook metadata

Each index record preserves:
- pages
- sections
- tables
- labels
- values
- units
- citations
- images
- references
- FHIR resources
- workflow steps
- payer criteria
- provenance references
- deterministic audit hashes

Retrieval evaluation now covers:
- patient matching
- document similarity
- clinical retrieval
- payer-policy lookup
- recommendation search

The layer emits enriched index manifests, provenance chains, grounding reports, traceability scores, and reviewer-required retrieval evaluations. It does not ingest live PHI, store raw connector payloads, expose raw schemas to agents, approve production connectors, make clinical recommendations, submit payer work, contact patients, or write back to EHRs.

## On-Device De-Identification

SCRIMED now includes a typed synthetic/no-PHI On-Device De-Identification scaffold in `app/lib/onDeviceDeidentification.ts`, exposed through the SCRIMED Build Roadmap summary.

The scaffold covers metadata-only redaction manifests for:
- PDFs
- scans
- images
- HL7 v2
- CDA
- FHIR
- CSV
- NDJSON
- chat logs

The manifest model tracks:
- browser, Mac, and iPhone-capable local runtime targets
- simulated detected PHI categories
- uncertain categories requiring manual verification
- structure-preservation metadata
- redaction actions
- raw payload storage status
- external inference blocked status
- human verification required status
- deterministic audit hash

This is not live PHI processing and it does not certify de-identification. The current scaffold stores no raw payloads, sends nothing to external inference, does not approve production connector use, and requires human verification before any future non-demo use.

## Documentation-Before-Authorization Engine

SCRIMED now includes a typed synthetic/no-PHI Documentation-Before-Authorization Engine in `app/lib/documentationBeforeAuthorization.ts`, exposed through the SCRIMED Build Roadmap summary.

The engine checks pre-submission prior-auth readiness for:
- symptom language
- functional status
- visit timing
- medical necessity rationale
- prior therapy history
- diagnosis-specific evidence
- policy reference
- recent visit note
- contraindication context
- reviewer attestation

It returns:
- missing documentation requirements
- present requirements
- missing evidence labels
- prior-auth risk signals
- recommended reviewer owner
- recommended actions
- automation eligibility
- deterministic audit hash
- payer submission blocked status

The engine is not payer-specific clinical advice and does not encode live UHC or other payer policy. It is a governed scaffold for synthetic documentation gap detection, reviewer packet drafting, and risk triage. SCRIMED does not submit prior authorizations, file claims, determine medical necessity, contact payers, write to EHRs, or use live patient data.

## Dynamic Context Injection Engine

SCRIMED now has an executable pre-agent-run context manifest for synthetic/no-PHI agent work. The manifest is generated by `app/lib/scrimedDynamicContextInjection.ts` and exposed at `/api/scrimed-build-roadmap/context-manifest`.

The manifest includes:
- selected modules loaded for the current task
- skill/module listing every turn
- versioned task reminders updated before the next run
- omitted context log for PHI, secrets, production connectors, irrelevant tools, and hidden chain-of-thought
- lazy capability loadout showing loaded, deferred, and blocked capabilities
- validators for schema, evidence, deterministic rules, human review, safety policy, and benchmarks
- metadata-only decision memory write plan
- manifest hash and policy/audit metadata

The context manifest does not grant tool permissions, expose secrets, store hidden chain-of-thought, authorize PHI, trigger patient outreach, submit payer or billing work, write back to EHRs, or approve production connectors.

Before every synthetic agent run, SCRIMED should create the context manifest, run the safety gate, inject only selected modules/skills/reminders/validators, record omitted context, and preserve a metadata-only audit trace.

## Strategic Execution Layer

SCRIMED now exposes a no-PHI strategic execution layer at `/api/scrimed-build-roadmap/strategic-execution`.

The layer enforces this operating mantra:

SCRIMED must be measurable, governed, observable, faster, cheaper, safer, and harder to copy.

Implemented control tracks:
- Agent Runtime context bridge: Workflow Planner and Agent Runtime must consume the pre-agent-run context manifest before selecting agents, tools, retrieval, model routes, workflow steps, or approval gates.
- Stored-vector lookup search: patient matching, document similarity, clinical retrieval, payer-policy lookup, and recommendation search are defined as internal stored-vector lookup/RPC contracts to replace get-then-search vector flows and reduce round trips, serialization, and tail latency.
- MedLog-style AI usage logging: every model/agent use is represented by event id, workflow trace id, redacted input hash, model/provider/version, redacted output hash, action taken, user feedback, downstream outcome, fairness slice, context effects, and clinician behavior-change fields.
- Healthcare AI observability: synthetic monitoring slices cover age, sex, geography, setting, time of day, payer, diagnosis, and workflow type so silent degradation can be detected before live deployment.
- Agentic workflow orchestration: patient intent maps to governed scheduling, intake, referral, authorization, RCM, outreach, and support actions with approval gates and blocked automation.
- AI Healthcare Investor Intelligence report: tracks startup verticals, valuations and raise sizes, geography, team composition, pitch patterns, and market gaps only as dated, cited market intelligence; it is not investment advice or securities material.
- Inference efficiency backlog: speculative decoding, block drafting, batching, semantic caching, and vLLM/TensorRT-style runtime readiness track cost per token, latency, throughput, quality, and rollback gates.
- Prescription engagement workflow: creates patient education and adherence-support drafts after a synthetic or future approved prescription-written event, but blocks autonomous patient outreach, medication changes, pharmacy actions, and medical advice.
- MLflow-style evaluation layer: prompt registry aliases, SME-ground-truth traces, custom judges, deterministic scorers, RAG evaluation, and model comparison are required before promotion.

### Stored-Vector Lookup Backend

Migration applied and structurally verified in the linked Supabase database: `supabase/migrations/20260630173000_scrimed_stored_vector_lookup_rpc.sql`

The backend migration creates a private-schema synthetic/no-PHI pgvector registry with deny-all RLS, no direct table grants, metadata-only lookup audit events, and public RPC wrappers for:
- `register_scrimed_synthetic_stored_vector`
- `scrimed_match_stored_vector`
- `scrimed_search_similar_documents`
- `scrimed_search_clinical_evidence`
- `scrimed_search_payer_policy`
- `scrimed_search_recommendation_memory`

The RPC layer requires AAL2 governance session checks, server runtime authorization, tenant-scoped roles, synthetic/no-PHI assertions, prohibited-content guards, human review, and no raw embedding return from search functions. The database now exposes a protected authenticated smoke path at `/api/scrimed-build-roadmap/stored-vector-rpc-smoke`, backed by `npm run smoke:scrimed-stored-vector-rpc:authenticated` and `npm run smoke:scrimed-stored-vector-rpc:strict`. This does not activate live PHI, patient identity matching, diagnosis, treatment, prescribing, outreach, payer submission, billing submission, EHR writeback, production connector use, certification claims, or clinical validation claims.

Operational workaround: `npm run smoke:aal2:readiness` provides a no-secret preflight for token freshness, workspace slug, target runtime assumptions, and exact next commands. Non-strict stored-vector and durable-store smoke scripts treat expired or invalid local AAL2 tokens as stale operator credentials and skip authenticated writes after proving unauthenticated fail-closed behavior. Strict smoke still fails closed until a fresh AAL2 token is supplied.

## World Model Layers

- Time-Series Layer
- Geography Layer
- Physical Constraints Layer
- Clinical Workflow State Layer
- Payer Rules Layer
- Patient Journey State Layer

## Benchmark Layer

Benchmarks must measure:
- structured-output fidelity
- schema fidelity
- reasoning validity
- operational accuracy
- semantic graph consistency

SCRIMED must not trust model self-verification alone. Release gates must use schema validators, evidence grounding, deterministic rules, external data hooks where approved, and human-review dispositions.

## Next Build Step

Implement the Dynamic Context Injection Engine and Operational Benchmark Layer first, then connect workforce/resource synthetic signals to TrustOps before any broader automation expansion.
