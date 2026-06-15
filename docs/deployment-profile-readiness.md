# SCRIMED Deployment Profile Readiness

Updated: 2026-06-15

## Status

Deployment profile fixtures are active product surfaces:

- UI: `/deployment-profiles`
- API: `/api/deployment-profiles`
- Product console: `/product`
- Protected pilot proof packets: Deployment Profile Readiness section

## Profiles

- Managed Cloud Pilot Profile
- Private Cloud Readiness Profile
- Hospital-Controlled Runtime Profile
- Sovereign Cloud And Public Sector Profile
- Edge And On-Prem Evaluation Profile

## Purpose

Deployment profiles help SCRIMED discuss infrastructure readiness with enterprise buyers before production claims are made. Each profile includes buyer fit, revenue use, environment, cost model, latency posture, data-residency posture, security controls, interoperability standards, pilot metrics, production gates, and blocked claims.

## Known Limitation Handling

- Local `npm` unavailability is bypassed through direct Node entrypoints for lint, typecheck, integrity, and build.
- Local Turbopack is blocked by macOS SWC code-signature validation; local production verification uses Next's Webpack fallback while Vercel production deployments remain READY.
- Authenticated GitHub smoke still requires an out-of-band `SCRIMED_BEARER_TOKEN` secret and cannot be safely resolved in source code.

## Boundary

Deployment profiles are readiness fixtures. They are not cloud certifications, HIPAA certifications, SOC 2 reports, sovereign-cloud approvals, medical-device authorizations, or production clinical execution approvals.
