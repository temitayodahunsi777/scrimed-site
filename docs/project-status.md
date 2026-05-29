# SCRIMED Project Status

Updated: 2026-05-28

## Current Baseline

The active `scrimed-site` baseline is now a Next.js App Router site on `main`. PR #10 established the deployable Vercel foundation, and subsequent execution converted the placeholder root page into a serious SCRIMED platform surface with an initial OS Hub command layer and integration contract boundary.

Current baseline includes:

- Next.js App Router project structure
- Root page at `/`
- SCRIMED OS Hub console at `/hub`
- Platform page at `/platform`
- Integration contracts page at `/integrations`
- Trust and Watchtower page at `/trust`
- Module pages for Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower
- Shared Hub model in `app/lib/scrimedHub.ts`
- Shared integration contract model in `app/lib/integrationContracts.ts`
- Global visual system in `app/globals.css`
- Health endpoint at `/api/health`
- Platform status endpoint at `/api/status`
- Readiness endpoint at `/api/readiness`
- Platform events endpoint at `/api/events`
- Integration contracts endpoint at `/api/contracts`
- Hub summary endpoint at `/api/hub/summary`
- Vercel deployment configuration
- TypeScript configuration and Next.js environment references
- GitHub Actions build workflow in `.github/workflows/ci.yml`
- Runtime scripts for development, type checking, build, and start

## Deployment Status

The latest `main` commit was picked up by Vercel and reported success for the `scrimed-site` deployment on 2026-05-28.

Earlier PRs #1 through #9 represented exploratory or superseded approaches and have been closed so the repository history has a single active deployment baseline.

GitHub Actions build verification is configured, but workflow runs are not visible through the current connector. The local environment also does not have `gh`, so Actions logs could not be inspected from this session.

## CI Failure Root Cause

The CI workflow previously configured `actions/setup-node` with `cache: npm`, but the repository does not have a `package-lock.json`. That combination can fail before the install/build step because npm caching expects lockfile metadata.

Fix applied:

- Removed `cache: npm` from `.github/workflows/ci.yml`.
- Kept `npm install` as the install command so the build does not require a committed lockfile yet.
- Added `npm run typecheck` to CI.
- Added a `typecheck` script to `package.json`.
- Verified the resulting `main` state with a successful Vercel deployment.

## Product Direction

SCRIMED remains focused on becoming an AI healthcare intelligence platform with these primary tracks:

- Clinical Copilot for clinician decision support
- DocuTwin for medical documentation workflows
- CarePath AI for patient intake, triage, and navigation
- TrialCore for clinical trial discovery and matching
- Watchtower / TrustWatch for AI reliability, drift detection, and safety monitoring
- Integration contracts for future FHIR, HL7, claims, pricing, and synthetic clinical test data

## Completed Execution

- Closed stale PRs #1 through #9 as superseded by PR #10.
- Added `docs/project-status.md` to preserve the operating baseline and next-step plan.
- Rebuilt the homepage from a placeholder into a platform-oriented SCRIMED web presence.
- Added `/api/status` for module readiness metadata.
- Added `tsconfig.json`, `next-env.d.ts`, and global styling to strengthen the Next.js foundation.
- Added GitHub Actions CI for dependency installation, type checking, and Next.js build verification.
- Confirmed Vercel deployment success for the strengthened `main` state.
- Added `/platform` and `/trust` as first product detail surfaces.
- Added `/api/readiness` and `/api/events` as stable foundation-level operational endpoints.
- Added dedicated pages for Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower.
- Linked module pages from `/platform` and exposed module routes from `/api/status`.
- Added the SCRIMED OS Hub data model, `/hub` console, and `/api/hub/summary` endpoint.
- Wired homepage, status, and readiness surfaces to the Hub layer.
- Added integration contracts for FHIR, HL7, claims/utilization, pricing transparency, and synthetic clinical testing.
- Added `/integrations` and `/api/contracts`, then wired contracts into Hub, readiness, and homepage surfaces.
- Fixed the likely CI workflow failure caused by npm caching without a lockfile.

## Recommended Next Steps

1. Confirm GitHub Actions is enabled in repository settings and inspect the next CI run from the GitHub UI.
2. Add a committed `package-lock.json` once npm is available locally or via a controlled CI-generated update.
3. Re-enable npm caching after the lockfile exists.
4. Add detailed contract pages for each future integration type.
5. Add `/hub/readiness` and `/hub/events` console views using the existing readiness and event APIs.

## Notes

Future work should branch from `main` and treat the current Next.js site as the execution foundation. The older FastAPI and one-off Vercel repair branches should remain closed unless a specific implementation detail is being intentionally reused.
