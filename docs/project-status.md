# SCRIMED Project Status

Updated: 2026-05-28

## Current Baseline

The active `scrimed-site` baseline is the merged Next.js scaffold from PR #10. This replaced the prior failed deployment attempts with a minimal Vercel-compatible application shell.

Current baseline includes:

- Next.js App Router project structure
- Root page at `/`
- Health endpoint at `/api/health`
- Vercel deployment configuration
- Runtime scripts for development, build, and start

## Deployment Status

The latest merged baseline deployment reported Ready on Vercel after PR #10. Earlier PRs #1 through #9 represented exploratory or superseded approaches and have been closed so the repository history has a single active deployment baseline.

## Product Direction

SCRIMED remains focused on becoming an AI healthcare intelligence platform with these primary tracks:

- Clinical Copilot for clinician decision support
- DocuTwin for medical documentation workflows
- CarePath AI for patient intake, triage, and navigation
- TrialCore for clinical trial discovery and matching
- Watchtower / TrustWatch for AI reliability, drift detection, and safety monitoring

## Recommended Next Steps

1. Build the homepage into a credible SCRIMED web presence using the existing platform narrative from `README.md`, `docs/architecture.md`, and `docs/roadmap.md`.
2. Reintroduce SCRIMED OS Hub features intentionally inside the Next.js app rather than through the earlier FastAPI or one-off scaffold branches.
3. Add stable status/readiness/event API routes only after the route contract is defined.
4. Add local build verification and a lightweight CI check so future deployment fixes are tested before merge.
5. Decide whether `scrimed-site` is the public marketing site, the product console, or both; split responsibilities if needed.

## Notes

The repository should treat PR #10 as the current deployment foundation. Future work should branch from `main` and avoid reviving the stale PR branches unless a specific implementation detail is being intentionally reused.
