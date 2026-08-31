#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const paths = [
  ".gitignore",
  "package.json",
  "config/performance-budgets.json",
  "app/lib/commercial/pilotManifest.ts",
  "app/lib/commercial/pilotOperatingSystem.ts",
  "app/lib/economics/pilotCostGovernor.ts",
  "app/lib/scrimed-p34/exactHeadBaseline.ts",
  "app/lib/scrimed-p34/exactHeadReviewState.ts",
  "app/lib/scrimed-p34/reviewReadiness.ts",
  "app/lib/release/previewAcceptance.ts",
  "app/lib/productConsole.ts",
  "scripts/lib/p34-candidate-state.mjs",
  "scripts/lib/vercel-preview-access.mjs",
  "scripts/generate-p34-build-inventory.mjs",
  "scripts/build-with-p34-inventory.mjs",
  "scripts/generate-p34-follow-on-artifacts.mjs",
  "scripts/scrimed-p34-evidence.mjs",
  "scripts/scrimed-p34-certify.mjs",
  "scripts/scrimed-p34-verify-preview.mjs",
  "scripts/scrimed-p34-pilot-assurance-adversarial-test.mjs",
  "artifacts/build/routes.json",
  "artifacts/build/render-inventory.json",
  "artifacts/review/p40-review-index.json",
  "artifacts/review/p40-full-integration-map.json",
  "artifacts/review/p40-risk-ranked-diff.json",
  "docs/release/P34_CURRENT_CANONICAL_BASELINE.md",
  "docs/release/P34_EXECUTIVE_CANONICAL_STATE.md",
  "docs/release/P40_SOURCE_CONTROL_INTEGRITY.md",
  "docs/review/P40_EXACT_HEAD_REVIEW_BRIEF.md",
  "docs/review/P40_EXECUTIVE_REVIEW_BRIEF.md",
  "docs/review/P40_RISK_RANKED_DIFF.md",
  "docs/review/P40_FULL_INTEGRATION_MAP.md",
  "docs/operators/SUPABASE_LEAKED_PASSWORD_CLOSEOUT.md",
  "docs/platform/MACOS_SWC_ENVIRONMENT_NOTE.md"
];
const files = Object.fromEntries(await Promise.all(paths.map(async (path) => [path, await readFile(path, "utf8")])));
const packageJson = JSON.parse(files["package.json"]);
const performance = JSON.parse(files["config/performance-budgets.json"]);

for (const script of ["scrimed:p34:evidence", "scrimed:p34:certify", "scrimed:p34:verify-preview", "scrimed:p34:aal2"]) {
  assert.equal(typeof packageJson.scripts[script], "string", script);
}
assert.equal(performance.routeInventory.manualExpectedCountsAllowed, false);
assert.equal(performance.routeInventory.builtRoutesArtifact, "artifacts/build/routes.json");
assert.equal(performance.routeInventory.generationArtifact, "artifacts/build/render-inventory.json");
assert.equal(performance.routeInventory.buildMayOverwriteBaseline, false);
assert.equal(files["app/lib/scrimed-p34/exactHeadBaseline.ts"].includes("builtRouteCount"), false);
assert.equal(JSON.parse(files["artifacts/build/routes.json"]).builtRouteCount > 0, true);
assert.equal(JSON.parse(files["artifacts/build/render-inventory.json"]).prerenderedRouteCount > 0, true);
assert.equal(JSON.parse(files["artifacts/review/p40-full-integration-map.json"]).unexplainedFileCount, 0);
assert.equal(JSON.parse(files["artifacts/review/p40-review-index.json"]).reviewState, "EXACT_REVIEW_REQUIRED");
assert.equal(JSON.parse(files["artifacts/review/p40-risk-ranked-diff.json"]).unexplainedFileCount, 0);
assert.equal(JSON.parse(files["artifacts/review/p40-risk-ranked-diff.json"]).rankOrder[0], "CRITICAL");

for (const state of ["NOT_REQUESTED", "REQUESTED", "CURRENT", "STALE", "CHANGES_REQUESTED", "APPROVED_EXACT_HEAD"]) {
  assert.ok(files["app/lib/scrimed-p34/exactHeadReviewState.ts"].includes(state), state);
}
for (const control of [
  "dataSourceClassification",
  "scenarioVersion",
  "agentPolicyVersion",
  "toolPolicyVersion",
  "runtimeCeilingMinutes",
  "modelCallCeiling",
  "toolCallCeiling",
  "agentDepthCeiling",
  "evidenceStorageCeilingBytes",
  "NO_BINDING_COMMERCIAL_AUTHORITY_REQUIRED"
]) assert.ok(files["app/lib/commercial/pilotManifest.ts"].includes(control), control);

for (const control of [
  "transitionPilotLifecycleAtomically",
  "COMPLETE_SYNTHETIC_LEDGER",
  "verifyPilotEvidenceLedger",
  "productionBenchmarkClaimAuthorized: false",
  "deliveryDateCommitmentAuthorized: false",
  "protectedPilotAuthorized: false"
]) assert.ok(files["app/lib/commercial/pilotOperatingSystem.ts"].includes(control), control);

for (const control of ["STOP_SAFELY", "maxModelCalls", "maxToolCalls", "maxAgentDepth", "maxEvidenceStorageBytes", "InMemorySyntheticPilotBudgetLedger"]) {
  assert.ok(files["app/lib/economics/pilotCostGovernor.ts"].includes(control), control);
}
assert.ok(files["app/lib/productConsole.ts"].includes("p34CurrentCandidatePosture"));
assert.ok(files["scripts/lib/p34-candidate-state.mjs"].includes("requireP34ExactPreviewBinding"));
assert.ok(files["scripts/lib/p34-candidate-state.mjs"].includes("normalizeVercelPreviewOrigin"));
assert.ok(files["scripts/lib/vercel-preview-access.mjs"].includes("vercelPreviewHostnamePattern"));
assert.ok(files["scripts/lib/vercel-preview-access.mjs"].includes("bindVercelPreviewAccessCookie"));
assert.ok(files["scripts/scrimed-p34-verify-preview.mjs"].includes("requireP34ExactPreviewBinding"));
assert.ok(files["scripts/scrimed-p34-verify-preview.mjs"].includes("SCRIMED_PREVIEW_ACCESS_ORIGIN"));
assert.ok(files["scripts/scrimed-p34-certify.mjs"].includes("cleanCandidate"));
assert.ok(files["scripts/scrimed-p34-verify-preview.mjs"].includes("productionAliasAttached: false"));
assert.equal(files["scripts/scrimed-p34-certify.mjs"].includes("git push"), false);
assert.equal(files["scripts/scrimed-p34-certify.mjs"].includes("vercel deploy"), false);
assert.equal(files["scripts/scrimed-p34-certify.mjs"].includes("supabase db push"), false);
assert.ok(files[".gitignore"].includes("artifacts/release/"));

console.log(`pass SCRIMED p.34 follow-on contract (${paths.length} implementation surfaces verified)`);
