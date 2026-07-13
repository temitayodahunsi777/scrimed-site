#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/omegaPlatformAudit.ts",
  "app/omega-audit/page.tsx",
  "app/api/omega-audit/route.ts",
  "app/api/omega-audit/brief/route.ts",
  "app/lib/siteNavigation.ts",
  "docs/omega-platform-audit.md",
  "package.json",
  "scripts/omega-platform-audit-contract-check.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required Omega platform audit contract text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/omegaPlatformAudit.ts"];
const page = files["app/omega-audit/page.tsx"];
const api = files["app/api/omega-audit/route.ts"];
const brief = files["app/api/omega-audit/brief/route.ts"];
const nav = files["app/lib/siteNavigation.ts"];
const docs = files["docs/omega-platform-audit.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "omegaPlatformAuditStatus",
  "omegaProductSeeds",
  "omegaAuditLenses",
  "omegaImplementationLanes",
  "getOmegaPlatformAuditSummary",
  "buildOmegaPlatformAuditBrief",
  "SCRIMED OS",
  "Sanar AI",
  "MyVitals AI",
  "DocuTwin",
  "Ambient Scribe",
  "CareExplain",
  "Perfect Chart",
  "Clinical Copilot",
  "Contact Center AI",
  "Patient Education",
  "TrialCore",
  "OncoID",
  "Trust Engine",
  "Trust Dashboard",
  "Clinical Intelligence Platform",
  "Imaging Platform",
  "Referral Intelligence",
  "Prior Authorization",
  "Revenue Cycle",
  "Payer Intelligence",
  "Population Health",
  "Clinical Research",
  "Provider Dashboard",
  "Executive Dashboard",
  "Admin Console",
  "Patient Portal",
  "SCRIMED University",
  "Atlas Platform",
  "Mobile Applications",
  "Agent Marketplace",
  "Internal Operations Platform",
  "architecture",
  "technical-debt",
  "performance",
  "security",
  "clinical-safety",
  "accessibility",
  "scalability",
  "maintainability",
  "reliability",
  "user-experience",
  "developer-experience",
  "compliance",
  "Clinical Robustness Lab",
  "Agent Runtime and MCP Gateway",
  "Private and Edge AI Architecture",
  "Payer, Referral, and Revenue Engine",
  "Observability and Progressive Delivery",
  "Enterprise Infrastructure, IaC, and Disaster Recovery",
  "## Operating Boundary",
  "## Product Coverage",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-security-certified",
  "not-buyer-release-approval",
  "not-production-connector-approved"
]) {
  requireIncludes("app/lib/omegaPlatformAudit.ts", source, expected);
}

for (const expected of [
  "SCRIMED Omega Platform Audit",
  "Every SCRIMED product now has a product-grade audit",
  "Discovered platform surface",
  "Twelve-lens audit standard",
  "Product audit registry",
  "not clinical validation, certification, production approval, or buyer release"
]) {
  requireIncludes("app/omega-audit/page.tsx", page, expected);
}

for (const expected of [
  "X-SCRIMED-Omega-Audit",
  "X-SCRIMED-Audit-Authority",
  "X-SCRIMED-PHI-Authority",
  "X-SCRIMED-Clinical-Care-Authority",
  "X-SCRIMED-Security-Certification"
]) {
  requireIncludes("app/api/omega-audit/route.ts", api, expected);
  requireIncludes("app/api/omega-audit/brief/route.ts", brief, expected);
}

for (const expected of [
  "Omega Audit",
  "/omega-audit",
  "Complete product, module, API, agent, workflow, UI, backend, infrastructure, safety, and upgrade audit"
]) {
  requireIncludes("app/lib/siteNavigation.ts", nav, expected);
}

for (const expected of [
  "npm run smoke:omega-audit",
  "npm run test:nonsecret",
  "Product Coverage",
  "Operating Boundary",
  "does not authorize PHI processing"
]) {
  requireIncludes("docs/omega-platform-audit.md", docs, expected);
}

for (const expected of [
  "\"smoke:omega-audit\": \"node scripts/omega-platform-audit-contract-check.mjs\""
]) {
  requireIncludes("package.json", packageJson, expected);
}

for (const expected of [
  "scripts/omega-platform-audit-contract-check.mjs"
]) {
  requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", suite, expected);
}

console.log("pass omega platform audit contract check");
