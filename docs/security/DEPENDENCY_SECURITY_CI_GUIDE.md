# Dependency Security CI

`.github/workflows/dependency-security.yml` supplies the fresh networked advisory check unavailable
in the local sandbox. It installs the exact lockfile, captures machine-readable `npm audit`
evidence, fails on applicable critical findings, runs SCRIMED dependency floors and SBOM checks,
fingerprints the report/lockfile, and uses GitHub dependency review for pull-request deltas.

High findings remain `report-and-review` until the security owner documents applicability,
exploitability, compensating controls, remediation date, and expiry. No exception may suppress a
critical result silently. Artifacts are retained for 30 days and contain no credentials.

A green local deterministic floor is not a fresh advisory clearance. Return the CI artifact and
workflow URL to the exact candidate evidence packet before upgrading this gate.
