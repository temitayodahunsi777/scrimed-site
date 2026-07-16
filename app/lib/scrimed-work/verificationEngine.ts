import { containsPhiRisk } from "./schemas";
import { hasSatisfiedRequiredHumanApproval } from "./sessionLifecycle";
import type { DefinitionOfDoneContract, VerificationResult, WorkArtifact, WorkSession } from "./types";

export type VerificationInput = {
  session: WorkSession;
  artifact?: WorkArtifact;
  outputText?: string;
};

export function detectDoomLoop(input: {
  recentSteps: string[];
  toolCallIds: string[];
  outputText?: string;
}) {
  const repeatedSteps = input.recentSteps.length - new Set(input.recentSteps).size;
  const repeatedToolCalls = input.toolCallIds.length - new Set(input.toolCallIds).size;
  const words = (input.outputText ?? "")
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean);
  const spans = words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(" "));
  const spanCounts = new Map<string, number>();
  for (const span of spans) spanCounts.set(span, (spanCounts.get(span) ?? 0) + 1);
  const repeatedSpan = Math.max(0, ...spanCounts.values()) >= 3;

  return {
    loopDetected: repeatedSteps >= 2 || repeatedToolCalls >= 2 || repeatedSpan,
    repeatedSteps,
    repeatedToolCalls,
    repeatedSpan,
    recommendedAction: repeatedSteps >= 2 || repeatedToolCalls >= 2 || repeatedSpan
      ? "pause_for_review"
      : "continue"
  };
}

function hasRequiredSections(contract: DefinitionOfDoneContract, text: string) {
  return contract.successCriteria.every((criterion) =>
    text.toLowerCase().includes(criterion.toLowerCase().split(/\W+/)[0] ?? criterion.toLowerCase())
  );
}

function isIndependentApprovalRequirement(requirement: string) {
  return requirement.trim().toLowerCase() === "independent reviewer approval";
}

export function collectVerificationEvidenceIds(session: WorkSession) {
  const evidenceIds = session.evidence.map((record) => record.evidenceId);
  const requiresIndependentApprovalEvidence =
    session.definitionOfDone.requiredEvidence.some(isIndependentApprovalRequirement);
  const explicitApprovalEvidence = session.evidence.some(
    (record) =>
      isIndependentApprovalRequirement(record.title) ||
      isIndependentApprovalRequirement(record.supports)
  );
  const approvedCheckpoint = session.approvalCheckpoints.find(
    (checkpoint) => checkpoint.status === "approved"
  );

  if (
    requiresIndependentApprovalEvidence &&
    !explicitApprovalEvidence &&
    approvedCheckpoint
  ) {
    evidenceIds.push(`evidence_${approvedCheckpoint.auditHash}`);
  }

  return evidenceIds;
}

export function verifyScrimedWorkResult(input: VerificationInput): VerificationResult {
  const artifact = input.artifact;
  const outputText = input.outputText ?? artifact?.content ?? "";
  const contract = input.session.definitionOfDone;
  const failures: string[] = [];
  const warnings: string[] = [];
  const evidence: string[] = [];
  const verificationEvidenceIds = collectVerificationEvidenceIds(input.session);

  if (!contract.goal || contract.requiredEvidence.length === 0) failures.push("definition-of-done-contract");
  if (verificationEvidenceIds.length < contract.requiredEvidence.length) failures.push("required-evidence");
  if (artifact && artifact.sourceCitations.length === 0) failures.push("citation-presence");
  if (containsPhiRisk(outputText)) failures.push("phi-leakage-check");
  if (!hasRequiredSections(contract, outputText)) warnings.push("required-section-completeness");
  if (input.session.toolCalls.length > contract.maximumToolCalls) failures.push("tool-call-budget");
  if (input.session.plannedSteps.length > contract.maximumSteps) failures.push("step-budget");
  if (input.session.valueTelemetry.estimatedModelCostUsd > contract.maximumEstimatedCostUsd) failures.push("cost-budget");
  if (!input.session.rollbackMetadata.rollbackAvailable) failures.push("rollback-readiness");
  if (!hasSatisfiedRequiredHumanApproval(input.session)) {
    failures.push("human-approval-state");
  }

  const loop = detectDoomLoop({
    recentSteps: input.session.statusHistory.map((record) => record.reason),
    toolCallIds: input.session.toolCalls.map((call) => call.toolId),
    outputText
  });

  if (loop.loopDetected) failures.push("doom-loop-guard");

  evidence.push(...verificationEvidenceIds);

  const totalCriteria = 11;
  const passedCriteria = Math.max(0, totalCriteria - failures.length);

  return {
    allPass: failures.length === 0,
    criteriaPassRate: Math.round((passedCriteria / totalCriteria) * 100),
    failedCriteria: failures,
    warnings,
    evidence,
    recommendedAction:
      failures.length === 0
        ? "complete"
        : failures.includes("human-approval-state") || failures.includes("doom-loop-guard")
          ? "pause_for_review"
          : "revise",
    eligibleForCompletion: failures.length === 0
  };
}
