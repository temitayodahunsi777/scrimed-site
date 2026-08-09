#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/clinicalEvidenceControls.ts",
  "app/lib/documentationBeforeAuthorization.ts",
  "app/lib/imagingWorkflowIntelligence.ts",
  "app/lib/clinicalAgentSre.ts",
  "app/lib/valueContractEvidence.ts",
  "app/lib/scrimedClinicalBenchmarkSuite.ts",
  "app/lib/clinicalRobustnessLab.ts",
  "app/lib/scrimed-work/foundry.ts",
  "app/lib/scrimed-work/learningLoop.ts",
  "app/lib/scrimed-work/modelRouter.ts",
  "app/lib/scrimed-work/featureFlags.ts",
  "app/lib/healthcareIntelligenceOS.ts",
  "app/healthcare-intelligence-os/page.tsx",
  "app/scrimed-clinical-benchmark-suite/page.tsx",
  "docs/scrimed-p31-applied-intelligence.md",
  "docs/scrimed-p31-traceability.md",
  "scripts/clinical-evidence-controls-policy-test.mjs",
  "scripts/scrimed-p31-workstreams-policy-test.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} is missing required P31 workstream contract text: ${expected}`);
  }
}

for (const expected of [
  "ContextPacket",
  "buildContextPacket",
  "CaseEvidenceEvent",
  "InMemoryCaseEvidenceEventStore",
  "verifyCaseEvidencePacketIntegrity",
  "evaluateCaseEvidenceAggregation",
  "exportCaseEvidenceForAnalysis",
  "completenessPercent",
  "causalClaimAllowed: false",
  "externalDistributionAllowed: false"
]) requireIncludes("app/lib/clinicalEvidenceControls.ts", expected);

for (const expected of [
  "DICOMweb",
  "ImagingStudy",
  "DiagnosticReport",
  "Observation",
  "Provenance",
  "measurementConsistencyIssues",
  "diagnosticFinalizationAllowed: false",
  "ehrWritebackAllowed: false",
  "SCRIMED_EXTERNAL_IMAGING_ADAPTERS_ENABLED"
]) requireIncludes("app/lib/imagingWorkflowIntelligence.ts", expected);

for (const expected of [
  "OutcomeLearningController",
  "no-feedback-control",
  "randomized-feedback-control",
  "synthetic-research-sandbox",
  "clinicalProductionMutationAllowed: false",
  "request-separate-promotion-approval"
]) requireIncludes("app/lib/scrimed-work/learningLoop.ts", expected);

for (const expected of [
  "FoundryDefinition",
  "permissionsManifest",
  "syntheticEvaluationSet",
  "trustworthinessCase",
  "SCRIMED_FOUNDRY_DEPLOYMENT_ENABLED",
  "productionActivationAllowed: false",
  "priorAuthorizationFoundryTemplate"
]) requireIncludes("app/lib/scrimed-work/foundry.ts", expected);

for (const expected of [
  "validatedDomainCells",
  "abstained-no-eligible-model",
  "estimatedCostPerAcceptedOutcomeUsd",
  "privacyDowngradeAllowed: false",
  "silentFallbackAllowed: false",
  "maximumFallbacks"
]) requireIncludes("app/lib/scrimed-work/modelRouter.ts", expected);

for (const expected of [
  "p50LatencyMs",
  "p95LatencyMs",
  "p99LatencyMs",
  "queueCapacity",
  "maximumRetries",
  "circuitState",
  "worstCellStatus",
  "validatePhiSafeAgentTelemetry",
  "protectedChainOfThoughtStored: false"
]) requireIncludes("app/lib/clinicalAgentSre.ts", expected);

for (const expected of [
  "ValueContract",
  "30 | 60 | 90",
  "observed-fact",
  "association",
  "adjusted-analysis",
  "causal-claim",
  "unverified-claim",
  "verifyCaseEvidencePacketIntegrity",
  "externalDistributionAllowed: false"
]) requireIncludes("app/lib/valueContractEvidence.ts", expected);

for (const expected of [
  "buildScrimedClinicalBenchmarkCard",
  "globalAverageMayOverride: false",
  "routingDecisions",
  "eligibleModelIds",
  "clinicalAuthorityGranted: false"
]) requireIncludes("app/lib/scrimedClinicalBenchmarkSuite.ts", expected);

for (const expected of [
  "split-records",
  "repeated-keys",
  "page-break-evidence",
  "long-range-evidence",
  "duplicate-summaries",
  "silently-merged-records",
  "phantom-records",
  "corrupted-missing-pages",
  "citation-mismatch"
]) requireIncludes("app/lib/clinicalRobustnessLab.ts", expected);

for (const expected of [
  "p31AppliedIntelligence",
  "imagingWorkflowIntelligence",
  "domainBenchmarkCard",
  "outcomeLearning",
  "clinicianAgentFoundry",
  "clinicalAgentSre",
  "valueContractEvidence"
]) requireIncludes("app/lib/healthcareIntelligenceOS.ts", expected);

for (const expected of [
  "P31 applied intelligence",
  "Imaging workflow intelligence",
  "Worst-cell release gate",
  "Outcome learning controller",
  "Clinician-to-Agent Foundry",
  "Clinical Agent SRE",
  "Value Contract"
]) requireIncludes("app/healthcare-intelligence-os/page.tsx", expected);

for (const expected of [
  "SCRIMED P31 Traceability Matrix",
  "Durable CaseEvidence storage is not activated",
  "External PACS/RIS/VNA adapters remain feature-flagged off"
]) requireIncludes("docs/scrimed-p31-traceability.md", expected);

for (const expected of [
  "Imaging Workflow Intelligence",
  "Outcome/Lab-in-the-Loop",
  "Clinician-to-Agent Foundry",
  "Clinical Agent SRE",
  "Value Contract",
  "npm run test:scrimed-p31-workstreams",
  "npm run smoke:scrimed-p31-workstreams"
]) requireIncludes("docs/scrimed-p31-applied-intelligence.md", expected);

for (const expected of [
  "\"test:scrimed-p31-workstreams\"",
  "\"smoke:scrimed-p31-workstreams\""
]) requireIncludes("package.json", expected);

for (const expected of [
  "scripts/scrimed-p31-workstreams-policy-test.mjs",
  "scripts/scrimed-p31-workstreams-contract-check.mjs"
]) requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", expected);

for (const path of [
  "app/lib/imagingWorkflowIntelligence.ts",
  "app/lib/clinicalAgentSre.ts",
  "app/lib/valueContractEvidence.ts",
  "app/lib/scrimed-work/foundry.ts",
  "app/lib/scrimed-work/learningLoop.ts"
]) {
  if (/\bfetch\s*\(/.test(files[path])) {
    throw new Error(`${path} must not perform external network calls in the P31 synthetic control plane.`);
  }
}

console.log("pass SCRIMED P31 extended workstreams contract check");
