import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type {
  ClinicalConceptMapping,
  ClinicalExtractionReleaseGateInput,
  ClinicalExtractionReleaseGateResult,
  ClinicalSignalCompression,
  ContextAccessPolicy,
  ContextArtifact,
  ContextDataClassification,
  ContextFact,
  ContextSourceKind,
  ContextViewGrant,
  CoreferenceRelation,
  MedicationProblemRelation,
  TemporalEvent
} from "./types";

export const p33ContextFabricVersion = "scrimed-p33-context-fabric-v1-2026-08-13";
export const p33ClinicalExtractionPolicyVersion =
  "scrimed-p33-clinical-extraction-release-v1-2026-08-13";

export const p33ContextFabricBoundary =
  "The p.33 Context Fabric accepts public, synthetic, or separately approved de-identified inputs and creates purpose-limited decision-support views. It does not authorize live PHI, diagnosis, treatment, prescribing, triage, payer submission, EHR writeback, final record inclusion, or replacement of the source record.";

const boundedId = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const sha256 = /^[0-9a-f]{64}$/i;

function assertId(value: string, label: string) {
  if (!boundedId.test(value)) throw new Error(`${label} must be a bounded identifier`);
}

function assertHash(value: string, label: string) {
  if (!sha256.test(value)) throw new Error(`${label} must be a SHA-256 fingerprint`);
}

function assertIso(value: string, label: string) {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an ISO timestamp`);
}

function assertConfidence(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be in [0, 1]`);
  }
}

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

export function scalarOffsetToUtf16(text: string, scalarOffset: number) {
  const scalars = Array.from(text);
  if (!Number.isInteger(scalarOffset) || scalarOffset < 0 || scalarOffset > scalars.length) {
    throw new Error("Unicode scalar offset is outside the source text");
  }
  return scalars.slice(0, scalarOffset).join("").length;
}

export function utf16OffsetToScalar(text: string, utf16Offset: number) {
  if (!Number.isInteger(utf16Offset) || utf16Offset < 0 || utf16Offset > text.length) {
    throw new Error("UTF-16 offset is outside the source text");
  }
  const prefix = text.slice(0, utf16Offset);
  if (prefix.endsWith("\ud800") || /[\ud800-\udbff]$/.test(prefix)) {
    throw new Error("UTF-16 offset cannot split a surrogate pair");
  }
  return Array.from(prefix).length;
}

export type ContextIngestionAnnotation = {
  factId: string;
  sectionId: string;
  startScalar: number;
  endScalar: number;
  statement: string;
  conceptIds: string[];
  significance: ContextFact["significance"];
  confidence: number;
  uncertainty: string[];
  contradictionGroupId: string | null;
};

export type ContextIngestionDocument = {
  sourceId: string;
  kind: ContextSourceKind;
  noteType: string;
  content: string;
  effectiveAt: string;
  version: string;
  annotations: ContextIngestionAnnotation[];
};

export type ContextArtifactInput = {
  artifactId: string;
  tenantId: string;
  subjectReference: string;
  inputClassification: Exclude<ContextDataClassification, "phi-prohibited">;
  deidentificationState: ContextArtifact["deidentificationState"];
  documents: ContextIngestionDocument[];
  timeline: TemporalEvent[];
  coreferences: CoreferenceRelation[];
  conceptMappings: ClinicalConceptMapping[];
  medicationProblemRelations: MedicationProblemRelation[];
  accessPolicy: ContextAccessPolicy;
  missingInformation: string[];
  expiresAt: string;
  version: string;
};

function normalizeStatement(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function buildContextArtifact(input: ContextArtifactInput): ContextArtifact {
  assertId(input.artifactId, "context artifact id");
  assertId(input.tenantId, "context tenant id");
  assertIso(input.expiresAt, "context artifact expiration");
  if (!input.documents.length) throw new Error("Context artifact requires at least one source document");
  if (input.accessPolicy.tenantId !== input.tenantId) {
    throw new Error("Context access policy tenant must match the artifact tenant");
  }
  if (input.inputClassification === "public" && input.deidentificationState !== "synthetic") {
    throw new Error("Public context artifacts must use the synthetic de-identification state");
  }
  if (input.accessPolicy.minimumNecessary !== true || input.accessPolicy.revocable !== true) {
    throw new Error("Context access must be minimum-necessary and revocable");
  }
  if (["missing", "revoked"].includes(input.accessPolicy.consentState)) {
    throw new Error("Missing or revoked consent cannot create an authorized context artifact");
  }
  assertIso(input.accessPolicy.expiresAt, "context access expiration");

  const sourceDocuments: ContextArtifact["sourceDocuments"] = [];
  const sourceSpans: ContextArtifact["sourceSpans"] = [];
  const candidateFacts: ContextFact[] = [];

  for (const document of input.documents) {
    assertId(document.sourceId, "context source id");
    assertIso(document.effectiveAt, "context source effective time");
    if (!document.content.trim() || !document.annotations.length) {
      throw new Error("Context documents require content and span-grounded annotations");
    }
    const contentHash = createClinicalEvidenceHash({
      sourceId: document.sourceId,
      version: document.version,
      content: document.content
    });
    sourceDocuments.push({
      sourceId: document.sourceId,
      kind: document.kind,
      noteType: document.noteType,
      contentHash,
      effectiveAt: document.effectiveAt,
      version: document.version
    });

    for (const annotation of document.annotations) {
      assertId(annotation.factId, "context fact id");
      assertConfidence(annotation.confidence, "context fact confidence");
      const startUtf16 = scalarOffsetToUtf16(document.content, annotation.startScalar);
      const endUtf16 = scalarOffsetToUtf16(document.content, annotation.endScalar);
      const quotedText = document.content.slice(startUtf16, endUtf16);
      if (quotedText !== annotation.statement) {
        throw new Error(`Source span for ${annotation.factId} does not match the source document`);
      }
      const spanId = `span-${createClinicalEvidenceHash({
        sourceId: document.sourceId,
        startUtf16,
        endUtf16,
        quotedText
      }).slice(0, 24)}`;
      sourceSpans.push({
        spanId,
        sourceId: document.sourceId,
        sourceHash: contentHash,
        startScalar: annotation.startScalar,
        endScalar: annotation.endScalar,
        startUtf16,
        endUtf16,
        quotedText,
        sectionId: annotation.sectionId,
        page: null
      });
      candidateFacts.push({
        factId: annotation.factId,
        sectionId: annotation.sectionId,
        noteType: document.kind,
        statement: annotation.statement,
        normalizedStatement: normalizeStatement(annotation.statement),
        conceptIds: canonical(annotation.conceptIds),
        sourceSpanIds: [spanId],
        significance: annotation.significance,
        confidence: annotation.confidence,
        uncertainty: canonical(annotation.uncertainty),
        contradictionGroupId: annotation.contradictionGroupId
      });
    }
  }

  const deduplicated = new Map<string, ContextFact>();
  for (const fact of candidateFacts) {
    const identity = createClinicalEvidenceHash({
      statement: fact.normalizedStatement,
      concepts: fact.conceptIds
    });
    const current = deduplicated.get(identity);
    if (!current) {
      deduplicated.set(identity, fact);
      continue;
    }
    deduplicated.set(identity, {
      ...current,
      sourceSpanIds: canonical([...current.sourceSpanIds, ...fact.sourceSpanIds]),
      confidence: Math.max(current.confidence, fact.confidence),
      uncertainty: canonical([...current.uncertainty, ...fact.uncertainty])
    });
  }
  const facts = [...deduplicated.values()].sort((left, right) =>
    left.factId.localeCompare(right.factId)
  );
  const factIds = new Set(facts.map((fact) => fact.factId));
  const spanIds = new Set(sourceSpans.map((span) => span.spanId));

  for (const mapping of input.conceptMappings) {
    if (!factIds.has(mapping.factId)) throw new Error("Concept mapping references an unknown fact");
    assertConfidence(mapping.confidence, "terminology mapping confidence");
    if (mapping.licenseState === "unavailable") {
      throw new Error("Unavailable terminology cannot be represented as an authorized mapping");
    }
  }
  for (const relation of input.medicationProblemRelations) {
    if (!factIds.has(relation.medicationFactId) || !factIds.has(relation.problemFactId)) {
      throw new Error("Medication/problem relationship references an unknown fact");
    }
    if (!relation.evidenceSpanIds.every((spanId) => spanIds.has(spanId))) {
      throw new Error("Medication/problem relationship requires source-span evidence");
    }
  }
  for (const relation of input.coreferences) {
    assertConfidence(relation.confidence, "coreference confidence");
    if (!spanIds.has(relation.sourceSpanId)) {
      throw new Error("Coreference relationship references an unknown source span");
    }
  }
  for (const event of input.timeline) {
    assertIso(event.occurredAt, "temporal event time");
    if (!event.sourceSpanIds.every((spanId) => spanIds.has(spanId))) {
      throw new Error("Temporal event requires known source spans");
    }
  }

  const contradictions = canonical(
    facts
      .map((fact) => fact.contradictionGroupId)
      .filter((value): value is string => Boolean(value))
  );
  const payload = {
    artifactId: input.artifactId,
    schemaVersion: p33ContextFabricVersion,
    tenantId: input.tenantId,
    subjectReferenceHash: createClinicalEvidenceHash({
      tenantId: input.tenantId,
      subjectReference: input.subjectReference
    }),
    inputClassification: input.inputClassification,
    deidentificationState: input.deidentificationState,
    sourceDocuments: sourceDocuments.sort((left, right) => left.sourceId.localeCompare(right.sourceId)),
    sourceSpans: sourceSpans.sort((left, right) => left.spanId.localeCompare(right.spanId)),
    facts,
    timeline: [...input.timeline].sort((left, right) =>
      left.occurredAt.localeCompare(right.occurredAt) || left.eventId.localeCompare(right.eventId)
    ),
    coreferences: [...input.coreferences].sort((left, right) =>
      left.relationId.localeCompare(right.relationId)
    ),
    conceptMappings: [...input.conceptMappings].sort((left, right) =>
      left.mappingId.localeCompare(right.mappingId)
    ),
    medicationProblemRelations: [...input.medicationProblemRelations].sort((left, right) =>
      left.relationId.localeCompare(right.relationId)
    ),
    accessPolicy: {
      ...input.accessPolicy,
      authorizedAgentIds: canonical(input.accessPolicy.authorizedAgentIds),
      allowedPurposes: canonical(input.accessPolicy.allowedPurposes),
      allowedSections: canonical(input.accessPolicy.allowedSections)
    },
    contradictions,
    missingInformation: canonical(input.missingInformation),
    expiresAt: input.expiresAt,
    version: input.version,
    containsRawPhi: false as const,
    deterministicInvalidationKey: createClinicalEvidenceHash({
      sources: sourceDocuments.map((source) => source.contentHash),
      policy: input.accessPolicy.policyVersion,
      version: input.version
    })
  };
  return {
    ...payload,
    integrityHash: createClinicalEvidenceHash({ type: "p33-context-artifact", payload })
  };
}

export function authorizeContextView(
  artifact: ContextArtifact,
  grant: ContextViewGrant,
  evaluatedAt: string
) {
  assertIso(evaluatedAt, "context view evaluation time");
  const reasonCodes: string[] = [];
  if (grant.tenantId !== artifact.tenantId) reasonCodes.push("CROSS_TENANT_CONTEXT_ACCESS_BLOCKED");
  if (!artifact.accessPolicy.authorizedAgentIds.includes(grant.agentId)) {
    reasonCodes.push("AGENT_NOT_AUTHORIZED_FOR_CONTEXT");
  }
  if (!artifact.accessPolicy.allowedPurposes.includes(grant.purpose)) {
    reasonCodes.push("PURPOSE_NOT_AUTHORIZED");
  }
  if (grant.revokedAt) reasonCodes.push("CONTEXT_GRANT_REVOKED");
  if (Date.parse(grant.expiresAt) <= Date.parse(evaluatedAt)) {
    reasonCodes.push("CONTEXT_GRANT_EXPIRED");
  }
  if (Date.parse(artifact.expiresAt) <= Date.parse(evaluatedAt)) {
    reasonCodes.push("CONTEXT_ARTIFACT_EXPIRED");
  }
  if (grant.requestedSections.some((section) => !artifact.accessPolicy.allowedSections.includes(section))) {
    reasonCodes.push("SECTION_EXCEEDS_MINIMUM_NECESSARY_SCOPE");
  }
  const decision = reasonCodes.length ? "BLOCK" as const : "ALLOW" as const;
  const allowedSections = new Set(grant.requestedSections);
  return {
    decision,
    reasonCodes: canonical(reasonCodes),
    view: decision === "ALLOW"
      ? {
          ...artifact,
          facts: artifact.facts.filter((fact) => allowedSections.has(fact.sectionId)),
          sourceSpans: artifact.sourceSpans.filter((span) => allowedSections.has(span.sectionId))
        }
      : null,
    auditHash: createClinicalEvidenceHash({
      type: "p33-context-view-decision",
      artifactHash: artifact.integrityHash,
      grant,
      evaluatedAt,
      reasonCodes
    })
  };
}

export function compressClinicalSignals(
  artifact: ContextArtifact,
  input: { compressionId: string; purpose: string; maximumFacts: number }
): ClinicalSignalCompression {
  assertId(input.compressionId, "clinical compression id");
  if (!Number.isInteger(input.maximumFacts) || input.maximumFacts < 1 || input.maximumFacts > 50) {
    throw new Error("Clinical signal compression requires a fact budget from 1 to 50");
  }
  if (!artifact.accessPolicy.allowedPurposes.includes(input.purpose)) {
    throw new Error("Clinical signal compression purpose is not authorized by the context artifact");
  }
  const weight: Record<ContextFact["significance"], number> = {
    "critical-review": 3,
    important: 2,
    routine: 1
  };
  const ranked = [...artifact.facts].sort((left, right) =>
    weight[right.significance] - weight[left.significance] ||
    right.confidence - left.confidence ||
    left.factId.localeCompare(right.factId)
  );
  const summaryFacts = ranked.slice(0, input.maximumFacts);
  const includedSections = new Set(summaryFacts.map((fact) => fact.sectionId));
  const allSections = canonical(artifact.facts.map((fact) => fact.sectionId));
  const omittedSectionIds = allSections.filter((section) => !includedSections.has(section));
  const sourceSpanIds = canonical(summaryFacts.flatMap((fact) => fact.sourceSpanIds));
  const medicationDoseWarnings = summaryFacts
    .filter((fact) => fact.conceptIds.some((concept) => /medication|rxnorm/i.test(concept)))
    .filter((fact) => !/\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units?)\b/i.test(fact.statement))
    .map((fact) => `${fact.factId}: medication statement lacks an explicit dose in the cited span`);
  const payload = {
    compressionId: input.compressionId,
    contextArtifactHash: artifact.integrityHash,
    tenantId: artifact.tenantId,
    purpose: input.purpose,
    summaryFacts,
    timeline: artifact.timeline.filter((event) =>
      event.sourceSpanIds.some((spanId) => sourceSpanIds.includes(spanId))
    ),
    medicationDoseWarnings,
    contradictions: artifact.contradictions,
    missingInformation: artifact.missingInformation,
    omittedSectionIds,
    sourceSpanIds,
    compressionRatio: artifact.facts.length === 0 ? 1 : summaryFacts.length / artifact.facts.length,
    decisionSupportOnly: true as const,
    replacesSourceRecord: false as const,
    humanReviewRequired: true as const
  };
  return {
    ...payload,
    integrityHash: createClinicalEvidenceHash({ type: "p33-clinical-signal-compression", payload })
  };
}

export function evaluateClinicalExtractionReleaseGate(
  input: ClinicalExtractionReleaseGateInput
): ClinicalExtractionReleaseGateResult {
  assertId(input.extractionId, "clinical extraction id");
  assertHash(input.contextArtifactHash, "clinical extraction context artifact");
  const reasonCodes: string[] = [];
  if (!input.provenanceComplete) reasonCodes.push("PROVENANCE_INCOMPLETE");
  if (!input.evidenceComplete) reasonCodes.push("EVIDENCE_INCOMPLETE");
  if (!input.policyVersion?.trim()) reasonCodes.push("POLICY_VERSION_REQUIRED");
  if (input.terminologyAuthorization !== "authorized") {
    reasonCodes.push("TERMINOLOGY_AUTHORIZATION_REQUIRED");
  }
  if (!input.safetyChecksPassed) reasonCodes.push("SAFETY_CHECKS_FAILED");
  if (!input.qualifiedReviewerIdHash) reasonCodes.push("QUALIFIED_REVIEWER_REQUIRED");
  if (input.qualifiedReviewerIdHash) assertHash(input.qualifiedReviewerIdHash, "qualified reviewer");
  if (input.reviewDecision !== "approved") reasonCodes.push("QUALIFIED_REVIEW_NOT_APPROVED");
  if (!input.contradictionsResolved) reasonCodes.push("CONTRADICTIONS_UNRESOLVED");
  if (input.containsUnsupportedClinicalClaim) reasonCodes.push("UNSUPPORTED_CLINICAL_CLAIM");

  const hardReasons = new Set([
    "PROVENANCE_INCOMPLETE",
    "POLICY_VERSION_REQUIRED",
    "SAFETY_CHECKS_FAILED",
    "UNSUPPORTED_CLINICAL_CLAIM"
  ]);
  const decision = reasonCodes.some((reason) => hardReasons.has(reason))
    ? "BLOCK" as const
    : reasonCodes.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const payload = {
    decision,
    status: decision === "ALLOW"
      ? "release-ready-for-declared-synthetic-purpose" as const
      : decision === "REQUIRE_HUMAN"
        ? "review-required" as const
        : "blocked" as const,
    reasonCodes: canonical(reasonCodes),
    exportAuthority: decision === "ALLOW" ? "synthetic-preview-only" as const : "none" as const,
    clinicalRecordAuthority: false as const,
    payerSubmissionAuthority: false as const
  };
  return {
    ...payload,
    integrityHash: createClinicalEvidenceHash({
      type: "p33-clinical-extraction-release-gate",
      policyVersion: p33ClinicalExtractionPolicyVersion,
      input,
      payload
    })
  };
}

type ExportGate = Pick<ClinicalExtractionReleaseGateResult, "decision" | "exportAuthority">;

function requireSyntheticExport(gate: ExportGate) {
  if (gate.decision !== "ALLOW" || gate.exportAuthority !== "synthetic-preview-only") {
    throw new Error("Clinical context export requires a passing synthetic-preview release gate");
  }
}

export function createFhirContextPreview(artifact: ContextArtifact, gate: ExportGate) {
  requireSyntheticExport(gate);
  return {
    resourceType: "Bundle",
    type: "collection",
    identifier: { system: "urn:scrimed:synthetic-context", value: artifact.artifactId },
    entry: artifact.facts.map((fact) => ({
      fullUrl: `urn:uuid:${fact.factId}`,
      resource: {
        resourceType: "Observation",
        id: fact.factId,
        status: "preliminary",
        code: { text: fact.conceptIds.join(", ") || "Unmapped synthetic fact" },
        valueString: fact.statement,
        note: [{ text: "Synthetic decision-support preview; qualified human review required." }]
      }
    })),
    meta: { tag: [{ system: "urn:scrimed:boundary", code: "synthetic-no-phi" }] }
  };
}

export function createOmopLoadPreview(artifact: ContextArtifact, gate: ExportGate) {
  requireSyntheticExport(gate);
  return artifact.facts.map((fact, index) => ({
    synthetic_row_id: index + 1,
    source_fact_id: fact.factId,
    concept_source_value: fact.conceptIds[0] ?? "unmapped",
    value_source_value: fact.statement,
    provenance_span_ids: fact.sourceSpanIds,
    review_state: "qualified-human-required"
  }));
}

export function createOpenEhrExportPreview(artifact: ContextArtifact, gate: ExportGate) {
  requireSyntheticExport(gate);
  return {
    _type: "COMPOSITION",
    archetype_node_id: "openEHR-EHR-COMPOSITION.report.v1",
    uid: { value: artifact.artifactId },
    name: { value: "SCRIMED synthetic context preview" },
    content: artifact.facts.map((fact) => ({
      _type: "OBSERVATION",
      name: { value: fact.conceptIds[0] ?? "Unmapped synthetic fact" },
      data: { items: [{ value: fact.statement, source_span_ids: fact.sourceSpanIds }] }
    }))
  };
}

export function createTypedMcpContextResource(artifact: ContextArtifact, gate: ExportGate) {
  requireSyntheticExport(gate);
  return {
    protocolVersion: "scrimed-mcp-context-v1",
    uri: `scrimed://synthetic-context/${artifact.artifactId}`,
    mimeType: "application/vnd.scrimed.context+json",
    tenantId: artifact.tenantId,
    contentHash: artifact.integrityHash,
    allowedOperations: ["read-context", "read-provenance"],
    writeOperationsAllowed: false,
    externalNetworkAllowed: false,
    decisionSupportOnly: true
  };
}

export function createOfflineTerminologySnapshot(input: {
  snapshotId: string;
  system: ClinicalConceptMapping["canonicalSystem"];
  version: string;
  licenseState: ClinicalConceptMapping["licenseState"];
  contentHash: string | null;
}) {
  assertId(input.snapshotId, "terminology snapshot id");
  if (input.contentHash) assertHash(input.contentHash, "terminology snapshot content");
  const available = input.licenseState !== "unavailable" && Boolean(input.contentHash);
  return {
    ...input,
    available,
    callerSuppliedRequired: input.licenseState === "caller-supplied-restricted",
    networkRetrievalAllowed: false,
    activationDecision: available ? "review-required" : "blocked",
    snapshotHash: createClinicalEvidenceHash({ type: "p33-terminology-snapshot", input })
  };
}

function scalarIndexOf(text: string, fragment: string) {
  const utf16 = text.indexOf(fragment);
  if (utf16 < 0) throw new Error(`Synthetic fixture fragment not found: ${fragment}`);
  return utf16OffsetToScalar(text, utf16);
}

export function createSyntheticContextFixture() {
  const discharge = [
    "Discharge Summary",
    "Problem: Hypertension remains under outpatient review.",
    "Medication: Lisinopril 10 mg daily is listed in the synthetic discharge record.",
    "Follow-up: Primary care review is requested within 14 days.",
    "Missing: Home blood-pressure readings were not supplied."
  ].join("\n");
  const radiology = [
    "Radiology Report",
    "Finding: No acute synthetic imaging finding is recorded.",
    "Recommendation: Correlate with the complete synthetic record and qualified clinician review."
  ].join("\n");

  const dischargeFacts = [
    ["fact-hypertension", "problems", "Hypertension remains under outpatient review.", ["problem:hypertension"], "important"],
    ["fact-lisinopril", "medications", "Lisinopril 10 mg daily is listed in the synthetic discharge record.", ["medication:lisinopril", "rxnorm:synthetic"], "critical-review"],
    ["fact-followup", "follow-up", "Primary care review is requested within 14 days.", ["workflow:follow-up"], "important"],
    ["fact-missing-bp", "missing-information", "Home blood-pressure readings were not supplied.", ["observation:blood-pressure"], "critical-review"]
  ] as const;
  const radiologyFacts = [
    ["fact-radiology-finding", "imaging", "No acute synthetic imaging finding is recorded.", ["imaging:synthetic-finding"], "important"],
    ["fact-radiology-review", "imaging", "Correlate with the complete synthetic record and qualified clinician review.", ["workflow:clinical-review"], "critical-review"]
  ] as const;

  const makeAnnotations = (
    content: string,
    values: ReadonlyArray<readonly [string, string, string, readonly string[], ContextFact["significance"]]>
  ): ContextIngestionAnnotation[] => values.map(([factId, sectionId, statement, conceptIds, significance]) => {
    const startScalar = scalarIndexOf(content, statement);
    return {
      factId,
      sectionId,
      startScalar,
      endScalar: startScalar + Array.from(statement).length,
      statement,
      conceptIds: [...conceptIds],
      significance,
      confidence: 0.96,
      uncertainty: factId === "fact-radiology-finding" ? ["synthetic fixture only"] : [],
      contradictionGroupId: null
    };
  });

  const draftInput: ContextArtifactInput = {
    artifactId: "ctx-synthetic-discharge-001",
    tenantId: "synthetic-tenant",
    subjectReference: "synthetic-subject-001",
    inputClassification: "synthetic-no-phi",
    deidentificationState: "synthetic",
    documents: [
      {
        sourceId: "source-discharge-001",
        kind: "discharge-summary",
        noteType: "synthetic-discharge-summary",
        content: discharge,
        effectiveAt: "2026-08-01T12:00:00.000Z",
        version: "1.0.0",
        annotations: makeAnnotations(discharge, dischargeFacts)
      },
      {
        sourceId: "source-radiology-001",
        kind: "radiology-report",
        noteType: "synthetic-radiology-report",
        content: radiology,
        effectiveAt: "2026-08-01T11:00:00.000Z",
        version: "1.0.0",
        annotations: makeAnnotations(radiology, radiologyFacts)
      }
    ],
    timeline: [],
    coreferences: [],
    conceptMappings: [],
    medicationProblemRelations: [],
    accessPolicy: {
      policyVersion: "scrimed-context-access-v1",
      tenantId: "synthetic-tenant",
      authorizedAgentIds: ["perfect-chart", "care-explain", "sanar", "docutwin", "agent-commander"],
      allowedPurposes: ["synthetic-clinical-review", "synthetic-patient-education"],
      allowedSections: ["problems", "medications", "follow-up", "missing-information", "imaging"],
      minimumNecessary: true,
      consentState: "not-required-synthetic",
      expiresAt: "2027-08-01T00:00:00.000Z",
      revocable: true
    },
    missingInformation: ["Home blood-pressure readings", "Independent clinician confirmation"],
    expiresAt: "2027-08-01T00:00:00.000Z",
    version: "1.0.0"
  };

  const provisional = buildContextArtifact(draftInput);
  const spanByFact = new Map(
    provisional.facts.map((fact) => [fact.factId, fact.sourceSpanIds[0]])
  );
  const enriched: ContextArtifactInput = {
    ...draftInput,
    timeline: [
      {
        eventId: "event-radiology",
        occurredAt: "2026-08-01T11:00:00.000Z",
        precision: "instant",
        conceptIds: ["imaging:synthetic-finding"],
        sourceSpanIds: [spanByFact.get("fact-radiology-finding")!],
        uncertainty: ["synthetic fixture only"]
      },
      {
        eventId: "event-discharge",
        occurredAt: "2026-08-01T12:00:00.000Z",
        precision: "instant",
        conceptIds: ["workflow:discharge"],
        sourceSpanIds: [spanByFact.get("fact-followup")!],
        uncertainty: []
      }
    ],
    coreferences: [
      {
        relationId: "coref-complete-record",
        mention: "complete synthetic record",
        resolvedEntityId: "ctx-synthetic-discharge-001",
        confidence: 0.99,
        sourceSpanId: spanByFact.get("fact-radiology-review")!
      }
    ],
    conceptMappings: [
      {
        mappingId: "map-hypertension",
        factId: "fact-hypertension",
        localLabel: "Hypertension",
        canonicalSystem: "SNOMED_CT",
        canonicalCode: "caller-supplied-synthetic-code",
        display: "Synthetic terminology mapping",
        confidence: 0.95,
        terminologySnapshotId: "terminology-synthetic-v1",
        licenseState: "caller-supplied-restricted"
      }
    ],
    medicationProblemRelations: [
      {
        relationId: "medication-problem-lisinopril-hypertension",
        medicationFactId: "fact-lisinopril",
        problemFactId: "fact-hypertension",
        relation: "treats",
        confidence: 0.94,
        evidenceSpanIds: [
          spanByFact.get("fact-lisinopril")!,
          spanByFact.get("fact-hypertension")!
        ]
      }
    ]
  };
  return buildContextArtifact(enriched);
}

export function getP33ContextFabricSummary() {
  const artifact = createSyntheticContextFixture();
  const compression = compressClinicalSignals(artifact, {
    compressionId: "compression-synthetic-discharge-001",
    purpose: "synthetic-clinical-review",
    maximumFacts: 4
  });
  const blockedRelease = evaluateClinicalExtractionReleaseGate({
    extractionId: "extraction-synthetic-discharge-001",
    contextArtifactHash: artifact.integrityHash,
    provenanceComplete: true,
    evidenceComplete: true,
    policyVersion: p33ClinicalExtractionPolicyVersion,
    terminologyAuthorization: "caller-supplied-required",
    safetyChecksPassed: true,
    qualifiedReviewerIdHash: null,
    reviewDecision: "pending",
    contradictionsResolved: true,
    containsUnsupportedClinicalClaim: false
  });
  const terminology = createOfflineTerminologySnapshot({
    snapshotId: "terminology-synthetic-v1",
    system: "SNOMED_CT",
    version: "caller-supplied",
    licenseState: "caller-supplied-restricted",
    contentHash: createClinicalEvidenceHash("synthetic-terminology-fixture")
  });
  return {
    version: p33ContextFabricVersion,
    status: "synthetic-context-fabric-integrated",
    artifact,
    compression,
    releaseGate: blockedRelease,
    terminology,
    adapterContracts: ["FHIR-preview", "OMOP-load-preview", "OpenEHR-preview", "typed-MCP-read-only"],
    downstreamAgents: artifact.accessPolicy.authorizedAgentIds,
    boundary: p33ContextFabricBoundary
  };
}
