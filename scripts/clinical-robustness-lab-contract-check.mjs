#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/clinicalRobustnessLab.ts",
  "app/clinical-robustness-lab/page.tsx",
  "app/api/clinical-robustness-lab/route.ts",
  "app/api/clinical-robustness-lab/brief/route.ts",
  "app/lib/executionAttemptEnvelope.ts",
  "app/lib/siteNavigation.ts",
  "docs/clinical-robustness-lab.md",
  "package.json",
  "scripts/clinical-robustness-lab-contract-check.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required Clinical Robustness Lab contract text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/clinicalRobustnessLab.ts"];
const page = files["app/clinical-robustness-lab/page.tsx"];
const api = files["app/api/clinical-robustness-lab/route.ts"];
const brief = files["app/api/clinical-robustness-lab/brief/route.ts"];
const envelope = files["app/lib/executionAttemptEnvelope.ts"];
const nav = files["app/lib/siteNavigation.ts"];
const docs = files["docs/clinical-robustness-lab.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "clinicalRobustnessLabStatus",
  "clinicalRobustnessLabBoundary",
  "clinicalRobustnessProducts",
  "clinicalRobustnessPerturbations",
  "clinicalRobustnessScenarios",
  "buildClinicalRobustnessScorecard",
  "getClinicalRobustnessLabSummary",
  "buildClinicalRobustnessLabBrief",
  "Sanar AI",
  "Clinical Copilot",
  "DocuTwin",
  "Ambient Scribe",
  "CareExplain",
  "Perfect Chart",
  "TrialCore",
  "OncoID",
  "missing data",
  "missing-labs-risk",
  "missing-imaging-risk",
  "conflicting data",
  "abbreviations",
  "noisy notes",
  "note-only-blind-spot",
  "wrong units",
  "multilingual notes",
  "incomplete records",
  "temporal inconsistencies",
  "hallucination risk",
  "citation-reference-quality",
  "guideline-grounding",
  "demographic-bias-risk",
  "data-freshness",
  "model-disagreement",
  "human-review-requirement",
  "clinical readiness scores",
  "Research/demo use only. Not for diagnosis, treatment, prescribing, or live patient care.",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-authorized-autonomous-clinical-action",
  "not-certified-readiness-only",
  "human-review-required",
  "NO-GO for live clinical production"
]) {
  requireIncludes("app/lib/clinicalRobustnessLab.ts", source, expected);
}

for (const expected of [
  "Clinical Robustness Lab",
  "Adversarial clinical readiness testing",
  "summary.useNotice",
  "Clinical readiness scores are not clinical validation or production approval",
  "Perturbations",
  "Clinical robustness scenario scorecards",
  "Bind robustness results to durable execution evidence"
]) {
  requireIncludes("app/clinical-robustness-lab/page.tsx", page, expected);
}

for (const expected of [
  "X-SCRIMED-Clinical-Robustness-Lab",
  "X-SCRIMED-Data-Boundary",
  "X-SCRIMED-PHI-Authority",
  "X-SCRIMED-Clinical-Authority",
  "X-SCRIMED-Autonomous-Clinical-Authority",
  "X-SCRIMED-Certification-Authority",
  "X-SCRIMED-Reviewer-Gate"
]) {
  requireIncludes("app/api/clinical-robustness-lab/route.ts", api, expected);
  requireIncludes("app/api/clinical-robustness-lab/brief/route.ts", brief, expected);
}

for (const expected of [
  "clinicalRobustnessBindingForInput",
  "clinicalRobustnessScenarioRefsByWorkflow",
  "execution-attempt-clinical-robustness-binding",
  "clinicalRobustnessScenarioBindingCount",
  "clinicalRobustnessPerturbationBindingCount",
  "clinicalRobustnessRequiredPerturbationCount",
  "evidenceAuditTrailCount",
  "human-review-required",
  "synthetic-no-phi-only",
  "Clinical Robustness Lab"
]) {
  requireIncludes("app/lib/executionAttemptEnvelope.ts", envelope, expected);
}

for (const expected of [
  "Robustness Lab",
  "/clinical-robustness-lab",
  "No-PHI adversarial clinical readiness lab"
]) {
  requireIncludes("app/lib/siteNavigation.ts", nav, expected);
}

for (const expected of [
  "System Architecture",
  "Module Boundaries",
  "Interfaces",
  "Data Models",
  "missing labs",
  "citation/reference quality",
  "Research/demo use only",
  "Threat Model",
  "Test Plan",
  "Migration Plan",
  "Rollout Plan",
  "Operating Boundary",
  "npm run smoke:clinical-robustness-lab",
  "does not authorize PHI processing"
]) {
  requireIncludes("docs/clinical-robustness-lab.md", docs, expected);
}

for (const expected of [
  "\"smoke:clinical-robustness-lab\": \"node scripts/clinical-robustness-lab-contract-check.mjs\""
]) {
  requireIncludes("package.json", packageJson, expected);
}

for (const expected of [
  "scripts/clinical-robustness-lab-contract-check.mjs"
]) {
  requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", suite, expected);
}

console.log("pass clinical robustness lab contract check");
