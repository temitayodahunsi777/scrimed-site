# Clinical Assurance Kill-Switch Runbook

## Trigger

Use for a compromised, withdrawn, unsafe, expired, materially changed, or incorrectly authorized model/tool artifact.

## Controlled Procedure

1. Confirm incident identity, exact model/tool digest, affected workflows, tenants, enclaves, and evidence reference.
2. Require an authenticated security or trust-governance operator and a second approver.
3. Append a global or workflow-scoped kill-switch event; do not mutate historical CaseEvidence.
4. Reject new traffic before routing and preserve a clear blocked decision.
5. Pause affected queues. Do not silently substitute another model.
6. Evaluate the approved independent fallback against CAL, tenant, region, domain cell, capacity, and concentration policy.
7. If no eligible fallback exists, move work to human handoff.
8. Reconcile decision and CaseEvidence continuity; verify no raw PHI or secret entered telemetry.
9. Require reauthorization, signed artifacts, evaluation, canary, monitoring, and tested rollback before clearing the switch.

## Current Automation Boundary

The repository supports deterministic synthetic drills only. It does not rotate credentials, mutate production registries, activate providers, or resume clinical work automatically.
