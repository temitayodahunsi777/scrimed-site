# SCRIMED p.33 Operator Runbook

Status: internal local-candidate procedure. It does not authorize deployment or external distribution.

## Local Verification

Use the repository's configured Node runtime and run:

```bash
npm run smoke:scrimed-p33
npm run check:scrimed-p33-artifacts
npm run typecheck
npm run lint
npm run test:nonsecret
npm run build
npm run security:secret-scan
npm run security:sbom
node scripts/check-generated-integrity.mjs
git diff --check
```

When `npm` is unavailable in the local shell, use `scripts/scrimed-local-quality-runner.mjs` with the bundled Node runtime. Record that fallback; do not imply the native package-manager path ran.

## Safe Demonstration

1. Use synthetic records only.
2. Open `/scrimed-p33` and verify the synthetic-environment, human-authority, and external-distribution boundaries.
3. Demonstrate context provenance, declared omissions, release-gate reasons, decision-ledger verification, route rationale, safe refusal, and pilot-profile blocks.
4. Keep provider calls, external outreach, submissions, clinical actions, PHI, Linux pilots, deployment, and customer activation disabled.
5. Stop the demonstration if data origin, tenant, consent, evidence, or review authority is uncertain.
6. Open `/api/scrimed-control-plane/p33/assurance` and verify G21-G25, the quality ratchet, decision chain, and five readiness profiles.

## Emergency Stop

1. Invoke emergency revocation for the affected task or worker.
2. Confirm no new capability lease is admitted.
3. Cancel bounded execution and preserve its audit receipt.
4. Record the trace, correlation ID, policy version, route decision, affected-object identifiers, and evidence-chain state.
5. Route the incident to the named security/privacy and platform owners. Add clinical-safety review when any clinical workflow is implicated.

## Rollback

- Application rollback: revert the attributable p.33 candidate commit through normal reviewed Git workflow.
- Feature rollback: disable the p.33 integrated flag and all p.33 opportunity flags; restricted pilot gates remain authoritative.
- Evidence handling: preserve ledger, review, and incident evidence; do not delete audit history.
- Data rollback: p.33 adds no database migration and executes no external mutation.
- Release rollback: revoke external-release authority and invalidate stale fingerprint-bound approval packets.

## Operator-Owned Gates

- Independent technical, clinical-safety, security/privacy, claims/legal, and platform review.
- Founder/counsel/finance review of the exact investor artifact.
- Disposable PostgreSQL migration execution and database-owner approval for existing pending migrations.
- Fresh candidate-bound AAL2 evidence.
- Supabase leaked-password protection evidence.
- Vercel exact-SHA preview authorization and smoke evidence.
- Production promotion, post-deployment evidence, and customer activation.
- PHI-capable and Linux local-agent pilot eligibility.
- G22 value-contract owner approval, G23 shadow-pilot owner approval, and G24 fresh exact-candidate attestation.

## Provider Failure And Recovery

1. Open the circuit for the failed route and stop new admissions.
2. Compare controlling family, cloud, region, accelerator, identity, network, jurisdiction, safety tier, and privacy tier.
3. Use the fallback only when it is materially independent and equally eligible; otherwise return safe refusal.
4. Preserve the route decision, failure class, retry count, latency, cost, and decision digest.
5. Re-enable the primary only after health recovery, fixed-fixture testing, and operator review.

Templates or local checks do not satisfy these gates. The gate matrix must remain `OPERATOR_REQUIRED` or `BLOCKED` until exact evidence validates.
