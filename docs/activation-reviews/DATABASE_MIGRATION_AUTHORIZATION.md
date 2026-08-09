# Database Migration Authorization

- Decision: authorize or reject exact migration hashes in one production window
- Scope/candidate/source/migration fingerprints: __________
- Relevant files: migration SQL, dry-run artifact, invariants, locking and recovery analysis
- Evidence: ordered disposable apply/replay, RLS/grant/function/trigger inspection
- Unresolved risks/conditions: __________
- Requested approval: database migration only; no application deployment authority
- Reviewer qualification: named database owner with production migration authority
- Expiry: one day or any SQL/candidate/window change
- Decision: [ ] approve [ ] reject [ ] conditional
- Reviewer name/signature/date: __________
