import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import {
  buildCaseEvidencePacket,
  type CaseEvidencePacket
} from "./clinicalEvidenceControls";

export type DocumentationBeforeAuthorizationRequirementId =
  | "symptom_language"
  | "functional_status"
  | "visit_timing"
  | "medical_necessity_rationale"
  | "prior_therapy_history"
  | "diagnosis_specific_evidence"
  | "policy_reference"
  | "recent_visit_note"
  | "contraindication_context"
  | "reviewer_attestation";

export type DocumentationBeforeAuthorizationRiskLevel =
  | "low"
  | "moderate"
  | "high"
  | "blocked";

export type DocumentationBeforeAuthorizationReadiness =
  | "blocked_before_submission"
  | "human_review_required"
  | "review_ready";

export type DocumentationBeforeAuthorizationRequirement = {
  id: DocumentationBeforeAuthorizationRequirementId;
  label: string;
  purpose: string;
  required: boolean;
  owner: "clinical_reviewer" | "rcm_reviewer" | "payer_policy_reviewer";
  evidenceType: string;
};

export type DocumentationBeforeAuthorizationSyntheticPacket = {
  packetId: string;
  scenario: string;
  payerPolicyClass: "synthetic_prior_auth_policy";
  procedureFamily: string;
  syntheticOnly: true;
  noPhi: true;
  documentedRequirementIds: DocumentationBeforeAuthorizationRequirementId[];
  evidenceRefs: string[];
  reviewerStatus: "not_reviewed" | "queued" | "reviewed_for_demo";
  requestedAction:
    | "pre_submission_gap_check"
    | "draft_reviewer_packet"
    | "payer_submission_blocked";
};

export type DocumentationBeforeAuthorizationEvaluation = {
  packetId: string;
  status: "documentation-before-authorization-evaluated";
  readiness: DocumentationBeforeAuthorizationReadiness;
  riskLevel: DocumentationBeforeAuthorizationRiskLevel;
  missingRequiredIds: DocumentationBeforeAuthorizationRequirementId[];
  presentRequiredIds: DocumentationBeforeAuthorizationRequirementId[];
  missingEvidenceLabels: string[];
  priorAuthRiskSignals: string[];
  recommendedOwner: "clinical_reviewer" | "rcm_reviewer" | "payer_policy_reviewer";
  recommendedActions: string[];
  automationEligibility: "recommendation_only" | "blocked";
  humanReviewRequired: true;
  payerSubmissionAllowed: false;
  noPhiConfirmed: true;
  syntheticOnly: true;
  auditHash: string;
  boundary: typeof documentationBeforeAuthorizationBoundary;
};

export type DocumentationBeforeAuthorizationWorkbenchRequest = {
  scenarioPacketId: string;
  documentedRequirementIds: DocumentationBeforeAuthorizationRequirementId[];
  reviewerStatus: DocumentationBeforeAuthorizationSyntheticPacket["reviewerStatus"];
  requestedAction: DocumentationBeforeAuthorizationSyntheticPacket["requestedAction"];
  dataBoundaryAcknowledged: boolean;
};

export type DocumentationBeforeAuthorizationReviewPacket = {
  workbenchId: string;
  sourcePacketId: string;
  generatedAt: string;
  status: "review-packet-prepared" | "request-blocked";
  scenario: string;
  procedureFamily: string;
  readinessScore: number;
  evaluation: DocumentationBeforeAuthorizationEvaluation;
  evidencePacket: {
    presentRequirements: string[];
    missingRequirements: string[];
    evidenceRefs: string[];
    policyFreshness: "synthetic-current-for-demo";
    sourceTrustTier: "synthetic-reviewed-fixture";
  };
  caseEvidence: CaseEvidencePacket;
  reviewQueue: {
    requiredRole: DocumentationBeforeAuthorizationEvaluation["recommendedOwner"];
    status: "queued" | "reviewed-for-demo" | "blocked";
    humanReviewRequired: true;
    externalActionAllowed: false;
    nextActions: string[];
  };
  workSessionHandoff: {
    workspaceDomain: "revenue-cycle";
    riskLevel: "high";
    requestedAutonomy: "prepare";
    artifactType: "prior-authorization-draft";
    definitionOfDone: {
      goal: string;
      allowedScope: string[];
      prohibitedActions: string[];
      requiredEvidence: string[];
      successCriteria: string[];
      stoppingConditions: string[];
      humanApprovalRequired: true;
      rollbackPlan: string;
      verificationChecks: string[];
    };
  };
  valueTelemetry: {
    measurementMode: "synthetic-assumption-only";
    documentationCompletenessPercent: number;
    missingRequirementCount: number;
    estimatedManualReviewMinutes: number;
    estimatedAssistedReviewMinutes: number;
    estimatedReviewMinutesReallocated: number;
    outcomeBoundary: string;
  };
  exportPacket: {
    fileName: string;
    mediaType: "text/markdown";
    markdown: string;
    exportAllowed: false;
    exportRequiresHumanReview: true;
  };
  auditHash: string;
  boundary: typeof documentationBeforeAuthorizationBoundary;
};

export type DocumentationBeforeAuthorizationWorkbenchResult =
  | { valid: true; packet: DocumentationBeforeAuthorizationReviewPacket }
  | { valid: false; errors: string[] };

export const documentationBeforeAuthorizationStatus =
  "documentation-before-authorization-ready-synthetic-only";

export const documentationBeforeAuthorizationBoundary =
  "Documentation-Before-Authorization Engine is synthetic/no-PHI pre-submission intelligence. It can identify documentation gaps, draft reviewer packets, and estimate prior-auth risk for demo workflows only. It does not submit prior authorizations, file claims, determine medical necessity, provide legal advice, contact payers, write to EHRs, or use live patient data.";

export const documentationBeforeAuthorizationRequirements: DocumentationBeforeAuthorizationRequirement[] = [
  {
    id: "symptom_language",
    label: "Symptom language",
    purpose: "Confirm the packet states relevant symptoms or clinical rationale in reviewer-friendly language.",
    required: true,
    owner: "clinical_reviewer",
    evidenceType: "synthetic note excerpt metadata"
  },
  {
    id: "functional_status",
    label: "Functional status",
    purpose: "Confirm the packet captures activity limitation, burden, or functional impact when policy criteria require it.",
    required: true,
    owner: "clinical_reviewer",
    evidenceType: "synthetic assessment metadata"
  },
  {
    id: "visit_timing",
    label: "Visit timing",
    purpose: "Confirm the related visit or review date falls inside the synthetic policy timing window.",
    required: true,
    owner: "rcm_reviewer",
    evidenceType: "synthetic encounter timestamp metadata"
  },
  {
    id: "medical_necessity_rationale",
    label: "Medical necessity rationale",
    purpose: "Confirm a reviewer-authored rationale is present; SCRIMED does not make final medical-necessity determinations.",
    required: true,
    owner: "payer_policy_reviewer",
    evidenceType: "reviewer rationale placeholder"
  },
  {
    id: "prior_therapy_history",
    label: "Prior therapy history",
    purpose: "Confirm prior therapies, alternatives, failures, contraindications, or policy-specific history are represented when required.",
    required: true,
    owner: "clinical_reviewer",
    evidenceType: "synthetic treatment-history metadata"
  },
  {
    id: "diagnosis_specific_evidence",
    label: "Diagnosis-specific evidence",
    purpose: "Confirm required diagnostic, guideline, or specialty-specific evidence fields are present before reviewer packet creation.",
    required: true,
    owner: "clinical_reviewer",
    evidenceType: "synthetic evidence card metadata"
  },
  {
    id: "policy_reference",
    label: "Policy reference",
    purpose: "Confirm policy version, source label, and freshness metadata are included.",
    required: true,
    owner: "payer_policy_reviewer",
    evidenceType: "synthetic payer-policy metadata"
  },
  {
    id: "recent_visit_note",
    label: "Recent visit note",
    purpose: "Confirm a recent visit-note placeholder or reviewer-approved alternative is present.",
    required: true,
    owner: "rcm_reviewer",
    evidenceType: "synthetic visit-note metadata"
  },
  {
    id: "contraindication_context",
    label: "Contraindication context",
    purpose: "Flag missing contraindication or exception context when it affects policy interpretation.",
    required: false,
    owner: "clinical_reviewer",
    evidenceType: "synthetic exception metadata"
  },
  {
    id: "reviewer_attestation",
    label: "Reviewer attestation",
    purpose: "Confirm human reviewer status is captured before any external-facing packet is considered.",
    required: true,
    owner: "payer_policy_reviewer",
    evidenceType: "human review status"
  }
];

export const documentationBeforeAuthorizationSyntheticPackets: DocumentationBeforeAuthorizationSyntheticPacket[] = [
  {
    packetId: "doc-auth-afib-ablation-synthetic-gap",
    scenario:
      "Synthetic AFib ablation-style prior-auth readiness check with missing symptom language, functional status, recent timing, and reviewer attestation.",
    payerPolicyClass: "synthetic_prior_auth_policy",
    procedureFamily: "cardiology procedure authorization",
    syntheticOnly: true,
    noPhi: true,
    documentedRequirementIds: [
      "medical_necessity_rationale",
      "prior_therapy_history",
      "diagnosis_specific_evidence",
      "policy_reference"
    ],
    evidenceRefs: ["policy-synthetic-cardiology-001", "evidence-card-synthetic-therapy-history"],
    reviewerStatus: "queued",
    requestedAction: "pre_submission_gap_check"
  },
  {
    packetId: "doc-auth-imaging-synthetic-review-ready",
    scenario:
      "Synthetic imaging authorization packet with all required metadata present and still routed to human review.",
    payerPolicyClass: "synthetic_prior_auth_policy",
    procedureFamily: "advanced imaging authorization",
    syntheticOnly: true,
    noPhi: true,
    documentedRequirementIds: documentationBeforeAuthorizationRequirements
      .filter((requirement) => requirement.required)
      .map((requirement) => requirement.id),
    evidenceRefs: [
      "policy-synthetic-imaging-001",
      "evidence-card-synthetic-symptoms",
      "evidence-card-synthetic-function",
      "evidence-card-synthetic-visit-timing"
    ],
    reviewerStatus: "reviewed_for_demo",
    requestedAction: "draft_reviewer_packet"
  }
];

function requiredRequirements() {
  return documentationBeforeAuthorizationRequirements.filter((requirement) => requirement.required);
}

const reviewerStatuses: DocumentationBeforeAuthorizationSyntheticPacket["reviewerStatus"][] = [
  "not_reviewed",
  "queued",
  "reviewed_for_demo"
];

const requestedActions: DocumentationBeforeAuthorizationSyntheticPacket["requestedAction"][] = [
  "pre_submission_gap_check",
  "draft_reviewer_packet",
  "payer_submission_blocked"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRequirementId(value: unknown): value is DocumentationBeforeAuthorizationRequirementId {
  return (
    typeof value === "string" &&
    documentationBeforeAuthorizationRequirements.some((requirement) => requirement.id === value)
  );
}

function containsSensitiveWorkbenchField(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).some(([key, entry]) => {
    if (/token|secret|password|credential|authorization|cookie|member|patient|mrn/i.test(key)) {
      return true;
    }

    if (isRecord(entry)) {
      return containsSensitiveWorkbenchField(entry);
    }

    return typeof entry === "string" && /\b(?:Bearer\s+|sk-)[A-Za-z0-9._-]+/i.test(entry);
  });
}

function parseWorkbenchRequest(
  value: unknown
):
  | { valid: true; request: DocumentationBeforeAuthorizationWorkbenchRequest }
  | { valid: false; errors: string[] } {
  if (!isRecord(value)) {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }

  const allowedFields = new Set([
    "scenarioPacketId",
    "documentedRequirementIds",
    "reviewerStatus",
    "requestedAction",
    "dataBoundaryAcknowledged"
  ]);
  const unexpectedFields = Object.keys(value).filter((key) => !allowedFields.has(key));
  const errors: string[] = [];

  if (unexpectedFields.length > 0 || containsSensitiveWorkbenchField(value)) {
    errors.push("Only enumerated synthetic workbench fields are accepted; sensitive or unexpected fields are blocked.");
  }

  const scenarioPacketId = typeof value.scenarioPacketId === "string" ? value.scenarioPacketId : "";
  const scenario = documentationBeforeAuthorizationSyntheticPackets.find(
    (packet) => packet.packetId === scenarioPacketId
  );

  if (!scenario) {
    errors.push("Select a registered synthetic scenario packet.");
  }

  const requirementValues = Array.isArray(value.documentedRequirementIds)
    ? value.documentedRequirementIds
    : [];
  const documentedRequirementIds = Array.from(new Set(requirementValues.filter(isRequirementId)));

  if (
    requirementValues.length !== documentedRequirementIds.length ||
    documentedRequirementIds.length > documentationBeforeAuthorizationRequirements.length
  ) {
    errors.push("Documented requirements must be unique registered requirement identifiers.");
  }

  const reviewerStatus = value.reviewerStatus;
  if (!reviewerStatuses.includes(reviewerStatus as DocumentationBeforeAuthorizationSyntheticPacket["reviewerStatus"])) {
    errors.push("Select a supported synthetic reviewer status.");
  }

  const requestedAction = value.requestedAction;
  if (!requestedActions.includes(requestedAction as DocumentationBeforeAuthorizationSyntheticPacket["requestedAction"])) {
    errors.push("Select a supported workbench action.");
  }

  if (value.dataBoundaryAcknowledged !== true) {
    errors.push("Acknowledge the synthetic/no-PHI and no-submission boundary before evaluation.");
  }

  if (errors.length > 0 || !scenario) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    request: {
      scenarioPacketId,
      documentedRequirementIds,
      reviewerStatus: reviewerStatus as DocumentationBeforeAuthorizationSyntheticPacket["reviewerStatus"],
      requestedAction: requestedAction as DocumentationBeforeAuthorizationSyntheticPacket["requestedAction"],
      dataBoundaryAcknowledged: true
    }
  };
}

function ownerForMissingRequirements(
  missingRequiredIds: DocumentationBeforeAuthorizationRequirementId[]
): DocumentationBeforeAuthorizationEvaluation["recommendedOwner"] {
  const missing = documentationBeforeAuthorizationRequirements.filter((requirement) =>
    missingRequiredIds.includes(requirement.id)
  );

  if (missing.some((requirement) => requirement.owner === "clinical_reviewer")) {
    return "clinical_reviewer";
  }

  if (missing.some((requirement) => requirement.owner === "payer_policy_reviewer")) {
    return "payer_policy_reviewer";
  }

  return "rcm_reviewer";
}

export function evaluateDocumentationBeforeAuthorizationPacket(
  packet: DocumentationBeforeAuthorizationSyntheticPacket
): DocumentationBeforeAuthorizationEvaluation {
  const required = requiredRequirements();
  const documented = new Set(packet.documentedRequirementIds);
  const missingRequired = required
    .filter((requirement) => !documented.has(requirement.id))
    .map((requirement) => requirement.id);
  const presentRequired = required
    .filter((requirement) => documented.has(requirement.id))
    .map((requirement) => requirement.id);
  const missingEvidenceLabels = documentationBeforeAuthorizationRequirements
    .filter((requirement) => missingRequired.includes(requirement.id))
    .map((requirement) => requirement.label);
  const priorAuthRiskSignals = [
    ...missingEvidenceLabels.map((label) => `missing ${label.toLowerCase()}`),
    packet.reviewerStatus === "reviewed_for_demo" ? "" : "human reviewer attestation incomplete",
    packet.evidenceRefs.length < 2 ? "insufficient evidence references" : ""
  ].filter(Boolean);
  const blocked =
    packet.requestedAction === "payer_submission_blocked" ||
    !packet.syntheticOnly ||
    !packet.noPhi;
  const riskLevel: DocumentationBeforeAuthorizationRiskLevel = blocked
    ? "blocked"
    : missingRequired.length >= 3
      ? "high"
      : missingRequired.length > 0 || packet.reviewerStatus !== "reviewed_for_demo"
        ? "moderate"
        : "low";
  const readiness: DocumentationBeforeAuthorizationReadiness =
    blocked || missingRequired.length > 0
      ? "blocked_before_submission"
      : packet.reviewerStatus === "reviewed_for_demo"
        ? "review_ready"
        : "human_review_required";
  const recommendedOwner = ownerForMissingRequirements(missingRequired);
  const recommendedActions = [
    missingRequired.length > 0
      ? `Complete missing documentation: ${missingEvidenceLabels.join(", ")}`
      : "Maintain reviewer packet with all required metadata present.",
    "Route to human reviewer before any payer-facing use.",
    "Keep payer submission blocked until external authorization, customer approval, and compliance review exist."
  ];

  return {
    packetId: packet.packetId,
    status: "documentation-before-authorization-evaluated",
    readiness,
    riskLevel,
    missingRequiredIds: missingRequired,
    presentRequiredIds: presentRequired,
    missingEvidenceLabels,
    priorAuthRiskSignals,
    recommendedOwner,
    recommendedActions,
    automationEligibility: readiness === "review_ready" ? "recommendation_only" : "blocked",
    humanReviewRequired: true,
    payerSubmissionAllowed: false,
    noPhiConfirmed: packet.noPhi,
    syntheticOnly: true,
    auditHash: generateScrimedAuditHash({
      packetId: packet.packetId,
      readiness,
      riskLevel,
      missingRequired,
      evidenceRefs: packet.evidenceRefs,
      reviewerStatus: packet.reviewerStatus
    }),
    boundary: documentationBeforeAuthorizationBoundary
  };
}

function buildEvidenceRefs(
  packet: DocumentationBeforeAuthorizationSyntheticPacket,
  documentedRequirementIds: DocumentationBeforeAuthorizationRequirementId[]
) {
  return Array.from(
    new Set([
      ...packet.evidenceRefs,
      ...documentedRequirementIds.map((requirementId) => `synthetic-evidence-${requirementId}`)
    ])
  );
}

function buildReviewPacketMarkdown(input: {
  workbenchId: string;
  scenario: DocumentationBeforeAuthorizationSyntheticPacket;
  evaluation: DocumentationBeforeAuthorizationEvaluation;
  readinessScore: number;
  evidenceRefs: string[];
  caseEvidencePacketHash: string;
}) {
  const missing = input.evaluation.missingEvidenceLabels.length
    ? input.evaluation.missingEvidenceLabels.map((label) => `- ${label}`).join("\n")
    : "- No required documentation gaps detected in this synthetic packet.";
  const actions = input.evaluation.recommendedActions.map((action) => `- ${action}`).join("\n");

  return [
    "# SCRIMED PayerIQ Documentation Readiness Packet",
    "",
    `- Workbench ID: ${input.workbenchId}`,
    `- Synthetic scenario: ${input.scenario.scenario}`,
    `- Procedure family: ${input.scenario.procedureFamily}`,
    `- Documentation completeness: ${input.readinessScore}%`,
    `- Risk level: ${input.evaluation.riskLevel}`,
    `- Readiness: ${input.evaluation.readiness}`,
    `- Required reviewer: ${input.evaluation.recommendedOwner}`,
    "- Payer submission allowed: no",
    "",
    "## Missing Documentation",
    missing,
    "",
    "## Evidence References",
    ...input.evidenceRefs.map((reference) => `- ${reference}`),
    `- Case evidence packet hash: ${input.caseEvidencePacketHash}`,
    "",
    "## Recommended Human Actions",
    actions,
    "",
    "## Safety Boundary",
    documentationBeforeAuthorizationBoundary,
    "",
    "This packet remains a synthetic decision-support draft. Human review is required, and no payer-facing transmission is authorized."
  ].join("\n");
}

export function runDocumentationBeforeAuthorizationWorkbench(
  payload: unknown,
  generatedAt = new Date().toISOString()
): DocumentationBeforeAuthorizationWorkbenchResult {
  const parsed = parseWorkbenchRequest(payload);

  if (!parsed.valid) {
    return parsed;
  }

  const sourcePacket = documentationBeforeAuthorizationSyntheticPackets.find(
    (packet) => packet.packetId === parsed.request.scenarioPacketId
  )!;
  const evidenceRefs = buildEvidenceRefs(sourcePacket, parsed.request.documentedRequirementIds);
  const packet: DocumentationBeforeAuthorizationSyntheticPacket = {
    ...sourcePacket,
    documentedRequirementIds: parsed.request.documentedRequirementIds,
    evidenceRefs,
    reviewerStatus: parsed.request.reviewerStatus,
    requestedAction: parsed.request.requestedAction,
    syntheticOnly: true,
    noPhi: true
  };
  const evaluation = evaluateDocumentationBeforeAuthorizationPacket(packet);
  const requiredCount = requiredRequirements().length;
  const completenessScore = Math.round((evaluation.presentRequiredIds.length / requiredCount) * 100);
  const readinessScore =
    evaluation.riskLevel === "blocked"
      ? 0
      : packet.reviewerStatus === "reviewed_for_demo"
        ? completenessScore
        : Math.min(completenessScore, 90);
  const estimatedManualReviewMinutes = 30 + evaluation.missingRequiredIds.length * 3;
  const estimatedAssistedReviewMinutes = 12 + evaluation.missingRequiredIds.length * 2;
  const auditHash = generateScrimedAuditHash({
    sourcePacketId: sourcePacket.packetId,
    documentedRequirementIds: packet.documentedRequirementIds,
    evidenceRefs,
    reviewerStatus: packet.reviewerStatus,
    requestedAction: packet.requestedAction,
    readiness: evaluation.readiness,
    riskLevel: evaluation.riskLevel,
    boundary: "synthetic-no-phi-no-payer-submission"
  });
  const workbenchId = `payeriq-${auditHash.replace("scrimed-intel-", "")}`;
  const caseEvidence = buildCaseEvidencePacket(
    {
      syntheticCaseId: `synthetic-${sourcePacket.packetId}`,
      workflowId: "documentation-before-authorization",
      cohortDefinition: "Single registered synthetic authorization-readiness scenario.",
      eligibilityCriteria: [
        "registered synthetic fixture",
        "enumerated documentation requirements only",
        "no PHI or free-text patient data"
      ],
      baselineComparator: "Unassisted synthetic documentation review baseline; no causal comparison is claimed.",
      intervention: {
        label: "SCRIMED PayerIQ deterministic documentation-gap review",
        startedAt: generatedAt,
        completedAt: generatedAt
      },
      sourceLineage: evidenceRefs,
      versions: {
        model: "not-used-deterministic-rules",
        prompt: "not-used-enumerated-schema",
        tools: ["documentation-gap-evaluator", "review-packet-builder"],
        policy: "documentation-before-authorization-synthetic-v1"
      },
      clinicianAction:
        packet.reviewerStatus === "reviewed_for_demo" ? "accepted" : "awaiting-review",
      overrideReasonCode: null,
      outcomes: [
        {
          metricId: "documentation-completeness-percent",
          category: "operational",
          baselineValue: null,
          observedValue: readinessScore,
          unit: "percent",
          observedAt: generatedAt,
          sourceRef: evidenceRefs[0],
          interpretation: "descriptive-only"
        },
        {
          metricId: "missing-required-documentation-count",
          category: "operational",
          baselineValue: null,
          observedValue: evaluation.missingRequiredIds.length,
          unit: "count",
          observedAt: generatedAt,
          sourceRef: evidenceRefs[0],
          interpretation: "descriptive-only"
        }
      ],
      safetyEventCodes: [
        ...(evaluation.missingRequiredIds.length > 0 ? ["missing-documentation"] : []),
        "human-review-required",
        "payer-submission-blocked"
      ],
      missingness: evaluation.missingEvidenceLabels,
      confounders: ["synthetic-fixture", "no-live-payer-policy", "no-causal-design"],
      siteAttributes: ["synthetic-site", "no-production-connector"],
      subgroupAttributes: [sourcePacket.procedureFamily.replaceAll(" ", "-")],
      analysisPlanStatus: "draft",
      trustQaStatus: "review-required",
      humanReviewRequired: true,
      syntheticOnly: true,
      noPhi: true
    },
    generatedAt
  );
  const markdown = buildReviewPacketMarkdown({
    workbenchId,
    scenario: packet,
    evaluation,
    readinessScore,
    evidenceRefs,
    caseEvidencePacketHash: caseEvidence.evidencePacketHash
  });

  return {
    valid: true,
    packet: {
      workbenchId,
      sourcePacketId: sourcePacket.packetId,
      generatedAt,
      status: evaluation.riskLevel === "blocked" ? "request-blocked" : "review-packet-prepared",
      scenario: packet.scenario,
      procedureFamily: packet.procedureFamily,
      readinessScore,
      evaluation,
      evidencePacket: {
        presentRequirements: documentationBeforeAuthorizationRequirements
          .filter((requirement) => evaluation.presentRequiredIds.includes(requirement.id))
          .map((requirement) => requirement.label),
        missingRequirements: evaluation.missingEvidenceLabels,
        evidenceRefs,
        policyFreshness: "synthetic-current-for-demo",
        sourceTrustTier: "synthetic-reviewed-fixture"
      },
      caseEvidence,
      reviewQueue: {
        requiredRole: evaluation.recommendedOwner,
        status:
          evaluation.riskLevel === "blocked"
            ? "blocked"
            : packet.reviewerStatus === "reviewed_for_demo"
              ? "reviewed-for-demo"
              : "queued",
        humanReviewRequired: true,
        externalActionAllowed: false,
        nextActions: evaluation.recommendedActions
      },
      workSessionHandoff: {
        workspaceDomain: "revenue-cycle",
        riskLevel: "high",
        requestedAutonomy: "prepare",
        artifactType: "prior-authorization-draft",
        definitionOfDone: {
          goal: "Prepare a source-traceable synthetic prior-authorization documentation review packet for qualified human review.",
          allowedScope: [
            "synthetic documentation completeness scoring",
            "missing-evidence detection",
            "review packet preparation"
          ],
          prohibitedActions: [
            "live PHI",
            "medical necessity determination",
            "payer submission",
            "patient outreach",
            "EHR writeback",
            "reimbursement guarantee"
          ],
          requiredEvidence: ["synthetic payer-policy reference", "documentation requirement trace"],
          successCriteria: ["evidence", "missing documentation", "review gate", "blocked submission"],
          stoppingConditions: ["PHI detected", "policy source missing", "human review unavailable", "submission requested"],
          humanApprovalRequired: true,
          rollbackPlan: "Cancel the draft, retain non-sensitive audit metadata, and prohibit external distribution.",
          verificationChecks: [
            "schema validity",
            "evidence reference presence",
            "documentation completeness",
            "human review state",
            "payer submission denial"
          ]
        }
      },
      valueTelemetry: {
        measurementMode: "synthetic-assumption-only",
        documentationCompletenessPercent: readinessScore,
        missingRequirementCount: evaluation.missingRequiredIds.length,
        estimatedManualReviewMinutes,
        estimatedAssistedReviewMinutes,
        estimatedReviewMinutesReallocated: Math.max(
          0,
          estimatedManualReviewMinutes - estimatedAssistedReviewMinutes
        ),
        outcomeBoundary:
          "Illustrative workflow economics only; buyer baselines and qualified finance review are required before savings, denial-reduction, or ROI claims."
      },
      exportPacket: {
        fileName: `${workbenchId}-review-packet.md`,
        mediaType: "text/markdown",
        markdown,
        exportAllowed: false,
        exportRequiresHumanReview: true
      },
      auditHash,
      boundary: documentationBeforeAuthorizationBoundary
    }
  };
}

export function getDocumentationBeforeAuthorizationSummary() {
  const evaluations = documentationBeforeAuthorizationSyntheticPackets.map((packet) =>
    evaluateDocumentationBeforeAuthorizationPacket(packet)
  );

  return {
    service: "documentation-before-authorization-engine",
    status: documentationBeforeAuthorizationStatus,
    syntheticOnly: true,
    noPhiConfirmed: true,
    payerSubmissionAllowed: false,
    boundary: documentationBeforeAuthorizationBoundary,
    requirementCount: documentationBeforeAuthorizationRequirements.length,
    requiredRequirementCount: requiredRequirements().length,
    requirements: documentationBeforeAuthorizationRequirements,
    syntheticPacketCount: documentationBeforeAuthorizationSyntheticPackets.length,
    syntheticPackets: documentationBeforeAuthorizationSyntheticPackets,
    evaluations,
    workbench: {
      route: "/documentation-before-authorization",
      apiRoute: "/api/documentation-before-authorization",
      mode: "interactive-synthetic-review-packet",
      acceptedInput: "registered scenario identifiers and enumerated documentation requirement states only",
      freeTextAccepted: false,
      payerSubmissionAllowed: false,
      workSessionHandoff: "SCRIMED Work revenue-cycle prepare-only Definition-of-Done contract"
    },
    evidenceFromFirstCase: {
      status: "enabled-for-synthetic-workbench",
      schema: "scrimed-clinical-evidence-controls-v1-2026-07-17",
      captures: [
        "cohort and eligibility",
        "baseline comparator",
        "intervention timestamps",
        "source lineage",
        "model prompt tool and policy versions",
        "reviewer action and override state",
        "operational outcomes",
        "safety events",
        "missingness and confounders",
        "site and subgroup attributes"
      ],
      causalityClaimAllowed: false,
      externalDistributionAllowed: false,
      humanReviewRequired: true
    },
    validation: {
      status:
        evaluations.every(
          (evaluation) =>
            evaluation.humanReviewRequired &&
            !evaluation.payerSubmissionAllowed &&
            evaluation.noPhiConfirmed &&
            evaluation.syntheticOnly
        ) && evaluations.some((evaluation) => evaluation.missingRequiredIds.length > 0)
          ? "pass"
          : "fail",
      checks: [
        {
          check: "missing-documentation-detected",
          passed: evaluations.some((evaluation) => evaluation.missingRequiredIds.length > 0),
          detail:
            "Synthetic prior-auth readiness packets must detect missing symptom, functional-status, visit-timing, evidence, and reviewer-attestation gaps."
        },
        {
          check: "payer-submission-blocked",
          passed: evaluations.every((evaluation) => !evaluation.payerSubmissionAllowed),
          detail: "The engine cannot submit prior authorizations, claims, appeals, or payer packets."
        },
        {
          check: "human-review-required",
          passed: evaluations.every((evaluation) => evaluation.humanReviewRequired),
          detail: "Every output remains reviewer-gated before external-facing use."
        },
        {
          check: "synthetic-no-phi-only",
          passed: evaluations.every(
            (evaluation) => evaluation.syntheticOnly && evaluation.noPhiConfirmed
          ),
          detail: "Fixtures and evaluations are synthetic/no-PHI only."
        }
      ]
    }
  };
}

export function buildDocumentationBeforeAuthorizationBrief() {
  const summary = getDocumentationBeforeAuthorizationSummary();

  return [
    "# SCRIMED PayerIQ Documentation-Before-Authorization",
    "",
    `Status: ${summary.status}`,
    `Workbench: ${summary.workbench.route}`,
    `API: ${summary.workbench.apiRoute}`,
    "",
    "## Product Value",
    "PayerIQ converts a registered synthetic authorization scenario into a source-traceable documentation completeness score, missing-evidence packet, reviewer queue, Definition-of-Done handoff, and claims-safe workflow economics preview.",
    "",
    "## Controls",
    "- Enumerated synthetic inputs only; no free-text patient or policy data.",
    "- Human review is required for every result.",
    "- Every workbench result emits a deterministic synthetic Case Evidence packet with lineage, versions, outcomes, safety events, missingness, confounders, and subgroup metadata.",
    "- Case Evidence remains descriptive-only; uncontrolled associations cannot support causal product claims.",
    "- Payer submission, medical-necessity determination, patient outreach, EHR writeback, and reimbursement claims remain blocked.",
    "- Export remains disabled until human review and an authorized distribution path exist.",
    "",
    "## Boundary",
    summary.boundary
  ].join("\n");
}
