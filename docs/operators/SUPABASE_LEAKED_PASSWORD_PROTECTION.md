# Supabase Leaked-Password Protection

**Project:** `scrimed-protected-pilot` (`yxacqdfeyojrjghpwike`)
**Observed:** `2026-08-09T01:24:44Z`
**Current state:** disabled; Security Advisor `auth_leaked_password_protection` warning present
**Desired state:** enabled
**Owner:** Supabase organization owner or authorized Auth administrator
**Status:** OPERATOR ACTION REQUIRED

The connected Supabase tools provided read-only project and advisor evidence but no narrowly
scoped Auth configuration mutation. No user, provider, session, redirect, key, RLS policy, role,
storage setting, database row, or migration was changed.

The 2026-08-09 advisor refresh confirmed the warning remains open. This document is an operator
procedure, not evidence that the setting was changed.

## Exact Dashboard Action

1. Open Supabase Dashboard and select `scrimed-protected-pilot`.
2. Open **Authentication > Sign In / Providers > Email**.
3. In password security, enable **Prevent use of leaked passwords** only.
4. Save without changing providers, MFA, redirect URLs, users, sessions, or access policies.
5. Open Security Advisor and confirm `auth_leaked_password_protection` no longer appears.
6. Run the controlled synthetic authentication regression checks; do not test with real passwords
   known to be compromised and do not capture user identifiers or tokens.
7. Retain a no-secret screenshot or advisor export showing project reference, setting/result,
   actor, and timestamp.

Supabase documents that this control checks proposed passwords against the Pwned Passwords API and
is available on Pro plans and above. Expected impact: new passwords, password changes, and affected
password sign-ins can be rejected with a weak-password response; existing account data is not
rewritten. Rollback should be exceptional, documented, time-limited, and owned by the Auth
administrator.

## Completion Criteria

- The advisor warning is absent after refresh.
- Existing synthetic OTP/AAL2 and permitted sign-in flows still pass.
- No unrelated Auth setting changed.
- Evidence contains no password, token, email, user list, or session data.
- Evidence is bound to the exact candidate before any release decision.

Reference: `https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection`
