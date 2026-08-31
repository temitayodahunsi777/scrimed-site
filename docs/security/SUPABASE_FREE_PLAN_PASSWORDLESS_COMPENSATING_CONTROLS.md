# Supabase Free-Plan Passwordless Compensating Controls

Status: **COMPENSATING_CONTROL_ACTIVE / DEFERRED_PLATFORM_CONTROL**

## Limitation

Supabase leaked-password protection is unavailable on the current Free plan. The Security Advisor warning remains open and must not be represented as resolved. The control primarily protects password authentication; SCRIMED's current protected application entry is passwordless OTP/magic link.

## Compensating Controls

- public signup disabled;
- every application OTP call sets `shouldCreateUser: false`;
- no production UI invokes `signInWithPassword`;
- TOTP MFA enabled and privileged routes require `aal2`;
- AAL1 sessions limited to 15 minutes;
- password-only protected access prohibited;
- OTP request, verification, sign-in, and protected APIs are bounded by rate-limit policy;
- tenant membership, authorized role, session identity, and route permission are enforced server-side;
- auth uncertainty, stale posture evidence, or control drift fails closed;
- PHI, protected-pilot activation, production, and customer authority remain denied.

## Residual Risk

The upstream warning remains visible. Direct identity-provider behavior and configuration can drift outside source control, so the posture needs periodic live re-observation. AAL1 account access is not authority for protected operations. Compensating controls reduce current bounded-lane exposure but do not substitute for the platform control when password authentication is used.

## Activation Trigger

If SCRIMED introduces password-based protected authentication, or upgrades to a plan that exposes leaked-password protection, enable and verify the control before protected production access. The executable invariant is in `app/lib/release/supabasePasswordlessAssurance.ts`; tests fail when password auth is enabled without verified protection.

## Evidence and Expiry

Current non-sensitive posture was observed on 2026-08-31 and must be re-observed by 2026-09-30. No passwords, OTPs, tokens, user identities, or service credentials are retained.
