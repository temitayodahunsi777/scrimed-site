# Current Candidate Baseline

> Historical baseline only. PR 25 now provides the consolidated review path and the 2026-08-09
> policy-v4 Wix audit confirms the remediated FaithCore publication. Current fingerprints and
> exact-head checks must be read from the regenerated candidate evidence, not this starting record.

Captured at `2026-08-03T00:19:44Z` before the bounded FaithCore remediation in this phase.
This record is historical starting evidence and must not be reused as final evidence after a source
change.

## Source State

- Branch: `agent/scrimed-p31-workstreams`
- Candidate base: `cec52cecf181faf4aa9839ff66c1c6e433852222`
- Starting HEAD: `e81ed056d39487bcb50b93523f142dfd00e15810`
- Starting Git tree: `470f83d85abe03d857e07de2f724e583759eef09`
- Dirty entries: `0`
- Candidate files relative to the explicit base: `212`
- Node runtime: `v24.14.0`
- Package manager condition: npm binary unavailable; the repository's direct-Node fallback was used

The uncertain local file `scripts/scrimed-p32-consolidated-governance-gates.mjs` remained
unchanged, narrowly ignored, and excluded from the candidate. Its SHA-256 was
`9415e2f6d093941d4b576bb5818af9b57663be7872fe12b8f3361d9521b2ef2d`. Candidate execution
used `scripts/scrimed-p32-preproduction-governance-gates.mjs`.

## Starting Evidence

The strict candidate manifest and strict ten-check validator were rerun against the exact base and
starting HEAD. Results: `10/10` passed, `0` failed, one retained warning
`npm-unavailable-direct-node-fallback`, and release promotion remained false.

| Evidence | Fingerprint |
| --- | --- |
| Candidate | `f345f452d2bda2d627acac78c91edae267d796b92fdd3b455f26245e3f96ec66` |
| Source | `00f764e23939cd49df87fe015c3c3732dfc585279a6fe8758156de2a211c763a` |
| Validation | `40d7ca7d126270673532efcbc1d3a915879faa0e10c0aee0bbd3d86930ca521d` |
| Review packet | `0e2ec079bec5383ecd235d7bd1b3aee13e505faf3d0a583d036a23831402981e` |
| Assurance manifest | `f27fddaaa3154322478d59d6ae784b675b0ff1dda25c80498fb8b3bd1aecf9a0` |
| Control attestations | `fd2ba61f72974c038539acd325eed58372c954224ed50885a4fc818ce8303b9e` |
| Gate registry | `4d9c60d3caf248b5af37f767095ca9c7f7e21b887a015e0ae6ac1df5905ee0a5` |
| SBOM | `350fcb5c3ef6ed19aa22a0b09f1ca239cf00184b1b5dbe0cffc9529a3cbadeb6` |
| Migration report | `a041a0eef6553cdf0b163f6ebeb22e3b7422c858dd5922a7e15b05044aa19d04` |
| Public claims | `e6fc169cc727579a45e6f3fe9deae7a1c2371c91a8929cdc30157da92bf403a3` |

## Gate Baseline

- Safe enforced boundaries: synthetic-only, no PHI, and no clinical execution.
- Automated assurance: complete for the starting candidate.
- Wix FaithCore publication: operator action required; the safe draft was saved but not published.
- Supabase leaked-password protection: warning still present and now classified
  `DEFERRED_PLATFORM_CONTROL`; passwordless synthetic access requires current compensating controls,
  and password auth without verified protection is denied.
- Disposable migration execution: operator action required; static analysis passed but no
  disposable PostgreSQL runtime had executed the three migrations.
- Legal adoption: targeted qualified review required only at binding adoption.
- Production migration, deployment, and customer go-live: separately authorized and not granted.

## External And Platform State

- Wix site `Scrimed Solutions` was connected and published, while the approved FaithCore copy
  remained draft-only and live verification remained open.
- Supabase project `scrimed-protected-pilot` was `ACTIVE_HEALTHY`. Security Advisor reported
  `auth_leaked_password_protection` as `WARN`; no Auth setting was mutated.
- All three migration files and checksums matched
  `config/pending-migration-authorization.json`; no migration was applied.
- Claude Opus 5 remained disabled with status `awaiting_verified_model_id`.
- CI definitions present: core CI, CodeQL, dependency review, dependency security, isolated
  migration dry run, preview validation, and protected QA workflows.

Final evidence for this phase must be regenerated after the final source mutation and local
commit. This baseline grants no production, clinical, PHI, migration, legal, or customer authority.
