import {
  getWorkflowImplementationReadiness,
  getWorkflowImplementationReadinessBySlug
} from "./workflowImplementationReadiness";

export type WorkflowExecutionAuditStatus =
  | "audit-boundary-ready"
  | "attention-required";

export type WorkflowExecutionAuditBoundary = {
  slug: string;
  name: string;
  module: string;
  route: string;
  apiRoute: string;
  guardedEndpoint: string;
  status: WorkflowExecutionAuditStatus;
  eventName: "workflow.execution.denied";
  eventVersion: "v0.1";
  runtimeMode: "deny-by-default";
  deniedResponseCode: 423;
  evidenceHeaders: string[];
  capturePolicy: {
    capture: string[];
    neverCapture: string[];
    persistenceStatus: "persistence-decision-required";
  };
  auditEnvelope: string[];
  privacyBoundary: string;
  promotionRequirement: string;
};

function buildAuditBoundary(slug: string): WorkflowExecutionAuditBoundary | undefined {
  const readiness = getWorkflowImplementationReadinessBySlug(slug);

  if (!readiness) {
    return undefined;
  }

  return {
    slug: readiness.slug,
    name: `${readiness.module} Denied Execution Audit Boundary`,
    module: readiness.module,
    route: `/workflows/execution-audit/${readiness.slug}`,
    apiRoute: `/api/workflows/execution-audit/${readiness.slug}`,
    guardedEndpoint: readiness.guardedEndpoint,
    status:
      readiness.status === "deny-stub-ready" ? "audit-boundary-ready" : "attention-required",
    eventName: "workflow.execution.denied",
    eventVersion: "v0.1",
    runtimeMode: readiness.runtimeMode,
    deniedResponseCode: readiness.deniedResponse.statusCode,
    evidenceHeaders: [
      "x-scrimed-guard: deny-by-default",
      "x-scrimed-audit-event: workflow.execution.denied",
      `x-scrimed-workflow: ${readiness.slug}`,
      "x-scrimed-body-handling: not-parsed"
    ],
    capturePolicy: {
      capture: [
        "workflow slug",
        "guarded endpoint",
        "HTTP method",
        "denied response code",
        "runtime mode",
        "contract route",
        "readiness route",
        "request trace id when supplied in headers"
      ],
      neverCapture: [
        "request body",
        "patient identifiers",
        "clinical free text",
        "production connector payloads",
        "authentication secrets",
        "payment or insurance member identifiers"
      ],
      persistenceStatus: "persistence-decision-required"
    },
    auditEnvelope: [
      "eventName",
      "eventVersion",
      "workflow",
      "runtimeMode",
      "guardedEndpoint",
      "deniedResponseCode",
      "bodyParsed",
      "connectorAccessed",
      "workflowMutated",
      "patientFacingAction",
      "requiredBeforeExecution"
    ],
    privacyBoundary:
      "The denied execution audit boundary is metadata-only and explicitly excludes request bodies, patient identifiers, clinical free text, and connector payloads until a persistence and privacy model is approved.",
    promotionRequirement:
      "Durable audit storage, retention policy, access review, and incident response ownership must be approved before governed execution moves beyond deny-by-default."
  };
}

export function getWorkflowExecutionAuditBoundaries(): WorkflowExecutionAuditBoundary[] {
  return getWorkflowImplementationReadiness()
    .map((workflow) => buildAuditBoundary(workflow.slug))
    .filter((boundary): boundary is WorkflowExecutionAuditBoundary => Boolean(boundary));
}

export function getWorkflowExecutionAuditBoundaryBySlug(slug: string) {
  return buildAuditBoundary(slug);
}

export function getWorkflowExecutionAuditSummary() {
  const boundaries = getWorkflowExecutionAuditBoundaries();
  const ready = boundaries.filter((boundary) => boundary.status === "audit-boundary-ready").length;
  const attentionRequired = boundaries.length - ready;

  return {
    service: "scrimed-workflow-execution-audit",
    status: attentionRequired === 0 ? "audit-boundary-ready" : "attention-required",
    boundaryCount: boundaries.length,
    ready,
    attentionRequired,
    persistenceStatus: "persistence-decision-required",
    boundaries,
    updated: "2026-06-01"
  };
}
