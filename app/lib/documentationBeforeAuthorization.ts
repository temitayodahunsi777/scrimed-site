import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

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
