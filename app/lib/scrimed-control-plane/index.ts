import {
  createAuditEvent,
  getScrimedWorkSummary,
  scrimedWorkHeaders,
  validateDefinitionOfDoneContract
} from "../scrimed-work";
import { getCapitalIntelligenceSummary } from "./capitalIntelligence";
import { getComputeResilienceSummary } from "./computeResilience";
import { runConsequenceBench } from "./consequenceBench";
import { searchControlPlaneContext } from "./contextFabric";
import { controlPlaneEnvironmentDefaults, getControlPlaneFeatureFlags } from "./featureFlags";
import { evaluateArtifactStaleness, verifyControlPlaneSession } from "./governance";
import { modelEfficiencyFrontier, routeControlPlaneModel } from "./modelPolicy";
import { getOutcomeIntelligenceSummary } from "./outcomeIntelligence";
import { observeReasoningWorkspace, sampleReasoningWorkspace } from "./reasoningObservatory";
import {
  controlPlaneAgentRegistry,
  controlPlaneProviderPolicyProfiles,
  controlPlaneSemanticRegistry,
  controlPlaneSkillRegistry,
  controlPlaneWorkflowRegistry
} from "./registries";
import { getApprovalAchievementSummary } from "./approvalAchievement";
import { getCrossPlatformEvidenceSummary } from "./platformEvidence";
import { getScrimedPlatformGraph } from "./platformGraph";
import { getPlatformStrategySummary } from "./platformStrategy";
import { getStrategicDecisionIntelligenceSummary } from "./strategicDecisionIntelligence";
import { getTrustReadinessSummary } from "./trustReadiness";

export * from "./types";
export * from "./featureFlags";
export * from "./registries";
export * from "./contextFabric";
export * from "./modelPolicy";
export * from "./reasoningObservatory";
export * from "./consequenceBench";
export * from "./capitalIntelligence";
export * from "./computeResilience";
export * from "./outcomeIntelligence";
export * from "./governance";
export * from "./approvalAchievement";
export * from "./platformEvidence";
export * from "./platformGraph";
export * from "./platformStrategy";
export * from "./strategicDecisionIntelligence";
export * from "./trustReadiness";

export const controlPlaneRoute = "/scrimed-control-plane";
export const controlPlaneApiRoute = "/api/scrimed-control-plane";
export const controlPlaneBriefRoute = "/api/scrimed-control-plane/brief";
export const controlPlaneStatus = "scrimed-intelligence-control-plane-active-synthetic-no-phi";
export const controlPlanePolicyVersion = "scrimed-control-plane-policy-v2026-07-11";
export const controlPlaneBoundary =
  "SCRIMED Intelligence Control Plane unifies governed agents, skills, workflows, context, routing, verification, benchmarking, artifacts, capital intelligence, voice simulation, compute resilience, learning proposals, outcomes, and audit metadata. It accepts synthetic or de-identified fixtures only and does not authorize autonomous clinical care, PHI processing, EHR writeback, payer submission, investor outreach, securities representations, production deployment, certification claims, or customer activation.";

export function controlPlaneHeaders(extra: Record<string, string> = {}) {
  return scrimedWorkHeaders({
    "X-SCRIMED-Control-Plane": controlPlaneStatus,
    "X-SCRIMED-Control-Plane-Policy": controlPlanePolicyVersion,
    "X-SCRIMED-Capital-Outbound": "disabled-ceo-approval-required",
    "X-SCRIMED-Approval-Achievement": "technical-gate-only-human-external-approvals-required",
    "X-SCRIMED-Platform-Evidence": "snapshot-only-no-production-authority",
    "X-SCRIMED-Platform-Graph": "synthetic-metadata-only",
    "X-SCRIMED-Trust-Readiness": "internal-signal-not-certification",
    "X-SCRIMED-Voice": "simulation-only",
    "X-SCRIMED-Data": "synthetic-deidentified-no-live-phi",
    ...extra
  });
}

export function getControlPlaneSummary() {
  const work = getScrimedWorkSummary();
  const primarySession = work.sessions[0];
  const featureFlags = getControlPlaneFeatureFlags();
  const context = searchControlPlaneContext({
    query: "care coordination prior authorization evidence human review",
    tenantId: "synthetic-tenant",
    limit: 4
  });
  const modelRoute = routeControlPlaneModel({
    taskType: "high-consequence synthetic clinical-support synthesis",
    complexity: "high",
    consequence: "high",
    dataClassification: "deidentified-clinical",
    requiredModality: "text",
    residencyRequirement: "us",
    latencyTargetMs: 5_000,
    budgetUsd: 1,
    tenantPolicy: "synthetic no-PHI decision support with human review",
    verificationStrength: 85,
    localPrivateRequired: false
  });
  const verification = verifyControlPlaneSession(primarySession);
  const reasoningObservatory = observeReasoningWorkspace(sampleReasoningWorkspace);
  const consequenceBench = runConsequenceBench();
  const artifactStaleness = evaluateArtifactStaleness({
    artifactId: primarySession.artifacts[0]?.artifactId ?? "artifact-none",
    referencedVersions: { "ctx-care-coordination-sop": "1.0" },
    currentVersions: { "ctx-care-coordination-sop": "1.0" },
    calculationsChanged: false
  });

  return {
    service: "scrimed-intelligence-control-plane",
    status: controlPlaneStatus,
    route: controlPlaneRoute,
    apiRoute: controlPlaneApiRoute,
    briefRoute: controlPlaneBriefRoute,
    policyVersion: controlPlanePolicyVersion,
    updatedAt: "2026-07-11T00:00:00.000Z",
    boundary: controlPlaneBoundary,
    syntheticDemonstration: true,
    featureFlags,
    environmentDefaults: controlPlaneEnvironmentDefaults,
    architecture: {
      runtimeAuthority: "SCRIMED Work durable AAL2 control plane",
      orchestrationPattern: "planner-specialists-verifier-human-gate",
      persistence: work.persistence,
      mutationAuthority: "AAL2 + tenant RBAC/RLS + durable store + idempotency + approval",
      externalProviderCalls: "disabled-by-default",
      consequentialActions: "disabled-by-default"
    },
    workspaces: [
      ...work.workspaces,
      {
        workspaceId: "capital-intelligence",
        domain: "capital-intelligence",
        title: "Capital Intelligence",
        purpose: "Internal investor research, scoring, and draft preparation.",
        allowedDataClassifications: ["public", "internal"],
        defaultRiskLevel: "high",
        humanReviewDefault: true,
        retainedBoundary: "No autonomous outreach, valuation discussion, negotiation, projection, file sharing, or commitment."
      }
    ],
    sessions: work.sessions,
    agents: controlPlaneAgentRegistry,
    skills: controlPlaneSkillRegistry,
    workflows: controlPlaneWorkflowRegistry,
    providers: controlPlaneProviderPolicyProfiles,
    ontology: controlPlaneSemanticRegistry,
    context,
    modelRoute,
    modelEfficiencyFrontier,
    verification,
    reasoningObservatory,
    consequenceBench,
    artifacts: {
      templates: work.artifactTemplates,
      sample: primarySession.artifacts,
      staleness: artifactStaleness
    },
    approvals: primarySession.approvalCheckpoints,
    approvalAchievement: getApprovalAchievementSummary(),
    platformEvidence: getCrossPlatformEvidenceSummary(),
    platformStrategy: getPlatformStrategySummary(),
    platformGraph: getScrimedPlatformGraph(),
    trustReadiness: getTrustReadinessSummary(),
    strategicDecisionIntelligence: getStrategicDecisionIntelligenceSummary(),
    voiceSimulation: work.voiceSimulation,
    capitalIntelligence: getCapitalIntelligenceSummary(),
    computeResilience: getComputeResilienceSummary(),
    learningProposals: work.learningLoopArtifacts,
    outcomes: getOutcomeIntelligenceSummary(),
    auditHistory: [
      createAuditEvent({
        eventId: "control-plane-summary-read",
        sessionId: primarySession.id,
        action: "read-control-plane-summary",
        actorId: "synthetic-system",
        tenantId: "synthetic-tenant",
        decision: "allow",
        reason: "Synthetic metadata-only executive control-plane read.",
        traceId: "trace-control-plane-summary"
      })
    ],
    contractValidation: validateDefinitionOfDoneContract(primarySession.definitionOfDone),
    governance: {
      definitionOfDoneRequired: true,
      agentNarrativeIsProof: false,
      retrievedContentIsInstructions: false,
      completionRequiresMandatoryVerification: true,
      highRiskRequiresHumanReview: true,
      cancellationRequired: true,
      rollbackRequiredWherePossible: true,
      learningSelfDeploymentAllowed: false,
      approvalSelfPromotionAllowed: false,
      capitalOutboundAllowed: false,
      rawAudioStored: false,
      rawPromptsOrChainOfThoughtStored: false
    },
    nextProductionHardeningStep:
      "Remove or substantiate the public testimonial, bind the current build to a clean reviewed source revision, then apply pending durable-store migrations to an approved nonproduction Supabase target for strict AAL2 smoke."
  };
}

export function buildControlPlaneBrief() {
  const summary = getControlPlaneSummary();
  return [
    "# SCRIMED Intelligence Control Plane",
    "",
    `Status: ${summary.status}`,
    `Policy: ${summary.policyVersion}`,
    "",
    "## Architecture",
    `- Runtime authority: ${summary.architecture.runtimeAuthority}`,
    `- Orchestration: ${summary.architecture.orchestrationPattern}`,
    `- Mutation authority: ${summary.architecture.mutationAuthority}`,
    "",
    "## Registries",
    `- Agents: ${summary.agents.length}`,
    `- Skills: ${summary.skills.length}`,
    `- Workflows: ${summary.workflows.length}`,
    `- Semantic definitions: ${summary.ontology.length}`,
    `- Provider policy profiles: ${summary.providers.length}`,
    "",
    "## Governance",
    `- Verification eligible for completion: ${summary.verification.eligibleForCompletion}`,
    `- Trust score: ${summary.verification.trustScore.total}`,
    `- Objective drift detected: ${summary.reasoningObservatory.objectiveDriftFlags.length > 0}`,
    `- ConsequenceBench status: ${summary.consequenceBench.evaluationStatus}`,
    `- Cross-platform release blockers: ${summary.platformEvidence.summary.blockedProviderCount}`,
    `- Platform capabilities: ${summary.platformStrategy.capabilityCount} across ${summary.platformStrategy.platformPlanes.length} planes`,
    `- Capability registry valid: ${summary.platformStrategy.validation.valid}`,
    `- Core commercial wedge: ${summary.platformStrategy.coreWedge.offer} + ${summary.platformStrategy.coreWedge.productWorkflow}`,
    `- Platform graph: ${summary.platformGraph.validation.nodeCount} nodes / ${summary.platformGraph.validation.edgeCount} edges / valid ${summary.platformGraph.validation.valid}`,
    `- Trust readiness scenarios: ${summary.trustReadiness.decisions.allowSynthetic} allow synthetic / ${summary.trustReadiness.decisions.requireHuman} require human / ${summary.trustReadiness.decisions.blocked} blocked`,
    `- Investor readiness heuristic: ${summary.strategicDecisionIntelligence.investorReadiness.score} (not investment probability)`,
    "",
    "## Safety Boundary",
    summary.boundary,
    "",
    "## Next Production-Hardening Step",
    summary.nextProductionHardeningStep
  ].join("\n");
}
