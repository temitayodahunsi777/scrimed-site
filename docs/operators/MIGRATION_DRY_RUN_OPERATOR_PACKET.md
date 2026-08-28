# p.34 Disposable Migration Dry-Run Packet

Status: `OPERATOR_ACTION_REQUIRED`. Production application is prohibited.

Owner: database release owner.

## Exact Migration Set

1. `20260718153148_clinical_assurance_control_plane.sql` — `5cdc5be2794b233476687e5930546746802ee5b57de3011afc1a781fa7d3902b`
2. `20260721173000_p32_evidence_attestation_issuances.sql` — `fbbbfa0fbdfaf51ac7c52cc6cfba88fb743c84f9748167d3e97eb440148c97db`
3. `20260722120000_p32_candidate_review_control_plane.sql` — `d0d2c98ee652c452f8dc52ef05bac4b5bb90f7e9ebdf408101f5e6ed72a46f54`

The current follow-on does not edit these migration files. Existing disposable-database evidence
may be reused only while all three hashes remain exact. A checksum change fails closed and requires
a new migration plus a new dry run; historical migration evidence is never rewritten.

## Action

Use `.github/workflows/migration-dry-run.yml` or a disposable local PostgreSQL database named `scrimed_migration_ci`. The verifier refuses remote/non-disposable targets. Apply all migrations in exact order, inspect constraints, indexes, functions, triggers, RLS, policies, grants, and tenant isolation, then reset and replay to verify deterministic forward recovery.

Expected artifact: `artifacts/migrations/migration-dry-run.json`, candidate-bound after the final commit. If checksums differ, RLS/policies are absent, replay differs, or any production credential/host is detected, stop and classify `BLOCKED_TECHNICAL`.

Rollback: destroy the disposable database. Completion authorizes only migration review; production migration still requires a separate exact-candidate authorization.
