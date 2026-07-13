#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedIntelligencePlatform.ts",
  "app/scrimed-intelligence-platform/page.tsx",
  "app/api/scrimed-intelligence-platform/route.ts",
  "app/api/scrimed-intelligence-platform/brief/route.ts",
  "app/api/scrimed-intelligence-platform/evaluate/route.ts",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "docs/scrimed-intelligence-platform.md",
  "package.json",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED Intelligence Platform contract text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));

for (const expected of [
  "scrimed-intelligence-platform-active-synthetic-only",
  "ScrimedIntelligenceRouteMetadata",
  "clinical_intelligence",
  "rcm",
  "research",
  "imaging",
  "genomics",
  "ambient_scribe",
  "docutwin",
  "care_explain",
  "trialcore",
  "trust_engine",
  "education",
  "operations",
  "risk_level",
  "data_classification",
  "allowed_tools",
  "blocked_tools",
  "human_review_required"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "ScrimedClinicalMemoryNode",
  "ScrimedClinicalMemoryEdge",
  "guideline",
  "sop",
  "research",
  "patient_education",
  "care_pathway",
  "insurance_policy",
  "drug",
  "ontology",
  "workflow",
  "provenance",
  "synthetic: true"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "ScrimedAiOutputEnvelope",
  "sources",
  "confidence_score",
  "uncertainty_reason",
  "missing_evidence",
  "model_version",
  "timestamp",
  "human_validation_status",
  "clinical_disclaimer",
  "audit_hash",
  "generateScrimedAuditHash",
  "scrimed-internal-synthetic-router-v1"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "ScrimedAiFlightRecord",
  "request_id",
  "user_intent",
  "retrieved_context_ids",
  "tool_calls",
  "latency_ms",
  "model_used",
  "model_cost_estimate",
  "safety_flags",
  "reviewer_notes",
  "override_status",
  "flight-synthetic-clinical-001"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "hallucination_guard",
  "provenance_required",
  "confidence_required",
  "blocked_phi",
  "blocked_autonomous_clinical_action",
  "latency_budget_metadata",
  "regression_eval_placeholder",
  "release_blocking",
  "ScrimedIntelligenceEvaluationRequest",
  "ScrimedIntelligenceEvaluationResult",
  "parseScrimedIntelligenceEvaluationRequest",
  "evaluateScrimedIntelligenceRequest",
  "getScrimedIntelligenceEvaluationSamples",
  "evaluation-human-review-required",
  "evaluation-blocked",
  "blocked_tool_requested",
  "metadata-only"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "generateSyntheticCohort",
  "deterministic-seeded-synthetic-only",
  "fhir_r4_bundle_stub",
  "json_export",
  "csv_export",
  "claims_stub",
  "resourceType: \"Bundle\"",
  "resourceType: \"Patient\"",
  "resourceType: \"Observation\"",
  "resourceType: \"Encounter\"",
  "resourceType: \"Claim\""
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "readmissions",
  "los",
  "complications",
  "denials",
  "authorization_time",
  "collections",
  "documentation_time",
  "scheduling_capacity",
  "provider_burden",
  "health_literacy",
  "engagement",
  "accessibility"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "openai",
  "anthropic",
  "gemini",
  "local_open_weight",
  "scrimed_internal",
  "routeScrimedIntelligenceModel",
  "cost",
  "latency",
  "privacy",
  "accuracy_requirement",
  "risk_level",
  "deployment_region",
  "blocked_phi",
  "human_review_required",
  "no_external_call_performed"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "Foundations",
  "Clinical AI",
  "Responsible AI",
  "FHIR",
  "HL7",
  "Medical Imaging AI",
  "RCM AI",
  "Governance",
  "Implementation",
  "Research",
  "Executive Leadership",
  "Developer Certification",
  "Partner Certification",
  "Hospital Certification",
  "not regulatory certification"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
}

for (const expected of [
  "no live PHI",
  "no raw connector payload logging",
  "no autonomous diagnosis",
  "no treatment or prescribing decisions",
  "no imaging interpretation as final medical decision",
  "no payer submission",
  "no EHR writeback",
  "no production customer activation",
  "no regulatory certification claims",
  "diagnose live patient and write to EHR"
]) {
  requireIncludes(
    "app/lib/scrimedIntelligencePlatform.ts",
    files["app/lib/scrimedIntelligencePlatform.ts"],
    expected
  );
  requireIncludes("docs/scrimed-intelligence-platform.md", files["docs/scrimed-intelligence-platform.md"], expected);
}

for (const expected of [
  "X-SCRIMED-Intelligence-Platform",
  "getScrimedIntelligencePlatformSummary",
  "synthetic-and-metadata-only",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-authorized-customer-go-live",
  "not-final-medical-interpretation",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/scrimed-intelligence-platform/route.ts",
    files["app/api/scrimed-intelligence-platform/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Intelligence-Platform",
  "buildScrimedIntelligencePlatformBrief",
  "text/markdown",
  "synthetic-and-metadata-only",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-authorized-customer-go-live",
  "not-final-medical-interpretation",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/scrimed-intelligence-platform/brief/route.ts",
    files["app/api/scrimed-intelligence-platform/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "scrimedIntelligencePlatformEvaluateRoute",
  "evaluateScrimedIntelligenceRequest",
  "parseScrimedIntelligenceEvaluationRequest",
  "metadata-only",
  "raw clinical notes",
  "tokens or secrets",
  "invalid-intelligence-evaluation-request",
  "no_external_call_performed",
  "not-authorized-production-phi",
  "not-authorized-live-care"
]) {
  requireIncludes(
    "app/api/scrimed-intelligence-platform/evaluate/route.ts",
    files["app/api/scrimed-intelligence-platform/evaluate/route.ts"],
    expected
  );
}

for (const expected of [
  "SCRIMED Intelligence Platform",
  "Intelligence Mesh",
  "Clinical Memory Graph",
  "Provenance and Confidence Engine",
  "AI Flight Recorder",
  "Evaluation Pipeline",
  "Evaluation Gate",
  "Synthetic Patient Studio",
  "Outcome Intelligence",
  "Provider-neutral Model Router",
  "SCRIMED University",
  "NO-GO"
]) {
  requireIncludes("docs/scrimed-intelligence-platform.md", files["docs/scrimed-intelligence-platform.md"], expected);
}

for (const expected of [
  "getScrimedIntelligencePlatformSummary",
  "Inspect Platform API",
  "Download Brief",
  "Evaluation Gate",
  "Intelligence Mesh",
  "Clinical Memory Graph",
  "Provenance",
  "Flight Recorder",
  "Model Router",
  "Synthetic Patient Studio",
  "Outcome Intelligence",
  "SCRIMED University",
  "NO-GO"
]) {
  requireIncludes("app/scrimed-intelligence-platform/page.tsx", files["app/scrimed-intelligence-platform/page.tsx"], expected);
}

for (const expected of [
  "href: \"/scrimed-intelligence-platform\"",
  "Intelligence Platform",
  "Synthetic-only intelligence mesh"
]) {
  requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], expected);
}

for (const expected of [
  "\"/scrimed-intelligence-platform\"",
  "smokeCoveredHtmlRoutes"
]) {
  requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], expected);
}

for (const expected of [
  "checkScrimedIntelligencePlatform",
  "requireScrimedIntelligencePlatformBoundary",
  "await checkHtml(\"/scrimed-intelligence-platform\")",
  "await checkScrimedIntelligencePlatform()",
  "/api/scrimed-intelligence-platform/evaluate",
  "evaluation-gate-ready-synthetic-only",
  "evaluation-human-review-required",
  "invalid-intelligence-evaluation-request",
  "no_external_call_performed",
  "public response must not expose bearer tokens"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], expected);
}

for (const expected of [
  "\"smoke:scrimed-intelligence-platform\": \"node scripts/scrimed-intelligence-platform-contract-check.mjs\""
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

for (const expected of [
  "SCRIMED Intelligence Platform contract",
  "scripts/scrimed-intelligence-platform-contract-check.mjs"
]) {
  requireIncludes(
    "scripts/scrimed-nonsecret-test-suite.mjs",
    files["scripts/scrimed-nonsecret-test-suite.mjs"],
    expected
  );
}

console.log("pass SCRIMED Intelligence Platform contract check");
