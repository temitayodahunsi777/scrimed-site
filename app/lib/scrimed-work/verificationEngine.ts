import { containsPhiRisk } from "./schemas";
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
  const outputText = input.outputText ?? "";
  const repeatedSpan = outputText
    .split(/\s+/)
    .some((word, index, words) => word.length > 5 && words.slice(index + 1, index + 8).includes(word));

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

export function verifyScrimedWorkResult(input: VerificationInput): VerificationResult {
  const artifact = input.artifact;
  const outputText = input.outputText ?? artifact?.content ?? "";
  const contract = input.session.definitionOfDone;
  const failures: string[] = [];
  const warnings: string[] = [];
  const evidence: string[] = [];

  if (!contract.goal || contract.requiredEvidence.length === 0) failures.push("definition-of-done-contract");
  if (input.session.evidence.length < contract.requiredEvidence.length) failures.push("required-evidence");
  if (artifact && artifact.sourceCitations.length === 0) failures.push("citation-presence");
  if (containsPhiRisk(outputText)) failures.push("phi-leakage-check");
  if (!hasRequiredSections(contract, outputText)) warnings.push("required-section-completeness");
  if (input.session.toolCalls.length > contract.maximumToolCalls) failures.push("tool-call-budget");
  if (input.session.plannedSteps.length > contract.maximumSteps) failures.push("step-budget");
  if (input.session.valueTelemetry.estimatedModelCostUsd > contract.maximumEstimatedCostUsd) failures.push("cost-budget");
  if (!input.session.rollbackMetadata.rollbackAvailable) failures.push("rollback-readiness");
  if (input.session.riskLevel === "high" && input.session.approvalCheckpoints.every((checkpoint) => checkpoint.status !== "approved")) {
    failures.push("human-approval-state");
  }

  const loop = detectDoomLoop({
    recentSteps: input.session.statusHistory.map((record) => record.reason),
    toolCallIds: input.session.toolCalls.map((call) => call.toolId),
    outputText
  });

  if (loop.loopDetected) failures.push("doom-loop-guard");

  evidence.push(...input.session.evidence.map((record) => record.evidenceId));

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
