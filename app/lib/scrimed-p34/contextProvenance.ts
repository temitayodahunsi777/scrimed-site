import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import {
  buildContextArtifact,
  type ContextArtifactInput
} from "../scrimed-p33/contextFabric";
import type {
  ContextHierarchyAnnotation,
  GroundedClaim,
  GroundedClaimValidation,
  HealthcareContextEnvelope
} from "./types";

export const p34ContextProvenanceVersion =
  "scrimed-p34-context-provenance-v1-2026-08-15";

export const p34ContextProvenanceBoundary =
  "SCRIMED p.34 context provenance extends the p.33 Context Fabric for synthetic and approved de-identified evaluation. It preserves hierarchy, citations, conflicts, freshness, and FHIR-compatible provenance previews; it does not authorize raw PHI, diagnosis, treatment, payer submission, EHR writeback, external provider calls, or production clinical use.";

export type HealthcareContextEnvelopeInput = {
  envelopeId: string;
  purpose: string;
  artifactInput: ContextArtifactInput;
  hierarchy: ContextHierarchyAnnotation[];
  evaluatedAt: string;
  staleAfterDays: number;
};

const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function orderedUnique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function assertId(value: string, label: string) {
  if (!idPattern.test(value)) throw new Error(`${label} must be a bounded identifier`);
}

function assertIso(value: string, label: string) {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an ISO timestamp`);
}

function estimateTokens(value: string) {
  return Math.max(1, Math.ceil([...value].length / 4));
}

function freshness(effectiveAt: string, expiresAt: string, evaluatedAt: string, staleAfterDays: number) {
  if (Date.parse(expiresAt) <= Date.parse(evaluatedAt)) return "expired" as const;
  const ageDays = (Date.parse(evaluatedAt) - Date.parse(effectiveAt)) / 86_400_000;
  return ageDays > staleAfterDays ? "stale" as const : "current" as const;
}

export function buildHealthcareContextEnvelope(
  input: HealthcareContextEnvelopeInput
): HealthcareContextEnvelope {
  assertId(input.envelopeId, "context envelope id");
  assertIso(input.evaluatedAt, "context evaluation time");
  if (!Number.isFinite(input.staleAfterDays) || input.staleAfterDays < 1) {
    throw new Error("Context freshness window must be at least one day");
  }
  if (!input.purpose.trim()) throw new Error("Context purpose is required");

  const artifact = buildContextArtifact(input.artifactInput);
  const annotationByFact = new Map(input.hierarchy.map((annotation) => [annotation.factId, annotation]));
  const sources = new Map(artifact.sourceDocuments.map((source) => [source.sourceId, source]));

  const chunks = artifact.facts.map((fact) => {
    const annotation = annotationByFact.get(fact.factId);
    if (!annotation || annotation.headingPath.length === 0) {
      throw new Error(`Context fact ${fact.factId} requires a document heading path`);
    }
    const sourceSpan = artifact.sourceSpans.find((span) => fact.sourceSpanIds.includes(span.spanId));
    if (!sourceSpan) throw new Error(`Context fact ${fact.factId} requires a source span`);
    const source = sources.get(sourceSpan.sourceId);
    if (!source) throw new Error(`Context fact ${fact.factId} references an unknown source`);
    return {
      chunkId: `chunk-${createClinicalEvidenceHash({
        envelopeId: input.envelopeId,
        factId: fact.factId,
        sourceSpanIds: fact.sourceSpanIds
      }).slice(0, 24)}`,
      sourceId: source.sourceId,
      factId: fact.factId,
      headingPath: orderedUnique(annotation.headingPath),
      repeatedTableHeaders: orderedUnique(annotation.tableHeaders),
      sourceSpanIds: canonical(fact.sourceSpanIds),
      boundingBox: annotation.boundingBox,
      tokenEstimate: estimateTokens([
        ...annotation.headingPath,
        ...annotation.tableHeaders,
        fact.statement
      ].join(" ")),
      confidence: fact.confidence,
      freshness: freshness(source.effectiveAt, artifact.expiresAt, input.evaluatedAt, input.staleAfterDays),
      contradictionGroupId: fact.contradictionGroupId,
      contentHash: createClinicalEvidenceHash({
        sourceHash: source.contentHash,
        factId: fact.factId,
        sourceSpanIds: fact.sourceSpanIds,
        headingPath: annotation.headingPath,
        tableHeaders: annotation.tableHeaders,
        boundingBox: annotation.boundingBox
      })
    };
  });

  const expiredChunks = chunks.filter((chunk) => chunk.freshness === "expired");
  const missingEvidence = canonical([
    ...artifact.missingInformation,
    ...expiredChunks.map((chunk) => `expired-evidence:${chunk.factId}`)
  ]);
  const conflictGroupIds = canonical(
    chunks
      .map((chunk) => chunk.contradictionGroupId)
      .filter((value): value is string => Boolean(value))
  );
  const generationDecision = missingEvidence.length || chunks.length === 0
    ? "BLOCK" as const
    : conflictGroupIds.length || chunks.some((chunk) => chunk.freshness === "stale")
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const fhirProvenancePreview = {
    resourceType: "Provenance" as const,
    id: `provenance-${createClinicalEvidenceHash(input.envelopeId).slice(0, 24)}`,
    recorded: input.evaluatedAt,
    target: [{ reference: `Basic/${input.envelopeId}` }],
    entity: artifact.sourceDocuments.map((source) => ({
      role: "source" as const,
      what: { identifier: { value: source.contentHash } }
    })),
    extension: [
      {
        url: "https://scrimedsolutions.com/fhir/StructureDefinition/context-policy-version",
        valueString: artifact.accessPolicy.policyVersion
      },
      {
        url: "https://scrimedsolutions.com/fhir/StructureDefinition/context-integrity-hash",
        valueString: artifact.integrityHash
      }
    ]
  };
  const payload = {
    envelopeId: input.envelopeId,
    tenantId: artifact.tenantId,
    purpose: input.purpose,
    artifact,
    chunks: chunks.sort((left, right) => left.chunkId.localeCompare(right.chunkId)),
    conflictGroupIds,
    missingEvidence,
    generationDecision,
    fhirProvenancePreview,
    containsRawPhi: false as const
  };
  return {
    ...payload,
    envelopeHash: createClinicalEvidenceHash({
      type: "p34-healthcare-context-envelope",
      version: p34ContextProvenanceVersion,
      payload
    })
  };
}

export function validateGroundedClaims(
  envelope: HealthcareContextEnvelope,
  claims: GroundedClaim[]
): GroundedClaimValidation {
  const knownSpanIds = new Set(envelope.artifact.sourceSpans.map((span) => span.spanId));
  const unsupportedClaimIds = canonical(
    claims
      .filter((claim) => claim.citedSourceSpanIds.length === 0)
      .map((claim) => claim.claimId)
  );
  const fabricatedReferenceIds = canonical(
    claims.flatMap((claim) =>
      claim.citedSourceSpanIds.filter((spanId) => !knownSpanIds.has(spanId))
    )
  );
  const decision = unsupportedClaimIds.length || fabricatedReferenceIds.length
    ? "BLOCK" as const
    : envelope.generationDecision === "ALLOW"
      ? "ALLOW" as const
      : "REQUIRE_HUMAN" as const;
  return {
    decision,
    unsupportedClaimIds,
    fabricatedReferenceIds,
    validationHash: createClinicalEvidenceHash({
      type: "p34-grounded-claim-validation",
      version: p34ContextProvenanceVersion,
      envelopeHash: envelope.envelopeHash,
      claims,
      unsupportedClaimIds,
      fabricatedReferenceIds
    })
  };
}

export function createP34SyntheticContextEnvelope() {
  const first = "Configured synthetic signal increased during the review window.";
  const second = "Configured synthetic signal remained stable during the review window.";
  const content = `${first}\n${second}`;
  return buildHealthcareContextEnvelope({
    envelopeId: "p34-context-synthetic-001",
    purpose: "synthetic-workflow-review",
    evaluatedAt: "2026-08-15T12:00:00.000Z",
    staleAfterDays: 90,
    artifactInput: {
      artifactId: "p34-artifact-synthetic-001",
      tenantId: "synthetic-tenant",
      subjectReference: "synthetic-subject-001",
      inputClassification: "synthetic-no-phi",
      deidentificationState: "synthetic",
      documents: [
        {
          sourceId: "p34-source-synthetic-001",
          kind: "structured-document",
          noteType: "synthetic-workflow-note",
          content,
          effectiveAt: "2026-08-14T12:00:00.000Z",
          version: "1",
          annotations: [
            {
              factId: "p34-fact-signal-increased",
              sectionId: "signals",
              startScalar: 0,
              endScalar: [...first].length,
              statement: first,
              conceptIds: ["synthetic-signal"],
              significance: "important",
              confidence: 0.96,
              uncertainty: ["synthetic fixture only"],
              contradictionGroupId: "synthetic-signal-course"
            },
            {
              factId: "p34-fact-signal-stable",
              sectionId: "signals",
              startScalar: [...first].length + 1,
              endScalar: [...content].length,
              statement: second,
              conceptIds: ["synthetic-signal"],
              significance: "important",
              confidence: 0.91,
              uncertainty: ["synthetic fixture only"],
              contradictionGroupId: "synthetic-signal-course"
            }
          ]
        }
      ],
      timeline: [],
      coreferences: [],
      conceptMappings: [],
      medicationProblemRelations: [],
      accessPolicy: {
        policyVersion: p34ContextProvenanceVersion,
        tenantId: "synthetic-tenant",
        authorizedAgentIds: ["p34-context-agent"],
        allowedPurposes: ["synthetic-workflow-review"],
        allowedSections: ["signals"],
        minimumNecessary: true,
        consentState: "not-required-synthetic",
        expiresAt: "2026-09-15T12:00:00.000Z",
        revocable: true
      },
      missingInformation: [],
      expiresAt: "2026-09-15T12:00:00.000Z",
      version: "1"
    },
    hierarchy: [
      {
        factId: "p34-fact-signal-increased",
        headingPath: ["Synthetic review", "Signals"],
        tableHeaders: ["Signal", "Course"],
        boundingBox: { page: 1, x: 0.08, y: 0.16, width: 0.8, height: 0.08 }
      },
      {
        factId: "p34-fact-signal-stable",
        headingPath: ["Synthetic review", "Signals"],
        tableHeaders: ["Signal", "Course"],
        boundingBox: { page: 1, x: 0.08, y: 0.26, width: 0.8, height: 0.08 }
      }
    ]
  });
}
