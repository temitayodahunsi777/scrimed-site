#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createExactHeadApprovalDigest,
  evaluateExactHeadReviewBinding
} from "../app/lib/exactHeadReviewBinding.ts";
import { evaluateMergeReadiness } from "../app/lib/mergeReadiness.ts";
import { getScrimedOperatingModeSummary } from "../app/lib/operatingMode.ts";
import {
  getPr25ExactHeadReviewCandidate,
  getPr25FrozenReviewBaseline
} from "../app/lib/pr25FrozenReviewBaseline.ts";

function cliValue(name) {
  const exactIndex = process.argv.indexOf(name);
  if (exactIndex >= 0) return process.argv[exactIndex + 1] ?? null;
  const prefix = `${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? null;
}

async function loadApprovalFile(path) {
  if (!path) return { approval: null, loadError: null };

  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    const approval = parsed?.approval ?? parsed;
    if (!approval || typeof approval !== "object" || Array.isArray(approval)) {
      return { approval: null, loadError: "exact-head-approval-file-invalid" };
    }
    return { approval, loadError: null };
  } catch {
    return { approval: null, loadError: "exact-head-approval-file-unreadable" };
  }
}

export async function buildCurrentMergeReadinessInput(options = {}) {
  const baseline = getPr25FrozenReviewBaseline();
  const candidate = getPr25ExactHeadReviewCandidate();
  const operatingMode = getScrimedOperatingModeSummary().mode;
  const vercel = JSON.parse(await readFile("vercel.json", "utf8"));
  const approvalPath =
    options.approvalPath ??
    process.env.SCRIMED_EXACT_HEAD_APPROVAL_FILE ??
    cliValue("--approval-file");
  const loaded = Object.hasOwn(options, "approval")
    ? { approval: options.approval, loadError: null }
    : await loadApprovalFile(approvalPath);
  const reviewBinding = evaluateExactHeadReviewBinding({
    candidate,
    approval: loaded.approval,
    evaluatedAt: options.evaluatedAt
  });

  return {
    exactHeadApproval: Boolean(loaded.approval),
    exactHeadApprovalMatches:
      reviewBinding.approved && reviewBinding.status === "APPROVED_EXACT_HEAD",
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
      vercel?.git?.deploymentEnabled?.main !== false,
    reviewBindingStatus: reviewBinding.status,
    reviewBindingReasonCodes: [
      ...(loaded.loadError ? [loaded.loadError] : []),
      ...reviewBinding.reasonCodes
    ],
    reviewedCommitSha: reviewBinding.approvedCommitSha
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

  const candidate = getPr25ExactHeadReviewCandidate();
  const approvalBase = {
    approvalId: "merge-readiness-self-test-approval",
    replayNonce: "merge-readiness-self-test-nonce",
    commitSha: candidate.commitSha,
    candidateFingerprint: candidate.candidateFingerprint,
    sourceFingerprint: candidate.sourceFingerprint,
    validationFingerprint: candidate.validationFingerprint,
    reviewPacketFingerprint: candidate.reviewPacketFingerprint,
    sbomFingerprint: candidate.sbomFingerprint,
    criticalSurfaces: candidate.criticalSurfaces,
    reviewerIdentityHash: "0".repeat(64),
    disposition: "APPROVE_EXACT_HEAD",
    evidenceIds: [
      "ci",
      "secret-scan",
      "sbom",
      "public-claims",
      "migration-review",
      "operating-mode"
    ],
    issuedAt: "2026-08-09T22:00:00.000Z",
    expiresAt: "2026-08-10T22:00:00.000Z",
    trustedIdentityEvidenceVerified: true
  };
  const approval = {
    ...approvalBase,
    approvalDigest: createExactHeadApprovalDigest(approvalBase)
  };
  const verifiedInput = await buildCurrentMergeReadinessInput({
    approval,
    evaluatedAt: "2026-08-09T23:00:00.000Z"
  });
  assert.equal(verifiedInput.exactHeadApproval, true);
  assert.equal(verifiedInput.exactHeadApprovalMatches, true);
  assert.equal(verifiedInput.reviewBindingStatus, "APPROVED_EXACT_HEAD");

  const unknownDispositionBase = {
    ...approvalBase,
    disposition: "UNKNOWN_DISPOSITION"
  };
  const invalidInput = await buildCurrentMergeReadinessInput({
    approval: {
      ...unknownDispositionBase,
      approvalDigest: createExactHeadApprovalDigest(unknownDispositionBase)
    },
    evaluatedAt: "2026-08-09T23:00:00.000Z"
  });
  assert.equal(invalidInput.exactHeadApproval, true);
  assert.equal(invalidInput.exactHeadApprovalMatches, false);
  assert.ok(
    invalidInput.reviewBindingReasonCodes.includes(
      "exact-head-review-approval-invalid"
    )
  );

  console.log(
    "pass merge-readiness verifier self-test (evaluated exact-head artifact, CI, supply chain, claims, migrations, operating mode, and production auto-deploy)"
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
