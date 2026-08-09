# Sovereign Clinical Enclave Recovery Runbook

## Preconditions

- Named incident owner and second approver
- Verified tenant and enclave identity
- Signed registry/configuration export
- Customer-controlled key procedure where configured
- Tested independent recovery target
- Declared SLO, RTO, and RPO

## Procedure

1. Freeze new traffic and preserve append-only audit state.
2. Confirm the incident scope and prevent cross-tenant or cross-enclave cache, index, log, and telemetry reuse.
3. Verify recovery artifacts, signatures, SBOM/ML-BOM, dependency scans, and policy version.
4. Restore control, data, artifact, and evidence/audit planes to their separate approved scopes.
5. Restore keys using the authorized external key-management procedure.
6. Validate tenant, jurisdiction, region, network egress, operator access, retention, and capacity policy.
7. Run synthetic contract and recovery probes before any restricted workload.
8. Reconcile audit continuity and measure RTO/RPO.
9. Resume only after security, privacy, clinical governance, platform reliability, and tenant approval.

CAL-3 is not activated by this repository batch. Recovery requires customer infrastructure and independently witnessed testing.
