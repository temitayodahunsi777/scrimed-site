#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedSecurityReleaseReadiness.ts",
  "app/lib/scrimedCyberDefenseCommandCenter.ts",
  "app/scrimed-cyber-defense/page.tsx",
  "docs/scrimed-cyber-defense.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/scrimed-security-assurance-contract-check.mjs",
  "scripts/scrimed-cyber-defense-contract-check.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required SCRIMED Security Release Readiness text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedSecurityReleaseReadiness.ts"];

for (const expected of [
  "scrimed-security-release-readiness-active-no-phi-no-customer-go-live",
  "ScrimedSecurityReleaseGate",
  "ScrimedSecurityReleaseLane",
  "ScrimedSecurityReleaseReadinessScorecard",
  "synthetic_demo_ready",
  "buyer_diligence_ready",
  "protected_no_phi_pilot_ready",
  "phi_preproduction_blocked",
  "live_phi_production_blocked",
  "no-secret-assurance",
  "browser-and-proxy-hardening",
  "protected-route-fail-closed",
  "aal2-authorized-happy-path",
  "waf-siem-sbom-external-review",
  "baa-privacy-retention-tabletop",
  "not-authorized-production-phi",
  "not-customer-go-live-approved",
  "getScrimedSecurityReleaseReadinessSummary",
  "No live PHI",
  "no production connector approval",
  "no customer go-live"
]) {
  requireIncludes("app/lib/scrimedSecurityReleaseReadiness.ts", source, expected);
}

for (const expected of [
  "getScrimedSecurityReleaseReadinessSummary",
  "securityReleaseReadiness"
]) {
  requireIncludes("app/lib/scrimedCyberDefenseCommandCenter.ts", files["app/lib/scrimedCyberDefenseCommandCenter.ts"], expected);
}

for (const expected of [
  "Security Release Readiness Gate",
  "summary.securityReleaseReadiness.scorecard.currentStage",
  "summary.securityReleaseReadiness.lanes",
  "Customer go-live"
]) {
  requireIncludes("app/scrimed-cyber-defense/page.tsx", files["app/scrimed-cyber-defense/page.tsx"], expected);
}

for (const expected of [
  "Security Release Readiness Gate",
  "synthetic_demo_ready",
  "buyer_diligence_ready",
  "protected_no_phi_pilot_ready",
  "phi_preproduction_blocked",
  "live_phi_production_blocked",
  "Current release authority is synthetic and no-PHI only"
]) {
  requireIncludes("docs/scrimed-cyber-defense.md", files["docs/scrimed-cyber-defense.md"], expected);
}

for (const expected of [
  "\"security:release-readiness\"",
  "\"smoke:scrimed-security-release-readiness\""
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

for (const expected of [
  "scripts/scrimed-security-release-readiness-contract-check.mjs"
]) {
  requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", files["scripts/scrimed-nonsecret-test-suite.mjs"], expected);
  requireIncludes(
    "scripts/scrimed-security-assurance-contract-check.mjs",
    files["scripts/scrimed-security-assurance-contract-check.mjs"],
    expected
  );
  requireIncludes("scripts/scrimed-cyber-defense-contract-check.mjs", files["scripts/scrimed-cyber-defense-contract-check.mjs"], expected);
}

const forbiddenClaimParts = [
  ["HIPAA", " certified"],
  ["SOC 2", " certified"],
  ["HITRUST", " certified"],
  ["FDA", " cleared"],
  ["security", " certified"],
  ["breach", " proof"],
  ["production PHI", " enabled"],
  ["EHR writeback", " enabled"],
  ["payer submission", " enabled"],
  ["customer go-live", " approved"],
  ["autonomous", " diagnosis"],
  ["autonomous", " treatment"],
  ["replaces", " doctors"]
];

for (const path of [
  "app/lib/scrimedSecurityReleaseReadiness.ts",
  "app/lib/scrimedCyberDefenseCommandCenter.ts",
  "app/scrimed-cyber-defense/page.tsx",
  "docs/scrimed-cyber-defense.md"
]) {
  const lower = files[path].toLowerCase();

  for (const parts of forbiddenClaimParts) {
    const forbidden = parts.join("").toLowerCase();
    if (lower.includes(forbidden)) {
      throw new Error(`${path} contains forbidden SCRIMED security release claim: ${forbidden}`);
    }
  }
}

console.log("pass SCRIMED Security Release Readiness contract check");
