import { agentWorkflows, getAgentWorkflowSummary } from "./agentWorkflows";
import { getFixtureChangeReviewSummary } from "./fixtureChangeReviews";
import { getIntegrationFixtureValidationResults } from "./integrationFixtureValidation";
import { integrationFixtures } from "./integrationFixtures";
import { integrationContracts } from "./integrationContracts";
import { operatingContext } from "./operatingContext";
import { getPilotIntakeSummary } from "./pilotIntake";
import { getSalesOperationsSummary } from "./salesOperations";
import { getAgentEvaluationWorkspaceSummary } from "./agentEvaluationWorkspace";
import { getAgentOSSummary } from "./agentOS";
import { getAtlasIntelligenceCoreSummary } from "./atlasIntelligenceCore";
import { getTrustOSSummary } from "./trustOS";
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
import {
  getEnterpriseReadinessSummary,
  getReadinessDomains
} from "./enterpriseReadiness";
import { getAttributionAnalyticsSummary } from "./attributionAnalytics";
import { getTrustSafetyOperationsSummary } from "./trustSafetyOperations";
import { getSalesDealRoomSummary } from "./salesDealRoom";

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
  { name: "Sales operations", value: "tenant-admin console active", tone: "good" },
  { name: "Buyer workspace provisioning", value: "opportunity-linked rooms active", tone: "good" },
  { name: "Buyer tenant lifecycle", value: "SSO, access review, archive controls active", tone: "good" },
  {
    name: "Production readiness",
    value: "domain, origin, invitation, access, archive gates packaged",
    tone: "good"
  },
  {
    name: "Customer activation approvals",
    value: "paid-pilot setup approval with retained hard gates active",
    tone: "good"
  },
  { name: "Commercial model", value: "pricing and sales motion ready", tone: "good" },
  { name: "Healthcare Intelligence OS", value: "phase architecture foundation defined", tone: "good" },
  { name: "Sales attribution", value: "CRM-safe source tracking active", tone: "good" },
  { name: "Attribution analytics", value: "source-to-pilot cohorts active", tone: "good" },
  { name: "Source intelligence", value: "public platform signals encoded", tone: "good" },
  { name: "Persistent Agent Workspace", value: "work-order proof layer active", tone: "good" },
  { name: "Pilot evidence", value: "enterprise proof dashboard active", tone: "good" },
  { name: "Demo Center", value: "five executable buyer demos ready", tone: "good" },
  { name: "Pilot programs", value: "four governed programs packaged", tone: "good" },
  { name: "Operations readiness", value: "blocker register active", tone: "watch" },
  { name: "Enterprise readiness", value: "claims and launch gates governed", tone: "watch" },
  { name: "AgentOS Evaluation", value: "interactive synthetic workspace ready", tone: "good" },
  { name: "AgentOS", value: "multi-agent control plane online", tone: "good" },
  { name: "Memory fabric", value: "session, operational, knowledge scoped", tone: "good" },
  { name: "Audit governance", value: "AI asset registry active", tone: "good" },
  { name: "Trust and Safety Operations", value: "24/7 watchtower model defined", tone: "good" },
  { name: "Trust incidents", value: "owned queue and reports active", tone: "good" },
  { name: "Tenant TrustOps", value: "durable private incident workspace contract active", tone: "good" },
  { name: "Observability", value: "continuous validation ready", tone: "good" },
  { name: "Atlas Intelligence Core", value: "evidence and document intelligence staged", tone: "good" },
  { name: "Trust Cards", value: "provenance contracts active", tone: "good" },
  { name: "TrustOS", value: "executable governance decisions ready", tone: "good" },
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
const readinessDomains = getReadinessDomains();

export const hubRoutes = [
  "/",
  "/hub",
  "/hub/readiness",
  "/hub/events",
  "/pilot",
  "/pilot-deal-room",
  "/api/sales-operations/opportunities/{intakeId}/workspace-provisioning",
  "/api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet",
  "/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle",
  "/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet",
  "/api/sales-operations/opportunities/{intakeId}/production-readiness",
  "/api/sales-operations/opportunities/{intakeId}/production-readiness/packet",
  "/api/sales-operations/opportunities/{intakeId}/activation-approvals",
  "/api/sales-operations/opportunities/{intakeId}/activation-approvals/packet",
  "/pilot-workspace",
  "/pilot-workspace/access",
  "/competitive-edge",
  "/healthcare-intelligence-os",
  "/agent-workspace",
  "/pilot-evidence",
  "/sales-operations",
  "/pilots",
  "/demos",
  "/pricing",
  "/market-activation",
  "/sales-attribution",
  "/attribution-analytics",
  "/source-intelligence",
  "/deployment-profiles",
  "/operations",
  "/trust-center",
  "/trust-safety-operations",
  "/claims",
  "/evaluation",
  "/platform",
  "/memory",
  "/audit",
  "/observability",
  "/trust",
  "/trust-os",
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
  ...readinessDomains.map((domain) => domain.route),
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
  "/api/pilot-deal-room",
  "/api/healthcare-intelligence-os",
  "/api/healthcare-intelligence-os/brief",
  "/api/agent-workspace",
  "/api/agent-workspace/brief",
  "/api/agent-workspace/proof-packet",
  "/api/agent-workspaces/[workspaceSlug]/work-orders",
  "/api/agent-workspaces/[workspaceSlug]/work-orders/[workOrderId]",
  "/api/agent-workspaces/[workspaceSlug]/work-orders/[workOrderId]/proof-packet",
  "/api/pilot-evidence",
  "/api/pilot-evidence/brief",
  "/api/sales-operations",
  "/api/sales-operations/opportunities/{intakeId}",
  "/api/sales-operations/opportunities/{intakeId}/proposal",
  "/api/sales-operations/opportunities/{intakeId}/crm-export",
  "/api/sales-operations/opportunities/{intakeId}/crm-sync",
  "/api/sales-operations/opportunities/{intakeId}/follow-up-draft",
  "/api/sales-operations/opportunities/{intakeId}/follow-up/complete",
  "/api/sales-operations/opportunities/{intakeId}/assessment-invitation",
  "/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet",
  "/api/sales-operations/opportunities/{intakeId}/deal-room-packet",
  "/api/sales-operations/opportunities/{intakeId}/production-readiness",
  "/api/sales-operations/opportunities/{intakeId}/production-readiness/packet",
  "/api/sales-operations/opportunities/{intakeId}/activation-approvals",
  "/api/sales-operations/opportunities/{intakeId}/activation-approvals/packet",
  "/api/pilots",
  "/api/demos",
  "/api/commercial/pricing",
  "/api/competitive-edge",
  "/api/market-activation",
  "/api/sales-attribution",
  "/api/attribution-analytics",
  "/api/sales-operations/attribution-analytics",
  "/api/source-intelligence",
  "/api/deployment-profiles",
  "/api/operations/readiness",
  "/api/enterprise-readiness",
  "/api/trust-safety-operations",
  "/api/trust-safety-operations/incidents/{incidentId}/report",
  "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents",
  "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}",
  "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}/review-packet",
  "/api/enterprise-readiness/claims",
  "/api/enterprise-readiness/diligence-brief",
  "/api/agent-os/evaluation",
  "/api/agent-os",
  "/api/agent-os/tasks",
  "/api/atlas/intelligence-core",
  "/api/memory",
  "/api/audit",
  "/api/observability",
  "/api/trust/cards",
  "/api/trust-os",
  "/api/trust-os/evaluate",
  "/api/pilot-workspaces",
  "/api/pilot-workspaces/{workspaceSlug}/sessions",
  "/api/pilot-workspaces/{workspaceSlug}/audit",
  "/api/pilot-workspaces/{workspaceSlug}/buyer-room",
  "/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet",
  "/api/pilot-workspaces/{workspaceSlug}/sessions/{sessionId}/proof-packet",
  "/api/pilot-workspaces/{workspaceSlug}/trustos-decisions",
  "/api/pilot-workspaces/{workspaceSlug}/trustos-decisions/{decisionId}/reviews",
  "/api/pilot-workspaces/{workspaceSlug}/trustos-decisions/{decisionId}/governance-packet",
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
  ...readinessDomains.map((domain) => domain.apiRoute),
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
  const salesOperationsSummary = getSalesOperationsSummary();
  const salesDealRoomSummary = getSalesDealRoomSummary();
  const commercialStrategySummary = getCommercialStrategySummary();
  const companyOperationsSummary = getCompanyOperationsSummary();
  const agentEvaluationWorkspaceSummary = getAgentEvaluationWorkspaceSummary();
  const agentOSSummary = getAgentOSSummary();
  const atlasIntelligenceCoreSummary = getAtlasIntelligenceCoreSummary();
  const trustOSSummary = getTrustOSSummary();
  const interoperabilitySummary = getInteroperabilitySummary();
  const interoperabilityConformanceSummary = getInteroperabilityConformanceEvaluationSummary();
  const demoPilotProgramSummary = getDemoPilotProgramSummary();
  const enterpriseReadinessSummary = getEnterpriseReadinessSummary();
  const attributionAnalyticsSummary = getAttributionAnalyticsSummary();
  const trustSafetyOperationsSummary = getTrustSafetyOperationsSummary();

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
    salesOperationsSummary,
    salesDealRoomSummary,
    commercialStrategySummary,
    companyOperationsSummary,
    enterpriseReadinessSummary,
    attributionAnalyticsSummary,
    trustSafetyOperationsSummary,
    agentEvaluationWorkspaceSummary,
    agentOSSummary,
    atlasIntelligenceCoreSummary,
    trustOSSummary,
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
    updated: "2026-06-16"
  };
}
