import { workflowExecutions } from "./workflowExecutions";
import {
  getWorkflowExecutionResultBySlug,
  workflowExecutionResults
} from "./workflowExecutionResults";

export type WorkflowResultValidationStatus = "pass" | "fail";

export type WorkflowResultValidationDiff = {
  missingOutputSignals: string[];
  missingTraceSteps: string[];
  missingBlockedActions: string[];
  fingerprint: string;
};

export type WorkflowResultValidationCheck = {
  id: string;
  label: string;
  status: WorkflowResultValidationStatus;
  detail: string;
};

export type WorkflowResultValidationResult = {
  workflowSlug: string;
  workflowRoute: string;
  resultRoute?: string;
  status: WorkflowResultValidationStatus;
  passed: number;
  failed: number;
  diff: WorkflowResultValidationDiff;
  checks: WorkflowResultValidationCheck[];
};

function createCheck(
  id: string,
  label: string,
  passed: boolean,
  detail: string
): WorkflowResultValidationCheck {
  return {
    id,
    label,
    status: passed ? "pass" : "fail",
    detail
  };
}

function createFingerprint(source: unknown) {
  const text = JSON.stringify(source);
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return `workflow-result-${hash.toString(16).padStart(8, "0")}`;
}

export function validateWorkflowResultBySlug(
  workflowSlug: string
): WorkflowResultValidationResult | undefined {
  const workflow = workflowExecutions.find((item) => item.slug === workflowSlug);

  if (!workflow) {
    return undefined;
  }

  const result = getWorkflowExecutionResultBySlug(workflow.slug);
  const missingOutputSignals = workflow.expectedOutputs.filter(
    (signal) => !result?.outputSignals.includes(signal)
  );
  const missingTraceSteps = workflow.watchtowerTrace.filter(
    (step) => !result?.watchtowerTrace.includes(step)
  );
  const missingBlockedActions = workflow.prohibitedActions.filter(
    (action) => !result?.blockedActions.includes(action)
  );
  const diff = {
    missingOutputSignals,
    missingTraceSteps,
    missingBlockedActions,
    fingerprint: result
      ? createFingerprint({
          workflowSlug: workflow.slug,
          resultId: result.resultId,
          decisionState: result.decisionState,
          outputSignals: result.outputSignals,
          watchtowerTrace: result.watchtowerTrace,
          reviewState: result.reviewState,
          blockedActions: result.blockedActions,
          qualityEvidence: result.qualityEvidence
        })
      : "missing-workflow-result"
  };

  const checks = [
    createCheck(
      "result_fixture_bound",
      "Result fixture bound",
      Boolean(result),
      "Each staged workflow must have a deterministic result fixture."
    ),
    createCheck(
      "synthetic_only",
      "Synthetic-only result",
      result?.syntheticOnly === true,
      "Result fixtures must remain synthetic-only before live workflow automation."
    ),
    createCheck(
      "output_signals_preserved",
      "Output signals preserved",
      missingOutputSignals.length === 0,
      "Result fixture must preserve every expected workflow output signal."
    ),
    createCheck(
      "watchtower_trace_preserved",
      "Watchtower trace preserved",
      missingTraceSteps.length === 0,
      "Result fixture must preserve every workflow Watchtower trace step."
    ),
    createCheck(
      "blocked_actions_preserved",
      "Blocked actions preserved",
      missingBlockedActions.length === 0,
      "Result fixture must preserve every prohibited workflow action."
    ),
    createCheck(
      "human_review_state",
      "Human review state",
      Boolean(result?.reviewState) && Boolean(result?.reviewerRole),
      "Result fixture must name a review state and reviewer role."
    ),
    createCheck(
      "quality_evidence",
      "Quality evidence",
      Boolean(result) && result!.qualityEvidence.length >= 3,
      "Result fixture must retain quality evidence before promotion."
    ),
    createCheck(
      "route_inventory",
      "Route inventory",
      result?.route.startsWith("/workflows/results/") === true &&
        result?.apiRoute.startsWith("/api/workflows/results/") === true,
      "Result fixture must expose page and API routes."
    )
  ];
  const passed = checks.filter((check) => check.status === "pass").length;
  const failed = checks.length - passed;

  return {
    workflowSlug: workflow.slug,
    workflowRoute: workflow.route,
    resultRoute: result?.route,
    status: failed === 0 ? "pass" : "fail",
    passed,
    failed,
    diff,
    checks
  };
}

export function getWorkflowResultValidationResults() {
  const results = workflowExecutions
    .map((workflow) => validateWorkflowResultBySlug(workflow.slug))
    .filter((result): result is WorkflowResultValidationResult => Boolean(result));
  const passedResults = results.filter((result) => result.status === "pass").length;
  const failedResults = results.length - passedResults;
  const passedChecks = results.reduce((total, result) => total + result.passed, 0);
  const failedChecks = results.reduce((total, result) => total + result.failed, 0);

  return {
    service: "scrimed-workflow-result-validation",
    status: failedResults === 0 ? "pass" : "fail",
    workflowCount: workflowExecutions.length,
    resultFixtureCount: workflowExecutionResults.length,
    passedResults,
    failedResults,
    passedChecks,
    failedChecks,
    results,
    updated: "2026-05-31"
  };
}
