# External Dependency Advisory Runbook

Deterministic lockfile-floor and CycloneDX SBOM checks can run offline. They do not prove that a
fresh advisory feed is clear.

From a network-enabled reviewed runner:

```bash
npm ci --ignore-scripts
npm audit --audit-level=moderate --json > npm-audit.json
npm run security:dependency-floor
npm run security:sbom
npm run security:secret-scan
```

Where GitHub is authorized, require Dependency Review on the candidate PR and inspect Dependabot
and CodeQL results. An approved OSV scan may be added by the security owner, using the lockfile
as input and retaining tool/version/feed timestamp.

Evidence must record exact commit and lockfile SHA-256, command, tool version, feed timestamp,
exit code, finding IDs/severity/affected versions, remediation or time-limited exception owner,
and output digest. Never attach credentials, environment files, private package tokens, or source
containing PHI. Any unresolved high/critical runtime issue remains a security-review blocker.

The current sandbox DNS limitation means no fresh advisory clearance is claimed.
