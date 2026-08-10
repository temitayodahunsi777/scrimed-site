# Disposable Migration Dry-run CI

`.github/workflows/migration-dry-run.yml` provisions PostgreSQL 17 inside GitHub Actions with no
production credentials, connection, PHI, or deployment permission. The verifier rejects hosts or
database names outside its local disposable allowlist.

It verifies all migration ordering and the three pending checksums, applies the complete set,
inspects RLS/policies/functions/triggers, destroys only the disposable schemas, reapplies the set,
and compares schema fingerprints as a forward-recovery test. Focused application contracts run
afterward and evidence is retained for 14 days.

Trigger the workflow manually or through a migration-changing pull request. A successful artifact
may satisfy disposable validation only. A named database owner must still review locking,
downtime, invariants, recovery, and the exact hashes before any production migration. No workflow
step contains or accepts a production database URL.
