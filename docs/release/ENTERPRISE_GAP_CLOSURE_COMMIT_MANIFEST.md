# Enterprise Gap-Closure Commit Manifest

**Base commit:** `40044774f1d35aa15eaf6ff7c8c7f6b08b0d639d`

All paths below are attributable to the p.33 enterprise gap-closure wave. The list excludes
`.next`, caches, local environment files, credentials, logs, screenshots, and machine-specific
artifacts. Generated JSON files are included only when a repository generator and drift check
exist.

## Release, Reliability, and Observability

- `.github/workflows/preview-validation.yml`
- `next.config.js`
- `app/api/build-info/route.ts`
- `app/icon.svg`
- `app/api/health/route.ts`
- `app/api/readiness/route.ts`
- `app/lib/operatingMode.ts`
- `app/lib/observability/errorTaxonomy.ts`
- `app/lib/observability/logger.ts`
- `app/lib/observability/performanceTelemetry.ts`
- `app/lib/observability/requestContext.ts`
- `app/lib/release/vercelReleaseAssurance.ts`
- `app/lib/reliability/errorBudget.ts`
- `scripts/verify-preview-ui.mjs`
- `scripts/verify-vercel-preview.mjs`

## Supabase, Migrations, and AAL2

- `.github/workflows/aal2-assurance.yml`
- `.github/workflows/migration-dry-run.yml`
- `scripts/aal2-token-policy-selftest.mjs`
- `scripts/verify-aal2-evidence.mjs`
- `scripts/verify-migration-dry-run.mjs`
- `scripts/verify-supabase-security.mjs`
- `tests/security/supabase-rls-contract.test.mjs`

## Claims, Proof, Trust, Agents, Models, and Value

- `app/lib/evidence/publicSurfaceClaimRegistry.ts`
- `app/lib/proofPacketShareReadiness.ts`
- `app/lib/scrimed-control-plane/outcomeIntelligence.ts`
- `app/lib/scrimed-control-plane/platformGraph.ts`
- `app/lib/scrimed-control-plane/strategicDecisionIntelligence.ts`
- `app/lib/scrimed-control-plane/trustReadiness.ts`
- `app/lib/scrimed-work/agentExecution.ts`
- `app/lib/scrimed-work/modelQualification.ts`
- `app/lib/scrimedProofPacketStudio.ts`
- `artifacts/investor/investor-readiness.json`
- `artifacts/platform/scrimed-platform-graph.json`

## Design System

- `app/globals.css`
- `app/lib/design-system/components.ts`
- `app/lib/design-system/elevation.ts`
- `app/lib/design-system/motion.ts`
- `app/lib/design-system/radii.ts`
- `app/lib/design-system/spacing.ts`
- `app/lib/design-system/tokens.ts`
- `app/lib/design-system/typography.ts`
- `artifacts/design/code-connect-manifest.json`
- `artifacts/design/design-tokens.json`
- `scripts/design-system-artifacts.mjs`

## Investor Demo and Diligence

- `app/api/investor-demo-command-room/route.ts`
- `app/investor-demo-command-room/InvestorDemoCommandRoom.tsx`
- `app/lib/investorDemoRunOfShow.ts`
- `docs/investor-audience-readiness.md`
- `docs/investor-demo-command-room.md`
- `docs/investor/DATA_ROOM_INDEX.md`
- `scripts/investor-demo-command-room-policy-test.mjs`
- `scripts/investor-demo-run-of-show-contract-check.mjs`
- `scripts/investor-demo-run-of-show-policy-test.mjs`
- `scripts/rehearse-investor-demo.mjs`

## Documentation, Contracts, and Registry

- `docs/architecture/SCRIMED_ENTERPRISE_GAP_CLOSURE.md`
- `docs/design/FIGMA_SYNC_SPEC.md`
- `docs/operators/SEARCH_INDEX_RECONCILIATION.md`
- `docs/operators/SUPABASE_LEAKED_PASSWORD_PROTECTION.md`
- `docs/operators/VERCEL_PREVIEW_RELEASE_ASSURANCE.md`
- `docs/release/CANDIDATE_BRANCH_DECISION.md`
- `docs/release/CURRENT_EXTERNAL_AND_REPOSITORY_BASELINE.md`
- `docs/release/ENTERPRISE_GAP_CLOSURE_COMMIT_MANIFEST.md`
- `docs/release/ENTERPRISE_GAP_CLOSURE_IMPLEMENTATION_REPORT.md`
- `docs/release/PENDING_MIGRATION_DRY_RUN_REVIEW.md`
- `docs/release/PREVIEW_DEPLOYMENT_OPERATOR_PACKET.md`
- `package.json`
- `scripts/scrimed-enterprise-gap-closure-contract-check.mjs`
- `scripts/scrimed-enterprise-gap-closure-policy-test.mjs`
- `scripts/scrimed-nonsecret-test-suite.mjs`
- `scripts/scrimed-cyber-defense-contract-check.mjs`

## Review Boundary

The change set contains 70 attributable source, generated-evidence, workflow, test, and
documentation paths. It does not include a Supabase setting change, migration application,
Vercel deployment or promotion, Figma canvas mutation, live AAL2 evidence, external distribution,
PHI, customer activation, clinical authority, or production authorization.
