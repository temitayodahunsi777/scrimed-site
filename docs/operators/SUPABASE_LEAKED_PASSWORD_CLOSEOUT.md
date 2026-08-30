# Supabase Leaked-Password Closeout

Current warning: **auth_leaked_password_protection / Leaked Password Protection Disabled**

Project: **scrimed-protected-pilot** (`yxacqdfeyojrjghpwike`)

## Two-Minute Owner Action

1. Open Supabase Dashboard and select the exact project above.
2. Open **Authentication > Sign In / Providers > Password security** (the dashboard label may be **Authentication > Settings > Password Security**).
3. Enable only **Prevent use of leaked passwords**.
4. Save. Do not change users, sessions, providers, redirect URLs, RLS, roles, schema, data, or migrations.
5. Open **Advisors > Security Advisor** and rerun/refresh it.

## Expected Result

The `auth_leaked_password_protection` warning is absent. Record a non-sensitive screenshot or advisor result with project name and timestamp; do not capture users, emails, tokens, or configuration secrets.

## Verification

Run the connected Security Advisor again and require zero leaked-password warnings. Protected-pilot readiness remains blocked until this is observed and candidate-bound evidence is recorded.

## Rollback

If the setting causes an authentication incident, the project owner may disable only the same setting, record the reason and timestamp, and restore the gate to `OPERATOR_ACTION_REQUIRED`. No unrelated Auth setting may be changed.
