# Supabase Password Security Closure

Status: **OPERATOR_ACTION_REQUIRED**

Priority: **P0 before any protected pilot**
Owner: **Supabase project owner or authorized Auth administrator**

## Exact Project

- Project: `scrimed-protected-pilot`
- Project reference: `yxacqdfeyojrjghpwike`
- Live Security Advisor observation on 2026-08-27: `auth_leaked_password_protection` WARN
- Current state: leaked-password protection disabled
- Required state: leaked-password protection enabled

The connected administrative surface is read-only for this setting. No user, provider, session,
redirect, role, RLS policy, credential, migration, or database row was changed.

## Under-Two-Minute Owner Action

1. Open Supabase Dashboard and select project `yxacqdfeyojrjghpwike`.
2. Go to **Authentication > Sign In / Providers > Email** and open password security.
3. Enable **Prevent use of leaked passwords**. Change no other setting.
4. Save, then open **Advisors > Security**.
5. Confirm `Leaked Password Protection Disabled` is absent.
6. Capture a no-secret screenshot showing project reference, resolved advisor state, actor, and
   timestamp. Do not capture users, emails, tokens, sessions, or credentials.
7. Bind that evidence to the exact candidate under review.

Official guidance: [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Verification

Run:

```bash
npm run verify:supabase-security
```

The verifier must report no leaked-password warning. Then run the controlled synthetic AAL2
smoke. Repository contracts and RLS tests do not prove this dashboard setting is enabled.

## Rollback

Rollback is not recommended because disabling the control permits newly selected passwords known
to be compromised. If an unexpected authentication regression occurs, the Auth owner must record
an incident, obtain security-owner approval, document the temporary exception and expiry, and
re-enable the protection after remediation.

## Boundary

Closing this warning does not establish HIPAA compliance, certification, legal approval, clinical
authority, production authorization, PHI authority, customer activation, or go-live readiness.
