import { getAgentWorkflowBySlug } from "./agentWorkflows";
import { getIntegrationFixtureBySlug } from "./integrationFixtures";
import { validateIntegrationFixtureBySlug } from "./integrationFixtureValidation";
import { getSyntheticFixtureBySlug } from "./syntheticFixtures";
import { getSyntheticValidationResultBySlug } from "./syntheticValidation";
import { getFixtureChangeReviewSummary } from "./fixtureChangeReviews";

export type WorkflowExecutionStatus = "synthetic-ready" | "attention-required";

export type WorkflowExecutionCheck = {
  id: string;
  label: string;
  status: "pass" | "fail";
  detail: string;
};

export type WorkflowExecution = {
  slug: string;
  name: string;
  module: "CarePath AI" | "DocuTwin" | "TrialCore";
  route: string;
  apiRoute: string;
  status: "staged";
  objective: string;
  agentWorkflowSlug: string;
  syntheticScenarioId: string;
  integrationFixtureSlugs: string[];
  qualityGateRoutes: string[];
  requiredInputs: string[];
  expectedOutputs: string[];
  executionSteps: string[];
  watchtowerTrace: string[];
  humanReview: string;
  promotionCriteria: string[];
  prohibitedActions: string[];
};

export type WorkflowExecutionReadiness = {
  slug: string;
  route: string;
  status: WorkflowExecutionStatus;
  passed: number;
  failed: number;
  checks: WorkflowExecutionCheck[];
};

export const workflowExecutions: WorkflowExecution[] = [
  {
    slug: "carepath-high-risk-followup-routing",
    name: "CarePath High-Risk Follow-Up Routing",
    module: "CarePath AI",
    route: "/workflows/carepath-high-risk-followup-routing",
    apiRoute: "/api/workflows/executions/carepath-high-risk-followup-routing",
    status: "staged",
    objective:
      "Route a synthetic high-risk follow-up profile into a reviewable care navigation path without live patient data or autonomous clinical action.",
    agentWorkflowSlug: "scheduling-agent",
    syntheticScenarioId: "care-navigation-high-risk-followup",
    integrationFixtureSlugs: ["fhir-clinical-record-intake", "hl7-event-feed"],
    qualityGateRoutes: [
      "/synthetic/validation",
      "/integrations/fixture-validation",
      "/fixtures/change-review",
      "/quality"
    ],
    requiredInputs: [
      "synthetic intake summary",
      "risk markers",
      "care navigation constraints",
      "source trace",
      "review owner"
    ],
    expectedOutputs: [
      "navigation review recommendation",
      "urgency rationale",
      "transportation support consideration",
      "Watchtower trace",
      "human review requirement"
    ],
    executionSteps: [
      "load synthetic fixture",
      "validate agent workflow boundary",
      "confirm integration fixture readiness",
      "produce reviewable routing state",
      "record Watchtower trace",
      "hold for care navigator review"
    ],
    watchtowerTrace: [
      "synthetic_fixture_loaded",
      "agent_boundary_checked",
      "integration_fixtures_verified",
      "navigation_review_recommended",
      "care_navigator_review_required"
    ],
    humanReview: "care navigator review before outreach, scheduling, escalation, or patient-facing action",
    promotionCriteria: [
      "synthetic validation passes",
      "integration fixture validation passes",
      "fixture change reviews are approved",
      "agent workflow has explicit human-review trigger",
      "no live connector dependency is introduced"
    ],
    prohibitedActions: [
      "live patient routing",
      "autonomous appointment confirmation",
      "clinical diagnosis",
      "treatment order",
      "production data ingestion"
    ]
  }
];

function createCheck(
  id: string,
  label: string,
  passed: boolean,
  detail: string
): WorkflowExecutionCheck {
  return {
    id,
    label,
    status: passed ? "pass" : "fail",
    detail
  };
}

export function getWorkflowExecutionBySlug(slug: string) {
  return workflowExecutions.find((workflow) => workflow.slug === slug);
}

export function validateWorkflowExecution(
  workflow: WorkflowExecution
): WorkflowExecutionReadiness {
  const agentWorkflow = getAgentWorkflowBySlug(workflow.agentWorkflowSlug);
  const syntheticFixture = getSyntheticFixtureBySlug(workflow.syntheticScenarioId);
  const syntheticValidation = getSyntheticValidationResultBySlug(
    workflow.syntheticScenarioId
  );
  const integrationValidations = workflow.integrationFixtureSlugs.map((slug) =>
    validateIntegrationFixtureBySlug(slug)
  );
  const integrationFixtures = workflow.integrationFixtureSlugs.map((slug) =>
    getIntegrationFixtureBySlug(slug)
  );
  const fixtureChangeReview = getFixtureChangeReviewSummary();

  const checks = [
    createCheck(
      "agent_workflow_bound",
      "Agent workflow bound",
      Boolean(agentWorkflow),
      "Workflow execution must map to an existing governed agent workflow."
    ),
    createCheck(
      "agent_human_review",
      "Agent human review",
      agentWorkflow?.humanReview.required === true,
      "Mapped agent workflow must require human review before action."
    ),
    createCheck(
      "synthetic_fixture_bound",
      "Synthetic fixture bound",
      Boolean(syntheticFixture),
      "Workflow execution must depend on a structured synthetic fixture."
    ),
    createCheck(
      "synthetic_validation_passes",
      "Synthetic validation passes",
      syntheticValidation?.status === "pass",
      "Synthetic validation must pass before workflow execution is considered ready."
    ),
    createCheck(
      "integration_fixtures_bound",
      "Integration fixtures bound",
      integrationFixtures.every(Boolean),
      "Workflow execution must name the integration fixtures it expects before live connector work."
    ),
    createCheck(
      "integration_validation_passes",
      "Integration validation passes",
      integrationValidations.every((validation) => validation?.status === "pass"),
      "Every mapped integration fixture must pass validation."
    ),
    createCheck(
      "fixture_reviews_approved",
      "Fixture reviews approved",
      fixtureChangeReview.status === "pass",
      "Expected-output fingerprints must have active change-review approval."
    ),
    createCheck(
      "quality_gates_declared",
      "Quality gates declared",
      workflow.qualityGateRoutes.includes("/quality") &&
        workflow.qualityGateRoutes.includes("/fixtures/change-review"),
      "Workflow execution must declare quality and fixture-review gates."
    ),
    createCheck(
      "watchtower_trace",
      "Watchtower trace",
      workflow.watchtowerTrace.length >= 4,
      "Workflow execution must expose deterministic Watchtower trace steps."
    ),
    createCheck(
      "no_live_connector_dependency",
      "No live connector dependency",
      workflow.prohibitedActions.includes("production data ingestion"),
      "First workflow execution must remain synthetic-only and block production data ingestion."
    )
  ];

  const passed = checks.filter((check) => check.status === "pass").length;
  const failed = checks.length - passed;

  return {
    slug: workflow.slug,
    route: workflow.route,
    status: failed === 0 ? "synthetic-ready" : "attention-required",
    passed,
    failed,
    checks
  };
}

export function getWorkflowExecutionReadinessBySlug(slug: string) {
  const workflow = getWorkflowExecutionBySlug(slug);

  if (!workflow) {
    return undefined;
  }

  return validateWorkflowExecution(workflow);
}

export function getWorkflowExecutionSummary() {
  const readiness = workflowExecutions.map(validateWorkflowExecution);
  const ready = readiness.filter((result) => result.status === "synthetic-ready").length;
  const attentionRequired = readiness.length - ready;

  return {
    service: "scrimed-workflow-executions",
    status: attentionRequired === 0 ? "synthetic-ready" : "attention-required",
    workflowCount: workflowExecutions.length,
    ready,
    attentionRequired,
    workflows: workflowExecutions,
    readiness,
    updated: "2026-05-30"
  };
}
