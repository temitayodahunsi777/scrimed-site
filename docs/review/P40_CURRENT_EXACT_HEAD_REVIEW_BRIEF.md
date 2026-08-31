# PR #40 Current Exact-Head Review Brief

Target reading time: **10 minutes or less**

## Stop Condition

Open `artifacts/release/scrimed-p34-release-manifest.json`. Stop if its PR, commit, tree, candidate, source, validation, gate, review, SBOM, security, route, render, or preview binding differs from PR #40.

## Predecessor Relationship

PR #40 is based on PR #39 exact head `45be650f48e422b05160821681ff40bb9f1229c9`. This review covers the focused delta only; the predecessor requires its own decision.

## Highest-Risk Delta

1. Pilot manifest validation and immutable evidence-ledger completeness.
2. Cost governor, proposal authority, and protected-pilot expansion boundaries.
3. Exact-head review freshness and replay prevention.
4. Independent route/render regression baselines.
5. Protected Vercel preview credential handling and fail-closed write checks.
6. Public commercial pricing: protected and operating tiers remain custom scope.

## Required Evidence

Run status must include p.34 certification, Node 24, nonsecret suite, secret scan, dependency audit, SBOM, generated integrity, build, public smoke, protected-write denials, desktop/390px checks, and exact nonproduction preview evidence.

## External Gates

AAL2, Supabase leaked-password protection, release-steward preview acceptance, migration authorization, merge, protected pilot, production, customer activation, and external distribution remain separately controlled.

## Decision

Submit exactly one attributable GitHub decision against the exact PR #40 head: **APPROVE**, **REQUEST_CHANGES**, or **COMMENT**. Approval provides review evidence only.

Machine-readable risk index: `artifacts/review/p40-current-risk-map.json`.
