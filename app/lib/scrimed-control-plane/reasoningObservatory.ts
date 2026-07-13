import { evaluateScrimedReasoningStability } from "../scrimedReasoningStability";
import { createAuditHash, detectDoomLoop } from "../scrimed-work";

export type ReasoningObservatoryInput = {
  sessionId: string;
  declaredObjective: string;
  currentPlan: string[];
  currentStep: string;
  evidenceGathered: string[];
  evidenceAccepted: string[];
  evidenceRejected: string[];
  assumptions: string[];
  unresolvedQuestions: string[];
  contradictionFlags: string[];
  riskScore: number;
  policyDecision: string;
  modelRoute: string;
  toolHistory: string[];
  verificationStatus: string;
  approvalStatus: string;
  optimizationSignals: string[];
};

const driftPatterns: Array<[RegExp, string]> = [
  [/speed over safety|skip review|faster than verification/i, "speed-over-safety"],
  [/complete (?:at all costs|without evidence)|mark complete early/i, "completion-over-correctness"],
  [/save tokens.*(?:citation|evidence)|skip sources/i, "token-savings-over-evidence"],
  [/revenue.*(?:over|instead of).*patient|patient benefit.*secondary/i, "revenue-over-patient-benefit"],
  [/automate.*(?:without|skip).*governance|bypass approval/i, "automation-over-governance"]
];

export function observeReasoningWorkspace(input: ReasoningObservatoryInput) {
  const driftText = [input.declaredObjective, input.currentStep, ...input.currentPlan, ...input.optimizationSignals].join(" ");
  const objectiveDriftFlags = driftPatterns.filter(([pattern]) => pattern.test(driftText)).map(([, flag]) => flag);
  const loop = detectDoomLoop({
    recentSteps: input.currentPlan,
    toolCallIds: input.toolHistory,
    outputText: input.currentStep
  });
  const stability = evaluateScrimedReasoningStability({
    caseId: input.sessionId,
    taskFamily: "control-plane-operational-workspace",
    outputText: `${input.currentStep}. ${input.unresolvedQuestions.join(". ")}`,
    retryCount: Math.max(0, input.toolHistory.length - new Set(input.toolHistory).size),
    evidenceCount: input.evidenceAccepted.length,
    hasClinicalClaim: input.riskScore >= 70,
    hasUncertaintyStatement: input.unresolvedQuestions.length > 0
  });
  const pauseRequired = objectiveDriftFlags.length > 0 || loop.loopDetected || stability.safetyStatus === "blocked" || input.contradictionFlags.length > 0;

  return {
    sessionId: input.sessionId,
    declaredObjective: input.declaredObjective,
    currentPlan: input.currentPlan,
    currentStep: input.currentStep,
    evidenceGathered: input.evidenceGathered,
    evidenceAccepted: input.evidenceAccepted,
    evidenceRejected: input.evidenceRejected,
    assumptions: input.assumptions,
    unresolvedQuestions: input.unresolvedQuestions,
    contradictionFlags: input.contradictionFlags,
    riskScore: input.riskScore,
    policyDecision: input.policyDecision,
    modelRoute: input.modelRoute,
    toolHistory: input.toolHistory,
    verificationStatus: input.verificationStatus,
    approvalStatus: input.approvalStatus,
    objectiveDriftFlags,
    loop,
    stability,
    pauseRequired,
    recommendedAction: pauseRequired ? "pause-and-require-human-review" : "continue-within-definition-of-done",
    hiddenChainOfThoughtStored: false,
    auditHash: createAuditHash({ sessionId: input.sessionId, objectiveDriftFlags, loop, pauseRequired })
  };
}

export const sampleReasoningWorkspace: ReasoningObservatoryInput = {
  sessionId: "work_session_care_coordination_synthetic",
  declaredObjective: "Prepare a cited synthetic care-coordination brief for human review.",
  currentPlan: ["validate scope", "retrieve evidence", "prepare draft", "verify", "queue review"],
  currentStep: "Verify citations and unresolved limitations.",
  evidenceGathered: ["ctx-care-coordination-sop", "ctx-fhir-preview"],
  evidenceAccepted: ["ctx-care-coordination-sop", "ctx-fhir-preview"],
  evidenceRejected: [],
  assumptions: ["Fixture data is synthetic."],
  unresolvedQuestions: ["Qualified reviewer approval remains pending."],
  contradictionFlags: [],
  riskScore: 72,
  policyDecision: "require-human-review",
  modelRoute: "SOL_CLASS/synthetic-no-call",
  toolHistory: ["context-search", "artifact-draft", "verification"],
  verificationStatus: "awaiting-human-approval",
  approvalStatus: "pending",
  optimizationSignals: ["correctness and evidence before speed"]
};
