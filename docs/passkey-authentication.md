# SCRIMED Passkey Authentication

Updated: 2026-06-18

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

- Use short-lived AAL2 bearer secrets only for deliberate authenticated mutation smoke. Sales Demo Session QA now has a dedicated preflight, explicit `SCRIMED_SALES_QA_INTAKE_ID` target, and manual-only workflow in `.github/workflows/sales-demo-session-qa-smoke.yml`.
- Keep password sign-in disabled for SCRIMED product flows. Supabase advisors currently flag leaked-password protection as disabled; this is acceptable only while SCRIMED protected product access remains passkey or passwordless magic-link based. If password sign-in remains enabled anywhere at the Supabase project level, enable leaked-password protection in Supabase Auth password security before buyer expansion.
- Use `scripts/public-production-smoke.mjs` for no-secret deployment readiness checks; authenticated mutation smoke still needs a human-minted AAL2 bearer token because WebAuthn ceremonies cannot run unattended in CI.
