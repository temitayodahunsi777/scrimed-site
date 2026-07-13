#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const surfaces = [
  {
    id: "scrimed-agent-governance",
    lib: "app/lib/scrimedAgentGovernance.ts",
    api: "app/api/scrimed-agent-governance/route.ts",
    brief: "app/api/scrimed-agent-governance/brief/route.ts",
    page: "app/scrimed-agent-governance/page.tsx",
    docs: "docs/scrimed-agent-governance.md",
    status: "scrimed-agent-governance-active-synthetic-no-phi",
    title: "SCRIMED Agent Governance",
    required: [
      "ScrimedAgentGovernancePolicy",
      "ScrimedAgentSessionState",
      "scrimedAgentIdentityRegistry",
      "phiAccessed",
      "confidentialDocumentAccessed",
      "untrustedContentRead",
      "externalActionRequested",
      "costUsd",
      "humanApprovalRequired",
      "dynamicRiskScore",
      "allow",
      "deny",
      "require_review",
      "phi-touched-block-export",
      "outside-declared-scope-deny",
      "clinical-recommendation-decision-support-only"
    ]
  },
  {
    id: "scrimed-reasoning-stability",
    lib: "app/lib/scrimedReasoningStability.ts",
    api: "app/api/scrimed-reasoning-stability/route.ts",
    brief: "app/api/scrimed-reasoning-stability/brief/route.ts",
    page: "app/scrimed-reasoning-stability/page.tsx",
    docs: "docs/scrimed-reasoning-stability.md",
    status: "scrimed-reasoning-stability-active-synthetic-no-phi",
    title: "SCRIMED Reasoning Stability",
    required: [
      "doomLoopDetected",
      "repeatedSpanDetected",
      "selfConsistencyCheck",
      "clinicalHallucinationRisk",
      "retryRecommendation",
      "confidenceCategory",
      "safetyStatus",
      "low",
      "medium",
      "high",
      "pass",
      "caution",
      "blocked"
    ]
  },
  {
    id: "scrimed-clinical-benchmark-suite",
    lib: "app/lib/scrimedClinicalBenchmarkSuite.ts",
    api: "app/api/scrimed-clinical-benchmark-suite/route.ts",
    brief: "app/api/scrimed-clinical-benchmark-suite/brief/route.ts",
    page: "app/scrimed-clinical-benchmark-suite/page.tsx",
    docs: "docs/scrimed-clinical-benchmark-suite.md",
    status: "scrimed-clinical-benchmark-suite-active-synthetic-no-phi",
    title: "SCRIMED Clinical Benchmark Suite",
    required: [
      "prior authorization",
      "appeals",
      "clinical documentation",
      "SOAP note quality",
      "medical necessity",
      "care coordination",
      "coding",
      "revenue cycle",
      "oncology",
      "cardiology",
      "radiology",
      "emergency triage",
      "FHIR",
      "HL7",
      "DICOM",
      "patient education",
      "evidence summarization",
      "clinical trial matching",
      "compliance",
      "humanReviewerRequired",
      "exampleExpectedOutputBoundary"
    ]
  },
  {
    id: "scrimed-hybrid-retrieval",
    lib: "app/lib/scrimedHybridRetrieval.ts",
    api: "app/api/scrimed-hybrid-retrieval/route.ts",
    brief: "app/api/scrimed-hybrid-retrieval/brief/route.ts",
    page: "app/scrimed-hybrid-retrieval/page.tsx",
    docs: "docs/scrimed-hybrid-retrieval.md",
    status: "scrimed-hybrid-retrieval-active-synthetic-no-phi",
    title: "SCRIMED Hybrid Retrieval",
    required: [
      "bm25Score",
      "vectorScore",
      "ontologyBoost",
      "knowledgeGraphBoost",
      "unifiedScore",
      "citationRequired",
      "sourceTrustTier",
      "doNotAnswerWithoutEvidence",
      "rankScrimedHybridRetrievalDocuments"
    ]
  },
  {
    id: "scrimed-llmops-observability",
    lib: "app/lib/scrimedLLMOpsObservability.ts",
    api: "app/api/scrimed-llmops-observability/route.ts",
    brief: "app/api/scrimed-llmops-observability/brief/route.ts",
    page: "app/scrimed-llmops-observability/page.tsx",
    docs: "docs/scrimed-llmops-observability.md",
    status: "scrimed-llmops-observability-active-synthetic-no-phi",
    title: "SCRIMED LLMOps Observability",
    required: [
      "traceId",
      "agentId",
      "modelId",
      "latencyMs",
      "costEstimateUsd",
      "tokenEstimate",
      "safetyEventCount",
      "policyDecision",
      "benchmarkStatus",
      "rollbackReadiness",
      "productionReadiness: false"
    ]
  },
  {
    id: "scrimed-ai-infrastructure-watchtower",
    lib: "app/lib/scrimedAIInfrastructureWatchtower.ts",
    api: "app/api/scrimed-ai-infrastructure-watchtower/route.ts",
    brief: "app/api/scrimed-ai-infrastructure-watchtower/brief/route.ts",
    page: "app/scrimed-ai-infrastructure-watchtower/page.tsx",
    docs: "docs/scrimed-ai-infrastructure-watchtower.md",
    status: "scrimed-ai-infrastructure-watchtower-active-synthetic-no-phi",
    title: "SCRIMED AI Infrastructure Watchtower",
    required: [
      "AI chips",
      "model sovereignty",
      "local/on-device models",
      "open-weight model access",
      "energy infrastructure",
      "data center cooling",
      "AI regulations",
      "AI companion restrictions",
      "cybersecurity/agentic ransomware",
      "clinical AI funding",
      "healthcare interoperability",
      "legal/regulatory benchmarks",
      "workforce skills",
      "payer automation",
      "medical imaging",
      "drug discovery"
    ]
  },
  {
    id: "scrimed-patient-context-gateway",
    lib: "app/lib/scrimedPatientContextGateway.ts",
    api: "app/api/scrimed-patient-context-gateway/route.ts",
    brief: "app/api/scrimed-patient-context-gateway/brief/route.ts",
    page: "app/scrimed-patient-context-gateway/page.tsx",
    docs: "docs/scrimed-patient-context-gateway.md",
    status: "scrimed-patient-context-gateway-active-synthetic-no-phi",
    title: "SCRIMED Patient Context Gateway",
    required: [
      "synthetic-demo-only",
      "patientStoryContinuityModel",
      "sourceProvenanceRequired",
      "hieInteroperabilityConcept",
      "fhirReadyAbstraction",
      "consentRequired",
      "Elderly complex-care continuity scenario",
      "ehrWritebackEnabled: false"
    ]
  }
];

const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
const target = targetArg?.split("=")[1];
const selectedSurfaces = target ? surfaces.filter((surface) => surface.id === target) : surfaces;

if (target && selectedSurfaces.length === 0) {
  throw new Error(`Unknown SCRIMED CODE pt. 4 smoke target: ${target}`);
}

const sharedFiles = [
  "SCRIMED_CODE_PT_4_IMPLEMENTATION.md",
  "docs/scrimed-code-pt-4.md",
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
    throw new Error(`${path} missing required SCRIMED CODE pt. 4 text: ${expected}`);
  }
}

const allFiles = [
  ...sharedFiles,
  ...selectedSurfaces.flatMap((surface) => [surface.lib, surface.api, surface.brief, surface.page, surface.docs])
];
const files = Object.fromEntries(await Promise.all(Array.from(new Set(allFiles)).map(load)));

for (const surface of selectedSurfaces) {
  for (const expected of [surface.status, ...surface.required]) {
    requireIncludes(surface.lib, files[surface.lib], expected);
  }

  for (const expected of [
    "evaluateScrimedSafetyGate",
    "scrimedSafetyHeaders",
    "X-SCRIMED-Code-PT-4",
    "synthetic-no-phi-metadata-only"
  ]) {
    requireIncludes(surface.api, files[surface.api], expected);
  }

  for (const expected of ["Content-Disposition", "text/markdown", "X-SCRIMED-Code-PT-4"]) {
    requireIncludes(surface.brief, files[surface.brief], expected);
  }

  for (const expected of [surface.title, "SCRIMED CODE pt. 4", "Inspect API", "Download Brief"]) {
    requireIncludes(surface.page, files[surface.page], expected);
  }

  for (const expected of [surface.title, `/${surface.id}`, `/api/${surface.id}`, "Safety Boundary"]) {
    requireIncludes(surface.docs, files[surface.docs], expected);
  }

  requireIncludes("package.json", files["package.json"], `"smoke:${surface.id}"`);
  requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], `/${surface.id}`);
  requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], `/${surface.id}`);
  requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], `/${surface.id}`);
}

for (const expected of [
  "SCRIMED CODE pt. 4 Implementation",
  "SCRIMED Agent Governance Control Plane",
  "SCRIMED Reasoning Stability Layer",
  "SCRIMED Clinical Benchmark Suite",
  "SCRIMED Hybrid Retrieval Engine",
  "SCRIMED LLMOps Observability Layer",
  "SCRIMED AI Infrastructure Watchtower",
  "SCRIMED Patient Context Gateway",
  "No PHI",
  "No autonomous clinical care",
  "No production deploy claims",
  "No certification claims",
  "No customer go-live claims"
]) {
  requireIncludes("SCRIMED_CODE_PT_4_IMPLEMENTATION.md", files["SCRIMED_CODE_PT_4_IMPLEMENTATION.md"], expected);
}

requireIncludes("docs/scrimed-code-pt-4.md", files["docs/scrimed-code-pt-4.md"], "SCRIMED CODE pt. 4");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-code-pt-4\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-code-pt-4-contract-check.mjs"
);

console.log(`pass SCRIMED CODE pt. 4 contract check${target ? ` (${target})` : ""}`);
