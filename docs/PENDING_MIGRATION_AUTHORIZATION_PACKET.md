# Pending Migration Authorization Packet

**Observed production migration through:** `scrimed_work_completion_evidence`
**Review type:** Static equivalent review plus repository contract tests
**Disposable database dry-run:** Not executed; Docker, Supabase CLI, and an authorized
disposable branch were unavailable
**Production migration:** Not authorized and not executed

`config/pending-migration-authorization.json` is the machine-readable checksum source.
`scripts/pending-migration-authorization-check.mjs` validates ordering, exact hashes,
apply-time data mutation, destructive DDL, RLS, privilege restriction, append-only controls,
and composite workspace/tenant binding.

## Ordering And Checksums

| Order | Migration | SHA-256 | Static status |
| --- | --- | --- | --- |
| 1 | `20260718153148_clinical_assurance_control_plane.sql` | `5cdc5be2794b233476687e5930546746802ee5b57de3011afc1a781fa7d3902b` | READY |
| 2 | `20260721173000_p32_evidence_attestation_issuances.sql` | `18ca2d9df239d8eb1925b46ca7a85647ba9e6bfb513918e0720578bffafeb4fb` | READY |
| 3 | `20260722120000_p32_candidate_review_control_plane.sql` | `cdf380a8ae13d1134d9a33bdf872107e59effa295436e4dc3acba023b0283815` | READY |

`READY` means ready for a separately authorized disposable-database dry-run. It does not
mean ready to apply to production.

## 1. Clinical Assurance Control Plane

- **Purpose:** Add private, append-only registry snapshots and policy-event evidence for CAL,
  enclave, model/tool/capacity, concentration, supplier, and promotion metadata.
- **Schema:** One unique index on existing `pilot_workspaces`; two new private tables; five
  secondary indexes; restrictive RLS; deny-all policies; immutable update/delete triggers.
- **Apply-time data mutation:** None.
- **Reversibility:** Prefer forward recovery. Keep feature flags off and leave empty/private
  tables in place. Dropping objects requires a separate retention and dependency review.
- **Locking/downtime:** The unique index scans and briefly locks `pilot_workspaces`; validate
  table size and concurrent write behavior in the disposable dry-run. New-table operations are
  otherwise low risk.
- **Security:** No public API grant; raw prompts, connector payloads, clinical authority, payer
  submission, and EHR writeback are constrained false.
- **Dependencies:** `pgcrypto`, `private` schema, `pilot_tenants`, and `pilot_workspaces`.
- **Rollback:** Disable durable-store flags; revoke any later runtime grants; export non-PHI
  evidence if rows exist; use a separately approved forward-recovery migration.
- **Recommendation:** Authorize disposable dry-run only.

## 2. P.32 Evidence Attestation Issuances

- **Purpose:** Persist short-lived, candidate-bound, no-PHI AAL2 evidence issuance receipts.
- **Schema:** New private table and indexes, RLS, privilege revocation, append-only trigger,
  guarded private function, and authenticated public RPC.
- **Apply-time data mutation:** None; inserts occur only after a later authorized RPC call.
- **Reversibility:** Disable `SCRIMED_P32_EVIDENCE_ISSUER_ENABLED`, revoke RPC execute, retain
  the ledger for audit, and use forward recovery.
- **Locking/downtime:** New empty-table and function DDL; expected low risk. Foreign-key
  validation and function compilation must be proven in the dry-run.
- **Security:** Requires AAL2 governance session, server token, allowed role, eligible QA packet,
  bounded timestamps, idempotency, prohibited-content checks, and composite tenant/workspace
  integrity.
- **Dependencies:** Migration 1 composite workspace key; `qa_manual_run_evidence_packets`,
  `auth.users`, `require_governance_workspace`, and `pgcrypto.digest`.
- **Rollback:** Feature off, revoke public/private execute, preserve append-only rows, then
  forward-recover only after evidence-retention review.
- **Recommendation:** Authorize disposable dry-run only.

## 3. P.32 Candidate Review Control Plane

- **Purpose:** Persist distinct-reviewer assignments and signed review decisions for one exact
  candidate without granting release authority.
- **Schema:** Two private append-only tables and indexes, RLS, privilege revocation, guarded
  assignment/decision functions, authenticated public RPCs, composite tenant/workspace and
  assignment-scope foreign keys.
- **Apply-time data mutation:** None; later writes require authorized RPC calls.
- **Reversibility:** Disable `SCRIMED_P32_CANDIDATE_REVIEW_ENABLED`, revoke RPC execute, retain
  decisions for audit, and forward-recover.
- **Locking/downtime:** New empty-table and function DDL; expected low risk. Composite foreign
  keys and function behavior require dry-run verification.
- **Security:** Separation of duties, active reviewer membership, exact candidate and signed
  review-packet hashes, bounded approvals, idempotency, append-only evidence, and release
  authority fixed false.
- **Dependencies:** Migrations 1 and 2, `pilot_memberships`, `auth.users`,
  `require_governance_workspace`, and trusted signing-key runtime configuration.
- **Rollback:** Feature off, revoke execute, preserve immutable review history, and use an
  approved forward-recovery migration.
- **Recommendation:** Authorize disposable dry-run only.

## Authorization Gate

The database owner must bind authorization to all three SHA-256 values, the exact candidate
commit, a disposable environment, an expiration time, and a named rollback owner. The dry-run
must verify forward application, representative row invariants, security/RPC denial paths,
locking observations, and forward recovery before any production decision.
