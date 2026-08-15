# High-Severity Dependency Triage

## Decision

`GHSA-2v37-7h3g-55p8` / `CVE-2026-67213` is remediated in the candidate
lockfile by pinning `nanoid` to `3.3.18`. No security exception is being used.
Closure still requires a fresh exact-lockfile install, `npm audit`, build, and
isolated preview verification for the final commit.

## Advisory

| Field | Finding |
| --- | --- |
| Package | `nanoid` |
| Installed baseline | `3.3.17` |
| Vulnerable ranges | `<3.3.18` and `>=4.0.0 <5.1.6` |
| Patched 3.x version | `3.3.18` |
| Severity | High |
| Weakness | CWE-835, loop with unreachable exit condition |
| Dependency class | Transitive production dependency of `postcss@8.5.25` |
| License | MIT |
| Primary reference | [GitHub advisory GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) |

The vulnerable `customAlphabet` and `customRandom` paths can loop indefinitely
when invoked with an attacker-controlled size of zero, causing denial of service.

## SCRIMED Exposure Assessment

- Repository source contains no import or invocation of `nanoid`,
  `customAlphabet`, or `customRandom`.
- `postcss` imports `nanoid/non-secure` and calls `nanoid(6)` for generated CSS
  input identifiers. That fixed positive size does not satisfy the documented
  exploit precondition.
- The affected custom-generator surface is therefore not known to be reachable
  from a SCRIMED request, route, tool, clinical workflow, or user-controlled
  parameter.
- Exposure was low, but the vulnerable package remained in the production
  lockfile and Vercel correctly reported it. Reachability is not being used as a
  reason to retain a known high-severity dependency.

## Remediation

1. Added an exact `overrides.nanoid` pin for `3.3.18`.
2. Updated the lockfile URL and SHA-512 integrity to the npm-published artifact.
3. Raised the deterministic SCRIMED dependency floor from `3.3.17` to `3.3.18`.
4. Made dependency CI fail when `npm audit --audit-level=high` reports an
   applicable high or critical advisory.
5. Added the same high-severity audit and deterministic floor to Node 24
   certification.
6. Enhanced SBOM generation to report transitive lockfile component changes.

The downloaded `3.3.18` tarball matched the lockfile integrity:

```text
sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==
```

An npm registry bulk-advisory query against the remediated lockfile returned no
advisories. The authoritative closure evidence is the fresh CI/Vercel
`npm audit` result for the exact candidate, not this local network query alone.

## Regression Risk

Risk is low. The change stays within the transitive dependency's accepted
`^3.3.16` range, preserves the package API and license, and does not alter direct
SCRIMED dependencies. No model, clinical, PHI, payer, EHR, medical-device, or
production authority changes are included.

## Closure Criteria

- Exact-lockfile install succeeds on Node 24.
- `npm audit --audit-level=high` exits zero.
- Dependency floor, SBOM, secret scan, typecheck, lint, nonsecret suite, p.33
  regression, generated integrity, and build pass.
- A new isolated Vercel preview is `READY`, has no production alias, and reports
  no dependency/runtime error after exercise.
- Exact-head reviewer approval remains required after all source and evidence
  fingerprints are regenerated.
