#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedIntelligenceSafetyStack.ts",
  "app/api/scrimed-intelligence-safety-stack/route.ts",
  "app/api/scrimed-intelligence-safety-stack/brief/route.ts",
  "app/api/scrimed-intelligence-safety-stack/evaluate/route.ts",
  "app/api/scrimed-intelligence-safety-stack/review-packets/route.ts",
  "app/api/scrimed-intelligence-safety-stack/regression-manifest/route.ts",
  "app/api/scrimed-intelligence-safety-stack/regression-promotion-gate/route.ts",
  "app/api/scrimed-intelligence-safety-stack/regression-disposition-preview/route.ts",
  "app/scrimed-intelligence-safety-stack/page.tsx",
  "docs/scrimed-intelligence-safety-stack.md",
  ".github/agents/security-auditor.md",
  ".github/agents/clinical-safety-reviewer.md",
  ".github/agents/fhir-integration-engineer.md",
  ".github/agents/ai-evaluation-engineer.md",
  ".github/agents/compliance-reviewer.md",
  "CONTRIBUTING.md",
  "README.md",
  ".github/workflows/ci.yml",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "evals/pytest/test_scrimed_intelligence_safety_stack.py"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED Intelligence & Safety Stack contract text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));

for (const expected of [
  "scrimed-intelligence-safety-stack-sentinel-ready-synthetic-only",
  "Project SENTINEL",
  "SentinelAgentIdentity",
  "SentinelActionRequest",
  "SentinelActionEvaluationPayload",
  "parseSentinelActionEvaluationRequest",
  "SentinelAuditEvent",
  "SentinelReviewPacket",
  "SentinelRegressionManifestCase",
  "SentinelRegressionManifest",
  "SentinelRegressionPromotionDecision",
  "SentinelRegressionPromotionCase",
  "SentinelRegressionPromotionGate",
  "SentinelRegressionDisposition",
  "SentinelRegressionDispositionPayload",
  "ParsedSentinelRegressionDispositionPreviewRequest",
  "SentinelRegressionDispositionPreview",
  "evaluateSentinelAgentAction",
  "getSentinelEvaluationSamples",
  "buildSentinelReviewPackets",
  "buildSentinelRegressionManifest",
  "buildSentinelRegressionPromotionGate",
  "parseSentinelRegressionDispositionPreviewRequest",
  "buildSentinelRegressionDispositionPreview",
  "getSentinelRegressionDispositionPreviewSamples",
  "denyByDefault: true",
  "identity",
  "policy_engine",
  "permission_check",
  "scoped_tool_access",
  "execution",
  "audit_log"
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "reviewPriorityForEvent",
  "requiredEvidenceForEvent",
  "sentinel-review-packet",
  "blocked_until_aal2_and_boundary_release",
  "allowedDisposition",
  "blockedDisposition",
  "needs_more_evidence",
  "persist protected evidence without AAL2",
  "store secrets or PHI",
  "sentinel-review-packets-cover-blocked-events",
  "sentinel-review-packets-cannot-dispose-to-execution",
  "sentinel-regression-manifest-covers-candidates",
  "sentinel-regression-manifest-is-nonsecret-review-only",
  "sentinel-regression-promotion-gate-blocks-unreviewed-cases",
  "sentinel-regression-promotion-gate-has-no-execution-authority",
  "candidate_manifest_ready_review_only",
  "candidate_pending_human_review",
  "promotion_gate_ready_review_only",
  "blocked_pending_human_review",
  "eligible_for_nonsecret_regression_metadata",
  "nonsecret_pytest_regression_metadata",
  "sentinelRegressionDispositionValues",
  "sentinelReviewerRoles",
  "sentinel-regression-disposition-preview-is-nonpersistent",
  "sentinel-regression-disposition-preview-rejects-secrets-and-phi",
  "needs_more_evidence",
  "noPersistencePerformed: true",
  "synthetic_metadata_only",
  "no PHI or secret fixture allowed",
  "no tool execution performed",
  "no external call performed",
  "autonomous clinical or payer action",
  "noExecutionAuthority: true"
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "database_deletion",
  "schema_change",
  "phi_export",
  "credential_rotation",
  "cloud_iam_change",
  "production_deploy",
  "payment_execution",
  "encryption_key_generation",
  "external_communication",
  "human_approval_required",
  "kill_switch_triggered",
  "runaway_agent",
  "abnormal_tool_calls",
  "privilege_escalation_attempt",
  "retry_storm",
  "suspicious_access_pattern"
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "sentinelActionTypes",
  "sentinelToolScopes",
  "sentinelDataClassifications",
  "token-like",
  "secret-like",
  "Unknown Sentinel agent identity.",
  "Unknown or unsupported Sentinel action type.",
  "Unknown or unsupported Sentinel tool scope.",
  "Unknown or unsupported Sentinel data classification.",
  "retryCount must be an integer from 0 to 50."
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "AiFlightRecorderStep",
  "AiFlightRecorderWalRecord",
  "local_write_ahead_log_then_sync",
  ".scrimed-runtime/agent-wal/*.jsonl",
  "metadata_only_no_secret_no_phi",
  "HumanEvaluationQueueItem",
  "failedTracePromotesToRegression",
  "pytestPath"
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "ClinicalCorrectnessEnvelope",
  "correctnessNotGuaranteed: true",
  "confidence",
  "evidenceQuality",
  "sourceQuality",
  "groundedness",
  "clinicalRedFlags",
  "clinicianInLoopRequired",
  "ClinicalAgentModelCard",
  "Capability demonstrations are not correctness guarantees."
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "FHIR",
  "HL7_V2",
  "CDA_CCDA",
  "DICOM_METADATA",
  "CSV",
  "JSONL",
  "SCANNED_DOCUMENT_OCR",
  "FREE_TEXT_CLINICAL_NOTES",
  "coordinate_level_redaction_required",
  "DocLang-style",
  "structure",
  "layout",
  "geometry",
  "tables",
  "images"
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "documentation_time_saved",
  "denial_reduction",
  "readmission_reduction",
  "referral_completion",
  "follow_up_completion",
  "medication_availability",
  "patient_comprehension",
  "100-200",
  "vanityMetricReplacement"
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "AgentOrchestrationState",
  "currentPlan",
  "toolHistory",
  "remainingSteps",
  "budget",
  "riskLevel",
  "SafetyModelRoute",
  "frontier",
  "open_weight",
  "local",
  "small_efficient",
  "quantized",
  "reasoning"
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "HIPAA",
  "GDPR",
  "EU_AI_ACT",
  "FDA_SAMD_READINESS",
  "MODEL_RISK_MANAGEMENT",
  "CLINICAL_SAFETY",
  "no_simulated_dependency",
  "no_false_relationship_claims",
  "clear_ai_disclosure",
  "crisis_escalation_hooks",
  "minor_safety_protections",
  "no_sensitive_history_training_without_opt_in"
]) {
  requireIncludes("app/lib/scrimedIntelligenceSafetyStack.ts", files["app/lib/scrimedIntelligenceSafetyStack.ts"], expected);
}

for (const expected of [
  "X-SCRIMED-Project-SENTINEL",
  "X-SCRIMED-Agent-Execution-Authority",
  "not-authorized-live-care",
  "synthetic-no-phi-metadata-only",
  "evaluateScrimedSafetyGate"
]) {
  requireIncludes("app/api/scrimed-intelligence-safety-stack/route.ts", files["app/api/scrimed-intelligence-safety-stack/route.ts"], expected);
}

for (const expected of [
  "sentinel-evaluation-ready-metadata-only",
  "parseSentinelActionEvaluationRequest",
  "evaluateSentinelAgentAction",
  "token-like-fields-rejected",
  "policy-evaluation-only-no-tool-execution",
  "no_tool_execution_performed",
  "no_external_call_performed",
  "human_approval_required",
  "kill_switch_triggered"
]) {
  requireIncludes(
    "app/api/scrimed-intelligence-safety-stack/evaluate/route.ts",
    files["app/api/scrimed-intelligence-safety-stack/evaluate/route.ts"],
    expected
  );
}

for (const expected of [
  "review-packets-ready-read-only-metadata",
  "buildSentinelReviewPackets",
  "review-packets-read-only",
  "review-only-no-tool-execution",
  "blocked-until-aal2-and-boundary-release",
  "no_tool_execution_performed",
  "no_external_call_performed",
  "no_phi_confirmed",
  "persist protected evidence without AAL2",
  "store secrets or PHI"
]) {
  requireIncludes(
    "app/api/scrimed-intelligence-safety-stack/review-packets/route.ts",
    files["app/api/scrimed-intelligence-safety-stack/review-packets/route.ts"],
    expected
  );
}

for (const expected of [
  "regression-manifest-ready-read-only-metadata",
  "buildSentinelRegressionManifest",
  "regression-manifest-read-only",
  "regression-review-only-no-tool-execution",
  "blocked-until-aal2-and-boundary-release",
  "synthetic-no-phi-no-secret-metadata-only",
  "no_tool_execution_performed",
  "no_external_call_performed",
  "no_phi_confirmed",
  "no_secret_fixture_confirmed",
  "autonomous clinical or payer action"
]) {
  requireIncludes(
    "app/api/scrimed-intelligence-safety-stack/regression-manifest/route.ts",
    files["app/api/scrimed-intelligence-safety-stack/regression-manifest/route.ts"],
    expected
  );
}

for (const expected of [
  "regression-promotion-gate-ready-read-only-metadata",
  "buildSentinelRegressionPromotionGate",
  "regression-promotion-gate-read-only",
  "promotion-gate-review-only-no-execution-authority",
  "blocked-until-aal2-and-boundary-release",
  "synthetic-no-phi-no-secret-metadata-only",
  "nonsecret_pytest_regression_metadata",
  "clinical authority",
  "payer submission",
  "EHR writeback",
  "secret or PHI fixture",
  "no_execution_authority",
  "no_tool_execution_performed",
  "no_external_call_performed",
  "no_phi_confirmed",
  "no_secret_fixture_confirmed"
]) {
  requireIncludes(
    "app/api/scrimed-intelligence-safety-stack/regression-promotion-gate/route.ts",
    files["app/api/scrimed-intelligence-safety-stack/regression-promotion-gate/route.ts"],
    expected
  );
}

for (const expected of [
  "regression-disposition-preview-ready-metadata-only",
  "parseSentinelRegressionDispositionPreviewRequest",
  "buildSentinelRegressionDispositionPreview",
  "getSentinelRegressionDispositionPreviewSamples",
  "disposition-preview-only-no-execution-authority",
  "token-like-fields-rejected",
  "PHI-like notes",
  "reviewer role mismatches",
  "needs_more_evidence",
  "no_persistence_performed",
  "no_execution_authority",
  "no_tool_execution_performed",
  "no_external_call_performed",
  "no_phi_confirmed",
  "no_secret_fixture_confirmed"
]) {
  requireIncludes(
    "app/api/scrimed-intelligence-safety-stack/regression-disposition-preview/route.ts",
    files["app/api/scrimed-intelligence-safety-stack/regression-disposition-preview/route.ts"],
    expected
  );
}

for (const expected of [
  "Project SENTINEL",
  "Sentinel Evaluator",
  "Review Packets",
  "Regression Manifest",
  "Promotion Gate",
  "Disposition Preview",
  "AI Flight Recorder",
  "Clinical Safety",
  "Healthcare Data Infrastructure",
  "Outcomes",
  "State-Aware Orchestration",
  "Compliance & Governance"
]) {
  requireIncludes("app/scrimed-intelligence-safety-stack/page.tsx", files["app/scrimed-intelligence-safety-stack/page.tsx"], expected);
  if (!["Sentinel Evaluator", "Review Packets"].includes(expected)) {
    requireIncludes("docs/scrimed-intelligence-safety-stack.md", files["docs/scrimed-intelligence-safety-stack.md"], expected);
  }
}

for (const expected of [
  "/api/scrimed-intelligence-safety-stack/evaluate",
  "metadata-only JSON",
  "rejects token-like or secret-like fields",
  "performs no tool execution",
  "performs no external calls"
]) {
  requireIncludes("docs/scrimed-intelligence-safety-stack.md", files["docs/scrimed-intelligence-safety-stack.md"], expected);
}

for (const expected of [
  "/api/scrimed-intelligence-safety-stack/review-packets",
  "read-only",
  "allowed dispositions",
  "blocked dispositions",
  "regression-candidate status",
  "cannot execute production actions",
  "persist protected evidence without AAL2",
  "store secrets or PHI"
]) {
  requireIncludes("docs/scrimed-intelligence-safety-stack.md", files["docs/scrimed-intelligence-safety-stack.md"], expected);
}

for (const expected of [
  "/api/scrimed-intelligence-safety-stack/regression-manifest",
  "synthetic metadata-only candidate test cases",
  "expected policy decisions",
  "required assertions",
  "reviewer gates",
  "deterministic manifest hashes",
  "no PHI fixture creation",
  "no secret fixture creation",
  "no autonomous clinical or payer action"
]) {
  requireIncludes("docs/scrimed-intelligence-safety-stack.md", files["docs/scrimed-intelligence-safety-stack.md"], expected);
}

for (const expected of [
  "/api/scrimed-intelligence-safety-stack/regression-promotion-gate",
  "nonsecret pytest regression metadata",
  "no execution authority",
  "cannot promote anything into production execution",
  "clinical authority",
  "payer submission",
  "EHR writeback",
  "external communication",
  "protected evidence persistence without AAL2",
  "secret or PHI fixtures",
  "human reviewer records a pass disposition"
]) {
  requireIncludes("docs/scrimed-intelligence-safety-stack.md", files["docs/scrimed-intelligence-safety-stack.md"], expected);
}

for (const expected of [
  "/api/scrimed-intelligence-safety-stack/regression-disposition-preview",
  "metadata-only reviewer dispositions",
  "pass, fail, or needs-more-evidence",
  "not a write path",
  "performs no persistence",
  "token-like fields",
  "PHI-like notes",
  "reviewer role mismatches",
  "unsupported dispositions",
  "Only a pass disposition can preview eligibility",
  "None of these previews authorize production execution"
]) {
  requireIncludes("docs/scrimed-intelligence-safety-stack.md", files["docs/scrimed-intelligence-safety-stack.md"], expected);
}

for (const [path, expected] of [
  [".github/agents/security-auditor.md", "Security Auditor"],
  [".github/agents/clinical-safety-reviewer.md", "Clinical Safety Reviewer"],
  [".github/agents/fhir-integration-engineer.md", "FHIR Integration Engineer"],
  [".github/agents/ai-evaluation-engineer.md", "AI Evaluation Engineer"],
  [".github/agents/compliance-reviewer.md", "Compliance Reviewer"],
  ["CONTRIBUTING.md", "Worktree-Friendly Development"],
  ["README.md", "SCRIMED Intelligence & Safety Stack"],
  [".github/workflows/ci.yml", "SCRIMED Intelligence & Safety Stack contract"],
  ["package.json", "smoke:scrimed-intelligence-safety-stack"],
  ["scripts/scrimed-nonsecret-test-suite.mjs", "SCRIMED Intelligence & Safety Stack contract"],
  ["evals/pytest/test_scrimed_intelligence_safety_stack.py", "test_sentinel_deny_by_default_contract"]
]) {
  requireIncludes(path, files[path], expected);
}

console.log("pass SCRIMED Intelligence & Safety Stack contract check");
