import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createPendingP34Aal2Evidence,
  createPendingP34PreviewObservability
} from "./lib/p34-post-review-runtime-evidence.mjs";

let passed = 0;
async function check(name, run) {
  await run();
  passed += 1;
  console.log(`pass ${name}`);
}

const files = {
  baseline: await readFile("app/lib/scrimed-p34/exactHeadBaseline.ts", "utf8"),
  review: await readFile("app/lib/scrimed-p34/reviewReadiness.ts", "utf8"),
  preview: await readFile("app/lib/release/previewAcceptance.ts", "utf8"),
  templates: await readFile("app/lib/commercial/pilotTemplateRegistry.ts", "utf8"),
  manifest: await readFile("app/lib/commercial/pilotManifest.ts", "utf8"),
  pilotOs: await readFile("app/lib/commercial/pilotOperatingSystem.ts", "utf8"),
  cost: await readFile("app/lib/economics/pilotCostGovernor.ts", "utf8"),
  product: await readFile("app/product/page.tsx", "utf8"),
  pilotPage: await readFile("app/synthetic-pilot/page.tsx", "utf8"),
  aal2: await readFile("scripts/run-aal2-candidate-verification.mjs", "utf8"),
  generator: await readFile("scripts/generate-p34-post-review-artifacts.mjs", "utf8"),
  baselineDoc: await readFile("docs/release/P34_CURRENT_EXACT_HEAD_BASELINE.md", "utf8"),
  reviewBrief: await readFile("docs/review/P34_EXACT_HEAD_REVIEW_BRIEF.md", "utf8"),
  fullMap: JSON.parse(await readFile("artifacts/review/p39-full-integration-map.json", "utf8")),
  reviewIndex: JSON.parse(await readFile("artifacts/review/p34-review-index.json", "utf8")),
  supabase: await readFile("docs/operators/SUPABASE_PASSWORD_SECURITY_CLOSURE.md", "utf8"),
  docs: await readFile("docs/P34_SYNTHETIC_PILOT_OPERATING_SYSTEM.md", "utf8")
};
files.aal2Evidence = createPendingP34Aal2Evidence(files.reviewIndex.exactReviewTarget);
files.observability = createPendingP34PreviewObservability(files.reviewIndex.exactReviewTarget);

await check("exact-head-baseline-is-frozen", async () => {
  for (const value of [
    "45be650f48e422b05160821681ff40bb9f1229c9",
    "f1d68282f84243a0e20d51eeb47775aff293a6f8",
    "184b07843e9eaa4a0dd0bc2c783944b66df7cbc95b05dc37930663197ae71d16",
    "dpl_MPSXXudmikWZduLxEvAY8afTtXvz"
  ]) assert.ok(`${files.baseline}\n${files.baselineDoc}`.includes(value), value);
});

await check("review-status-remains-read-only-and-external", async () => {
  assert.ok(files.review.includes("EXACT_REVIEW_REQUESTED_RUNTIME_UNBOUND"));
  assert.ok(files.review.includes("independentlyVerifiedByRuntime: false"));
  assert.ok(files.review.includes("productionAuthorityGranted: false"));
});

await check("review-index-compresses-complete-map", async () => {
  assert.equal(files.fullMap.fileCount, 314);
  assert.equal(files.fullMap.unexplainedFileCount, 0);
  assert.equal(files.reviewIndex.targetReviewMinutes.minimum, 10);
  assert.equal(files.reviewIndex.targetReviewMinutes.maximum, 15);
  assert.equal(files.reviewIndex.integrationMapHash, files.fullMap.mapHash);
  assert.ok(files.reviewBrief.includes("65-file precision wave"));
});

await check("preview-acceptance-is-exact-bound-with-no-authority", async () => {
  for (const required of [
    "DEPLOYMENT_ID_MISMATCH",
    "COMMIT_MISMATCH",
    "TREE_MISMATCH",
    "CANDIDATE_MISMATCH",
    "PRODUCTION_ALIAS_ATTACHED",
    "NONPRODUCTION_PREVIEW_ACCEPTED",
    "productionAuthorized: false",
    "customerGoLiveAuthorized: false"
  ]) assert.ok(files.preview.includes(required), required);
});

await check("pilot-template-registry-has-six-safe-templates", async () => {
  for (const required of [
    "Workflow Intelligence Assessment",
    "RCM Workflow Intelligence",
    "Enterprise AI Governance",
    "Documentation Quality",
    "Model/Agent Assurance",
    "Public-Sector Workflow Intelligence"
  ]) assert.ok(files.templates.includes(required), required);
  assert.ok(files.templates.includes("bindingQuoteAuthorized: false"));
});

await check("pilot-manifest-enforces-control-contract", async () => {
  for (const required of [
    "noPhi: true",
    "nonproduction: true",
    "noClinicalExecution: true",
    "noCustomerSystemWrites: true",
    "noPayerSubmission: true",
    "noEhrWriteback: true",
    "noDeviceWriteback: true",
    "PILOT_CONTROL_CONTRACT_INCOMPLETE"
  ]) assert.ok(files.manifest.includes(required), required);
});

await check("pilot-operating-system-is-deterministic-and-human-controlled", async () => {
  for (const required of [
    "DUPLICATE_EXECUTION_BLOCKED",
    "NONSEQUENTIAL_TRANSITION_BLOCKED",
    "OBJECTIVE_THRESHOLD_MISSED",
    "PREPARE_PROTECTED_PILOT",
    "INSURANCE_READINESS_REQUIRED",
    "COUNSEL_REVIEW_REQUIRED",
    "agentMaySign: false",
    "automaticOutreachAuthorized: false"
  ]) assert.ok(files.pilotOs.includes(required), required);
});

await check("cost-governor-stops-overrun-and-keeps-pricing-estimated", async () => {
  assert.ok(files.cost.includes('status === "STOP"'));
  assert.ok(files.cost.includes("TOTAL_BUDGET_EXCEEDED"));
  assert.ok(files.cost.includes('classification: "ESTIMATED"'));
  assert.ok(files.cost.includes("bindingQuoteAuthorized: false"));
});

await check("aal2-and-observability-artifacts-are-redacted-and-pending", async () => {
  const aal2Text = JSON.stringify(files.aal2Evidence);
  assert.equal(files.aal2Evidence.assuranceResult, "OPERATOR_ACTION_REQUIRED");
  assert.equal(aal2Text.includes("tokenFingerprint"), false);
  assert.equal(aal2Text.includes("subjectFingerprint"), false);
  assert.equal(files.observability.acceptanceState, "RELEASE_STEWARD_ACCEPTANCE_REQUIRED");
  assert.equal(files.observability.productionAliasAttached, false);
  assert.ok(files.aal2.includes("--write-evidence"));
});

await check("product-ui-exposes-review-preview-and-pilot-controls", async () => {
  const joined = `${files.product}\n${files.pilotPage}`;
  for (const required of [
    "Protected preview acceptance",
    "Pilot control contract",
    "Cost and expansion governor",
    "Objective success criteria",
    "Automatic outreach: no"
  ]) assert.ok(joined.includes(required), required);
});

await check("operator-docs-retain-supabase-and-production-boundaries", async () => {
  assert.ok(files.supabase.includes("auth_leaked_password_protection"));
  assert.ok(files.supabase.includes("Prevent use of leaked passwords"));
  assert.ok(files.docs.includes("no PHI"));
  assert.ok(files.docs.includes("Production, PHI, clinical autonomy"));
});

await check("artifact-generator-covers-all-required-post-review-outputs", async () => {
  for (const required of [
    "P34_CURRENT_EXACT_HEAD_BASELINE.md",
    "P34_EXACT_HEAD_REVIEW_BRIEF.md",
    "P39_FULL_INTEGRATION_MAP.md",
    "p34-review-index.json",
    "p34-aal2-evidence.json",
    "p34-preview-observability.json"
  ]) assert.ok(files.generator.includes(required), required);
  assert.ok(files.generator.includes("p34RuntimeEvidencePaths"));
});

console.log(`SCRIMED p.34 post-review readiness contract checks: ${passed}/${passed} passed`);
