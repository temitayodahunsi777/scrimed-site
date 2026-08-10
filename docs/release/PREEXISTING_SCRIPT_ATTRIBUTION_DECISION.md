# Pre-existing Governance Script Attribution Decision

**File:** `scripts/scrimed-p32-consolidated-governance-gates.mjs`
**SHA-256:** `9415e2f6d093941d4b576bb5818af9b57663be7872fe12b8f3361d9521b2ef2d`
**Classification:** uncertain, preserved pre-existing user work

Evidence: the file is untracked, has no Git history, appeared in the initial worktree attribution,
and has filesystem birth/modified time `2026-07-29T21:54:16-0400`. Filesystem metadata and code
similarity cannot establish authorship, so this execution does not claim it.

Resolution: the original remains byte-for-byte untouched. Candidate execution now uses the newly
attributable `scripts/scrimed-p32-preproduction-governance-gates.mjs`; package scripts, tests,
contracts, and current evidence pointers reference that file. The preserved local path is
explicitly ignored so it cannot enter the candidate accidentally. No deletion occurred.

If the owner later wants the original tracked, they should review its exact hash and deliberately
remove the narrow ignore rule in a separate attributable change.
