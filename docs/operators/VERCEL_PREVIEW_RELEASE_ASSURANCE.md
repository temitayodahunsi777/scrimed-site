# Vercel Preview Release Assurance

## Purpose

This control proves that a non-production preview serves one exact candidate with SCRIMED's
synthetic-only, no-PHI, no-live-clinical boundaries intact. It does not authorize production
promotion, customer activation, migration, provider calls, or external distribution.

## Required Evidence

1. The preview is built with `SCRIMED_BUILD_COMMIT_SHA` set to the exact 40-character candidate
   commit and `VERCEL_ENV=preview`.
2. `/api/build-info` returns that exact commit and denies production/customer authority.
3. `/api/health` reports `synthetic-no-phi`.
4. `/api/readiness` reports `ready-synthetic-read-only` and all consequential flags remain off.
5. Required routes return a successful status without redirect loops.
6. Desktop and exact 390px browser evidence contains no console errors or HTTP 5xx responses.
7. Public HTML contains the synthetic/no-PHI boundary and none of the prohibited claims.

Run:

```bash
node scripts/verify-preview-ui.mjs --strict \
  --base-url=https://<preview-host> \
  --canonical-origin=https://app.scrimedsolutions.com \
  --output-dir=artifacts/ui-verification

node scripts/verify-vercel-preview.mjs --strict --json \
  --base-url=https://<preview-host> \
  --candidate-sha=<exact-candidate-commit> \
  --ui-evidence=artifacts/ui-verification/preview-ui-verification.json
```

The verifier writes `artifacts/vercel/vercel-preview-evidence.json`. Retain it with the source
manifest and review packet. A stale deployment, missing browser evidence, unsafe flag, candidate
mismatch, or claim violation fails closed.

## Rollback

Disable or delete only the authorized preview deployment and revoke preview-scoped credentials.
Do not alter the production alias. Preserve the evidence report and incident reason. No database
rollback is expected because preview validation must use mock or disposable data only.
