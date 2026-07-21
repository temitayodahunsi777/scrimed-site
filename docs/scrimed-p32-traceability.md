# SCRIMED p.32 Traceability Matrix

SCRIMED p.32 extends the existing no-PHI control plane. It does not create a second runtime, router, evidence store, benchmark platform, incident system, or approval system.

## EA Continuation Baseline

Baseline captured before the EA continuation changes on 2026-07-20:

- Base commit: `37d749c103ca1588be62740148b3dd294a35f7d2`.
- Candidate fingerprint: `c542ca3a30f2ae56552c0db77203d5a2bc40111a986d269729c68815e4154631`.
- Source fingerprint: `d2b7f6717a7ca6c335a1669f099ea12b3cf47a4a8c94395e27f01f51bfc5ad30`.
- Worktree: 146 changed entries; source review ready, strict immutable provenance ineligible while dirty.
- Baseline `npm run test:scrimed-p32`: passed.
- Prior full validation evidence: typecheck, lint, nonsecret suite, build, generated integrity, and `git diff --check` passed; the native macOS SWC binding remained unavailable and Next used its supported WASM fallback.

These fingerprints describe the pre-change local candidate only. They are not a clean release commit, immutable provenance, deployment approval, clinical validation, or customer go-live authority.

## EA Continuation Implementation Map

| Requirement | Existing owner | Continuation change | Verification | Status |
| --- | --- | --- | --- | --- |
| Hard-gated production harness | EvalCore benchmark gates, `OutcomeEvent`, release gates | Add noncompensable privacy/security/evidence gates, Pareto fitness, harness-vs-bare comparison, verified-task cost, bounded retries, correction quarantine, and ModelBOM evidence | Deterministic hard-gate, judge-failure, stream-normalization, retry-exhaustion, audit-redaction tests | Implemented locally |
| Care-context autonomy | Clinical governance, intent compiler, Capability/Execution policy | Add task-risk policy matrix for ambulatory and acute contexts with static capability ceilings and fail-closed acute-critical behavior | Table-driven context/risk and capability-elevation tests | Implemented locally |
| Memory-aware execution | SCRIMED Work model router, Clinical Assurance capacity admission | Add device profile, task budget, model resource profile, local/remote policy, runtime degradation, and simulated memory/thermal/OOM admission | Simulated device, privacy/residency, OOM, timeout, and fallback tests | Implemented locally |
| Longitudinal clinical views | Clinical Data Fabric and Context Gateway | Add provenance-preserving canonical facts, raw/compact/narrative derived views, quality scoring, and measure-owner bindings | Provenance, contradiction, unit, tenant, and serialization-equivalence tests | Implemented locally |
| Guarded payer voice/RCM | SCRIMED Work voice simulation, connector policy, revenue-cycle agent | Add feature-flagged deterministic status-retrieval state machine, transcript hashing, ambiguity queue, and proposed-writeback-only contract | Ambiguity, prohibited action, consent, retry, and no-writeback tests | Implemented locally |
| Application rationalization and vendor sentinel | Enterprise operations, dependency map, connector terms freeze | Add evidence-based disposition, retirement prerequisites, material vendor-change NO-GO, and portability review | Retirement and material-change tests | Implemented locally |
| Integrated visibility | p.32 control-plane summary and Healthcare Intelligence OS | Expose machine-readable summaries and operator-facing cards without adding a parallel dashboard | Contract check and production build | Implemented locally |

| Requirement | Existing module | Repository-native change | Verification | Compatibility / migration | Status |
| --- | --- | --- | --- | --- | --- |
| Shared consequential-action contracts | `app/lib/scrimed-work/types.ts`, audit and policy utilities | Add typed p.32 contracts that reuse the existing `ModelRouteDecision` and clinical evidence hash | Type and policy tests | Additive; no storage migration | Implemented locally |
| Clinical Search Fabric | Clinical Context Gateway and Clinical Evidence Controls | Add bounded public-reference search ranking, citation support validation, freshness, conflicts, tenant isolation, and accepted-answer cost | Missing citation, conflict, stale source, tenant isolation tests | No crawler or external provider enabled | Implemented locally |
| Trust Release Guardian / forensics | Trust and Safety Operations | Add access-controlled incident evidence bundles, ordered reconstruction, failure classification, counterfactual metadata, legal-hold and remediation controls | Timeline, redaction, review and legal-hold tests | Additive metadata; durable persistence remains separately governed | Implemented locally |
| EvidenceOps / benchmark provenance | Clinical Benchmark Suite and worst-cell release gate | Add benchmark provenance, origin-bias limitations, workflow lanes, temporal/external validation metadata, and promotion criteria | Origin-bias and worst-cell tests | Additive benchmark-card fields | Implemented locally |
| ModelFit routing | SCRIMED Work provider registry and model router | Add provider-neutral configured model aliases, health/outage input, workflow acceptance evidence, and safe fallback requirements | Provider outage, fallback and no-eligible-model tests | External provider calls remain disabled | Implemented locally |
| Intent-to-Workflow | SCRIMED Work orchestration and policy | Add typed intent compilation, content normalization, fact/inference separation, ambiguity review, and prohibited-action blocking | Malformed, streamed, contradictory and ambiguous input tests | Additive; no agent execution authority | Implemented locally |
| TrialCore enablement | Existing TrialCore surfaces and research learning loop | Add synthetic protocol/candidate review with consent, coordinator and external-randomization gates | Non-enrollment and research/care separation tests | Feature-flagged; no live trial integration | Implemented locally |
| Clinical Attention Budget | Existing operational dashboards and workflow metadata | Add role-aware attention levels, actionable evidence requirements, deduplication, cooldown and expiry | Deduplication and hard-stop validation tests | Metadata-only | Implemented locally |
| Connector Firewall | Existing data governance, tool registry and connector contracts | Add terms-version policy, read/write separation, material-change freeze, OAuth/official-API controls and audit receipts | Unsupported action and changed-terms freeze tests | No connector activation | Implemented locally |
| GrowthOS ICP compiler | Existing strategic investor and commercial-readiness modules | Add public-material-only ICP proposal with provenance, human approval, opt-out and no-send boundary | Sensitive profiling and unapproved outreach tests | Feature-flagged; no scraping or sending | Implemented locally |
| Release-gate evidence | Release Candidate Readiness and Approval Achievement graph | Add exact-fingerprint approval evidence, expiration and stale-evidence rejection, automated/external classification, and dirty-tree blocking | Stale approval and dirty-tree tests | No commit, deploy, migration or external approval mutation | Implemented locally |

## Consolidated Release-Hardening Map

| Directive | Existing owner extended | Concrete implementation | Verification / external boundary |
| --- | --- | --- | --- |
| Governed runtime | SCRIMED Work orchestration and tool registry | Candidate-bound `CapabilityManifest`, `ExecutionGrant`, stage separation, scope/budget checks, replay protection, idempotency, and digest-only receipts | Policy tests cover expiry, replay, wrong candidate, unknown tools, prohibited actions, and redaction. Consequential authority remains unavailable. |
| Clinical-data complexity | p.32 canonical clinical views | Complexity assessment and safe serialization selector refuse compact views when clinically material facts would exceed validated capacity | Synthetic complex-patient tests require a complete validated representation or `SAFE_REFUSAL`. |
| Multimodal provenance | Clinical Data Fabric contracts | Typed normalized facts retain source digest, extraction/version/location, confidence, terminology, transformation history, corrections, conflicts, and tenant | Low-confidence/conflicting facts require review; cross-tenant access is denied. No clinical extractor or external integration is activated. |
| Artifact ledger | Existing audit and artifact evidence controls | Stable document identity, immutable parent revisions, SHA-256 content identity, tamper-evident chains, backup verification, recoverable trash and restore | Deterministic tests cover hash changes, backup mismatch, tenant isolation, trash, and restore. Durable external storage remains separately governed. |
| Release-gate semantics | p.32 release-gate registry | Exact `PASS`, `FAIL`, `BLOCKED`, `OPERATOR_REQUIRED`, and `NOT_APPLICABLE` states plus fingerprint-bound operator instructions | Stale, rejected, expired, malformed, or mismatched evidence fails. Missing irreducible approval remains operator-required; no template self-approves. |
| Secure RepoOps | Existing CI and release tooling | CODEOWNERS routing, Dependabot, dependency review, CodeQL, candidate secret scan, deterministic CycloneDX-compatible SBOM, migration evidence packet, and `DeveloperSessionReceipt` | Remote GitHub controls remain unverified until an authorized operator confirms settings. Migration packet is static until a disposable-database dry run and database-owner review occur. |
| Candidate validation | Existing release candidate validator | Secret scan, SBOM, migration evidence, typecheck, lint, nonsecret tests, build, generated integrity, and worktree whitespace checks are bound into the candidate validation path | Final fingerprints must be regenerated after the final source mutation. A dirty worktree remains ineligible for immutable provenance. |
| Protected p.32 evidence issuance | Existing AAL2 governance context, retained QA evidence, release-gate verifier, and protected pilot store | Add a disabled-by-default Ed25519 issuer that signs only exact-candidate `aal2-cli-evidence` after current retained QA validation, then records an append-only tenant receipt with one-use idempotency and audit chaining | Pure policy tests verify signature interoperability and fail-closed candidate, evidence, role, replay, and configuration paths. The migration is present but unapplied; no key was provisioned and no live issuance occurred. |

## Preserved Boundaries

- Synthetic, public, deidentified, or metadata-only inputs are the only enabled paths.
- Live PHI, autonomous diagnosis or treatment, enrollment, patient outreach, payer submission, EHR writeback, production migration, certification claims, and customer go-live remain blocked.
- External providers, connectors, trial systems, crawling, prospecting, and consequential writes remain unavailable unless separately configured, authorized, tested, and approved.
- A passing automated test is technical evidence only. It is not legal, clinical, privacy, regulatory, security-assurance, deployment, or customer authorization.

## EA Continuation Validation Evidence

The following validation snapshot was completed locally on 2026-07-20 immediately before this documentation record was added:

- Base commit: `37d749c103ca1588be62740148b3dd294a35f7d2`.
- Candidate fingerprint: `65ced7ad65b6f293`.
- Source fingerprint: `0bce05158d9a151c`.
- Investor-deck artifact fingerprint: `35dfc23f60cee1eb`.
- Automated-validation evidence fingerprint: `4bf2767d948e42cb`.
- Candidate-review packet fingerprint: `8fcd82c56416d83b`.
- p.32 gate-evidence packet fingerprint: `e945faa8990318d2`.
- Review surface: 154 reviewable files across 11 reviewer lanes; no rejected files.
- Automated candidate validation: six of six checks passed with one retained warning, `next-swc-native-binding-unavailable-wasm-fallback`.
- Release evidence: 14 gates total, zero passed, eight blocked, six operator-required, zero expired.

That snapshot was ready for named review, not release promotion. Because this documentation update changes the dirty candidate, operators must regenerate the candidate manifest, validation evidence, and review packet before review. The worktree remains ineligible for immutable provenance, and no external approval is inferred from this evidence.
