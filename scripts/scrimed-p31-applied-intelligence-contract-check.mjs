#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/clinicalEvidenceControls.ts",
  "app/lib/clinicalContextGateway.ts",
  "app/lib/scrimedClinicalBenchmarkSuite.ts",
  "app/lib/documentationBeforeAuthorization.ts",
  "app/lib/healthcareIntelligenceOS.ts",
  "app/healthcare-intelligence-os/page.tsx",
  "app/scrimed-clinical-benchmark-suite/page.tsx",
  "app/documentation-before-authorization/page.tsx",
  "docs/scrimed-p31-applied-intelligence.md",
  "scripts/clinical-evidence-controls-policy-test.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

const files = Object.fromEntries(
  await Promise.all(
    requiredFiles.map(async (path) => [path, await readFile(path, "utf8")])
  )
);

function requireIncludes(path, values) {
  const missing = values.filter((value) => !files[path].includes(value));
  if (missing.length > 0) {
    throw new Error(`${path} is missing P31 contract text: ${missing.join(", ")}`);
  }
}

requireIncludes("app/lib/clinicalEvidenceControls.ts", [
  "ClinicalContextLensMode",
  "public-evidence",
  "clinical-context",
  "livePhiEnabled: false",
  "evaluateClinicalContextLens",
  "supporting context is stale, expired, or not yet effective",
  "CaseEvidencePacket",
  "buildCaseEvidencePacket",
  "causalClaimAllowed: false",
  "externalDistributionAllowed: false",
  "DomainStressCell",
  "evaluateWorstCellReleaseGate",
  "worst-material-cell",
  "globalAverageMayOverride: false",
  "eligibleForClinicalAuthority: false"
]);

requireIncludes("app/lib/clinicalContextGateway.ts", [
  "clinicalContextIsolationPolicy",
  "buildContextLens",
  "contextLens: ClinicalContextLensResult | null",
  "sourceAndReasonRequired: true",
  "abstain-or-require-review"
]);

requireIncludes("app/lib/scrimedClinicalBenchmarkSuite.ts", [
  "scrimedClinicalDomainStressMatrix",
  "evaluateWorstCellReleaseGate",
  "patient-education-complex-care-older-adult-spanish",
  "imaging-exam-completeness-radiology-dicom-english",
  "Aggregate averages cannot override"
]);

requireIncludes("app/lib/documentationBeforeAuthorization.ts", [
  "caseEvidence: CaseEvidencePacket",
  "buildCaseEvidencePacket",
  "evidenceFromFirstCase",
  "causalityClaimAllowed: false",
  "Case evidence packet hash"
]);

requireIncludes("app/lib/healthcareIntelligenceOS.ts", [
  "contextLensModes",
  "contextLensLivePhiEnabled",
  "unsupportedOrStaleContextAction",
  "contextLensSourceAndReasonRequired"
]);

requireIncludes("app/healthcare-intelligence-os/page.tsx", [
  "Context Lens",
  "Public Evidence and Clinical Context remain isolated",
  "Live PHI"
]);

requireIncludes("app/scrimed-clinical-benchmark-suite/page.tsx", [
  "Worst-cell gate",
  "The weakest material subgroup controls release",
  "Global benchmark averages cannot override"
]);

requireIncludes("app/documentation-before-authorization/page.tsx", [
  "Evidence From First Case",
  "emitted from first synthetic run",
  "Causal claims: blocked"
]);

requireIncludes("docs/scrimed-p31-applied-intelligence.md", [
  "SCRIMED P31 Applied Intelligence",
  "Evidence From First Case",
  "Domain Stress Matrix",
  "worst material cell",
  "Live PHI remains disabled",
  "Imaging Workflow Intelligence Adapter"
]);

requireIncludes("scripts/clinical-evidence-controls-policy-test.mjs", [
  "unauthenticatedClinical",
  "staleContext",
  "phiContext",
  "causalClaimAllowed",
  "worstCellGate",
  "globalAverageMayOverride"
]);

requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", [
  "P31 clinical evidence controls policy behavior",
  "scripts/clinical-evidence-controls-policy-test.mjs",
  "SCRIMED P31 applied intelligence contract"
]);

requireIncludes("package.json", [
  "\"test:clinical-evidence-controls\"",
  "\"smoke:scrimed-p31\""
]);

console.log("pass SCRIMED P31 applied intelligence contract");
