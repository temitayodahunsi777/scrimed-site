# Supabase Security Operator Checklist

**Project:** `scrimed-protected-pilot`
**Owner:** Supabase organization/project owner with Auth configuration rights
**Current evidence:** Security Advisor reports `auth_leaked_password_protection` at `WARN`

The connected project was inspected on 2026-07-23. Leaked-password protection remains
disabled. The connected management surface can read Security Advisor findings but does not
expose a scoped Auth configuration mutation, so no setting was changed.

## Required Action

1. Sign in to the Supabase Dashboard with an MFA-protected owner account.
2. Select `scrimed-protected-pilot`.
3. Open **Authentication**.
4. Open **Settings** and locate **Password Security**. Dashboard labels may present this as
   **Authentication > Sign In / Password Security**.
5. Enable **Prevent use of leaked passwords**.
6. Save the Auth configuration.
7. Do not change providers, redirect URLs, users, sessions, MFA policy, SMTP, or unrelated
   password settings in this action.
8. Open **Advisors > Security** and rerun the advisor.
9. Confirm `auth_leaked_password_protection` is absent or reports resolved.

Supabase documents the control at
[Password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
The feature requires a Pro plan or higher.

## Evidence To Retain

- Project name and non-secret project reference.
- UTC timestamp.
- Auth-setting screen showing the enabled toggle without user records or credentials.
- Security Advisor result showing the warning resolved.
- Operator identity and role.
- Change-ticket or approval reference.

This action does not authorize credential rotation, provider changes, user-access changes,
database migration, PHI processing, or production activation.
