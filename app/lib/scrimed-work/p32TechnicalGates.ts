import { createAuditHash } from "./audit";

export const scrimedP32TechnicalGateVersion =
  "scrimed-p32-technical-gates-v1-2026-07-29";

export const scrimedP32TechnicalGateBoundary =
  "SCRIMED p.32 technical gates are evidence-bound and fail closed. Development permits synthetic, read-only, local/mock operation only. Missing human approvals remain external blockers and can never be converted to production authority by code.";

export const scrimedP32AutomatedTechnicalGateIds = [
  "PRIV-DEID-01",
  "PRIV-UTILITY-01",
  "TOOL-MIN-01",
  "CTX-PARITY-01",
  "DATA-01",
  "summary:clinician-model-source-parity",
  "summary:temporal-correctness",
  "retrieval:verified-no-egress",
  "MODEL-DIST-01",
  "EVID-GRADE-01",
  "RESP-EVAL-01",
  "SKILL-ADM-01",
  "VOICE-CLIN-02",
  "SIM-01",
  "model:adapter-admission",
  "eval:trace-and-artifact-completeness",
  "model_update_requires_revalidation",
  "JOB-01",
  "IAM-01",
  "ACT-01",
  "ESC-01",
  "IMP-01",
  "CHN-01",
  "capability_lease_expires",
  "risk_tier_cannot_self_escalate",
  "delegation_chain_is_complete",
  "multiagent_cannot_circularly_approve",
  "emergency_stop_blocks_new_actions",
  "intent_log_covers_every_tool_call",
  "sandbox_no_ambient_credentials",
  "sandbox_default_deny_egress",
  "sandbox_cross_tenant_residue",
  "sandbox_signed_provenance",
  "permission_aware_index_acl_parity",
  "context_freshness_and_revocation",
  "minimal_schema_token_budget",
  "retrieved_content_cannot_issue_instructions",
  "evidence_fact_inference_hypothesis_separation",
  "unsupported_claim_is_blocked",
  "stale_or_retracted_source_invalidates_claim",
  "production_trace_phi_redaction",
  "judge_requires_human_calibration",
  "ai_detector_cannot_be_used_as_provenance",
  "model_router_optimizes_validated_task_not_token_price",
  "clinical_output_requires_correction_path",
  "correction_cannot_self_train",
  "hitl_requires_competent_named_reviewer",
  "hitl_reviewer_capacity_exceeded_pauses_work",
  "deidentification_cannot_self_certify",
  "expert_determination_requires_named_signer",
  "fhir_unknown_fields_and_provenance_round_trip",
  "structured_write_remains_gated",
  "browser_automation_cannot_bypass_auth",
  "voice_chat_api_ui_authorization_parity",
  "engagement_requires_consent_and_purpose",
  "engagement_metric_cannot_override_safety",
  "board_metric_resolves_to_signed_evidence",
  "external_gate_cannot_be_satisfied_by_synthetic_fixture",
  "dirty_worktree_cannot_promote_candidate_fingerprint",
  "integration:ui-bridge-authorization",
  "integration:ui-drift-and-idempotency",
  "placement_respects_phi_and_residency",
  "DEP-01",
  "rollback_completes_within_slo",
  "deploy:preview-to-production-provenance",
  "solver:clinical-boundary"
] as const;

export const scrimedP32ExternalGateIds = [
  "clean-reviewed-commit-provenance",
  "named-independent-reviewer",
  "aal2-operator-evidence",
  "migration-approval",
  "intended-use-approval",
  "clinical-safety-approval",
  "privacy-approval",
  "legal-regulatory-approval",
  "security-approval",
  "baa-subprocessor-residency-approval",
  "deployment-authorization",
  "post-deployment-smoke-validation",
  "customer-go-live-authorization"
] as const;

export type P32AutomatedTechnicalGateId =
  (typeof scrimedP32AutomatedTechnicalGateIds)[number];
export type P32ExternalGateId = (typeof scrimedP32ExternalGateIds)[number];
export type P32TechnicalGateId = P32AutomatedTechnicalGateId | P32ExternalGateId;
export type P32GateStatus =
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "BLOCKED_EXTERNAL"
  | "PENDING_HUMAN";

export type P32TechnicalGateDefinition = {
  gateId: P32TechnicalGateId;
  description: string;
  classification: "AUTOMATED" | "EXTERNAL";
  ownerRole: string;
  requiredEvidence: string[];
  developmentWorkaround:
    | "synthetic-only"
    | "deidentified-fixtures-only"
    | "read-only"
    | "draft-only"
    | "shadow-only"
    | "local-mock-only"
    | "disabled-feature-flag"
    | null;
  hardGate: true;
};

export type P32TechnicalGateEvidence = {
  evidenceId: string;
  gateId: P32AutomatedTechnicalGateId;
  status: "passed" | "failed";
  candidateFingerprint: string;
  sourceFingerprint: string;
  evidencePointer: string;
  evaluatorIdentityHash: string;
  evaluatorRole: string;
  checkedAt: string;
  expiresAt: string;
  evidenceHash: string;
};

export type P32TechnicalGateResult = P32TechnicalGateDefinition & {
  status: P32GateStatus;
  reasonCode: string;
  evidenceId: string | null;
  evidencePointer: string | null;
  candidateFingerprint: string;
  sourceFingerprint: string;
};

export type P32TechnicalGateReport = {
  profile: "development" | "production-release";
  candidateFingerprint: string;
  sourceFingerprint: string;
  evaluatedAt: string;
  counts: Record<P32GateStatus, number>;
  developmentSafeModeAllowed: boolean;
  productionReleaseAllowed: boolean;
  safetyPosture: {
    syntheticOnly: boolean;
    deidentifiedFixturesOnly: boolean;
    readOnly: boolean;
    liveProviderCallsEnabled: boolean;
    productionMutationsEnabled: boolean;
  };
  results: P32TechnicalGateResult[];
  boundary: typeof scrimedP32TechnicalGateBoundary;
  reportHash: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

const automatedGateMetadata: Record<
  P32AutomatedTechnicalGateId,
  Pick<
    P32TechnicalGateDefinition,
    "description" | "ownerRole" | "requiredEvidence" | "developmentWorkaround"
  >
> = {
  "PRIV-DEID-01": {
    description: "De-identification release is blocked without qualified external determination evidence.",
    ownerRole: "privacy-engineering",
    requiredEvidence: ["de-identification risk report", "signature-verification result"],
    developmentWorkaround: "synthetic-only"
  },
  "PRIV-UTILITY-01": {
    description: "Privacy transformation utility loss and intended-use limits are recorded.",
    ownerRole: "privacy-engineering",
    requiredEvidence: ["utility-loss report", "intended-use limits"],
    developmentWorkaround: "synthetic-only"
  },
  "TOOL-MIN-01": {
    description: "Every tool contract enforces minimum-necessary fields, rows, actions, and destinations.",
    ownerRole: "security-engineering",
    requiredEvidence: ["tool-scope policy test"],
    developmentWorkaround: "read-only"
  },
  "CTX-PARITY-01": {
    description: "Clinical context reports clinician/model source parity and missing coverage.",
    ownerRole: "clinical-safety",
    requiredEvidence: ["context-coverage fixture", "source-parity test"],
    developmentWorkaround: "deidentified-fixtures-only"
  },
  "DATA-01": {
    description: "Data provenance, classification, tenant, freshness, and revocation controls pass.",
    ownerRole: "data-governance",
    requiredEvidence: ["data-governance contract", "tenant-isolation test"],
    developmentWorkaround: "synthetic-only"
  },
  "summary:clinician-model-source-parity": {
    description: "Summary generation exposes source asymmetry rather than silently proceeding.",
    ownerRole: "clinical-safety",
    requiredEvidence: ["summary source-parity test"],
    developmentWorkaround: "draft-only"
  },
  "summary:temporal-correctness": {
    description: "Narrative and deterministic temporal paths reconcile without silent disagreement.",
    ownerRole: "clinical-safety",
    requiredEvidence: ["temporal reconciliation test"],
    developmentWorkaround: "draft-only"
  },
  "retrieval:verified-no-egress": {
    description: "Unauthorized content cannot enter retrieval, cache, embedding, trace, or citation stores.",
    ownerRole: "security-engineering",
    requiredEvidence: ["retrieval authorization test", "no-egress test"],
    developmentWorkaround: "local-mock-only"
  },
  "MODEL-DIST-01": {
    description: "Model distribution, license, runtime, and provider chain are explicitly admitted.",
    ownerRole: "model-governance",
    requiredEvidence: ["model passport", "artifact admission result"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "EVID-GRADE-01": {
    description: "Evidence grades and limitations are present and model confidence is not proof.",
    ownerRole: "clinical-evidence",
    requiredEvidence: ["evidence synthesis validation"],
    developmentWorkaround: "draft-only"
  },
  "RESP-EVAL-01": {
    description: "Clinical response evaluation enforces hard safety and worst-cell floors.",
    ownerRole: "clinical-evaluation",
    requiredEvidence: ["response evaluation report", "worst-cell test"],
    developmentWorkaround: "synthetic-only"
  },
  "SKILL-ADM-01": {
    description: "Skills require signed bounded manifests, competence evidence, dry run, and rollback.",
    ownerRole: "agent-governance",
    requiredEvidence: ["skill admission record"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "VOICE-CLIN-02": {
    description: "Voice clinical conformance and authority parity with text are verified.",
    ownerRole: "clinical-evaluation",
    requiredEvidence: ["voice conformance report", "authority parity test"],
    developmentWorkaround: "local-mock-only"
  },
  "SIM-01": {
    description: "Simulation uses synthetic/de-identified fixtures and cannot cross into clinical action.",
    ownerRole: "clinical-safety",
    requiredEvidence: ["simulation boundary test"],
    developmentWorkaround: "synthetic-only"
  },
  "model:adapter-admission": {
    description: "Provider adapters pass task-specific conformance before routing eligibility.",
    ownerRole: "model-governance",
    requiredEvidence: ["provider conformance run"],
    developmentWorkaround: "local-mock-only"
  },
  "eval:trace-and-artifact-completeness": {
    description: "Evaluation binds model, prompt, tool, schema, policy, data, and artifact versions.",
    ownerRole: "clinical-evaluation",
    requiredEvidence: ["evaluation provenance manifest"],
    developmentWorkaround: "synthetic-only"
  },
  model_update_requires_revalidation: {
    description: "Every model artifact update requires evaluation, shadowing, canary, and rollback.",
    ownerRole: "model-governance",
    requiredEvidence: ["model change set", "rollback target"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "JOB-01": {
    description: "Every agent run has a bounded, attributable job manifest.",
    ownerRole: "agent-governance",
    requiredEvidence: ["job manifest validation"],
    developmentWorkaround: "local-mock-only"
  },
  "IAM-01": {
    description: "Workload identity and leases are short-lived, tenant-bound, and non-transferable.",
    ownerRole: "identity-security",
    requiredEvidence: ["identity and lease tests"],
    developmentWorkaround: "local-mock-only"
  },
  "ACT-01": {
    description: "Consequential action uses the shared approved-actions kernel and an execution grant.",
    ownerRole: "security-engineering",
    requiredEvidence: ["action kernel policy test"],
    developmentWorkaround: "read-only"
  },
  "ESC-01": {
    description: "Escalations route to independent humans and agents cannot self-approve.",
    ownerRole: "agent-governance",
    requiredEvidence: ["escalation independence test"],
    developmentWorkaround: "draft-only"
  },
  "IMP-01": {
    description: "Post-implementation review records outcomes, corrections, stop, and rollback thresholds.",
    ownerRole: "workflow-owner",
    requiredEvidence: ["post-implementation review"],
    developmentWorkaround: "shadow-only"
  },
  "CHN-01": {
    description: "Delegation chains are complete and cryptographically attributable.",
    ownerRole: "security-engineering",
    requiredEvidence: ["delegation-chain test"],
    developmentWorkaround: "local-mock-only"
  },
  capability_lease_expires: {
    description: "Expired and revoked leases cannot execute tools.",
    ownerRole: "identity-security",
    requiredEvidence: ["lease expiry test"],
    developmentWorkaround: "local-mock-only"
  },
  risk_tier_cannot_self_escalate: {
    description: "Agents cannot lower, escalate, or approve their own risk tier.",
    ownerRole: "agent-governance",
    requiredEvidence: ["risk-tier independence test"],
    developmentWorkaround: "draft-only"
  },
  delegation_chain_is_complete: {
    description: "Every delegated action retains issuer, actor, purpose, scope, and approval attribution.",
    ownerRole: "security-engineering",
    requiredEvidence: ["delegation completeness report"],
    developmentWorkaround: "local-mock-only"
  },
  multiagent_cannot_circularly_approve: {
    description: "Agent groups cannot mutually or circularly approve consequential actions.",
    ownerRole: "agent-governance",
    requiredEvidence: ["circular-approval denial test"],
    developmentWorkaround: "draft-only"
  },
  emergency_stop_blocks_new_actions: {
    description: "Emergency revocation blocks new actions and active capability leases.",
    ownerRole: "security-operations",
    requiredEvidence: ["emergency-stop test"],
    developmentWorkaround: "local-mock-only"
  },
  intent_log_covers_every_tool_call: {
    description: "Causal traces bind each tool call to intent, policy, approvals, cost, and result.",
    ownerRole: "observability",
    requiredEvidence: ["causal-trace completeness test"],
    developmentWorkaround: "local-mock-only"
  },
  sandbox_no_ambient_credentials: {
    description: "Sandbox tasks receive no ambient credentials.",
    ownerRole: "security-engineering",
    requiredEvidence: ["snapshot and environment scrub test"],
    developmentWorkaround: "local-mock-only"
  },
  sandbox_default_deny_egress: {
    description: "Sandbox network egress is denied except for task-scoped destinations.",
    ownerRole: "security-engineering",
    requiredEvidence: ["direct, DNS, proxy, and websocket denial tests"],
    developmentWorkaround: "local-mock-only"
  },
  sandbox_cross_tenant_residue: {
    description: "Ephemeral cleanup leaves no cross-tenant task residue.",
    ownerRole: "security-engineering",
    requiredEvidence: ["cross-tenant residue test"],
    developmentWorkaround: "local-mock-only"
  },
  sandbox_signed_provenance: {
    description: "Sandbox inputs, artifacts, tools, and runtime are content-addressed and admitted.",
    ownerRole: "software-supply-chain",
    requiredEvidence: ["artifact attestation report"],
    developmentWorkaround: "local-mock-only"
  },
  permission_aware_index_acl_parity: {
    description: "Indexed context preserves source ACLs, tenant isolation, purpose, and revocation.",
    ownerRole: "data-governance",
    requiredEvidence: ["permission-aware context test"],
    developmentWorkaround: "synthetic-only"
  },
  context_freshness_and_revocation: {
    description: "Stale, expired, retracted, or revoked context cannot silently support a claim.",
    ownerRole: "clinical-evidence",
    requiredEvidence: ["freshness and revocation test"],
    developmentWorkaround: "draft-only"
  },
  minimal_schema_token_budget: {
    description: "Tool schemas expose only task-scoped fields and bounded token budgets.",
    ownerRole: "agent-governance",
    requiredEvidence: ["minimal-schema budget test"],
    developmentWorkaround: "local-mock-only"
  },
  retrieved_content_cannot_issue_instructions: {
    description: "Retrieved content is untrusted data and cannot expand tools, egress, or execution authority.",
    ownerRole: "security-engineering",
    requiredEvidence: ["indirect prompt-injection test"],
    developmentWorkaround: "local-mock-only"
  },
  evidence_fact_inference_hypothesis_separation: {
    description: "Evidence records preserve FACT, INFERENCE, and HYPOTHESIS distinctions.",
    ownerRole: "clinical-evidence",
    requiredEvidence: ["evidence classification test"],
    developmentWorkaround: "draft-only"
  },
  unsupported_claim_is_blocked: {
    description: "Unsupported material clinical claims block or require qualified review.",
    ownerRole: "clinical-safety",
    requiredEvidence: ["unsupported-claim test"],
    developmentWorkaround: "draft-only"
  },
  stale_or_retracted_source_invalidates_claim: {
    description: "Stale and retracted sources invalidate claim support.",
    ownerRole: "clinical-evidence",
    requiredEvidence: ["stale/retracted claim test"],
    developmentWorkaround: "draft-only"
  },
  production_trace_phi_redaction: {
    description: "Causal traces contain digests and redacted metadata, never raw PHI.",
    ownerRole: "privacy-security",
    requiredEvidence: ["trace redaction test"],
    developmentWorkaround: "synthetic-only"
  },
  judge_requires_human_calibration: {
    description: "LLM judges require qualified human labels and measured inter-rater calibration.",
    ownerRole: "clinical-evaluation",
    requiredEvidence: ["judge calibration test"],
    developmentWorkaround: "synthetic-only"
  },
  ai_detector_cannot_be_used_as_provenance: {
    description: "AI-text detectors and model confidence cannot prove provenance or correctness.",
    ownerRole: "clinical-evaluation",
    requiredEvidence: ["provenance-source test"],
    developmentWorkaround: "synthetic-only"
  },
  model_router_optimizes_validated_task_not_token_price: {
    description: "Routing optimizes validated task fitness and total accepted-outcome cost.",
    ownerRole: "model-governance",
    requiredEvidence: ["outcome-based routing test"],
    developmentWorkaround: "local-mock-only"
  },
  clinical_output_requires_correction_path: {
    description: "Clinical-facing drafts support accept, edit, reject, reroute, and escalate.",
    ownerRole: "clinical-safety",
    requiredEvidence: ["correctability test"],
    developmentWorkaround: "draft-only"
  },
  correction_cannot_self_train: {
    description: "Corrections enter a quarantined review path and cannot self-train production behavior.",
    ownerRole: "model-governance",
    requiredEvidence: ["correction quarantine test"],
    developmentWorkaround: "synthetic-only"
  },
  hitl_requires_competent_named_reviewer: {
    description: "Consequential human review requires a named competent independent reviewer.",
    ownerRole: "clinical-governance",
    requiredEvidence: ["oversight plan test"],
    developmentWorkaround: "draft-only"
  },
  hitl_reviewer_capacity_exceeded_pauses_work: {
    description: "Reviewer workload ceilings pause work instead of shifting unbounded liability.",
    ownerRole: "clinical-operations",
    requiredEvidence: ["reviewer capacity test"],
    developmentWorkaround: "draft-only"
  },
  deidentification_cannot_self_certify: {
    description: "Technical risk metrics cannot self-declare legal de-identification safety.",
    ownerRole: "privacy-engineering",
    requiredEvidence: ["de-identification self-certification denial test"],
    developmentWorkaround: "synthetic-only"
  },
  expert_determination_requires_named_signer: {
    description: "Expert determination requires qualified external identity and verified signature evidence.",
    ownerRole: "privacy-officer",
    requiredEvidence: ["expert signature verification test"],
    developmentWorkaround: "synthetic-only"
  },
  fhir_unknown_fields_and_provenance_round_trip: {
    description: "FHIR and standards mappings preserve unknown fields, extensions, and provenance.",
    ownerRole: "interoperability-engineering",
    requiredEvidence: ["lossless round-trip test"],
    developmentWorkaround: "synthetic-only"
  },
  structured_write_remains_gated: {
    description: "Document posting and structured writes remain disabled without external authorization.",
    ownerRole: "integration-owner",
    requiredEvidence: ["structured-write denial test"],
    developmentWorkaround: "read-only"
  },
  browser_automation_cannot_bypass_auth: {
    description: "Browser automation cannot bypass APIs, identity, consent, or source-system policy.",
    ownerRole: "security-engineering",
    requiredEvidence: ["browser bypass denial test"],
    developmentWorkaround: "disabled-feature-flag"
  },
  voice_chat_api_ui_authorization_parity: {
    description: "Voice, chat, API, UI, jobs, agents, and browser adapters share one policy ceiling.",
    ownerRole: "security-engineering",
    requiredEvidence: ["channel authorization parity test"],
    developmentWorkaround: "local-mock-only"
  },
  engagement_requires_consent_and_purpose: {
    description: "Patient engagement requires an active purpose-bound consent grant.",
    ownerRole: "privacy-clinical-operations",
    requiredEvidence: ["communication consent test"],
    developmentWorkaround: "draft-only"
  },
  engagement_metric_cannot_override_safety: {
    description: "Click or contact-volume objectives cannot override quiet hours, fatigue, or safety controls.",
    ownerRole: "clinical-safety",
    requiredEvidence: ["engagement safety override test"],
    developmentWorkaround: "draft-only"
  },
  board_metric_resolves_to_signed_evidence: {
    description: "Board-level value metrics require attributable signed evidence.",
    ownerRole: "finance-governance",
    requiredEvidence: ["board evidence resolution test"],
    developmentWorkaround: "draft-only"
  },
  external_gate_cannot_be_satisfied_by_synthetic_fixture: {
    description: "Synthetic fixtures cannot satisfy human, legal, clinical, security, AAL2, or deployment gates.",
    ownerRole: "release-management",
    requiredEvidence: ["external-gate synthetic-evidence denial test"],
    developmentWorkaround: "synthetic-only"
  },
  dirty_worktree_cannot_promote_candidate_fingerprint: {
    description: "Dirty-tree evidence is labeled NON_CANDIDATE and cannot become immutable candidate provenance.",
    ownerRole: "release-management",
    requiredEvidence: ["dirty-worktree provenance test"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "integration:ui-bridge-authorization": {
    description: "UI/browser bridges cannot bypass identity, MFA, API, or user authorization.",
    ownerRole: "security-engineering",
    requiredEvidence: ["UI bridge authorization test"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "integration:ui-drift-and-idempotency": {
    description: "UI integration detects drift and prevents duplicate or ambiguous mutation.",
    ownerRole: "integration-engineering",
    requiredEvidence: ["UI drift and idempotency test"],
    developmentWorkaround: "disabled-feature-flag"
  },
  placement_respects_phi_and_residency: {
    description: "Workload placement respects PHI eligibility, residency, retention, consent, and BAA.",
    ownerRole: "privacy-security",
    requiredEvidence: ["workload placement decision"],
    developmentWorkaround: "synthetic-only"
  },
  "DEP-01": {
    description: "Deployment remains inaccessible without exact-candidate external authorization.",
    ownerRole: "release-management",
    requiredEvidence: ["deployment authorization validation"],
    developmentWorkaround: "disabled-feature-flag"
  },
  rollback_completes_within_slo: {
    description: "Rollback is tested against the declared recovery SLO.",
    ownerRole: "site-reliability",
    requiredEvidence: ["rollback drill result"],
    developmentWorkaround: "local-mock-only"
  },
  "deploy:preview-to-production-provenance": {
    description: "Source, artifact, environment, approvals, and deployment identity remain exact.",
    ownerRole: "release-management",
    requiredEvidence: ["deployment provenance manifest"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "solver:clinical-boundary": {
    description: "Optimization and solver outputs cannot cross into autonomous clinical action.",
    ownerRole: "clinical-safety",
    requiredEvidence: ["solver boundary policy test"],
    developmentWorkaround: "shadow-only"
  }
};

const externalGateMetadata: Record<
  P32ExternalGateId,
  Pick<
    P32TechnicalGateDefinition,
    "description" | "ownerRole" | "requiredEvidence" | "developmentWorkaround"
  >
> = {
  "clean-reviewed-commit-provenance": {
    description: "A clean exact candidate has attributable source and independent review.",
    ownerRole: "release-steward",
    requiredEvidence: ["exact commit/tree manifest", "independent review decision"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "named-independent-reviewer": {
    description: "A distinct named reviewer approves the exact candidate.",
    ownerRole: "principal-reviewer",
    requiredEvidence: ["identity-bound review decision"],
    developmentWorkaround: "draft-only"
  },
  "aal2-operator-evidence": {
    description: "A current AAL2 operator credential is bound to the action and candidate.",
    ownerRole: "authorized-operator",
    requiredEvidence: ["issuer/audience/AAL/role/candidate validation"],
    developmentWorkaround: "local-mock-only"
  },
  "migration-approval": {
    description: "Database owner approves the exact migration set after disposable dry run.",
    ownerRole: "database-owner",
    requiredEvidence: ["migration fingerprint", "dry run", "recovery plan", "approval"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "intended-use-approval": {
    description: "Clinical governance and counsel approve intended and prohibited use.",
    ownerRole: "founder-clinical-governance-counsel",
    requiredEvidence: ["signed intended-use decision"],
    developmentWorkaround: "synthetic-only"
  },
  "clinical-safety-approval": {
    description: "Qualified clinical safety leadership approves the exact evidence and boundaries.",
    ownerRole: "clinical-safety-officer",
    requiredEvidence: ["qualified clinical review"],
    developmentWorkaround: "draft-only"
  },
  "privacy-approval": {
    description: "Privacy owner approves data purpose, minimization, retention, and disclosures.",
    ownerRole: "privacy-officer",
    requiredEvidence: ["privacy impact decision"],
    developmentWorkaround: "synthetic-only"
  },
  "legal-regulatory-approval": {
    description: "Qualified counsel approves claims, contracts, and regulatory posture.",
    ownerRole: "qualified-healthcare-counsel",
    requiredEvidence: ["legal/regulatory decision"],
    developmentWorkaround: "synthetic-only"
  },
  "security-approval": {
    description: "Security owner approves identity, isolation, threat model, and incident controls.",
    ownerRole: "security-officer",
    requiredEvidence: ["security review decision"],
    developmentWorkaround: "local-mock-only"
  },
  "baa-subprocessor-residency-approval": {
    description: "Provider service scope, contract, subprocessors, residency, logs, and retention are approved.",
    ownerRole: "privacy-security-counsel",
    requiredEvidence: ["provider documentary review"],
    developmentWorkaround: "local-mock-only"
  },
  "deployment-authorization": {
    description: "Deployment authority approves exact candidate, target, window, monitoring, and rollback.",
    ownerRole: "deployment-authority",
    requiredEvidence: ["candidate-bound deployment authorization"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "post-deployment-smoke-validation": {
    description: "Authorized production deployment passes environment-bound smoke and rollback checks.",
    ownerRole: "release-operator",
    requiredEvidence: ["post-deployment evidence packet"],
    developmentWorkaround: "disabled-feature-flag"
  },
  "customer-go-live-authorization": {
    description: "Customer-specific intended use, contracts, operators, support, acceptance, and rollback are approved.",
    ownerRole: "customer-authority-and-scrimed-founder",
    requiredEvidence: ["customer-specific go-live authorization"],
    developmentWorkaround: "synthetic-only"
  }
};

export function getP32TechnicalGateCatalog(): P32TechnicalGateDefinition[] {
  const automated = scrimedP32AutomatedTechnicalGateIds.map((gateId) => ({
    gateId,
    classification: "AUTOMATED" as const,
    hardGate: true as const,
    ...automatedGateMetadata[gateId]
  }));
  const external = scrimedP32ExternalGateIds.map((gateId) => ({
    gateId,
    classification: "EXTERNAL" as const,
    hardGate: true as const,
    ...externalGateMetadata[gateId]
  }));
  return [...automated, ...external];
}

export function createP32TechnicalGateEvidence(
  input: Omit<P32TechnicalGateEvidence, "evidenceHash">
): P32TechnicalGateEvidence {
  if (!identifierPattern.test(input.evidenceId)) {
    throw new Error("Technical gate evidence requires a bounded identifier");
  }
  if (
    !sha256Pattern.test(input.candidateFingerprint) ||
    !sha256Pattern.test(input.sourceFingerprint) ||
    !sha256Pattern.test(input.evaluatorIdentityHash)
  ) {
    throw new Error("Technical gate evidence requires exact SHA-256 attribution");
  }
  if (
    !Number.isFinite(Date.parse(input.checkedAt)) ||
    !Number.isFinite(Date.parse(input.expiresAt)) ||
    Date.parse(input.expiresAt) <= Date.parse(input.checkedAt)
  ) {
    throw new Error("Technical gate evidence timestamps are invalid");
  }
  if (!input.evidencePointer.trim() || !input.evaluatorRole.trim()) {
    throw new Error("Technical gate evidence requires a pointer and evaluator role");
  }
  return {
    ...input,
    evidenceHash: createAuditHash({ type: "p32-technical-gate-evidence", input })
  };
}

function verifyEvidence(
  evidence: P32TechnicalGateEvidence,
  context: {
    candidateFingerprint: string;
    sourceFingerprint: string;
    evaluatedAt: string;
  }
) {
  const { evidenceHash, ...input } = evidence;
  const reasons: string[] = [];
  if (
    createAuditHash({ type: "p32-technical-gate-evidence", input }) !== evidenceHash
  ) {
    reasons.push("GATE_EVIDENCE_INTEGRITY_INVALID");
  }
  if (
    evidence.candidateFingerprint !== context.candidateFingerprint ||
    evidence.sourceFingerprint !== context.sourceFingerprint
  ) {
    reasons.push("GATE_EVIDENCE_FINGERPRINT_MISMATCH");
  }
  if (
    Date.parse(evidence.checkedAt) > Date.parse(context.evaluatedAt) ||
    Date.parse(evidence.expiresAt) <= Date.parse(context.evaluatedAt)
  ) {
    reasons.push("GATE_EVIDENCE_EXPIRED_OR_NOT_YET_VALID");
  }
  if (evidence.status !== "passed") reasons.push("GATE_EVIDENCE_REPORTED_FAILURE");
  return reasons;
}

export function evaluateP32TechnicalGates(input: {
  profile: "development" | "production-release";
  candidateFingerprint: string;
  sourceFingerprint: string;
  evaluatedAt: string;
  evidence: P32TechnicalGateEvidence[];
  safetyPosture: {
    syntheticOnly: boolean;
    deidentifiedFixturesOnly: boolean;
    readOnly: boolean;
    liveProviderCallsEnabled: boolean;
    productionMutationsEnabled: boolean;
  };
}): P32TechnicalGateReport {
  if (
    !sha256Pattern.test(input.candidateFingerprint) ||
    !sha256Pattern.test(input.sourceFingerprint)
  ) {
    throw new Error("Technical gate report requires exact candidate and source fingerprints");
  }
  if (!Number.isFinite(Date.parse(input.evaluatedAt))) {
    throw new Error("Technical gate report requires a valid evaluation timestamp");
  }
  const evidenceByGate = new Map<P32TechnicalGateId, P32TechnicalGateEvidence>();
  input.evidence.forEach((evidence) => evidenceByGate.set(evidence.gateId, evidence));
  const results = getP32TechnicalGateCatalog().map((definition) => {
    const evidence = evidenceByGate.get(definition.gateId);
    let status: P32GateStatus;
    let reasonCode: string;
    if (definition.classification === "EXTERNAL") {
      status = evidence ? "BLOCKED_EXTERNAL" : "PENDING_HUMAN";
      reasonCode = evidence
        ? "CANONICAL_RELEASE_GATE_VERIFICATION_REQUIRED"
        : "IRREDUCIBLE_EXTERNAL_EVIDENCE_REQUIRED";
    } else if (!evidence) {
      status = "BLOCKED";
      reasonCode = "AUTOMATED_GATE_EVIDENCE_MISSING";
    } else {
      const reasons = verifyEvidence(evidence, input);
      status = reasons.length ? "FAIL" : "PASS";
      reasonCode = reasons[0] ?? "GATE_EVIDENCE_VALID";
    }
    return {
      ...definition,
      status,
      reasonCode,
      evidenceId: evidence?.evidenceId ?? null,
      evidencePointer: evidence?.evidencePointer ?? null,
      candidateFingerprint: input.candidateFingerprint,
      sourceFingerprint: input.sourceFingerprint
    };
  });

  const counts: Record<P32GateStatus, number> = {
    PASS: 0,
    FAIL: 0,
    BLOCKED: 0,
    BLOCKED_EXTERNAL: 0,
    PENDING_HUMAN: 0
  };
  results.forEach((result) => {
    counts[result.status] += 1;
  });
  const safeDevelopmentPosture =
    input.safetyPosture.syntheticOnly &&
    input.safetyPosture.deidentifiedFixturesOnly &&
    input.safetyPosture.readOnly &&
    !input.safetyPosture.liveProviderCallsEnabled &&
    !input.safetyPosture.productionMutationsEnabled;
  const automatedResults = results.filter(
    (result) => result.classification === "AUTOMATED"
  );
  const developmentSafeModeAllowed =
    input.profile === "development" &&
    safeDevelopmentPosture &&
    automatedResults.every((result) => result.status === "PASS");
  const productionReleaseAllowed =
    input.profile === "production-release" &&
    results.every((result) => result.status === "PASS") &&
    !input.safetyPosture.productionMutationsEnabled;
  const withoutHash = {
    profile: input.profile,
    candidateFingerprint: input.candidateFingerprint,
    sourceFingerprint: input.sourceFingerprint,
    evaluatedAt: input.evaluatedAt,
    counts,
    developmentSafeModeAllowed,
    productionReleaseAllowed,
    safetyPosture: input.safetyPosture,
    results,
    boundary:
      scrimedP32TechnicalGateBoundary as typeof scrimedP32TechnicalGateBoundary
  };
  return {
    ...withoutHash,
    reportHash: createAuditHash({ type: "p32-technical-gate-report", report: withoutHash })
  };
}

export function getP32TechnicalGateSummary() {
  const catalog = getP32TechnicalGateCatalog();
  return {
    version: scrimedP32TechnicalGateVersion,
    total: catalog.length,
    automated: catalog.filter((gate) => gate.classification === "AUTOMATED").length,
    external: catalog.filter((gate) => gate.classification === "EXTERNAL").length,
    externalGatesCanSelfApprove: false,
    productionFailsClosedWithoutAllEvidence: true,
    developmentProfile: "synthetic-deidentified-read-only-local-mock",
    boundary: scrimedP32TechnicalGateBoundary
  } as const;
}
