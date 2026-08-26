#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/deploymentDriftGuard.ts",
  "app/api/deployment-drift-guard/route.ts",
  "app/api/deployment-drift-guard/brief/route.ts",
  "app/deployment-drift-guard/page.tsx",
  "docs/deployment-drift-guard.md",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "scripts/public-production-smoke.mjs",
  "scripts/deployment-drift-target-smoke.mjs",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required deployment drift guard text: ${expected}`);
  }
}

function requireForbiddenAbsent(path, text, forbidden) {
  if (text.includes(forbidden)) {
    throw new Error(`${path} contains forbidden deployment drift guard claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));

for (const expected of [
  "scrimed-deployment-drift-guard",
  "deployment-drift-guard-active-no-secret-route-alignment",
  "/deployment-drift-guard",
  "/api/deployment-drift-guard",
  "/api/deployment-drift-guard/brief",
  "block-external-promotion-until-target-and-repo-match",
  "/scrimed-market-execution",
  "/enterprise-healthcare-infrastructure",
  "not-deployed-by-this-route",
  "not-authorized",
  "no live PHI",
  "no autonomous clinical care",
  "no payer submission",
  "no raw secrets"
]) {
  requireIncludes("app/lib/deploymentDriftGuard.ts", files["app/lib/deploymentDriftGuard.ts"], expected);
}

for (const expected of [
  "getDeploymentDriftGuardSummary",
  "X-SCRIMED-Deployment-Drift-Guard",
  "X-SCRIMED-Deployment-Authority",
  "not-deployed-by-this-route",
  "X-SCRIMED-Data-Boundary",
  "synthetic-and-metadata-only",
  "X-SCRIMED-PHI-Authority",
  "not-authorized-production-phi"
]) {
  requireIncludes("app/api/deployment-drift-guard/route.ts", files["app/api/deployment-drift-guard/route.ts"], expected);
}

for (const expected of [
  "buildDeploymentDriftGuardBrief",
  "scrimed-deployment-drift-guard.md",
  "text/markdown",
  "X-SCRIMED-Deployment-Drift-Guard"
]) {
  requireIncludes(
    "app/api/deployment-drift-guard/brief/route.ts",
    files["app/api/deployment-drift-guard/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "SCRIMED Deployment Drift Guard",
  "Detect stale deployments before SCRIMED uses them as proof",
  "Local pass plus production 404 means deployment drift",
  "Release Continuity",
  "not deploy code"
]) {
  requireIncludes("app/deployment-drift-guard/page.tsx", files["app/deployment-drift-guard/page.tsx"], expected);
}

for (const expected of [
  "SCRIMED Deployment Drift Guard",
  "local route passes and production route missing: deployment/version drift",
  "SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:deployment-drift-guard",
  "does not deploy code",
  "no live PHI"
]) {
  requireIncludes("docs/deployment-drift-guard.md", files["docs/deployment-drift-guard.md"], expected);
}

for (const expected of [
  "/deployment-drift-guard",
  "Deployment Drift",
  "stale deployments"
]) {
  requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], expected);
}

for (const expected of [
  "/deployment-drift-guard",
  "/api/deployment-drift-guard",
  "expectedApiRoutePatternCount = 453",
  "Deployment drift"
]) {
  requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], expected);
}

for (const expected of [
  "/deployment-drift-guard",
  "checkDeploymentDriftGuard",
  "x-scrimed-deployment-drift-guard"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], expected);
}

for (const expected of [
  "SCRIMED_BASE_URL",
  "/api/deployment-drift-guard",
  "deployment drift target smoke",
  "bearer",
  "not-authorized-production-phi"
]) {
  requireIncludes("scripts/deployment-drift-target-smoke.mjs", files["scripts/deployment-drift-target-smoke.mjs"], expected);
}

requireIncludes(
  "package.json",
  files["package.json"],
  "\"contract:deployment-drift-guard\": \"node scripts/deployment-drift-guard-contract-check.mjs\""
);
requireIncludes(
  "package.json",
  files["package.json"],
  "\"smoke:deployment-drift-guard\": \"node scripts/deployment-drift-target-smoke.mjs\""
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/deployment-drift-guard-contract-check.mjs"
);

for (const path of [
  "app/lib/deploymentDriftGuard.ts",
  "app/api/deployment-drift-guard/route.ts",
  "app/api/deployment-drift-guard/brief/route.ts",
  "app/deployment-drift-guard/page.tsx",
  "docs/deployment-drift-guard.md",
  "scripts/deployment-drift-target-smoke.mjs"
]) {
  const text = files[path];

  for (const forbidden of [
    "HIPAA certified",
    "SOC 2 certified",
    "FDA cleared",
    "autonomous diagnosis",
    "autonomous treatment",
    "EHR writeback enabled",
    "payer submission enabled"
  ]) {
    requireForbiddenAbsent(path, text, forbidden);
  }
}

console.log("pass SCRIMED deployment drift guard contract check");
