# Supabase Security Operator Packet

**Project:** `scrimed-protected-pilot` (`yxacqdfeyojrjghpwike`)
**Observed:** 2026-08-01
**Current state:** Security Advisor warning `auth_leaked_password_protection`; protection disabled
**Required state:** leaked-password protection enabled
**Status:** OPERATOR REQUIRED

The connected read-only surface did not expose a narrowly scoped Auth configuration mutation.
No provider, user, role, session, redirect, credential, RLS policy, or database row was changed.

## Exact Action

Owner: Supabase organization owner or authorized Auth administrator.

1. Open Supabase Dashboard and select the project above.
2. Open **Authentication**, then the password-security settings under **Sign In / Providers**.
3. Enable leaked-password protection only.
4. Save. Do not rotate credentials or change providers, MFA, redirects, users, or access policy.
5. Rerun Security Advisor.
6. Run the controlled synthetic AAL2 authentication checks.
7. Retain a no-secret screenshot/export showing project reference, resolved warning, actor, and
   timestamp; bind it to the final candidate.

Official reference:
`https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection`

Expected user impact is rejection of known-compromised passwords. Rollback is not recommended;
if an operational regression occurs, the Auth owner must document the incident and separately
approve any temporary reversal. Evidence must contain no token, credential, user list, email,
session, or customer data.

Repository review confirms service-role use remains server-only, protected routes fail closed,
tenant scoping is enforced in SQL/API policy, and the three pending migrations remain unapplied.
These source controls do not prove the dashboard setting has changed.
