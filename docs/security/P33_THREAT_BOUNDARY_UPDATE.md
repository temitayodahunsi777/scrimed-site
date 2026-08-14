# SCRIMED p.33 Threat And Boundary Update

Status: local synthetic implementation; independent security, privacy, clinical-safety, and platform review required.

## Protected Assets

- Tenant-scoped context artifacts, source hashes, consent state, and purpose-bound grants.
- Decision Evidence Ledger records and predecessor hashes.
- Regulatory Label and oversight-policy versions.
- Agent identities, capability leases, tool allowlists, budgets, and kill-switch state.
- Evaluation fixtures, expected trajectories, reviewer dispositions, and release thresholds.
- Pilot-profile eligibility evidence and exact release fingerprints.

## Trust Boundaries

1. Source ingestion to Context Fabric: input is untrusted data, never executable instruction.
2. Context Fabric to agent: tenant, purpose, section, expiry, and revocation checks apply before every view.
3. Agent task to router: capability, risk, locality, evidence, availability, and budget floors are noncompensable.
4. Router to worker: a fresh task-bound identity and active lease are required; network defaults to deny.
5. Consequential result to release: evidence, policy, qualified review, and applicable Regulatory Label must pass.
6. Local candidate to pilot or deployment: restricted profiles have no bypass and external authority remains required.

## Principal Threats And Controls

| Threat | Control | Failure state |
|---|---|---|
| Cross-tenant context access | Tenant-bound grants and retrieval checks | BLOCK |
| Purpose or section overreach | Minimum-necessary grant evaluation | BLOCK |
| Prompt or retrieved-content injection | Retrieved text cannot expand tools, network, filesystem, or authority | BLOCK |
| Evidence stripping during compression | Source spans, omissions, contradictions, and missing-information fields | REQUIRE_HUMAN or BLOCK |
| Decision-record tampering | SHA-256 predecessor chain and deterministic verification | BLOCK |
| Workflow exceeds intended use | Regulatory Label Twin conflict check | BLOCK |
| Oversight quietly decreases | Fixed sentinel cohorts, review floors, and drift detection | REQUIRE_HUMAN or BLOCK |
| Agent self-approval | Independent reviewer-role requirements | BLOCK |
| Provider or model downgrade | Qualified-route floors and explicit abstention | SAFE_REFUSAL |
| Local worker escape | Sandbox, explicit roots, tool allowlist, deny-by-default network, resource limits | BLOCK |
| Secret or PHI leakage | Digest-only evidence, redacted telemetry, prohibited-content checks | BLOCK |
| Restricted pilot bypass | Authoritative pilot-profile gate ignores unsafe environment flags | BLOCK |

## Residual Risks

- No live provider, PHI, mobile, Linux, confidential-compute, clinical-system, or production integration was exercised.
- The Context Fabric fixture is deterministic and synthetic; it does not establish clinical extraction validity.
- Ledger chaining is tamper-evident application logic, not independently anchored immutable infrastructure.
- Terminology coverage depends on caller-supplied, authorized offline snapshots.
- Named clinical-safety, security/privacy, claims/legal, technical, and platform review remains external.

## Incident Response

1. Arm emergency revocation and deny new leases.
2. Preserve trace IDs, decision-record hashes, affected-object identifiers, versions, and review state.
3. Enumerate affected records through tenant-scoped ledger lookup; do not expose raw PHI or hidden reasoning.
4. Compare policy, model, prompt, tool, build, and evidence fingerprints against the approved candidate.
5. Keep related pilot and release gates blocked until remediation, regression tests, independent review, and rollback evidence pass.

No control described here authorizes production operation, PHI processing, clinical action, payer submission, EHR writeback, deployment, or customer activation.
