# SCRIMED p.34 Adaptive Governance Commit Manifest

Baseline: `9751d74d5adb008b22d7b3133df306dd106f39da`.

Branch: `agent/scrimed-p34-adaptive-governance`.

The exact commit and candidate/source/validation/review/gate fingerprints are generated after this manifest is committed. No push, merge, deployment, migration, provider call, PHI operation, customer activation, or external distribution is authorized.

## Attributable Change Inventory

### Adaptive governance domain

- `app/lib/scrimed-p34/*`
- `app/lib/scrimed-control-plane/index.ts`
- `app/api/scrimed-control-plane/[[...path]]/route.ts`

### Operator interface and navigation

- `app/scrimed-p34/page.tsx`
- `app/lib/siteNavigation.ts`
- `app/lib/navigationAudit.ts`
- `scripts/public-production-smoke.mjs`

### Tests, artifacts, and CI

- `scripts/scrimed-p34-adaptive-governance-policy-test.mjs`
- `scripts/scrimed-p34-adaptive-governance-contract-check.mjs`
- `scripts/scrimed-p34-artifacts.mjs`
- `scripts/scrimed-nonsecret-test-suite.mjs`
- `scripts/ci-workflow-contract-check.mjs`
- `.github/workflows/node24-certification.yml`
- `artifacts/p34/*`
- `package.json`

### Governance, security, and operator documentation

- `docs/SCRIMED_P34_IMPLEMENTATION_MAP.md`
- `docs/SCRIMED_P34_ADAPTIVE_GOVERNANCE.md`
- `docs/architecture/ADR_P34_ADAPTIVE_GOVERNANCE.md`
- `docs/security/P34_THREAT_BOUNDARY_UPDATE.md`
- `docs/runbooks/P34_ADAPTIVE_GOVERNANCE_RUNBOOK.md`
- `docs/release/P34_IMPLEMENTATION_STATUS.md`
- `docs/release/P34_REVIEW_PACKET.md`
- `docs/release/P34_ADAPTIVE_GOVERNANCE_COMMIT_MANIFEST.md`
- `docs/PUBLIC_CLAIMS_REGISTER.md`
- `.env.example`
- `README.md`

## Validated Results

- Focused p.34 checks: 40/40 policy, 38/38 contract, 2/2 artifacts.
- Repository direct quality runner: 10/10 gates.
- Secret scan: 1,726 files, 0 findings.
- SBOM: 422 components, no dependency delta, exact post-commit fingerprint `63a242cf16f7f79e7e1ae5d02db81e1450e8d8678ed704cf02eaad8cfad7d68d`.
- Migration packet: static validation only, fingerprint `2cfd88108ac305f9`; no migration executed.
- Responsive browser checks: desktop and 390px mobile passed with no horizontal overflow or console errors.

## Residual Gates

- `OPERATOR_REQUIRED`: exact-candidate named review, applicable claims/legal, clinical-safety, privacy/security, imaging-privacy, platform, and AAL2 authorization.
- `BLOCKED`: PHI-capable pilot, clinical authority, external provider route, production migration, deployment, distribution, and customer activation.
- External security warning retained: Supabase leaked-password protection is disabled and requires an authorized project owner action.
