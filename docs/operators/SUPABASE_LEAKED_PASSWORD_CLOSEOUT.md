# Supabase Leaked-Password Upgrade Path

Current warning: **auth_leaked_password_protection / Leaked Password Protection Disabled**

Project: **scrimed-protected-pilot** (public alias only; project identifiers and secrets are excluded)

Current classification: **DEFERRED_PLATFORM_CONTROL / DEFERRED_HARDENING_FOR_PASSWORD_AUTH**. The warning is not resolved. It is not a universal blocker for the bounded passwordless synthetic/no-PHI lane while all compensating controls remain current.

## Current Safe Lane

Public signup is disabled, OTP/magic-link calls use `shouldCreateUser: false`, production UI password calls are absent, TOTP and AAL2 protect privileged operations, AAL1 sessions are bounded, tenant and role authorization are enforced server-side, and OTP/sign-in controls are rate limited. Any drift or stale evidence denies protected access.

## Activation Trigger

Before any password-based protected path is introduced, require leaked-password protection to be `VERIFIED`. If the project plan exposes the feature, enable it, rerun Security Advisor, run the passwordless assurance policy and auth regression suite, and retain non-sensitive evidence.

## Invariant

`passwordAuthEnabled == true && leakedPasswordProtection != VERIFIED -> protectedProductionAuth = DENY`. Production, PHI, protected-pilot, and customer authority remain separately denied.
