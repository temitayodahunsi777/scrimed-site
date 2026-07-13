# SCRIMED Supabase Advisor Remediation

## Scope

The observed protected-pilot project is healthy. Advisor output identified two security warnings and stored-vector foreign-key indexing findings. This runbook records the reviewed remediation path and preserves the remaining account-owner action.

## Prepared Index Remediation

`supabase/migrations/20260711224500_stored_vector_advisor_index_hardening.sql` adds covering indexes for:

- `private.scrimed_stored_vectors(created_by)`;
- `private.scrimed_stored_vector_lookup_events(tenant_id)`.

The migration fails closed if the base stored-vector tables do not exist. Apply it only after the pending Compute Fabric and SCRIMED Work migrations have passed an approved nonproduction review.

## Leaked-Password Protection

Supabase documents leaked-password protection as available on the Pro Plan and above. It is an Auth configuration control, not a SQL migration. Until an authorized account owner enables it:

- require AAL2 for protected SCRIMED operations;
- retain short-lived token policy and role verification;
- use strong minimum password and character requirements;
- prefer approved passwordless or phishing-resistant authentication where appropriate;
- keep protected-pilot expansion blocked.

Enablement requires an authorized account owner in Supabase Auth settings, followed by a fresh security-advisor check. Do not place account tokens in source, commands, logs, or evidence packets.

Official reference: <https://supabase.com/docs/guides/auth/password-security>

## pgvector Extension Warning

The `vector` extension was observed in `public`. Moving an extension changes object namespace and can break functions, casts, search paths, generated clients, or migrations that reference `vector` without qualification. SCRIMED therefore does not issue an automatic dashboard or ad hoc SQL change.

The dependency audit confirmed:

- pgvector `0.8.0` is relocatable;
- the target `extensions` schema already exists;
- the database search path includes `extensions`;
- `anon`, `authenticated`, and `service_role` have schema usage;
- the only SCRIMED vector column is `private.scrimed_stored_vectors.embedding`;
- stored-vector functions bind the vector type by object identity and remain subject to post-move RPC verification.

`supabase/migrations/20260713190000_vector_extension_schema_hardening.sql` is the transactional relocation migration. It uses short lock and statement timeouts, accepts only the known `public` or `extensions` starting states, verifies that the extension is relocatable, performs an idempotent schema decision, and rolls back unless the extension and stored-vector column both resolve to `extensions` with required schema privileges.

The transactional rollback is automatic while the transaction is open if any precondition or postcondition fails. A later reverse relocation would require a separately reviewed migration and stored-vector regression run; it must not be performed ad hoc.

After application, direct table access remains revoked, RLS remains restrictive, and stored-vector registration/search plus advisor checks must pass before the warning is considered closed.

## Current Evidence

On 2026-07-13, the reviewed migration was applied to the approved `scrimed-protected-pilot` no-PHI project. Post-migration catalog verification confirmed pgvector `0.8.0` and the stored-vector embedding type both resolve from `extensions`; required role usage remains present; and the public stored-vector RPC signature still resolves. A fresh Supabase security-advisor run no longer reports `extension_in_public`.

The remaining security advisor is `auth_leaked_password_protection`. It remains an account-owner and Pro-plan action and is not represented as complete.

## Operator Sequence

1. Confirm the target is the approved no-PHI protected-pilot Supabase project.
2. Apply pending migrations in chronological order.
3. Apply the vector schema-hardening migration transactionally.
4. Run `npm run smoke:supabase-advisor-remediation`.
5. Run stored-vector contract and authenticated smoke using a fresh AAL2 session.
6. Re-run Supabase security and performance advisors.
7. Record evidence hashes and human disposition; do not copy raw credentials or logs.

## Boundary

This runbook does not enable Auth settings, approve PHI, certify security, authorize clinical workflows, or approve customer go-live. Database changes remain limited to reviewed migrations on the no-PHI protected-pilot target and require post-change verification.
