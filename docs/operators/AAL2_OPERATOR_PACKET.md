# p.34 AAL2 Operator Packet

Status: `OPERATOR_ACTION_REQUIRED`.

Owner: authorized SCRIMED tenant operator with enrolled MFA and the required tenant role.

## Prerequisites

- final gap-closure commit and regenerated candidate fingerprint;
- current AAL2 session issued by the configured Supabase Auth project;
- protected workspace membership and exact action scope;
- a fresh bounded nonce retained only by the protected API.

## Action

1. Complete MFA step-up in the protected SCRIMED workspace.
2. Generate a fresh candidate manifest.
3. Run `npm run verify:aal2:evidence -- --strict` with nonsecret candidate-bound inputs supplied through the existing local operator mechanism.
4. Run the protected AAL2 smoke for the exact candidate.
5. Retain only issuer/audience checks, subject/token/nonce fingerprints, protected receipt hash, timestamp, expiry, tenant, role, and candidate binding.

Never store the bearer token, raw subject, nonce, user email, credential, or PHI. Replay, expiry, wrong candidate, wrong tenant, wrong role, or missing signature verification fails closed. Completion does not authorize deployment, migration, PHI, clinical action, or customer activation.

Rollback: revoke the evidence receipt and repeat MFA with a new nonce. Completion condition: the protected endpoint validates signature, AAL2, role, tenant, freshness, nonce uniqueness, action scope, and exact candidate.
