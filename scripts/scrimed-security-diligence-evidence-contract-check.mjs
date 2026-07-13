#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedSecurityDiligenceEvidence.ts",
  "app/lib/scrimedCyberDefenseCommandCenter.ts",
  "app/api/scrimed-cyber-defense/evidence-packet/route.ts",
  "app/scrimed-cyber-defense/page.tsx",
  "docs/scrimed-cyber-defense.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/scrimed-cyber-defense-contract-check.mjs",
  "scripts/scrimed-security-assurance-contract-check.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required SCRIMED Security Diligence Evidence text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedSecurityDiligenceEvidence.ts"];

for (const expected of [
  "scrimed-security-diligence-evidence-packet-active-no-phi",
  "ScrimedSecurityEvidenceArtifact",
  "ScrimedSecurityEvidenceQuestion",
  "ScrimedSecurityQuestionnaireResponse",
  "ScrimedSecurityDiligenceEvidenceScorecard",
  "browser-proxy-hardening-packet",
  "no-secret-regression-packet",
  "protected-route-fail-closed-packet",
  "aal2-operator-validation-packet",
  "release-readiness-ladder-packet",
  "incident-tabletop-packet",
  "waf-siem-sbom-review-packet",
  "baa-privacy-retention-packet",
  "buyerDiligenceShareReady",
  "questionnaireResponseCount",
  "scrimedSecurityQuestionnaireResponses",
  "questionnaire-access-control-rbac-aal2",
  "questionnaire-data-protection-no-phi",
  "questionnaire-application-security-headers-proxy",
  "questionnaire-incident-response-tabletop",
  "questionnaire-infrastructure-waf-siem-sbom",
  "questionnaire-ai-governance-human-review",
  "questionnaire-business-continuity-recovery",
  "questionnaire-vendor-risk-connectors",
  "Use questionnaire responses as governed answer starters",
  "phiProductionShareReady: false",
  "customerGoLiveShareReady: false",
  "getScrimedSecurityDiligenceEvidenceSummary",
  "Do not share raw logs",
  "No live PHI"
]) {
  requireIncludes("app/lib/scrimedSecurityDiligenceEvidence.ts", source, expected);
}

for (const expected of [
  "getScrimedSecurityDiligenceEvidenceSummary",
  "securityDiligenceEvidence"
]) {
  requireIncludes("app/lib/scrimedCyberDefenseCommandCenter.ts", files["app/lib/scrimedCyberDefenseCommandCenter.ts"], expected);
}

for (const expected of [
  "getScrimedSecurityDiligenceEvidenceSummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-Security-Evidence-Packet",
  "synthetic-security-evidence-metadata-only",
  "redacted-metadata-only"
]) {
  requireIncludes(
    "app/api/scrimed-cyber-defense/evidence-packet/route.ts",
    files["app/api/scrimed-cyber-defense/evidence-packet/route.ts"],
    expected
  );
}

for (const expected of [
  "Evidence Packet API",
  "Security Diligence Evidence Packet",
  "summary.securityDiligenceEvidence.scorecard.buyerDiligenceShareReady",
  "summary.securityDiligenceEvidence.artifacts",
  "summary.securityDiligenceEvidence.questionnaireResponses",
  "summary.securityDiligenceEvidence.buyerQuestions"
]) {
  requireIncludes("app/scrimed-cyber-defense/page.tsx", files["app/scrimed-cyber-defense/page.tsx"], expected);
}

for (const expected of [
  "Security Diligence Evidence Packet",
  "Security Questionnaire Response Library",
  "/api/scrimed-cyber-defense/evidence-packet",
  "metadata-only",
  "Share rules",
  "answer starters",
  "Do not share raw logs"
]) {
  requireIncludes("docs/scrimed-cyber-defense.md", files["docs/scrimed-cyber-defense.md"], expected);
}

for (const expected of [
  "\"security:evidence-packet\"",
  "\"smoke:scrimed-security-diligence-evidence\""
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

for (const expected of ["scripts/scrimed-security-diligence-evidence-contract-check.mjs"]) {
  requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", files["scripts/scrimed-nonsecret-test-suite.mjs"], expected);
  requireIncludes("scripts/scrimed-cyber-defense-contract-check.mjs", files["scripts/scrimed-cyber-defense-contract-check.mjs"], expected);
  requireIncludes(
    "scripts/scrimed-security-assurance-contract-check.mjs",
    files["scripts/scrimed-security-assurance-contract-check.mjs"],
    expected
  );
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
  "app/lib/scrimedSecurityDiligenceEvidence.ts",
  "app/lib/scrimedCyberDefenseCommandCenter.ts",
  "app/api/scrimed-cyber-defense/evidence-packet/route.ts",
  "app/scrimed-cyber-defense/page.tsx",
  "docs/scrimed-cyber-defense.md"
]) {
  const lower = files[path].toLowerCase();

  for (const parts of forbiddenClaimParts) {
    const forbidden = parts.join("").toLowerCase();
    if (lower.includes(forbidden)) {
      throw new Error(`${path} contains forbidden SCRIMED security diligence evidence claim: ${forbidden}`);
    }
  }
}

console.log("pass SCRIMED Security Diligence Evidence contract check");
