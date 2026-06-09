import { agentWorkflows, getAgentWorkflowSummary } from "./agentWorkflows";
import { getFixtureChangeReviewSummary } from "./fixtureChangeReviews";
import { getIntegrationFixtureValidationResults } from "./integrationFixtureValidation";
import { integrationFixtures } from "./integrationFixtures";
import { integrationContracts } from "./integrationContracts";
import { operatingContext } from "./operatingContext";
import { getPilotIntakeSummary } from "./pilotIntake";
import { getAgentEvaluationWorkspaceSummary } from "./agentEvaluationWorkspace";
import { getAgentOSSummary } from "./agentOS";
import { getAtlasIntelligenceCoreSummary } from "./atlasIntelligenceCore";
import { getCommercialStrategySummary } from "./commercialStrategy";
import { getCompanyOperationsSummary } from "./companyOperations";
import { syntheticFixtures } from "./syntheticFixtures";
import { syntheticScenarios } from "./syntheticClinical";
import { getSyntheticValidationResults } from "./syntheticValidation";
import { getWorkflowPromotionReviewSummary } from "./workflowPromotionReviews";
import {
  getWorkflowExecutionContractSummary,
  getWorkflowExecutionContracts
} from "./workflowExecutionContracts";
import {
  getWorkflowExecutionAuditBoundaries,
  getWorkflowExecutionAuditSummary
} from "./workflowExecutionAudit";
import { getAuditPersistenceReadinessSummary } from "./auditPersistenceReadiness";
import { getIdentityAccessReadinessSummary } from "./identityAccessReadiness";
import { getExecutionAttemptReadinessSummary } from "./executionAttemptReadiness";
import { getRuntimeSafetyReadinessSummary } from "./runtimeSafetyReadiness";
import {
  getWorkflowImplementationReadiness,
  getWorkflowImplementationReadinessSummary
} from "./workflowImplementationReadiness";
import {
  getWorkflowExecutionResultSummary,
  workflowExecutionResults
} from "./workflowExecutionResults";
import { getWorkflowResultValidationResults } from "./workflowResultValidation";
import { getWorkflowExecutionSummary, workflowExecutions } from "./workflowExecutions";
import {
  getInteroperabilitySummary,
  interoperabilityStandards
} from "./interoperabilityStandards";
import {
  getInteroperabilityConformanceEvaluationSummary,
  getInteroperabilityConformanceEvaluations
} from "./interoperabilityConformanceEvaluations";
import {
  getDemoPilotProgramSummary,
  getPilotPrograms,
  getProductDemos
} from "./demoPilotPrograms";

export type HubModule = {
  name: string;
  route: string;
  phase: "foundation" | "staged" | "planned";
  status: "active-concept" | "design" | "planned";
  owner: string;
  objective: string;
};

export type HubSignal = {
  name: string;
  value: string;
  tone: "good" | "watch" | "planned";
};

export const hubModules: HubModule[] = [
  {
    name: "Clinical Copilot",
    route: "/modules/clinical-copilot",
    phase: "staged",
    status: "design",
    owner: "Clinical intelligence",
    objective: "Summarize patient context and support clinician decision workflows."
  },
  {
    name: "DocuTwin",
    route: "/modules/docutwin",
    phase: "staged",
    status: "design",
    owner: "Documentation automation",
    objective: "Generate reviewable medical documentation from structured and conversational inputs."
  },
  {
    name: "CarePath AI",
    route: "/modules/carepath-ai",
    phase: "staged",
    status: "design",
    owner: "Care navigation",
    objective: "Support intake, triage, routing, and care pathway coordination."
  },
  {
    name: "TrialCore",
    route: "/modules/trialcore",
    phase: "staged",
    status: "design",
    owner: "Research operations",
    objective: "Map patient signals to clinical trial discovery and matching workflows."
  },
  {
    name: "Watchtower",
    route: "/modules/watchtower",
    phase: "foundation",
    status: "active-concept",
    owner: "Trust infrastructure",
    objective: "Monitor drift, regressions, runtime traces, cost, latency, and safety signals."
  }
];

export const hubSignals: HubSignal[] = [
  { name: "Deployment", value: "Vercel success", tone: "good" },
  { name: "Quality gates", value: "active", tone: "good" },
  { name: "Repository", value: "main baseline documented", tone: "good" },
  { name: "Operating context", value: "mission codified", tone: "good" },
  { name: "Official website", value: "scrimedsolutions.com", tone: "good" },
  { name: "Pilot intake", value: "CRM handoff ready", tone: "good" },
  { name: "Commercial model", value: "pricing and sales motion ready", tone: "good" },
  { name: "Demo Center", value: "five executable buyer demos ready", tone: "good" },
  { name: "Pilot programs", value: "four governed programs packaged", tone: "good" },
  { name: "Operations readiness", value: "blocker register active", tone: "watch" },
  { name: "AgentOS Evaluation", value: "interactive synthetic workspace ready", tone: "good" },
  { name: "AgentOS", value: "multi-agent control plane online", tone: "good" },
  { name: "Memory fabric", value: "session, operational, knowledge scoped", tone: "good" },
  { name: "Audit governance", value: "AI asset registry active", tone: "good" },
  { name: "Observability", value: "continuous validation ready", tone: "good" },
  { name: "Atlas Intelligence Core", value: "evidence and document intelligence staged", tone: "good" },
  { name: "Trust Cards", value: "provenance contracts active", tone: "good" },
  { name: "Agent registry", value: "governance scoped", tone: "good" },
  { name: "Workflow execution", value: "three synthetic paths staged", tone: "good" },
  { name: "Execution results", value: "deterministic fixtures ready", tone: "good" },
  { name: "Result validation", value: "diff checks passing", tone: "good" },
  { name: "Promotion review", value: "synthetic staging approved", tone: "good" },
  { name: "Execution contracts", value: "contract-only APIs defined", tone: "good" },
  { name: "Identity and access", value: "decision register active", tone: "watch" },
  { name: "Execution attempts", value: "idempotency model pending", tone: "watch" },
  { name: "Runtime safety", value: "shutdown controls pending", tone: "watch" },
  { name: "Execution deny stubs", value: "locked endpoints online", tone: "good" },
  { name: "Execution audit", value: "metadata boundary defined", tone: "good" },
  { name: "Audit persistence", value: "decision register active", tone: "watch" },
  { name: "Fixture reviews", value: "fingerprints approved", tone: "good" },
  { name: "Integration fixtures", value: "contract coverage active", tone: "good" },
  { name: "Synthetic validation", value: "assertions passing", tone: "good" },
  { name: "Build verification", value: "local, CI, and Vercel active", tone: "good" },
  { name: "Integration contracts", value: "foundation defined", tone: "good" },
  { name: "Interoperability control plane", value: "standards registry defined", tone: "good" },
  { name: "Interoperability conformance", value: "synthetic test kits passing; live blocked", tone: "good" },
  { name: "Clinical integrations", value: "not connected", tone: "planned" }
];

const contractRoutes = integrationContracts.flatMap((contract) => [
  contract.route,
  `/api${contract.route}`
]);

const syntheticRoutes = syntheticScenarios.flatMap((scenario) => [
  scenario.route,
  `/api/synthetic/scenarios/${scenario.id}`,
  `/api/synthetic/validation/${scenario.id}`,
  `/api/synthetic/fixtures/${scenario.id}`
]);

const workflowExecutionContracts = getWorkflowExecutionContracts();
const workflowImplementationReadiness = getWorkflowImplementationReadiness();
const workflowExecutionAuditBoundaries = getWorkflowExecutionAuditBoundaries();
const interoperabilityConformanceEvaluations = getInteroperabilityConformanceEvaluations();
const productDemos = getProductDemos();
const pilotPrograms = getPilotPrograms();

export const hubRoutes = [
  "/",
  "/hub",
  "/hub/readiness",
  "/hub/events",
  "/pilot",
  "/pilots",
  "/demos",
  "/pricing",
  "/operations",
  "/evaluation",
  "/platform",
  "/memory",
  "/audit",
  "/observability",
  "/trust",
  "/interoperability",
  "/interoperability/evaluations",
  "/integrations",
  "/integrations/fixtures",
  "/integrations/fixture-validation",
  "/fixtures/change-review",
  "/operating-context",
  "/agents",
  "/workflows",
  "/workflows/contracts",
  "/workflows/identity-access",
  "/workflows/execution-attempts",
  "/workflows/runtime-safety",
  "/workflows/execution-audit",
  "/workflows/audit-persistence",
  "/workflows/implementation-readiness",
  "/workflows/promotion-review",
  "/workflows/results",
  "/workflows/results/validation",
  "/atlas",
  "/faithcore",
  "/synthetic",
  "/synthetic/validation",
  "/synthetic/fixtures",
  "/quality",
  ...syntheticScenarios.map((scenario) => scenario.route),
  ...syntheticFixtures.map((fixture) => fixture.route),
  ...integrationContracts.map((contract) => contract.route),
  ...interoperabilityStandards.map((standard) => `/interoperability/${standard.slug}`),
  ...interoperabilityConformanceEvaluations.map((evaluation) => evaluation.route),
  ...productDemos.map((demo) => demo.route),
  ...pilotPrograms.map((pilot) => pilot.route),
  ...integrationFixtures.map((fixture) => fixture.route),
  ...agentWorkflows.map((workflow) => workflow.route),
  ...workflowExecutions.map((workflow) => workflow.route),
  ...workflowExecutionContracts.map((contract) => contract.route),
  ...workflowExecutionAuditBoundaries.map((boundary) => boundary.route),
  ...workflowImplementationReadiness.map((workflow) => workflow.route),
  ...workflowExecutionResults.map((result) => result.route),
  "/modules/clinical-copilot",
  "/modules/docutwin",
  "/modules/carepath-ai",
  "/modules/trialcore",
  "/modules/watchtower",
  "/api/health",
  "/api/status",
  "/api/readiness",
  "/api/events",
  "/api/pilot/intake",
  "/api/pilots",
  "/api/demos",
  "/api/commercial/pricing",
  "/api/operations/readiness",
  "/api/agent-os/evaluation",
  "/api/agent-os",
  "/api/agent-os/tasks",
  "/api/atlas/intelligence-core",
  "/api/memory",
  "/api/audit",
  "/api/observability",
  "/api/trust/cards",
  "/api/operating-context",
  "/api/agents/workflows",
  ...agentWorkflows.map((workflow) => `/api/agents/workflows/${workflow.slug}`),
  "/api/workflows/executions",
  ...workflowExecutions.map((workflow) => workflow.apiRoute),
  "/api/workflows/contracts",
  ...workflowExecutionContracts.map((contract) => contract.apiRoute),
  "/api/workflows/identity-access",
  "/api/workflows/execution-attempts",
  "/api/workflows/runtime-safety",
  "/api/workflows/execution-audit",
  ...workflowExecutionAuditBoundaries.map((boundary) => boundary.apiRoute),
  "/api/workflows/audit-persistence",
  "/api/workflows/implementation-readiness",
  ...workflowImplementationReadiness.map((workflow) => workflow.apiRoute),
  "/api/workflows/promotion-review",
  "/api/workflows/results",
  "/api/workflows/results/validation",
  ...workflowExecutionResults.map((result) => result.apiRoute),
  "/api/fixtures/change-review",
  "/api/integration-fixtures",
  "/api/integration-fixtures/validation",
  ...integrationFixtures.map((fixture) => `/api/integration-fixtures/${fixture.contractSlug}`),
  "/api/contracts",
  ...contractRoutes.filter((route) => route.startsWith("/api/contracts/")),
  "/api/interoperability/standards",
  "/api/interoperability/conformance",
  "/api/interoperability/evaluations",
  ...interoperabilityStandards.map((standard) => `/api/interoperability/standards/${standard.slug}`),
  ...interoperabilityConformanceEvaluations.map((evaluation) => evaluation.apiRoute),
  ...productDemos.map((demo) => demo.apiRoute),
  ...pilotPrograms.map((pilot) => pilot.apiRoute),
  "/api/synthetic/scenarios",
  "/api/synthetic/fixtures",
  "/api/synthetic/validation",
  ...syntheticRoutes.filter((route) => route.startsWith("/api/synthetic/")),
  "/api/quality/gates",
  "/api/hub/summary"
];

export function getHubSummary() {
  const activeModules = hubModules.filter((module) => module.phase === "foundation").length;
  const stagedModules = hubModules.filter((module) => module.phase === "staged").length;
  const syntheticValidation = getSyntheticValidationResults();
  const agentWorkflowSummary = getAgentWorkflowSummary();
  const integrationFixtureValidation = getIntegrationFixtureValidationResults();
  const fixtureChangeReview = getFixtureChangeReviewSummary();
  const workflowExecutionSummary = getWorkflowExecutionSummary();
  const workflowExecutionResultSummary = getWorkflowExecutionResultSummary();
  const workflowResultValidationSummary = getWorkflowResultValidationResults();
  const workflowPromotionReviewSummary = getWorkflowPromotionReviewSummary();
  const workflowExecutionContractSummary = getWorkflowExecutionContractSummary();
  const workflowImplementationReadinessSummary = getWorkflowImplementationReadinessSummary();
  const workflowExecutionAuditSummary = getWorkflowExecutionAuditSummary();
  const auditPersistenceReadinessSummary = getAuditPersistenceReadinessSummary();
  const identityAccessReadinessSummary = getIdentityAccessReadinessSummary();
  const executionAttemptReadinessSummary = getExecutionAttemptReadinessSummary();
  const runtimeSafetyReadinessSummary = getRuntimeSafetyReadinessSummary();
  const pilotIntakeSummary = getPilotIntakeSummary();
  const commercialStrategySummary = getCommercialStrategySummary();
  const companyOperationsSummary = getCompanyOperationsSummary();
  const agentEvaluationWorkspaceSummary = getAgentEvaluationWorkspaceSummary();
  const agentOSSummary = getAgentOSSummary();
  const atlasIntelligenceCoreSummary = getAtlasIntelligenceCoreSummary();
  const interoperabilitySummary = getInteroperabilitySummary();
  const interoperabilityConformanceSummary = getInteroperabilityConformanceEvaluationSummary();
  const demoPilotProgramSummary = getDemoPilotProgramSummary();

  return {
    service: "scrimed-os-hub",
    status: "foundation-online",
    baseline: "nextjs-app-router",
    activeModules,
    stagedModules,
    moduleCount: hubModules.length,
    routes: hubRoutes,
    signals: hubSignals,
    operatingContext: {
      company: operatingContext.company,
      slogan: operatingContext.slogan,
      officialWebsite: operatingContext.officialWebsite,
      websiteProvider: operatingContext.websiteProvider,
      mission: operatingContext.mission,
      operatingModels: operatingContext.operatingModels
    },
    pilotIntakeSummary,
    commercialStrategySummary,
    companyOperationsSummary,
    agentEvaluationWorkspaceSummary,
    agentOSSummary,
    atlasIntelligenceCoreSummary,
    interoperabilitySummary,
    interoperabilityConformanceSummary,
    demoPilotProgramSummary,
    agentWorkflowSummary,
    fixtureChangeReview,
    workflowExecutionSummary,
    workflowExecutionResultSummary,
    workflowResultValidationSummary,
    workflowPromotionReviewSummary,
    workflowExecutionContractSummary,
    workflowImplementationReadinessSummary,
    workflowExecutionAuditSummary,
    auditPersistenceReadinessSummary,
    identityAccessReadinessSummary,
    executionAttemptReadinessSummary,
    runtimeSafetyReadinessSummary,
    integrationFixtureValidation,
    syntheticValidation,
    modules: hubModules,
    updated: "2026-06-09"
  };
}
