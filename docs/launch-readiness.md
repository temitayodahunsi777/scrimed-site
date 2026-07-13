# SCRIMED Launch Readiness

Updated: 2026-06-26

SCRIMED Launch Readiness is the operating lane for launch structure, sandbox DNS limitations, strict branded-domain verification, fallback continuity, product readiness, service readiness, protected proof boundaries, and launch hard stops.

Surfaces:

- `/launch-readiness`
- `/api/launch-readiness`
- `/api/launch-readiness/brief`
- `npm run smoke:launch-domain-preflight`
- `npm run smoke:public`
- `/release-continuity`
- `/operations`
- `/navigation`
- `/product`
- `/limitations-workarounds`

DNS workaround:

- Restricted Codex sandbox execution can return `getaddrinfo ENOTFOUND app.scrimedsolutions.com`.
- Run `npm run smoke:launch-domain-preflight` to classify primary DNS, primary health, fallback DNS, fallback health, and launch-readiness headers.
- Use `SCRIMED_ALLOW_DNS_FALLBACK=1 npm run smoke:launch-domain-preflight` only for internal continuity evidence when the sandbox cannot resolve the branded domain.
- Fallback success is not launch approval.
- Launch approval still requires `SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public` from an unrestricted or approved network.

Launch gates:

- Branded domain resolves and returns launch-readiness headers.
- Public smoke passes on the branded domain.
- Product Console, Offerings, Client Onboarding, Demos, Pilots, Pricing, Pilot Intake, and Pilot Deal Room load without buyer confusion.
- Protected tenant routes fail closed publicly.
- AAL2 happy-path proof stays operator-run and no-secret.
- Legal, finance, accounting, tax, certification, PHI, connector, SLA, customer-release, and clinical-use claims remain behind qualified review.

Boundaries:

- Launch Readiness does not bypass sandbox restrictions.
- Launch Readiness does not override DNS or domain records.
- Launch Readiness does not approve production clinical use.
- Launch Readiness does not authorize PHI processing.
- Launch Readiness does not certify security, compliance, privacy, clinical validation, or regulatory status.
- Launch Readiness does not create a contractual SLA, support guarantee, revenue guarantee, or profit guarantee.
- Launch Readiness does not approve production connectors, customer proof release, or external distribution.
- Launch Readiness does not replace qualified human launch review.

Operator routine:

1. Run typecheck, lint, and build locally.
2. Start the local server and run public smoke against local host.
3. Deploy to production.
4. Run `npm run smoke:launch-domain-preflight`.
5. If sandbox DNS fails, classify it as sandbox DNS only when fallback health passes and the report says so.
6. Run strict public smoke against `https://app.scrimedsolutions.com` from approved network access.
7. Verify `/api/launch-readiness` headers on the branded domain.
8. Attach the Launch Readiness brief to internal launch review.
9. Keep fallback Vercel URLs internal until branded-domain smoke passes.
10. Route any unresolved claim, proof, support, data, or authority gap to `/limitations-workarounds` before launch language expands.
