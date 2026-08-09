# SCRIMED P.32 Migration Review

Evidence class: `NON_CANDIDATE`

No migration was applied. No shared, preview, or production database was contacted.

## Review Result

| Migration | Purpose | Static review | Executable dry run | Authorization recommendation |
| --- | --- | --- | --- | --- |
| `20260718153148_clinical_assurance_control_plane.sql` | Adds private append-only clinical assurance registry snapshots and policy-event ledgers with tenant/workspace binding. | PASS | BLOCKED_ENVIRONMENT | Authorize an isolated disposable database dry run only. |
| `20260721173000_p32_evidence_attestation_issuances.sql` | Adds a private append-only ledger and bounded AAL2 evidence-attestation recording function. | PASS | BLOCKED_ENVIRONMENT | Authorize an isolated disposable database dry run only. |
| `20260722120000_p32_candidate_review_control_plane.sql` | Adds private append-only candidate review assignments and decisions with separation of duties. | PASS | BLOCKED_ENVIRONMENT | Authorize an isolated disposable database dry run only. |

## Static Findings

All three migrations:

- are ordered lexically and bind workspaces to tenants with composite foreign keys;
- create additive private tables and indexes;
- enable row-level security and revoke table access;
- install append-only update/delete rejection triggers;
- contain no apply-time row insert, update, delete, or truncate statement;
- contain no table/schema drop or column drop;
- preserve `release_authority_granted = false` where release evidence is recorded;
- use bounded, no-PHI metadata contracts.

The evidence and review migrations also use one-use idempotency keys, bounded timestamps, role checks, tenant-scoped lookups, advisory locks, and audit hash chaining.

## Risk Review

### Clinical assurance control plane

- Data mutation: schema-only at apply time.
- Reversibility: tables, indexes, policies, triggers, and function can be removed in an isolated rollback. Production rollback must preserve any append-only evidence already written, so forward recovery is preferred after use.
- Locking/downtime: the unique index on `public.pilot_workspaces(id, tenant_id)` may scan and briefly lock that existing table. Table size and duplicate-key precheck are required.
- Security: private schema, restrictive policies, revoked roles, no public API grant.
- Dependencies: `public.pilot_workspaces`, `public.pilot_tenants`, `private` schema, `pgcrypto` digest support.

### Evidence attestation issuances

- Data mutation: schema-only at apply time.
- Reversibility: additive objects can be removed before use. Once evidence exists, forward recovery is preferred to preserve the append-only record.
- Locking/downtime: new table and indexes have low expected impact; function creation acquires catalog locks.
- Security: service role and public table access are revoked; authenticated execution is still subject to the existing AAL2 governance workspace check.
- Dependencies: `public.qa_manual_run_evidence_packets`, `private.require_governance_workspace`, `auth.users`, `pgcrypto`.

### Candidate review control plane

- Data mutation: schema-only at apply time.
- Reversibility: additive objects can be removed before use. Once decisions exist, forward recovery is preferred.
- Locking/downtime: new tables and indexes have low expected impact; function creation acquires catalog locks.
- Security: distinct assigner/reviewer enforcement, exact candidate and signed review-packet binding, AAL2 workspace checks, expiry, idempotency, and append-only receipts.
- Dependencies: active reviewer memberships, `private.require_governance_workspace`, `auth.users`, `pgcrypto`.

## Environment Blocker

`psql`, Docker, the Supabase CLI, and a local Supabase binary are unavailable in this workspace. Therefore:

- forward execution was not tested;
- rollback/forward-recovery execution was not tested;
- query plans, lock duration, row-count invariants, extension availability, and function compilation were not verified in a real PostgreSQL engine.

The next authorized operator must use an isolated disposable database, never a shared or production database, and must record:

1. preflight schema/version and extension inventory;
2. forward migration output;
3. table/index/function/policy inventory;
4. tenant isolation and append-only negative tests;
5. row counts and invariants before/after;
6. rollback or forward-recovery rehearsal;
7. lock timing and downtime observation;
8. exact migration and candidate fingerprints.

Final state: `READY_FOR_DISPOSABLE_DRY_RUN_AUTHORIZATION`, not production migration approval.
