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

## DICOM De-identification

1. Preserve the source object unchanged and hash it.
2. Select an approved, versioned confidentiality profile.
3. Validate transfer syntax and metadata structure.
4. remove configured identifiers and all private tags in the derived representation.
5. Quarantine pixel data when burned-in annotation is present or uncertain.
6. Emit hash-only before/after manifests and retain operator/policy/time/disposition evidence.
7. Require qualified human approval before any export or research use. Metadata removal alone is insufficient evidence of anonymization.

## Local Verification

Run `npm run test:scrimed-p34`, `npm run contract:scrimed-p34`, `npm run check:scrimed-p34-artifacts`, then the full nonsecret, typecheck, lint, build, secret, SBOM, generated-integrity, and diff checks. Use the repository direct-Node runner when shell `npm` is unavailable and report that environment limitation.
