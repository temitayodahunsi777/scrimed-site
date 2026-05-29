export type IntegrationContract = {
  name: string;
  route: string;
  status: "planned" | "contract-defined";
  sourceType: "clinical" | "operational" | "financial" | "synthetic";
  purpose: string;
  requiredSignals: string[];
  safeguards: string[];
};

export const integrationContracts: IntegrationContract[] = [
  {
    name: "FHIR Clinical Record Intake",
    route: "/contracts/fhir-clinical-record-intake",
    status: "contract-defined",
    sourceType: "clinical",
    purpose: "Normalize patient, encounter, observation, condition, medication, and care plan signals for SCRIMED workflows.",
    requiredSignals: ["patient", "encounter", "observation", "condition", "medication", "carePlan"],
    safeguards: ["minimum necessary fields", "audit trail", "source system traceability", "no silent mutation"]
  },
  {
    name: "HL7 Event Feed",
    route: "/contracts/hl7-event-feed",
    status: "planned",
    sourceType: "clinical",
    purpose: "Capture admission, discharge, transfer, order, and result events for workflow orchestration.",
    requiredSignals: ["eventType", "patientReference", "timestamp", "facility", "orderingContext"],
    safeguards: ["message validation", "dead-letter handling", "event replay policy", "timestamp preservation"]
  },
  {
    name: "Claims and Utilization Dataset",
    route: "/contracts/claims-utilization-dataset",
    status: "planned",
    sourceType: "financial",
    purpose: "Support cost, utilization, payer analytics, and population health intelligence workflows.",
    requiredSignals: ["member", "claim", "diagnosis", "procedure", "payer", "allowedAmount"],
    safeguards: ["de-identification option", "lineage metadata", "schema versioning", "access partitioning"]
  },
  {
    name: "Pricing Transparency Dataset",
    route: "/contracts/pricing-transparency-dataset",
    status: "planned",
    sourceType: "financial",
    purpose: "Model price, site-of-care, and payer variation for care pathway and transparency use cases.",
    requiredSignals: ["payer", "facility", "serviceCode", "cashPrice", "negotiatedRate", "effectiveDate"],
    safeguards: ["effective-date tracking", "source URL retention", "rate normalization", "staleness detection"]
  },
  {
    name: "Synthetic Clinical Test Environment",
    route: "/contracts/synthetic-clinical-test-environment",
    status: "contract-defined",
    sourceType: "synthetic",
    purpose: "Exercise workflows, APIs, and monitoring without exposing live patient data.",
    requiredSignals: ["syntheticPatient", "scenario", "expectedOutcome", "riskMarker", "workflowTrace"],
    safeguards: ["synthetic-only labeling", "no production identifiers", "deterministic fixtures", "test data segregation"]
  }
];

export function getIntegrationContractSummary() {
  const defined = integrationContracts.filter((contract) => contract.status === "contract-defined").length;

  return {
    service: "scrimed-integration-contracts",
    status: "foundation-defined",
    contractCount: integrationContracts.length,
    defined,
    planned: integrationContracts.length - defined,
    contracts: integrationContracts,
    updated: "2026-05-28"
  };
}
