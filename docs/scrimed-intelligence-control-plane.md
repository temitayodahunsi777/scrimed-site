# SCRIMED Intelligence Control Plane

## Purpose

The Intelligence Control Plane consolidates healthcare work orchestration into one governed executive view. It does not replace SCRIMED Work; it composes its durable session, authorization, context, routing, verification, approval, artifact, voice, learning, and value services with consequence-weighted evaluation, capital intelligence, compute resilience, and baseline-first outcomes.

## Data Flow

1. An authorized actor defines a bounded objective and Definition of Done.
2. Policy evaluates scope, risk, data classification, provider eligibility, and tool permissions.
3. Context Fabric retrieves tenant-scoped, cited records and treats their contents as untrusted data.
4. Sol/Terra/Luna policy selects a configured provider class; no privacy or residency fallback is allowed.
5. Specialist agents prepare a reversible draft.
6. Verification checks evidence, policy, PHI leakage, consistency, loops, budget, rollback, and approval.
7. Consequential or high-risk work pauses for named human review.
8. Artifacts retain lineage and become stale when source versions or calculations change.
9. Outcome comparisons remain empty until approved baselines and post-implementation evidence exist.

## Module Boundaries

- SCRIMED Work: session runtime and protected mutation authority.
- Context Fabric: hybrid deterministic ranking, ontology/graph boosts, freshness, citations, source risk, tenant isolation.
- Model Policy: provider-neutral Sol/Terra/Luna routing and effective-cost metadata.
- Verification: mandatory checks and multidimensional Trust Score.
- Reasoning Observatory: structured objective, plan, evidence, assumptions, contradictions, tools, policy, verification, and approval metadata. Hidden chain-of-thought is neither requested nor stored.
- ConsequenceBench: high-consequence, worst-group, edge-case, abstention, override, rollback, and distribution-shift readiness.
- Capital Intelligence: internal research, scoring, and draft preparation; CEO approval for outbound activity.
- Compute Resilience: capacity, residency, concentration, infrastructure, fallback, and migration policy metadata.
- Outcome Intelligence: separate baseline and post-implementation fields without fabricated improvements.
- Approval Achievement: dependency graph, dated evidence, owners, expiry, safe workarounds, and human/external authority boundaries.
- Cross-Platform Evidence: dated GitHub, Vercel, Supabase, Wix, and Figma observations, drift, owners, approval impact, and fail-closed release decisions without credentials or raw logs.
- Platform Strategy Registry: eleven-plane ownership map, capability evidence, portfolio
  dispositions, strategic metric definitions, commercialization boundaries, and moat hypotheses.
  Deterministic JSON artifacts are generated under `artifacts/platform`, `artifacts/product`, and
  `artifacts/investor` and checked for source drift.

## Feature Flags

Read-only synthetic functionality may default on locally. `SCRIMED_APPROVAL_ACHIEVEMENT_ENABLED` enables metadata-only approval tracking, `SCRIMED_CROSS_PLATFORM_EVIDENCE_ENABLED` exposes the read-only evidence snapshot, and `SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED` defaults false. Provider calls, schedules, protected mutations, capital outbound activity, clinical write operations, and customer activation remain disabled unless their separate authority gates are satisfied.

## Known Limitations

- Deterministic in-memory sessions are nonproduction and process-local.
- Protected durability requires the existing nonproduction Supabase migration and strict AAL2 smoke.
- Model profiles are configuration metadata; no external calls occur in this layer.
- Benchmarks have no performance evidence until an approved result corpus is supplied.
- Capital profiles are investor archetypes, not permission to contact any party.
- Outcome fields remain null until an approved pilot measurement plan produces evidence.
- Connector observations are dated snapshots, not live runtime synchronization, and expire unless refreshed.
- The retained direct-live Wix report shows the testimonial, commerce, homepage, and Vitals
  controls passing, but the FaithCore page, service page, and related post remain inconsistent
  with the approved optional and clinically neutral copy. A fresh network-capable strict check is
  required after owner publication.

## Production Hardening

Publish only the reviewed FaithCore copy through the Wix owner workflow, bind the current build to
a clean reviewed revision, and dry-run the three pending migrations only in an approved disposable
environment. Enable leaked-password protection through the scoped Supabase Auth control, run
strict AAL2 smoke, test tenant isolation and cancellation under failure, validate no-PHI canary
evidence, and complete clinical, privacy, security, legal, finance, and buyer-specific approvals
before scope expands.

When a local sandbox permits sockets, run `npm run smoke:scrimed-control-plane` against a started build. In socket-restricted environments, run `node scripts/scrimed-control-plane-smoke.mjs --compiled` after `npm run build` to exercise the compiled API handler and verify the compiled page module.
