import {
  getWorkflowExecutionReadinessBySlug,
  workflowExecutions
} from "./workflowExecutions";
import { getWorkflowExecutionResultBySlug } from "./workflowExecutionResults";
import { getWorkflowPromotionReviewBySlug } from "./workflowPromotionReviews";
import { validateWorkflowResultBySlug } from "./workflowResultValidation";

export type WorkflowExecutionContractStatus =
  | "contract-ready"
  | "attention-required";

export type WorkflowExecutionContract = {
  slug: string;
  name: string;
  module: string;
  route: string;
  apiRoute: string;
  status: WorkflowExecutionContractStatus;
  contractVersion: string;
  runtimeMode: "synthetic-contract-only";
  plannedExecutionEndpoint: string;
  method: "POST";
  objective: string;
  requestSchema: string[];
  responseSchema: string[];
  preconditions: string[];
  approvalGates: string[];
  auditEvents: string[];
  observabilitySignals: string[];
  humanReview: string;
  deniedCapabilities: string[];
  promotionBoundary: string;
};

function buildAuditEvents(slug: string) {
  return [
    `${slug}: contract request received`,
    `${slug}: preconditions evaluated`,
    `${slug}: result fixture compared`,
    `${slug}: human review retained`,
    `${slug}: execution denied until production gates pass`
  ];
}

function buildContract(workflowSlug: string): WorkflowExecutionContract | undefined {
  const workflow = workflowExecutions.find((item) => item.slug === workflowSlug);

  if (!workflow) {
    return undefined;
  }

  const readiness = getWorkflowExecutionReadinessBySlug(workflow.slug);
  const result = getWorkflowExecutionResultBySlug(workflow.slug);
  const resultValidation = validateWorkflowResultBySlug(workflow.slug);
  const promotionReview = getWorkflowPromotionReviewBySlug(workflow.slug);
  const ready =
    readiness?.status === "synthetic-ready" &&
    Boolean(result) &&
    resultValidation?.status === "pass" &&
    promotionReview?.status === "approved-for-synthetic-staging";

  return {
    slug: workflow.slug,
    name: `${workflow.name} Governed Execution Contract`,
    module: workflow.module,
    route: `/workflows/contracts/${workflow.slug}`,
    apiRoute: `/api/workflows/contracts/${workflow.slug}`,
    status: ready ? "contract-ready" : "attention-required",
    contractVersion: "v0.1-synthetic",
    runtimeMode: "synthetic-contract-only",
    plannedExecutionEndpoint: `/api/workflows/governed-execution/${workflow.slug}`,
    method: "POST",
    objective: workflow.objective,
    requestSchema: [
      ...workflow.requiredInputs,
      "syntheticOnly",
      "contractVersion",
      "reviewOwner",
      "idempotencyKey",
      "requestTraceId"
    ],
    responseSchema: [
      ...(result?.outputSignals ?? workflow.expectedOutputs),
      "decisionState",
      "reviewState",
      "reviewerRole",
      "watchtowerTrace",
      "blockedActions",
      "qualityEvidence"
    ],
    preconditions: [
      "workflow execution readiness is synthetic-ready",
      "workflow result validation is passing",
      "workflow promotion review is approved for synthetic staging",
      "result fixture is synthetic-only",
      "production connector boundary remains blocked"
    ],
    approvalGates: [
      "/synthetic/validation",
      "/integrations/fixture-validation",
      "/fixtures/change-review",
      "/workflows/results/validation",
      "/workflows/promotion-review",
      "/quality"
    ],
    auditEvents: buildAuditEvents(workflow.slug),
    observabilitySignals: workflow.watchtowerTrace,
    humanReview: workflow.humanReview,
    deniedCapabilities: workflow.prohibitedActions,
    promotionBoundary:
      "This contract describes the governed execution shape only; no live workflow execution, production data ingestion, or patient-facing action is enabled."
  };
}

export function getWorkflowExecutionContracts(): WorkflowExecutionContract[] {
  return workflowExecutions
    .map((workflow) => buildContract(workflow.slug))
    .filter((contract): contract is WorkflowExecutionContract => Boolean(contract));
}

export function getWorkflowExecutionContractBySlug(slug: string) {
  return buildContract(slug);
}

export function getWorkflowExecutionContractSummary() {
  const contracts = getWorkflowExecutionContracts();
  const ready = contracts.filter((contract) => contract.status === "contract-ready").length;
  const attentionRequired = contracts.length - ready;

  return {
    service: "scrimed-workflow-execution-contracts",
    status: attentionRequired === 0 ? "contract-ready" : "attention-required",
    contractCount: contracts.length,
    ready,
    attentionRequired,
    contracts,
    updated: "2026-05-31"
  };
}
