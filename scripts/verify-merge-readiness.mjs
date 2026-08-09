#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { evaluateMergeReadiness } from "../app/lib/mergeReadiness.ts";
import { getScrimedOperatingModeSummary } from "../app/lib/operatingMode.ts";
import { getPr25FrozenReviewBaseline } from "../app/lib/pr25FrozenReviewBaseline.ts";

export async function buildCurrentMergeReadinessInput() {
  const baseline = getPr25FrozenReviewBaseline();
  const operatingMode = getScrimedOperatingModeSummary().mode;
  const vercel = JSON.parse(await readFile("vercel.json", "utf8"));

  return {
    exactHeadApproval: baseline.review.exactHeadApprovalRecorded,
    exactHeadApprovalMatches: baseline.review.exactHeadApprovalRecorded,
    ciPassed:
      baseline.validation.githubActionsPassed === baseline.validation.githubActionsTotal,
    secretScanPassed: baseline.validation.secretScanFindings === 0,
    sbomPassed: baseline.validation.dependencyDelta === 0,
    publicClaimsPassed: baseline.validation.publicClaimsPassed,
    unreviewedMigrationsAdded: !baseline.validation.migrationStaticReviewPassed,
    syntheticOnly: operatingMode.syntheticOnly,
    phiEnabled: operatingMode.allowPHI,
    clinicalExecutionEnabled: operatingMode.liveClinicalExecution,
    ehrWritebackEnabled: operatingMode.productionEHRConnections,
    deviceWritebackEnabled: operatingMode.medicalDeviceConnections,
    customerActivationEnabled: false,
    productionAutoDeployFromMainEnabled:
      vercel?.git?.deploymentEnabled?.main !== false
  };
}

export async function runMergeReadinessSelfTest() {
  const readyInput = {
    exactHeadApproval: true,
    exactHeadApprovalMatches: true,
    ciPassed: true,
    secretScanPassed: true,
    sbomPassed: true,
    publicClaimsPassed: true,
    unreviewedMigrationsAdded: false,
    syntheticOnly: true,
    phiEnabled: false,
    clinicalExecutionEnabled: false,
    ehrWritebackEnabled: false,
    deviceWritebackEnabled: false,
    customerActivationEnabled: false,
    productionAutoDeployFromMainEnabled: false
  };
  const ready = evaluateMergeReadiness(readyInput);
  assert.equal(ready.status, "READY_FOR_MERGE_AUTHORIZATION");
  assert.equal(ready.mergePerformed, false);
  assert.equal(ready.deploymentPerformed, false);

  const stale = evaluateMergeReadiness({
    ...readyInput,
    exactHeadApprovalMatches: false
  });
  assert.equal(stale.status, "NOT_READY_FOR_MERGE");
  assert.ok(stale.reasonCodes.includes("merge-exact-head-approval-stale"));

  const unsafe = evaluateMergeReadiness({
    ...readyInput,
    phiEnabled: true,
    productionAutoDeployFromMainEnabled: true
  });
  assert.ok(unsafe.reasonCodes.includes("merge-phi-enabled"));
  assert.ok(unsafe.reasonCodes.includes("merge-production-auto-deploy-enabled"));

  console.log(
    "pass merge-readiness verifier self-test (exact review, CI, supply chain, claims, migrations, operating mode, and production auto-deploy)"
  );
}

if (process.argv.includes("--self-test")) {
  await runMergeReadinessSelfTest();
  process.exit(0);
}

const input = await buildCurrentMergeReadinessInput();
const result = evaluateMergeReadiness(input);
console.log(JSON.stringify({ input, result }, null, 2));

if (process.argv.includes("--strict") && !result.ready) {
  process.exit(1);
}
