# SCRIMED Trust And Safety Operations

Updated: 2026-06-16

## Status

Trust Safety Operations v4 is active as an inspectable operating model, synthetic incident operations layer, and tenant-scoped durable TrustOps workspace:

- UI: `/trust-safety-operations`
- API: `/api/trust-safety-operations`
- Incident report API: `/api/trust-safety-operations/incidents/{incidentId}/report`
- Authenticated workspace UI: `/pilot-workspace/access`
- Tenant incident dashboard API: `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents`
- Tenant incident update API: `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}`
- Tenant incident review packet API: `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}/review-packet`
- Aggregate enterprise proof packet API: `/api/pilot-workspaces/{workspaceSlug}/enterprise-proof-packet`
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

SCRIMED now has applied Supabase migrations for tenant-scoped TrustOps incidents:

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
- covering indexes for TrustOps and Agent Workspace foreign keys surfaced by Supabase performance advisors

This is designed for protected synthetic pilots and enterprise readiness. It does not store PHI, live clinical records, patient identifiers, secrets, payer member identifiers, production breach determinations, legal advice, compliance certification, or managed 24/7 SOC/MDR coverage.

The authenticated workspace panel lets approved tenant members inspect dashboard metrics, create no-PHI incident records, commit status and legal-hold/notification review updates, inspect the event trail, and download audited review packets.

Tenant admins and pilot leads can also download an aggregate enterprise proof packet from `/pilot-workspace/access`. The packet combines synthetic pilot sessions, TrustOS decisions, Agent Workspace work orders, Trust Safety incidents, tenant access posture, governance ledger records, and recent audit activity only after a write-before-release audit event is committed.

Approved tenant members can run tenant-session verification from `/pilot-workspace/access` using their current AAL2 browser session. The verification checks protected workspace routes, TrustOps, Agent Workspace, tenant access, audit, and the aggregate enterprise proof packet without storing the session bearer token in GitHub Actions or source control.

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
- Applied the tenant TrustOps incident migration to Supabase production.
- Applied foreign-key index hardening for TrustOps and Agent Workspace tables after Supabase advisor review.
- Added the authenticated `/pilot-workspace/access` TrustOps incident panel.
- Added passkey-aware tenant sign-in and enrollment controls while preserving AAL2/TOTP gates for governed TrustOps mutation paths.
- Added authenticated passkey management for listing, renaming, registering, and revoking passkeys from protected product consoles.
- Added a tenant-admin aggregate enterprise proof packet with write-before-release audit and no-secret fail-closed smoke coverage.
- Added browser-session tenant verification for protected workspace routes and the audited enterprise proof packet without CI credential storage.
- Added a protected Pilot Demo Readiness Command Center that turns tenant-session verification, durable synthetic sessions, proof-packet audit events, and append-only audit visibility into demo readiness scoring, blockers, buyer brief lines, and a repeatable runbook.
- Added the `passkey-or-magic-link` tenant identity readiness posture so TrustOps and tenant administration can reflect the current phishing-resistant sign-in posture.
- Added `scripts/trustops-authenticated-smoke.mjs` for fail-closed and authenticated TrustOps route verification.
- Added `scripts/public-production-smoke.mjs` for no-secret public route, product posture, readiness, and fail-closed verification.

## Remaining Limitations

- Production managed 24/7 coverage still requires staffed on-call/SOC/MDR coverage, contracts, tabletop exercises, customer-specific runbooks, and external security review.
- Tenant TrustOps storage is synthetic-pilot and enterprise-readiness only; regulated production incidents require customer-approved live-data boundaries, breach analysis, notification decisions, and forensic process.
- Supabase Auth leaked-password protection remains a dashboard-level security setting for password-based auth. SCRIMED product flows remain passkey or passwordless magic-link based; enable leaked-password protection if password sign-in remains active anywhere in the project.
- Unattended authenticated TrustOps, Agent Workspace, and enterprise proof-packet happy-path smoke requires a CI-held short-lived AAL2 tenant-admin or pilot-lead bearer token; public readiness, unauthenticated fail-closed smoke, human-run demo readiness, and human-run tenant-session verification can run without storing CI credentials.
- Supabase passkeys are currently experimental per Supabase documentation and require stable relying-party domain/origin configuration; changing the relying-party ID invalidates enrolled passkeys.
- Clinical, legal, privacy, security, copyright, trademark, reimbursement, and advertising determinations still require qualified human reviewers.

## Next Build Step

Run `scripts/public-production-smoke.mjs` on every production deployment, use `/pilot-workspace/access` demo readiness and tenant-session verification before buyer demos, place a short-lived CI-held AAL2 smoke token only when unattended authenticated mutation smoke is required, and enable leaked-password protection in Supabase only if password auth remains enabled for any non-SCRIMED product flow.
