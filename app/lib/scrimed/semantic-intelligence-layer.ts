import {
  getTrustOpsRegistrySummary,
  scrimedTrustOpsApiRoute,
  scrimedTrustOpsPositioning,
  scrimedTrustOpsRoute,
  scrimedTrustOpsSafetyBoundary,
  scrimedTrustOpsStatus,
  trustOpsGovernanceChecklist,
  trustOpsModules
} from "./trustops-registry";
import {
  detectSyntheticOperationalSignals,
  sampleSyntheticTrustOpsEvents,
  validateSyntheticSignalSet
} from "./signal-engine";
import {
  buildSelfHealingRecommendations,
  validateSelfHealingRecommendationSet
} from "./self-healing-workflows";
import {
  getTrustOpsReviewPacketSummary
} from "./trustops-review-packets";
import type { SemanticIntelligenceNode } from "./trustops-schema";

export const semanticIntelligenceLayerNodes: SemanticIntelligenceNode[] = [
  ...trustOpsModules.map((module) => ({
    id: `module:${module.id}`,
    label: module.name,
    kind: "module" as const,
    connectsTo: module.structuredOutputs.map((output) => `output:${output}`),
    evidenceRequired: module.evidenceRequirements,
    safetyBoundary: scrimedTrustOpsSafetyBoundary
  })),
  {
    id: "governance-control:human-review",
    label: "Human-in-the-loop remediation review",
    kind: "governance-control",
    connectsTo: ["module:governance-compliance", "module:self-healing-operations", "module:secure-middleware-gateway"],
    evidenceRequired: ["Reviewer disposition", "Synthetic evidence packet", "Blocked-action note"],
    safetyBoundary: scrimedTrustOpsSafetyBoundary
  },
  {
    id: "governance-control:no-direct-system-access",
    label: "No direct LLM-to-system access",
    kind: "governance-control",
    connectsTo: ["module:secure-middleware-gateway", "module:semantic-intelligence-graph"],
    evidenceRequired: ["Middleware authorization decision", "Tool scope placeholder", "Audit event"],
    safetyBoundary: scrimedTrustOpsSafetyBoundary
  }
];

export function getScrimedTrustOpsIntelligenceLayerSummary() {
  const registrySummary = getTrustOpsRegistrySummary();
  const syntheticSignals = detectSyntheticOperationalSignals();
  const selfHealingRecommendations = buildSelfHealingRecommendations(syntheticSignals);
  const reviewPacketSummary = getTrustOpsReviewPacketSummary();
  const signalValidation = validateSyntheticSignalSet(syntheticSignals);
  const recommendationValidation = validateSelfHealingRecommendationSet(selfHealingRecommendations);
  const validationChecks = [
    ...registrySummary.validation.checks,
    {
      check: "synthetic-signal-schema-valid",
      passed: signalValidation.status === "pass",
      detail: "Every synthetic operational signal must validate and require human review."
    },
    {
      check: "self-healing-recommendations-schema-valid",
      passed: recommendationValidation.status === "pass",
      detail: "Every remediation recommendation must validate as recommendation-only."
    },
    {
      check: "trustops-review-packets-durable-binding-valid",
      passed: reviewPacketSummary.validation.status === "pass",
      detail:
        "Every TrustOps signal/recommendation review packet must carry valid durable record, replay, and no-PHI review-disposition payloads."
    }
  ];

  return {
    service: "scrimed-trustops-intelligence-layer",
    status: scrimedTrustOpsStatus,
    route: scrimedTrustOpsRoute,
    apiRoute: scrimedTrustOpsApiRoute,
    positioning: scrimedTrustOpsPositioning,
    safetyBoundaryStatement: scrimedTrustOpsSafetyBoundary,
    registrySummary: {
      service: registrySummary.service,
      existingScrimedModuleRegistryCount: registrySummary.existingScrimedModuleRegistryCount,
      trustOpsModuleCount: registrySummary.trustOpsModuleCount,
      averageTrustScore: registrySummary.averageTrustScore,
      validationStatus: registrySummary.validation.status
    },
    scoringFormula: registrySummary.modules[0]?.trustScore.formula ?? "TrustOps scoring unavailable",
    modules: registrySummary.modules,
    moduleBriefs: registrySummary.moduleBriefs,
    topModulesByStrategicValue: registrySummary.topModulesByStrategicValue,
    highestRiskModules: registrySummary.highestRiskModules,
    orchestrationLayer: registrySummary.orchestrationLayer,
    syntheticEvents: sampleSyntheticTrustOpsEvents,
    syntheticSignals,
    selfHealingRecommendations,
    reviewPacketSummary,
    governanceChecklist: trustOpsGovernanceChecklist,
    semanticIntelligenceGraph: semanticIntelligenceLayerNodes,
    validation: {
      status: validationChecks.every((check) => check.passed) ? "pass" : "fail",
      checks: validationChecks,
      signalValidation,
      recommendationValidation,
      reviewPacketValidation: reviewPacketSummary.validation,
      moduleBriefValidation: registrySummary.validation.moduleBriefValidations
    },
    roadmap: [
      "Version TrustOps thresholds and owner maps.",
      "Attach TrustOps summaries to investor and buyer diligence packets.",
      "Persist accepted TrustOps review packets only through AAL2 protected durable-store record, replay, and review-disposition routes.",
      "Promote Secure Middleware Gateway before any future tool or connector evaluation.",
      "Keep all remediation recommendation-only until external legal, security, privacy, clinical, and customer approvals exist."
    ],
    recommendedNextBuildStep: registrySummary.recommendedNextBuildStep
  };
}

export function buildScrimedTrustOpsBrief() {
  const summary = getScrimedTrustOpsIntelligenceLayerSummary();

  return [
    "# SCRIMED TrustOps Intelligence Layer",
    "",
    `Status: ${summary.status}`,
    `Route: ${summary.route}`,
    `API: ${summary.apiRoute}`,
    "",
    "## Positioning",
    summary.positioning,
    "",
    "## Safety Boundary",
    summary.safetyBoundaryStatement,
    "",
    "## Registry Summary",
    `- Existing SCRIMED module registry count: ${summary.registrySummary.existingScrimedModuleRegistryCount}`,
    `- TrustOps module count: ${summary.registrySummary.trustOpsModuleCount}`,
    `- Average TrustOps score: ${summary.registrySummary.averageTrustScore}`,
    `- Validation status: ${summary.validation.status}`,
    "",
    "## Top Strategic Modules",
    ...summary.topModulesByStrategicValue.map((module) => `- ${module.name}: strategic value ${module.strategicValue}; trust score ${module.trustScore.total}`),
    "",
    "## Highest Automation Risk Modules",
    ...summary.highestRiskModules.map((module) => `- ${module.name}: automation risk ${module.automationRisk}; next step ${module.recommendedNextBuildStep}`),
    "",
    "## Synthetic Signals",
    ...summary.syntheticSignals.map((signal) => `- ${signal.id}: ${signal.severity}; ${signal.recommendedAction}`),
    "",
    "## Recommendation-Only Self-Healing",
    ...summary.selfHealingRecommendations.map((recommendation) => `- ${recommendation.signalId}: ${recommendation.action}; owner ${recommendation.recommendedOwner}`),
    "",
    "## Durable Review Packet Binding",
    `- Packet count: ${summary.reviewPacketSummary.packetCount}`,
    `- Status: ${summary.reviewPacketSummary.status}`,
    `- Record route: ${summary.reviewPacketSummary.durableStoreRoutes.record}`,
    `- Replay route: ${summary.reviewPacketSummary.durableStoreRoutes.replay}`,
    `- Review disposition route: ${summary.reviewPacketSummary.durableStoreRoutes.reviewDisposition}`,
    `- Boundary: ${summary.reviewPacketSummary.persistenceBoundary}`,
    "",
    "## Governance Checklist",
    ...summary.governanceChecklist.map((item) => `- ${item}`),
    "",
    "## Next Build Step",
    summary.recommendedNextBuildStep,
    ""
  ].join("\n");
}
