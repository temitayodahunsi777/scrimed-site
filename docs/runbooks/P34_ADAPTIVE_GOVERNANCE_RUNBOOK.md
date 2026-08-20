# SCRIMED p.34 Adaptive Governance Runbook

Status: local synthetic operation only. This procedure does not authorize deployment, migration, provider calls, PHI, clinical use, DICOM export, customer activation, or external distribution.

## Incident And Rollback

1. Cancel the affected task and deny new controlled-action stages.
2. Open the provider/tool circuit and preserve tenant, trace, correlation, route, policy, approval, artifact, and predecessor hashes.
3. Verify the governance chain and identify the first mismatched record without exposing source content.
4. Re-run the fixed synthetic regression case against the exact historical policy/harness/tool versions.
5. Classify capability, input, context, retrieval, model, tool, policy, approval, infrastructure, or exceptional-case failure.
6. Roll back through reviewed Git workflow or disable the p.34 safe-evaluation feature flag. High-risk flags remain off.
7. Keep promotion blocked until correction, regression, independent review, and rollback evidence pass.

## Clinical Escalation

Stop automation and route to the named qualified human when evidence is missing, stale, contradictory, unsupported, patient-specific, time-critical, outside intended use, or potentially consequential. The platform cannot diagnose, treat, prescribe, triage, message a patient, submit to a payer, or mutate an EHR/device.

## Model Or Provider Change

1. Add a disabled registry entry with exact provider/model/harness/artifact identity.
2. Record official capability and contractual evidence; unknown fields remain denied.
3. Run conformance, fixed evaluations, worst-cell review, cost/latency tests, outage/fallback tests, and privacy/security review.
4. Require named human promotion approval and rollback readiness.
5. Never silently substitute the route or reduce the required safety tier.

## Workflow Admission

1. Validate the exact versioned workflow contract before planning or routing.
2. Stop when owner, intended use, baseline, outcome/safety KPIs, sources, classification, locality, authority, approval, rollback, or fresh release evidence is missing.
3. Revalidate provider task fit, local evidence, context capacity, residency, license, interoperability, and health.
4. Record any cost or latency degradation justification; safety, privacy, authorization, and critical-error floors cannot be degraded.
5. Fail closed when no eligible route remains.

## Action And Rollback

1. Advance only one permitted action-maturity state at a time.
2. Bind each transition to actor, authority, input/result hashes, policy, timestamp, idempotency key, predecessor, and rollback state.
3. Require a fresh, independent, exact candidate/payload approval before `AUTHORIZED_EXECUTION`.
4. Reject approval replay, duplicate attempts, transition skips, self-approval, and every external system-of-record write in this candidate.
5. Record `VERIFIED_OUTCOME` only with result evidence; record failures and reversals with rollback disposition.

## Pilot Expansion

1. Fix the synthetic cohort, duration, thresholds, and evidence expiry before evaluation.
2. Check completion, verified outcomes, critical errors, overrides, rollback, review burden, abandonment, latency, and cost per completed workflow.
3. Require named clinical, privacy/security, and operational approval tied to fresh evidence.
4. Treat a passing result as review eligibility only. Expansion remains disabled until a separate authorized release decision.

## Continuity And Public-Sector Evidence

Record only hashed relationship and event references. Route transfers, unresolved interruptions, and long gaps to human work queues. Do not infer causality, treatment benefit, or therapeutic effect. Public-sector readiness requires documentary security, residency, auditability, accessibility, procurement, and contract-vehicle evidence; never infer certification, authorization, compliance, or purchasing eligibility.

## Challenger Evaluation

Keep challenger interfaces disabled and non-PHI. Record vendor claims as unverified research inputs, then use fixed fixtures, seeds, harness digests, license evidence, infrastructure evidence, quality, instruction following, tool accuracy, latency, cost, and reliability. Local reproduction only permits named review; it does not register or promote a production model.

## DICOM De-identification

1. Preserve the source object unchanged and hash it.
2. Select an approved, versioned confidentiality profile.
3. Validate transfer syntax and metadata structure.
4. remove configured identifiers and all private tags in the derived representation.
5. Quarantine pixel data when burned-in annotation is present or uncertain.
6. Emit hash-only before/after manifests and retain operator/policy/time/disposition evidence.
7. Require qualified human approval before any export or research use. Metadata removal alone is insufficient evidence of anonymization.

## Local Verification

Run `npm run test:scrimed-p34`, `npm run test:scrimed-p34-workflow-continuity`, `npm run contract:scrimed-p34`, `npm run check:scrimed-p34-artifacts`, then the full nonsecret, typecheck, lint, build, secret, SBOM, generated-integrity, and diff checks. Use the repository direct-Node runner when shell `npm` is unavailable and report that environment limitation.
