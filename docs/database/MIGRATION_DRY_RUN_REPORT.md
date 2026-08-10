# Pending Migration Dry-Run Report

## Result

Static checksum, ordering, no-apply-time-data-mutation, no-destructive-schema-mutation, private
ledger, RLS, privilege restriction, append-only, and tenant-binding checks pass for the exact
three-migration set. Executable dry-run status is **BLOCKED — ENVIRONMENT UNAVAILABLE** because
this environment has no Docker, Supabase CLI, `psql`, or disposable database. No database was
contacted and no migration was applied.

| Order | Migration / purpose | Schema and data | Risk / recovery | Decision |
| --- | --- | --- | --- | --- |
| 1 | `20260718153148_clinical_assurance_control_plane.sql`; private assurance registry and policy-event ledger | Adds one unique workspace index, two private tables, indexes, RLS deny policies, grants, function, and immutable triggers; no apply-time row mutation | Existing workspace index build is the principal lock/scan concern. Forward recovery: keep features off, revoke function execution, add reviewed corrective migration; never delete audit rows | Static `READY`; executable `BLOCKED` |
| 2 | `20260721173000_p32_evidence_attestation_issuances.sql`; append-only AAL2 evidence issuance | Adds private table, indexes, RLS/revokes, immutable trigger, guarded security-definer RPC; no apply-time row mutation | Depends on tenants, workspaces, retained QA packets, auth, digest, and governance functions. Test role denial, idempotency, hash chain and timeout. Forward-correct only | Static `READY`; executable `BLOCKED` |
| 3 | `20260722120000_p32_candidate_review_control_plane.sql`; independent assignment and decision ledger | Adds private assignment/decision tables, indexes, RLS/revokes, immutable trigger, guarded RPCs; no apply-time row mutation | Depends on membership/governance/AAL2/evidence records and composite tenant keys. Test separation of duties, expiry, replay, denial and concurrent locks. Forward-correct only | Static `READY`; executable `BLOCKED` |

Exact SHA-256 values remain in `config/pending-migration-authorization.json` and are verified by
`scripts/pending-migration-authorization-check.mjs`.

## Disposable Execution

Run only on an isolated local Supabase stack containing synthetic fixtures:

```bash
npm run preflight:migrations:disposable
# Copy the printed exact-set authorization token into the next command's environment.
SCRIMED_DISPOSABLE_MIGRATION_AUTHORIZATION=<exact-token> \
  npm run verify:migrations:disposable
```

The executable path requires local Docker and Supabase CLI, uses `supabase db reset --local
--no-seed`, records only a redacted output digest, and refuses production authorization. Capture
forward apply, cumulative ordering, schema/RLS/grants/triggers/functions, representative
invariants, idempotency, tenant denial, locking, and forward-recovery evidence.

Production application requires a separate named database-owner approval tied to the exact
candidate and migration-set hashes, window, monitoring plan, recovery owner, and expiry.
