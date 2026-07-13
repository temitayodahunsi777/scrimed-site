# SCRIMED Governance + Learning Loop

SCRIMED Governance + Learning Loop is a synthetic/no-PHI control plane for improving healthcare AI agents without weakening safety boundaries.

## Why It Matters

Governance is SCRIMED's competitive advantage. The platform is not positioned as a basic chatbot; it is a healthcare intelligence operating system that connects agent identity, policy, audit, reviewer feedback, value metrics, regulatory watch, and evidence-bound improvement.

## Memory Is Not Learning

Memory stores what happened. Learning improves the next attempt.

SCRIMED treats agent traces, audit events, reviewer notes, and workflow outcomes as memory until they pass through a governed learning loop:

observe -> evaluate -> correct -> approve -> update artifact -> retest -> monitor

No prompt, policy, demo, workflow, or buyer-facing claim should be promoted from a trace alone. It needs a correction artifact, human review, retest evidence, and monitoring.

## Clinical Guardrails

SCRIMED remains limited to decision support, education, workflow support, administrative automation, synthetic demonstrations, and governance readiness. Human review remains required for clinical-facing outputs.

Current hard stops:

- No live PHI or source patient records.
- No autonomous clinical decisioning.
- No diagnosis, treatment, prescribing, or final triage authority.
- No EHR writeback, order entry, chart mutation, or payer submission.
- No regulatory, security, or production approval claims.

## Contextual Policy Engine

The contextual agent policy engine evaluates what an agent has already read, done, requested, and spent before permitting tool use.

Default policies:

- confidential-document-read -> external-send requires approval
- untrusted-external-content-read -> elevated prompt-injection risk
- cost-threshold exceeded -> ask approval
- clinical-facing output -> human review required
- payer submission -> deny
- EHR writeback -> deny
- diagnosis/treatment/prescribing -> deny
- public-safe educational output -> allow

## A2A/MCP Roadmap

SCRIMED uses A2A-style handoffs and MCP-style governed tool access as readiness architecture only.

Agents should pass scoped context, identity, permission state, risk tier, and audit hash to each other. Tools should be mediated by deny-by-default permissions, scoped tokens, revocation, and audit events.

No agent may directly access production systems of record, raw schemas, payer submission tools, or EHR write paths.

## Value-Based Pricing Logic

SCRIMED should price based on measurable workflow value rather than token usage.

Pricing signals include:

- denial risk reduction
- documentation time saved
- workflow throughput
- governance readiness
- reviewer burden reduced
- proof-packet readiness

These are readiness and pilot-pricing inputs, not ROI guarantees, reimbursement guarantees, audited financial claims, or procurement approvals.

## Regulatory Watch Scope

SCRIMED tracks HIPAA privacy/security readiness, HTI-6 and ONC interoperability signals, FHIR and identity rules, OCR/HHS enforcement patterns, and AI governance developments as internal readiness inputs.

This watch layer does not create legal advice, compliance assurance, certification, or launch approval.

## Radiology And Wearables Foundations

Radiology/imaging-to-action is workflow metadata only: routing, follow-up status, turnaround delay, documentation readiness, and specialist review. It is not final medical interpretation.

Wearables intelligence is synthetic time-series readiness only: trends, device status, adherence risk, accessibility, and human escalation thresholds. It is not emergency triage replacement or live monitoring authority.
