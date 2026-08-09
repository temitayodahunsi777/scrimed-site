# Security And Execution Gates

## Complete In Repository

- Safe startup assertion with synthetic-only, no-PHI operating defaults.
- API-level intake gate, server validation, no-PHI detection, rate limiting, bounded external routing, and no full-content logs.
- Deny-by-default protected execution, scoped roles, AAL2/operator evidence checks, idempotency, audit envelopes, tenant controls, and approval-bound workflows in existing SCRIMED control-plane modules.
- CSP, HSTS, frame denial, MIME protection, referrer restrictions, browser-permission limits, forwarded-header scrubbing, and server-side secrets.
- CI typecheck, lint, nonsecret tests, dependency audit, SBOM, secret scanning, generated integrity, build, and public release verification.

## Partial Or Environment-Dependent

- Durable audit/intake persistence requires configured Supabase services and exact migrations.
- Distributed rate limiting requires configured Upstash services; local fallback does not prove multi-region enforcement.
- Protected identity, RBAC, AAL2, tenant, and audit controls require environment-specific validation.
- External CRM, EHR, payer, device, and model providers remain unavailable or disabled without approved credentials and contracts.
- Tamper-evident evidence exists in repository workflows; external retention and legal-hold policy require owner validation.

## Blocked

Live PHI, production connectors, medical devices, emergency monitoring, autonomous care, payer decisions/submission, EHR writeback, production migration, customer activation, and certification claims remain blocked.

## Production Activation Conditions

Activation requires exact-candidate provenance, named security/privacy/legal/clinical review, intended-use approval, identity and tenant validation, persistent audit, idempotency, rate limits, rollback, approved data agreements, provider authorization, migration approval, deployment authorization, and post-deployment evidence. Environment variables alone cannot authorize these actions in this release.
