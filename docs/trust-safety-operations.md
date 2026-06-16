# SCRIMED Trust And Safety Operations

Updated: 2026-06-16

## Status

Trust Safety Operations v3 is active as an inspectable operating model, synthetic incident operations layer, and tenant-scoped durable TrustOps workspace contract:

- UI: `/trust-safety-operations`
- API: `/api/trust-safety-operations`
- Incident report API: `/api/trust-safety-operations/incidents/{incidentId}/report`
- Tenant incident dashboard API: `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents`
- Tenant incident update API: `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}`
- Tenant incident review packet API: `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}/review-packet`
- Trust Center: `/trust-center`
- Claims Register: `/claims`
- Audit Layer: `/audit`
- Observability: `/observability`

## Purpose

SCRIMED now defines a 24/7 trust, safety, monitoring, auditing, fixing, and continuous-improvement model across:

- PHI shielding
- Agent firewalling
- Copyright, trademark, license, and provenance control
- Claims and legal guardrails
- Clinical safety boundaries
- Security incident watch
- Continuous improvement

## Incident Queue

Trust Safety Operations now tracks no-PHI product-control incidents with:

- severity
- status
- owner
- accountable agent
- source channel
- affected surface
- containment action
- remediation plan
- legal-hold status
- evidence routes
- audit event names
- improvement actions
- downloadable incident report

Seeded incident classes cover:

- PHI-style intake content
- unsupported claims and advertising substantiation
- copyright, trademark, license, and provenance gaps
- dedicated attribution packet audit event rollout
- 24/7 managed coverage claim gating
- runtime, dependency, and deployment anomaly watch

## Tenant TrustOps Durable Workspace

SCRIMED now has a Supabase migration contract for tenant-scoped TrustOps incidents:

- private schema incident table
- private schema append-only incident event table
- RLS deny-all policies as defense in depth
- guarded RPC dashboard for tenant admins, pilot leads, and reviewers
- AAL2 tenant-admin or pilot-lead incident creation and update
- legal-hold status and retention fields
- notification decision fields
- post-incident review status
- write-before-release incident review packet audit
- pilot audit event integration

This is designed for protected synthetic pilots and enterprise readiness. It does not store PHI, live clinical records, patient identifiers, secrets, payer member identifiers, production breach determinations, legal advice, compliance certification, or managed 24/7 SOC/MDR coverage.

## Target Audience Appeal

The TrustOps layer is especially relevant for:

- CIOs and transformation leaders evaluating SCRIMED as a governed healthcare intelligence layer.
- CISOs, security reviewers, and privacy officers reviewing authentication, tenant isolation, legal-hold posture, and audit packet controls.
- Compliance, legal, and governance teams reviewing claims, limitations, notification decisions, and qualified human-review requirements.
- Clinical operations, RCM, research, payer, and government teams that need evidence that AI workflow incidents become owned, reviewable, and auditable.
- Enterprise buyers and investors evaluating whether SCRIMED turns trust into operational evidence instead of unsupported marketing language.

## Boundary

This is an operating model and product control layer. It is not legal advice, a compliance certification, managed SOC/MDR coverage, production clinical monitoring, or authorization for live clinical execution.

## Addressed Limitations

- Added a synthetic trust-ops incident queue and audit-ready report route.
- Added a tenant-scoped durable TrustOps migration contract with authenticated dashboard, mutation RPCs, event trail, legal-hold fields, notification decisions, and review-packet audit.
- Added a dedicated `attribution-analytics-packet-downloaded` migration, with a compatibility fallback to the prior sales artifact event until production migration verification is complete.

## Remaining Limitations

- Production managed 24/7 coverage still requires staffed on-call/SOC/MDR coverage, contracts, tabletop exercises, customer-specific runbooks, and external security review.
- Tenant TrustOps storage is synthetic-pilot and enterprise-readiness only; regulated production incidents require customer-approved live-data boundaries, breach analysis, notification decisions, and forensic process.
- The TrustOps Supabase migration must be applied and authenticated-smoke-tested in each environment before tenant mutation routes are used with buyers.
- Clinical, legal, privacy, security, copyright, trademark, reimbursement, and advertising determinations still require qualified human reviewers.

## Next Build Step

Apply and verify the tenant TrustOps Supabase migration in production, then add an authenticated workspace UI panel for incident creation, update, legal-hold review, notification decision, and packet download.
