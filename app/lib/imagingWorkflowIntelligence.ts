import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import { getIntegrationFixtureBySlug } from "./integrationFixtures";
import { getInteroperabilityConformanceEvaluationBySlug } from "./interoperabilityConformanceEvaluations";

export const imagingWorkflowIntelligenceVersion = "scrimed-imaging-workflow-intelligence-v1-2026-07-17";
export const imagingWorkflowIntelligenceBoundary =
  "SCRIMED Imaging Workflow Intelligence evaluates synthetic DICOM/DICOMweb metadata, exam completeness, measurement consistency, preliminary FHIR previews, escalation, and review state. It does not inspect production pixels, interpret images, finalize diagnoses or reports, write to an EHR, activate a PACS/RIS/VNA connector, or authorize clinical use.";

export type ImagingSeriesMetadata = {
  seriesUid: string;
  description: string;
  bodyPart: string;
  instanceCount: number;
  acquiredAt: string;
  transferSyntaxUid: string;
};

export type ImagingMeasurement = {
  measurementId: string;
  code: string;
  value: number;
  unit: string;
  sourceSeriesUid: string;
  method: "device-generated" | "operator-entered" | "synthetic-fixture";
};

export type ImagingProtocolContract = {
  protocolId: string;
  requiredSeriesDescriptions: string[];
  requiredMeasurementCodes: string[];
  allowedUnitsByCode: Record<string, string[]>;
  minimumInstancesBySeries: Record<string, number>;
};

export type ImagingWorkflowInput = {
  tenantId: string;
  siteId: string;
  deviceId: string;
  actorId: string;
  studyUid: string;
  accessionReference: string;
  subjectReference: string;
  modality: "CT" | "MR" | "US" | "XR" | "MG" | "NM" | "PT" | "OT";
  sourceType: "DICOM" | "DICOMweb" | "PACS-RIS-preview" | "VNA-preview";
  series: ImagingSeriesMetadata[];
  measurements: ImagingMeasurement[];
  deviceGeneratedFindingRefs: string[];
  protocol: ImagingProtocolContract;
  requestedAction: "validate-exam" | "prepare-fhir-handoff" | "finalize-diagnostic-report";
  syntheticOnly: true;
  noPhi: true;
  includesPixelData: false;
};

export type ImagingWorkflowCheck = {
  checkId: string;
  status: "pass" | "review" | "block";
  detail: string;
  evidenceRefs: string[];
};

export type ImagingFhirPreview = {
  imagingStudy: {
    resourceType: "ImagingStudy";
    id: string;
    status: "available";
    subject: { reference: string };
    started: string;
    numberOfSeries: number;
    numberOfInstances: number;
    modality: Array<{ system: "http://dicom.nema.org/resources/ontology/DCM"; code: string }>;
    series: Array<{ uid: string; numberOfInstances: number; description: string }>;
  };
  diagnosticReport: {
    resourceType: "DiagnosticReport";
    id: string;
    status: "preliminary";
    subject: { reference: string };
    imagingStudy: Array<{ reference: string }>;
    result: Array<{ reference: string }>;
    conclusion: null;
    presentedForm: [];
  };
  observations: Array<{
    resourceType: "Observation";
    id: string;
    status: "preliminary";
    code: { text: string };
    subject: { reference: string };
    valueQuantity: { value: number; unit: string };
    derivedFrom: Array<{ reference: string }>;
  }>;
  provenance: {
    resourceType: "Provenance";
    id: string;
    recorded: string;
    target: Array<{ reference: string }>;
    agent: Array<{ type: { text: "assembler" }; who: { reference: string } }>;
    entity: Array<{ role: "source"; what: { reference: string } }>;
  };
};

export type ImagingWorkflowResult = {
  status: "review-ready" | "incomplete" | "blocked";
  checks: ImagingWorkflowCheck[];
  missingSeries: string[];
  missingMeasurements: string[];
  measurementConsistencyIssues: string[];
  fhirPreview: ImagingFhirPreview | null;
  remoteSpecialistEscalation: {
    required: boolean;
    reasonCodes: string[];
    externalCommunicationAllowed: false;
  };
  clinicianReview: {
    required: true;
    disposition: "pending";
    acceptanceAllowedAfterReview: true;
    correctionAndOverrideAudited: true;
    diagnosticFinalizationAllowed: false;
  };
  structuredHandoff: {
    status: "preview-only" | "blocked";
    ehrWritebackAllowed: false;
    finalReportAllowed: false;
  };
  sourceFixture: string;
  conformanceStatus: string;
  traceId: string;
  auditHash: string;
  boundary: typeof imagingWorkflowIntelligenceBoundary;
};

export type ImagingReviewEvent = {
  eventId: string;
  traceId: string;
  reviewerIdHash: string;
  action: "accepted-for-internal-review" | "corrected" | "overrode" | "rejected";
  reasonCode: string;
  occurredAt: string;
  diagnosticAuthorityGranted: false;
  ehrWritebackAllowed: false;
  auditHash: string;
};

export type RegulatoryScope = {
  jurisdiction: string;
  status: "unverified" | "documented-requires-review" | "research-only";
  intendedUseScope: string;
  evidenceReferences: string[];
  independentlyVerified: boolean;
};

export type ImagingModelCard = {
  modelCardId: string;
  modelId: string;
  modelVersion: string;
  artifactDigest: string;
  intendedUse: string;
  prohibitedUses: string[];
  modalities: ImagingWorkflowInput["modality"][];
  anatomy: string[];
  regulatoryScopes: RegulatoryScope[];
  evidenceGrade: "ungraded" | "preliminary" | "reviewed";
  accountableOwner: string;
  admittedModes: Array<"offline" | "shadow">;
  clinicalApprovalGranted: false;
  liveQueueMutationAllowed: false;
  modelCardHash: string;
};

export type DICOMContract = {
  contractId: string;
  version: string;
  acceptedTransferSyntaxUids: string[];
  supportedModalities: ImagingWorkflowInput["modality"][];
  pacsRisIntegrationMode: "fixture-only" | "offline-contract-test" | "shadow-metadata";
  requiredFhirResources: Array<"ImagingStudy" | "DiagnosticReport" | "Observation" | "Provenance">;
  tenantIsolationVerified: boolean;
  noPixelDataInTelemetry: true;
  ehrWritebackAllowed: false;
  contractHash: string;
};

export type SiteValidationRun = {
  validationRunId: string;
  siteId: string;
  modelCardId: string;
  dicomContractId: string;
  mode: "offline" | "shadow";
  caseCount: number;
  sensitivity: number;
  specificity: number;
  calibrationError: number;
  falseNegativeCount: number;
  subgroupChecksComplete: boolean;
  integrationContractPassed: boolean;
  humanReviewComplete: boolean;
  status: "passed" | "failed" | "underpowered" | "pending";
  clinicalQueueAuthorityGranted: false;
  runHash: string;
};

export type QueuePolicy = {
  policyId: string;
  maximumDelayMinutesByPriority: Record<"routine" | "urgent" | "stat", number>;
  recommendationOnly: true;
  humanOverrideRequired: true;
  preserveOriginalQueuePosition: true;
  lowerRankedMaximumDelayEnforced: true;
  policyHash: string;
};

export type QueueRecommendation = {
  recommendationId: string;
  siteId: string;
  studyReferenceHash: string;
  originalQueuePosition: number;
  recommendedQueuePosition: number;
  priorityClass: "routine" | "urgent" | "stat";
  reasonCodes: string[];
  evidenceReferences: string[];
  generatedAt: string;
  expiresAt: string;
  maximumDelayAt: string;
  siteValidationRunId: string | null;
  status: "recommendation-ready" | "blocked-site-validation" | "blocked-maximum-delay";
  humanReviewRequired: true;
  liveQueueMutationAllowed: false;
  auditHash: string;
};

export type DriftMonitor = {
  monitorId: string;
  modelCardId: string;
  siteId: string;
  windowStartsAt: string;
  windowEndsAt: string;
  observedCalibrationError: number;
  observedOverrideRate: number;
  observedFalseNegativeRate: number;
  baselineCalibrationError: number;
  driftStatus: "stable" | "review" | "blocked";
  queueRecommendationsPaused: boolean;
  monitorHash: string;
};

export type ImagingOverride = {
  overrideId: string;
  recommendationId: string;
  radiologistIdentityHash: string;
  disposition: "accept" | "modify" | "reject";
  finalQueuePosition: number;
  reasonCode: string;
  occurredAt: string;
  radiologistRetainsAuthority: true;
  auditHash: string;
};

export type ImagingOutcomeLedger = {
  ledgerId: string;
  modelCardId: string;
  siteId: string;
  sensitivity: number;
  specificity: number;
  calibrationError: number;
  falseNegativeRate: number;
  medianTimeToDiagnosisMinutes: number | null;
  medianTimeToReportMinutes: number;
  subgroupResults: Array<{
    subgroupId: string;
    sampleSize: number;
    sensitivity: number;
    specificity: number;
  }>;
  workloadMinutes: number;
  alertAcceptanceRate: number;
  unintendedDelayCount: number;
  measuredAt: string;
  clinicalClaimsAllowed: false;
  ledgerHash: string;
};

function safeReference(value: string) {
  return /^[a-z0-9][a-z0-9._:/-]{2,180}$/i.test(value) && !/token|secret|password|bearer/i.test(value);
}

function isoTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function validateImagingInput(input: ImagingWorkflowInput) {
  const errors: string[] = [];
  if (!input.syntheticOnly || !input.noPhi || input.includesPixelData) {
    errors.push("imaging input must be synthetic, no-PHI, and metadata-only");
  }
  if (![input.tenantId, input.siteId, input.deviceId, input.actorId, input.accessionReference, input.subjectReference].every(safeReference)) {
    errors.push("imaging identity and scope references must be safe metadata identifiers");
  }
  if (!/^([0-9]+\.)+[0-9]+$/.test(input.studyUid)) errors.push("studyUid must be a numeric DICOM UID");
  if (input.series.length === 0) errors.push("at least one imaging series is required");
  if (input.series.some((series) => !safeReference(series.seriesUid) || !isoTimestamp(series.acquiredAt) || series.instanceCount < 0)) {
    errors.push("series metadata is invalid");
  }
  if (input.measurements.some((measurement) => !Number.isFinite(measurement.value) || !safeReference(measurement.sourceSeriesUid))) {
    errors.push("measurement metadata is invalid");
  }
  if (!safeReference(input.protocol.protocolId)) errors.push("protocol identifier is invalid");
  return errors;
}

function buildFhirPreview(input: ImagingWorkflowInput, generatedAt: string): ImagingFhirPreview {
  const studyId = `synthetic-imaging-study-${createClinicalEvidenceHash(input.studyUid).slice(0, 16)}`;
  const subjectReference = `Patient/synthetic-${createClinicalEvidenceHash(input.subjectReference).slice(0, 16)}`;
  const observations = input.measurements.map((measurement) => ({
    resourceType: "Observation" as const,
    id: `synthetic-observation-${createClinicalEvidenceHash(measurement.measurementId).slice(0, 16)}`,
    status: "preliminary" as const,
    code: { text: measurement.code },
    subject: { reference: subjectReference },
    valueQuantity: { value: measurement.value, unit: measurement.unit },
    derivedFrom: [{ reference: `ImagingStudy/${studyId}` }]
  }));
  const started = [...input.series].sort((left, right) => left.acquiredAt.localeCompare(right.acquiredAt))[0].acquiredAt;
  const diagnosticReportId = `synthetic-diagnostic-report-${createClinicalEvidenceHash(input.accessionReference).slice(0, 16)}`;

  return {
    imagingStudy: {
      resourceType: "ImagingStudy",
      id: studyId,
      status: "available",
      subject: { reference: subjectReference },
      started,
      numberOfSeries: input.series.length,
      numberOfInstances: input.series.reduce((total, series) => total + series.instanceCount, 0),
      modality: [{ system: "http://dicom.nema.org/resources/ontology/DCM", code: input.modality }],
      series: input.series.map((series) => ({
        uid: series.seriesUid,
        numberOfInstances: series.instanceCount,
        description: series.description
      }))
    },
    diagnosticReport: {
      resourceType: "DiagnosticReport",
      id: diagnosticReportId,
      status: "preliminary",
      subject: { reference: subjectReference },
      imagingStudy: [{ reference: `ImagingStudy/${studyId}` }],
      result: observations.map((observation) => ({ reference: `Observation/${observation.id}` })),
      conclusion: null,
      presentedForm: []
    },
    observations,
    provenance: {
      resourceType: "Provenance",
      id: `synthetic-provenance-${createClinicalEvidenceHash({ studyId, generatedAt }).slice(0, 16)}`,
      recorded: generatedAt,
      target: [
        { reference: `ImagingStudy/${studyId}` },
        { reference: `DiagnosticReport/${diagnosticReportId}` },
        ...observations.map((observation) => ({ reference: `Observation/${observation.id}` }))
      ],
      agent: [{ type: { text: "assembler" }, who: { reference: "Device/synthetic-scrimed-imaging-adapter" } }],
      entity: input.series.map((series) => ({ role: "source" as const, what: { reference: `urn:dicom:series:${series.seriesUid}` } }))
    }
  };
}

export function evaluateImagingWorkflow(
  input: ImagingWorkflowInput,
  generatedAt = new Date().toISOString()
): ImagingWorkflowResult {
  const errors = validateImagingInput(input);
  if (!isoTimestamp(generatedAt)) errors.push("generatedAt is invalid");
  if (errors.length > 0) throw new Error(`Invalid synthetic imaging workflow input: ${errors.join("; ")}`);

  const seriesDescriptions = new Set(input.series.map((series) => series.description.toLowerCase()));
  const measurementCodes = new Set(input.measurements.map((measurement) => measurement.code));
  const seriesUids = new Set(input.series.map((series) => series.seriesUid));
  const missingSeries = input.protocol.requiredSeriesDescriptions.filter(
    (description) => !seriesDescriptions.has(description.toLowerCase())
  );
  const missingMeasurements = input.protocol.requiredMeasurementCodes.filter((code) => !measurementCodes.has(code));
  const measurementConsistencyIssues = input.measurements.flatMap((measurement) => {
    const issues: string[] = [];
    if (!seriesUids.has(measurement.sourceSeriesUid)) issues.push(`${measurement.measurementId}: source series is missing`);
    const allowedUnits = input.protocol.allowedUnitsByCode[measurement.code] ?? [];
    if (allowedUnits.length > 0 && !allowedUnits.includes(measurement.unit)) {
      issues.push(`${measurement.measurementId}: unit ${measurement.unit} is not allowed for ${measurement.code}`);
    }
    return issues;
  });
  const underfilledSeries = input.series.filter((series) => {
    const minimum = input.protocol.minimumInstancesBySeries[series.description] ?? 0;
    return series.instanceCount < minimum;
  });
  const finalizationRequested = input.requestedAction === "finalize-diagnostic-report";
  const checks: ImagingWorkflowCheck[] = [
    {
      checkId: "metadata-only-boundary",
      status: "pass",
      detail: "Fixture is synthetic, no-PHI, and contains no pixel data.",
      evidenceRefs: ["fixture-dicom-imaging-exchange-v1"]
    },
    {
      checkId: "exam-completeness",
      status: missingSeries.length || underfilledSeries.length ? "review" : "pass",
      detail: missingSeries.length || underfilledSeries.length
        ? `Missing series: ${missingSeries.join(", ") || "none"}; underfilled series: ${underfilledSeries.map((series) => series.description).join(", ") || "none"}.`
        : "Required synthetic series and instance counts are present.",
      evidenceRefs: input.series.map((series) => series.seriesUid)
    },
    {
      checkId: "measurement-consistency",
      status: missingMeasurements.length || measurementConsistencyIssues.length ? "review" : "pass",
      detail: missingMeasurements.length || measurementConsistencyIssues.length
        ? `Missing measurements: ${missingMeasurements.join(", ") || "none"}; consistency issues: ${measurementConsistencyIssues.join("; ") || "none"}.`
        : "Required measurement metadata and units are consistent with the protocol contract.",
      evidenceRefs: input.measurements.map((measurement) => measurement.measurementId)
    },
    {
      checkId: "diagnostic-authority",
      status: finalizationRequested ? "block" : "pass",
      detail: finalizationRequested
        ? "Diagnostic report finalization is prohibited; only a preliminary review preview can be produced."
        : "No diagnostic finalization was requested.",
      evidenceRefs: [imagingWorkflowIntelligenceVersion]
    }
  ];
  const blocked = checks.some((check) => check.status === "block");
  const incomplete = checks.some((check) => check.status === "review");
  const status: ImagingWorkflowResult["status"] = blocked ? "blocked" : incomplete ? "incomplete" : "review-ready";
  const fhirPreview = blocked ? null : buildFhirPreview(input, generatedAt);
  const conformance = getInteroperabilityConformanceEvaluationBySlug("dicomweb-imaging-exchange");
  const fixture = getIntegrationFixtureBySlug("dicom-imaging-exchange");
  const traceId = `trace-imaging-${createClinicalEvidenceHash({ tenantId: input.tenantId, studyUid: input.studyUid, generatedAt }).slice(0, 20)}`;

  return {
    status,
    checks,
    missingSeries,
    missingMeasurements,
    measurementConsistencyIssues,
    fhirPreview,
    remoteSpecialistEscalation: {
      required: incomplete || blocked,
      reasonCodes: [
        ...(missingSeries.length ? ["missing-series"] : []),
        ...(missingMeasurements.length ? ["missing-measurement"] : []),
        ...(measurementConsistencyIssues.length ? ["measurement-inconsistency"] : []),
        ...(finalizationRequested ? ["diagnostic-finalization-request-blocked"] : [])
      ],
      externalCommunicationAllowed: false
    },
    clinicianReview: {
      required: true,
      disposition: "pending",
      acceptanceAllowedAfterReview: true,
      correctionAndOverrideAudited: true,
      diagnosticFinalizationAllowed: false
    },
    structuredHandoff: {
      status: blocked ? "blocked" : "preview-only",
      ehrWritebackAllowed: false,
      finalReportAllowed: false
    },
    sourceFixture: fixture?.request.fixtureId ?? "fixture-unavailable",
    conformanceStatus: conformance?.status ?? "attention-required",
    traceId,
    auditHash: createClinicalEvidenceHash({
      version: imagingWorkflowIntelligenceVersion,
      tenantId: input.tenantId,
      siteId: input.siteId,
      studyUid: input.studyUid,
      checks,
      status,
      traceId
    }),
    boundary: imagingWorkflowIntelligenceBoundary
  };
}

export function recordImagingReviewEvent(input: {
  result: ImagingWorkflowResult;
  reviewerId: string;
  action: ImagingReviewEvent["action"];
  reasonCode: string;
  occurredAt: string;
}): ImagingReviewEvent {
  if (!safeReference(input.reviewerId) || !safeReference(input.reasonCode) || !isoTimestamp(input.occurredAt)) {
    throw new Error("Invalid imaging review metadata");
  }
  const reviewerIdHash = createClinicalEvidenceHash({ reviewerId: input.reviewerId });
  const eventCore = {
    eventId: `imaging-review-${createClinicalEvidenceHash({ traceId: input.result.traceId, reviewerIdHash, action: input.action }).slice(0, 20)}`,
    traceId: input.result.traceId,
    reviewerIdHash,
    action: input.action,
    reasonCode: input.reasonCode,
    occurredAt: input.occurredAt,
    diagnosticAuthorityGranted: false as const,
    ehrWritebackAllowed: false as const
  };
  return { ...eventCore, auditHash: createClinicalEvidenceHash(eventCore) };
}

export function analyzeImagingFleetVariance(inputs: ImagingWorkflowInput[]) {
  const sites = new Map<string, { exams: number; series: number; measurements: number }>();
  for (const input of inputs) {
    const current = sites.get(input.siteId) ?? { exams: 0, series: 0, measurements: 0 };
    sites.set(input.siteId, {
      exams: current.exams + 1,
      series: current.series + input.series.length,
      measurements: current.measurements + input.measurements.length
    });
  }
  return Array.from(sites, ([siteId, values]) => ({
    siteIdHash: createClinicalEvidenceHash({ siteId }),
    examCount: values.exams,
    averageSeriesPerExam: values.exams ? values.series / values.exams : 0,
    averageMeasurementsPerExam: values.exams ? values.measurements / values.exams : 0,
    interpretation: "descriptive-synthetic-variance-only" as const,
    humanReviewRequired: true as const
  }));
}

const imagingSha256Pattern = /^[0-9a-f]{64}$/i;

function imagingUnitInterval(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function imagingCanonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

export function createImagingModelCard(
  input: Omit<ImagingModelCard, "clinicalApprovalGranted" | "liveQueueMutationAllowed" | "modelCardHash">
): ImagingModelCard {
  if (!imagingSha256Pattern.test(input.artifactDigest) || !input.accountableOwner.trim()) {
    throw new Error("Imaging model card requires a content-addressed artifact and accountable owner");
  }
  if (!input.admittedModes.length || input.regulatoryScopes.some((scope) => scope.independentlyVerified && scope.status === "unverified")) {
    throw new Error("Imaging model admission requires explicit offline or shadow scope and consistent regulatory metadata");
  }
  const base = {
    ...input,
    prohibitedUses: imagingCanonical(input.prohibitedUses),
    modalities: [...new Set(input.modalities)].sort(),
    anatomy: imagingCanonical(input.anatomy),
    clinicalApprovalGranted: false as const,
    liveQueueMutationAllowed: false as const
  };
  return { ...base, modelCardHash: createClinicalEvidenceHash({ type: "imaging-model-card", base }) };
}

export function createDicomContract(
  input: Omit<DICOMContract, "noPixelDataInTelemetry" | "ehrWritebackAllowed" | "contractHash">
): DICOMContract {
  if (
    !input.acceptedTransferSyntaxUids.length ||
    !input.supportedModalities.length ||
    !input.requiredFhirResources.includes("ImagingStudy") ||
    !input.requiredFhirResources.includes("Provenance")
  ) {
    throw new Error("DICOM contract is missing required interoperability boundaries");
  }
  const base = {
    ...input,
    acceptedTransferSyntaxUids: imagingCanonical(input.acceptedTransferSyntaxUids),
    supportedModalities: [...new Set(input.supportedModalities)].sort(),
    requiredFhirResources: [...new Set(input.requiredFhirResources)].sort(),
    noPixelDataInTelemetry: true as const,
    ehrWritebackAllowed: false as const
  };
  return { ...base, contractHash: createClinicalEvidenceHash({ type: "dicom-contract", base }) };
}

export function evaluateImagingSiteValidation(
  input: Omit<SiteValidationRun, "status" | "clinicalQueueAuthorityGranted" | "runHash"> & {
    minimumCaseCount: number;
    minimumSensitivity: number;
    minimumSpecificity: number;
    maximumCalibrationError: number;
  }
): SiteValidationRun {
  for (const value of [
    input.sensitivity,
    input.specificity,
    input.calibrationError
  ]) {
    if (!imagingUnitInterval(value)) throw new Error("Imaging validation metrics must be in [0, 1]");
  }
  const underpowered = input.caseCount < input.minimumCaseCount;
  const passed =
    !underpowered &&
    input.sensitivity >= input.minimumSensitivity &&
    input.specificity >= input.minimumSpecificity &&
    input.calibrationError <= input.maximumCalibrationError &&
    input.integrationContractPassed &&
    input.subgroupChecksComplete &&
    input.humanReviewComplete;
  const status: SiteValidationRun["status"] = underpowered
    ? "underpowered"
    : passed
      ? "passed"
      : "failed";
  const base = {
    validationRunId: input.validationRunId,
    siteId: input.siteId,
    modelCardId: input.modelCardId,
    dicomContractId: input.dicomContractId,
    mode: input.mode,
    caseCount: input.caseCount,
    sensitivity: input.sensitivity,
    specificity: input.specificity,
    calibrationError: input.calibrationError,
    falseNegativeCount: input.falseNegativeCount,
    subgroupChecksComplete: input.subgroupChecksComplete,
    integrationContractPassed: input.integrationContractPassed,
    humanReviewComplete: input.humanReviewComplete,
    status,
    clinicalQueueAuthorityGranted: false as const
  };
  return { ...base, runHash: createClinicalEvidenceHash({ type: "imaging-site-validation", base }) };
}

export function createQueuePolicy(
  input: Omit<
    QueuePolicy,
    "recommendationOnly" | "humanOverrideRequired" | "preserveOriginalQueuePosition" | "lowerRankedMaximumDelayEnforced" | "policyHash"
  >
): QueuePolicy {
  if (
    Object.values(input.maximumDelayMinutesByPriority).some(
      (value) => !Number.isFinite(value) || value <= 0
    )
  ) {
    throw new Error("Imaging queue maximum-delay safeguards must be positive");
  }
  const base = {
    ...input,
    recommendationOnly: true as const,
    humanOverrideRequired: true as const,
    preserveOriginalQueuePosition: true as const,
    lowerRankedMaximumDelayEnforced: true as const
  };
  return { ...base, policyHash: createClinicalEvidenceHash({ type: "imaging-queue-policy", base }) };
}

export function buildQueueRecommendation(input: {
  recommendationId: string;
  siteId: string;
  studyReferenceHash: string;
  originalQueuePosition: number;
  recommendedQueuePosition: number;
  priorityClass: QueueRecommendation["priorityClass"];
  reasonCodes: string[];
  evidenceReferences: string[];
  generatedAt: string;
  expiresAt: string;
  expectedDelayMinutes: number;
  policy: QueuePolicy;
  siteValidationRun: SiteValidationRun | null;
}): QueueRecommendation {
  if (
    !imagingSha256Pattern.test(input.studyReferenceHash) ||
    !isoTimestamp(input.generatedAt) ||
    !isoTimestamp(input.expiresAt) ||
    input.originalQueuePosition < 1 ||
    input.recommendedQueuePosition < 1 ||
    input.expectedDelayMinutes < 0
  ) {
    throw new Error("Imaging queue recommendation metadata is invalid");
  }
  const maximumDelayMinutes = input.policy.maximumDelayMinutesByPriority[input.priorityClass];
  const validationPassed =
    input.siteValidationRun?.status === "passed" &&
    input.siteValidationRun.siteId === input.siteId;
  const maximumDelayAt = new Date(Date.parse(input.generatedAt) + maximumDelayMinutes * 60_000).toISOString();
  const delayBlocked = input.expectedDelayMinutes > maximumDelayMinutes;
  const status: QueueRecommendation["status"] = !validationPassed
    ? "blocked-site-validation"
    : delayBlocked
      ? "blocked-maximum-delay"
      : "recommendation-ready";
  const base = {
    recommendationId: input.recommendationId,
    siteId: input.siteId,
    studyReferenceHash: input.studyReferenceHash,
    originalQueuePosition: input.originalQueuePosition,
    recommendedQueuePosition: status === "recommendation-ready"
      ? input.recommendedQueuePosition
      : input.originalQueuePosition,
    priorityClass: input.priorityClass,
    reasonCodes: imagingCanonical([
      ...input.reasonCodes,
      ...(!validationPassed ? ["SITE_VALIDATION_REQUIRED"] : []),
      ...(delayBlocked ? ["MAXIMUM_DELAY_SAFEGUARD"] : [])
    ]),
    evidenceReferences: imagingCanonical(input.evidenceReferences),
    generatedAt: input.generatedAt,
    expiresAt: input.expiresAt,
    maximumDelayAt,
    siteValidationRunId: input.siteValidationRun?.validationRunId ?? null,
    status,
    humanReviewRequired: true as const,
    liveQueueMutationAllowed: false as const
  };
  return { ...base, auditHash: createClinicalEvidenceHash({ type: "imaging-queue-recommendation", base }) };
}

export function recordImagingOverride(
  input: Omit<ImagingOverride, "radiologistRetainsAuthority" | "auditHash">
): ImagingOverride {
  if (
    !imagingSha256Pattern.test(input.radiologistIdentityHash) ||
    !isoTimestamp(input.occurredAt) ||
    input.finalQueuePosition < 1
  ) {
    throw new Error("Imaging override requires named radiologist attribution and valid queue metadata");
  }
  const base = { ...input, radiologistRetainsAuthority: true as const };
  return { ...base, auditHash: createClinicalEvidenceHash({ type: "imaging-override", base }) };
}

export function buildImagingDriftMonitor(
  input: Omit<DriftMonitor, "driftStatus" | "queueRecommendationsPaused" | "monitorHash"> & {
    maximumCalibrationDelta: number;
    maximumOverrideRate: number;
    maximumFalseNegativeRate: number;
  }
): DriftMonitor {
  const calibrationDelta = input.observedCalibrationError - input.baselineCalibrationError;
  const blocked =
    calibrationDelta > input.maximumCalibrationDelta ||
    input.observedFalseNegativeRate > input.maximumFalseNegativeRate;
  const review = !blocked && input.observedOverrideRate > input.maximumOverrideRate;
  const base = {
    monitorId: input.monitorId,
    modelCardId: input.modelCardId,
    siteId: input.siteId,
    windowStartsAt: input.windowStartsAt,
    windowEndsAt: input.windowEndsAt,
    observedCalibrationError: input.observedCalibrationError,
    observedOverrideRate: input.observedOverrideRate,
    observedFalseNegativeRate: input.observedFalseNegativeRate,
    baselineCalibrationError: input.baselineCalibrationError,
    driftStatus: blocked ? ("blocked" as const) : review ? ("review" as const) : ("stable" as const),
    queueRecommendationsPaused: blocked
  };
  return { ...base, monitorHash: createClinicalEvidenceHash({ type: "imaging-drift-monitor", base }) };
}

export function buildImagingOutcomeLedger(
  input: Omit<ImagingOutcomeLedger, "clinicalClaimsAllowed" | "ledgerHash">
): ImagingOutcomeLedger {
  const rates = [
    input.sensitivity,
    input.specificity,
    input.calibrationError,
    input.falseNegativeRate,
    input.alertAcceptanceRate,
    ...input.subgroupResults.flatMap((result) => [result.sensitivity, result.specificity])
  ];
  if (rates.some((rate) => !imagingUnitInterval(rate)) || !isoTimestamp(input.measuredAt)) {
    throw new Error("Imaging outcome ledger metrics are invalid");
  }
  const base = {
    ...input,
    subgroupResults: [...input.subgroupResults].sort((left, right) => left.subgroupId.localeCompare(right.subgroupId)),
    clinicalClaimsAllowed: false as const
  };
  return { ...base, ledgerHash: createClinicalEvidenceHash({ type: "imaging-outcome-ledger", base }) };
}

export function isExternalImagingAdapterEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_EXTERNAL_IMAGING_ADAPTERS_ENABLED?.toLowerCase() === "true";
}

export function isImagingQueueRecommendationEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_IMAGING_QUEUE_RECOMMENDATIONS_ENABLED?.toLowerCase() === "true";
}

export const syntheticImagingWorkflowFixture: ImagingWorkflowInput = {
  tenantId: "synthetic-tenant",
  siteId: "synthetic-imaging-site-a",
  deviceId: "synthetic-device-us-001",
  actorId: "synthetic-imaging-operator",
  studyUid: "2.25.123456789012345678901234567890123456",
  accessionReference: "synthetic-accession-001",
  subjectReference: "synthetic-subject-001",
  modality: "US",
  sourceType: "DICOMweb",
  series: [
    {
      seriesUid: "2.25.1001",
      description: "long-axis",
      bodyPart: "synthetic-cardiac",
      instanceCount: 24,
      acquiredAt: "2026-07-17T12:00:00.000Z",
      transferSyntaxUid: "1.2.840.10008.1.2.1"
    },
    {
      seriesUid: "2.25.1002",
      description: "short-axis",
      bodyPart: "synthetic-cardiac",
      instanceCount: 20,
      acquiredAt: "2026-07-17T12:02:00.000Z",
      transferSyntaxUid: "1.2.840.10008.1.2.1"
    }
  ],
  measurements: [
    {
      measurementId: "synthetic-measurement-001",
      code: "synthetic-diameter",
      value: 3.2,
      unit: "cm",
      sourceSeriesUid: "2.25.1001",
      method: "synthetic-fixture"
    }
  ],
  deviceGeneratedFindingRefs: [],
  protocol: {
    protocolId: "synthetic-cardiac-us-protocol-v1",
    requiredSeriesDescriptions: ["long-axis", "short-axis"],
    requiredMeasurementCodes: ["synthetic-diameter"],
    allowedUnitsByCode: { "synthetic-diameter": ["cm", "mm"] },
    minimumInstancesBySeries: { "long-axis": 20, "short-axis": 20 }
  },
  requestedAction: "prepare-fhir-handoff",
  syntheticOnly: true,
  noPhi: true,
  includesPixelData: false
};

export function getImagingWorkflowIntelligenceSummary() {
  const sample = evaluateImagingWorkflow(syntheticImagingWorkflowFixture, "2026-07-17T12:05:00.000Z");
  return {
    service: "scrimed-imaging-workflow-intelligence",
    version: imagingWorkflowIntelligenceVersion,
    status: "synthetic-metadata-adapter-ready",
    externalAdaptersEnabled: isExternalImagingAdapterEnabled(),
    queueRecommendationsEnabled: isImagingQueueRecommendationEnabled(),
    supportedInputs: ["DICOM metadata", "DICOMweb metadata", "PACS/RIS preview", "VNA preview"],
    fhirOutputs: ["ImagingStudy", "DiagnosticReport preliminary", "Observation preliminary", "Provenance"],
    modelAdmission: "offline-and-shadow-only-with-site-validation",
    queueAuthority: "recommendation-only-radiologist-override",
    sample,
    boundary: imagingWorkflowIntelligenceBoundary
  };
}
