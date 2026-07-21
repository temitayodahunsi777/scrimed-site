#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  ".env.example",
  "SECURITY.md",
  "app/lib/scrimed-work/p32Contracts.ts",
  "app/lib/scrimed-work/governedRuntime.ts",
  "app/lib/clinicalSearchFabric.ts",
  "app/lib/scrimedTrustIncidentForensics.ts",
  "app/lib/scrimedP32WorkflowControls.ts",
  "app/lib/scrimedP32ProductionHarness.ts",
  "app/lib/scrimedP32CarePolicy.ts",
  "app/lib/scrimedP32ResourceAdmission.ts",
  "app/lib/scrimedP32ClinicalDataViews.ts",
  "app/lib/scrimedP32RcmVoice.ts",
  "app/lib/scrimedP32ApplicationRationalization.ts",
  "app/lib/scrimedP32MultimodalNormalization.ts",
  "app/lib/scrimedP32ArtifactLedger.ts",
  "app/lib/scrimedP32RepoOps.ts",
  "app/lib/scrimedP32ReleaseGates.ts",
  "app/lib/scrimedP32GateEvidence.ts",
  "app/lib/scrimedP32ControlPlane.ts",
  "app/lib/scrimedClinicalBenchmarkSuite.ts",
  "app/lib/clinicalContextGateway.ts",
  "app/lib/trustSafetyOperations.ts",
  "app/lib/scrimed-work/providerRegistry.ts",
  "app/lib/scrimed-work/modelRouter.ts",
  "app/lib/healthcareIntelligenceOS.ts",
  "app/healthcare-intelligence-os/page.tsx",
  "docs/scrimed-p32-traceability.md",
  "docs/scrimed-p32-architecture.md",
  "docs/scrimed-p32-release-operations.md",
  "scripts/scrimed-p32-policy-test.mjs",
  "scripts/scrimed-p32-execution-harness-policy-test.mjs",
  "scripts/scrimed-p32-release-hardening-policy-test.mjs",
  "scripts/scrimed-secret-scan.mjs",
  "scripts/scrimed-sbom.mjs",
  "scripts/scrimed-migration-evidence-packet.mjs",
  ".github/CODEOWNERS",
  ".github/dependabot.yml",
  ".github/workflows/dependency-review.yml",
  ".github/workflows/codeql.yml",
  "scripts/scrimed-p32-release-gate-evidence.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) throw new Error(`${path} is missing required p.32 contract text: ${expected}`);
}

for (const name of [
  "PolicyDecision",
  "EvidenceSource",
  "EvidenceClaim",
  "SearchRequest",
  "SearchResult",
  "IncidentEvidenceBundle",
  "BenchmarkCard",
  "IntentEnvelope",
  "AttentionEvent",
  "ConnectorPolicy",
  "TrialCandidateReview",
  "ICPProfile",
  "OutcomeEvent",
  "ApprovalEvidence",
  "ReleaseGateResult",
  "ConsequentialAttribution"
]) requireIncludes("app/lib/scrimed-work/p32Contracts.ts", name);

for (const text of [
  "CapabilityManifest",
  "ExecutionGrant",
  "evaluateGovernedExecution",
  "verifyExecutionGrant",
  "GRANT_REPLAY_DETECTED",
  "GRANT_CANDIDATE_MISMATCH",
  "CURRENT_POLICY_HARD_BLOCK",
  "createGovernedExecutionReceipt",
  "containsRawPhi: false",
  "containsSecrets: false"
]) requireIncludes("app/lib/scrimed-work/governedRuntime.ts", text);

for (const text of [
  "executeClinicalSearchFabric",
  "rankClinicalSearchSources",
  "cross-tenant evidence",
  "retrieval-failed",
  "citationFaithfulness",
  "costPerAcceptedAnswerUsd",
  "phi-prohibited",
  "untrusted instruction-like content"
]) requireIncludes("app/lib/clinicalSearchFabric.ts", text);

for (const text of [
  "buildIncidentEvidenceBundle",
  "verifyIncidentEvidenceBundle",
  "reconstructIncidentTimeline",
  "appendIncidentEvidenceBundle",
  "liabilityDeterminationAllowed",
  "prohibited sensitive text"
]) requireIncludes("app/lib/scrimedTrustIncidentForensics.ts", text);

for (const text of [
  "normalizeModelMessageContent",
  "normalizeModelExecutionOutput",
  "compileIntentEnvelope",
  "reviewSyntheticTrialCandidate",
  "enrollmentAllowed: false",
  "randomizationAllowed: false",
  "deduplicateAttentionEvents",
  "evaluateConnectorAction",
  "termsChangeState",
  "compileIcpProfile",
  "automaticOutreachAllowed: false",
  "buildOutcomeEvent"
]) requireIncludes("app/lib/scrimedP32WorkflowControls.ts", text);

for (const text of [
  "HarnessScorecard",
  "HarnessHardGates",
  "calculateCostPerVerifiedTask",
  "evaluateHarnessCandidate",
  "selectParetoHarnessCandidates",
  "executeBoundedValidationLoop",
  "buildQuarantinedEvaluationCandidate",
  "createModelBOM",
  "createTamperEvidentOperationalEvent",
  "llmJudgeAuthoritative: false"
]) requireIncludes("app/lib/scrimedP32ProductionHarness.ts", text);

for (const text of [
  "CareContext",
  "TaskRisk",
  "evaluateCareContextPolicy",
  "ACUTE_CRITICAL_FAIL_CLOSED",
  "CAPABILITY_ELEVATION_DENIED",
  "executionAuthorityGranted: false"
]) requireIncludes("app/lib/scrimedP32CarePolicy.ts", text);

for (const text of [
  "DeviceProfile",
  "RuntimeState",
  "evaluateResourceAdmission",
  "SAFE_REFUSAL",
  "REMOTE_PHI_ROUTE_DISABLED_CURRENT_POLICY",
  "modelExecutionAuthorized: false"
]) requireIncludes("app/lib/scrimedP32ResourceAdmission.ts", text);

for (const text of [
  "CanonicalLongitudinalFact",
  "buildCanonicalLongitudinalFact",
  "benchmarkClinicalSerialization",
  "scoreLongitudinalDataQuality",
  "readTenantLongitudinalFacts",
  "authoritativeRecord: false"
]) requireIncludes("app/lib/scrimedP32ClinicalDataViews.ts", text);

for (const text of [
  "ClinicalComplexityAssessment",
  "assessClinicalSerializationComplexity",
  "selectSafeClinicalSerialization",
  "COMPLEX_CONTEXT_CANNOT_BE_TRUNCATED",
  "truncationAllowed: false"
]) requireIncludes("app/lib/scrimedP32ClinicalDataViews.ts", text);

for (const text of [
  "NormalizedMultimodalFact",
  "normalizeMultimodalFact",
  "detectMultimodalFactConflicts",
  "human-review-required",
  "clinicalAuthorityGranted: false"
]) requireIncludes("app/lib/scrimedP32MultimodalNormalization.ts", text);

for (const text of [
  "ArtifactRevision",
  "createStableDocumentId",
  "appendArtifactRevision",
  "createRecoverableTrashRevision",
  "createRecoverableRestoreRevision",
  "verifyArtifactLedger",
  "verifyArtifactBackup"
]) requireIncludes("app/lib/scrimedP32ArtifactLedger.ts", text);

for (const text of [
  "DeveloperSessionReceipt",
  "createDeveloperSessionReceipt",
  "scanSecretLikeMaterial",
  "buildRemoteRepoControlReport",
  "UNVERIFIED_REMOTE_OPERATOR_REQUIRED"
]) requireIncludes("app/lib/scrimedP32RepoOps.ts", text);

for (const text of [
  "evaluateRcmVoiceWorkItem",
  "SCRIMED_P32_RCM_VOICE_ENABLED",
  "human-exception-queue",
  "writebackExecuted: false",
  "externalCallExecuted: false"
]) requireIncludes("app/lib/scrimedP32RcmVoice.ts", text);

for (const text of [
  "ApplicationDisposition",
  "evaluateApplicationDisposition",
  "evaluateVendorChangeEvent",
  "MATERIAL_VENDOR_CHANGE_UNRESOLVED",
  "retirementExecuted: false",
  "recordExternalVendorClaimHypothesis"
]) requireIncludes("app/lib/scrimedP32ApplicationRationalization.ts", text);

requireIncludes(".env.example", "SCRIMED_P32_RCM_VOICE_ENABLED=false");
for (const text of [
  "Private Reporting",
  "Do not open a public GitHub issue",
  "Do not include exploit payloads, credentials, access tokens, PHI"
]) requireIncludes("SECURITY.md", text);

for (const text of [
  "buildP32ReleaseGateRegistry",
  "evaluateP32ApprovalEvidence",
  "createP32ApprovalEvidence",
  "evaluateP32AutomatedGateEvidence",
  "clean-reviewed-source-commit",
  "exact-source-artifact-provenance",
  "investor-deck-founder-counsel-finance-approval",
  "aal2-cli-evidence",
  "deployment-authorization",
  "customer-go-live-authorization",
  "aggregateReleaseAuthorityGranted: false"
]) requireIncludes("app/lib/scrimedP32ReleaseGates.ts", text);
for (const text of [
  "operatorAction",
  "responsibleRole",
  "commandOrForm",
  "consequenceOfRejection",
  "verificationProcedure",
  '"FAIL"',
  '"NOT_APPLICABLE"'
]) requireIncludes("app/lib/scrimedP32ReleaseGates.ts", text);

for (const text of [
  "buildP32GateEvidencePacket",
  "buildP32OperatorHandoff",
  "buildP32OperatorHandoffMarkdown",
  "READY_FOR_AUTHORIZED_OPERATOR",
  "WAIT_FOR_PREREQUISITES",
  "do not hand-author decision hashes",
  "source-commit-alignment",
  "artifact-fingerprint-alignment",
  "candidateReviewPacketReady",
  "warningCodes",
  "allGateEvidenceSatisfied",
  "releasePromotionAllowed: false",
  "aggregateReleaseAuthorityGranted: false"
]) requireIncludes("app/lib/scrimedP32GateEvidence.ts", text);

for (const text of [
  "buildEvidenceOpsBenchmarkCard",
  "evaluateEvidenceOpsBenchmarkPromotion",
  "originPlatform",
  "universalWinnerClaimAllowed: false",
  "worst material cell is not eligible"
]) requireIncludes("app/lib/scrimedClinicalBenchmarkSuite.ts", text);

for (const text of [
  "SCRIMED_BEDROCK_LUNA_MODEL_ID",
  "SCRIMED_BEDROCK_TERRA_MODEL_ID",
  "SCRIMED_BEDROCK_SOL_MODEL_ID",
  "requiresShadowEvaluation",
  "clinicalAuthorityGranted: false"
]) requireIncludes("app/lib/scrimed-work/providerRegistry.ts", text);

for (const text of [
  "providerHealth",
  "blockedProviderIds",
  "workflowAcceptanceByModel",
  "minimumHumanAcceptance",
  "silentFallbackAllowed: false",
  "runtimeState",
  "resourceAdmission"
]) requireIncludes("app/lib/scrimed-work/modelRouter.ts", text);

for (const text of [
  "p32ControlPlane",
  "clinicalSearchFabric"
]) requireIncludes("app/lib/healthcareIntelligenceOS.ts", text);

for (const text of [
  "P32 work and intelligence platform",
  "Clinical Search Fabric",
  "ModelFit routing",
  "Production Harness",
  "Memory-aware admission",
  "Guarded payer voice",
  "Fingerprint-bound release evidence"
]) requireIncludes("app/healthcare-intelligence-os/page.tsx", text);

for (const text of [
  "SCRIMED p.32 Architecture",
  "Cost Per Safe, Clinically Accepted Outcome",
  "Synthetic Local Development",
  "Rollback",
  "Release Gates"
]) requireIncludes("docs/scrimed-p32-architecture.md", text);

for (const text of [
  "test:scrimed-p32",
  "test:scrimed-p32-execution-harness",
  "test:scrimed-p32-release-hardening",
  "smoke:scrimed-p32",
  "test:scrimed-p32-release-evidence",
  "release:scrimed-p32-evidence:strict",
  "release:scrimed-p32-evidence:all-gates",
  "release:scrimed-p32-operator-packet"
]) requireIncludes("package.json", `\"${text}\"`);

for (const text of [
  "--operator-packet",
  "Use either --json or --operator-packet",
  "buildP32OperatorHandoffMarkdown"
]) requireIncludes("scripts/scrimed-p32-release-gate-evidence.mjs", text);

for (const text of [
  "Candidate-Bound Operator Handoff",
  "Candidate fingerprint",
  "release:scrimed-p32-operator-packet",
  "Never hand-author"
]) requireIncludes("docs/scrimed-p32-release-operations.md", text);
for (const text of [
  "security:secret-scan",
  "security:sbom",
  "release:migration-packet"
]) requireIncludes("package.json", `\"${text}\"`);

for (const text of [
  "scripts/scrimed-p32-policy-test.mjs",
  "scripts/scrimed-p32-execution-harness-policy-test.mjs",
  "scripts/scrimed-p32-release-hardening-policy-test.mjs",
  "scripts/scrimed-p32-contract-check.mjs",
  "scripts/scrimed-p32-release-gate-evidence.mjs"
]) requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", text);

for (const [path, text] of [
  [".github/CODEOWNERS", "@temitayodahunsi777"],
  [".github/dependabot.yml", "package-ecosystem: npm"],
  [".github/workflows/dependency-review.yml", "actions/dependency-review-action@v4"],
  [".github/workflows/codeql.yml", "github/codeql-action/analyze@v4"]
]) requireIncludes(path, text);

for (const path of [
  "app/lib/clinicalSearchFabric.ts",
  "app/lib/scrimedTrustIncidentForensics.ts",
  "app/lib/scrimedP32WorkflowControls.ts",
  "app/lib/scrimedP32ReleaseGates.ts",
  "app/lib/scrimedP32GateEvidence.ts",
  "app/lib/scrimedP32ControlPlane.ts",
  "app/lib/scrimedP32ProductionHarness.ts",
  "app/lib/scrimedP32CarePolicy.ts",
  "app/lib/scrimedP32ResourceAdmission.ts",
  "app/lib/scrimedP32ClinicalDataViews.ts",
  "app/lib/scrimedP32RcmVoice.ts",
  "app/lib/scrimedP32ApplicationRationalization.ts"
]) {
  if (/\bfetch\s*\(/.test(files[path])) throw new Error(`${path} must not perform external network calls in the p.32 control plane.`);
}

console.log("pass SCRIMED p.32 repository-native contract check");
