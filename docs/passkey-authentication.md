# SCRIMED Passkey Authentication

Updated: 2026-06-16

## Status

Passkey authentication is product-enabled for the governed SCRIMED pilot surfaces:

- `/pilot-workspace/access`
- `/sales-operations`

Both clients explicitly opt into Supabase Auth passkeys and preserve the existing tenant membership, TOTP/AAL2, session-lifetime, and row-level-security controls.

Authenticated users can now list, rename, register, and revoke their own passkeys from the protected pilot workspace and Sales Operations consoles.

## Supported Flow

1. Approved user signs in with magic link or existing passkey.
2. Signed-in user can register, rename, refresh, and revoke passkeys from the passkey management panel.
3. Future sign-in can use the passkey button without entering an email.
4. Governed workspace actions still require the applicable tenant role and AAL2/TOTP assurance.

## Boundaries

- Passkeys improve phishing resistance for sign-in; they are not a substitute for tenant authorization, RLS, AAL2 mutation gates, human review, or audit logging.
- Supabase passkey support is currently experimental, so SCRIMED should monitor Supabase and `@supabase/supabase-js` release notes before dependency upgrades.
- Passkeys require a stable WebAuthn relying-party ID and allowed origins. Do not change the relying-party ID after enrollment without a planned credential reset.
- Passkeys cannot be used directly by unattended GitHub Actions smoke tests because WebAuthn requires a browser/human ceremony.
- This does not authorize live PHI handling, production clinical execution, autonomous diagnosis, payer submission, or compliance certification.

## Remaining Operational Gates

- Add `SCRIMED_BEARER_TOKEN` as a GitHub Actions secret for authenticated Agent Workspace and TrustOps mutation smoke.
- Keep password sign-in disabled for SCRIMED product flows. If password sign-in remains enabled elsewhere at the Supabase project level, enable leaked-password protection in Supabase Auth password security.
- Use `scripts/public-production-smoke.mjs` for no-secret deployment readiness checks; authenticated mutation smoke still needs the AAL2 bearer token because WebAuthn ceremonies cannot run unattended in CI.
