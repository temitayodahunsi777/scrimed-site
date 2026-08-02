# Worktree Attribution Report

## Current Posture

The repository began and remains dirty. `npm run evidence:scrimed-p32-worktree` is the
machine-readable source for every path, file mode, size, SHA-256 digest, and attribution. Its
generated final manifest is intentionally non-candidate evidence.

The previous attribution collection identified one preserved pre-existing user change:
`scripts/scrimed-p32-consolidated-governance-gates.mjs`. It has no Git history and cannot be
truthfully attributed from filesystem timestamps. The original is unchanged and narrowly ignored;
all candidate references now use a newly attributable equivalent. Re-run the collector after the
final mutation for authoritative counts and fingerprint.

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
5. Create one normal non-amended commit containing only reviewed, attributable files.
6. Regenerate candidate, review, gate, migration, SBOM, and validation evidence from that commit.
7. Obtain named review against those exact fingerprints.

No reset, stash, discard, push, merge, deployment, production migration, or customer activation is
authorized by this report. A local attributable commit is permitted only after the stated checks.
