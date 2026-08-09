# Migration Dry-Run Report

## Decision

All three pending migrations are **READY FOR DISPOSABLE DRY-RUN**, not ready for production
application. Static ordering and checksum contracts pass. A disposable database run remains
blocked because no authorized disposable branch, Docker runtime, or Supabase CLI database was
available in this pass.

| Order | Migration | SHA-256 | Static decision |
| --- | --- | --- | --- |
| 1 | `20260718153148_clinical_assurance_control_plane.sql` | `5cdc5be2794b233476687e5930546746802ee5b57de3011afc1a781fa7d3902b` | READY |
| 2 | `20260721173000_p32_evidence_attestation_issuances.sql` | `18ca2d9df239d8eb1925b46ca7a85647ba9e6bfb513918e0720578bffafeb4fb` | READY |
| 3 | `20260722120000_p32_candidate_review_control_plane.sql` | `cdf380a8ae13d1134d9a33bdf872107e59effa295436e4dc3acba023b0283815` | READY |

## Static Findings

1. **Clinical assurance control plane:** adds private append-only registry and policy-event
   tables plus a unique workspace index. No apply-time row mutation. Validate the existing
   workspace table scan/lock, dependencies, RLS, deny policies, and forward recovery.
2. **Evidence attestation issuances:** adds an append-only private issuance ledger and guarded
   authenticated RPC. No apply-time row mutation. Validate composite dependencies, denial paths,
   AAL2 requirements, and feature-off recovery.
3. **Candidate review control plane:** adds append-only assignment/decision tables and guarded
   RPCs. No apply-time row mutation. Validate separation of duties, signed evidence, composite
   foreign keys, idempotency, and feature-off recovery.

Use forward recovery rather than destructive rollback: keep flags off, revoke later execute
grants if needed, retain append-only audit rows, and apply a separately reviewed corrective
migration. Full purpose, locking, security, dependencies, and rollback details remain in
`docs/PENDING_MIGRATION_AUTHORIZATION_PACKET.md`.

## Required Authorization

The database owner must authorize an isolated disposable dry-run bound to all three hashes, the
exact candidate, an expiry, and a named rollback owner. Production application remains blocked
until forward apply, representative invariants, security denials, locking observations, and
forward recovery are independently reviewed.
