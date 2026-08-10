#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

export function evaluateVercelDeploymentPolicy(config) {
  const deploymentEnabled = config?.git?.deploymentEnabled;
  const branchPolicy =
    deploymentEnabled && typeof deploymentEnabled === "object" && !Array.isArray(deploymentEnabled)
      ? deploymentEnabled
      : null;

  const checks = {
    explicitBranchPolicy: branchPolicy !== null,
    mainAutoDeployDisabled: branchPolicy?.main === false,
    previewDeploymentsPreserved: branchPolicy !== null && branchPolicy.main === false
  };

  return {
    allowed: Object.values(checks).every(Boolean),
    checks,
    boundary:
      "Merging to main must not create a production deployment. Production deployment requires a separate, exact-candidate authorization."
  };
}

const safe = evaluateVercelDeploymentPolicy({
  git: { deploymentEnabled: { main: false } }
});
const missing = evaluateVercelDeploymentPolicy({});
const unsafe = evaluateVercelDeploymentPolicy({
  git: { deploymentEnabled: { main: true } }
});
const globallyDisabled = evaluateVercelDeploymentPolicy({
  git: { deploymentEnabled: false }
});

assert.equal(safe.allowed, true);
assert.equal(missing.allowed, false);
assert.equal(unsafe.allowed, false);
assert.equal(globallyDisabled.allowed, false);

const config = JSON.parse(await readFile("vercel.json", "utf8"));
const result = evaluateVercelDeploymentPolicy(config);

assert.equal(
  result.allowed,
  true,
  `Vercel production deployment policy failed: ${JSON.stringify(result.checks)}`
);

console.log("pass Vercel main auto-deployment policy");
