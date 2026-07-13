# SCRIMED Execution Attempt Envelope

Updated: 2026-06-28

SCRIMED Execution Attempt Envelope v1 is the metadata-only runtime contract for future governed workflow attempts. SCRIMED Execution Attempt Durable Store v1 adds a tenant-scoped persistence contract for those known no-PHI envelopes without granting live clinical, payer, EHR, connector, or PHI authority.

## Surfaces

- `/workflows/execution-attempts`
- `/api/workflows/execution-attempts`
- `/api/workflows/execution-attempts/envelope`
- `/api/workflows/execution-attempts/envelope/brief`
- `/api/workflows/execution-attempts/durable-store`
- `/api/workflows/execution-attempts/durable-store/brief`
- `/api/workflows/execution-attempts/durable-store/record`
- `/api/workflows/execution-attempts/durable-store/replay`
- `/api/workflows/execution-attempts/durable-store/review-disposition`
- Product Console: `/product` and `/api/product/console`
- Production Architecture: `/production-architecture` and `/api/production-architecture`

## What This Adds

- Deterministic execution-attempt envelopes for synthetic workflow planning.
- Idempotency keys scoped to workflow, tenant reference, caller role, input digest, and context fingerprint.
- Replay metadata that returns retained metadata only and cannot repeat external side effects.
- Model-route telemetry for provider class, model version placeholder, cost estimate, latency budget, confidence, fallback class, and routing rationale.
- SCRIMED Compute Fabric telemetry for selected model, model tier, provider, deployment mode, PHI policy, human-review requirement, fallback models, cost class, latency class, confidence/correctness boundary, and deterministic audit hash.
- Evidence audit trail binding for `compute_fabric_audit_hash`, `compute_fabric_selected_model`, `compute_fabric_model_tier`, `compute_fabric_provider`, `compute_fabric_deployment_mode`, `compute_fabric_phi_policy`, and `compute_fabric_human_review_required`.
- Human approval gates for protected healthcare workflows.
- Metadata-only audit traces with retained and prohibited field lists.
- Failure recovery with quarantine triggers, fallback behavior, rollback statement, and dead-letter owner.
- No-PHI eval scorecards for idempotency, replay, PHI boundary, route telemetry, human review, audit linkage, protected-capability denial, failure recovery, and context fingerprinting.
- Migration-ready Supabase private-schema tables for durable attempts, immutable attempt events, and human-review dispositions.
- Backward-compatible Compute Fabric evidence projection migration: `20260705164000_execution_attempt_compute_fabric_evidence_binding.sql`.
- Protected record, replay, and review-disposition APIs that fail closed without Supabase Auth, AAL2 governance session, tenant access, and server runtime token.
- Healthcare AI OS architecture coverage for Clinical Robustness Lab, Agent Orchestration, MCP Gateway, Dynamic Model Routing, Lazy Capability Loading, Few-Shot Engine, Live Steering, ReferralOS, Ambient Clinical Workflow, Research Pipeline, Scientific Agents, Edge/Private AI, MLOps/AIOps, Security/Compliance, Progressive Delivery, and Observability.

## Current Boundary

This release is GO for synthetic, metadata-only envelope inspection, buyer diligence, architecture review, replay planning, no-PHI scorecards, migration-ready durable attempt storage, and protected human-review disposition APIs.

It is NO-GO for live clinical production, PHI processing, durable live attempt payloads, autonomous protected workflow execution, payer submission, claim submission, final coding, billing action, patient outreach, EHR writeback, production connector use, production model routing, certification claims, or customer go-live.

## Hard Stops

- No live patient data or production PHI in envelope input, traces, scorecards, docs, or fixtures.
- No autonomous diagnosis, treatment, prescribing, clinical triage, patient instruction, or patient outreach.
- No payer submission, claim submission, final coding, billing action, appeal filing, or reimbursement assurance.
- No EHR writeback, record mutation, connector write, production connector call, or customer go-live action.
- No production model routing without approved provider terms, privacy/security review, telemetry, fallback, and human review.
- No Compute Fabric routing decision can become clinical authority; it is retained as metadata-only evidence for review and durable replay.
- No durable production execution claim until the migration is applied, authenticated AAL2 smoke passes, tenant retention/residency is approved, customer authorization exists, and connectors/model routes are separately approved.

## Next Engineering Steps

- Extend durable-store schema/RPC evidence projections with SCRIMED Compute Fabric selected model, tier, provider, deployment mode, PHI policy, fallback path, human-review flag, and audit hash.
- Add production model registry tables for provider, model version, cost, latency, privacy, risk tier, fallback, approval state, and Compute Fabric compatibility.
- Wire scorecard execution into CI and release evidence so no-PHI eval failures block deployment before production promotion.
- Apply and verify the Supabase durable-store migration, RPC hardening migration, and advisor-alignment migration in each environment, then run `npm run smoke:execution-attempt-durable-store:authenticated` with AAL2 bearer-token evidence for record, replay, idempotency reuse, and review-disposition smoke.
- Enable Supabase leaked-password protection before any password sign-in path is used for protected operations, or keep SCRIMED protected routes passkey/magic-link first with password sign-in excluded.
- Add OAuth scoped-token issuance, revocation, and tool-level authorization for the production MCP gateway.
- Design dead-letter, retry, quarantine, and incident-review runbooks for future governed execution workers.
