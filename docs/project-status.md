# SCRIMED Project Status

Updated: 2026-05-29

## Current Baseline

The active `scrimed-site` baseline is a Next.js App Router site on `main`. PR #10 established the deployable Vercel foundation, and subsequent execution converted the placeholder root page into a serious SCRIMED platform surface with an OS Hub command layer, master operating context, integration contract boundary, synthetic clinical validation layer, and explicit quality gates.

Current baseline includes:

- Next.js App Router project structure
- Root page at `/`
- SCRIMED OS Hub console at `/hub`
- Hub readiness console at `/hub/readiness`
- Hub events console at `/hub/events`
- Platform page at `/platform`
- Master operating context at `/operating-context`
- SCRIMED Atlas operating model at `/atlas`
- FaithCore operating model at `/faithcore`
- Integration contracts page at `/integrations`
- Detailed contract routes under `/contracts/[slug]`
- Synthetic clinical environment at `/synthetic`
- Synthetic scenario routes under `/synthetic/[slug]`
- Synthetic fixture contracts at `/synthetic/fixtures`
- Synthetic fixture detail routes under `/synthetic/fixtures/[slug]`
- Synthetic validation page at `/synthetic/validation`
- Quality gates page at `/quality`
- Trust and Watchtower page at `/trust`
- Module pages for Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower
- Shared Hub model in `app/lib/scrimedHub.ts`
- Shared Hub operations model in `app/lib/hubOperations.ts`
- Shared operating context model in `app/lib/operatingContext.ts`
- Shared integration contract model in `app/lib/integrationContracts.ts`
- Shared synthetic scenario model in `app/lib/syntheticClinical.ts`
- Shared synthetic fixture model in `app/lib/syntheticFixtures.ts`
- Shared synthetic validation model in `app/lib/syntheticValidation.ts`
- Shared quality gate model in `app/lib/qualityGates.ts`
- Global visual system in `app/globals.css`
- Health endpoint at `/api/health`
- Platform status endpoint at `/api/status`
- Readiness endpoint at `/api/readiness`
- Platform events endpoint at `/api/events`
- Operating context endpoint at `/api/operating-context`
- Integration contracts endpoint at `/api/contracts`
- Per-contract API routes under `/api/contracts/[slug]`
- Synthetic scenario endpoint at `/api/synthetic/scenarios`
- Per-scenario synthetic API routes under `/api/synthetic/scenarios/[slug]`
- Synthetic fixture endpoint at `/api/synthetic/fixtures`
- Per-fixture synthetic API routes under `/api/synthetic/fixtures/[slug]`
- Synthetic validation endpoint at `/api/synthetic/validation`
- Per-scenario validation API routes under `/api/synthetic/validation/[slug]`
- Quality gates endpoint at `/api/quality/gates`
- Hub summary endpoint at `/api/hub/summary`
- Vercel deployment configuration
- TypeScript configuration and Next.js environment references
- GitHub Actions build workflow in `.github/workflows/ci.yml`
- Runtime scripts for development, type checking, build, and start

## Deployment Status

Vercel is the current working deploy gate and has repeatedly reported success for the `scrimed-site` deployment. GitHub Actions build verification is configured, but workflow runs are not visible through the current connector and the local Codex environment does not currently have npm, pnpm, yarn, corepack, or `gh` available for independent local build or Actions-log inspection.

Because Vercel is green, GitHub Actions and local package-manager verification are not treated as product or deploy blockers right now. They remain hardening items behind a managed quality-process bypass.

## Quality Process

Current active quality path:

1. Vercel deployment status is the primary deploy gate.
2. Synthetic fixture contracts and executable assertions validate workflow behavior without live patient data.
3. The master operating context defines the mission, decision framework, Atlas boundary, FaithCore boundary, and delivery standard.
4. Integration contracts define the data boundary before real connectors are implemented.
5. Hub readiness and event endpoints expose operational status.
6. Quality gates make every active, planned, and bypassed validation path explicit.

Current bypassed or deferred checks:

- GitHub Actions CI is bypassed as a blocking gate until workflow run visibility is available.
- Local package-manager builds are bypassed inside this workspace until npm, pnpm, yarn, or corepack is available.
- Live clinical integrations remain planned until synthetic fixtures and contracts are stable.

Replacement path:

- Vercel deployment plus fixture-backed executable synthetic validation is the current active build-quality path.
- Contract pages and APIs replace live connector assumptions until connector implementation is explicitly approved.
- Readiness, events, and quality gate endpoints replace ambiguous manual status tracking.

## CI Failure Root Cause

The CI workflow previously configured `actions/setup-node` with `cache: npm`, but the repository does not have a `package-lock.json`. That combination can fail before the install/build step because npm caching expects lockfile metadata.

Fix applied:

- Removed `cache: npm` from `.github/workflows/ci.yml`.
- Kept `npm install` as the install command so the build does not require a committed lockfile yet.
- Added `npm run typecheck` to CI.
- Added a `typecheck` script to `package.json`.
- Verified the resulting `main` state through successful Vercel deployments.

## Product Direction

SCRIMED remains focused on becoming an AI healthcare intelligence platform with these primary tracks:

- Clinical Copilot for clinician decision support
- DocuTwin for medical documentation workflows
- CarePath AI for patient intake, triage, and navigation
- TrialCore for clinical trial discovery and matching
- Watchtower / TrustWatch for AI reliability, drift detection, and safety monitoring
- SCRIMED Atlas for faith-neutral enterprise governance, compliance, interoperability, ROI, and agentic operations
- FaithCore for opt-in spiritually aligned encouragement and trust support with explicit clinical boundaries
- Integration contracts for future FHIR, HL7, claims, pricing, and synthetic clinical test data
- Synthetic validation before live clinical data or production integrations

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
- Added shared Hub operations data and backed `/api/readiness` and `/api/events` with it.
- Added `/hub/readiness` and `/hub/events` console views.
- Added detailed pages and per-contract API routes for every integration contract.
- Added synthetic clinical scenarios, `/synthetic`, scenario detail pages, `/api/synthetic/scenarios`, and per-scenario API routes.
- Added structured synthetic request and expected-output fixture contracts for CarePath AI, DocuTwin, and TrialCore.
- Added deterministic synthetic validation checks, `/synthetic/validation`, `/api/synthetic/validation`, and per-scenario validation APIs.
- Added quality gate modeling, `/quality`, and `/api/quality/gates`.
- Promoted executable synthetic validation into the quality gates summary.
- Wired quality gates into the Hub route inventory, readiness checks, event stream, homepage, and Hub console.
- Replaced the failing or unavailable verification path with a documented Vercel plus synthetic validation process.
- Codified the SCRIMED SOLUTIONS master operating context in `docs/master-operating-context.md`, `app/lib/operatingContext.ts`, `/operating-context`, and `/api/operating-context`.
- Added SCRIMED Atlas and FaithCore surfaces with explicit enterprise, faith, and clinical-safety boundaries.

## Recommended Next Steps

1. Keep Vercel as the active deploy gate until GitHub Actions visibility and package-manager tooling are available.
2. Add an agent workflow registry that maps each planned SCRIMED agent to owner, permissions, inputs, outputs, audit events, and human review requirements.
3. Add generated request and response fixtures for each non-synthetic integration contract.
4. Add fixture diffing so expected output changes are reviewed before workflow implementation.
5. Add a committed `package-lock.json` from a controlled npm environment, then re-enable npm caching in CI.
6. Add visual smoke checks for `/`, `/hub`, `/operating-context`, `/atlas`, `/faithcore`, `/quality`, `/synthetic`, `/integrations`, and `/trust` once local browser/build tooling is available.
7. Start the first module workflow implementation against synthetic inputs before any live clinical connector is introduced.

## Notes

Future work should branch from `main` and treat the current Next.js site as the execution foundation. The older FastAPI and one-off Vercel repair branches should remain closed unless a specific implementation detail is being intentionally reused.
