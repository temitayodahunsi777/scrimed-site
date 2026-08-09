import { createAuditHash } from "./audit";

export type LearningLoopArtifact = {
  correctionId: string;
  sourceSessionId: string;
  correction: string;
  rootCause: string;
  changedArtifact: "policy" | "prompt" | "router" | "workflow" | "evaluation";
  testAdded: string;
  beforeMetric: string;
  afterMetricTarget: string;
  approvalStatus: "pending_review" | "approved_for_test" | "rejected" | "rolled_out";
  rolloutStatus: "not_deployed" | "canary_ready" | "blocked";
  auditHash: string;
};

export function buildLearningLoopProposal(input: Omit<LearningLoopArtifact, "auditHash">): LearningLoopArtifact {
  return {
    ...input,
    auditHash: createAuditHash(input)
  };
}

export const sampleLearningLoopArtifacts: LearningLoopArtifact[] = [
  buildLearningLoopProposal({
    correctionId: "learn-context-citation-gap",
    sourceSessionId: "work_session_care_coordination_synthetic",
    correction: "Require at least two cited context records before artifact export.",
    rootCause: "Artifact writer produced a draft with insufficient source diversity.",
    changedArtifact: "evaluation",
    testAdded: "scrimed-work citation-source-diversity contract",
    beforeMetric: "citation diversity 1 source",
    afterMetricTarget: "citation diversity >= 2 sources",
    approvalStatus: "pending_review",
    rolloutStatus: "not_deployed"
  })
];

export type OutcomeLearningStage =
  | "hypothesis"
  | "proposed_action"
  | "authorization"
  | "execution"
  | "measurement"
  | "feedback_classification"
  | "updated_hypothesis"
  | "next_proposed_action"
  | "promotion_review"
  | "completed"
  | "blocked";

export type OutcomeFeedbackMode = "no-feedback-control" | "randomized-feedback-control" | "measured-feedback";

export type OutcomeLearningController = {
  controllerId: string;
  sourceSessionId: string;
  researchOwner: string;
  hypothesis: string;
  proposedAction: string;
  stage: OutcomeLearningStage;
  feedbackMode: OutcomeFeedbackMode;
  feedbackProvenance: string[];
  fixedEvaluationSetId: string;
  capabilityThreshold: number;
  measuredCapability: number | null;
  authorizationStatus: "pending" | "approved-for-sandbox" | "rejected";
  humanReviewStatus: "pending" | "approved" | "rejected";
  canaryStatus: "not-configured" | "configured-not-started" | "passed" | "failed";
  rollbackStatus: "not-tested" | "tested";
  operatingMode: "synthetic-research-sandbox";
  clinicalProductionMutationAllowed: false;
  promotionEligible: boolean;
  history: Array<{
    from: OutcomeLearningStage;
    to: OutcomeLearningStage;
    reason: string;
    auditHash: string;
  }>;
  auditHash: string;
};

const outcomeLearningTransitions: Record<OutcomeLearningStage, OutcomeLearningStage[]> = {
  hypothesis: ["proposed_action", "blocked"],
  proposed_action: ["authorization", "blocked"],
  authorization: ["execution", "blocked"],
  execution: ["measurement", "blocked"],
  measurement: ["feedback_classification", "blocked"],
  feedback_classification: ["updated_hypothesis", "blocked"],
  updated_hypothesis: ["next_proposed_action", "blocked"],
  next_proposed_action: ["promotion_review", "completed", "blocked"],
  promotion_review: ["completed", "blocked"],
  completed: [],
  blocked: []
};

function safeLearningReference(value: string) {
  return /^[a-z0-9][a-z0-9._:/-]{2,180}$/i.test(value) && !/token|secret|password|bearer/i.test(value);
}

function learningPromotionEligible(controller: OutcomeLearningController) {
  return (
    controller.stage === "promotion_review" &&
    controller.authorizationStatus === "approved-for-sandbox" &&
    controller.humanReviewStatus === "approved" &&
    controller.measuredCapability !== null &&
    controller.measuredCapability >= controller.capabilityThreshold &&
    controller.feedbackProvenance.length > 0 &&
    controller.feedbackMode !== "no-feedback-control" &&
    controller.canaryStatus === "passed" &&
    controller.rollbackStatus === "tested"
  );
}

export function createOutcomeLearningController(input: {
  controllerId: string;
  sourceSessionId: string;
  researchOwner: string;
  hypothesis: string;
  proposedAction: string;
  feedbackMode: OutcomeFeedbackMode;
  fixedEvaluationSetId: string;
  capabilityThreshold: number;
}): OutcomeLearningController {
  if (
    !safeLearningReference(input.controllerId) ||
    !safeLearningReference(input.sourceSessionId) ||
    !safeLearningReference(input.researchOwner) ||
    !safeLearningReference(input.fixedEvaluationSetId) ||
    input.capabilityThreshold < 0 ||
    input.capabilityThreshold > 1
  ) {
    throw new Error("Invalid outcome learning controller metadata");
  }
  const controller: OutcomeLearningController = {
    ...input,
    stage: "hypothesis",
    feedbackProvenance: [],
    measuredCapability: null,
    authorizationStatus: "pending",
    humanReviewStatus: "pending",
    canaryStatus: "not-configured",
    rollbackStatus: "not-tested",
    operatingMode: "synthetic-research-sandbox",
    clinicalProductionMutationAllowed: false,
    promotionEligible: false,
    history: [],
    auditHash: ""
  };
  return { ...controller, auditHash: createAuditHash(controller) };
}

export function advanceOutcomeLearningController(
  controller: OutcomeLearningController,
  input: {
    nextStage: OutcomeLearningStage;
    reason: string;
    authorizationStatus?: OutcomeLearningController["authorizationStatus"];
    humanReviewStatus?: OutcomeLearningController["humanReviewStatus"];
    measuredCapability?: number;
    feedbackProvenance?: string[];
    canaryStatus?: OutcomeLearningController["canaryStatus"];
    rollbackStatus?: OutcomeLearningController["rollbackStatus"];
  }
): OutcomeLearningController {
  if (!outcomeLearningTransitions[controller.stage].includes(input.nextStage)) {
    throw new Error(`Invalid outcome learning transition: ${controller.stage} -> ${input.nextStage}`);
  }
  if (input.measuredCapability !== undefined && (input.measuredCapability < 0 || input.measuredCapability > 1)) {
    throw new Error("Measured capability must be between 0 and 1");
  }
  if (input.feedbackProvenance?.some((reference) => !safeLearningReference(reference))) {
    throw new Error("Feedback provenance contains an unsafe reference");
  }
  if (input.nextStage === "execution" && (input.authorizationStatus ?? controller.authorizationStatus) !== "approved-for-sandbox") {
    throw new Error("Outcome learning execution requires sandbox authorization");
  }

  const event = {
    from: controller.stage,
    to: input.nextStage,
    reason: input.reason,
    auditHash: createAuditHash({ controllerId: controller.controllerId, from: controller.stage, ...input })
  };
  const next: OutcomeLearningController = {
    ...controller,
    stage: input.nextStage,
    authorizationStatus: input.authorizationStatus ?? controller.authorizationStatus,
    humanReviewStatus: input.humanReviewStatus ?? controller.humanReviewStatus,
    measuredCapability: input.measuredCapability ?? controller.measuredCapability,
    feedbackProvenance: input.feedbackProvenance ?? controller.feedbackProvenance,
    canaryStatus: input.canaryStatus ?? controller.canaryStatus,
    rollbackStatus: input.rollbackStatus ?? controller.rollbackStatus,
    history: [...controller.history, event],
    promotionEligible: false,
    auditHash: ""
  };
  next.promotionEligible = learningPromotionEligible(next);
  next.auditHash = createAuditHash({ ...next, auditHash: undefined });
  return next;
}

export function evaluateOutcomeLearningPromotion(controller: OutcomeLearningController) {
  const blockers: string[] = [];
  if (controller.stage !== "promotion_review") blockers.push("controller is not in promotion review");
  if (controller.authorizationStatus !== "approved-for-sandbox") blockers.push("sandbox authorization is missing");
  if (controller.humanReviewStatus !== "approved") blockers.push("human review is incomplete");
  if (controller.measuredCapability === null || controller.measuredCapability < controller.capabilityThreshold) {
    blockers.push("capability threshold is not satisfied");
  }
  if (controller.feedbackMode === "no-feedback-control") blockers.push("no-feedback control cannot justify promotion");
  if (controller.feedbackProvenance.length === 0) blockers.push("feedback provenance is missing");
  if (controller.canaryStatus !== "passed") blockers.push("canary has not passed");
  if (controller.rollbackStatus !== "tested") blockers.push("rollback has not been tested");

  return {
    eligible: blockers.length === 0 && controller.promotionEligible,
    deploymentAuthority: "not-granted" as const,
    clinicalProductionMutationAllowed: false as const,
    requiredAction: blockers.length ? "retain-in-sandbox" as const : "request-separate-promotion-approval" as const,
    blockers,
    auditHash: createAuditHash({ controllerId: controller.controllerId, blockers, stage: controller.stage })
  };
}

export const sampleOutcomeLearningControllers = [
  createOutcomeLearningController({
    controllerId: "trialcore-no-feedback-control",
    sourceSessionId: "synthetic-research-session-001",
    researchOwner: "research-ops",
    hypothesis: "A governed retrieval change may improve synthetic citation completeness.",
    proposedAction: "Evaluate the retrieval change against a fixed synthetic set.",
    feedbackMode: "no-feedback-control",
    fixedEvaluationSetId: "synthetic-fixed-eval-citations-v1",
    capabilityThreshold: 0.9
  }),
  createOutcomeLearningController({
    controllerId: "trialcore-randomized-feedback-control",
    sourceSessionId: "synthetic-research-session-002",
    researchOwner: "research-ops",
    hypothesis: "Measured feedback should outperform randomized feedback on a fixed synthetic set.",
    proposedAction: "Run blinded measured and randomized feedback arms in the sandbox.",
    feedbackMode: "randomized-feedback-control",
    fixedEvaluationSetId: "synthetic-fixed-eval-feedback-v1",
    capabilityThreshold: 0.9
  })
];
