import { getSyntheticValidationResults } from "./syntheticValidation";
import { getIntegrationFixtureValidationResults } from "./integrationFixtureValidation";
import { getFixtureChangeReviewSummary } from "./fixtureChangeReviews";
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
    role: "First module workflow execution readiness mapped to an agent workflow, fixtures, quality gates, and Watchtower traces."
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

  return {
    service: "scrimed-quality-gates",
    status:
      syntheticValidation.status === "pass" &&
      integrationFixtureValidation.status === "pass" &&
      fixtureChangeReview.status === "pass" &&
      workflowExecution.status === "synthetic-ready"
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
    updated: "2026-05-30"
  };
}
