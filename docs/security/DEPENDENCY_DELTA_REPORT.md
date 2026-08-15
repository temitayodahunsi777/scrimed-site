# Dependency Delta Report

## Scope

This report compares baseline commit
`a399d16209a7bc4fe349d1ee3fd4298a14df9156` with the dependency-security
remediation candidate in the working tree. Final commit and preview identifiers
are recorded in the exact-head release evidence after validation.

## Delta

| Component | Before | After | Change | Reason |
| --- | --- | --- | --- | --- |
| `nanoid` | `3.3.17` | `3.3.18` | Patched transitive upgrade | Remediate `GHSA-2v37-7h3g-55p8` / `CVE-2026-67213` |

- Direct dependencies added: 0
- Direct dependencies removed: 0
- Transitive components added: 0
- Transitive components removed: 0
- Transitive components upgraded: 1
- CycloneDX component count before: 422
- CycloneDX component count after: 422
- License change: none; MIT retained
- Parent dependency: `postcss@8.5.25`
- Resolution strategy: exact compatible override, not a major upgrade

## Integrity

| Evidence | Before | Remediated working tree |
| --- | --- | --- |
| Package-lock SHA-256 | `4d8d2cc37c97a146bd563f08021bf3e2d660f95170b2aaed61f95466e476bec7` | `98c9d0c840d22f709f5c13cd64b6a2f08ab06307875af578651ed6268a266189` |
| SBOM SHA-256 | `7e4897205b57e80797a6319ff661d34bcc6c05892196aeb5eef94c73ed98c51d` | `a78631817c206553aea70cc631e1cc5ac78bf8b44a06692a84988add00634e9f` |
| `nanoid@3.3.18` tarball SHA-256 | n/a | `b9dc81cb403ea2510314dd2d1ad8d71934f325db90c1b43805e781b87e3fb009` |

The SBOM hash changes because the locked `nanoid` component changed. The
transitive lockfile delta is emitted as review metadata outside the CycloneDX
payload so the same source tree retains the same SBOM hash before and after
commit creation.

## Determinism And Drift

- `package-lock.json` remains lockfile version 3.
- `npm ci --dry-run --offline --ignore-scripts --audit=false` accepted the
  manifest/lockfile relationship.
- Registry metadata and the downloaded tarball agree with the lockfile URL and
  SHA-512 integrity.
- The remediated bulk advisory query returned an empty advisory object.
- A fresh Vercel `npm ci` and audit remain the definitive clean-install proof.

## Safety Boundary

This dependency change grants no release, migration, production, PHI, clinical,
payer, EHR, medical-device, customer activation, or investor distribution
authority. Supabase leaked-password protection, AAL2 evidence, unapplied
migrations, exact-head review, merge authorization, and production authorization
remain separate gates.
