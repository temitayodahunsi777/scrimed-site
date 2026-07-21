# Clinical Assurance Deployment Readiness Checklist

## Code and Evidence

- [ ] Exact release SHA and provenance are recorded.
- [ ] Typecheck, lint, nonsecret tests, assurance policy tests, migration contract, and build pass.
- [ ] Every promoted model/tool artifact is signed and has SBOM/ML-BOM plus dependency and malware scan evidence.
- [ ] Every mandatory domain cell passes; sparse cells are restricted.
- [ ] Rollback and kill-switch paths are tested.

## Enclave and Privacy

- [ ] Tenant, purpose of use, CAL, jurisdiction, region, and data classifications are approved.
- [ ] BAA/DPA and provider data-use/retention terms are approved where required.
- [ ] Cache, vector index, telemetry, logs, retention, and control/data/artifact/evidence planes are isolated.
- [ ] CAL-2/3 egress is default-deny and operator access is restricted.
- [ ] No raw PHI, prompt, connector payload, token, or credential enters telemetry.

## Capacity and Continuity

- [ ] Capacity passport includes contracted, reserved, observed, and admitted throughput.
- [ ] p95/p99 latency, queue age, error rate, and incidents are monitored.
- [ ] Primary and fallback routes are materially independent.
- [ ] Concentration budgets and any time-limited exceptions are approved.
- [ ] Supplier-withdrawal and enclave-recovery drills meet declared RTO/RPO.

## Human and Release Approval

- [ ] Named platform, security, privacy, clinical, and operational owners approve.
- [ ] Human handoff and reviewer queues are staffed and tested.
- [ ] Canary scope, blast radius, observability, cancellation, and rollback are approved.
- [ ] No production, customer, clinical-validation, or certification claim exceeds approved evidence.
- [ ] Consequential actions remain disabled until a separate workflow-specific authorization exists.

Current status: synthetic CAL-0 control-plane evaluation only. Live PHI and consequential production behavior remain NO-GO.
