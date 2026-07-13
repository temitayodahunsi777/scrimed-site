# SCRIMED TrustOps Intelligence Layer

SCRIMED TrustOps Intelligence Layer is a synthetic-only architecture layer that prepares SCRIMED for safe healthcare agent orchestration by combining module governance, signal detection, structured validation, semantic intelligence, and human-in-the-loop remediation recommendations.

Routes:
- `/scrimed-trustops`
- `/api/scrimed-trustops`
- `/api/scrimed-trustops/brief`
- `/api/scrimed-trustops/review-packets`
- `/api/scrimed-trustops/review-packets/brief`

## Safety Boundary

Demo/synthetic only. SCRIMED TrustOps does not authorize live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, billing submission, production connector use, certification claims, compliance completion claims, or customer go-live.

All remediation actions are recommendations only. Human review is required before any protected workflow, clinical workflow, payer workflow, billing workflow, outreach workflow, EHR workflow, or connector workflow can move beyond synthetic mode.

## Module Registry

TrustOps registers and scores:
- Patient Journey Memory
- Clinical Intelligence
- RCM / Denials
- Prior Authorization
- Patient Access
- Scheduling
- Referral Management
- Imaging Intelligence
- Population Health
- Quality / HEDIS / STAR
- Governance / Compliance
- Signal Detection
- Self-Healing Operations
- Semantic Intelligence Graph
- Secure Middleware Gateway

Each module includes id, name, category, description, strategic value, capabilities, required data, synthetic inputs, structured outputs, safety boundaries, TrustOps score, governance score, automation risk, interoperability readiness, evidence requirements, and the recommended next build step.

## TrustOps Scoring

The scoring formula weights safety and governance highest:

`total = safety*0.30 + governance*0.25 + evidence*0.18 + workflowValue*0.15 + interoperability*0.12 - riskPenalty*0.30`

Score components:
- Safety: likelihood that the module stays inside no-PHI and human-review boundaries.
- Evidence: quality of traceability, source requirements, and schema validation.
- Workflow value: expected operational or strategic value.
- Governance: readiness for policy gates, auditability, and human review.
- Interoperability: readiness for standards and middleware pathways.
- Risk penalty: automation, ambiguity, clinical, payer, EHR, billing, outreach, or connector risk.

## Synthetic Signal Engine

Current synthetic signals:
- denied_claim_spike
- referral_delay
- prior_auth_stalled
- missing_documentation
- imaging_turnaround_delay
- care_gap_detected
- failed_api_sync
- duplicate_patient_context
- low_confidence_agent_output
- compliance_sensitive_task

Each signal returns severity, affected workflow, recommended owner, recommended action, automation eligibility, human-review requirement, reason, and safety boundary.

## Self-Healing Workflow

Self-healing is recommendation-only. It can recommend:
- retry workflow
- regenerate missing packet
- request human review
- escalate to compliance
- queue for manual verification
- reconcile duplicate records
- re-run validation
- open investigation ticket
- pause automation

It cannot execute real clinical, payer, EHR, billing, outreach, PHI-impacting, or production connector actions.

## Durable Review Packet Binding

TrustOps now produces replayable no-PHI review packets for every synthetic signal and recommendation pair. Each packet includes:
- packet id
- packet hash
- evidence envelope hash
- signal id
- recommendation id
- affected workflow
- module ids
- reviewer queue
- synthetic-only flag
- human-review requirement
- automation execution disabled flag
- durable-store record request
- durable-store replay request
- durable-store review-disposition request

The durable binding uses the existing SCRIMED execution-attempt durable-store routes:
- `/api/workflows/execution-attempts/durable-store/record`
- `/api/workflows/execution-attempts/durable-store/replay`
- `/api/workflows/execution-attempts/durable-store/review-disposition`

The review packets are `ready-for-aal2-protected-durable-store-not-persisted`. The public TrustOps API does not write protected storage, bypass AAL2, bypass tenant authorization, or create live workflow authority.

## Structured Validation

The current implementation uses lightweight runtime validation because Zod is not present in the project dependency graph. Generated module briefs, synthetic signals, and self-healing recommendations are validated for required fields, score ranges, synthetic-only flags, and recommendation-only safety language.

## Future Roadmap

1. Version TrustOps thresholds and owner maps.
2. Attach TrustOps summaries to investor and buyer diligence packets.
3. Promote Secure Middleware Gateway before any future tool or connector evaluation.
4. Persist accepted TrustOps review packets only through AAL2 protected durable-store record, replay, and review-disposition routes.
5. Keep all remediation recommendation-only until legal, privacy, security, clinical, customer, and production connector approvals exist.
