export type ClinicalDataFabricSourceKind =
  | "fhir"
  | "hl7-v2"
  | "dicom"
  | "x12"
  | "csv"
  | "json"
  | "fhir-bundle"
  | "ccd-ccda"
  | "laboratory-interface"
  | "pharmacy-feed"
  | "scheduling"
  | "patient-portal"
  | "wearable"
  | "medical-device"
  | "claims"
  | "clinical-note"
  | "voice"
  | "image"
  | "pathology"
  | "genomics";

export type CanonicalClinicalEntity =
  | "patient"
  | "provider"
  | "organization"
  | "facility"
  | "medication"
  | "condition"
  | "encounter"
  | "claim"
  | "image"
  | "lab-result"
  | "procedure"
  | "device"
  | "care-plan"
  | "social-determinant"
  | "genomic-finding"
  | "research-study"
  | "observation"
  | "document"
  | "coverage"
  | "appointment"
  | "consent"
  | "audit-event";

export type HealthGraphEdgeKind =
  | "treated_by"
  | "diagnosed_with"
  | "prescribed"
  | "performed_at"
  | "associated_with"
  | "contraindicated"
  | "member_of"
  | "derived_from"
  | "supports"
  | "references";

export type ClinicalDataFabricSourceContract = {
  id: string;
  kind: ClinicalDataFabricSourceKind;
  name: string;
  standards: string[];
  canonicalEntities: CanonicalClinicalEntity[];
  requiredProfileEvidence: string[];
  normalizationSteps: string[];
  provenanceRequirements: string[];
  governanceControls: string[];
  agentAccessPolicy: string;
  blockedActions: string[];
  activationRequirements: string[];
};

export type ClinicalSemanticMapping = {
  entity: CanonicalClinicalEntity;
  primaryStandards: string[];
  terminologySystems: string[];
  identityKeys: string[];
  requiredProvenance: string[];
  confidenceInputs: string[];
  blockedAutonomy: string[];
};

export type HealthGraphNodeContract = {
  entity: CanonicalClinicalEntity;
  nodeLabel: string;
  requiredProvenanceFields: string[];
  requiredGovernanceTags: string[];
  permittedDerivedUses: string[];
  blockedUses: string[];
};

export type HealthGraphEdgeContract = {
  edge: HealthGraphEdgeKind;
  allowedFrom: CanonicalClinicalEntity[];
  allowedTo: CanonicalClinicalEntity[];
  requiredEvidence: string[];
  reviewerGate: string;
  blockedUses: string[];
};

export type ClinicalDataFabricWorkflowEvent = {
  id: string;
  name: string;
  trigger: string;
  eventPayloadPolicy: string[];
  downstreamAgents: string[];
  requiredReview: string;
  blockedAutomation: string[];
};

export type ClinicalDataFabricValidationCheck = {
  id: string;
  passed: boolean;
  detail: string;
};

export type ClinicalDataFabricSummary = {
  service: "scrimed-clinical-data-fabric";
  status: typeof clinicalDataFabricStatus;
  route: typeof clinicalDataFabricRoute;
  apiRoute: typeof clinicalDataFabricApiRoute;
  briefRoute: typeof clinicalDataFabricBriefRoute;
  updated: "2026-07-03";
  dataBoundary: "no-live-phi-control-plane";
  connectorAuthority: "not-production-connector-approved";
  clinicalCareAuthority: "not-authorized-live-care";
  agentDataAuthority: "semantic-layer-only-no-raw-schema-access";
  liveIngestionAuthority: "blocked-pending-customer-authorization";
  sourceContractCount: number;
  canonicalEntityCount: number;
  semanticMappingCount: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  workflowEventCount: number;
  requiredGovernanceControls: string[];
  sourceContracts: ClinicalDataFabricSourceContract[];
  semanticMappings: ClinicalSemanticMapping[];
  healthGraphNodeContracts: HealthGraphNodeContract[];
  healthGraphEdgeContracts: HealthGraphEdgeContract[];
  workflowEvents: ClinicalDataFabricWorkflowEvent[];
  validation: {
    status: "passed" | "failed";
    checks: ClinicalDataFabricValidationCheck[];
  };
  blockedClaims: string[];
  boundary: typeof clinicalDataFabricBoundary;
};

export const clinicalDataFabricStatus =
  "clinical-data-fabric-control-plane-ready-no-phi";
export const clinicalDataFabricRoute = "/healthcare-intelligence-os#clinical-data-fabric";
export const clinicalDataFabricApiRoute = "/api/clinical-data-fabric";
export const clinicalDataFabricBriefRoute = "/api/clinical-data-fabric/brief";

export const clinicalDataFabricBoundary =
  "SCRIMED Clinical Data Fabric is a no-live-PHI control plane for source contracts, semantic normalization, provenance, governance, and health-graph projection rules. It does not ingest live records, store PHI, expose raw schemas to agents, activate production connectors, submit payer transactions, mutate EHRs, interpret imaging, prescribe, diagnose, treat, contact patients, or approve customer go-live.";

const noRawAgentAccess =
  "Agents may request semantic concepts through governed tools only; no agent receives raw database schema, raw connector payloads, credentials, or unrestricted source queries.";

const requiredGovernanceControls = [
  "tenant-scoped identity",
  "RBAC and ABAC",
  "purpose-of-use check",
  "consent policy check",
  "PHI classification",
  "minimum necessary field policy",
  "terminology-version capture",
  "profile/version capture",
  "provenance and lineage capture",
  "immutable audit event",
  "human review for clinical or payer-impacting output",
  "production connector approval gate",
  "retention and deletion policy",
  "data residency policy",
  "incident response routing"
];

const blockedClaims = [
  "live PHI ingestion enabled",
  "production connector approved",
  "EHR writeback authorized",
  "payer submission authorized",
  "patient outreach authorized",
  "autonomous diagnosis authorized",
  "autonomous treatment authorized",
  "autonomous prescribing authorized",
  "imaging interpretation authorized",
  "clinical validation completed",
  "HIPAA/SOC/certification completed",
  "customer go-live approved"
];

const sourceContracts: ClinicalDataFabricSourceContract[] = [
  {
    id: "fhir-r4-us-core",
    kind: "fhir",
    name: "FHIR R4 / US Core resource exchange",
    standards: ["FHIR R4", "US Core", "USCDI", "SMART on FHIR", "FHIR AuditEvent", "FHIR Provenance"],
    canonicalEntities: [
      "patient",
      "provider",
      "organization",
      "encounter",
      "condition",
      "observation",
      "lab-result",
      "medication",
      "procedure",
      "care-plan",
      "coverage",
      "consent",
      "audit-event"
    ],
    requiredProfileEvidence: [
      "CapabilityStatement reviewed",
      "profile URLs and versions captured",
      "SMART scopes approved",
      "tenant consent and purpose-of-use policy approved"
    ],
    normalizationSteps: [
      "validate resource type and profile",
      "extract identifiers into identity resolution queue",
      "bind coded fields to terminology registry",
      "create provenance envelope",
      "project approved semantic concepts to health graph"
    ],
    provenanceRequirements: ["source system", "resource type", "profile URL", "version", "lastUpdated", "tenant", "purpose of use"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["FHIR writeback", "bulk export", "unscoped read", "patient merge", "clinical decision finalization"],
    activationRequirements: ["BAA/DPA", "customer sandbox", "SMART scope approval", "FHIR profile acceptance", "audit retention approval"]
  },
  {
    id: "hl7-v2-interfaces",
    kind: "hl7-v2",
    name: "HL7 v2 ADT/order/result interfaces",
    standards: ["HL7 v2 ADT", "HL7 v2 ORM/OML", "HL7 v2 ORU", "interface-engine profile", "IHE ATNA"],
    canonicalEntities: ["patient", "encounter", "provider", "facility", "lab-result", "procedure", "observation"],
    requiredProfileEvidence: [
      "message type allowlist",
      "segment map approved",
      "interface acknowledgement policy approved",
      "source facility routing approved"
    ],
    normalizationSteps: [
      "parse message type and trigger event",
      "validate segment presence",
      "normalize identifiers into identity queue",
      "map OBX/ORC/OBR concepts to canonical observations",
      "attach source message provenance without exposing raw message to agents"
    ],
    provenanceRequirements: ["sending application", "sending facility", "message type", "trigger event", "message control id", "received timestamp"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["message acknowledgement automation", "order placement", "result filing", "patient merge", "care-team notification"],
    activationRequirements: ["interface specification", "VPN or private connectivity approval", "message profile acceptance", "downtime runbook"]
  },
  {
    id: "dicom-dicomweb-metadata",
    kind: "dicom",
    name: "DICOM/DICOMweb imaging metadata",
    standards: ["DICOM", "DICOMweb", "FHIR ImagingStudy", "IHE RAD", "IHE ATNA"],
    canonicalEntities: ["patient", "encounter", "image", "procedure", "provider", "facility", "document"],
    requiredProfileEvidence: [
      "DICOM conformance statement reviewed",
      "pixel-data handling policy approved",
      "accession/study mapping approved",
      "radiology review workflow approved"
    ],
    normalizationSteps: [
      "separate metadata from pixel data",
      "minimize DICOM tags",
      "map study/series identifiers to ImagingStudy concepts",
      "attach radiology report references when permitted",
      "route imaging AI outputs to specialist review only"
    ],
    provenanceRequirements: ["study UID", "series UID policy", "accession policy", "modality", "facility", "report reference"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["pixel ingestion", "diagnostic interpretation", "radiology report signing", "PACS mutation", "patient notification"],
    activationRequirements: ["DICOM conformance review", "radiology governance", "image retention policy", "specialist review queue"]
  },
  {
    id: "x12-claims-utilization",
    kind: "x12",
    name: "X12 eligibility, prior authorization, claims, and remittance context",
    standards: ["X12 270/271", "X12 278", "X12 837", "X12 835", "FHIR Claim", "FHIR Coverage"],
    canonicalEntities: ["patient", "coverage", "claim", "procedure", "condition", "provider", "organization"],
    requiredProfileEvidence: [
      "trading-partner companion guide reviewed",
      "transaction set allowlist approved",
      "payer submission authority approved",
      "financial/legal review completed before external use"
    ],
    normalizationSteps: [
      "validate transaction type",
      "normalize payer/member/provider identifiers under minimum necessary policy",
      "map diagnosis/procedure codes through approved terminology registry",
      "create payer-workflow semantic context",
      "route submission-like actions to human approval"
    ],
    provenanceRequirements: ["trading partner", "transaction set", "companion guide", "control number policy", "payer", "purpose of use"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["claim submission", "prior authorization submission", "eligibility transaction execution", "appeal filing", "payment posting"],
    activationRequirements: ["trading-partner agreement", "payer workflow approval", "legal review", "financial controls", "audit reconciliation"]
  },
  {
    id: "clinical-documents-notes",
    kind: "ccd-ccda",
    name: "Clinical documents, notes, and C-CDA/CCD packages",
    standards: ["C-CDA", "CCD", "FHIR DocumentReference", "LOINC document codes", "SNOMED CT"],
    canonicalEntities: ["document", "patient", "encounter", "condition", "medication", "procedure", "care-plan", "provider"],
    requiredProfileEvidence: [
      "document class allowlist approved",
      "section parser policy approved",
      "source attribution policy approved",
      "human review workflow approved"
    ],
    normalizationSteps: [
      "preserve document structure",
      "extract section labels and coded concepts",
      "retain page/section/table provenance",
      "route uncertain or conflicting content to review",
      "create semantic summaries only after evidence attribution"
    ],
    provenanceRequirements: ["document id", "document type", "author", "custodian", "section", "timestamp", "source route"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["note signing", "clinical conclusion finalization", "order creation", "patient instruction delivery", "record filing"],
    activationRequirements: ["document governance", "source attribution policy", "clinical reviewer queue", "retention approval"]
  },
  {
    id: "pharmacy-medication-feeds",
    kind: "pharmacy-feed",
    name: "Pharmacy, medication, formulary, and dispensing context",
    standards: ["FHIR MedicationRequest", "FHIR MedicationStatement", "FHIR MedicationDispense", "RxNorm", "NCPDP SCRIPT", "NDC"],
    canonicalEntities: ["patient", "medication", "coverage", "provider", "organization", "claim", "condition"],
    requiredProfileEvidence: [
      "medication source hierarchy approved",
      "RxNorm/NDC mapping policy approved",
      "formulary source authorization approved",
      "pharmacist or clinician review workflow approved"
    ],
    normalizationSteps: [
      "normalize medication identifiers",
      "capture source and dispense/request distinction",
      "map payer/formulary context separately from clinical context",
      "flag conflicts and missing medication status",
      "route recommendations to human review"
    ],
    provenanceRequirements: ["source system", "medication code system", "request/dispense/status field", "payer/formulary source", "timestamp"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["prescribing", "substitution execution", "pharmacy message send", "formulary guarantee", "patient outreach"],
    activationRequirements: ["pharmacy data agreement", "terminology mapping review", "clinical/pharmacy governance", "payer authority review"]
  },
  {
    id: "device-wearable-remote-monitoring",
    kind: "medical-device",
    name: "Medical device, wearable, and remote-monitoring observations",
    standards: ["FHIR Observation", "FHIR Device", "ISO/IEEE 11073", "UCUM", "device-vendor interface specification"],
    canonicalEntities: ["patient", "device", "observation", "lab-result", "encounter", "care-plan"],
    requiredProfileEvidence: [
      "device identity policy approved",
      "unit normalization policy approved",
      "alert threshold governance approved",
      "remote-monitoring consent approved"
    ],
    normalizationSteps: [
      "normalize units through UCUM",
      "capture device identity and calibration policy",
      "separate patient-generated and clinician-validated signals",
      "flag out-of-range values for review",
      "route alerting to approved clinical workflow only"
    ],
    provenanceRequirements: ["device id policy", "manufacturer/source", "measurement time", "unit", "calibration status policy", "data origin"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["clinical alert dispatch", "diagnosis", "treatment change", "patient outreach", "device command"],
    activationRequirements: ["device agreement", "clinical monitoring protocol", "alert escalation approval", "patient consent"]
  },
  {
    id: "genomics-pathology-research",
    kind: "genomics",
    name: "Genomics, pathology, and research evidence context",
    standards: ["FHIR Genomics", "FHIR DiagnosticReport", "FHIR MolecularSequence", "LOINC", "SNOMED CT", "HGVS", "ClinicalTrials.gov-style metadata"],
    canonicalEntities: ["patient", "genomic-finding", "condition", "lab-result", "procedure", "research-study", "document"],
    requiredProfileEvidence: [
      "genomics consent policy approved",
      "variant nomenclature policy approved",
      "pathology source attribution approved",
      "research-use governance approved"
    ],
    normalizationSteps: [
      "capture variant nomenclature and evidence source",
      "separate clinical, research, and operational uses",
      "map pathology report concepts with source attribution",
      "route trial matching and interpretation-like outputs to qualified review",
      "retain research provenance"
    ],
    provenanceRequirements: ["specimen/source", "assay policy", "variant nomenclature", "report id", "evidence source", "research-use approval"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["genetic counseling", "diagnosis", "treatment recommendation", "trial enrollment", "patient outreach"],
    activationRequirements: ["genomics governance", "research consent", "IRB or equivalent workflow where applicable", "qualified reviewer queue"]
  },
  {
    id: "scheduling-portal-engagement",
    kind: "scheduling",
    name: "Scheduling, portal, patient access, and engagement context",
    standards: ["FHIR Appointment", "FHIR Schedule", "FHIR Slot", "FHIR Communication", "FHIR Task", "SMART on FHIR"],
    canonicalEntities: ["patient", "provider", "facility", "appointment", "encounter", "care-plan", "document"],
    requiredProfileEvidence: [
      "scheduling scope approved",
      "communication policy approved",
      "patient consent and preference policy approved",
      "access center workflow approval"
    ],
    normalizationSteps: [
      "normalize appointment and facility concepts",
      "bind patient preferences under consent policy",
      "separate drafts from outreach actions",
      "route scheduling mutations to human approval",
      "retain communication provenance"
    ],
    provenanceRequirements: ["source system", "appointment id policy", "facility", "channel", "communication consent", "timestamp"],
    governanceControls: requiredGovernanceControls,
    agentAccessPolicy: noRawAgentAccess,
    blockedActions: ["appointment booking", "appointment cancellation", "patient message send", "referral closure", "care navigation outreach"],
    activationRequirements: ["patient-communication approval", "scheduling connector approval", "consent workflow", "support escalation runbook"]
  }
];

const semanticMappings: ClinicalSemanticMapping[] = [
  {
    entity: "patient",
    primaryStandards: ["FHIR Patient", "HL7 PID", "X12 subscriber/member loops"],
    terminologySystems: ["local enterprise MPI policy", "FHIR Identifier", "NPI where applicable"],
    identityKeys: ["tenant", "source system", "identifier namespace", "identifier value policy"],
    requiredProvenance: ["source system", "identity namespace", "match confidence", "review state"],
    confidenceInputs: ["identifier agreement", "demographic agreement", "source trust", "recency", "manual merge state"],
    blockedAutonomy: ["patient merge", "identity federation activation", "biometric match finalization"]
  },
  {
    entity: "condition",
    primaryStandards: ["FHIR Condition", "HL7 DG1", "X12 diagnosis loops"],
    terminologySystems: ["SNOMED CT", "ICD-10-CM", "ICD-11 where approved"],
    identityKeys: ["code system", "code", "encounter/source context"],
    requiredProvenance: ["source document/resource", "author/source", "recorded date", "verification status"],
    confidenceInputs: ["terminology match", "source priority", "verification status", "recency", "conflict count"],
    blockedAutonomy: ["diagnosis creation", "diagnosis removal", "risk score use in live care"]
  },
  {
    entity: "lab-result",
    primaryStandards: ["FHIR Observation", "HL7 ORU/OBX"],
    terminologySystems: ["LOINC", "UCUM", "SNOMED CT where applicable"],
    identityKeys: ["test code", "specimen policy", "result timestamp", "source order/result"],
    requiredProvenance: ["performing lab", "result status", "unit", "reference range", "timestamp"],
    confidenceInputs: ["unit validity", "status", "reference range presence", "source system", "temporal consistency"],
    blockedAutonomy: ["result filing", "clinical interpretation finalization", "patient notification"]
  },
  {
    entity: "medication",
    primaryStandards: ["FHIR MedicationRequest", "FHIR MedicationStatement", "NCPDP SCRIPT"],
    terminologySystems: ["RxNorm", "NDC", "SNOMED CT allergies where applicable"],
    identityKeys: ["medication code", "source", "status", "request/dispense distinction"],
    requiredProvenance: ["prescriber/source", "status", "date", "formulary source where applicable"],
    confidenceInputs: ["code mapping", "status clarity", "source priority", "duplicate/conflict state", "recency"],
    blockedAutonomy: ["prescribing", "substitution execution", "medication discontinuation"]
  },
  {
    entity: "image",
    primaryStandards: ["DICOM", "DICOMweb", "FHIR ImagingStudy"],
    terminologySystems: ["DICOM modality tags", "SNOMED CT body site where approved"],
    identityKeys: ["study UID policy", "accession policy", "series UID policy"],
    requiredProvenance: ["modality", "facility", "study metadata", "report reference", "review state"],
    confidenceInputs: ["metadata completeness", "report linkage", "specialist review state", "source conformance"],
    blockedAutonomy: ["diagnostic image interpretation", "PACS mutation", "report signing"]
  },
  {
    entity: "claim",
    primaryStandards: ["X12 837", "X12 835", "FHIR Claim", "FHIR ExplanationOfBenefit"],
    terminologySystems: ["ICD-10-CM", "CPT", "HCPCS", "NPI", "payer companion guide"],
    identityKeys: ["payer", "claim id policy", "member id policy", "provider id policy"],
    requiredProvenance: ["payer/source", "transaction set", "control number policy", "claim status", "timestamp"],
    confidenceInputs: ["companion-guide mapping", "status", "payer source", "code validity", "review state"],
    blockedAutonomy: ["claim submission", "payment posting", "appeal filing", "coverage determination"]
  }
];

const healthGraphNodeContracts: HealthGraphNodeContract[] = [
  "patient",
  "provider",
  "organization",
  "facility",
  "medication",
  "condition",
  "encounter",
  "claim",
  "image",
  "lab-result",
  "procedure",
  "device",
  "care-plan",
  "social-determinant",
  "genomic-finding",
  "research-study",
  "observation",
  "document",
  "coverage",
  "appointment",
  "consent",
  "audit-event"
].map((entity) => ({
  entity: entity as CanonicalClinicalEntity,
  nodeLabel: entity,
  requiredProvenanceFields: ["tenant", "source system", "source artifact", "timestamp", "confidence", "review state"],
  requiredGovernanceTags: ["data class", "purpose of use", "retention policy", "residency policy", "minimum necessary"],
  permittedDerivedUses: ["context retrieval", "evidence attribution", "workflow queueing", "review packet preparation"],
  blockedUses: ["autonomous clinical action", "record mutation", "external submission", "patient outreach", "connector activation"]
}));

const healthGraphEdgeContracts: HealthGraphEdgeContract[] = [
  {
    edge: "treated_by",
    allowedFrom: ["patient", "encounter", "care-plan"],
    allowedTo: ["provider", "organization", "facility"],
    requiredEvidence: ["encounter/provider attribution", "source provenance", "review state"],
    reviewerGate: "human review before external or clinical-use claims",
    blockedUses: ["care-team mutation", "patient communication", "privilege inference"]
  },
  {
    edge: "diagnosed_with",
    allowedFrom: ["patient", "encounter", "document"],
    allowedTo: ["condition"],
    requiredEvidence: ["coded diagnosis source", "verification status", "author/source"],
    reviewerGate: "licensed clinical review before clinical-use language",
    blockedUses: ["diagnosis creation", "diagnosis removal", "treatment recommendation"]
  },
  {
    edge: "prescribed",
    allowedFrom: ["provider", "encounter", "care-plan"],
    allowedTo: ["medication"],
    requiredEvidence: ["medication request source", "status", "prescriber/source"],
    reviewerGate: "clinician/pharmacy review before medication guidance",
    blockedUses: ["prescribing", "substitution execution", "patient medication instruction"]
  },
  {
    edge: "performed_at",
    allowedFrom: ["procedure", "encounter", "image", "lab-result"],
    allowedTo: ["facility", "organization"],
    requiredEvidence: ["facility/source", "timestamp", "procedure or result source"],
    reviewerGate: "operations review before external performance claims",
    blockedUses: ["billing submission", "facility attribution guarantee", "quality reporting finalization"]
  },
  {
    edge: "associated_with",
    allowedFrom: ["claim", "procedure", "condition", "coverage", "appointment"],
    allowedTo: ["patient", "encounter", "provider", "organization"],
    requiredEvidence: ["source transaction/resource", "code mapping", "status", "timestamp"],
    reviewerGate: "payer/RCM review before reimbursement or coverage language",
    blockedUses: ["payer submission", "coverage determination", "appeal filing"]
  },
  {
    edge: "contraindicated",
    allowedFrom: ["medication", "condition", "genomic-finding"],
    allowedTo: ["medication", "procedure"],
    requiredEvidence: ["terminology source", "guideline/source reference", "review state"],
    reviewerGate: "qualified clinician/pharmacist review before clinical use",
    blockedUses: ["therapy change", "prescribing denial", "patient advice"]
  },
  {
    edge: "member_of",
    allowedFrom: ["patient", "provider", "facility"],
    allowedTo: ["organization", "coverage"],
    requiredEvidence: ["membership/source", "effective date policy", "status"],
    reviewerGate: "identity/access review before entitlement claims",
    blockedUses: ["eligibility transaction", "access grant", "identity federation activation"]
  },
  {
    edge: "derived_from",
    allowedFrom: ["observation", "document", "care-plan", "claim", "genomic-finding"],
    allowedTo: ["document", "lab-result", "image", "encounter", "research-study"],
    requiredEvidence: ["source artifact", "transform version", "model/tool version if applicable"],
    reviewerGate: "release steward review before evidence packet use",
    blockedUses: ["source replacement", "unattributed summary", "certification claim"]
  },
  {
    edge: "supports",
    allowedFrom: ["document", "lab-result", "observation", "image", "research-study"],
    allowedTo: ["condition", "care-plan", "claim", "procedure"],
    requiredEvidence: ["citation/source", "confidence", "limitations", "review state"],
    reviewerGate: "human review before recommendation-like output",
    blockedUses: ["clinical decision finalization", "payer submission", "quality measure finalization"]
  },
  {
    edge: "references",
    allowedFrom: ["document", "research-study", "audit-event", "care-plan"],
    allowedTo: ["document", "condition", "procedure", "medication", "research-study"],
    requiredEvidence: ["reference locator", "source authority", "retrieval timestamp"],
    reviewerGate: "source governance review for external claims",
    blockedUses: ["uncited assertion", "guideline overclaim", "publication submission"]
  }
];

const workflowEvents: ClinicalDataFabricWorkflowEvent[] = [
  {
    id: "clinical-context-requested",
    name: "Clinical context requested",
    trigger: "Agent requests patient or workflow context through semantic layer",
    eventPayloadPolicy: ["semantic concept ids only", "purpose-of-use required", "tenant scope required", "trace id required"],
    downstreamAgents: ["Context Agent", "Trust Agent", "Clinical QA Agent"],
    requiredReview: "Human review required before any clinical recommendation-like output is used outside draft context.",
    blockedAutomation: ["raw database query", "unscoped FHIR search", "direct EHR writeback"]
  },
  {
    id: "source-contract-registered",
    name: "Source contract registered",
    trigger: "New source system or standard profile is proposed for onboarding",
    eventPayloadPolicy: ["source kind", "standards", "profile evidence state", "governance owner", "blocked actions"],
    downstreamAgents: ["Compliance Agent", "Interoperability Agent", "Identity Agent"],
    requiredReview: "Interoperability, privacy/security, and customer owner review required before activation.",
    blockedAutomation: ["connector activation", "credential creation", "production data pull"]
  },
  {
    id: "semantic-normalization-completed",
    name: "Semantic normalization completed",
    trigger: "Approved source payload has been transformed into canonical concepts",
    eventPayloadPolicy: ["concept ids", "terminology versions", "provenance hash", "confidence", "review state"],
    downstreamAgents: ["Trust Agent", "Memory Agent", "Workflow Planner"],
    requiredReview: "Review required for low-confidence, conflicting, missing-data, clinical, payer, or patient-facing use.",
    blockedAutomation: ["clinical finalization", "payer submission", "patient outreach"]
  },
  {
    id: "health-graph-projection-requested",
    name: "Health graph projection requested",
    trigger: "Canonical concepts are proposed for graph node or edge projection",
    eventPayloadPolicy: ["node/edge kind", "source evidence", "confidence", "review state", "lineage"],
    downstreamAgents: ["Trust Agent", "Clinical QA Agent", "Population Health Agent"],
    requiredReview: "Human review required for identity merge, contraindication, diagnosis, medication, payer, or quality-report use.",
    blockedAutomation: ["patient merge", "diagnosis mutation", "medication action", "quality submission"]
  }
];

function validateClinicalDataFabric(): ClinicalDataFabricValidationCheck[] {
  const allCanonicalEntities = new Set(sourceContracts.flatMap((source) => source.canonicalEntities));
  const graphEntities = new Set(healthGraphNodeContracts.map((node) => node.entity));
  const allEdgeContractsHaveProvenance = healthGraphEdgeContracts.every(
    (edge) => edge.requiredEvidence.length >= 3 && edge.reviewerGate.length > 0 && edge.blockedUses.length >= 3
  );
  const allSourcesGoverned = sourceContracts.every(
    (source) =>
      source.standards.length > 0 &&
      source.canonicalEntities.length > 0 &&
      source.provenanceRequirements.length >= 5 &&
      source.governanceControls.includes("PHI classification") &&
      source.agentAccessPolicy === noRawAgentAccess &&
      source.blockedActions.length >= 4 &&
      source.activationRequirements.length >= 4
  );
  const allMappingsGoverned = semanticMappings.every(
    (mapping) =>
      mapping.primaryStandards.length > 0 &&
      mapping.terminologySystems.length > 0 &&
      mapping.requiredProvenance.length >= 4 &&
      mapping.confidenceInputs.length >= 4 &&
      mapping.blockedAutonomy.length >= 3
  );
  const allWorkflowEventsGated = workflowEvents.every(
    (event) =>
      event.eventPayloadPolicy.length >= 3 &&
      event.downstreamAgents.length >= 2 &&
      event.requiredReview.toLowerCase().includes("review") &&
      event.blockedAutomation.length >= 3
  );

  return [
    {
      id: "source-contracts-governed",
      passed: allSourcesGoverned,
      detail: "Every source contract must include standards, canonical entities, provenance, PHI classification, blocked actions, and activation evidence."
    },
    {
      id: "semantic-mappings-governed",
      passed: allMappingsGoverned,
      detail: "Semantic mappings must bind standards, terminology, provenance, confidence inputs, and blocked autonomy."
    },
    {
      id: "graph-covers-source-entities",
      passed: Array.from(allCanonicalEntities).every((entity) => graphEntities.has(entity)),
      detail: "Every canonical entity emitted by a source contract must have a health-graph node contract."
    },
    {
      id: "graph-edges-retain-provenance",
      passed: allEdgeContractsHaveProvenance,
      detail: "Every health-graph edge contract must require evidence, reviewer gates, and blocked-use boundaries."
    },
    {
      id: "workflow-events-human-gated",
      passed: allWorkflowEventsGated,
      detail: "Workflow events must carry scoped payload policies, downstream ownership, review gates, and blocked automation."
    }
  ];
}

export function getClinicalDataFabricSummary(): ClinicalDataFabricSummary {
  const validationChecks = validateClinicalDataFabric();

  return {
    service: "scrimed-clinical-data-fabric",
    status: clinicalDataFabricStatus,
    route: clinicalDataFabricRoute,
    apiRoute: clinicalDataFabricApiRoute,
    briefRoute: clinicalDataFabricBriefRoute,
    updated: "2026-07-03",
    dataBoundary: "no-live-phi-control-plane",
    connectorAuthority: "not-production-connector-approved",
    clinicalCareAuthority: "not-authorized-live-care",
    agentDataAuthority: "semantic-layer-only-no-raw-schema-access",
    liveIngestionAuthority: "blocked-pending-customer-authorization",
    sourceContractCount: sourceContracts.length,
    canonicalEntityCount: healthGraphNodeContracts.length,
    semanticMappingCount: semanticMappings.length,
    graphNodeCount: healthGraphNodeContracts.length,
    graphEdgeCount: healthGraphEdgeContracts.length,
    workflowEventCount: workflowEvents.length,
    requiredGovernanceControls,
    sourceContracts,
    semanticMappings,
    healthGraphNodeContracts,
    healthGraphEdgeContracts,
    workflowEvents,
    validation: {
      status: validationChecks.every((check) => check.passed) ? "passed" : "failed",
      checks: validationChecks
    },
    blockedClaims,
    boundary: clinicalDataFabricBoundary
  };
}

export function buildClinicalDataFabricBrief() {
  const summary = getClinicalDataFabricSummary();

  return [
    "# SCRIMED Clinical Data Fabric",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Data boundary: ${summary.dataBoundary}`,
    `Connector authority: ${summary.connectorAuthority}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `Agent data authority: ${summary.agentDataAuthority}`,
    `Live ingestion authority: ${summary.liveIngestionAuthority}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Source Contracts",
    ...summary.sourceContracts.map(
      (source) =>
        `- ${source.id} (${source.kind}): ${source.standards.join(", ")} -> ${source.canonicalEntities.join(", ")}. Blocked: ${source.blockedActions.join(", ")}`
    ),
    "",
    "## Semantic Mappings",
    ...summary.semanticMappings.map(
      (mapping) =>
        `- ${mapping.entity}: ${mapping.primaryStandards.join(", ")}; terminology ${mapping.terminologySystems.join(", ")}; blocked ${mapping.blockedAutonomy.join(", ")}`
    ),
    "",
    "## Health Graph",
    `- Nodes: ${summary.graphNodeCount}`,
    `- Edges: ${summary.graphEdgeCount}`,
    ...summary.healthGraphEdgeContracts.map(
      (edge) =>
        `- ${edge.edge}: from ${edge.allowedFrom.join(", ")} to ${edge.allowedTo.join(", ")}; reviewer gate ${edge.reviewerGate}`
    ),
    "",
    "## Workflow Events",
    ...summary.workflowEvents.map(
      (event) =>
        `- ${event.id}: ${event.trigger}; agents ${event.downstreamAgents.join(", ")}; blocked ${event.blockedAutomation.join(", ")}`
    ),
    "",
    "## Governance Controls",
    ...summary.requiredGovernanceControls.map((control) => `- ${control}`),
    "",
    "## Validation",
    ...summary.validation.checks.map((check) => `- ${check.id}: ${check.passed ? "pass" : "fail"} - ${check.detail}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
