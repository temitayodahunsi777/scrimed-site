# ADR: p.34 Adaptive Governance Extends p.33

Status: accepted for local candidate implementation; independent review pending.

## Decision

Extend the p.33 Context Fabric, exact-action policy, Decision Evidence Ledger, provider-dependency model, and quality ratchet. Add a p.34 composition layer instead of introducing a second orchestration, policy, ledger, or evaluation platform.

The router uses a fixed technique order: validation/rules, deterministic transformation, graph traversal, optimization/conventional ML, retrieval/reranking, generative model, then human escalation. Capability admission remains separate from task selection and denies unknown, disabled, unverified, expired, revoked, out-of-region, over-budget, or disallowed routes.

DICOM privacy is implemented as a synthetic metadata adapter with versioned policy and hash-only manifests. No parsing dependency is added because the candidate does not have an admitted, reviewed DICOM parser. A future production adapter must conform to the same contract and pass dependency, license, SBOM, security, imaging privacy, and clinical review.

## Consequences

- Existing p.33 behavior remains backward compatible.
- Provider and model identifiers remain configuration data rather than clinical logic.
- Deterministic methods can satisfy bounded tasks without model calls.
- Governance evidence reuses the established predecessor chain and binds richer details by hash.
- No database migration, external provider, DICOM export, PHI, or production authority is introduced.
- Production adapters and PHI-capable modes remain blocked pending external evidence and authorization.
