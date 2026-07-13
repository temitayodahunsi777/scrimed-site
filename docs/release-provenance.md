# SCRIMED Release Provenance

SCRIMED production promotion must be bound to one clean, immutable, reviewed Git revision. A successful build or a Vercel `READY` state is not sufficient when the uploaded source came from a dirty source tree.

## Controls

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

1. Partition and review the intended change set.
2. Run `npm run quality:direct-node`.
3. Commit only the intended files through the approved review path.
4. Run `npm run release:provenance:strict` on the clean reviewed revision.
5. Record the full `git rev-parse HEAD` value as `SCRIMED_APPROVED_RELEASE_SHA` in the production environment.
6. Set `SCRIMED_RELEASE_PROVENANCE_ENFORCED=true` in production.
7. Allow the source-controlled Vercel deployment.
8. Run public and deployment-drift smoke against the custom domain.
9. Revoke or replace the approved SHA before the next release.

## Failure Behavior

Missing required Git evidence, a dirty source tree, missing Vercel source attestation, SHA mismatch, a non-main production source, or a missing production attestation fails closed. The preflight does not print secrets or changed filenames.

## Boundary

This control verifies source identity. It does not deploy, commit, push, apply migrations, authorize PHI, approve clinical use, certify compliance, or approve customer go-live.
