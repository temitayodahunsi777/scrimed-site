# PR #40 Exact-Head Review Brief

Target review time: **10 minutes**

## Exact Binding

Open `artifacts/release/scrimed-p34-release-manifest.json` and verify PR 40, commit, tree, candidate, source, validation, review packet, gate packet, SBOM, route/render inventories, and preview deployment. Stop if the PR head differs.

## Review Order

1. `app/lib/commercial/pilotManifest.ts`
2. `app/lib/commercial/pilotOperatingSystem.ts`
3. `app/lib/scrimed-p34/exactHeadReviewState.ts`
4. `app/lib/scrimed-p34/reviewReadiness.ts`
5. `app/lib/release/previewAcceptance.ts`
6. `app/lib/release/supabasePasswordlessAssurance.ts`
7. `scripts/generate-p34-build-inventory.mjs`
8. `scripts/scrimed-p34-certify.mjs`

## Required Safety Checks

Confirm strict synthetic/no-PHI boundaries, tenant isolation, atomic approvals, kill switch, Oversight Sentinel, evidence-ledger integrity, independent route baseline, and truthful AAL2, Supabase, migration, commercial-authority, protected-pilot, and production states.

Only a named, external, exact-head review receipt may produce `APPROVED_EXACT_HEAD`. Review approval grants no merge, migration, production, PHI, clinical, payer, EHR/device, customer, contract, certification, compliance, or distribution authority.
