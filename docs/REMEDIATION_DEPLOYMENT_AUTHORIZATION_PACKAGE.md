# Remediation Deployment Authorization Package

This package prepares an exact-candidate handoff. It does not authorize deployment.

## Candidate Binding

Because a Git commit cannot contain its own commit hash, authoritative values must be captured
from the clean candidate after commit:

```bash
git rev-parse HEAD
git rev-parse HEAD^{tree}
node scripts/release-candidate-manifest.mjs --strict --json
node scripts/release-candidate-validation.mjs --strict --json
node scripts/release-candidate-review-packet.mjs --strict --json
node scripts/scrimed-p32-release-gate-evidence.mjs --strict --operator-packet
node scripts/scrimed-sbom.mjs --verify
node scripts/pending-migration-authorization-check.mjs --strict --json
```

The deployment authorization must bind to the resulting commit, tree/source, candidate,
validation, review, gate, SBOM, migration-set, and artifact fingerprints.

## Environment Changes

The new operating-mode variables must retain their fail-closed defaults:

- `SCRIMED_SYNTHETIC_ONLY=true`
- `SCRIMED_ALLOW_PHI=false`
- `SCRIMED_LIVE_CLINICAL_EXECUTION=false`
- `SCRIMED_PRODUCTION_EHR_CONNECTIONS=false`
- `SCRIMED_MEDICAL_DEVICE_CONNECTIONS=false`
- `SCRIMED_EMERGENCY_MONITORING=false`
- `SCRIMED_AUTONOMOUS_TREATMENT_ACTIONS=false`
- `SCRIMED_AUTONOMOUS_ELIGIBILITY_DECISIONS=false`
- `SCRIMED_AUTONOMOUS_PAYER_DECISIONS=false`
- `SCRIMED_FAITH_AFFECTS_CLINICAL_LOGIC=false`

No variable authorizes PHI, connectors, clinical execution, payer submission, EHR writeback,
migration, certification claims, or customer activation.

## Database Decision

Three migrations are statically `READY` for an authorized disposable-database dry-run only.
Production application remains blocked. See `docs/PENDING_MIGRATION_AUTHORIZATION_PACKET.md`.

## Pre-Deployment Checklist

1. Clean candidate commit exists and strict provenance passes.
2. Named reviewers approve the exact candidate and review packet.
3. Founder/counsel decisions affecting published policy are recorded.
4. Supabase leaked-password warning is resolved.
5. Wix metadata and blog excerpt are corrected and independently verified.
6. Migration owner records a dry-run and explicit apply/defer decision.
7. Security, Privacy, Clinical/Regulatory, Legal, and Deployment owners approve exact scope.
8. Vercel environment values are reviewed without exposing values.
9. Rollback owner, window, monitoring, and expiration are recorded.

## Deployment Workflow

Use the repository's normal reviewed Git/Vercel workflow for the exact approved commit. Do not
use an ad hoc local production deployment. A deployment owner must record the workflow/run URL,
environment, actor, authorization reference, and deployed commit.

## Post-Deployment Verification

- `/`
- `/validation-evidence`
- `/legal`
- `/legal/privacy`
- `/legal/terms`
- `/legal/cookies`
- `/legal/healthcare-ai-disclaimer`
- `/api/operating-mode`
- `/api/public-release-status`
- `/api/validation-evidence`
- `/pilot`

Run public smoke, protected API fail-closed checks, desktop and 390px visual checks, canonical
and prohibited-string verification, no-PHI log review, dependency health, and exact deployed
commit comparison. Post-deployment evidence must remain blocked until an authorized deployment
actually occurs.

## Rollback

1. Stop rollout and preserve incident/audit identifiers.
2. Restore the previously verified Vercel deployment.
3. Keep consequential operating-mode flags false.
4. Do not roll back an append-only database ledger destructively; disable features and use an
   approved forward-recovery migration.
5. Rerun health, public, protected-denial, and no-PHI checks.
6. Record rollback actor, reason, prior/new deployment IDs, timestamps, and verification.

No push, merge, deployment, migration, production mutation, or customer activation is
authorized by this document.
