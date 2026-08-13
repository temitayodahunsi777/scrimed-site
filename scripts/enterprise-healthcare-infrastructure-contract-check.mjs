#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/enterpriseHealthcareInfrastructure.ts",
  "app/lib/interoperabilityConformanceEvaluations.ts",
  "app/api/enterprise-healthcare-infrastructure/route.ts",
  "app/api/enterprise-healthcare-infrastructure/brief/route.ts",
  "app/enterprise-healthcare-infrastructure/page.tsx",
  "docs/enterprise-healthcare-infrastructure.md",
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
    throw new Error(`${path} missing required Enterprise Healthcare Infrastructure text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/enterpriseHealthcareInfrastructure.ts"];
const conformanceSource = files["app/lib/interoperabilityConformanceEvaluations.ts"];

for (const expected of [
  "enterprise-healthcare-infrastructure-readiness-active-no-phi",
  "EnterpriseInfrastructureCapability",
  "EnterpriseInfrastructureIntegrationPath",
  "EnterpriseInfrastructureScorecard",
  "EnterpriseInfrastructureSalesMotion",
  "EnterpriseInfrastructureDiscoveryQuestion",
  "EnterpriseInfrastructurePilotScope",
  "EnterpriseInfrastructureProofPacketItem",
  "EnterpriseInfrastructurePilotRecommendationInput",
  "EnterpriseInfrastructurePilotRecommendation",
  "EnterpriseInfrastructureBuyerPacket",
  "EnterpriseInfrastructureDecisionReadinessScorecard",
  "EnterpriseInfrastructureProcurementActionPlan",
  "EnterpriseInfrastructureConformanceControlPack",
  "EnterpriseInfrastructureCompetitiveDesignPattern",
  "hl7-fhir-context-gateway",
  "dicom-pacs-ris-workflow",
  "his-ris-adt-operating-map",
  "x12-payer-rcm-rail",
  "integration-engine-adapter",
  "secure-networking-vpn-firewall",
  "vm-edge-runtime",
  "database-audit-ledger",
  "agent-orchestration-command",
  "buyer-proof-sales-path",
  "FHIR",
  "HL7 v2 ADT",
  "DICOM",
  "DICOMweb",
  "PACS",
  "RIS",
  "HIS",
  "X12",
  "XICOM alias mapping",
  "Integration Engines",
  "VPN",
  "Virtual Machines",
  "Client/Server Architecture",
  "Databases",
  "Firewalls",
  "humanReviewRequired: true",
  "productionAuthority: false",
  "enterpriseInfrastructureDiscoveryQuestions",
  "enterpriseInfrastructurePilotScopes",
  "enterpriseInfrastructureProofPacketChecklist",
  "enterpriseInfrastructurePilotRecommendationInputs",
  "enterpriseInfrastructurePilotRecommendations",
  "enterpriseInfrastructureBuyerPackets",
  "enterpriseInfrastructureDecisionReadinessScorecards",
  "enterpriseInfrastructureProcurementActionPlans",
  "enterpriseInfrastructureCompetitiveDesignPatterns",
  "getEnterpriseInfrastructureConformanceControlPack",
  "hospital-integration-conformance-control-pack",
  "synthetic_evidence_ready",
  "one-integration-governed-orchestration",
  "profile-based-procurement-language",
  "packetForRecommendation",
  "scorecardForBuyerPacket",
  "procurementActionPlanForScorecard",
  "recommendEnterpriseInfrastructurePilot",
  "pilotRecommendationRules",
  "hl7-fhir-context-sprint",
  "dicom-pacs-ris-ops-sprint",
  "x12-rcm-evidence-sprint",
  "private-runtime-readiness-sprint",
  "audit-ledger-trust-sprint",
  "cio-integration-buyer",
  "radiology-ops-buyer",
  "rcm-cfo-buyer",
  "security-private-ai-buyer",
  "investor-trust-reviewer",
  "forbiddenInput",
  "buildEnterpriseHealthcareInfrastructureBrief"
]) {
  requireIncludes("app/lib/enterpriseHealthcareInfrastructure.ts", source, expected);
}

for (const expected of [
  "buildHl7V2EventEvaluation",
  "hl7-v2-adt-event-feed",
  "HL7 v2 ADT / Order / Result Event Test Kit",
  "hl7-engine-acceptance",
  "buildX12PayerEvaluation",
  "x12-payer-rcm-evidence",
  "X12 Payer / RCM Evidence Test Kit",
  "x12-human-submission-gate",
  "Payer submission remains disabled",
  "getInteroperabilityConformanceEvaluations"
]) {
  requireIncludes("app/lib/interoperabilityConformanceEvaluations.ts", conformanceSource, expected);
}

for (const expected of [
  "getEnterpriseHealthcareInfrastructureSummary",
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "X-SCRIMED-Enterprise-Infrastructure",
  "synthetic-infrastructure-metadata-only",
  "not-production-connector-approved",
  "not-final-imaging-interpretation",
  "not-payer-submission-authorized",
  "synthetic-evidence-live-blocked"
]) {
  requireIncludes(
    "app/api/enterprise-healthcare-infrastructure/route.ts",
    files["app/api/enterprise-healthcare-infrastructure/route.ts"],
    expected
  );
}

for (const expected of [
  "buildEnterpriseHealthcareInfrastructureBrief",
  "enterprise-healthcare-infrastructure.md",
  "text/markdown",
  "X-SCRIMED-Enterprise-Infrastructure",
  "synthetic-evidence-live-blocked"
]) {
  requireIncludes(
    "app/api/enterprise-healthcare-infrastructure/brief/route.ts",
    files["app/api/enterprise-healthcare-infrastructure/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "SCRIMED Enterprise Healthcare Infrastructure Readiness",
  "Hospital Infrastructure Map",
  "Integration Paths",
  "Hospital Integration Conformance Control Pack",
  "Competitive Architecture Intelligence",
  "One governed integration surface",
  "Revenue and Diligence",
  "No-PHI Discovery Intake",
  "Scoped Pilot Packages",
  "Pilot Recommendation Engine",
  "Buyer Packet Composer",
  "Decision Readiness Scorecards",
  "Procurement Action Plans",
  "Proof Packet Checklist",
  "Hard Stops",
  "No live PHI, no EHR writeback, no payer submission, no final imaging interpretation"
]) {
  requireIncludes(
    "app/enterprise-healthcare-infrastructure/page.tsx",
    files["app/enterprise-healthcare-infrastructure/page.tsx"],
    expected
  );
}

for (const expected of [
  "SCRIMED Enterprise Healthcare Infrastructure Readiness",
  "FHIR and HL7 v2 ADT",
  "DICOM, DICOMweb, PACS, RIS, HIS",
  "VPNs, Firewalls",
  "Integration Engines",
  "Hospital Integration Conformance Control Pack",
  "Competitive Patterns Applied Independently",
  "FHIR R4 validation",
  "X12 healthcare resources",
  "No-PHI Discovery Intake",
  "Scoped Pilot Packages",
  "Pilot Recommendation Engine",
  "Buyer Packet Composer",
  "Decision Readiness Scorecards",
  "Procurement Action Plans",
  "Proof Packet Checklist",
  "npm run smoke:enterprise-healthcare-infrastructure",
  "This is infrastructure readiness only"
]) {
  requireIncludes("docs/enterprise-healthcare-infrastructure.md", files["docs/enterprise-healthcare-infrastructure.md"], expected);
}

const forbiddenClaims = [
  "HIPAA certified",
  "SOC 2 certified",
  "HITRUST certified",
  "FDA cleared",
  "clinically validated",
  "security certified",
  "guaranteed ROI",
  "guaranteed reimbursement",
  "guaranteed revenue",
  "guaranteed valuation",
  "replaces doctors",
  "EHR writeback enabled",
  "payer submission enabled",
  "customer go-live approved",
  "final imaging interpretation enabled",
  "production connector approved"
];

for (const path of [
  "app/lib/enterpriseHealthcareInfrastructure.ts",
  "app/api/enterprise-healthcare-infrastructure/route.ts",
  "app/api/enterprise-healthcare-infrastructure/brief/route.ts",
  "app/enterprise-healthcare-infrastructure/page.tsx",
  "docs/enterprise-healthcare-infrastructure.md"
]) {
  const lower = files[path].toLowerCase();

  for (const claim of forbiddenClaims) {
    if (lower.includes(claim.toLowerCase())) {
      throw new Error(`${path} contains forbidden Enterprise Healthcare Infrastructure claim: ${claim}`);
    }
  }
}

requireIncludes("package.json", files["package.json"], "\"smoke:enterprise-healthcare-infrastructure\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/enterprise-healthcare-infrastructure-contract-check.mjs"
);
requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], "/enterprise-healthcare-infrastructure");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "/enterprise-healthcare-infrastructure");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "expectedApiRoutePatternCount = 452");
requireIncludes(
  "scripts/public-production-smoke.mjs",
  files["scripts/public-production-smoke.mjs"],
  "/enterprise-healthcare-infrastructure"
);

console.log("pass Enterprise Healthcare Infrastructure contract check");
