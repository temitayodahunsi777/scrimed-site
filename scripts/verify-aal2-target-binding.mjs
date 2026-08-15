#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  evaluateAal2TargetBinding,
  verifyAal2TargetBinding
} from "./lib/aal2-target-binding.mjs";

const selfTest = process.argv.includes("--self-test");
const strict = process.argv.includes("--strict");
const json = process.argv.includes("--json");

if (selfTest) {
  const origin = "https://scrimed-site-example-team.vercel.app";
  const commit = "a".repeat(40);
  const candidate = "b".repeat(64);
  const buildInfo = {
    service: "scrimed-build-info",
    project: "scrimed-site",
    environment: "preview",
    nodeMajor: 24,
    commitSha: commit,
    candidateBound: true,
    productionReleaseAuthorized: false,
    customerActivationAuthorized: false,
    releaseFingerprint: "c".repeat(64)
  };
  const valid = {
    baseUrl: origin,
    allowedPreviewOrigins: origin,
    localCommitSha: commit,
    expectedCommitSha: commit,
    localCandidateFingerprint: candidate,
    suppliedCandidateFingerprint: candidate,
    buildInfo
  };
  assert.equal(evaluateAal2TargetBinding(valid).passed, true);
  assert.ok(evaluateAal2TargetBinding({ ...valid, allowedPreviewOrigins: "" }).failures.includes("ALLOWED_PREVIEW_ORIGIN_REQUIRED"));
  assert.ok(evaluateAal2TargetBinding({ ...valid, baseUrl: "https://app.scrimedsolutions.com" }).failures.includes("TARGET_NOT_ALLOWLISTED"));
  assert.ok(evaluateAal2TargetBinding({ ...valid, allowedPreviewOrigins: "https://app.scrimedsolutions.com", baseUrl: "https://app.scrimedsolutions.com" }).failures.includes("PRODUCTION_ALIAS_PROHIBITED"));
  assert.ok(evaluateAal2TargetBinding({ ...valid, suppliedCandidateFingerprint: "d".repeat(64) }).failures.includes("CANDIDATE_FINGERPRINT_MISMATCH"));
  assert.ok(evaluateAal2TargetBinding({ ...valid, buildInfo: { ...buildInfo, environment: "production" } }).failures.includes("NON_PREVIEW_ENVIRONMENT"));
  assert.ok(evaluateAal2TargetBinding({ ...valid, buildInfo: { ...buildInfo, commitSha: "e".repeat(40) } }).failures.includes("TARGET_COMMIT_MISMATCH"));
  console.log("pass SCRIMED AAL2 exact-target binding self-test");
  process.exit(0);
}

const result = await verifyAal2TargetBinding();
if (json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`${result.passed ? "pass" : "blocked"} SCRIMED AAL2 exact-target binding`);
  console.log(`origin=${result.origin ?? "invalid"}`);
  console.log(`commit=${result.commitSha ?? "invalid"}`);
  console.log(`candidate=${result.candidateFingerprint ?? "invalid"}`);
  for (const failure of result.failures) console.log(`blocked ${failure}`);
  console.log("No bearer token, secret, PHI, migration, production write, deployment, or customer activation is used by this verifier.");
}
if (strict && !result.passed) process.exit(1);
