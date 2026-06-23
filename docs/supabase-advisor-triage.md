# SCRIMED Supabase Advisor Triage

Updated: 2026-06-22

This runbook records the current Supabase advisor posture for SCRIMED protected pilot infrastructure.

## Current Security Advisor Status

- Advisor: `auth_leaked_password_protection`
- Severity: `WARN`
- Finding: Supabase Auth leaked-password protection is disabled.
- Supabase remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Current SCRIMED product workaround: protected product access uses passkey or passwordless magic-link sign-in plus TOTP/AAL2 gates for governed actions. Product code does not call `signInWithPassword`.
- Required dashboard action: keep password sign-in disabled for SCRIMED product flows, or enable leaked-password protection before any password-based sign-in is allowed.
- Boundary: this warning is not a HIPAA, SOC 2, FDA, security-certification, production connector, PHI-processing, or live-clinical-care approval.

## Current Performance Advisor Status

Supabase performance advisors currently report informational `unused_index` findings across several protected pilot, sales, TrustOS, TrustOps, agent workspace, and evidence-room tables.

SCRIMED is intentionally not dropping these indexes yet because:

- the product is still in protected synthetic-pilot and enterprise-evaluation motion;
- many indexes support tenant-scoped audit lookups, reviewer filtering, packet generation, and future pilot traffic;
- unused-index findings before real workload volume can be false economy;
- premature index removal may increase latency once buyer demos and protected pilots produce steady traffic.

Operational rule:

- Review unused-index findings after meaningful protected-pilot workload exists.
- Keep indexes that support tenant isolation, audit history, packet generation, reviewer queues, renewal queues, or governance dashboards.
- Remove only indexes with sustained non-use after workload telemetry, query plans, and rollback impact are reviewed.

## Buyer-Safe Statement

SCRIMED has current Supabase advisor visibility and a documented security workaround for password-risk posture. The system remains protected-synthetic-pilot only and does not claim production clinical authorization, PHI processing authority, compliance certification, reimbursement certainty, security certification, or live patient execution.
