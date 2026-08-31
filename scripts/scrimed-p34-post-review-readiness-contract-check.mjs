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
  reviewState: await readFile("app/lib/scrimed-p34/exactHeadReviewState.ts", "utf8"),
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
  followOnGenerator: await readFile("scripts/generate-p34-follow-on-artifacts.mjs", "utf8"),
  candidateState: await readFile("scripts/lib/p34-candidate-state.mjs", "utf8"),
  baselineDoc: await readFile("docs/release/P34_CURRENT_EXACT_HEAD_BASELINE.md", "utf8"),
  reviewBrief: await readFile("docs/review/P34_EXACT_HEAD_REVIEW_BRIEF.md", "utf8"),
  fullMap: JSON.parse(await readFile("artifacts/review/p39-full-integration-map.json", "utf8")),
  reviewIndex: JSON.parse(await readFile("artifacts/review/p34-review-index.json", "utf8")),
  supabase: await readFile("docs/operators/SUPABASE_PASSWORD_SECURITY_CLOSURE.md", "utf8"),
  docs: await readFile("docs/P34_SYNTHETIC_PILOT_OPERATING_SYSTEM.md", "utf8")
};
files.currentExecutiveState = await readFile("docs/release/P34_CURRENT_EXECUTIVE_STATE.md", "utf8");
files.stackedReviewDoc = await readFile("docs/review/P34_STACKED_REVIEW_PLAN.md", "utf8");
files.currentHeadReviewBrief = await readFile("docs/review/P40_CURRENT_EXACT_HEAD_REVIEW_BRIEF.md", "utf8");
files.cumulativeAssuranceDoc = await readFile("docs/review/P34_CUMULATIVE_INTEGRATION_ASSURANCE.md", "utf8");
files.stackedReview = JSON.parse(await readFile("artifacts/review/p34-stacked-review-plan.json", "utf8"));
files.currentRiskMap = JSON.parse(await readFile("artifacts/review/p40-current-risk-map.json", "utf8"));
files.cumulativeAssurance = JSON.parse(await readFile("artifacts/review/p34-cumulative-integration-assurance.json", "utf8"));
files.p40RiskDiff = JSON.parse(await readFile("artifacts/review/p40-risk-ranked-diff.json", "utf8"));
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
  for (const state of [
    "NOT_REQUESTED",
    "REQUESTED",
    "CURRENT",
    "STALE",
    "CHANGES_REQUESTED",
    "APPROVED_EXACT_HEAD"
  ]) assert.ok(files.reviewState.includes(state), state);
  assert.ok(files.review.includes('trustClass: "trusted-external"'));
  assert.ok(files.review.includes("signatureVerified: true"));
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

await check("stacked-review-model-keeps-predecessor-delta-and-integration-distinct", async () => {
  assert.deepEqual(
    files.stackedReview.reviewOrder,
    ["LANE_A_PREDECESSOR", "LANE_B_DELTA", "LANE_C_INTEGRATION_ASSURANCE"]
  );
  assert.equal(files.stackedReview.lanes[0].pullRequestNumber, 39);
  assert.equal(files.stackedReview.lanes[0].headCommit, "45be650f48e422b05160821681ff40bb9f1229c9");
  assert.equal(files.stackedReview.lanes[1].pullRequestNumber, 40);
  assert.equal(files.stackedReview.lanes[2].humanApprovalSubstitutionAllowed, false);
  assert.equal(files.stackedReview.humanApprovalPresent, false);
  assert.equal(files.stackedReview.mergeAuthorityGranted, false);
  assert.equal(files.stackedReview.productionAuthorityGranted, false);
  assert.ok(files.stackedReviewDoc.includes("PR #40 approval alone cannot establish assurance"));
});

await check("cumulative-assurance-covers-main-to-final-without-fabricating-approval", async () => {
  assert.equal(files.cumulativeAssurance.baseCommit, "fd2a4d09174726e5ba685673fe1f0df25f2ad308");
  assert.equal(files.cumulativeAssurance.unexplainedFileCount, 0);
  assert.equal(files.cumulativeAssurance.files.length, files.cumulativeAssurance.cumulativeFileCount);
  assert.equal(files.cumulativeAssurance.automatedEvidenceIsHumanApproval, false);
  assert.equal(files.cumulativeAssurance.humanApprovalPresent, false);
  assert.equal(files.cumulativeAssurance.finalHeadBinding, "artifacts/release/scrimed-p34-release-manifest.json");
  assert.ok(files.cumulativeAssuranceDoc.includes("automated assurance evidence"));
});

await check("current-risk-map-reuses-one-risk-source-of-truth", async () => {
  assert.equal(files.currentRiskMap.sourceArtifact, "artifacts/review/p40-risk-ranked-diff.json");
  assert.equal(files.currentRiskMap.sourceFingerprint, files.p40RiskDiff.diffFingerprint);
  assert.ok(files.currentRiskMap.criticalAndHighFiles.length > 0);
  assert.ok(files.currentRiskMap.criticalAndHighFiles.every((entry) => ["CRITICAL", "HIGH"].includes(entry.risk)));
  assert.equal(files.currentRiskMap.humanApprovalPresent, false);
  assert.ok(files.currentHeadReviewBrief.includes("Target reading time: **10 minutes or less**"));
});

await check("current-executive-state-keeps-runtime-binding-and-operator-gates", async () => {
  for (const required of [
    "P34 STACKED REVIEW READY",
    "artifacts/release/scrimed-p34-release-manifest.json",
    "EXACT_REVIEW_REQUIRED",
    "OPERATOR_ACTION_REQUIRED",
    "PRODUCTION_MIGRATION_AUTHORIZATION_REQUIRED",
    "MERGE_AUTHORIZATION_REQUIRED"
  ]) assert.ok(files.currentExecutiveState.includes(required), required);
  assert.ok(files.candidateState.includes("p34MainReviewBase"));
  assert.ok(files.candidateState.includes("inspectP34CumulativeIntegrationState"));
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
  assert.ok(files.cost.includes('status === "STOP_SAFELY"'));
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
  for (const required of [
    "P34_CURRENT_EXECUTIVE_STATE.md",
    "P34_STACKED_REVIEW_PLAN.md",
    "P34_CUMULATIVE_INTEGRATION_ASSURANCE.md",
    "P40_CURRENT_EXACT_HEAD_REVIEW_BRIEF.md",
    "p34-stacked-review-plan.json",
    "p34-cumulative-integration-assurance.json",
    "p40-current-risk-map.json"
  ]) assert.ok(files.followOnGenerator.includes(required), required);
});

console.log(`SCRIMED p.34 post-review readiness contract checks: ${passed}/${passed} passed`);
