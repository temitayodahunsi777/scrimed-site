import { getSyntheticValidationResults } from "./syntheticValidation";
import { getIntegrationFixtureValidationResults } from "./integrationFixtureValidation";
import { getFixtureChangeReviewSummary } from "./fixtureChangeReviews";
import { getWorkflowPromotionReviewSummary } from "./workflowPromotionReviews";
import { getWorkflowExecutionResultSummary } from "./workflowExecutionResults";
import { getWorkflowExecutionAuditSummary } from "./workflowExecutionAudit";
import { getAuditPersistenceReadinessSummary } from "./auditPersistenceReadiness";
import { getIdentityAccessReadinessSummary } from "./identityAccessReadiness";
import { getExecutionAttemptReadinessSummary } from "./executionAttemptReadiness";
import { getRuntimeSafetyReadinessSummary } from "./runtimeSafetyReadiness";
import { getWorkflowResultValidationResults } from "./workflowResultValidation";
import { getWorkflowExecutionContractSummary } from "./workflowExecutionContracts";
import { getWorkflowImplementationReadinessSummary } from "./workflowImplementationReadiness";
import { getWorkflowExecutionSummary } from "./workflowExecutions";

export type QualityGate = {
  name: string;
  route: string;
  state: "active" | "bypassed" | "watch" | "planned";
  role: string;
  replacement?: string;
};

export const qualityGates: QualityGate[] = [
  {
    name: "Vercel deployment",
    route: "https://vercel.com/temitayo-dahunsis-projects/scrimed-site",
    state: "active",
    role: "Primary deploy gate while the site is being built and verified."
  },
  {
    name: "Synthetic clinical scenarios",
    route: "/synthetic/validation",
    state: "active",
    role: "Executable workflow validation without live patient data."
  },
  {
    name: "Integration contracts",
    route: "/integrations",
    state: "active",
    role: "Interface boundary before FHIR, HL7, claims, pricing, or synthetic connectors are implemented."
  },
  {
    name: "Integration fixture validation",
    route: "/integrations/fixture-validation",
    state: "active",
    role: "Synthetic request and expected-response fixture coverage, safeguard mapping, and diff fingerprints before live connector implementation."
  },
  {
    name: "Fixture change review",
    route: "/fixtures/change-review",
    state: "active",
    role: "Expected-output fingerprint approval before workflows, agents, or connectors depend on fixture changes."
  },
  {
    name: "Synthetic workflow execution",
    route: "/workflows",
    state: "active",
    role: "Staged module workflow execution readiness mapped to agent workflows, fixtures, quality gates, result fixtures, and Watchtower traces."
  },
  {
    name: "Workflow execution result fixtures",
    route: "/workflows/results",
    state: "active",
    role: "Deterministic synthetic result fixtures for staged workflow outputs, traces, review states, and blocked actions."
  },
  {
    name: "Workflow result validation",
    route: "/workflows/results/validation",
    state: "active",
    role: "Validation diff gate comparing result fixtures against expected outputs, Watchtower traces, blocked actions, and review-state requirements."
  },
  {
    name: "Workflow promotion review",
    route: "/workflows/promotion-review",
    state: "active",
    role: "Synthetic-only promotion approval records before any staged workflow can move toward production connectors or automation."
  },
  {
    name: "Governed execution API contracts",
    route: "/workflows/contracts",
    state: "active",
    role: "Contract-only request, response, precondition, audit, observability, and denied-capability boundary before governed execution APIs are implemented."
  },
  {
    name: "Identity and access readiness",
    route: "/workflows/identity-access",
    state: "planned",
    role: "Decision register for production identity provider, tenant isolation, role permissions, patient-context authorization, service authentication, consent, break-glass access, audit linkage, and regional identity controls.",
    replacement: "Deny-by-default governed execution endpoints remain the active replacement until production identity and access are approved."
  },
  {
    name: "Execution attempt readiness",
    route: "/workflows/execution-attempts",
    state: "planned",
    role: "Decision register for attempt identity, idempotency, durable attempt state, concurrency, retry, failure quarantine, runtime-safety handoff, privacy boundaries, and regional attempt compliance.",
    replacement: "Deny-by-default governed execution endpoints remain the active replacement until execution attempts can be deduplicated, persisted, audited, and safely replayed."
  },
  {
    name: "Runtime safety readiness",
    route: "/workflows/runtime-safety",
    state: "planned",
    role: "Decision register for runtime safety envelope, throttle policy, abuse signals, connector containment, emergency shutdown, Watchtower escalation, override rules, restoration protocol, and synthetic safety drills.",
    replacement: "Deny-by-default governed execution endpoints remain the active replacement until runtime acceptance, throttling, and emergency shutdown controls are approved."
  },
  {
    name: "Governed execution deny stubs",
    route: "/workflows/implementation-readiness",
    state: "active",
    role: "Deny-by-default execution endpoints that reject workflow execution before request-body parsing, attempt creation, connector access, workflow mutation, or patient-facing action."
  },
  {
    name: "Denied execution audit boundary",
    route: "/workflows/execution-audit",
    state: "active",
    role: "Metadata-only audit envelope, evidence headers, and never-capture policy for denied governed execution attempts."
  },
  {
    name: "Audit persistence readiness",
    route: "/workflows/audit-persistence",
    state: "planned",
    role: "Decision register for durable denied-event audit storage, retention, access, encryption, incident response, regional residency, and Watchtower alerting.",
    replacement: "Metadata-only denied execution audit boundaries remain the active replacement until persistence is approved."
  },
  {
    name: "Hub readiness checks",
    route: "/hub/readiness",
    state: "active",
    role: "Operational readiness visibility for product, API, and integration foundations."
  },
  {
    name: "Master operating context",
    route: "/operating-context",
    state: "active",
    role: "Company doctrine, decision framework, Atlas boundary, FaithCore boundary, and quality standard before product expansion."
  },
  {
    name: "Agent workflow registry",
    route: "/agents",
    state: "active",
    role: "Permission, input, output, audit-event, guardrail, interoperability, and human-review scope before specialized agent execution."
  },
  {
    name: "GitHub Actions CI",
    route: "https://github.com/temitayodahunsi777/scrimed-site/blob/main/.github/workflows/ci.yml",
    state: "bypassed",
    role: "Secondary build verification once workflow visibility and lockfile support are available.",
    replacement: "Vercel deployment plus executable synthetic validation are the current active quality path."
  },
  {
    name: "Live clinical integrations",
    route: "/integrations",
    state: "planned",
    role: "Future connector validation after synthetic scenarios and contracts are stable.",
    replacement: "Synthetic fixtures and contract pages remain the gate until live integration work is explicitly approved."
  }
];

export function getQualityGateSummary() {
  const syntheticValidation = getSyntheticValidationResults();
  const integrationFixtureValidation = getIntegrationFixtureValidationResults();
  const fixtureChangeReview = getFixtureChangeReviewSummary();
  const workflowExecution = getWorkflowExecutionSummary();
  const workflowExecutionResults = getWorkflowExecutionResultSummary();
  const workflowResultValidation = getWorkflowResultValidationResults();
  const workflowPromotionReview = getWorkflowPromotionReviewSummary();
  const workflowExecutionContracts = getWorkflowExecutionContractSummary();
  const workflowImplementationReadiness = getWorkflowImplementationReadinessSummary();
  const workflowExecutionAudit = getWorkflowExecutionAuditSummary();
  const auditPersistenceReadiness = getAuditPersistenceReadinessSummary();
  const identityAccessReadiness = getIdentityAccessReadinessSummary();
  const executionAttemptReadiness = getExecutionAttemptReadinessSummary();
  const runtimeSafetyReadiness = getRuntimeSafetyReadinessSummary();

  return {
    service: "scrimed-quality-gates",
    status:
      syntheticValidation.status === "pass" &&
      integrationFixtureValidation.status === "pass" &&
      fixtureChangeReview.status === "pass" &&
      workflowExecution.status === "synthetic-ready" &&
      workflowExecutionResults.status === "result-fixtures-ready" &&
      workflowResultValidation.status === "pass" &&
      workflowPromotionReview.status === "pass" &&
      workflowExecutionContracts.status === "contract-ready" &&
      workflowImplementationReadiness.status === "deny-stub-ready" &&
      workflowExecutionAudit.status === "audit-boundary-ready"
        ? "active-with-managed-bypass"
        : "attention-required",
    gates: qualityGates,
    active: qualityGates.filter((gate) => gate.state === "active").length,
    bypassed: qualityGates.filter((gate) => gate.state === "bypassed").length,
    planned: qualityGates.filter((gate) => gate.state === "planned").length,
    syntheticValidation,
    integrationFixtureValidation,
    fixtureChangeReview,
    workflowExecution,
    workflowExecutionResults,
    workflowResultValidation,
    workflowPromotionReview,
    workflowExecutionContracts,
    workflowImplementationReadiness,
    workflowExecutionAudit,
    auditPersistenceReadiness,
    identityAccessReadiness,
    executionAttemptReadiness,
    runtimeSafetyReadiness,
    updated: "2026-06-01"
  };
}
