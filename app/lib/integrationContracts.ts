export type IntegrationContract = {
  name: string;
  route: string;
  status: "planned" | "contract-defined";
  sourceType: "clinical" | "operational" | "financial" | "synthetic";
  purpose: string;
  standardIds: string[];
  conformanceTargets: string[];
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
    standardIds: ["hl7-fhir", "smart-app-launch", "clinical-terminology"],
    conformanceTargets: ["deployment-approved FHIR R4/R4B profile", "CapabilityStatement", "US Core and USCDI alignment where applicable", "SMART scopes for approved applications"],
    requiredSignals: ["patient", "encounter", "observation", "condition", "medication", "carePlan"],
    safeguards: ["minimum necessary fields", "audit trail", "source system traceability", "no silent mutation"]
  },
  {
    name: "HL7 Event Feed",
    route: "/contracts/hl7-event-feed",
    status: "planned",
    sourceType: "clinical",
    purpose: "Capture admission, discharge, transfer, order, and result events for workflow orchestration.",
    standardIds: ["hl7-v2", "clinical-terminology"],
    conformanceTargets: ["source-system message profile", "deployment-approved HL7 v2 version", "ACK/NACK behavior", "dead-letter and replay test"],
    requiredSignals: ["eventType", "patientReference", "timestamp", "facility", "orderingContext"],
    safeguards: ["message validation", "dead-letter handling", "event replay policy", "timestamp preservation"]
  },
  {
    name: "DICOM Imaging Exchange",
    route: "/contracts/dicom-imaging-exchange",
    status: "planned",
    sourceType: "clinical",
    purpose: "Exchange imaging study metadata and approved image objects for reviewable healthcare workflows without autonomous diagnostic interpretation.",
    standardIds: ["dicom-dicomweb", "ihe-profiles"],
    conformanceTargets: ["DICOM Part 2 conformance statement", "QIDO-RS, WADO-RS, and STOW-RS scope selection", "transfer syntax validation", "de-identification validation"],
    requiredSignals: ["study", "series", "instance", "patientReference", "modality", "accession", "acquisitionTimestamp", "sourceEndpoint"],
    safeguards: ["DICOM conformance statement", "de-identification profile", "transfer syntax validation", "metadata and pixel separation", "no diagnostic interpretation", "human review"]
  },
  {
    name: "Claims and Utilization Dataset",
    route: "/contracts/claims-utilization-dataset",
    status: "planned",
    sourceType: "financial",
    purpose: "Support cost, utilization, payer analytics, and population health intelligence workflows.",
    standardIds: ["x12", "clinical-terminology"],
    conformanceTargets: ["payer-approved X12 transaction version", "licensed implementation guide", "trading-partner agreement", "synthetic acknowledgement validation"],
    requiredSignals: ["member", "claim", "diagnosis", "procedure", "payer", "allowedAmount"],
    safeguards: ["de-identification option", "lineage metadata", "schema versioning", "access partitioning"]
  },
  {
    name: "Pricing Transparency Dataset",
    route: "/contracts/pricing-transparency-dataset",
    status: "planned",
    sourceType: "financial",
    purpose: "Model price, site-of-care, and payer variation for care pathway and transparency use cases.",
    standardIds: ["clinical-terminology"],
    conformanceTargets: ["source-specific schema version", "service-code terminology mapping", "effective-date validation", "source retention"],
    requiredSignals: ["payer", "facility", "serviceCode", "cashPrice", "negotiatedRate", "effectiveDate"],
    safeguards: ["effective-date tracking", "source URL retention", "rate normalization", "staleness detection"]
  },
  {
    name: "Synthetic Clinical Test Environment",
    route: "/contracts/synthetic-clinical-test-environment",
    status: "contract-defined",
    sourceType: "synthetic",
    purpose: "Exercise workflows, APIs, and monitoring without exposing live patient data.",
    standardIds: [],
    conformanceTargets: ["deterministic fixture schema", "synthetic-only assertion", "expected-output fingerprint", "human promotion review"],
    requiredSignals: ["syntheticPatient", "scenario", "expectedOutcome", "riskMarker", "workflowTrace"],
    safeguards: ["synthetic-only labeling", "no production identifiers", "deterministic fixtures", "test data segregation"]
  }
];

export function getContractSlug(contract: IntegrationContract) {
  return contract.route.split("/").filter(Boolean).at(-1) ?? "";
}

export function getIntegrationContractBySlug(slug: string) {
  return integrationContracts.find((contract) => getContractSlug(contract) === slug);
}

export function getIntegrationContractSummary() {
  const defined = integrationContracts.filter((contract) => contract.status === "contract-defined").length;

  return {
    service: "scrimed-integration-contracts",
    status: "foundation-defined",
    contractCount: integrationContracts.length,
    defined,
    planned: integrationContracts.length - defined,
    contracts: integrationContracts,
    updated: "2026-06-09"
  };
}
