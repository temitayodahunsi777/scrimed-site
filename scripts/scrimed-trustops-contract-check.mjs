#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimed/trustops-schema.ts",
  "app/lib/scrimed/trustops-registry.ts",
  "app/lib/scrimed/signal-engine.ts",
  "app/lib/scrimed/self-healing-workflows.ts",
  "app/lib/scrimed/trustops-review-packets.ts",
  "app/lib/scrimed/semantic-intelligence-layer.ts",
  "app/lib/executionAttemptEnvelope.ts",
  "app/api/scrimed-trustops/route.ts",
  "app/api/scrimed-trustops/brief/route.ts",
  "app/api/scrimed-trustops/review-packets/route.ts",
  "app/api/scrimed-trustops/review-packets/brief/route.ts",
  "app/scrimed-trustops/page.tsx",
  "app/lib/siteNavigation.ts",
  "docs/scrimed-trustops-intelligence-layer.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED TrustOps text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const schema = files["app/lib/scrimed/trustops-schema.ts"];
const registry = files["app/lib/scrimed/trustops-registry.ts"];
const signalEngine = files["app/lib/scrimed/signal-engine.ts"];
const selfHealing = files["app/lib/scrimed/self-healing-workflows.ts"];
const reviewPackets = files["app/lib/scrimed/trustops-review-packets.ts"];
const semanticLayer = files["app/lib/scrimed/semantic-intelligence-layer.ts"];
const executionAttemptEnvelope = files["app/lib/executionAttemptEnvelope.ts"];
const api = files["app/api/scrimed-trustops/route.ts"];
const briefApi = files["app/api/scrimed-trustops/brief/route.ts"];
const reviewPacketsApi = files["app/api/scrimed-trustops/review-packets/route.ts"];
const reviewPacketsBriefApi = files["app/api/scrimed-trustops/review-packets/brief/route.ts"];
const page = files["app/scrimed-trustops/page.tsx"];
const nav = files["app/lib/siteNavigation.ts"];
const docs = files["docs/scrimed-trustops-intelligence-layer.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "validateTrustOpsModuleBrief",
  "validateSyntheticOperationalSignal",
  "validateSelfHealingRecommendation",
  "syntheticOnly: true",
  "riskPenalty",
  "TrustOpsReviewPacket",
  "TrustOpsDurableEvidenceBinding",
  "validateTrustOpsReviewPacket",
  "total = safety*0.30 + governance*0.25"
]) {
  requireIncludes("app/lib/scrimed/trustops-schema.ts", schema, expected);
}

for (const expected of [
  "Patient Journey Memory",
  "Clinical Intelligence",
  "RCM / Denials",
  "Prior Authorization",
  "Patient Access",
  "Scheduling",
  "Referral Management",
  "Imaging Intelligence",
  "Population Health",
  "Quality / HEDIS / STAR",
  "Governance / Compliance",
  "Signal Detection",
  "Self-Healing Operations",
  "Semantic Intelligence Graph",
  "Secure Middleware Gateway",
  "all-required-trustops-modules-registered",
  "safety-and-governance-weighted",
  "module-briefs-schema-valid",
  "Demo/synthetic only"
]) {
  requireIncludes("app/lib/scrimed/trustops-registry.ts", registry, expected);
}

for (const expected of [
  "denied_claim_spike",
  "referral_delay",
  "prior_auth_stalled",
  "missing_documentation",
  "imaging_turnaround_delay",
  "care_gap_detected",
  "failed_api_sync",
  "duplicate_patient_context",
  "low_confidence_agent_output",
  "compliance_sensitive_task",
  "detectSyntheticOperationalSignals"
]) {
  requireIncludes("app/lib/scrimed/signal-engine.ts", signalEngine, expected);
}

for (const expected of [
  "retry workflow",
  "regenerate missing packet",
  "request human review",
  "escalate to compliance",
  "queue for manual verification",
  "reconcile duplicate records",
  "re-run validation",
  "open investigation ticket",
  "pause automation",
  "Recommendation-only synthetic remediation"
]) {
  requireIncludes("app/lib/scrimed/self-healing-workflows.ts", selfHealing, expected);
}

for (const expected of [
  "trustops-signal-remediation-review",
  "buildTrustOpsReviewPackets",
  "validateTrustOpsReviewPacketSet",
  "getTrustOpsReviewPacketSummary",
  "validateExecutionAttemptDurableStoreRecordRequest",
  "validateExecutionAttemptDurableStoreReplayRequest",
  "validateExecutionAttemptDurableStoreReviewRequest",
  "ready-for-aal2-protected-durable-store-not-persisted",
  "no-phi-human-review-no-clinical-authority",
  "recommendation-only"
]) {
  requireIncludes("app/lib/scrimed/trustops-review-packets.ts", reviewPackets, expected);
}

for (const expected of [
  "trustops-signal-remediation-review",
  "agent-runtime-trustops-supervisor",
  "trustops signal remediation review",
  "org-policy-human-trustops-review-required-v1"
]) {
  requireIncludes("app/lib/executionAttemptEnvelope.ts", executionAttemptEnvelope, expected);
}

for (const expected of [
  "getScrimedTrustOpsIntelligenceLayerSummary",
  "registrySummary",
  "topModulesByStrategicValue",
  "highestRiskModules",
  "syntheticSignals",
  "selfHealingRecommendations",
  "reviewPacketSummary",
  "trustops-review-packets-durable-binding-valid",
  "governanceChecklist",
  "semanticIntelligenceGraph"
]) {
  requireIncludes("app/lib/scrimed/semantic-intelligence-layer.ts", semanticLayer, expected);
}

for (const expected of [
  "getScrimedTrustOpsIntelligenceLayerSummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-TrustOps",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/api/scrimed-trustops/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedTrustOpsBrief",
  "text/markdown",
  "scrimed-trustops-intelligence-layer.md"
]) {
  requireIncludes("app/api/scrimed-trustops/brief/route.ts", briefApi, expected);
}

for (const expected of [
  "getTrustOpsReviewPacketSummary",
  "X-SCRIMED-TrustOps-Persistence",
  "aal2-protected-durable-store-ready-not-public-write",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/api/scrimed-trustops/review-packets/route.ts", reviewPacketsApi, expected);
}

for (const expected of [
  "SCRIMED TrustOps Review Packets",
  "scrimed-trustops-review-packets.md",
  "durableStoreRoutes",
  "Packet count"
]) {
  requireIncludes("app/api/scrimed-trustops/review-packets/brief/route.ts", reviewPacketsBriefApi, expected);
}

for (const expected of [
  "SCRIMED TrustOps Intelligence Layer",
  "Inspect TrustOps API",
  "Review Packets",
  "Durable evidence binding",
  "Signal Engine",
  "Self-Healing Workflow",
  "recommendation-only"
]) {
  requireIncludes("app/scrimed-trustops/page.tsx", page, expected);
}

for (const expected of [
  "TrustOps",
  "/scrimed-trustops",
  "synthetic signal detection"
]) {
  requireIncludes("app/lib/siteNavigation.ts", nav, expected);
}

for (const expected of [
  "/scrimed-trustops",
  "/api/scrimed-trustops",
  "/api/scrimed-trustops/review-packets",
  "TrustOps Scoring",
  "Synthetic Signal Engine",
  "Self-Healing Workflow",
  "Durable Review Packet Binding",
  "ready-for-aal2-protected-durable-store-not-persisted",
  "Structured Validation",
  "does not authorize live PHI"
]) {
  requireIncludes("docs/scrimed-trustops-intelligence-layer.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-trustops\": \"node scripts/scrimed-trustops-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-trustops-contract-check.mjs"
);

console.log("pass SCRIMED TrustOps Intelligence Layer contract check");
