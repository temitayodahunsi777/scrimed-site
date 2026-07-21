# SCRIMED Release Provenance

SCRIMED production promotion must be bound to one clean, immutable, reviewed Git revision. A successful build or a Vercel `READY` state is not sufficient when the uploaded source came from a dirty source tree.

## Controls

- `npm run release:candidate-manifest` creates deterministic SHA-256 fingerprints for the complete candidate, application source lane, and non-source deliverable lane without printing filenames, file contents, or raw diffs. It reports category counts, correlated risk signals, non-source deliverables, and required reviewer roles.
- `npm run release:candidate-manifest:strict` remains blocked until the reviewed source is represented by a clean immutable revision. A candidate digest is not a commit, approval, or deployment authorization.
- `npm run release:provenance` reports local provenance without blocking development.
- `npm run release:provenance:strict` fails when modified or untracked files exist, Git metadata is unavailable, or CI's SHA differs from `HEAD`.
- CI runs strict provenance before quality and build gates.
- Vercel preview builds use Vercel's immutable commit SHA and branch reference because deployment sandboxes intentionally omit `.git` metadata.
- Missing or malformed Vercel commit provenance fails the preview build closed; provider attestation never substitutes for local strict or GitHub Actions checks.
- Vercel production builds require `SCRIMED_RELEASE_PROVENANCE_ENFORCED=true`.
- `SCRIMED_APPROVED_RELEASE_SHA` must be the exact full SHA approved by the release steward.
- Vercel's commit SHA must match the approved SHA and target `main`.

The production environment values are non-secret release controls, but only a named release steward may set or rotate the approved SHA.

## Release Sequence

1. Run `npm run release:candidate-manifest` and inspect category counts, risk signals, and required reviewers.
2. Exclude non-source deliverables from the application source release and route them through the artifact review lane.
3. Partition and review the intended source change set.
4. Run `npm run quality:direct-node`.
5. Commit only the intended files through the approved review path.
6. Run `npm run release:candidate-manifest:strict` and `npm run release:provenance:strict` on the clean reviewed revision.
7. Record the full `git rev-parse HEAD` value as `SCRIMED_APPROVED_RELEASE_SHA` in the production environment.
8. Set `SCRIMED_RELEASE_PROVENANCE_ENFORCED=true` in production.
9. Allow the source-controlled Vercel deployment.
10. Run public and deployment-drift smoke against the custom domain.
11. Revoke or replace the approved SHA before the next release.

## Failure Behavior

Missing required Git evidence, a dirty source tree, missing Vercel source attestation, SHA mismatch, a non-main production source, or a missing production attestation fails closed. The candidate manifest and provenance preflight do not print secrets, changed filenames, file contents, or raw diffs.

## Boundary

This control verifies source identity. It does not deploy, commit, push, apply migrations, authorize PHI, approve clinical use, certify compliance, or approve customer go-live.
