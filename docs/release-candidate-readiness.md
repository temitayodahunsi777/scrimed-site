# SCRIMED Release Candidate Readiness

SCRIMED Release Candidate Readiness packages recorded validation controls into a metadata-only release workflow before any production deploy, database migration, clinical activation, or customer go-live action. The API is a command and boundary catalog, not a runtime attestation of the current working tree.

## Purpose

- Record local validation evidence for the current SCRIMED build.
- Preserve the live production delta: the production target is reachable but may not yet include local routes.
- Keep deployment, commit, Supabase migration, PHI, clinical care, payer, EHR, certification, and customer go-live authority separate from the readiness route.
- Give operators exact commands to run after human release review.

## Current Candidate

- Candidate: `scrimed-release-candidate-working-tree-uncommitted`
- API: `/api/release-candidate-readiness`
- Brief: `/api/release-candidate-readiness/brief`
- Status: `release-candidate-validation-passed-source-provenance-blocked`
- Release decision: `blocked-until-clean-reviewed-immutable-revision`
- Evidence freshness: `recorded-evidence-revalidation-required`
- Current candidate attested: `false`
- Validation binding: `command-catalog-not-runtime-attestation`

## Evidence Captured

- `npm run release:candidate-manifest`
- `npm run release:candidate-validate:strict`
- `npm run review:investor-deck:strict`
- `npm run release:scrimed-p32-evidence:strict`
- `npm run release:scrimed-p32-evidence:all-gates` (expected to fail closed while external or immutable-provenance gates remain unresolved)
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

The candidate manifest generates deterministic SHA-256 digests for the full candidate and application source lane, plus a non-source digest when an unignored deliverable enters the worktree. It reports category counts, risk signals, and reviewer requirements without printing filenames, file contents, or raw diffs. The exact investor-deck output is intentionally excluded from Git source by a narrow `.gitignore` rule, remains on disk, and is still opened, fingerprinted, and reviewed directly by the candidate validator and p.32 evidence runner. It is never silently bundled into the application release.

The investor artifact reviewer opens the PowerPoint with a bounded local ZIP parser, fingerprints the exact artifact, and fails closed on malformed or encrypted content, unsafe archive size, missing structure, placeholders, prohibited claims, missing release boundaries, or missing first-party attribution. It never prints slide text or artifact paths. Automated success still requires founder, counsel/claims, finance, immutable provenance, and recipient-specific human release review.

The candidate validator runs the approved nonsecret source, build, integrity, and artifact checks between two candidate-manifest snapshots. A pass reports candidate, source, artifact, and validation-evidence fingerprints only when the candidate is unchanged. It does not authorize source review, commit, deployment, migration, external distribution, PHI, clinical care, certification, or customer go-live.

The p.32 evidence runner reconciles those fingerprints with integrity-checked technical evidence and metadata-only reviewer decisions. It rejects stale or tampered records and reports remaining gates by release phase. Protected packets that explicitly describe themselves as metadata references or “not approval” cannot be promoted into approval evidence by this runner.

Local HTTP smoke remains an operator action in environments that prohibit binding a local TCP listener. Compiled build-artifact inspection is useful evidence, but it does not replace the HTTP smoke. Production smoke intentionally remains pending until a reviewed immutable revision is deployed through source control.

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

Run these before any deployment. Strict candidate and provenance checks must pass from a clean reviewed revision:

1. `npm run release:candidate-manifest`
2. `npm run release:candidate-validate:strict`
3. `npm run review:investor-deck:strict`
4. `npm run release:scrimed-p32-evidence:strict`
5. `npm run release:scrimed-p32-evidence:all-gates` to enumerate unresolved gates; a nonzero exit is required until all evidence exists.
6. `git diff --check`
7. `npm run typecheck`
8. `npm run lint`
9. `npm run test:nonsecret`
10. `npm run build`
11. `SCRIMED_BASE_URL=http://127.0.0.1:3044 npm run smoke:public`
12. Review and commit only the intended source set through the approved workflow.
13. Record founder, counsel/claims, and finance review against the exact deck fingerprint outside source control.
14. `npm run release:candidate-manifest:strict`
15. `npm run release:provenance:strict`
16. Regenerate the p.32 packet from the clean immutable revision and reject every stale prior decision.
17. Record the approved full SHA in Vercel and permit the source-controlled `main` deployment only after human release approval.
18. `SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public`

Protected AAL2 durable-store happy paths and Compute Fabric migration apply remain separate operator workflows.
