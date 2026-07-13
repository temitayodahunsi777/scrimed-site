#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "next.config.js",
  "proxy.ts",
  "app/lib/scrimedCyberDefenseCommandCenter.ts",
  "app/api/scrimed-cyber-defense/route.ts",
  "app/scrimed-cyber-defense/page.tsx",
  "docs/scrimed-cyber-defense.md",
  "package.json",
  "app/lib/scrimedSecurityAssurancePipeline.ts",
  "app/lib/scrimedSecurityReleaseReadiness.ts",
  "app/lib/scrimedSecurityDiligenceEvidence.ts",
  "app/api/scrimed-cyber-defense/evidence-packet/route.ts",
  "scripts/scrimed-security-assurance-contract-check.mjs",
  "scripts/scrimed-security-release-readiness-contract-check.mjs",
  "scripts/scrimed-security-diligence-evidence-contract-check.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "scripts/public-production-smoke.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required SCRIMED Cyber Defense text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));

for (const expected of [
  "Strict-Transport-Security",
  "Cross-Origin-Resource-Policy",
  "Origin-Agent-Cluster",
  "X-Download-Options",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' data:",
  "prefetch-src 'self'",
  "X-SCRIMED-Cyber-Defense",
  "X-SCRIMED-Security-Certification",
  "not-security-certified",
  "not-authorized-production-phi"
]) {
  requireIncludes("next.config.js", files["next.config.js"], expected);
}

for (const expected of [
  "x-middleware-subrequest",
  "x-scrimed-debug-token",
  "x-api-key",
  "NextResponse.next",
  "X-SCRIMED-Proxy-Guard",
  "X-SCRIMED-Middleware-Bypass-Header",
  "X-SCRIMED-Request-Sanitization",
  "suspicious-forwarded-headers-removed"
]) {
  requireIncludes("proxy.ts", files["proxy.ts"], expected);
}

const source = files["app/lib/scrimedCyberDefenseCommandCenter.ts"];
for (const expected of [
  "scrimed-cyber-defense-active-no-secrets-no-phi",
  "ScrimedCyberDefenseControl",
  "ScrimedCyberDefenseThreat",
  "ScrimedIncidentReadinessLane",
  "ScrimedCyberDefenseBuyerDiligenceCard",
  "securityHeaders",
  "proxyHeaderSanitizer",
  "protectedFailClosed",
  "rateLimitControls",
  "secretRedaction",
  "safetyGovernance",
  "noSecretTestSuite",
  "incidentReadiness",
  "scrimedCyberDefenseBuyerDiligenceCards",
  "identity-access-aal2-rbac-card",
  "token-secret-protection-card",
  "protected-route-boundary-card",
  "data-boundary-no-phi-card",
  "proxy-request-sanitization-card",
  "api-abuse-cost-guardrail-card",
  "incident-response-tabletop-card",
  "vendor-connector-readiness-card",
  "buyerDiligenceCardCount",
  "externalEvidenceGapCount",
  "threatMatrix",
  "nextHardeningMoves",
  "not-security-certified",
  "not-authorized-production-phi",
  "getScrimedCyberDefenseSummary",
  "getScrimedCyberDefenseScorecard",
  "No PHI",
  "no production credentials",
  "no raw connector payloads",
  "no security certification claim"
]) {
  requireIncludes("app/lib/scrimedCyberDefenseCommandCenter.ts", source, expected);
}

for (const expected of [
  "scrimed-security-assurance-active-no-secrets-no-phi",
  "getScrimedSecurityAssuranceSummary",
  "ScrimedSecurityAssuranceGate"
]) {
  requireIncludes(
    "app/lib/scrimedSecurityAssurancePipeline.ts",
    files["app/lib/scrimedSecurityAssurancePipeline.ts"],
    expected
  );
}

for (const expected of [
  "scrimed-security-release-readiness-active-no-phi-no-customer-go-live",
  "getScrimedSecurityReleaseReadinessSummary",
  "ScrimedSecurityReleaseGate"
]) {
  requireIncludes(
    "app/lib/scrimedSecurityReleaseReadiness.ts",
    files["app/lib/scrimedSecurityReleaseReadiness.ts"],
    expected
  );
}

for (const expected of [
  "scrimed-security-diligence-evidence-packet-active-no-phi",
  "getScrimedSecurityDiligenceEvidenceSummary",
  "ScrimedSecurityEvidenceArtifact",
  "buyerDiligenceShareReady"
]) {
  requireIncludes(
    "app/lib/scrimedSecurityDiligenceEvidence.ts",
    files["app/lib/scrimedSecurityDiligenceEvidence.ts"],
    expected
  );
}

for (const expected of [
  "getScrimedCyberDefenseSummary",
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "X-SCRIMED-Cyber-Defense",
  "synthetic-security-metadata-only",
  "not-security-certified"
]) {
  requireIncludes("app/api/scrimed-cyber-defense/route.ts", files["app/api/scrimed-cyber-defense/route.ts"], expected);
}

for (const expected of [
  "X-SCRIMED-Security-Evidence-Packet",
  "synthetic-security-evidence-metadata-only",
  "redacted-metadata-only",
  "evaluateScrimedSafetyGate"
]) {
  requireIncludes(
    "app/api/scrimed-cyber-defense/evidence-packet/route.ts",
    files["app/api/scrimed-cyber-defense/evidence-packet/route.ts"],
    expected
  );
}

for (const expected of [
  "SCRIMED Cyber Defense Command Center",
  "Buyer Security Diligence Cards",
  "Enforced Controls",
  "Threat Matrix",
  "Security Assurance Pipeline",
  "Security Release Readiness Gate",
  "Security Diligence Evidence Packet",
  "summary.securityDiligenceEvidence.questionnaireResponses",
  "Security Questionnaire Response Library",
  "Incident Readiness",
  "Next Hardening Moves",
  "External WAF",
  "PHI authority"
]) {
  requireIncludes("app/scrimed-cyber-defense/page.tsx", files["app/scrimed-cyber-defense/page.tsx"], expected);
}

for (const expected of [
  "SCRIMED Cyber Defense Command Center",
  "Safety Boundary",
  "No Certification Claim",
  "Control Families",
  "Buyer Security Diligence Cards",
  "Security Assurance Pipeline",
  "Security Release Readiness Gate",
  "Security Diligence Evidence Packet",
  "Security Questionnaire Response Library",
  "Threat Matrix",
  "Next Build Step"
]) {
  requireIncludes("docs/scrimed-cyber-defense.md", files["docs/scrimed-cyber-defense.md"], expected);
}

const forbiddenClaimParts = [
  ["security", " certified"],
  ["HIPAA", " certified"],
  ["SOC 2", " certified"],
  ["HITRUST", " certified"],
  ["FDA", " cleared"],
  ["breach", " proof"],
  ["guaranteed", " secure"],
  ["autonomous", " diagnosis"],
  ["autonomous", " treatment"],
  ["pres", "cribes"],
  ["replaces", " doctors"],
  ["EHR writeback", " enabled"],
  ["payer submission", " enabled"],
  ["customer go-live", " approved"]
];

for (const path of [
  "app/lib/scrimedCyberDefenseCommandCenter.ts",
  "app/api/scrimed-cyber-defense/route.ts",
  "app/scrimed-cyber-defense/page.tsx",
  "docs/scrimed-cyber-defense.md"
]) {
  const lower = files[path].toLowerCase();

  for (const parts of forbiddenClaimParts) {
    const forbidden = parts.join("").toLowerCase();
    if (lower.includes(forbidden)) {
      throw new Error(`${path} contains forbidden SCRIMED security claim: ${forbidden}`);
    }
  }
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-cyber-defense\"");
requireIncludes("package.json", files["package.json"], "\"security:assurance\"");
requireIncludes("package.json", files["package.json"], "\"security:evidence-packet\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-security-assurance\"");
requireIncludes("package.json", files["package.json"], "\"security:release-readiness\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-security-release-readiness\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-security-diligence-evidence\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-cyber-defense-contract-check.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-security-assurance-contract-check.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-security-release-readiness-contract-check.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-security-diligence-evidence-contract-check.mjs"
);
requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], "/scrimed-cyber-defense");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "/scrimed-cyber-defense");
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], "/scrimed-cyber-defense");
requireIncludes(
  "scripts/public-production-smoke.mjs",
  files["scripts/public-production-smoke.mjs"],
  "checkScrimedSecurityDiligenceEvidencePacket"
);
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "expectedApiRoutePatternCount = 434");

console.log("pass SCRIMED Cyber Defense contract check");
