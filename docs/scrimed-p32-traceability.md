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
| Role-specific health conversation fabric | Clinical Context Gateway, CareExplain, MyVitals AI, Sanar AI, Perfect Chart | Separate identities, memories, tools and actions; add revocable cross-domain grants and approved encounter briefs | Cross-context, revocation, role, approval and overbroad-scope tests | Implemented locally |
| Contained AgentOps | Governed runtime, Agent Commander, audit and model gateway | Add tenant-isolated environments, default-deny egress, short-lived workload identity, capability leases, scrubbed snapshots, fork narrowing, causal trace and emergency stop | Egress, snapshot, fork, lease, trace and revocation tests | Implemented locally; production runtime external |
| Ambient and patient-controlled records | Ambient Scribe, patient context gateway and artifact evidence | Add consent, retention, clinician edit/signoff, revocable data grants and source-preserving timeline contracts | Signoff, expiry/deletion and grant-revocation tests | Implemented locally; no durable migration |
| Trial failure and biological research | TrialCore, ResearchOps and evidence controls | Add classified evidence, contradiction and hypothesis review plus deterministic research-only biological similarity and study-level holdouts | Fact/hypothesis, contradiction, judge independence, leakage and clinical-boundary tests | Implemented locally; external adapters disabled |
| Imaging and MRD controls | Imaging Workflow Intelligence and Onco-ID | Add model cards, DICOM contracts, site validation, queue safeguards, radiologist override and assay comparability | Queue admission/delay/override and incompatible-assay tests | Implemented locally; recommendation only |
| Provider conformance | Existing provider registry and ModelFit router | Add exact artifact manifests, conformance runs, task evaluation, promotion and rollback evidence; disabled open-model evaluation profiles | Leaderboard, conformance failure, fallback and abstention tests | Implemented locally; no provider calls |
| Network and prior-authorization intelligence | Operations intelligence and documentation-before-authorization | Preserve facility/subgroup variance and add proportionality and burden evidence packets with hard payer-mutation blocks | Variance visibility and no-submission/no-mutation tests | Implemented locally |

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

That snapshot is historical and did not grant release promotion. The current clean candidate must
always be identified through freshly generated candidate, validation, review, and assurance
fingerprints. No external approval is inferred from either snapshot.

## Consolidated p.32 Governance P0

This P0 slice extends the existing SCRIMED Work runtime, clinical evidence controls, EvalCore worst-cell policy, agent execution, provider registry, and release-gate framework. It does not introduce a second orchestrator, approval store, model router, or release authority.

The canonical additions are `TaskScopedToolContract`, `ContextCoverageManifest`, `EvidenceSynthesisRecord`, `EvidenceLedger`, `AgentRiskProfile`, `AgentExecutionReceipt`, `ClinicalResponseEvaluation`, `DeidentificationRiskAssessment`, `DeidentificationRelease`, `GovernedSkillRunbook`, `ModelChangeSet`, `WorkloadPlacementDecision`, `ProtectionLevelAgreement`, `PostImplementationReview`, `CorrectableClinicalOutput`, and `DecisionProvenanceRecord`.

| Requirement | Existing component | Files changed | Verification | Gate identifier | Status | Activation / rollback |
| --- | --- | --- | --- | --- | --- | --- |
| Minimum-necessary tool authority | `CapabilityManifest`, `ExecutionGrant`, tool registry | `app/lib/scrimed-work/p32GovernanceRecords.ts`, `p32ApprovedActions.ts` | Wildcard, field, row, destination, tenant, expiry, and replay tests | `TOOL-MIN-01`, `ACT-01` | implemented | Kernel is always fail-closed; remove caller integration only, retain receipts |
| Context coverage and parity | Clinical Context Gateway and context engine | `p32GovernanceRecords.ts` | Missing/stale/parity/source-span tests | `CTX-PARITY-01`, `summary:clinician-model-source-parity` | implemented | Synthetic/deidentified use only; stale or asymmetric context returns review/block |
| Evidence semantics | Clinical Evidence Controls | `p32GovernanceRecords.ts` | FACT source requirement, contradiction, stale/insufficient tests | `EVID-GRADE-01` | implemented | Draft/review only; rollback to prior evidence builder without deleting evidence |
| Agent risk and receipts | Governed runtime and contained AgentOps | `p32GovernanceRecords.ts`, `p32ApprovedActions.ts` | Self-assessment, self-approval, digest/redaction, execution-grant tests | `IAM-01`, `CHN-01`, `risk_tier_cannot_self_escalate` | implemented | Revoke lease/grant and preserve causal receipts |
| Clinical evaluation | Production Harness and Worst-Cell EvalCore | `p32GovernanceRecords.ts` | Hard failure, subgroup, worst-cell, LLM-only judge tests | `RESP-EVAL-01`, `eval:trace-and-artifact-completeness` | implemented | Promotion remains false; restore prior admitted model |
| De-identification refusal | On-device de-identification scaffold and privacy policy | `p32GovernanceRecords.ts` | Missing qualified signature and externally verified signature tests | `PRIV-DEID-01`, `PRIV-UTILITY-01` | partially implemented | Synthetic local evaluation only; qualified external expert and policy remain required |
| Correctability | Artifact review and learning-loop quarantine | `p32GovernanceRecords.ts` | Accept/edit/reject/reroute/escalate, immutable original, downstream provenance, no self-training tests | `IMP-01`, `clinical_output_requires_correction_path`, `correction_cannot_self_train` | implemented | Corrections stay quarantined; no online behavior update |
| Skill/model change governance | Foundry and provider registry | `p32GovernanceRecords.ts` | Unsigned skill, self-owned skill, self-approved model change tests | `SKILL-ADM-01`, `model_update_requires_revalidation` | implemented | Skills/models stay unadmitted; restore exact rollback target |
| Shared approved-actions policy | Governed runtime and care-context policy | `p32ApprovedActions.ts` | UI/chat/voice parity, browser bypass, prohibited action, valid/replayed mutation tests | `ACT-01`, `ESC-01`, `multiagent_cannot_circularly_approve` | implemented | All channels call the same kernel; execution still requires existing runtime grant |
| Technical gate report | Existing p.32 release registry | `p32TechnicalGates.ts`, gate CLI | Exact fingerprint, tamper, safe-development, production fail-closed tests | All consolidated technical IDs | implemented | Development requires all 66 automated gates; production authority remains false |
| External approvals | Existing fingerprint-bound release evidence | Canonical release registry unchanged | Technical registry refuses to self-approve external evidence | 13 external gate IDs | blocked-external | `PENDING_HUMAN`; complete only through the existing named operator/reviewer workflow |

## Consolidated p.32 Control-Plane Closure

| Requirement | Reused owner | Additive implementation | Test evidence | Status |
| --- | --- | --- | --- | --- |
| Agent jobs and delegation | Governed runtime, contained AgentOps | `p32AgentGovernance.ts` adds `AgentJobManifest`, `ApprovedActionRegistry`, `DelegationEnvelope`, `HumanOversightPlan`, and `ReviewerCapacityBudget` | Bounded jobs, circular delegation, emergency stop, named competence, and overload pause | Implemented locally |
| Artifact admission and rollback | Provider registry, artifact ledger, ModelFit | `p32ArtifactAdmission.ts` adds exact multi-artifact manifests, independent attestations, and tested rollback admission | Unsigned/revoked/self-attested/production artifact denial and nonproduction admission | Implemented locally |
| Long-lived evidence and decisions | Context coverage, evidence synthesis, artifact review | `EvidenceLedger` and `DecisionProvenanceRecord` bind sources, original outputs, reviewer competency, corrections, downstream actions, and supersession | Digest-only ledger, original preservation, escalation, and no self-training | Implemented locally |
| De-identification risk | Privacy policy and de-identification release | `DeidentificationRiskAssessment` records technical risk and utility measurements without a legal conclusion | Test-only and missing-expert evidence remain blocked | Implemented locally; external expert remains required |
| Versioned interoperability | Existing standards registry and conformance controls | `p32InteroperabilityControls.ts` adds lossless mapping, migration runbook, reconciliation, access-mode, browser, and lifecycle gates | Unknown-field/provenance round trip, structured-write block, browser bypass block, retirement evidence block | Implemented locally |
| Consent, engagement, launch, and value | Patient data grants and outcome telemetry | `p32HumanGovernance.ts` adds communication policy, capability registry, launch cell, value case, board evidence, and market-signal isolation | Consent/purpose, fatigue, unsafe outbound, launch-owner, signed board evidence, and market-claim tests | Implemented locally |
| Experimental lanes | Existing snapshots/forks, provider registry, research and specialty modules | Five explicit feature flags default off | Default-off policy assertions | Implemented locally; no provider or production execution |

The worktree evidence under `artifacts/p32/worktree/` is explicitly `NON_CANDIDATE`. It captures initial attribution, architecture crosswalk, validation, gate status, migration posture, and external approval actions without claiming immutable provenance.

### Compatibility

- No schema or data migration is introduced.
- Existing `scrimed-work` exports and p.32 control-plane summary are extended additively.
- External models, connectors, voice, browser bridges, live PHI, EHR/RCM writes, payer actions, production deployment, and customer activation remain disabled.
- `scripts/scrimed-p32-preproduction-governance-gates.mjs` can demonstrate safe development posture, but cannot produce production authority or accept locally fabricated human approval evidence.
