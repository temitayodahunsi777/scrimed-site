# Capacity Scarcity Runbook

## Admission Order

1. Preserve Tier 0 identity, authorization, audit, and safety controls with reserved capacity.
2. Bound Tier 1 queues and publish queue age, p95/p99 latency, and human-handoff state.
3. Shed or defer Tier 2 evaluation, enrichment, reporting, and research work.

## Invariants

- Do not disable policy, evidence, privacy, review, or exact-version checks.
- Do not use an unauthorized model or region.
- Do not downgrade CAL or data residency.
- Do not omit provenance or CaseEvidence.
- Do not retry without a bounded retry budget and observable backoff.
- Do not silently fail over.

## Recovery

Verify capacity passport health, queue age, error rate, concentration exposure, fallback independence, and accepted-outcome cost before increasing concurrency. Require owner approval for an exception and set an expiry plus exit milestone.
