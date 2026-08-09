# ADR 0001: Clinical Assurance, Sovereign Enclaves, and Concentration Budgets

- Status: Accepted for synthetic control-plane implementation
- Date: 2026-07-18
- Owners: Platform Reliability, Trust Governance, Clinical Safety

## Context

Provider names and aggregate benchmark scores do not prove that a model route is authorized, safe for a material subgroup, available under load, contractually eligible, sovereign, or independently recoverable. SCRIMED needs one preflight path that treats exact artifacts, policy, evidence, capacity, dependencies, and human control as a single authorization decision.

## Decision

SCRIMED will use:

1. Internal CAL classifications to express increasing isolation and authorization requirements.
2. Sovereign Clinical Enclaves to bind tenant, jurisdiction, data, identity, model, tool, network, storage, and recovery policy.
3. Immutable Model and Capacity Passports for exact-version and admission evidence.
4. A Critical Dependency Map and Concentration Budgets to detect correlated supplier risk.
5. Worst-cell evaluation as a mandatory model eligibility gate.
6. Explicit route outcomes: allow, queue, human handoff, or block.
7. CaseEvidence and tamper-evident audit binding for every decision.

## Consequences

- Model replacement and fallback cannot be silent.
- Routes that share a material dependency are not independent.
- An expired concentration exception blocks new deployment but does not abandon in-flight work; safe handoff applies.
- CAL-2/3 require default-deny egress and isolated scopes.
- Policy data, clinical data, model artifacts, and evidence/audit remain logically separable.
- This design increases registry and review work, but reduces untraceable runtime authority and supplier concentration risk.

## Rejected Alternatives

- Route by token price or public leaderboard score.
- Treat separate model brands as independent without dependency evidence.
- Allow automatic provider downgrade during incidents.
- Promote on aggregate scores while a material subgroup fails.
- Persist mutable authorization rows without an event trail.

## Current Boundary

Only synthetic CAL-0 evaluation is active. Higher assurance levels require external infrastructure, contracts, keys, recovery testing, security review, clinical governance, and explicit release approval.
