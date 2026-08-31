# Supabase Leaked-Password Protection

Status: **DEFERRED_PLATFORM_CONTROL / WARNING OPEN**

Supabase Security Advisor continues to report `auth_leaked_password_protection`. The feature is
available on Pro plans and above and is unavailable on the current Free plan. This is not evidence
that the warning is resolved.

The current bounded synthetic/no-PHI application lane uses passwordless OTP or magic-link entry,
sets `shouldCreateUser: false`, exposes no `signInWithPassword` production UI path, and requires
TOTP/AAL2, tenant membership, authorized role, server-side permission checks, short AAL1 sessions,
and rate limits for protected work. See
`docs/security/SUPABASE_FREE_PLAN_PASSWORDLESS_COMPENSATING_CONTROLS.md`.

## Future Activation Procedure

Before introducing password-based protected authentication, or after moving to a plan that exposes
the feature:

1. Select the verified SCRIMED project in Supabase Dashboard.
2. Open **Authentication > Sign In / Providers > Email > Password security**.
3. Enable **Prevent use of leaked passwords** without changing users, providers, sessions, redirects,
   roles, RLS, data, or migrations.
4. Refresh Security Advisor and require the warning to be absent.
5. Run the passwordless assurance, synthetic auth, AAL2, and protected-route regression tests.
6. Retain no-secret evidence tied to the exact candidate and environment.

Invariant: password auth plus anything other than verified leaked-password protection denies
protected access. This procedure grants no production, PHI, clinical, migration, customer, or
compliance authority.
