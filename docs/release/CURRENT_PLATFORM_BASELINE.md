# Current Platform Baseline

**Captured before this compounding-wave source mutation:** 2026-08-11
**Evidence class:** historical starting baseline, not final candidate evidence

## Repository State

| Field | Observed value |
| --- | --- |
| Branch | `agent/investor-demo-command-room` |
| HEAD | `f7ccda035b8bf87ad5ac8ae3ffb9f4d1cd2dd757` |
| Relevant open PR | PR 37, `agent/investor-demo-readiness`, exact head `f7ccda035b8bf87ad5ac8ae3ffb9f4d1cd2dd757`; no verified follow-on PR for this branch |
| Working tree | Dirty: 12 modified and 11 untracked attributable follow-on files before this wave |
| Candidate mode | Working-tree candidate; mutable and not independently reviewed |
| Source review ready | Yes for packet preparation; no immutable promotion authority |

## Starting Fingerprints

| Evidence | SHA-256 |
| --- | --- |
| Working-tree candidate | `f534d7125e1d98c37376e0f8a628a5f36f54fe58db744bcebe0d77f9ec7c0e06` |
| Source | `aed71b27905029d76508e967deb653dd5e90ffb0d76381d1dea935c3a46497ba` |
| Tracked diff | `75183a421f2eb9cd485d5d385ba3923f6a2e3b708cf4bab3541783336cff6bb3` |
| Untracked source | `0525b33f4aa98428d676b11b65e2fc35feecff6b2495239766263e36f6a4bc72` |
| Validation artifact file | `8cbbf8306381a8d235575911ca99bf7604b50e3341e5b23768d1d097dd6aebb7` |
| Review packet file | `5b6b400608ca3041e2b9d6fc3dfefaac76b2504c73ccee8d820be3bc27dcff24` |
| Assurance/gate matrix file | `b85905363ce73a9052497a2acbd96bdaf14ad8083508d185b5b64ac6253c6cd6` |
| Gate registry source | `f7624179a8cc9f12bc33247b978d4dba853eff244be8be21ea1c1eab6f9ce8fd` |
| SBOM | `7e4897205b57e807` (422 components, zero dependency delta) |

The July 30 p.32 validation, review, and gate artifacts were already labeled
`NON_CANDIDATE` and are stale for this working tree. They cannot approve this wave.

## Verified Starting Quality

- TypeScript and ESLint passed.
- The full nonsecret suite passed with 240 registered checks.
- The Next.js 16.2.12 webpack build produced 461 static pages.
- Public verification covered 624 built routes.
- Generated integrity and `git diff --check` passed.
- Secret scanning covered 1,603 files with zero findings.
- Desktop and true 390px checks had no overflow or browser-console errors.
- 66 automated p.32 gates passed; 13 external/human gates remained pending.
- Three migrations remained unapplied and only statically reviewed.

This baseline grants no PHI, clinical, migration, deployment, distribution, commercial,
partnership, certification, or customer authority. Final evidence must be regenerated from the
final exact source candidate.
