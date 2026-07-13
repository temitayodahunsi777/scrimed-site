export type HealthRecordSourceFormat =
  | "fhir-bundle"
  | "hl7-v2-message"
  | "c-cda-document"
  | "dicom-metadata"
  | "x12-prior-auth"
  | "csv-export"
  | "unstructured-note";

export type HealthRecordCapabilityStatus =
  | "synthetic-ready"
  | "metadata-only"
  | "customer-sandbox-required"
  | "external-review-required"
  | "blocked-before-live";

export type HealthRecordCapability = {
  slug: string;
  name: string;
  status: HealthRecordCapabilityStatus;
  sourceFormats: HealthRecordSourceFormat[];
  standardBindings: string[];
  extractionTargets: string[];
  patientSafetyControls: string[];
  workarounds: string[];
  blockedActions: string[];
  proofRoutes: string[];
};

export type HealthRecordExtractionStage = {
  stage: string;
  owner: string;
  inputBoundary: string;
  output: string;
  safetyGate: string;
};

export type HealthRecordSafetyCheck = {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium";
  trigger: string;
  mitigation: string;
  workaround: string;
};

export type HealthRecordBoundaryResolution = {
  boundary: string;
  riskIfIgnored: string;
  currentControl: string;
  safeWorkaround: string;
  remainingGate: string;
  owner: string;
  proofRoutes: string[];
};

export type HealthRecordSourceReference = {
  name: string;
  url: string;
  checkedAt: string;
  implication: string;
};

export type HealthRecordExtractionRequest = {
  syntheticOnly: boolean;
  sourceFormat: HealthRecordSourceFormat;
  declaredStandard?: string;
  recordKinds: string[];
  containsPhi?: boolean;
  includesPatientIdentifiers?: boolean;
  intendedUse?: string;
  requestedAction?: string;
  sampleSize?: number;
};

export type HealthRecordExtractionEvaluation = {
  accepted: boolean;
  status: "synthetic-extraction-plan-ready" | "blocked";
  reasons: string[];
  extractionPlan: string[];
  safetyChecks: string[];
  workarounds: string[];
  retainedGates: string[];
};

export const healthRecordsSafetyExchangeRoute = "/health-records";
export const healthRecordsSafetyExchangeApiRoute = "/api/health-records";
export const healthRecordsSafetyExchangeBriefRoute = "/api/health-records/brief";
export const healthRecordsSafetyExchangeExtractRoute = "/api/health-records/extract";

export const healthRecordsSafetyExchangeStatus =
  "health-records-safety-exchange-control-plane-active";
export const healthRecordsSafetyExchangeBriefStatus =
  "health-records-safety-exchange-brief-ready";
export const healthRecordsSafetyExchangeExtractionStatus =
  "synthetic-health-record-extraction-evaluator-active";
export const healthRecordsSafetyExchangeUpdatedAt = "2026-06-25";

export const healthRecordsSafetyExchangeBoundary =
  "SCRIMED Health Records Safety Exchange defines no-PHI health-record ingestion, extraction, normalization, interoperability, and patient-safety controls for synthetic and customer-approved sandbox evaluation. It does not authorize live PHI ingestion, production EHR access, patient matching, diagnosis, treatment, emergency triage, order entry, prescribing, payer submission, patient outreach, autonomous clinical decisions, record mutation, or production connector execution.";

export const healthRecordSourceReferences: HealthRecordSourceReference[] = [
  {
    name: "HL7 FHIR R4 and FHIR release directory",
    url: "https://www.hl7.org/fhir/R4/",
    checkedAt: healthRecordsSafetyExchangeUpdatedAt,
    implication:
      "FHIR is the primary resource model for synthetic record extraction, CapabilityStatement review, AuditEvent, Provenance, and deployment-specific profile validation."
  },
  {
    name: "ONC TEFCA",
    url: "https://healthit.gov/policy/tefca/",
    checkedAt: healthRecordsSafetyExchangeUpdatedAt,
    implication:
      "Nationwide exchange requires purpose-of-use, participant/QHIN path, privacy/security controls, and exchange governance before real patient data flows."
  },
  {
    name: "ONC USCDI",
    url: "https://www.healthit.gov/isa/united-states-core-data-interoperability-uscdi",
    checkedAt: healthRecordsSafetyExchangeUpdatedAt,
    implication:
      "Record extraction targets must map to standardized data classes before SCRIMED represents health-record interoperability coverage."
  },
  {
    name: "CMS Interoperability and Prior Authorization Final Rule CMS-0057-F",
    url: "https://www.cms.gov/initiatives/burden-reduction/overview/interoperability/policies-regulations/cms-interoperability-prior-authorization-final-rule-cms-0057-f",
    checkedAt: healthRecordsSafetyExchangeUpdatedAt,
    implication:
      "Payer/provider/prior-authorization workflows need API timing, payer policy, transaction governance, and no-guarantee reimbursement controls."
  },
  {
    name: "DICOM current standard",
    url: "https://www.dicomstandard.org/current",
    checkedAt: healthRecordsSafetyExchangeUpdatedAt,
    implication:
      "Imaging metadata can be prepared for routing and provenance, but diagnostic interpretation and pixel-data workflows remain separately gated."
  }
];

export const healthRecordCapabilities: HealthRecordCapability[] = [
  {
    slug: "fhir-record-ingestion",
    name: "FHIR health-record intake and normalization",
    status: "synthetic-ready",
    sourceFormats: ["fhir-bundle"],
    standardBindings: ["FHIR R4/R4B", "US Core", "USCDI", "SMART App Launch"],
    extractionTargets: [
      "Patient metadata placeholders",
      "Encounter timeline",
      "Observation, lab, and vital signals",
      "Condition and problem context",
      "MedicationRequest and MedicationStatement context",
      "AllergyIntolerance and CarePlan references"
    ],
    patientSafetyControls: [
      "synthetic-only assertion",
      "patient-context authorization gate",
      "Provenance and AuditEvent mapping",
      "terminology validation",
      "no silent mutation"
    ],
    workarounds: [
      "Use synthetic FHIR bundles and CapabilityStatement review before customer sandbox access.",
      "Generate a mapping ledger instead of storing live patient records.",
      "Keep EHR writeback disabled and export only reviewer packets."
    ],
    blockedActions: ["live FHIR read", "EHR writeback", "patient matching", "clinical decision automation"],
    proofRoutes: ["/interoperability", "/interoperability/evaluations", "/integrations/fixture-validation"]
  },
  {
    slug: "hl7-v2-extraction",
    name: "HL7 v2 event and results extraction",
    status: "customer-sandbox-required",
    sourceFormats: ["hl7-v2-message"],
    standardBindings: ["HL7 v2 ADT", "HL7 v2 ORM/OML", "HL7 v2 ORU", "deployment-specific interface profiles"],
    extractionTargets: [
      "Admission/discharge/transfer events",
      "Order and result identifiers",
      "Observation status",
      "Source-system timestamps",
      "Interface-engine acknowledgement behavior"
    ],
    patientSafetyControls: [
      "ACK/NACK reconciliation",
      "dead-letter queue",
      "source timestamp preservation",
      "duplicate event detection",
      "human workflow review"
    ],
    workarounds: [
      "Request de-identified or synthetic HL7 v2 samples from the buyer interface team.",
      "Validate segment maps against a sandbox interface engine before production feed access.",
      "Route unmatched segments to a mapping-review queue instead of guessing."
    ],
    blockedActions: ["production ADT feed", "result posting", "order mutation", "unreviewed segment inference"],
    proofRoutes: ["/interoperability", "/integrations", "/health-records"]
  },
  {
    slug: "clinical-document-extraction",
    name: "C-CDA and document intelligence extraction",
    status: "metadata-only",
    sourceFormats: ["c-cda-document", "unstructured-note", "csv-export"],
    standardBindings: ["C-CDA", "FHIR DocumentReference", "LOINC", "SNOMED CT", "Atlas evidence layer"],
    extractionTargets: [
      "Document type and section map",
      "Problem/medication/allergy section placeholders",
      "Missing-section signals",
      "Evidence attribution and document provenance",
      "Reviewer-ready summary outline"
    ],
    patientSafetyControls: [
      "source attribution required",
      "stale fact detection",
      "free-text PHI blocker",
      "clinical summary draft-only status",
      "reviewer signoff required"
    ],
    workarounds: [
      "Keep public demos on synthetic documents and redact all identifiers.",
      "Use metadata-only external artifact references for buyer evidence rooms.",
      "Create document-section maps without retaining source documents until the customer data path is approved."
    ],
    blockedActions: ["live note ingestion", "patient-specific summary release", "diagnosis extraction claim", "unreviewed document upload"],
    proofRoutes: ["/atlas", "/pilot-workspace/access#authority-artifact-references", "/health-records"]
  },
  {
    slug: "imaging-record-routing",
    name: "Imaging record and DICOM metadata routing",
    status: "metadata-only",
    sourceFormats: ["dicom-metadata"],
    standardBindings: ["DICOM", "DICOMweb", "FHIR ImagingStudy", "IHE ATNA"],
    extractionTargets: [
      "Study and series metadata",
      "Modality and accession placeholders",
      "DICOMweb service readiness",
      "Imaging audit trace",
      "De-identification posture"
    ],
    patientSafetyControls: [
      "pixel data excluded",
      "diagnostic interpretation blocked",
      "metadata minimization",
      "de-identification validation",
      "radiology governance review"
    ],
    workarounds: [
      "Use metadata-only synthetic DICOMweb fixtures.",
      "Route image interpretation questions to radiology governance before product claims.",
      "Require DICOM Part 2 conformance statements before partner testing."
    ],
    blockedActions: ["pixel-data ingestion", "diagnostic interpretation", "PACS retrieval", "imaging result writeback"],
    proofRoutes: ["/interoperability/evaluations/dicomweb-imaging-readiness", "/health-records"]
  },
  {
    slug: "payer-record-prior-auth",
    name: "Payer, coverage, and prior-authorization record extraction",
    status: "external-review-required",
    sourceFormats: ["x12-prior-auth", "fhir-bundle", "csv-export"],
    standardBindings: ["FHIR Coverage", "FHIR Claim", "FHIR ExplanationOfBenefit", "X12 278", "CMS prior authorization APIs"],
    extractionTargets: [
      "Coverage and eligibility context",
      "Prior authorization status metadata",
      "Required documentation checklist",
      "Policy evidence links",
      "Human approval state"
    ],
    patientSafetyControls: [
      "no payer submission",
      "no reimbursement guarantee",
      "policy-source attribution",
      "coding-review escalation",
      "payer-specific validation"
    ],
    workarounds: [
      "Generate synthetic prior-authorization packets and missing-evidence checklists.",
      "Use payer sandbox or policy PDFs only after counsel/customer approval.",
      "Keep financial outcomes qualified and route to human RCM review."
    ],
    blockedActions: ["payer submission", "benefit determination", "claim filing", "reimbursement guarantee"],
    proofRoutes: ["/demos/prior-authorization-support", "/growth-engine", "/health-records"]
  }
];

export const healthRecordExtractionStages: HealthRecordExtractionStage[] = [
  {
    stage: "Intake gate",
    owner: "Data governance and integration owner",
    inputBoundary: "Synthetic fixtures, metadata-only references, or customer-approved sandbox samples only.",
    output: "Accepted source-format declaration and rejected live-data signal list.",
    safetyGate: "Block PHI, patient identifiers, payer member data, credentials, production URLs, and source records."
  },
  {
    stage: "Schema and profile detection",
    owner: "Interoperability engineering",
    inputBoundary: "Declared format and sample metadata.",
    output: "FHIR/HL7/C-CDA/DICOM/X12 profile hypothesis with version uncertainty.",
    safetyGate: "Require human confirmation before treating a profile as deployment truth."
  },
  {
    stage: "Extraction and normalization",
    owner: "Atlas and interoperability agents",
    inputBoundary: "Synthetic or approved sandbox payload only.",
    output: "Canonical extraction map, missing-field register, terminology queue, and provenance ledger.",
    safetyGate: "Draft-only output; no diagnosis, treatment, order, payer, outreach, or writeback action."
  },
  {
    stage: "Patient-safety lint",
    owner: "TrustOS and clinical governance",
    inputBoundary: "Normalized signals and source provenance.",
    output: "Safety-check results for identity, units, medications, allergies, stale facts, provenance, and action boundary.",
    safetyGate: "Critical findings block release and route to a qualified reviewer."
  },
  {
    stage: "Reviewer packet",
    owner: "Customer workflow owner and SCRIMED operator",
    inputBoundary: "No-PHI evidence, accepted synthetic findings, and retained external gate list.",
    output: "Reviewer-ready packet with workarounds, blocked actions, retained gates, and proof routes.",
    safetyGate: "Human approval required before customer sandbox, PHI, connector, or production workflow expansion."
  }
];

export const healthRecordSafetyChecks: HealthRecordSafetyCheck[] = [
  {
    id: "phi-live-data-blocker",
    name: "PHI and live-record blocker",
    severity: "critical",
    trigger: "Payload declares PHI, patient identifiers, payer member IDs, production URLs, credentials, or live clinical records.",
    mitigation: "Reject request and return no-storage boundary guidance.",
    workaround: "Use synthetic fixtures, metadata-only references, or customer-approved sandbox data after signed controls."
  },
  {
    id: "patient-identity-resolution",
    name: "Patient identity and matching guard",
    severity: "critical",
    trigger: "Request asks SCRIMED to match, merge, deduplicate, or select a live patient.",
    mitigation: "Block patient matching and route to customer MPI/identity governance.",
    workaround: "Use synthetic patient placeholders and show the required MPI acceptance test."
  },
  {
    id: "unit-terminology-drift",
    name: "Unit, terminology, and semantic drift lint",
    severity: "high",
    trigger: "Labs, vitals, medications, procedures, or conditions lack units, code-system version, or mapping provenance.",
    mitigation: "Mark extracted facts as unresolved and require terminology review.",
    workaround: "Expose a mapping queue with LOINC, SNOMED CT, RxNorm, ICD, CPT/HCPCS, and local-code placeholders."
  },
  {
    id: "medication-allergy-safety",
    name: "Medication and allergy review guard",
    severity: "critical",
    trigger: "Medication, allergy, or interaction context is requested for clinical use.",
    mitigation: "Keep output draft-only and require pharmacist/clinician review before any care action.",
    workaround: "Generate a review checklist instead of advice, prescribing, or patient instruction."
  },
  {
    id: "stale-conflicting-source",
    name: "Stale, conflicting, or unattributed source guard",
    severity: "high",
    trigger: "Extracted facts conflict across sources or lack timestamp/provenance.",
    mitigation: "Block fact promotion into reviewer packet until source conflict is resolved.",
    workaround: "Create a missing-evidence register and route to the customer records owner."
  },
  {
    id: "writeback-action-blocker",
    name: "Writeback and patient-action blocker",
    severity: "critical",
    trigger: "Request asks for EHR mutation, order entry, outreach, payer submission, triage, or final clinical recommendation.",
    mitigation: "Reject the action and preserve a no-authority audit event.",
    workaround: "Produce a human-reviewed draft packet and retain the live-action gate."
  }
];

export const healthRecordBoundaryResolutions: HealthRecordBoundaryResolution[] = [
  {
    boundary: "Live PHI and patient identifiers",
    riskIfIgnored: "Privacy breach, contractual breach, regulatory exposure, and loss of buyer trust.",
    currentControl: "Public and synthetic routes reject PHI and live records; extraction evaluator requires syntheticOnly=true.",
    safeWorkaround: "Use synthetic fixtures, metadata-only references, and customer sandbox placeholders.",
    remainingGate: "Signed BAA/DPA or non-PHI determination, privacy/security review, retention policy, and customer approval.",
    owner: "Privacy, security, legal, customer compliance, and data governance",
    proofRoutes: [healthRecordsSafetyExchangeRoute, "/clinical-care-activation", "/approvals-readiness"]
  },
  {
    boundary: "Production EHR, HIE, payer, imaging, and device connectors",
    riskIfIgnored: "Unsafe data exchange, silent record mutation, trading-partner breach, and patient-safety exposure.",
    currentControl: "Connector work remains standards-aware and synthetic until partner acceptance testing exists.",
    safeWorkaround: "Run conformance kits, fixture validation, CapabilityStatement review, and sandbox mapping packets.",
    remainingGate: "Customer sandbox approval, partner acceptance, security review, purpose-of-use, consent, audit, monitoring, and rollback.",
    owner: "Interoperability engineering, customer integration owner, security, and clinical governance",
    proofRoutes: ["/interoperability", "/interoperability/evaluations", healthRecordsSafetyExchangeRoute]
  },
  {
    boundary: "Patient safety and clinical action",
    riskIfIgnored: "Incorrect patient context, unsafe care recommendation, missed escalation, or unauthorized clinical decision support.",
    currentControl: "Outputs are draft-only, source-attributed, reviewer-gated, and blocked from clinical action.",
    safeWorkaround: "Produce reviewer checklists, missing-data registers, and escalation queues instead of recommendations.",
    remainingGate: "Licensed clinical governance, intended-use review, validation protocol, safety case, and customer go-live approval.",
    owner: "Clinical governance, TrustOS, product, and customer clinical owner",
    proofRoutes: ["/clinical-authority-readiness", "/clinical-care-activation", healthRecordsSafetyExchangeRoute]
  },
  {
    boundary: "Patient matching and longitudinal record assembly",
    riskIfIgnored: "Wrong-patient record merge, duplicate facts, incomplete histories, and unsafe downstream automation.",
    currentControl: "SCRIMED does not match live patients or merge production longitudinal records.",
    safeWorkaround: "Use synthetic identity placeholders and route matching to customer MPI or identity-governance owners.",
    remainingGate: "Customer MPI acceptance tests, identity policy, consent path, error reconciliation, audit, and clinical owner approval.",
    owner: "Customer identity governance, interoperability engineering, and clinical safety",
    proofRoutes: [healthRecordsSafetyExchangeRoute, "/interoperability", "/workflows/runtime-safety"]
  },
  {
    boundary: "Payer submission and reimbursement outcomes",
    riskIfIgnored: "Improper payer transaction, false reimbursement expectation, and regulatory or contract exposure.",
    currentControl: "SCRIMED creates synthetic prior-auth support packets and missing-evidence lists only.",
    safeWorkaround: "Route payer work to human RCM review and customer payer-policy owners.",
    remainingGate: "Payer/trading-partner approval, X12/FHIR API testing, coding review, legal review, and customer release authority.",
    owner: "RCM owner, legal, customer sponsor, and payer integration owner",
    proofRoutes: [healthRecordsSafetyExchangeRoute, "/growth-engine", "/enterprise-business-ops"]
  }
];

const allowedFormats: HealthRecordSourceFormat[] = [
  "fhir-bundle",
  "hl7-v2-message",
  "c-cda-document",
  "dicom-metadata",
  "x12-prior-auth",
  "csv-export",
  "unstructured-note"
];

const blockedActionPatterns = [
  /write\s?back/i,
  /record mutation/i,
  /diagnos/i,
  /treat/i,
  /triage/i,
  /order entry/i,
  /prescrib/i,
  /patient outreach/i,
  /payer submission/i,
  /claim submission/i,
  /production sync/i,
  /patient match/i,
  /merge patient/i
];

const prohibitedLiveDataPatterns = [
  /\bMRN\b/i,
  /medical record number/i,
  /member id/i,
  /patient identifier/i,
  /date of birth/i,
  /\bDOB\b/i,
  /\bSSN\b/i,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /production endpoint/i,
  /bearer\s+[a-z0-9._-]+/i
];

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

function collectStrings(value: unknown, depth = 0): string[] {
  if (depth > 4) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStrings(item, depth + 1));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => collectStrings(item, depth + 1));
  }

  return [];
}

export function evaluateSyntheticHealthRecordExtractionRequest(
  payload: unknown
): HealthRecordExtractionEvaluation {
  const request = (payload && typeof payload === "object" ? payload : {}) as Partial<HealthRecordExtractionRequest>;
  const sourceFormat = asString(request.sourceFormat) as HealthRecordSourceFormat;
  const declaredStandard = asString(request.declaredStandard);
  const intendedUse = asString(request.intendedUse);
  const requestedAction = asString(request.requestedAction);
  const recordKinds = asStringArray(request.recordKinds);
  const textSignals = collectStrings(payload);
  const reasons: string[] = [];

  if (request.syntheticOnly !== true) {
    reasons.push("syntheticOnly must be true before SCRIMED will evaluate extraction.");
  }

  if (request.containsPhi === true || request.includesPatientIdentifiers === true) {
    reasons.push("Request declares PHI or patient identifiers.");
  }

  if (!allowedFormats.includes(sourceFormat)) {
    reasons.push(`sourceFormat must be one of: ${allowedFormats.join(", ")}.`);
  }

  if (recordKinds.length === 0) {
    reasons.push("recordKinds must identify the synthetic resource, message, document, or metadata classes being evaluated.");
  }

  if (blockedActionPatterns.some((pattern) => pattern.test(`${requestedAction} ${intendedUse}`))) {
    reasons.push("Requested action crosses writeback, patient action, payer submission, patient matching, diagnosis, treatment, or production-sync boundaries.");
  }

  if (textSignals.some((signal) => prohibitedLiveDataPatterns.some((pattern) => pattern.test(signal)))) {
    reasons.push("Request text appears to contain live-record, identifier, credential, or production endpoint signals.");
  }

  const accepted = reasons.length === 0;
  const formatLabel = sourceFormat || "declared source";

  return {
    accepted,
    status: accepted ? "synthetic-extraction-plan-ready" : "blocked",
    reasons,
    extractionPlan: accepted
      ? [
          `Confirm ${formatLabel} and ${declaredStandard || "deployment profile"} version assumptions.`,
          `Map ${recordKinds.join(", ")} to canonical extraction targets with source provenance.`,
          "Run patient-safety lint for identity, terminology, units, stale facts, medications, allergies, and action boundaries.",
          "Create a reviewer packet with missing fields, unresolved mappings, blocked actions, retained gates, and proof routes."
        ]
      : [],
    safetyChecks: healthRecordSafetyChecks.map((check) => check.name),
    workarounds: [
      "Use synthetic fixtures, not live patient records.",
      "Use metadata-only external artifact references for buyer evidence.",
      "Use customer sandbox feeds only after signed privacy, security, connector, and clinical governance gates.",
      "Keep all extracted output draft-only and human-reviewed."
    ],
    retainedGates: healthRecordBoundaryResolutions.map((resolution) => resolution.remainingGate)
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getHealthRecordsSafetyExchangeSummary() {
  const liveBlockedCapabilities = healthRecordCapabilities.filter(
    (capability) => capability.status !== "synthetic-ready"
  ).length;
  const blockedActionCount = new Set(healthRecordCapabilities.flatMap((capability) => capability.blockedActions)).size;
  const workaroundCount = new Set([
    ...healthRecordCapabilities.flatMap((capability) => capability.workarounds),
    ...healthRecordBoundaryResolutions.map((resolution) => resolution.safeWorkaround)
  ]).size;
  const safetyControlCount = new Set([
    ...healthRecordCapabilities.flatMap((capability) => capability.patientSafetyControls),
    ...healthRecordSafetyChecks.map((check) => check.name)
  ]).size;

  return {
    service: "scrimed-health-records-safety-exchange",
    route: healthRecordsSafetyExchangeRoute,
    apiRoute: healthRecordsSafetyExchangeApiRoute,
    briefRoute: healthRecordsSafetyExchangeBriefRoute,
    extractRoute: healthRecordsSafetyExchangeExtractRoute,
    status: healthRecordsSafetyExchangeStatus,
    briefStatus: healthRecordsSafetyExchangeBriefStatus,
    extractionStatus: healthRecordsSafetyExchangeExtractionStatus,
    boundary: healthRecordsSafetyExchangeBoundary,
    capabilityCount: healthRecordCapabilities.length,
    sourceReferenceCount: healthRecordSourceReferences.length,
    extractionStageCount: healthRecordExtractionStages.length,
    safetyCheckCount: healthRecordSafetyChecks.length,
    safetyControlCount,
    boundaryResolutionCount: healthRecordBoundaryResolutions.length,
    liveBlockedCapabilityCount: liveBlockedCapabilities,
    blockedActionCount,
    workaroundCount,
    capabilities: healthRecordCapabilities,
    extractionStages: healthRecordExtractionStages,
    safetyChecks: healthRecordSafetyChecks,
    boundaryResolutions: healthRecordBoundaryResolutions,
    sourceReferences: healthRecordSourceReferences,
    operatingRules: [
      "Reject PHI, patient identifiers, payer member IDs, production credentials, source records, and production endpoints in public or synthetic workflows.",
      "Use FHIR, HL7 v2, C-CDA, DICOM/DICOMweb, X12, USCDI, TEFCA, and terminology standards as readiness contracts, not live connector approval.",
      "Keep patient matching, diagnosis, treatment, triage, prescribing, patient outreach, payer submission, and record mutation blocked.",
      "Route ambiguous mappings, missing provenance, stale facts, medication/allergy safety, and units/terminology conflicts to qualified human review.",
      "Require customer sandbox approval, privacy/security/legal review, clinical governance, consent/purpose-of-use, audit, monitoring, rollback, and go-live approval before live data exchange."
    ],
    nextActions: [
      "Attach Health Records Safety Exchange to every interoperability, clinical-care activation, and buyer integration conversation.",
      "Use the extraction evaluator to convert synthetic record requests into reviewer packets and retained gates.",
      "Promote only standards-mapped, source-attributed, human-reviewed, no-PHI evidence into buyer diligence.",
      "Create customer-specific sandbox acceptance tests before any live connector work."
    ],
    updated: healthRecordsSafetyExchangeUpdatedAt
  };
}

export function buildHealthRecordsSafetyExchangeBrief() {
  const summary = getHealthRecordsSafetyExchangeSummary();

  return [
    "# SCRIMED Health Records Safety Exchange Brief",
    "",
    `Status: ${summary.status}`,
    `Capability count: ${summary.capabilityCount}`,
    `Extraction stages: ${summary.extractionStageCount}`,
    `Safety checks: ${summary.safetyCheckCount}`,
    `Boundary resolutions: ${summary.boundaryResolutionCount}`,
    `Workarounds: ${summary.workaroundCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not PHI processing approval, production EHR authorization, ONC certification, TEFCA participation approval, payer submission authority, clinical validation, medical advice, diagnosis, treatment, or live-care authorization.",
    "",
    "## Capabilities",
    ...summary.capabilities.map(
      (capability) =>
        `- ${capability.name} (${capability.status}): formats ${capability.sourceFormats.join(", ")}; standards ${capability.standardBindings.join(", ")}; blocked ${capability.blockedActions.join(", ")}`
    ),
    "",
    "## Extraction Stages",
    ...summary.extractionStages.map(
      (stage) =>
        `- ${stage.stage}: ${stage.output}. Gate: ${stage.safetyGate}`
    ),
    "",
    "## Patient Safety Checks",
    ...summary.safetyChecks.map(
      (check) =>
        `- ${check.name} (${check.severity}): ${check.trigger} Mitigation: ${check.mitigation} Workaround: ${check.workaround}`
    ),
    "",
    "## Boundary Resolutions",
    ...summary.boundaryResolutions.map(
      (resolution) =>
        `- ${resolution.boundary}: ${resolution.currentControl} Workaround: ${resolution.safeWorkaround} Gate: ${resolution.remainingGate}`
    ),
    "",
    "## Operating Rules",
    markdownItems(summary.operatingRules),
    "",
    "## Next Actions",
    markdownItems(summary.nextActions)
  ].join("\n");
}
