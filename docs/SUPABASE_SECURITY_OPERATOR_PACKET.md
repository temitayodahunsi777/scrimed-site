# Supabase Security Operator Packet

## Observed State

- Checked: 2026-08-01
- Project: `scrimed-protected-pilot`
- Project reference: `yxacqdfeyojrjghpwike`
- Region: `us-east-1`
- Health: `ACTIVE_HEALTHY`
- Security Advisor: one warning, leaked-password protection disabled

The connected Supabase surface can inspect this setting but does not expose a narrowly scoped
Auth-setting mutation. No Auth provider, user, access policy, credential, or migration was
changed.

## Required Owner Action

**Owner:** Supabase organization owner or authorized Auth administrator.

1. Open Supabase Dashboard and select `scrimed-protected-pilot`.
2. Open **Authentication**, then **Sign In / Providers** or the current password-security
   settings surface.
3. Enable leaked-password protection for password authentication.
4. Save only that setting. Do not rotate credentials or alter providers, users, MFA, redirects,
   or access policies as part of this action.
5. Rerun Security Advisor and retain a non-sensitive screenshot or exported finding showing the
   warning resolved, project reference, reviewer, and timestamp.
6. Bind the evidence to the exact release candidate before any production authorization.

Official guidance:
`https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection`

## Verification

- Security Advisor has no `auth_leaked_password_protection` warning.
- Existing authentication and AAL2 flows still pass in a controlled non-PHI workspace.
- Evidence contains no token, credential, email list, user identity, or customer data.

Status: **OPERATOR_REQUIRED**. This packet is not evidence that the setting was enabled.
