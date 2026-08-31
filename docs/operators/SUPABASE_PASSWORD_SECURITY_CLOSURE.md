# Supabase Password Security Closure

Status: **COMPENSATING_CONTROL_ACTIVE / DEFERRED_PLATFORM_CONTROL**

The Security Advisor warning `auth_leaked_password_protection` remains open. The current plan does
not expose **Prevent use of leaked passwords**, so the feature is deferred rather than represented
as fixed. Protected password authentication remains denied.

Current passwordless synthetic access is permitted only while every control in
`docs/security/SUPABASE_FREE_PLAN_PASSWORDLESS_COMPENSATING_CONTROLS.md` is current. Missing or stale
evidence, public signup, user creation through OTP, password UI calls, absent TOTP/AAL2, excessive
AAL1 duration, missing rate limits, or missing tenant/role/server authorization fails closed.

Run:

```bash
npm run test:supabase-passwordless-assurance
npm run contract:supabase-passwordless-assurance
npm run verify:supabase-security
```

Upgrade or password-auth activation requires the future procedure in
`docs/operators/SUPABASE_LEAKED_PASSWORD_PROTECTION.md`. Neither current state nor future closure
establishes compliance, certification, PHI, production, clinical, migration, or customer authority.
