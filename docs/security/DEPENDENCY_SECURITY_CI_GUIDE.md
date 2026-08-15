# Dependency Security CI

`.github/workflows/dependency-security.yml` supplies the fresh networked advisory check unavailable
in the local sandbox. It installs the exact lockfile, captures machine-readable `npm audit`
evidence, fails on applicable high or critical findings, runs SCRIMED dependency floors and SBOM checks,
fingerprints the report/lockfile, and uses GitHub dependency review for pull-request deltas.

The default policy blocks high and critical findings. A finding may be treated as an accepted
exception only through a separately reviewed, candidate-bound record documenting applicability,
exploitability, compensating controls, owner, remediation date, and expiry. The workflow has no
silent bypass. Artifacts are retained for 30 days and contain no credentials.

A green local deterministic floor is not a fresh advisory clearance. Return the CI artifact and
workflow URL to the exact candidate evidence packet before upgrading this gate.
