#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const requiredFiles = [
  "next.config.js",
  "proxy.ts",
  "app/lib/scrimedCyberDefenseCommandCenter.ts",
  "app/lib/scrimedSecurityAssurancePipeline.ts",
  "app/lib/scrimedSecurityReleaseReadiness.ts",
  "app/lib/scrimedSecurityDiligenceEvidence.ts",
  "app/api/scrimed-cyber-defense/route.ts",
  "app/api/scrimed-cyber-defense/evidence-packet/route.ts",
  "app/scrimed-cyber-defense/page.tsx",
  "docs/scrimed-cyber-defense.md",
  "docs/dependency-security-floor.md",
  "docs/ci-workflow-governance.md",
  "package.json",
  "package-lock.json",
  "scripts/dependency-security-floor-contract-check.mjs",
  "scripts/ci-workflow-contract-check.mjs",
  "scripts/scrimed-cyber-defense-contract-check.mjs",
  "scripts/scrimed-security-release-readiness-contract-check.mjs",
  "scripts/scrimed-security-diligence-evidence-contract-check.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

const scanRoots = [
  "app",
  "docs",
  "scripts",
  ".github",
  "supabase/migrations",
  "public",
  "next.config.js",
  "proxy.ts",
  "package.json",
  "README.md",
  ".env.example"
];

const excludedPathParts = [
  ".git",
  ".next",
  "node_modules",
  ".vercel",
  "coverage",
  "dist",
  "build",
  ".env.local"
];

const scannedExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".md",
  ".json",
  ".yml",
  ".yaml",
  ".sql",
  ".txt",
  ".example"
]);

const secretPatterns = [
  { id: "openai_key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/g },
  { id: "compact_jwt", pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { id: "aws_access_key", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "github_token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/g },
  { id: "stripe_live_secret", pattern: /\bsk_live_[A-Za-z0-9]{20,}\b/g },
  { id: "private_key_block", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/g }
];

const forbiddenClaimParts = [
  ["HIPAA", " certified"],
  ["SOC 2", " certified"],
  ["HITRUST", " certified"],
  ["FDA", " cleared"],
  ["security", " certified"],
  ["breach", " proof"],
  ["guaranteed", " secure"],
  ["production PHI", " enabled"],
  ["EHR writeback", " enabled"],
  ["payer submission", " enabled"],
  ["customer go-live", " approved"],
  ["autonomous", " diagnosis"],
  ["autonomous", " treatment"],
  ["replaces", " doctors"]
];

async function load(pathname) {
  return [pathname, await readFile(pathname, "utf8")];
}

function requireIncludes(pathname, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${pathname} missing required SCRIMED security assurance text: ${expected}`);
  }
}

function isExcluded(pathname) {
  return excludedPathParts.some((part) => pathname === part || pathname.includes(`${path.sep}${part}${path.sep}`));
}

function shouldScanFile(pathname) {
  if (isExcluded(pathname)) {
    return false;
  }

  if (pathname.endsWith(".env.local")) {
    return false;
  }

  const extension = path.extname(pathname);
  return scannedExtensions.has(extension) || pathname === ".env.example";
}

async function collectFiles(pathname) {
  if (isExcluded(pathname)) {
    return [];
  }

  let entryStat;
  try {
    entryStat = await stat(pathname);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  if (entryStat.isFile()) {
    return shouldScanFile(pathname) ? [pathname] : [];
  }

  if (!entryStat.isDirectory()) {
    return [];
  }

  const entries = await readdir(pathname);
  const nested = await Promise.all(entries.map((entry) => collectFiles(path.join(pathname, entry))));
  return nested.flat();
}

function allowedPlaceholder(match) {
  const lower = match.toLowerCase();
  return lower.includes("example") || lower.includes("placeholder") || lower.includes("redacted") || lower.includes("fingerprint");
}

async function assertNoSecretLikeValues(files) {
  const findings = [];

  for (const pathname of files) {
    const text = await readFile(pathname, "utf8");

    for (const { id, pattern } of secretPatterns) {
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        const value = match[0];
        if (!allowedPlaceholder(value)) {
          findings.push(`${pathname}: ${id}`);
        }
      }
    }
  }

  if (findings.length > 0) {
    throw new Error(`Potential live secret-like values found:\n${findings.map((finding) => `- ${finding}`).join("\n")}`);
  }
}

function assertNoForbiddenClaims(filesByPath, pathsToCheck) {
  for (const pathname of pathsToCheck) {
    const lower = filesByPath[pathname].toLowerCase();

    for (const parts of forbiddenClaimParts) {
      const forbidden = parts.join("").toLowerCase();
      if (lower.includes(forbidden)) {
        throw new Error(`${pathname} contains forbidden security assurance claim: ${forbidden}`);
      }
    }
  }
}

const filesByPath = Object.fromEntries(await Promise.all(requiredFiles.map(load)));

for (const expected of [
  "scrimed-security-assurance-active-no-secrets-no-phi",
  "ScrimedSecurityAssuranceGate",
  "secret-scan",
  "header-hardening",
  "proxy-sanitizer",
  "protected-fail-closed",
  "phi-boundary",
  "supply-chain-integrity",
  "dependency-security-floor",
  "Framework dependency security floor",
  "ci-workflow-governance",
  "CI workflow governance contract",
  "incident-readiness",
  "deployment-boundary",
  "getScrimedSecurityAssuranceSummary",
  "No live PHI",
  "no production credentials",
  "no raw connector payload logging",
  "no security certification claim"
]) {
  requireIncludes("app/lib/scrimedSecurityAssurancePipeline.ts", filesByPath["app/lib/scrimedSecurityAssurancePipeline.ts"], expected);
}

for (const expected of [
  "getScrimedSecurityAssuranceSummary",
  "getScrimedSecurityReleaseReadinessSummary",
  "getScrimedSecurityDiligenceEvidenceSummary",
  "securityAssurancePipeline",
  "securityReleaseReadiness",
  "securityDiligenceEvidence",
  "Security assurance pipeline",
  "scripts/scrimed-security-assurance-contract-check.mjs"
]) {
  requireIncludes("app/lib/scrimedCyberDefenseCommandCenter.ts", filesByPath["app/lib/scrimedCyberDefenseCommandCenter.ts"], expected);
}

for (const expected of [
  "scrimed-security-release-readiness-active-no-phi-no-customer-go-live",
  "ScrimedSecurityReleaseGate",
  "buyer_diligence_ready",
  "phi_preproduction_blocked",
  "live_phi_production_blocked",
  "getScrimedSecurityReleaseReadinessSummary"
]) {
  requireIncludes(
    "app/lib/scrimedSecurityReleaseReadiness.ts",
    filesByPath["app/lib/scrimedSecurityReleaseReadiness.ts"],
    expected
  );
}

for (const expected of [
  "scrimed-security-diligence-evidence-packet-active-no-phi",
  "ScrimedSecurityEvidenceArtifact",
  "buyerDiligenceShareReady",
  "getScrimedSecurityDiligenceEvidenceSummary"
]) {
  requireIncludes(
    "app/lib/scrimedSecurityDiligenceEvidence.ts",
    filesByPath["app/lib/scrimedSecurityDiligenceEvidence.ts"],
    expected
  );
}

for (const expected of [
  "Security Assurance Pipeline",
  "Security Release Readiness Gate",
  "Security Diligence Evidence Packet",
  "summary.securityAssurancePipeline.gates",
  "summary.securityReleaseReadiness.lanes",
  "summary.securityDiligenceEvidence.artifacts",
  "No-secret security checks"
]) {
  requireIncludes("app/scrimed-cyber-defense/page.tsx", filesByPath["app/scrimed-cyber-defense/page.tsx"], expected);
}

for (const expected of [
  "Security Assurance Pipeline",
  "npm run security:assurance",
  "npm run security:dependency-floor",
  "npm run contract:ci-workflows",
  "static token scanning",
  "framework dependency security floor",
  "CI workflow governance checks",
  "unsafe-claim detection",
  "Security Release Readiness Gate",
  "Security Diligence Evidence Packet",
  "external penetration testing"
]) {
  requireIncludes("docs/scrimed-cyber-defense.md", filesByPath["docs/scrimed-cyber-defense.md"], expected);
}

for (const expected of [
  "X-SCRIMED-Security-Evidence-Packet",
  "synthetic-security-evidence-metadata-only",
  "redacted-metadata-only"
]) {
  requireIncludes(
    "app/api/scrimed-cyber-defense/evidence-packet/route.ts",
    filesByPath["app/api/scrimed-cyber-defense/evidence-packet/route.ts"],
    expected
  );
}

for (const expected of [
  "Strict-Transport-Security",
  "Content-Security-Policy",
  "Cross-Origin-Resource-Policy",
  "X-SCRIMED-Security-Certification",
  "not-security-certified"
]) {
  requireIncludes("next.config.js", filesByPath["next.config.js"], expected);
}

for (const expected of [
  "x-middleware-subrequest",
  "X-SCRIMED-Middleware-Bypass-Header",
  "suspicious-forwarded-headers-removed"
]) {
  requireIncludes("proxy.ts", filesByPath["proxy.ts"], expected);
}

requireIncludes("package.json", filesByPath["package.json"], "\"security:assurance\"");
requireIncludes("package.json", filesByPath["package.json"], "\"security:dependency-floor\"");
requireIncludes("package.json", filesByPath["package.json"], "\"contract:ci-workflows\"");
requireIncludes("package.json", filesByPath["package.json"], "\"smoke:scrimed-security-assurance\"");
requireIncludes("package.json", filesByPath["package.json"], "\"security:evidence-packet\"");
requireIncludes("package.json", filesByPath["package.json"], "\"smoke:scrimed-security-diligence-evidence\"");
requireIncludes("package.json", filesByPath["package.json"], "\"security:release-readiness\"");
requireIncludes("package.json", filesByPath["package.json"], "\"smoke:scrimed-security-release-readiness\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  filesByPath["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/ci-workflow-contract-check.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  filesByPath["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/dependency-security-floor-contract-check.mjs"
);
requireIncludes(
  "scripts/ci-workflow-contract-check.mjs",
  filesByPath["scripts/ci-workflow-contract-check.mjs"],
  "pass SCRIMED CI workflow contract check"
);
requireIncludes(
  "scripts/ci-workflow-contract-check.mjs",
  filesByPath["scripts/ci-workflow-contract-check.mjs"],
  "continue-on-error: true"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  filesByPath["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-security-assurance-contract-check.mjs"
);
requireIncludes(
  "scripts/dependency-security-floor-contract-check.mjs",
  filesByPath["scripts/dependency-security-floor-contract-check.mjs"],
  "Next.js App Router security floor"
);
requireIncludes(
  "scripts/dependency-security-floor-contract-check.mjs",
  filesByPath["scripts/dependency-security-floor-contract-check.mjs"],
  "react and react-dom must stay pinned"
);
requireIncludes(
  "docs/dependency-security-floor.md",
  filesByPath["docs/dependency-security-floor.md"],
  "SCRIMED Dependency Security Floor"
);
requireIncludes(
  "docs/dependency-security-floor.md",
  filesByPath["docs/dependency-security-floor.md"],
  "npm run security:dependency-floor"
);
requireIncludes(
  "docs/ci-workflow-governance.md",
  filesByPath["docs/ci-workflow-governance.md"],
  "SCRIMED CI Workflow Governance"
);
requireIncludes(
  "docs/ci-workflow-governance.md",
  filesByPath["docs/ci-workflow-governance.md"],
  "npm run contract:ci-workflows"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  filesByPath["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-security-release-readiness-contract-check.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  filesByPath["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-security-diligence-evidence-contract-check.mjs"
);
requireIncludes(
  "scripts/scrimed-cyber-defense-contract-check.mjs",
  filesByPath["scripts/scrimed-cyber-defense-contract-check.mjs"],
  "Security Assurance Pipeline"
);
requireIncludes(
  "scripts/scrimed-security-release-readiness-contract-check.mjs",
  filesByPath["scripts/scrimed-security-release-readiness-contract-check.mjs"],
  "Security Release Readiness Gate"
);
requireIncludes(
  "scripts/scrimed-security-diligence-evidence-contract-check.mjs",
  filesByPath["scripts/scrimed-security-diligence-evidence-contract-check.mjs"],
  "Security Diligence Evidence Packet"
);

assertNoForbiddenClaims(filesByPath, [
  "app/lib/scrimedCyberDefenseCommandCenter.ts",
  "app/lib/scrimedSecurityAssurancePipeline.ts",
  "app/lib/scrimedSecurityReleaseReadiness.ts",
  "app/lib/scrimedSecurityDiligenceEvidence.ts",
  "app/api/scrimed-cyber-defense/route.ts",
  "app/api/scrimed-cyber-defense/evidence-packet/route.ts",
  "app/scrimed-cyber-defense/page.tsx",
  "docs/scrimed-cyber-defense.md"
]);

const scanFiles = Array.from(new Set((await Promise.all(scanRoots.map(collectFiles))).flat())).sort();
await assertNoSecretLikeValues(scanFiles);

console.log(`pass SCRIMED Security Assurance contract check (${scanFiles.length} files scanned)`);
