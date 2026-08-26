# Node 24 Rollback Plan

## Previous State

- Runtime target: Node.js `22.x` in Vercel project settings
- Exact preserved source: `b2db37e7966ce00b2a7d783e712607a560e1097c`
- Preserved branch: `agent/scrimed-p33-integrated-upgrades`
- Production deployment: not authorized by this migration

## Rollback Triggers

- Node 24 build failure or native-addon incompatibility
- Route-count or static-generation drift without an explained source change
- Evidence or candidate fingerprint semantic drift
- p.33 policy, kill-switch, routing, AAL2, lockbox, public-claims, or fail-closed regression
- Preview runtime errors, hydration failures, material performance regression, or protected API authority expansion

## Procedure

1. Do not promote the Node 24 preview.
2. Preserve build logs, runtime errors, certification output, and exact deployment ID.
3. Restore Vercel Node setting to `22.x` only if it was changed.
4. Repoint no production domain; this migration never authorizes domain mutation.
5. Use preserved commit `b2db37e7966ce00b2a7d783e712607a560e1097c` for local comparison.
6. Re-run p.33 policy/contract checks, nonsecret tests, build, generated integrity, and public smoke under the restored runtime.
7. Record the rollback reason and remediation owner before another Node 24 attempt.

No database rollback is part of this plan because all pending migrations remain unapplied.
