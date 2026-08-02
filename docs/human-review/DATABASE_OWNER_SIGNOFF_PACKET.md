# Database Owner Sign-Off Packet

- **Decision:** First authorize/review disposable dry run; later separately decide production use.
- **Why needed:** Migration locking, recovery, RLS and operational risk need accountable ownership.
- **Candidate fingerprint:** `[FINAL 64-HEX; current dirty worktree has none]`
- **Scope:** exact three migrations and hashes in the pending-migration manifest.
- **Evidence:** static packet, disposable preflight report, schema/RLS/grant/trigger/invariant output.
- **Residual risks:** executable dry run has not occurred; lock duration and recovery are unverified.
- **Recommended disposition:** AUTHORIZE DISPOSABLE DRY RUN ONLY; defer production.
- **Conditions:** isolated local stack, synthetic fixtures, exact token, no shared/production target.
- **Approval text:** “I authorize the exact migration set for isolated disposable testing only.”
- **Rejection text:** “I reject/defer the migration set because: ____.”
- **Expiry:** 7 days or migration/candidate/database-version change.
- **Qualification:** Named database owner with schema, RLS, recovery, and production authority.

Reviewer name: __________ Signature: __________ Date: __________
