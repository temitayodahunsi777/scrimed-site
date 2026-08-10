# Production Delta Report

**Observed:** 2026-08-09T01:24:44Z
**Status:** REVIEW REQUIRED; production promotion not authorized

## Source And Deployment Delta

- Vercel production is `READY` at `main` commit
  `5e77beea57f458883f7544421b2014fd4e28ac67`.
- Ready previews exist for PR #22 at `450d9022356f1f19e3c1b1855f3a55f8634302bb`
  and PR #23 at `37d749c103ca1588be62740148b3dd294a35f7d2`.
- The local consolidated committed base is
  `9d2cfceef81b0b13010ef28b55c040d459bc625a`, plus attributable uncommitted work.
- The current local capability surface therefore exceeds production and both predecessor previews.

## Data Plane Delta

- Supabase project `scrimed-protected-pilot` is `ACTIVE_HEALTHY` in `us-east-1`.
- Remote migration history includes SCRIMED Work durability, reviewer queue, approval binding,
  completion queue, and completion evidence through `scrimed_work_completion_evidence`.
- Three local migrations remain unapplied: clinical assurance control plane, p.32 evidence
  attestation issuance, and p.32 candidate review control plane.
- Leaked-password protection remains disabled. The connected toolset exposes no scoped Auth
  setting mutation, so an Auth administrator must close and verify that control.

## Public Site Delta

The 2026-08-09 direct-origin Wix audit passed policy v4 across all configured pages, retired and
noindexed routes, redirects, and crawler files with zero claim failures. A same-day browser check
confirmed the published FaithCore copy and conservative schema. A later network-restricted shell
refresh observed zero pages and failed closed; it does not supersede the direct-origin evidence.

## Promotion Preconditions

1. Clean exact candidate and source manifest.
2. Full validation, secret scan, SBOM, and deterministic artifact integrity.
3. One consolidated PR and named reviewer dispositions bound to its exact head.
4. Preserve the passed Wix claims evidence and capture a true mobile-device presentation check.
5. Supabase leaked-password protection evidence.
6. Authorized disposable dry-run and review for the three pending migrations.
7. Exact-candidate preview with public, protected, fail-closed, and rollback smoke evidence.
8. Separate production deployment authorization.

This report authorizes no deployment, migration, PHI, live clinical execution, payer action, EHR
writeback, certification claim, customer activation, merge, or push.
