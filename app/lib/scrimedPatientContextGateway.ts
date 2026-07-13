import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedPatientContextGatewayScenario = {
  scenarioId: string;
  dataBoundary: "synthetic-demo-only";
  patientStoryContinuityModel: string;
  sourceProvenanceRequired: boolean;
  hieInteroperabilityConcept: string;
  fhirReadyAbstraction: string[];
  consentRequired: boolean;
  continuityScenario: string;
  ehrWritebackEnabled: false;
  auditHash: string;
};

export const scrimedPatientContextGatewayApiRoute = "/api/scrimed-patient-context-gateway";
export const scrimedPatientContextGatewayBriefRoute = "/api/scrimed-patient-context-gateway/brief";
export const scrimedPatientContextGatewayStatus = "scrimed-patient-context-gateway-active-synthetic-no-phi";
export const scrimedPatientContextGatewayBoundary =
  "SCRIMED Patient Context Gateway uses no-PHI demo data only. It models patient story continuity, provenance, consent, HIE/FHIR abstractions, and complex-care review without EHR writeback, live patient data, diagnosis, treatment, prescribing, or patient outreach.";

export const scrimedPatientContextScenario: ScrimedPatientContextGatewayScenario = {
  scenarioId: "synthetic-elderly-complex-care-continuity-001",
  dataBoundary: "synthetic-demo-only",
  patientStoryContinuityModel:
    "Longitudinal synthetic story made of encounters, medications, social factors, care gaps, referrals, and reviewer notes.",
  sourceProvenanceRequired: true,
  hieInteroperabilityConcept:
    "Future HIE connector inputs must be consent-gated, normalized, provenance-tagged, and blocked from raw schema exposure.",
  fhirReadyAbstraction: ["Patient", "Encounter", "Condition", "MedicationStatement", "Observation", "CarePlan"],
  consentRequired: true,
  continuityScenario:
    "Elderly complex-care continuity scenario with medication reconciliation, referral follow-up, transportation barrier, and caregiver handoff metadata.",
  ehrWritebackEnabled: false,
  auditHash: ""
};

scrimedPatientContextScenario.auditHash = generateScrimedAuditHash({
  scenarioId: scrimedPatientContextScenario.scenarioId,
  dataBoundary: scrimedPatientContextScenario.dataBoundary,
  fhirReadyAbstraction: scrimedPatientContextScenario.fhirReadyAbstraction,
  safetyPolicyVersion: scrimedSafetyPolicyVersion
});

export function getScrimedPatientContextGatewaySummary() {
  return {
    service: "scrimed-patient-context-gateway",
    status: scrimedPatientContextGatewayStatus,
    apiRoute: scrimedPatientContextGatewayApiRoute,
    briefRoute: scrimedPatientContextGatewayBriefRoute,
    boundary: scrimedPatientContextGatewayBoundary,
    scenario: scrimedPatientContextScenario,
    requiredControls: [
      "no PHI demo data only",
      "patient story continuity model",
      "source provenance required",
      "HIE interoperability concept",
      "FHIR-ready abstraction",
      "consent-required flag",
      "elderly/complex-care continuity scenario",
      "no EHR writeback"
    ],
    productionReadiness: false,
    noPhiConfirmed: true
  };
}

export function buildScrimedPatientContextGatewayBrief() {
  const summary = getScrimedPatientContextGatewaySummary();

  return [
    "# SCRIMED Patient Context Gateway",
    "",
    summary.boundary,
    "",
    "## Required Controls",
    ...summary.requiredControls.map((control) => `- ${control}`),
    "",
    "## Synthetic Scenario",
    `- Scenario: ${summary.scenario.scenarioId}`,
    `- Consent required: ${summary.scenario.consentRequired}`,
    `- EHR writeback enabled: ${summary.scenario.ehrWritebackEnabled}`,
    `- FHIR abstraction: ${summary.scenario.fhirReadyAbstraction.join(", ")}`,
    `- Audit hash: ${summary.scenario.auditHash}`,
    "",
    "This gateway is continuity infrastructure only and does not authorize live PHI, EHR writeback, diagnosis, treatment, prescribing, or outreach."
  ].join("\n");
}
