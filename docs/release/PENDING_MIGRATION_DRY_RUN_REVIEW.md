# Pending Migration Dry-Run Review

**Current decision:** READY FOR DISPOSABLE DATABASE DRY RUN ONLY

The pending migration order and registered SHA-256 values validate statically. Repository SQL
security checks confirm private schemas, RLS declarations, public/anonymous privilege revocation,
and bounded `security definer` search paths for the three migrations. No production migration or
production database mutation was executed.

| Order | Migration | Purpose | Current classification |
| --- | --- | --- | --- |
| 1 | `20260718153148_clinical_assurance_control_plane.sql` | Private append-only clinical assurance evidence | READY FOR DISPOSABLE DRY RUN |
| 2 | `20260721173000_p32_evidence_attestation_issuances.sql` | Candidate-bound AAL2 evidence issuance receipts | READY FOR DISPOSABLE DRY RUN |
| 3 | `20260722120000_p32_candidate_review_control_plane.sql` | Independent review assignments and decisions | READY FOR DISPOSABLE DRY RUN |

## CI Evidence Required

`.github/workflows/migration-dry-run.yml` creates disposable PostgreSQL 17, applies the complete
migration set, inspects tables, indexes, constraints, grants, RLS, policies, functions, and
triggers, resets the disposable schemas, reapplies the set, and verifies the recovered schema
fingerprint. It emits `artifacts/migrations/migration-dry-run.json`.

The dry run must pass before the database owner evaluates a production authorization. Production
authorization must bind the exact candidate, all three checksums, environment, window, rollback
owner, and expiry. `DRY_RUN_PASSED` would still not mean production application is authorized.

## Recovery Posture

The migrations create append-only control-plane data. Forward recovery is preferred: keep feature
flags off, revoke affected RPC execution, preserve evidence according to retention requirements,
and apply a separately reviewed corrective migration. Destructive rollback is not preauthorized.
