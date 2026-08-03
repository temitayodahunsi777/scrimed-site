# Worktree Attribution Report

## Current Posture

The bounded phase began from a clean `e81ed056d39487bcb50b93523f142dfd00e15810` worktree.
`npm run evidence:scrimed-p32-worktree` is the machine-readable source for every path, file mode,
size, SHA-256 digest, and attribution. Its generated final manifest is intentionally non-candidate
evidence.

The previous attribution collection identified one preserved pre-existing local file:
`scripts/scrimed-p32-consolidated-governance-gates.mjs`. It has no Git history and cannot be
truthfully attributed from filesystem timestamps. The original is unchanged and narrowly ignored;
all candidate references now use a newly attributable equivalent. Re-run the collector after the
final mutation for authoritative counts and fingerprint.

## Bounded Phase Entries

All 22 current changed/untracked paths are attributable to this bounded remediation:

| Classification | Paths |
| --- | --- |
| `THIS_RUN_CHANGE` — FaithCore policy and public surface | `app/lib/faithCorePolicy.ts`, `app/faithcore/page.tsx`, `app/lib/legalPolicies.ts`, `app/lib/operatingMode.ts` |
| `THIS_RUN_CHANGE` — public/Wix policy | `config/public-claims-policy.json`, `config/wix-publication-policy.json`, `scripts/lib/wix-publication-policy.mjs`, `scripts/wix-publication-verification.mjs`, `scripts/verify-public-release.mjs` |
| `THIS_RUN_CHANGE` — tests/contracts | `scripts/faithcore-neutrality-policy-test.mjs`, `scripts/scrimed-nonsecret-test-suite.mjs`, `scripts/public-remediation-contract-check.mjs`, `scripts/preproduction-assurance-contract-check.mjs`, `package.json` |
| `THIS_RUN_CHANGE` — Wix/Supabase operator evidence | `docs/WIX_PUBLICATION_VERIFICATION_REPORT.md`, `docs/operators/WIX_FAITHCORE_FINAL_ACTION.md`, `docs/operators/WIX_FULL_SITE_EXECUTION_PACKET.md`, `docs/operators/WIX_FINAL_EXECUTION_PACKET.md`, `docs/operators/SUPABASE_LEAKED_PASSWORD_PROTECTION.md` |
| `THIS_RUN_CHANGE` — release evidence | `docs/release/CURRENT_CANDIDATE_BASELINE.md`, `docs/release/WORKTREE_ATTRIBUTION_REPORT.md`, `docs/release/PROPOSED_COMMIT_MANIFEST.md` |

There are no candidate-path caches, logs, local environments, build outputs, screenshots,
secrets, or machine-specific files. The ignored uncertain script remains preserved outside this
set. Generated assurance outputs are ignored evidence and are regenerated from source.

## Classification Rules

- `THIS_RUN_CHANGE`: attributable remediation, tests, operator packets, or governance evidence.
- `GENERATED_EVIDENCE`: deliberate P.32 machine output; reviewable but not source authority.
- `PREEXISTING_USER_CHANGE`: preserve and do not silently include in an attributable commit.
- caches, logs, OS/editor metadata, local environments, screenshots, and generated builds are
  ignored and are not release source.
- uncertain ownership is never discarded or auto-staged.

## Commit Decision

The dependency on the uncertain file is resolved without deleting it. A clean candidate commit may
be created only after final validation and review confirms all remaining entries are attributable.
The safe sequence is:

1. Run `npm run evidence:scrimed-p32-worktree` and inspect every non-`THIS_RUN_CHANGE` entry.
2. Confirm the preserved script remains ignored and no executable reference points to it.
3. Confirm no secret-sensitive, machine-specific, cache, build, or log path is included.
4. Run the full candidate suite and `git diff --check`.
5. Create a normal non-amended commit containing only reviewed, attributable files.
6. Regenerate candidate, review, gate, migration, SBOM, and validation evidence from that commit.
7. Obtain named review against those exact fingerprints.

No reset, stash, discard, push, merge, deployment, production migration, or customer activation is
authorized by this report. A local attributable commit is permitted only after the stated checks.
