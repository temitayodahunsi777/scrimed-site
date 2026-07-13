#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimed/governanceLearningLoop.ts",
  "app/lib/scrimed/contextualAgentPolicy.ts",
  "app/api/scrimed-governance-learning-loop/route.ts",
  "app/scrimed-governance-learning-loop/page.tsx",
  "docs/scrimed-governance-learning-loop.md",
  "docs/scrimed-ai-visibility.md",
  "public/llms.txt",
  "package.json",
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
    throw new Error(`${path} missing required SCRIMED Governance Learning Loop text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));

const governanceSource = files["app/lib/scrimed/governanceLearningLoop.ts"];
const policySource = files["app/lib/scrimed/contextualAgentPolicy.ts"];

for (const expected of [
  "SCRIMED_GOVERNANCE_LEARNING_LOOP",
  "SCRIMED_AGENT_POLICY_LEVELS",
  "SCRIMED_SKILL_ACTIVATION_REGISTRY",
  "SCRIMED_VALUE_PRICING_FRAMEWORK",
  "SCRIMED_REGULATORY_WATCH_SCOPE",
  "SCRIMED_A2A_MCP_READINESS",
  "SCRIMED_CLINICAL_BOUNDARIES",
  "ScrimedAgentSessionState",
  "ScrimedContextualPolicyDecision",
  "ScrimedCorrectionArtifact",
  "ScrimedGovernanceAuditEvent",
  "ScrimedSkillActivation",
  "ScrimedWorkflowValueMetric",
  "Governance Skill",
  "Agent Learning Skill",
  "Clinical Safety Skill",
  "Regulatory Watch Skill",
  "AI Visibility Skill",
  "Value Pricing Skill",
  "Radiology Workflow Skill",
  "Wearables Intelligence Skill",
  "Interoperability Skill",
  "Observability Skill",
  "DevSecOps Skill",
  "Investor Narrative Skill",
  "human review",
  "audit",
  "governance",
  "decision support"
]) {
  requireIncludes("app/lib/scrimed/governanceLearningLoop.ts", governanceSource, expected);
}

for (const expected of [
  "assessAgentRisk",
  "decideToolPermission",
  "recordPolicyEvent",
  "requiresHumanApproval",
  "confidential-document-read -> external-send requires approval",
  "untrusted-external-content-read -> elevated prompt-injection risk",
  "cost-threshold exceeded -> ask approval",
  "clinical-facing output -> human review required",
  "payer submission -> deny",
  "EHR writeback -> deny",
  "diagnosis/treatment/prescribing -> deny",
  "public-safe educational output -> allow"
]) {
  requireIncludes("app/lib/scrimed/contextualAgentPolicy.ts", policySource, expected);
}

for (const expected of [
  "getScrimedGovernanceLearningLoopSummary",
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "X-SCRIMED-Governance-Learning-Loop",
  "synthetic-and-metadata-only"
]) {
  requireIncludes("app/api/scrimed-governance-learning-loop/route.ts", files["app/api/scrimed-governance-learning-loop/route.ts"], expected);
}

for (const expected of [
  "Governance Is",
  "Memory Is Not Learning",
  "Agent Policy Engine",
  "A2A + MCP Interoperability",
  "Value-Based Pricing",
  "Radiology AI: Imaging Insight to Action",
  "Wearables Intelligence Foundation",
  "Regulatory Watch",
  "Activated SCRIMED Skills"
]) {
  requireIncludes("app/scrimed-governance-learning-loop/page.tsx", files["app/scrimed-governance-learning-loop/page.tsx"], expected);
}

for (const expected of [
  "Governance is SCRIMED's competitive advantage",
  "Memory stores what happened",
  "observe -> evaluate -> correct -> approve -> update artifact -> retest -> monitor",
  "A2A/MCP Roadmap",
  "Value-Based Pricing Logic",
  "Regulatory Watch Scope"
]) {
  requireIncludes("docs/scrimed-governance-learning-loop.md", files["docs/scrimed-governance-learning-loop.md"], expected);
}

for (const expected of [
  "llms.txt purpose",
  "AI-search discoverability",
  "structured page metadata",
  "describe SCRIMED accurately"
]) {
  requireIncludes("docs/scrimed-ai-visibility.md", files["docs/scrimed-ai-visibility.md"], expected);
}

for (const expected of [
  "SCRIMED is a healthcare intelligence operating system",
  "Canonical Pages",
  "/scrimed-governance-learning-loop",
  "Clinical Boundaries",
  "governed healthcare AI infrastructure",
  "human-reviewed decision support"
]) {
  requireIncludes("public/llms.txt", files["public/llms.txt"], expected);
}

const forbiddenClaimParts = [
  ["HIPAA", " certified"],
  ["FDA", " cleared"],
  ["autonomous", " diagnosis"],
  ["autonomous", " treatment"],
  ["pres", "cribes"],
  ["replaces", " doctors"],
  ["EHR writeback", " enabled"],
  ["payer submission", " enabled"]
];

const claimScanFiles = [
  "app/lib/scrimed/governanceLearningLoop.ts",
  "app/lib/scrimed/contextualAgentPolicy.ts",
  "app/api/scrimed-governance-learning-loop/route.ts",
  "app/scrimed-governance-learning-loop/page.tsx",
  "docs/scrimed-governance-learning-loop.md",
  "docs/scrimed-ai-visibility.md",
  "public/llms.txt"
];

for (const path of claimScanFiles) {
  const lower = files[path].toLowerCase();

  for (const parts of forbiddenClaimParts) {
    const forbidden = parts.join("").toLowerCase();
    if (lower.includes(forbidden)) {
      throw new Error(`${path} contains forbidden SCRIMED claim: ${forbidden}`);
    }
  }
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-governance-learning-loop\"");
requireIncludes("package.json", files["package.json"], "\"contract:scrimed-governance-learning-loop\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-governance-learning-loop-contract-check.mjs"
);
requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], "/scrimed-governance-learning-loop");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "/scrimed-governance-learning-loop");
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], "/scrimed-governance-learning-loop");

console.log("pass SCRIMED Governance Learning Loop contract check");
