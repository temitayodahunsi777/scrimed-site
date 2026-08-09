#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const files = {
  registry: "app/lib/scrimedOSUpgradeBatch.ts",
  page: "app/scrimed-os/page.tsx",
  route: "app/api/scrimed-os/upgrade-batch/route.ts",
  briefRoute: "app/api/scrimed-os/upgrade-batch/brief/route.ts",
  docs: "docs/scrimed-os-upgrade-batch.md",
  packageJson: "package.json",
  nonsecretSuite: "scripts/scrimed-nonsecret-test-suite.mjs",
  publicSmoke: "scripts/public-production-smoke.mjs",
  navigation: "app/lib/navigationAudit.ts",
  readme: "README.md"
};

async function read(path) {
  return readFile(path, "utf8");
}

function requireIncludes(label, text, expected) {
  const missing = expected.filter((value) => !text.includes(value));

  if (missing.length > 0) {
    throw new Error(`${label} missing required text: ${missing.join(", ")}`);
  }
}

function requireNotIncludes(label, text, forbidden) {
  const found = forbidden.filter((value) => text.includes(value));

  if (found.length > 0) {
    throw new Error(`${label} contains forbidden text: ${found.join(", ")}`);
  }
}

const contents = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await read(path)]))
);

const forbiddenTokenMarkers = [
  "service_" + "role",
  "SCRIMED_" + "BEARER_TOKEN",
  "sk-" + "proj-",
  "sk_" + "live_",
  "Authorization: " + "Bearer"
];

requireIncludes("SCRIMED OS upgrade batch registry", contents.registry, [
  "scrimed-os-upgrade-batch-ready-no-phi",
  "/api/scrimed-os/upgrade-batch",
  "/api/scrimed-os/upgrade-batch/brief",
  "synthetic-metadata-only-no-live-phi",
  "productionBehavior",
  "externalModelCalls",
  "clinicalAuthority",
  "prompt-compression",
  "context-compression",
  "semantic-caching",
  "dynamic-model-routing",
  "RuntimeOptimizationRecord",
  "PromptEvolutionRecord",
  "deployment_status",
  "clinical_quality_judge",
  "evidence_judge",
  "safety_judge",
  "payer_policy_judge",
  "specialty_judge",
  "patient_readability_judge",
  "scores-and-rationale-hashes-only",
  "AI can pre-screen; clinician remains final authority.",
  "HumanOversightQueueItem",
  "risk_tier: \"high\"",
  "status: \"blocked\"",
  "executionAllowed: false",
  "AgentLabAgentRecord",
  "simulated_patient_case",
  "adversarial_prompt",
  "hallucination_check",
  "cost_check",
  "latency_check",
  "auditability_check",
  "cost_per_note",
  "cost_per_claim_review",
  "cost_per_prior_auth_draft",
  "cost_per_patient_summary",
  "cost_per_agent_run",
  "Diabetes Coach",
  "Heart Failure Monitor",
  "Oncology Navigator",
  "Population Health Agent",
  "Hospital Operations Agent",
  "memory_policy",
  "escalation_policy",
  "expiry_policy",
  "human_override_required",
  "FHIR",
  "SNOMED",
  "LOINC",
  "RxNorm",
  "ICD-10",
  "CPT",
  "payer policy",
  "clinical guidelines",
  "mapped",
  "partially_mapped",
  "blocked",
  "requires_review",
  "ModelRegressionWatchRecord",
  "autoPromoteToClinicalAuthority: false",
  "model-upgrades-cannot-auto-promote-clinical-authority",
  "literature synthesis",
  "biomarker discovery",
  "molecule ranking",
  "protocol optimization",
  "trial recruitment prediction",
  "research_preview",
  "drug recommendation",
  "therapeutic claim",
  "healthcare-native AI",
  "clinician-governed intelligence",
  "measurable outcomes",
  "model-agnostic infrastructure",
  "privacy-first deployment",
  "no live PHI",
  "no autonomous clinical care",
  "no production connector approval"
]);

requireNotIncludes("SCRIMED OS upgrade batch registry", contents.registry, forbiddenTokenMarkers);

requireIncludes("SCRIMED OS upgrade batch API route", contents.route, [
  "getScrimedOSUpgradeBatchSummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-OS-Upgrade-Batch",
  "X-SCRIMED-Production-Behavior",
  "X-SCRIMED-External-Model-Calls",
  "synthetic-metadata-only-no-live-phi"
]);

requireIncludes("SCRIMED OS upgrade batch brief route", contents.briefRoute, [
  "buildScrimedOSUpgradeBatchBrief",
  "scrimed-os-upgrade-batch.md",
  "text/markdown",
  "X-SCRIMED-OS-Upgrade-Batch"
]);

requireIncludes("SCRIMED OS page", contents.page, [
  "getScrimedOSUpgradeBatchSummary",
  "Runtime Optimizer",
  "Prompt Evolution Engine",
  "Clinical Judge Ensemble",
  "Cost per Outcome",
  "Long-Horizon Agent Registry",
  "Knowledge Fabric and Regression Watch",
  "/api/scrimed-os/upgrade-batch"
]);

requireIncludes("SCRIMED OS upgrade docs", contents.docs, [
  "# SCRIMED OS Upgrade Batch",
  "/api/scrimed-os/upgrade-batch",
  "/api/scrimed-os/upgrade-batch/brief",
  "Runtime Optimizer",
  "Prompt Evolution Engine",
  "Clinical Judge Ensemble",
  "Human Oversight Queue",
  "Agent Lab",
  "Token Economics Dashboard",
  "Long-Horizon Agent Registry",
  "Clinical Knowledge Fabric",
  "Model Regression Watch",
  "Life Sciences / Drug Discovery Readiness",
  "research_preview",
  "avoids FDA, HIPAA, SOC 2, clinical validation"
]);

requireIncludes("package scripts", contents.packageJson, [
  "\"smoke:scrimed-os-upgrade-batch\": \"node scripts/scrimed-os-upgrade-batch-contract-check.mjs\""
]);

requireIncludes("nonsecret suite", contents.nonsecretSuite, [
  "SCRIMED OS upgrade batch contract",
  "scripts/scrimed-os-upgrade-batch-contract-check.mjs"
]);

requireIncludes("public smoke", contents.publicSmoke, [
  "requireScrimedOSUpgradeBatchBoundary",
  "checkScrimedOSUpgradeBatch",
  "/api/scrimed-os/upgrade-batch",
  "/api/scrimed-os/upgrade-batch/brief"
]);

requireIncludes("navigation audit", contents.navigation, [
  "expectedApiRoutePatternCount = 450"
]);

requireIncludes("readme", contents.readme, [
  "SCRIMED OS Upgrade Batch boundary",
  "/api/scrimed-os/upgrade-batch",
  "/api/scrimed-os/upgrade-batch/brief"
]);

console.log("pass SCRIMED OS upgrade batch contract check");
