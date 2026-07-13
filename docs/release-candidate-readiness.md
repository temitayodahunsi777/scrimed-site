# SCRIMED Release Candidate Readiness

SCRIMED Release Candidate Readiness packages the current validated local build into a metadata-only release control before any production deploy, database migration, clinical activation, or customer go-live action.

## Purpose

- Record local validation evidence for the current SCRIMED build.
- Preserve the live production delta: the production target is reachable but may not yet include local routes.
- Keep deployment, commit, Supabase migration, PHI, clinical care, payer, EHR, certification, and customer go-live authority separate from the readiness route.
- Give operators exact commands to run after human release review.

## Current Candidate

- Candidate: `scrimed-release-candidate-2026-07-11-validation-passed-uncommitted`
- API: `/api/release-candidate-readiness`
- Brief: `/api/release-candidate-readiness/brief`
- Status: `release-candidate-validation-passed-source-provenance-blocked`
- Release decision: `blocked-until-clean-reviewed-immutable-revision`

## Evidence Captured

- `npm run typecheck`
- `npm run release:provenance:strict` (currently blocked until the intended release is committed and clean)
- `npm run lint`
- `npm run test:nonsecret`
- `npm run build`
- `npm run smoke:scrimed-compute-fabric`
- `npm run smoke:execution-attempt-durable-store`
- `npm run smoke:scrimed-compute-fabric:migration-preflight`
- `SCRIMED_BASE_URL=http://127.0.0.1:3044 npm run smoke:public`
- `SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public`

The production smoke evidence intentionally records the production delta rather than claiming success: production must be deployed before the local `/scrimed-intelligence-platform` route can pass on the live target.

## Safety Boundaries

This readiness layer does not:

- Commit code.
- Deploy to production.
- Apply Supabase migrations.
- Process live PHI.
- Authorize clinical care.
- Authorize payer submission.
- Write to EHRs.
- Approve production connectors.
- Certify HIPAA, SOC, FDA, security, clinical validation, or customer go-live readiness.

## Operator Sequence

Run these before any deployment. Step 8 must pass from a clean reviewed revision:

1. `git diff --check`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test:nonsecret`
5. `npm run build`
6. `SCRIMED_BASE_URL=http://127.0.0.1:3044 npm run smoke:public`
7. `npm run release:provenance:strict`
8. Record the approved full SHA in Vercel and permit the source-controlled `main` deployment only after human release approval.
9. `SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public`

Protected AAL2 durable-store happy paths and Compute Fabric migration apply remain separate operator workflows.
