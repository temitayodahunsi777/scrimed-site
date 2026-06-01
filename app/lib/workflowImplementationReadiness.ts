import {
  getWorkflowExecutionContractBySlug,
  getWorkflowExecutionContracts
} from "./workflowExecutionContracts";

export type WorkflowImplementationReadinessStatus =
  | "deny-stub-ready"
  | "attention-required";

export type WorkflowImplementationPrerequisite = {
  name: string;
  state: "defined" | "decision-required";
  requirement: string;
};

export type WorkflowImplementationReadiness = {
  slug: string;
  name: string;
  module: string;
  route: string;
  apiRoute: string;
  guardedEndpoint: string;
  method: "POST";
  status: WorkflowImplementationReadinessStatus;
  contractRoute: string;
  contractStatus: string;
  runtimeMode: "deny-by-default";
  bodyHandling: string;
  deniedResponse: {
    statusCode: 423;
    code: "SCRIMED_EXECUTION_NOT_ENABLED";
    message: string;
  };
  prerequisites: WorkflowImplementationPrerequisite[];
  requiredBeforeExecution: string[];
  auditDisposition: string;
};

const prerequisiteTemplate: WorkflowImplementationPrerequisite[] = [
  {
    name: "Auth boundary",
    state: "decision-required",
    requirement: "Select production identity provider, session model, and service-to-service authentication."
  },
  {
    name: "Tenant identity",
    state: "decision-required",
    requirement: "Define organization, workspace, user, role, and patient-context authorization boundaries."
  },
  {
    name: "Persistence model",
    state: "decision-required",
    requirement: "Select durable storage for execution attempts, idempotency keys, review state, and trace evidence."
  },
  {
    name: "Audit logging",
    state: "defined",
    requirement: "Reject execution attempts before processing while retaining the required audit event taxonomy."
  },
  {
    name: "Privacy and security review",
    state: "decision-required",
    requirement: "Complete PHI/PII handling, retention, redaction, breach-response, and access-review decisions."
  },
  {
    name: "Connector boundary",
    state: "decision-required",
    requirement: "Approve FHIR, HL7, claims, pricing, and workflow connector scope before live data movement."
  },
  {
    name: "Rate limits and abuse controls",
    state: "decision-required",
    requirement: "Define throttling, misuse monitoring, alerting, and emergency shutdown controls."
  }
];

function buildReadiness(slug: string): WorkflowImplementationReadiness | undefined {
  const contract = getWorkflowExecutionContractBySlug(slug);

  if (!contract) {
    return undefined;
  }

  const status =
    contract.status === "contract-ready" ? "deny-stub-ready" : "attention-required";

  return {
    slug: contract.slug,
    name: `${contract.module} Governed Execution Readiness`,
    module: contract.module,
    route: `/workflows/implementation-readiness/${contract.slug}`,
    apiRoute: `/api/workflows/governed-execution/${contract.slug}`,
    guardedEndpoint: contract.plannedExecutionEndpoint,
    method: contract.method,
    status,
    contractRoute: contract.route,
    contractStatus: contract.status,
    runtimeMode: "deny-by-default",
    bodyHandling:
      "The guarded POST route intentionally does not parse request bodies until auth, persistence, privacy, audit, and connector boundaries are approved.",
    deniedResponse: {
      statusCode: 423,
      code: "SCRIMED_EXECUTION_NOT_ENABLED",
      message:
        "Governed execution is not enabled. The request was rejected before workflow processing."
    },
    prerequisites: prerequisiteTemplate,
    requiredBeforeExecution: [
      "production authentication and authorization decision",
      "tenant and role-bound identity model",
      "durable persistence and idempotency model",
      "auditable execution-attempt logging",
      "privacy and security approval",
      "production connector boundary approval",
      "rate-limit, misuse, and shutdown controls"
    ],
    auditDisposition:
      "Execution attempts are rejected before body parsing, connector access, workflow mutation, or patient-facing action."
  };
}

export function getWorkflowImplementationReadiness(): WorkflowImplementationReadiness[] {
  return getWorkflowExecutionContracts()
    .map((contract) => buildReadiness(contract.slug))
    .filter((readiness): readiness is WorkflowImplementationReadiness => Boolean(readiness));
}

export function getWorkflowImplementationReadinessBySlug(slug: string) {
  return buildReadiness(slug);
}

export function getWorkflowImplementationReadinessSummary() {
  const workflows = getWorkflowImplementationReadiness();
  const ready = workflows.filter((workflow) => workflow.status === "deny-stub-ready").length;
  const attentionRequired = workflows.length - ready;

  return {
    service: "scrimed-workflow-implementation-readiness",
    status: attentionRequired === 0 ? "deny-stub-ready" : "attention-required",
    workflowCount: workflows.length,
    ready,
    attentionRequired,
    runtimeMode: "deny-by-default",
    workflows,
    updated: "2026-05-31"
  };
}
