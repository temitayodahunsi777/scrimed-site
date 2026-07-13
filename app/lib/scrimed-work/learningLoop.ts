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
