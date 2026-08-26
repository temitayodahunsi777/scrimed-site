# ADR: p.34 Adaptive Governance Extends p.33

Status: accepted for local candidate implementation; independent review pending.

## Decision

Extend the p.33 Context Fabric, exact-action policy, Decision Evidence Ledger, provider-dependency model, and quality ratchet. Add a p.34 composition layer instead of introducing a second orchestration, policy, ledger, or evaluation platform.

The router uses a fixed technique order: validation/rules, deterministic transformation, graph traversal, optimization/conventional ML, retrieval/reranking, generative model, then human escalation. Capability admission remains separate from task selection and denies unknown, disabled, unverified, expired, revoked, out-of-region, over-budget, or disallowed routes.

DICOM privacy is implemented as a synthetic metadata adapter with versioned policy and hash-only manifests. No parsing dependency is added because the candidate does not have an admitted, reviewed DICOM parser. A future production adapter must conform to the same contract and pass dependency, license, SBOM, security, imaging privacy, and clinical review.

Workflow admission, model-fit selection, action maturity, expansion, continuity, public-sector evidence, challenger evaluation, and ROI telemetry are composed into this same p.34 layer. They reuse p.33 exact-action approvals and decision evidence and p.34 capability admission. Action-state and continuity records are hash-addressed application evidence, not a new orchestration engine or database.

The clinical operating-system hardening follows the same extension rule. Review-only A0-A3 approval evaluation, PHI/secret boundaries, sandbox policy review, authenticated clinical retrieval, external validation, oversight drift, patient education, coding, recovery, and public-claim review are deterministic policy services composed through the existing p.34 summary and catch-all control plane. The synthetic token vault and sandbox policy are replaceable adapters, not a second persistence or execution platform. The candidate deliberately has no trusted atomic approval store or runtime containment adapter, so neither exact approvals nor compliant sandbox policy authorize execution.

## Consequences

- Existing p.33 behavior remains backward compatible.
- Provider and model identifiers remain configuration data rather than clinical logic.
- Deterministic methods can satisfy bounded tasks without model calls.
- Governance evidence reuses the established predecessor chain and binds richer details by hash.
- No database migration, external provider, DICOM export, PHI, or production authority is introduced.
- Production adapters and PHI-capable modes remain blocked pending external evidence and authorization.
- Workflow completeness and fresh evidence are prerequisites for routing.
- Public benchmark position, observational continuity associations, and vendor performance claims cannot grant authority.
- Challenger evaluation, trust expansion, public-sector claims, PHI, external providers, and consequential execution remain disabled by default.
- Internal validation cannot qualify clinical production, success metrics cannot lower oversight automatically, and patient/coding drafts cannot become delivery or billing actions without separately authorized pathways.
