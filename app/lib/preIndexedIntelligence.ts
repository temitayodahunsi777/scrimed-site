import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

export type PreIndexedDocumentFamily =
  | "fhir_bundle"
  | "prior_auth_policy_summary"
  | "referral_packet"
  | "clinical_guideline_summary"
  | "trial_protocol_summary"
  | "rcm_denial_playbook";

export type PreIndexedStructureElement =
  | "pages"
  | "sections"
  | "tables"
  | "labels"
  | "values"
  | "units"
  | "citations"
  | "images"
  | "references"
  | "fhir_resources"
  | "workflow_steps"
  | "payer_criteria";

export type PreIndexedIndexPolicy =
  | "synthetic_only"
  | "metadata_only"
  | "human_review_required"
  | "production_connector_blocked";

export type PreIndexedRetrievalTask =
  | "patient_matching"
  | "document_similarity"
  | "clinical_retrieval"
  | "payer_policy_lookup"
  | "recommendation_search";

export type PreIndexedFixture = {
  sourceId: string;
  corpus: string;
  documentFamily: PreIndexedDocumentFamily;
  syntheticOnly: true;
  livePhiProcessed: false;
  rawPayloadStored: false;
  rawSchemaExposedToAgents: false;
  productionConnectorApproved: false;
  structurePreserved: PreIndexedStructureElement[];
  indexPolicies: PreIndexedIndexPolicy[];
  provenanceRefs: string[];
  retrievalTasks: PreIndexedRetrievalTask[];
};

export type PreIndexedChunkManifest = {
  chunkId: string;
  sourceId: string;
  sourceAnchor: string;
  structureElements: PreIndexedStructureElement[];
  agentAccessibleFields: string[];
  excludedFields: string[];
  provenanceHash: string;
};

export type PreIndexedIndexRecord = {
  sourceId: string;
  status: "index_manifest_ready" | "human_review_required" | "blocked_raw_payload";
  documentFamily: PreIndexedDocumentFamily;
  syntheticOnly: true;
  livePhiProcessed: false;
  rawPayloadStored: false;
  rawSchemaExposedToAgents: false;
  productionConnectorApproved: false;
  structurePreserved: PreIndexedStructureElement[];
  indexPolicies: PreIndexedIndexPolicy[];
  chunks: PreIndexedChunkManifest[];
  provenanceChain: string[];
  groundingReport: {
    structureCoverageScore: number;
    provenanceCoverageScore: number;
    retrievalReadinessScore: number;
    staleSourceFlag: false;
    reviewerRequired: true;
  };
  safetyBoundary: typeof preIndexedIntelligenceBoundary;
  auditHash: string;
};

export type PreIndexedRetrievalEvaluation = {
  task: PreIndexedRetrievalTask;
  candidateSourceIds: string[];
  groundingScore: number;
  sourceTraceabilityScore: number;
  minimumPassingScore: number;
  status: "pass_synthetic" | "needs_review" | "blocked";
  reason: string;
  humanReviewRequired: true;
  auditHash: string;
};

export const preIndexedIntelligenceStatus =
  "pre-indexed-intelligence-ready-synthetic-only";

export const preIndexedIntelligenceBoundary =
  "Pre-Indexed Intelligence is a synthetic/no-PHI, metadata-only ingest-time intelligence scaffold. It preserves document structure, provenance, grounding metadata, and retrieval evaluation for future Clinical Data Fabric and TrustOps workflows. It does not ingest live PHI, store raw connector payloads, expose raw schemas to agents, approve production connectors, make clinical recommendations, submit payer work, contact patients, or write back to EHRs.";

export const preIndexedIntelligenceFixtures: PreIndexedFixture[] = [
  {
    sourceId: "preindex-fhir-synthetic-care-summary",
    corpus: "synthetic clinical context",
    documentFamily: "fhir_bundle",
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    rawSchemaExposedToAgents: false,
    productionConnectorApproved: false,
    structurePreserved: ["fhir_resources", "references", "labels", "values", "units"],
    indexPolicies: ["synthetic_only", "metadata_only", "human_review_required", "production_connector_blocked"],
    provenanceRefs: ["synthetic-fhir-r4-fixture", "clinical-data-fabric-policy"],
    retrievalTasks: ["patient_matching", "clinical_retrieval", "recommendation_search"]
  },
  {
    sourceId: "preindex-payer-policy-synthetic-afib",
    corpus: "synthetic payer documentation policy",
    documentFamily: "prior_auth_policy_summary",
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    rawSchemaExposedToAgents: false,
    productionConnectorApproved: false,
    structurePreserved: ["sections", "payer_criteria", "labels", "values", "citations"],
    indexPolicies: ["synthetic_only", "metadata_only", "human_review_required", "production_connector_blocked"],
    provenanceRefs: ["documentation-before-authorization-policy", "synthetic-prior-auth-rubric"],
    retrievalTasks: ["payer_policy_lookup", "document_similarity"]
  },
  {
    sourceId: "preindex-referral-synthetic-delay",
    corpus: "synthetic referral operations",
    documentFamily: "referral_packet",
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    rawSchemaExposedToAgents: false,
    productionConnectorApproved: false,
    structurePreserved: ["pages", "sections", "tables", "labels", "workflow_steps", "images"],
    indexPolicies: ["synthetic_only", "metadata_only", "human_review_required", "production_connector_blocked"],
    provenanceRefs: ["synthetic-referral-fixture", "trustops-signal-engine"],
    retrievalTasks: ["document_similarity", "recommendation_search"]
  },
  {
    sourceId: "preindex-guideline-synthetic-care-gap",
    corpus: "synthetic guideline evidence",
    documentFamily: "clinical_guideline_summary",
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    rawSchemaExposedToAgents: false,
    productionConnectorApproved: false,
    structurePreserved: ["sections", "citations", "references", "labels", "values"],
    indexPolicies: ["synthetic_only", "metadata_only", "human_review_required", "production_connector_blocked"],
    provenanceRefs: ["synthetic-guideline-summary", "clinical-robustness-lab-rubric"],
    retrievalTasks: ["clinical_retrieval", "recommendation_search"]
  },
  {
    sourceId: "preindex-trial-synthetic-protocol",
    corpus: "synthetic research operations",
    documentFamily: "trial_protocol_summary",
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    rawSchemaExposedToAgents: false,
    productionConnectorApproved: false,
    structurePreserved: ["sections", "tables", "labels", "values", "references"],
    indexPolicies: ["synthetic_only", "metadata_only", "human_review_required", "production_connector_blocked"],
    provenanceRefs: ["edge-trial-evidence-roadmap", "synthetic-protocol-fixture"],
    retrievalTasks: ["document_similarity", "clinical_retrieval"]
  },
  {
    sourceId: "preindex-rcm-synthetic-denial-playbook",
    corpus: "synthetic revenue cycle operations",
    documentFamily: "rcm_denial_playbook",
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    rawSchemaExposedToAgents: false,
    productionConnectorApproved: false,
    structurePreserved: ["sections", "tables", "labels", "workflow_steps", "payer_criteria"],
    indexPolicies: ["synthetic_only", "metadata_only", "human_review_required", "production_connector_blocked"],
    provenanceRefs: ["synthetic-rcm-playbook", "trustops-denial-signal"],
    retrievalTasks: ["payer_policy_lookup", "recommendation_search"]
  }
];

function buildChunkManifests(fixture: PreIndexedFixture): PreIndexedChunkManifest[] {
  return fixture.structurePreserved.slice(0, 3).map((element, index) => {
    const chunkId = `${fixture.sourceId}-chunk-${index + 1}`;

    return {
      chunkId,
      sourceId: fixture.sourceId,
      sourceAnchor: `${fixture.documentFamily}:${element}:${index + 1}`,
      structureElements: [element],
      agentAccessibleFields: ["source_id", "source_anchor", "structure_elements", "provenance_hash"],
      excludedFields: ["raw_payload", "raw_schema", "patient_identifier", "connector_credential"],
      provenanceHash: generateScrimedAuditHash({
        chunkId,
        sourceId: fixture.sourceId,
        sourceAnchor: `${fixture.documentFamily}:${element}:${index + 1}`,
        provenanceRefs: fixture.provenanceRefs
      })
    };
  });
}

function scoreStructureCoverage(structurePreserved: PreIndexedStructureElement[]) {
  const requiredElements: PreIndexedStructureElement[] = ["labels", "values", "references"];
  const preservedRequired = requiredElements.filter((element) =>
    structurePreserved.includes(element)
  ).length;

  return Math.round(((structurePreserved.length + preservedRequired) / 15) * 100);
}

export function buildPreIndexedIndexRecord(fixture: PreIndexedFixture): PreIndexedIndexRecord {
  const chunks = buildChunkManifests(fixture);
  const structureCoverageScore = Math.min(100, scoreStructureCoverage(fixture.structurePreserved));
  const provenanceCoverageScore = Math.min(100, fixture.provenanceRefs.length * 35);
  const retrievalReadinessScore = Math.min(
    100,
    Math.round((structureCoverageScore + provenanceCoverageScore + fixture.retrievalTasks.length * 12) / 2.5)
  );
  const status = fixture.rawPayloadStored
    ? "blocked_raw_payload"
    : retrievalReadinessScore >= 80
      ? "index_manifest_ready"
      : "human_review_required";

  return {
    sourceId: fixture.sourceId,
    status,
    documentFamily: fixture.documentFamily,
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    rawSchemaExposedToAgents: false,
    productionConnectorApproved: false,
    structurePreserved: fixture.structurePreserved,
    indexPolicies: fixture.indexPolicies,
    chunks,
    provenanceChain: fixture.provenanceRefs,
    groundingReport: {
      structureCoverageScore,
      provenanceCoverageScore,
      retrievalReadinessScore,
      staleSourceFlag: false,
      reviewerRequired: true
    },
    safetyBoundary: preIndexedIntelligenceBoundary,
    auditHash: generateScrimedAuditHash({
      sourceId: fixture.sourceId,
      documentFamily: fixture.documentFamily,
      structurePreserved: fixture.structurePreserved,
      provenanceRefs: fixture.provenanceRefs,
      retrievalTasks: fixture.retrievalTasks,
      status
    })
  };
}

export function evaluatePreIndexedRetrievalTask(
  task: PreIndexedRetrievalTask,
  records: PreIndexedIndexRecord[]
): PreIndexedRetrievalEvaluation {
  const candidates = records.filter((record) =>
    preIndexedIntelligenceFixtures
      .find((fixture) => fixture.sourceId === record.sourceId)
      ?.retrievalTasks.includes(task)
  );
  const groundingScore =
    candidates.length === 0
      ? 0
      : Math.round(
          candidates.reduce(
            (total, record) => total + record.groundingReport.retrievalReadinessScore,
            0
          ) / candidates.length
        );
  const sourceTraceabilityScore =
    candidates.length === 0
      ? 0
      : Math.round(
          candidates.reduce((total, record) => total + record.provenanceChain.length * 35, 0) /
            candidates.length
        );
  const minimumPassingScore = 80;
  const status =
    candidates.length === 0
      ? "blocked"
      : groundingScore >= minimumPassingScore && sourceTraceabilityScore >= minimumPassingScore
        ? "pass_synthetic"
        : "needs_review";

  return {
    task,
    candidateSourceIds: candidates.map((candidate) => candidate.sourceId),
    groundingScore,
    sourceTraceabilityScore: Math.min(100, sourceTraceabilityScore),
    minimumPassingScore,
    status,
    reason:
      status === "pass_synthetic"
        ? "Synthetic retrieval candidates preserve provenance and grounding metadata."
        : "Retrieval requires reviewer verification before any protected healthcare use.",
    humanReviewRequired: true,
    auditHash: generateScrimedAuditHash({
      task,
      candidateSourceIds: candidates.map((candidate) => candidate.sourceId),
      groundingScore,
      sourceTraceabilityScore,
      status
    })
  };
}

export function getPreIndexedIntelligenceSummary() {
  const records = preIndexedIntelligenceFixtures.map((fixture) =>
    buildPreIndexedIndexRecord(fixture)
  );
  const requiredTasks: PreIndexedRetrievalTask[] = [
    "patient_matching",
    "document_similarity",
    "clinical_retrieval",
    "payer_policy_lookup",
    "recommendation_search"
  ];
  const retrievalEvaluations = requiredTasks.map((task) =>
    evaluatePreIndexedRetrievalTask(task, records)
  );
  const requiredStructure: PreIndexedStructureElement[] = [
    "pages",
    "tables",
    "labels",
    "values",
    "units",
    "citations",
    "images",
    "references",
    "fhir_resources",
    "payer_criteria"
  ];
  const representedStructure = new Set(
    preIndexedIntelligenceFixtures.flatMap((fixture) => fixture.structurePreserved)
  );

  return {
    service: "pre-indexed-intelligence",
    status: preIndexedIntelligenceStatus,
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    rawSchemaExposedToAgents: false,
    productionConnectorApproved: false,
    boundary: preIndexedIntelligenceBoundary,
    sourceCount: records.length,
    retrievalTaskCount: retrievalEvaluations.length,
    records,
    retrievalEvaluations,
    validation: {
      status:
        records.every(
          (record) =>
            record.syntheticOnly &&
            !record.livePhiProcessed &&
            !record.rawPayloadStored &&
            !record.rawSchemaExposedToAgents &&
            !record.productionConnectorApproved &&
            record.groundingReport.reviewerRequired
        ) &&
        requiredTasks.every((task) =>
          retrievalEvaluations.some((evaluation) => evaluation.task === task)
        ) &&
        ["labels", "values", "references"].every((element) =>
          representedStructure.has(element as PreIndexedStructureElement)
        )
          ? "pass"
          : "fail",
      checks: [
        {
          check: "synthetic-metadata-only",
          passed: records.every(
            (record) =>
              record.syntheticOnly &&
              !record.livePhiProcessed &&
              !record.rawPayloadStored &&
              !record.rawSchemaExposedToAgents
          ),
          detail:
            "Index records must remain synthetic, metadata-only, no-PHI, and hidden from raw schemas."
        },
        {
          check: "retrieval-tasks-covered",
          passed: requiredTasks.every((task) =>
            retrievalEvaluations.some((evaluation) => evaluation.task === task)
          ),
          detail:
            "Patient matching, document similarity, clinical retrieval, payer-policy lookup, and recommendation search must be represented."
        },
        {
          check: "structure-preservation-covered",
          passed: requiredStructure.every((element) => representedStructure.has(element)),
          detail:
            "The scaffold must preserve structure metadata such as pages, tables, labels, values, units, citations, images, references, FHIR resources, and payer criteria where represented."
        },
        {
          check: "production-connectors-blocked",
          passed: records.every((record) => !record.productionConnectorApproved),
          detail:
            "No pre-indexed intelligence record may approve production connectors or source ingestion."
        },
        {
          check: "human-review-required",
          passed: retrievalEvaluations.every((evaluation) => evaluation.humanReviewRequired),
          detail:
            "Retrieval evaluations remain reviewer-gated before protected clinical, payer, or operational use."
        }
      ]
    }
  };
}
