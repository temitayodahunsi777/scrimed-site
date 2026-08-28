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
  "app/lib/scrimed-p34/reviewReadiness.ts",
  "app/lib/release/previewAcceptance.ts",
  "app/lib/productConsole.ts",
  "scripts/lib/p34-candidate-state.mjs",
  "scripts/generate-p34-build-inventory.mjs",
  "scripts/build-with-p34-inventory.mjs",
  "scripts/generate-p34-follow-on-artifacts.mjs",
  "scripts/scrimed-p34-evidence.mjs",
  "scripts/scrimed-p34-certify.mjs",
  "scripts/scrimed-p34-verify-preview.mjs",
  "scripts/scrimed-p34-pilot-assurance-adversarial-test.mjs"
];
const files = Object.fromEntries(await Promise.all(paths.map(async (path) => [path, await readFile(path, "utf8")])));
const packageJson = JSON.parse(files["package.json"]);
const performance = JSON.parse(files["config/performance-budgets.json"]);

for (const script of ["scrimed:p34:evidence", "scrimed:p34:certify", "scrimed:p34:verify-preview"]) {
  assert.equal(typeof packageJson.scripts[script], "string", script);
}
assert.equal(performance.routeInventory.manualExpectedCountsAllowed, false);
assert.equal(performance.routeInventory.builtRoutesArtifact, "artifacts/p34/P34_ROUTE_INVENTORY.json");
assert.equal(performance.routeInventory.generationArtifact, "artifacts/p34/P34_GENERATION_INVENTORY.json");
assert.equal(files["app/lib/scrimed-p34/exactHeadBaseline.ts"].includes("builtRouteCount"), false);

for (const state of ["AUTOMATED_READY", "REVIEW_REQUESTED", "REVIEW_CURRENT", "REVIEW_STALE", "CHANGES_REQUESTED", "APPROVED_EXACT_HEAD"]) {
  assert.ok(files["app/lib/scrimed-p34/reviewReadiness.ts"].includes(state), state);
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
assert.ok(files["scripts/scrimed-p34-verify-preview.mjs"].includes(".vercel.app"));
assert.ok(files["scripts/scrimed-p34-verify-preview.mjs"].includes("productionAliasAttached: false"));
assert.equal(files["scripts/scrimed-p34-certify.mjs"].includes("git push"), false);
assert.equal(files["scripts/scrimed-p34-certify.mjs"].includes("vercel deploy"), false);
assert.equal(files["scripts/scrimed-p34-certify.mjs"].includes("supabase db push"), false);
assert.ok(files[".gitignore"].includes("artifacts/release/"));

console.log(`pass SCRIMED p.34 follow-on contract (${paths.length} implementation surfaces verified)`);
