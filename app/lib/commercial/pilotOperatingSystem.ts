import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { PilotCostUsage } from "../economics/pilotCostGovernor";
import {
  calculatePilotMarginScenario,
  evaluatePilotCostGovernor,
  pilotCostGovernorVersion
} from "../economics/pilotCostGovernor";
import type { PilotManifest, PilotSuccessCriterion } from "./pilotManifest";
import {
  createPilotManifest,
  pilotManifestVersion,
  syntheticPilotControlContract
} from "./pilotManifest";
import {
  getPilotTemplateRegistrySummary,
  pilotTemplateRegistry,
  pilotTemplateRegistryVersion
} from "./pilotTemplateRegistry";

export const pilotOperatingSystemVersion =
  "scrimed-p34-pilot-operating-system-v1-2026-08-27";

export type PilotWorkflowStage =
  | "DISCOVERY"
  | "WORKFLOW_MAP"
  | "BASELINE"
  | "SCENARIOS"
  | "CONFIGURATION"
  | "EVALUATION"
  | "EVIDENCE_PACK"
  | "EXECUTIVE_READOUT"
  | "EXPANSION_DECISION";

export type PilotExpansionState =
  | "NO_EXPANSION"
  | "ASSESS_NEXT_WORKFLOW"
  | "EXTEND_SYNTHETIC_PILOT"
  | "PREPARE_PROTECTED_PILOT"
  | "STOP";

const pilotStages: PilotWorkflowStage[] = [
  "DISCOVERY",
  "WORKFLOW_MAP",
  "BASELINE",
  "SCENARIOS",
  "CONFIGURATION",
  "EVALUATION",
  "EVIDENCE_PACK",
  "EXECUTIVE_READOUT",
  "EXPANSION_DECISION"
];

const requiredTransitionEvidence: Record<PilotWorkflowStage, string[]> = {
  DISCOVERY: [],
  WORKFLOW_MAP: ["discovery-brief"],
  BASELINE: ["workflow-map"],
  SCENARIOS: ["baseline-measurements"],
  CONFIGURATION: ["scenario-inventory", "pilot-control-contract"],
  EVALUATION: ["configuration-receipt", "cost-governor-receipt"],
  EVIDENCE_PACK: ["evaluation-results", "success-criteria-result"],
  EXECUTIVE_READOUT: ["evidence-pack"],
  EXPANSION_DECISION: ["executive-readout", "named-expansion-decision"]
};

export function transitionPilotWorkflow(input: {
  manifest: PilotManifest;
  currentStage: PilotWorkflowStage;
  requestedStage: PilotWorkflowStage;
  actorId: string;
  idempotencyKey: string;
  consumedIdempotencyKeys: string[];
  evidenceIds: string[];
  timestamp: string;
}) {
  const reasonCodes: string[] = [];
  const currentIndex = pilotStages.indexOf(input.currentStage);
  const requestedIndex = pilotStages.indexOf(input.requestedStage);
  if (!input.manifest.executionAuthorized) reasonCodes.push("SYNTHETIC_EXECUTION_APPROVAL_REQUIRED");
  if (currentIndex < 0 || requestedIndex !== currentIndex + 1) reasonCodes.push("NONSEQUENTIAL_TRANSITION_BLOCKED");
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(input.actorId)) reasonCodes.push("ATTRIBUTABLE_ACTOR_REQUIRED");
  if (!/^[A-Za-z0-9._:-]{8,160}$/.test(input.idempotencyKey)) reasonCodes.push("VALID_IDEMPOTENCY_KEY_REQUIRED");
  if (input.consumedIdempotencyKeys.includes(input.idempotencyKey)) reasonCodes.push("DUPLICATE_EXECUTION_BLOCKED");
  if (!Number.isFinite(Date.parse(input.timestamp))) reasonCodes.push("VALID_TIMESTAMP_REQUIRED");
  const required = requiredTransitionEvidence[input.requestedStage] ?? [];
  const missingEvidence = required.filter((id) => !input.evidenceIds.includes(id));
  if (missingEvidence.length > 0) reasonCodes.push(...missingEvidence.map((id) => `MISSING_EVIDENCE:${id}`));

  const allowed = reasonCodes.length === 0;
  const event = {
    pilotId: input.manifest.pilotId,
    currentStage: input.currentStage,
    requestedStage: input.requestedStage,
    resultingStage: allowed ? input.requestedStage : input.currentStage,
    actorId: input.actorId,
    timestamp: input.timestamp,
    idempotencyKeyHash: createClinicalEvidenceHash(input.idempotencyKey),
    evidenceIds: [...input.evidenceIds].sort(),
    allowed,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    customerSystemWriteAuthorized: false as const,
    productionAuthorityGranted: false as const
  };
  return {
    ...event,
    transitionHash: createClinicalEvidenceHash({ version: pilotOperatingSystemVersion, event })
  };
}

export type PilotMetricObservation = {
  metricId: string;
  observedValue: number;
  evidenceSourceId: string;
};

function criterionPassed(criterion: PilotSuccessCriterion, observedValue: number) {
  if (criterion.direction === "increase" || criterion.direction === "at-least") {
    return observedValue >= criterion.target;
  }
  return observedValue <= criterion.target;
}

export function evaluatePilotSuccessCriteria(input: {
  manifest: PilotManifest;
  observations: PilotMetricObservation[];
}) {
  const results = input.manifest.successCriteria.map((criterion) => {
    const observation = input.observations.find((entry) => entry.metricId === criterion.metricId);
    const evidenceMatches = Boolean(
      observation && observation.evidenceSourceId === criterion.evidenceSourceId
    );
    const passed = Boolean(
      observation
        && Number.isFinite(observation.observedValue)
        && evidenceMatches
        && criterionPassed(criterion, observation.observedValue)
    );
    return {
      metricId: criterion.metricId,
      mandatory: criterion.mandatory,
      baseline: criterion.baseline,
      target: criterion.target,
      observed: observation?.observedValue ?? null,
      evidenceMatches,
      passed,
      reasonCode: !observation
        ? "OBSERVATION_MISSING"
        : !evidenceMatches
          ? "EVIDENCE_SOURCE_MISMATCH"
          : passed
            ? "OBJECTIVE_THRESHOLD_MET"
            : "OBJECTIVE_THRESHOLD_MISSED"
    };
  });
  const mandatoryPass = results.every((result) => !result.mandatory || result.passed);
  const result = {
    status: mandatoryPass ? "PASS" as const : "FAIL" as const,
    mandatoryPass,
    executionAuthorized: input.manifest.executionAuthorized,
    eligibleForExpansion: mandatoryPass && input.manifest.executionAuthorized,
    evidenceClassification: "SYNTHETIC_FIXTURE" as const,
    passedCount: results.filter((entry) => entry.passed).length,
    criterionCount: results.length,
    results,
    vagueSuccessStateAllowed: false as const,
    productionAuthorityGranted: false as const
  };
  return {
    ...result,
    evaluationHash: createClinicalEvidenceHash({ version: pilotOperatingSystemVersion, result })
  };
}

export type PilotEvidencePacketV2 = {
  schemaVersion: typeof pilotOperatingSystemVersion;
  watermark: "SYNTHETIC / NON-PRODUCTION";
  manifestHash: string;
  candidateReference: string;
  datasetVersion: string;
  scenarioVersion: string;
  modelVersion: string;
  agentVersion: string;
  policyVersion: string;
  evaluationVersion: string;
  generatedAt: string;
  scope: string;
  baseline: string;
  workflowGraph: string[];
  controls: string[];
  evaluationHash: string;
  outputs: string[];
  limitations: string[];
  valueHypothesis: string;
  cost: PilotCostUsage;
  nextStepRecommendation: PilotExpansionState;
  evidenceState: "AUTHORIZED_SYNTHETIC_RUN_EVIDENCE" | "DRAFT_DEMONSTRATION_EVIDENCE";
  eligibleForExpansion: boolean;
  productionAuthorityGranted: false;
  evidenceHash: string;
};

export function buildPilotEvidencePacketV2(input: {
  manifest: PilotManifest;
  scenarioVersion: string;
  modelVersion: string;
  agentVersion: string;
  policyVersion: string;
  evaluationVersion: string;
  generatedAt: string;
  baseline: string;
  workflowGraph: string[];
  evaluationHash: string;
  outputs: string[];
  limitations: string[];
  valueHypothesis: string;
  cost: PilotCostUsage;
  nextStepRecommendation: PilotExpansionState;
}): PilotEvidencePacketV2 {
  const base = {
    schemaVersion: pilotOperatingSystemVersion as typeof pilotOperatingSystemVersion,
    watermark: "SYNTHETIC / NON-PRODUCTION" as const,
    manifestHash: input.manifest.manifestHash,
    candidateReference: input.manifest.candidateReference,
    datasetVersion: input.manifest.datasetVersion,
    scenarioVersion: input.scenarioVersion,
    modelVersion: input.modelVersion,
    agentVersion: input.agentVersion,
    policyVersion: input.policyVersion,
    evaluationVersion: input.evaluationVersion,
    generatedAt: input.generatedAt,
    scope: input.manifest.scope,
    baseline: input.baseline,
    workflowGraph: input.workflowGraph,
    controls: Object.keys(syntheticPilotControlContract),
    evaluationHash: input.evaluationHash,
    outputs: input.outputs,
    limitations: input.limitations,
    valueHypothesis: input.valueHypothesis,
    cost: input.cost,
    nextStepRecommendation: input.nextStepRecommendation,
    evidenceState: input.manifest.executionAuthorized
      ? "AUTHORIZED_SYNTHETIC_RUN_EVIDENCE" as const
      : "DRAFT_DEMONSTRATION_EVIDENCE" as const,
    eligibleForExpansion: input.manifest.executionAuthorized,
    productionAuthorityGranted: false as const
  };
  return {
    ...base,
    evidenceHash: createClinicalEvidenceHash({ version: pilotOperatingSystemVersion, base })
  };
}

export function evaluatePilotExpansion(input: {
  syntheticExecutionAuthorized: boolean;
  successCriteriaPassed: boolean;
  evidenceFresh: boolean;
  unresolvedCriticalRisk: boolean;
  requestedState: PilotExpansionState;
  insuranceReady: boolean;
  counselReady: boolean;
  privacySecurityReady: boolean;
  deploymentDesignReady: boolean;
  customerAuthorizationPresent: boolean;
}) {
  const reasons: string[] = [];
  if (!input.syntheticExecutionAuthorized) reasons.push("SYNTHETIC_EXECUTION_APPROVAL_REQUIRED");
  if (!input.evidenceFresh) reasons.push("STALE_EVIDENCE");
  if (!input.successCriteriaPassed) reasons.push("SUCCESS_THRESHOLDS_MISSED");
  if (input.unresolvedCriticalRisk) reasons.push("CRITICAL_RISK_UNRESOLVED");
  if (input.requestedState === "PREPARE_PROTECTED_PILOT") {
    if (!input.insuranceReady) reasons.push("INSURANCE_READINESS_REQUIRED");
    if (!input.counselReady) reasons.push("COUNSEL_REVIEW_REQUIRED");
    if (!input.privacySecurityReady) reasons.push("PRIVACY_SECURITY_REVIEW_REQUIRED");
    if (!input.deploymentDesignReady) reasons.push("DEPLOYMENT_DESIGN_REQUIRED");
    if (!input.customerAuthorizationPresent) reasons.push("CUSTOMER_AUTHORIZATION_REQUIRED");
  }
  const allowed = reasons.length === 0;
  const decision = {
    decision: allowed ? input.requestedState : input.evidenceFresh ? "NO_EXPANSION" as const : "STOP" as const,
    requestedState: input.requestedState,
    allowed,
    reasonCodes: reasons,
    protectedPilotActivated: false as const,
    customerActivationAuthorized: false as const,
    productionAuthorityGranted: false as const
  };
  return {
    ...decision,
    decisionHash: createClinicalEvidenceHash({ version: pilotOperatingSystemVersion, decision })
  };
}

export function buildPilotProposalFingerprint(input: {
  proposalId: string;
  version: string;
  scope: string;
  pricingScenario: Record<string, number>;
  candidateReference: string;
  expiresAt: string;
  approvalStatus: "DRAFT" | "HUMAN_APPROVAL_REQUIRED" | "APPROVED_FOR_DELIVERY";
}) {
  const scopeFingerprint = createClinicalEvidenceHash(input.scope);
  const pricingFingerprint = createClinicalEvidenceHash(input.pricingScenario);
  const validExpiry = Number.isFinite(Date.parse(input.expiresAt));
  const proposal = {
    ...input,
    scopeFingerprint,
    pricingFingerprint,
    validExpiry,
    agentMayDraft: true as const,
    agentMaySign: false as const,
    agentMayDiscount: false as const,
    contractAuthorized: false as const,
    productionAuthorityGranted: false as const
  };
  return {
    ...proposal,
    proposalFingerprint: createClinicalEvidenceHash({ version: pilotOperatingSystemVersion, proposal })
  };
}

export type BuyerReadinessInput = {
  archetype: string;
  pain: number;
  urgency: number;
  pilotFit: number;
  regulatoryExposure: number;
  dataBurden: number;
  integrationBurden: number;
  potentialContractSize: number;
  expansion: number;
  evidenceGain: number;
  strategicFit: number;
  effort: number;
};

function score(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function evaluateBuyerReadiness(input: BuyerReadinessInput) {
  const values = Object.entries(input).filter(([key]) => key !== "archetype").map(([, value]) => value as number);
  const valid = values.every(score);
  const commercialValue = (input.pain + input.urgency + input.potentialContractSize + input.expansion) / 4;
  const feasibility = (input.pilotFit + (100 - input.dataBurden) + (100 - input.integrationBurden)) / 3;
  const riskAdjustment = (input.regulatoryExposure + input.effort) / 2;
  const priorityScore = valid
    ? Math.max(0, Math.min(100, Number((
        commercialValue * 0.35
        + feasibility * 0.3
        + input.evidenceGain * 0.15
        + input.strategicFit * 0.2
        - riskAdjustment * 0.25
      ).toFixed(1))))
    : 0;
  const result = {
    archetype: input.archetype,
    status: !valid ? "INVALID" as const : priorityScore >= 70 ? "PRIORITY" as const : priorityScore >= 50 ? "QUALIFY" as const : "DEFER" as const,
    priorityScore,
    commercialValue: Number(commercialValue.toFixed(1)),
    pilotFeasibility: Number(feasibility.toFixed(1)),
    riskAdjustment: Number(riskAdjustment.toFixed(1)),
    automaticOutreachAuthorized: false as const,
    bindingCommercialActionAuthorized: false as const
  };
  return {
    ...result,
    decisionHash: createClinicalEvidenceHash({ version: pilotOperatingSystemVersion, input, result })
  };
}

export function getPilotOperatingSystemSummary() {
  const template = pilotTemplateRegistry.find((entry) => entry.templateId === "enterprise-ai-governance")!;
  const criteria: PilotSuccessCriterion[] = [
    { metricId: "evidence-coverage", label: "Evidence coverage", unit: "percent", direction: "at-least", baseline: 58, target: 90, mandatory: true, evidenceSourceId: "synthetic-governance-evaluation-v1" },
    { metricId: "review-burden", label: "Reviewer burden", unit: "minutes", direction: "at-most", baseline: 240, target: 120, mandatory: true, evidenceSourceId: "synthetic-governance-evaluation-v1" },
    { metricId: "cost-per-accepted-result", label: "Cost per accepted result", unit: "usd", direction: "at-most", baseline: 180, target: 120, mandatory: true, evidenceSourceId: "synthetic-governance-evaluation-v1" }
  ];
  const scope = "Evaluate one synthetic enterprise AI governance workflow across inventory, evidence, approvals, cost, audit, and release controls.";
  const manifestDecision = createPilotManifest({
    pilotId: "synthetic-governance-pilot",
    prospectAlias: "prospect-internal-demo-001",
    templateId: template.templateId,
    scope,
    environment: "synthetic-nonproduction",
    datasetVersion: "governance-scenarios-v1",
    candidateReference: "184b07843e9eaa4a0dd0bc2c783944b66df7cbc95b05dc37930663197ae71d16",
    modelPolicyVersion: "deterministic-policy-v1",
    evidencePolicyVersion: "synthetic-evidence-v1",
    costCeilingUsd: 500,
    durationDays: 30,
    successCriteria: criteria,
    exclusions: template.exclusions,
    approvalState: "HUMAN_SCOPE_REVIEW_REQUIRED",
    approvalEvidence: null,
    controlContract: syntheticPilotControlContract
  });
  if (!manifestDecision.manifest) throw new Error("Synthetic pilot fixture manifest must validate.");
  const observations = [
    { metricId: "evidence-coverage", observedValue: 94, evidenceSourceId: "synthetic-governance-evaluation-v1" },
    { metricId: "review-burden", observedValue: 96, evidenceSourceId: "synthetic-governance-evaluation-v1" },
    { metricId: "cost-per-accepted-result", observedValue: 82, evidenceSourceId: "synthetic-governance-evaluation-v1" }
  ];
  const success = evaluatePilotSuccessCriteria({ manifest: manifestDecision.manifest, observations });
  const costUsage: PilotCostUsage = {
    inferenceCostUsd: 34,
    toolCostUsd: 18,
    infrastructureCostUsd: 42,
    reviewCostUsd: 160,
    retries: 1,
    runtimeMinutes: 74
  };
  const costGovernor = evaluatePilotCostGovernor({
    maxInferenceCostUsd: 150,
    maxToolCostUsd: 100,
    maxRetries: 4,
    maxRuntimeMinutes: 180,
    maxTotalBudgetUsd: 500,
    warningThresholdPercent: 80
  }, costUsage);
  const expansion = evaluatePilotExpansion({
    syntheticExecutionAuthorized: manifestDecision.manifest.executionAuthorized,
    successCriteriaPassed: success.mandatoryPass,
    evidenceFresh: true,
    unresolvedCriticalRisk: false,
    requestedState: "EXTEND_SYNTHETIC_PILOT",
    insuranceReady: false,
    counselReady: false,
    privacySecurityReady: false,
    deploymentDesignReady: false,
    customerAuthorizationPresent: false
  });
  const evidencePacket = buildPilotEvidencePacketV2({
    manifest: manifestDecision.manifest,
    scenarioVersion: "governance-scenarios-v1",
    modelVersion: "deterministic-policy-engine-v1",
    agentVersion: "synthetic-governance-agent-v1",
    policyVersion: "synthetic-evidence-v1",
    evaluationVersion: "governance-evaluation-v1",
    generatedAt: "2026-08-27T12:30:00.000Z",
    baseline: "Disconnected synthetic inventory and release evidence requiring manual reconciliation.",
    workflowGraph: ["inventory", "classify", "evidence", "approve", "readout"],
    evaluationHash: success.evaluationHash,
    outputs: template.evidenceOutputs,
    limitations: ["Synthetic fixture only", "No customer outcome or production evidence", "Named protected-pilot approvals absent"],
    valueHypothesis: "A unified review surface may reduce reconciliation effort while retaining human authority.",
    cost: costUsage,
    nextStepRecommendation: expansion.decision
  });
  const margin = calculatePilotMarginScenario({
    proposedPriceUsd: 25_000,
    modelSpendUsd: 150,
    engineeringEffortUsd: 8_500,
    reviewBurdenUsd: 3_200,
    infrastructureUsd: 900,
    customerSupportUsd: 1_800
  });
  const buyerPriority = [
    { archetype: "health-system", pain: 88, urgency: 78, pilotFit: 91, regulatoryExposure: 28, dataBurden: 18, integrationBurden: 22, potentialContractSize: 84, expansion: 88, evidenceGain: 91, strategicFit: 94, effort: 38 },
    { archetype: "healthcare-oem", pain: 82, urgency: 74, pilotFit: 86, regulatoryExposure: 30, dataBurden: 20, integrationBurden: 26, potentialContractSize: 82, expansion: 84, evidenceGain: 89, strategicFit: 90, effort: 42 },
    { archetype: "public-sector", pain: 78, urgency: 70, pilotFit: 72, regulatoryExposure: 62, dataBurden: 30, integrationBurden: 48, potentialContractSize: 90, expansion: 82, evidenceGain: 86, strategicFit: 82, effort: 65 }
  ].map(evaluateBuyerReadiness).sort((left, right) => right.priorityScore - left.priorityScore);
  const proposal = buildPilotProposalFingerprint({
    proposalId: "proposal-synthetic-governance-001",
    version: "v1",
    scope,
    pricingScenario: { proposedPriceUsd: 25_000, estimatedDeliveryCostUsd: margin.result?.deliveryCostUsd ?? 0 },
    candidateReference: manifestDecision.manifest.candidateReference,
    expiresAt: "2026-09-26T12:00:00.000Z",
    approvalStatus: "HUMAN_APPROVAL_REQUIRED"
  });
  const payload = {
    version: pilotOperatingSystemVersion,
    templateRegistry: getPilotTemplateRegistrySummary(),
    manifestDecision,
    lifecycle: pilotStages,
    successCriteria: success,
    costGovernor,
    evidencePacket,
    executiveReadout: {
      problem: template.scope,
      baseline: evidencePacket.baseline,
      intervention: "Bounded synthetic governance workflow with deterministic controls and human review.",
      evidence: evidencePacket.evidenceHash,
      measuredSyntheticResult: `${success.passedCount}/${success.criterionCount} objective criteria passed`,
      limitations: evidencePacket.limitations,
      estimatedValue: margin,
      risk: template.risk,
      recommendedNextStep: expansion.decision,
      customerOutcomeClaimAuthorized: false as const
    },
    expansion,
    proposal,
    buyerPriority,
    trustReadiness: [
      { tier: "ASSESSMENT", status: "READY_FOR_HUMAN_SCOPING" },
      { tier: "SYNTHETIC_PILOT", status: "NAMED_SCOPE_APPROVAL_REQUIRED" },
      { tier: "PROTECTED_PILOT", status: "OPERATOR_PREREQUISITES_REQUIRED" },
      { tier: "PRODUCTION", status: "BLOCKED" }
    ],
    versions: {
      templateRegistry: pilotTemplateRegistryVersion,
      manifest: pilotManifestVersion,
      costGovernor: pilotCostGovernorVersion
    },
    productionAuthorityGranted: false as const,
    customerActivationAuthorized: false as const,
    boundary: "Synthetic, no-PHI, nonproduction pilot preparation and evaluation only. Humans retain commercial, clinical, legal, privacy, security, deployment, and customer authority."
  };
  return {
    ...payload,
    operatingSystemHash: createClinicalEvidenceHash({ version: pilotOperatingSystemVersion, payload })
  };
}
