#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  ".gitignore",
  "app/lib/scrimed-work/p32GovernanceRecords.ts",
  "app/lib/scrimed-work/p32ApprovedActions.ts",
  "app/lib/scrimed-work/p32TechnicalGates.ts",
  "app/lib/scrimed-work/p32AgentGovernance.ts",
  "app/lib/scrimed-work/p32ArtifactAdmission.ts",
  "app/lib/scrimed-work/p32InteroperabilityControls.ts",
  "app/lib/scrimed-work/p32HumanGovernance.ts",
  "app/lib/scrimed-work/governedRuntime.ts",
  "app/lib/scrimed-work/index.ts",
  "app/lib/scrimedP32ControlPlane.ts",
  "docs/scrimed-p32-traceability.md",
  "docs/scrimed-p32-architecture.md",
  "scripts/scrimed-p32-consolidated-governance-policy-test.mjs",
  "scripts/scrimed-p32-control-plane-closure-policy-test.mjs",
  "scripts/scrimed-p32-preproduction-governance-gates.mjs",
  "scripts/scrimed-p32-worktree-evidence.mjs",
  "scripts/lib/worktree-evidence-policy.mjs",
  "scripts/scrimed-p32-worktree-evidence-policy-test.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "artifacts/p32/migrations/migration-disposable-dry-run.md",
  "artifacts/p32/gates/gate-matrix.json",
  "artifacts/p32/implementation-report.md",
  "artifacts/p32/review/external-approval-requirements.md",
  "artifacts/p32/review/reviewer-packet.md",
  "artifacts/p32/remaining-backlog.json",
  "artifacts/p32/validation/test-results.json",
  "package.json"
];

const files = Object.fromEntries(
  await Promise.all(
    requiredFiles.map(async (path) => [path, await readFile(path, "utf8")])
  )
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(
      `${path} is missing consolidated p.32 governance contract text: ${expected}`
    );
  }
}

for (const expected of [
  "TaskScopedToolContract",
  "ContextCoverageManifest",
  "EvidenceSynthesisRecord",
  "AgentRiskProfile",
  "AgentExecutionReceipt",
  "ClinicalResponseEvaluation",
  "DeidentificationRelease",
  "GovernedSkillRunbook",
  "ModelChangeSet",
  "WorkloadPlacementDecision",
  "ProtectionLevelAgreement",
  "PostImplementationReview",
  "CorrectableClinicalOutput",
  "DecisionProvenanceRecord",
  "DeidentificationRiskAssessment",
  "EvidenceLedger",
  "Wildcard or unbounded tool scopes are prohibited",
  "Model confidence cannot be represented as proof of correctness",
  "QUALIFIED_EXTERNAL_EXPERT_SIGNATURE_REQUIRED",
  "quarantined-review-required",
  "productionSelfTrainingAllowed: false"
]) {
  requireIncludes("app/lib/scrimed-work/p32GovernanceRecords.ts", expected);
}

for (const expected of [
  "AgentJobManifest",
  "ApprovedActionRegistry",
  "DelegationEnvelope",
  "HumanOversightPlan",
  "ReviewerCapacityBudget",
  "REVIEWER_CAPACITY_EXCEEDED_WORK_PAUSED",
  "CIRCULAR_OR_SELF_DELEGATION_PROHIBITED"
]) {
  requireIncludes("app/lib/scrimed-work/p32AgentGovernance.ts", expected);
}

for (const expected of [
  "AIArtifactManifest",
  "ArtifactAttestation",
  "RollbackPlan",
  "ARTIFACT_SIGNATURE_UNVERIFIED",
  "PRODUCTION_ARTIFACT_ADMISSION_EXTERNAL_GATE_REQUIRED",
  "leaderboardOrVendorClaimUsedAsAuthority: false"
]) {
  requireIncludes("app/lib/scrimed-work/p32ArtifactAdmission.ts", expected);
}

for (const expected of [
  "IntegrationChangeSet",
  "MigrationRunbook",
  "ReconciliationReport",
  "ApplicationLifecycleAssessment",
  "preserve-losslessly",
  "CONSEQUENTIAL_INTEGRATION_MODE_EXTERNALLY_GATED",
  "BROWSER_AUTOMATION_AUTHORIZATION_BYPASS_DENIED"
]) {
  requireIncludes("app/lib/scrimed-work/p32InteroperabilityControls.ts", expected);
}

for (const expected of [
  "PatientConsentGrant",
  "EngagementObjective",
  "CommunicationDeliveryPolicy",
  "ClinicalCapabilityRegistry",
  "ClinicalLaunchCell",
  "AIValueCase",
  "BoardOutcomeSnapshot",
  "MarketSignal",
  "engagementMetricsCanOverrideSafety: false"
]) {
  requireIncludes("app/lib/scrimed-work/p32HumanGovernance.ts", expected);
}

for (const expected of [
  "ApprovedActionClass",
  "ApprovedActionChannel",
  "evaluateP32ApprovedAction",
  "ACTION_PROHIBITED_BY_SCRIMED_BOUNDARY",
  "AGENT_SELF_APPROVAL_PROHIBITED",
  "MULTI_AGENT_CIRCULAR_APPROVAL_PROHIBITED",
  "BROWSER_AUTHORIZATION_BYPASS_PROHIBITED",
  "GOVERNED_RUNTIME_DECISION_REQUIRED",
  "evaluateGovernedExecution",
  "voiceAuthorityEqualsTextAuthority: true",
  "everyMutationRequiresExecutionGrant: true"
]) {
  requireIncludes("app/lib/scrimed-work/p32ApprovedActions.ts", expected);
}

for (const expected of [
  "PRIV-DEID-01",
  "TOOL-MIN-01",
  "CTX-PARITY-01",
  "RESP-EVAL-01",
  "multiagent_cannot_circularly_approve",
  "sandbox_default_deny_egress",
  "hitl_reviewer_capacity_exceeded_pauses_work",
  "fhir_unknown_fields_and_provenance_round_trip",
  "external_gate_cannot_be_satisfied_by_synthetic_fixture",
  "dirty_worktree_cannot_promote_candidate_fingerprint",
  "placement_respects_phi_and_residency",
  "customer-go-live-authorization",
  "PENDING_HUMAN",
  "CANONICAL_RELEASE_GATE_VERIFICATION_REQUIRED",
  "productionReleaseAllowed"
]) {
  requireIncludes("app/lib/scrimed-work/p32TechnicalGates.ts", expected);
}

for (const expected of [
  'export * from "./p32GovernanceRecords"',
  'export * from "./p32ApprovedActions"',
  'export * from "./p32TechnicalGates"',
  'export * from "./p32AgentGovernance"',
  'export * from "./p32ArtifactAdmission"',
  'export * from "./p32InteroperabilityControls"',
  'export * from "./p32HumanGovernance"'
]) {
  requireIncludes("app/lib/scrimed-work/index.ts", expected);
}

for (const expected of [
  "consolidatedGovernanceKernelEnabled: true",
  "consolidatedGovernance:",
  "getP32GovernanceRecordsSummary",
  "getP32ApprovedActionsSummary",
  "getP32TechnicalGateSummary",
  "getP32AgentGovernanceSummary",
  "getP32ArtifactAdmissionSummary",
  "getP32InteroperabilityControlsSummary",
  "getP32HumanGovernanceSummary"
]) {
  requireIncludes("app/lib/scrimedP32ControlPlane.ts", expected);
}

for (const script of [
  "test:scrimed-p32-consolidated-governance",
  "contract:scrimed-p32-consolidated-governance",
  "gate:scrimed-p32-consolidated-governance",
  "gate:scrimed-p32-consolidated-governance:self-test",
  "test:scrimed-p32-control-plane-closure",
  "evidence:scrimed-p32-worktree",
  "test:scrimed-p32-worktree-evidence"
]) {
  requireIncludes("package.json", `"${script}"`);
}

for (const expected of [
  "NON_CANDIDATE",
  "candidateFingerprintIssued: false",
  "sourceFingerprintIssued: false",
  "promotionAllowed: false",
  "PREEXISTING_USER_CHANGE",
  "THIS_RUN_CHANGE",
  "GENERATED_EVIDENCE"
]) {
  requireIncludes("scripts/scrimed-p32-worktree-evidence.mjs", expected);
}

for (const expected of [
  "artifacts/p32/worktree/final-worktree-attribution.json",
  "artifacts/p32/worktree/noncandidate-worktree-fingerprint.json"
]) {
  requireIncludes(".gitignore", expected);
}

for (const expected of [
  "rejects symbolic links",
  "maximumWorktreeEvidenceFileBytes",
  "outside the repository"
]) {
  requireIncludes("scripts/lib/worktree-evidence-policy.mjs", expected);
}

for (const expected of [
  "No migration was applied",
  "READY_FOR_DISPOSABLE_DRY_RUN_AUTHORIZATION",
  "BLOCKED_ENVIRONMENT"
]) {
  requireIncludes(
    "artifacts/p32/migrations/migration-disposable-dry-run.md",
    expected
  );
}

for (const expected of [
  "PENDING_HUMAN",
  "dirty-worktree fingerprints",
  "production release blocked"
]) {
  requireIncludes(
    "artifacts/p32/review/external-approval-requirements.md",
    expected
  );
}

for (const expected of [
  "\"passed\": 66",
  "\"PENDING_HUMAN\": 13",
  "\"productionReleaseAllowed\": false"
]) {
  requireIncludes("artifacts/p32/gates/gate-matrix.json", expected);
}

for (const expected of [
  "\"checkCount\": 136",
  "\"findings\": 0",
  "\"candidateAuthorityGranted\": false"
]) {
  requireIncludes("artifacts/p32/validation/test-results.json", expected);
}

for (const expected of [
  "No second orchestration",
  "no candidate fingerprint is issued",
  "No commit, push, merge, deployment"
]) {
  requireIncludes("artifacts/p32/implementation-report.md", expected);
}

for (const path of [
  "scripts/scrimed-p32-consolidated-governance-policy-test.mjs",
  "scripts/scrimed-p32-control-plane-closure-policy-test.mjs",
  "scripts/scrimed-p32-consolidated-governance-contract-check.mjs",
  "scripts/scrimed-p32-preproduction-governance-gates.mjs"
]) {
  requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", path);
}

for (const expected of [
  "Consolidated p.32 Governance P0",
  "TaskScopedToolContract",
  "ContextCoverageManifest",
  "DeidentificationRelease",
  "PENDING_HUMAN"
]) {
  requireIncludes("docs/scrimed-p32-traceability.md", expected);
}

for (const expected of [
  "Approved-Actions Kernel",
  "Technical Gate Profiles",
  "correctability",
  "qualified external expert"
]) {
  requireIncludes("docs/scrimed-p32-architecture.md", expected);
}

for (const expected of [
  "GRANT_REPLAY_DETECTED",
  "CURRENT_POLICY_HARD_BLOCK",
  "createGovernedExecutionReceipt"
]) {
  requireIncludes("app/lib/scrimed-work/governedRuntime.ts", expected);
}

console.log(
  "SCRIMED p.32 consolidated governance contract check passed (records + action kernel + technical gates + tests + docs)"
);
