# SCRIMED Automation Autopilot

SCRIMED Automation Autopilot is a synthetic/no-PHI autonomy readiness control plane. It strengthens SCRIMED's automation capability by scoring what can safely run as metadata-only automation, what must be routed through human review, and what remains blocked before live production.

## What It Adds

- Capability-level autonomy modes: manual-only, recommendation-only, review-gated automation, and synthetic autopilot.
- Readiness scores across reliability, revenue impact, bottleneck reduction, and safety risk.
- Explicit approval gates, owners, trigger signals, blocked actions, and proof routes.
- Sample allow/review/block decisions with deterministic audit hashes.
- Bottleneck workarounds for go-live confusion, evidence assembly, unsafe autonomy pressure, and cost or margin leakage.

## Preserved Boundaries

This module does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production connector approval, credential rotation, production deploys, certification claims, revenue guarantees, SLA commitments, or customer go-live.

## Operating Model

1. Classify the requested automation domain.
2. Check whether the action is synthetic, reversible, and metadata-only.
3. If the action is sensitive, queue human review.
4. If the action touches PHI or production authority, block it.
5. Produce a proof route, owner, approval gate, next step, and audit hash.

## Strategic Use

SCRIMED can use this layer to increase automation speed without confusing internal readiness with live production authority. The near-term priority is automating repeatable proof packaging, release smoke summaries, service-delivery work-order drafting, cost guardrails, and buyer follow-up drafts while keeping external actions human-approved.
