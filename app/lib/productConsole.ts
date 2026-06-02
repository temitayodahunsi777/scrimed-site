import { getAgentWorkflowSummary } from "./agentWorkflows";
import { getRuntimeSafetyReadinessSummary } from "./runtimeSafetyReadiness";
import { getWorkflowExecutionContractSummary } from "./workflowExecutionContracts";
import { getWorkflowExecutionResultSummary } from "./workflowExecutionResults";
import { getWorkflowExecutionSummary, workflowExecutions } from "./workflowExecutions";
import { getWorkflowResultValidationResults } from "./workflowResultValidation";
import { getQualityGateSummary } from "./qualityGates";

export type ProductOfferStatus = "sellable-pilot" | "staged-demo" | "foundation";

export type ProductOffer = {
  name: string;
  status: ProductOfferStatus;
  buyer: string;
  problem: string;
  offer: string;
  pilotOutcome: string;
  proofRoutes: string[];
};

export type ProductWorkflow = {
  name: string;
  module: string;
  buyerValue: string;
  workflowRoute: string;
  resultRoute: string;
  commercialUse: string;
  productionBoundary: string;
};

export type DeploymentStage = {
  stage: string;
  buyerDecision: string;
  scrimedProof: string;
};

export const productOffers: ProductOffer[] = [
  {
    name: "SCRIMED Atlas Pilot",
    status: "sellable-pilot",
    buyer: "Hospitals, governments, payers, and enterprise healthcare operators",
    problem:
      "Healthcare leaders need a governed way to evaluate AI workflows before connecting live systems or exposing patients to automation.",
    offer:
      "A 30 to 90 day operating-system pilot that maps high-value workflows, runs synthetic evidence, exposes readiness gates, and produces an executive governance report.",
    pilotOutcome:
      "Buyer receives workflow maps, governance gaps, interoperability targets, safety controls, and a production-readiness decision pack.",
    proofRoutes: ["/product", "/hub", "/quality", "/workflows", "/workflows/runtime-safety"]
  },
  {
    name: "CarePath Command",
    status: "staged-demo",
    buyer: "Patient access, care navigation, discharge, and population health teams",
    problem:
      "High-risk patients and operational queues often move through fragmented intake, routing, scheduling, and follow-up processes.",
    offer:
      "A governed care-navigation workflow console that shows intake signals, routing rationale, human review, Watchtower trace, and blocked unsafe actions.",
    pilotOutcome:
      "Buyer can inspect a reviewable care-navigation queue without live patient routing or autonomous outreach.",
    proofRoutes: [
      "/workflows/carepath-high-risk-followup-routing",
      "/workflows/results/carepath-high-risk-followup-routing",
      "/modules/carepath-ai"
    ]
  },
  {
    name: "DocuTwin Review",
    status: "staged-demo",
    buyer: "Clinical documentation, ambulatory operations, and quality teams",
    problem:
      "Clinicians need documentation support that preserves authorship, source traceability, review control, and compliance boundaries.",
    offer:
      "A draft-only documentation workflow that produces synthetic note evidence, missing-context prompts, source trace, and review state.",
    pilotOutcome:
      "Buyer can evaluate documentation workflow value while final notes, EHR filing, and clinical claims remain blocked.",
    proofRoutes: [
      "/workflows/docutwin-draft-note-review",
      "/workflows/results/docutwin-draft-note-review",
      "/modules/docutwin"
    ]
  },
  {
    name: "TrialCore Queue",
    status: "staged-demo",
    buyer: "Research operations, oncology programs, academic medical centers, and trial networks",
    problem:
      "Trial screening is slow, fragmented, and hard to explain when evidence gaps and eligibility rationale are not structured.",
    offer:
      "A synthetic eligibility review queue that preserves criteria trace, missing evidence, exclusion flags, and research review requirements.",
    pilotOutcome:
      "Buyer can inspect trial-screening operations without patient outreach, enrollment claims, or treatment recommendations.",
    proofRoutes: [
      "/workflows/trialcore-eligibility-review-queue",
      "/workflows/results/trialcore-eligibility-review-queue",
      "/modules/trialcore"
    ]
  }
];

export const deploymentStages: DeploymentStage[] = [
  {
    stage: "1. Synthetic demo",
    buyerDecision: "Does SCRIMED solve a real operational workflow with understandable evidence?",
    scrimedProof: "Synthetic workflows, result fixtures, quality gates, and blocked-action lists."
  },
  {
    stage: "2. Protected pilot",
    buyerDecision: "Can SCRIMED operate inside the buyer's governance, security, and interoperability constraints?",
    scrimedProof: "Identity, runtime safety, audit persistence, connector contracts, and human-review approvals."
  },
  {
    stage: "3. Governed production",
    buyerDecision: "Which workflows can safely move from review-only to controlled execution?",
    scrimedProof: "Approved runtime safety, durable audit, production connectors, monitoring, incident response, and restoration policy."
  }
];

export function getProductWorkflows(): ProductWorkflow[] {
  return workflowExecutions.map((workflow) => ({
    name: workflow.name,
    module: workflow.module,
    buyerValue: workflow.objective,
    workflowRoute: workflow.route,
    resultRoute: `/workflows/results/${workflow.slug}`,
    commercialUse:
      "Demonstrates a sellable workflow with deterministic evidence, human review, and blocked unsafe actions.",
    productionBoundary: workflow.humanReview
  }));
}

export function getProductConsoleSummary() {
  const workflowExecutionSummary = getWorkflowExecutionSummary();
  const workflowExecutionResultSummary = getWorkflowExecutionResultSummary();
  const workflowResultValidationSummary = getWorkflowResultValidationResults();
  const workflowExecutionContractSummary = getWorkflowExecutionContractSummary();
  const runtimeSafetyReadiness = getRuntimeSafetyReadinessSummary();
  const agentWorkflowSummary = getAgentWorkflowSummary();
  const qualityGateSummary = getQualityGateSummary();
  const productWorkflows = getProductWorkflows();
  const sellablePilots = productOffers.filter((offer) => offer.status === "sellable-pilot").length;

  return {
    service: "scrimed-product-console",
    route: "/product",
    apiRoute: "/api/product/console",
    status: "commercial-pilot-ready",
    offerCount: productOffers.length,
    sellablePilots,
    workflowCount: productWorkflows.length,
    buyerSegments: Array.from(new Set(productOffers.map((offer) => offer.buyer))),
    productOffers,
    productWorkflows,
    deploymentStages,
    proofStack: {
      workflowExecution: workflowExecutionSummary.status,
      workflowResults: workflowExecutionResultSummary.status,
      resultValidation: workflowResultValidationSummary.status,
      executionContracts: workflowExecutionContractSummary.status,
      runtimeSafety: runtimeSafetyReadiness.status,
      agentGovernance: agentWorkflowSummary.status,
      qualityGates: qualityGateSummary.status
    },
    productionBoundary:
      "SCRIMED is sellable today as a governed synthetic pilot and enterprise operating-system evaluation surface; live clinical execution remains gated until identity, runtime safety, durable audit, privacy, connector, and human-review controls are approved.",
    nextCommercialMove:
      "Package SCRIMED Atlas Pilot with three buyer-specific workflow demos, executive governance scorecard, integration map, and production-readiness decision register.",
    updated: "2026-06-02"
  };
}
