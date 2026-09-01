import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getPilotOperatingSystemSummary } from "./pilotOperatingSystem";

export const syntheticPilotReadinessVersion =
  "scrimed-synthetic-pilot-readiness-v1-2026-08-25";
export const syntheticPilotRoute = "/synthetic-pilot";
export const syntheticPilotApiRoute = "/api/synthetic-pilot";
export const syntheticPilotBoundary =
  "Synthetic, no-PHI, nonclinical, nonproduction workflow evaluation only. No diagnosis, treatment, triage, patient outreach, payer submission, claim mutation, EHR or device writeback, binding quote, contract acceptance, production authority, customer activation, certification claim, or externally distributed outcome claim is authorized.";

export type SyntheticPilotStage =
  | "DISCOVERY"
  | "WORKFLOW_MAPPING"
  | "BASELINE"
  | "SYNTHETIC_SCENARIOS"
  | "CONTROLLED_CONFIGURATION"
  | "EVALUATION"
  | "EVIDENCE_PACKET"
  | "EXECUTIVE_READOUT"
  | "EXPANSION_DECISION";

export type SyntheticPilotReadinessStatus = "READY" | "READY_WITH_GAPS" | "NOT_READY";
export type SyntheticPilotBuyerSegment =
  | "health-system"
  | "payer"
  | "outpatient-network"
  | "revenue-cycle-group"
  | "healthcare-oem"
  | "academic-medical-center"
  | "public-sector-organization";

export type SyntheticPilotReadinessInput = {
  workflowClarity: number;
  syntheticDataAvailability: number;
  evidenceDesign: number;
  buyerProblem: number;
  technicalFit: number;
  integrationBurden: number;
  regulatoryExposure: number;
  implementationEffort: number;
  measurableOutcome: number;
  syntheticOnly: boolean;
  containsPhi: boolean;
  productionExecutionRequested: boolean;
};

export type SyntheticPilotReadinessDecision = {
  status: SyntheticPilotReadinessStatus;
  score: number;
  hardStops: string[];
  gaps: string[];
  recommendedNextStage: SyntheticPilotStage;
  productionAuthorityGranted: false;
  decisionHash: string;
};

export type SyntheticPilotBudget = {
  maximumModelCostUsd: number;
  maximumToolCalls: number;
  maximumRuntimeMinutes: number;
  maximumRetries: number;
  maximumAgentDepth: number;
};

export type SyntheticPilotBudgetUsage = {
  modelCostUsd: number;
  toolCalls: number;
  runtimeMinutes: number;
  retries: number;
  agentDepth: number;
};

export type SyntheticPilotProfile = {
  id: string;
  title: string;
  buyerSegments: SyntheticPilotBuyerSegment[];
  problem: string;
  workflow: string[];
  permittedActivities: string[];
  blockedActivities: string[];
  evidenceOutputs: string[];
  defaultBudget: SyntheticPilotBudget;
  profileHash: string;
};

export type SyntheticPilotValueHypothesis = {
  baselineWorkflow: string;
  pain: string;
  currentCostAssumptionUsd: number;
  currentTimeAssumptionMinutes: number;
  currentErrorOrReworkAssumption: number;
  expectedMechanismOfImprovement: string;
  measurementMethod: string;
  assumptionsRequired: true;
};

export type SyntheticPilotEvidenceLink = {
  scenarioId: string;
  modelId: string;
  agentId: string;
  workflowId: string;
  evaluationId: string;
  metricId: string;
  evidenceSourceId: string;
};

export type SyntheticPilotEvidencePack = {
  schemaVersion: typeof syntheticPilotReadinessVersion;
  watermark: "SYNTHETIC / NON-PRODUCTION";
  profileId: string;
  scope: string;
  baseline: string;
  workflowGraph: string[];
  scenarioInventory: string[];
  controls: string[];
  outcomes: string[];
  limitations: string[];
  cost: SyntheticPilotBudgetUsage;
  valueHypothesis: SyntheticPilotValueHypothesis;
  evidenceLinks: SyntheticPilotEvidenceLink[];
  reproducibility: {
    scenarioVersion: string;
    candidateReference: string;
    modelVersion: string;
    configurationVersion: string;
    evaluationVersion: string;
  };
  nextDecision: "REVIEW_PILOT_SCOPE" | "REMEDIATE_GAPS" | "DO_NOT_PROCEED";
  bindingQuoteAuthorized: false;
  productionAuthorityGranted: false;
  evidenceHash: string;
};

export type SyntheticPilotCommercialHandoff = {
  watermark: "DRAFT / SYNTHETIC / NON-BINDING";
  pilotEvidenceHash: string;
  unresolvedRisks: string[];
  requiredCustomerDecisions: string[];
  integrationPrerequisites: string[];
  securityPrivacyPrerequisites: string[];
  draftOnly: true;
  contractAuthorized: false;
  handoffHash: string;
};

export type WorkflowIntelligenceAssessment = {
  workflowMap: string[];
  bottlenecks: string[];
  handoffs: string[];
  timeAssumptionsMinutes: number[];
  risks: string[];
  boundedAutomationCandidates: string[];
  evidenceNeeds: string[];
  expectedValueCategories: string[];
  clinicalDiagnosisAuthorized: false;
  assessmentHash: string;
};

const lifecycle: SyntheticPilotStage[] = [
  "DISCOVERY",
  "WORKFLOW_MAPPING",
  "BASELINE",
  "SYNTHETIC_SCENARIOS",
  "CONTROLLED_CONFIGURATION",
  "EVALUATION",
  "EVIDENCE_PACKET",
  "EXECUTIVE_READOUT",
  "EXPANSION_DECISION"
];

const scoreWeights = {
  workflowClarity: 0.14,
  syntheticDataAvailability: 0.12,
  evidenceDesign: 0.14,
  buyerProblem: 0.12,
  technicalFit: 0.12,
  integrationReadiness: 0.09,
  regulatoryFit: 0.09,
  implementationFit: 0.08,
  measurableOutcome: 0.1
} as const;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function validScore(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function pilotHash(value: unknown) {
  return createClinicalEvidenceHash({
    version: syntheticPilotReadinessVersion,
    boundary: syntheticPilotBoundary,
    value
  });
}

export function evaluateSyntheticPilotReadiness(
  input: Partial<SyntheticPilotReadinessInput>
): SyntheticPilotReadinessDecision {
  const scoreKeys: Array<keyof Omit<SyntheticPilotReadinessInput, "syntheticOnly" | "containsPhi" | "productionExecutionRequested">> = [
    "workflowClarity",
    "syntheticDataAvailability",
    "evidenceDesign",
    "buyerProblem",
    "technicalFit",
    "integrationBurden",
    "regulatoryExposure",
    "implementationEffort",
    "measurableOutcome"
  ];
  const hardStops: string[] = [];
  const gaps: string[] = [];

  for (const key of scoreKeys) {
    if (!validScore(input[key] as number)) hardStops.push(`INVALID_OR_MISSING_${key.toUpperCase()}`);
  }
  if (input.syntheticOnly !== true) hardStops.push("SYNTHETIC_ONLY_REQUIRED");
  if (input.containsPhi !== false) hardStops.push("PHI_PROHIBITED");
  if (input.productionExecutionRequested !== false) hardStops.push("PRODUCTION_EXECUTION_PROHIBITED");

  if (hardStops.length > 0) {
    const decision = {
      status: "NOT_READY" as const,
      score: 0,
      hardStops: [...new Set(hardStops)].sort(),
      gaps,
      recommendedNextStage: "DISCOVERY" as const,
      productionAuthorityGranted: false as const
    };
    return { ...decision, decisionHash: pilotHash(decision) };
  }

  const values = input as SyntheticPilotReadinessInput;
  const score = clampScore(
    values.workflowClarity * scoreWeights.workflowClarity +
      values.syntheticDataAvailability * scoreWeights.syntheticDataAvailability +
      values.evidenceDesign * scoreWeights.evidenceDesign +
      values.buyerProblem * scoreWeights.buyerProblem +
      values.technicalFit * scoreWeights.technicalFit +
      (100 - values.integrationBurden) * scoreWeights.integrationReadiness +
      (100 - values.regulatoryExposure) * scoreWeights.regulatoryFit +
      (100 - values.implementationEffort) * scoreWeights.implementationFit +
      values.measurableOutcome * scoreWeights.measurableOutcome
  );

  if (values.workflowClarity < 60) gaps.push("WORKFLOW_CLARITY_BELOW_PILOT_FLOOR");
  if (values.syntheticDataAvailability < 60) gaps.push("SYNTHETIC_DATA_GAP");
  if (values.evidenceDesign < 65) gaps.push("EVIDENCE_DESIGN_GAP");
  if (values.buyerProblem < 55) gaps.push("BUYER_PROBLEM_NOT_YET_SPECIFIC");
  if (values.measurableOutcome < 60) gaps.push("OUTCOME_NOT_MEASURABLE_ENOUGH");
  if (values.integrationBurden > 70) gaps.push("INTEGRATION_BURDEN_TOO_HIGH_FOR_SYNTHETIC_PILOT");
  if (values.regulatoryExposure > 60) gaps.push("REGULATORY_EXPOSURE_REQUIRES_SCOPE_REDUCTION");
  if (values.implementationEffort > 75) gaps.push("IMPLEMENTATION_EFFORT_EXCEEDS_BOUNDED_PILOT");

  const status: SyntheticPilotReadinessStatus =
    gaps.some((gap) => gap.includes("REGULATORY_EXPOSURE") || gap.includes("SYNTHETIC_DATA")) || score < 55
      ? "NOT_READY"
      : gaps.length === 0 && score >= 75
        ? "READY"
        : "READY_WITH_GAPS";
  const decision = {
    status,
    score,
    hardStops,
    gaps: [...new Set(gaps)].sort(),
    recommendedNextStage:
      status === "READY" ? ("WORKFLOW_MAPPING" as const) : ("DISCOVERY" as const),
    productionAuthorityGranted: false as const
  };
  return { ...decision, decisionHash: pilotHash(decision) };
}

export function evaluateSyntheticPilotBudget(
  budget: SyntheticPilotBudget,
  usage: SyntheticPilotBudgetUsage
) {
  const finiteNonnegative = (value: number) => Number.isFinite(value) && value >= 0;
  const wholeNonnegative = (value: number) => finiteNonnegative(value) && Number.isInteger(value);
  const invalid = [
    finiteNonnegative(budget.maximumModelCostUsd) ? null : "INVALID_MAXIMUM_MODEL_COST",
    wholeNonnegative(budget.maximumToolCalls) ? null : "INVALID_MAXIMUM_TOOL_CALLS",
    finiteNonnegative(budget.maximumRuntimeMinutes) ? null : "INVALID_MAXIMUM_RUNTIME",
    wholeNonnegative(budget.maximumRetries) ? null : "INVALID_MAXIMUM_RETRIES",
    wholeNonnegative(budget.maximumAgentDepth) ? null : "INVALID_MAXIMUM_AGENT_DEPTH",
    finiteNonnegative(usage.modelCostUsd) ? null : "INVALID_MODEL_COST_USAGE",
    wholeNonnegative(usage.toolCalls) ? null : "INVALID_TOOL_CALL_USAGE",
    finiteNonnegative(usage.runtimeMinutes) ? null : "INVALID_RUNTIME_USAGE",
    wholeNonnegative(usage.retries) ? null : "INVALID_RETRY_USAGE",
    wholeNonnegative(usage.agentDepth) ? null : "INVALID_AGENT_DEPTH_USAGE"
  ].filter((value): value is string => Boolean(value));
  const exceeded = [
    ...invalid,
    finiteNonnegative(usage.modelCostUsd) && finiteNonnegative(budget.maximumModelCostUsd)
      && usage.modelCostUsd > budget.maximumModelCostUsd ? "MODEL_BUDGET_EXCEEDED" : null,
    wholeNonnegative(usage.toolCalls) && wholeNonnegative(budget.maximumToolCalls)
      && usage.toolCalls > budget.maximumToolCalls ? "TOOL_BUDGET_EXCEEDED" : null,
    finiteNonnegative(usage.runtimeMinutes) && finiteNonnegative(budget.maximumRuntimeMinutes)
      && usage.runtimeMinutes > budget.maximumRuntimeMinutes ? "RUNTIME_BUDGET_EXCEEDED" : null,
    wholeNonnegative(usage.retries) && wholeNonnegative(budget.maximumRetries)
      && usage.retries > budget.maximumRetries ? "RETRY_BUDGET_EXCEEDED" : null,
    wholeNonnegative(usage.agentDepth) && wholeNonnegative(budget.maximumAgentDepth)
      && usage.agentDepth > budget.maximumAgentDepth ? "AGENT_DEPTH_EXCEEDED" : null
  ].filter((value): value is string => Boolean(value));
  const result = {
    status: exceeded.length === 0 ? ("PASS" as const) : ("BLOCK" as const),
    exceeded,
    executionAllowed: exceeded.length === 0,
    productionAuthorityGranted: false as const
  };
  return { ...result, receiptHash: pilotHash({ budget, usage, result }) };
}

export function transitionSyntheticPilotStage(current: SyntheticPilotStage, requested: SyntheticPilotStage) {
  const currentIndex = lifecycle.indexOf(current);
  const requestedIndex = lifecycle.indexOf(requested);
  const allowed = currentIndex >= 0 && requestedIndex === currentIndex + 1;
  const result = {
    allowed,
    current,
    requested,
    resultingStage: allowed ? requested : current,
    reasonCode: allowed ? "BOUNDED_STAGE_ADVANCE" : "STAGE_SKIP_OR_REVERSAL_BLOCKED",
    productionAuthorityGranted: false as const
  };
  return { ...result, transitionHash: pilotHash(result) };
}

export function calculateVerifiedIntelligenceYield(input: {
  acceptedUsefulOutputs: number;
  modelCostUsd: number;
  retries: number;
  reviewBurdenMinutes: number;
  corrections: number;
}) {
  const denominator = input.modelCostUsd + input.retries + input.reviewBurdenMinutes + input.corrections;
  const valid = Object.values(input).every((value) => Number.isFinite(value) && value >= 0) && denominator > 0;
  return {
    status: valid ? ("CALCULATED_SYNTHETIC" as const) : ("INSUFFICIENT_INPUT" as const),
    verifiedIntelligenceYield: valid ? Number((input.acceptedUsefulOutputs / denominator).toFixed(4)) : null,
    denominator,
    syntheticOnly: true as const,
    boundary: "A synthetic efficiency indicator, not an ROI, revenue, clinical-outcome, or customer-performance claim."
  };
}

export function calculateSyntheticPilotEconomics(input: {
  modelSpendUsd: number;
  infrastructureUsd: number;
  implementationUsd: number;
  reviewEffortUsd: number;
  supportBurdenUsd: number;
  nonbindingPriceScenarioUsd?: number;
}) {
  const costInputs = [
    input.modelSpendUsd,
    input.infrastructureUsd,
    input.implementationUsd,
    input.reviewEffortUsd,
    input.supportBurdenUsd
  ];
  const valid = costInputs.every((value) => Number.isFinite(value) && value >= 0);
  const totalCostUsd = valid ? costInputs.reduce((sum, value) => sum + value, 0) : null;
  const price = input.nonbindingPriceScenarioUsd;
  const marginScenarioValid =
    totalCostUsd !== null && typeof price === "number" && Number.isFinite(price) && price > 0;
  return {
    status: valid ? "SYNTHETIC_SCENARIO" as const : "INVALID_INPUT" as const,
    totalCostUsd,
    breakEvenPriceUsd: totalCostUsd,
    nonbindingPriceScenarioUsd: marginScenarioValid ? price : null,
    grossMarginPotentialPercent: marginScenarioValid
      ? Number((((price - totalCostUsd) / price) * 100).toFixed(1))
      : null,
    bindingQuoteAuthorized: false as const,
    boundary: "Scenario math only. Revenue, margin, quote, delivery, and customer commitments require named human commercial and finance approval."
  };
}

function createProfile(profile: Omit<SyntheticPilotProfile, "profileHash">): SyntheticPilotProfile {
  return { ...profile, profileHash: pilotHash(profile) };
}

const blockedPilotActivities = [
  "live PHI processing",
  "production connector activation",
  "diagnosis, treatment, prescribing, or triage",
  "payer or claim submission",
  "EHR, device, RIS, PACS, or RCM writeback",
  "binding quote, contract, liability, or delivery commitment",
  "customer activation or production deployment"
];

const standardBudget: SyntheticPilotBudget = {
  maximumModelCostUsd: 250,
  maximumToolCalls: 400,
  maximumRuntimeMinutes: 240,
  maximumRetries: 12,
  maximumAgentDepth: 4
};

export const syntheticPilotProfiles: SyntheticPilotProfile[] = [
  createProfile({
    id: "administrative-workflow-intelligence",
    title: "Administrative Workflow Intelligence",
    buyerSegments: ["health-system", "outpatient-network", "academic-medical-center"],
    problem: "Fragmented administrative handoffs make ownership, delay, and rework difficult to measure.",
    workflow: ["map current state", "model synthetic cases", "evaluate bottlenecks", "prepare evidence packet"],
    permittedActivities: ["workflow mapping", "handoff simulation", "time and rework measurement"],
    blockedActivities: blockedPilotActivities,
    evidenceOutputs: ["workflow graph", "bottleneck register", "bounded automation candidates"],
    defaultBudget: standardBudget
  }),
  createProfile({
    id: "rcm-workflow-intelligence",
    title: "RCM Workflow Intelligence",
    buyerSegments: ["health-system", "payer", "revenue-cycle-group"],
    problem: "Documentation gaps and policy variation create avoidable claim-preparation rework.",
    workflow: ["synthetic documentation review", "claim-quality simulation", "denial-root-cause simulation", "policy mapping"],
    permittedActivities: ["documentation completeness evaluation", "claim-quality simulation", "payer-policy mapping"],
    blockedActivities: [...blockedPilotActivities, "coverage determination", "financial adjustment"],
    evidenceOutputs: ["missing-evidence matrix", "simulated denial drivers", "human review queue"],
    defaultBudget: standardBudget
  }),
  createProfile({
    id: "documentation-quality-workflow",
    title: "Documentation Quality Workflow",
    buyerSegments: ["health-system", "outpatient-network", "academic-medical-center"],
    problem: "Documentation quality is hard to compare consistently across synthetic workflow variants.",
    workflow: ["establish rubric", "run synthetic drafts", "score omissions", "record reviewer corrections"],
    permittedActivities: ["synthetic draft evaluation", "rubric scoring", "review-burden measurement"],
    blockedActivities: [...blockedPilotActivities, "record finalization"],
    evidenceOutputs: ["quality rubric", "omission report", "reviewer correction ledger"],
    defaultBudget: standardBudget
  }),
  createProfile({
    id: "enterprise-ai-governance",
    title: "Enterprise AI Governance",
    buyerSegments: ["health-system", "payer", "healthcare-oem", "public-sector-organization"],
    problem: "Model and agent inventories often lack shared risk, evidence, approval, cost, and release controls.",
    workflow: ["inventory models and agents", "classify risk", "map evidence", "simulate approval and release gates"],
    permittedActivities: ["inventory review", "risk classification", "auditability demonstration", "cost analysis"],
    blockedActivities: blockedPilotActivities,
    evidenceOutputs: ["model inventory", "agent inventory", "gate matrix", "audit receipt"],
    defaultBudget: standardBudget
  }),
  createProfile({
    id: "model-agent-assurance",
    title: "Model and Agent Assurance",
    buyerSegments: ["health-system", "healthcare-oem", "academic-medical-center", "public-sector-organization"],
    problem: "Teams need reproducible task-fit evidence before considering a model or agent for governed use.",
    workflow: ["define task profile", "run deterministic fixtures", "compare safety floors", "prepare promotion recommendation"],
    permittedActivities: ["non-PHI evaluation", "routing comparison", "failure-mode testing"],
    blockedActivities: [...blockedPilotActivities, "model promotion without named approval"],
    evidenceOutputs: ["benchmark card", "routing rationale", "no-eligible-route abstention evidence"],
    defaultBudget: standardBudget
  }),
  createProfile({
    id: "public-sector-healthcare-workflow",
    title: "Public-Sector Healthcare Workflow",
    buyerSegments: ["public-sector-organization"],
    problem: "Public-sector buyers need inspectable accessibility, residency, audit, procurement, and continuity evidence.",
    workflow: ["map procurement evidence", "evaluate synthetic workflow", "record assurance gaps", "prepare owner-bound action list"],
    permittedActivities: ["synthetic workflow assessment", "accessibility evidence mapping", "procurement artifact inventory"],
    blockedActivities: [...blockedPilotActivities, "government authorization or purchasing-eligibility claim"],
    evidenceOutputs: ["readiness profile", "evidence owner map", "unresolved authorization register"],
    defaultBudget: standardBudget
  })
];

export function evaluateSyntheticPilotBuyerFit(input: {
  segment: SyntheticPilotBuyerSegment;
  pain: number;
  technicalFit: number;
  dataBurden: number;
  integrationBurden: number;
  regulatoryExposure: number;
  expectedValue: number;
  pilotFeasibility: number;
}) {
  const dimensions = [
    input.pain,
    input.technicalFit,
    input.dataBurden,
    input.integrationBurden,
    input.regulatoryExposure,
    input.expectedValue,
    input.pilotFeasibility
  ];
  const valid = dimensions.every(validScore);
  const score = valid
    ? clampScore(
        input.pain * 0.2 +
          input.technicalFit * 0.15 +
          (100 - input.dataBurden) * 0.12 +
          (100 - input.integrationBurden) * 0.12 +
          (100 - input.regulatoryExposure) * 0.13 +
          input.expectedValue * 0.14 +
          input.pilotFeasibility * 0.14
      )
    : 0;
  return {
    segment: input.segment,
    score,
    status: !valid ? "NOT_READY" as const : score >= 75 ? "STRONG_FIT" as const : score >= 55 ? "REVIEW_FIT" as const : "LOW_FIT" as const,
    automaticOutreachAuthorized: false as const,
    bindingCommercialActionAuthorized: false as const,
    decisionHash: pilotHash({ input, score })
  };
}

export function buildSyntheticPilotEvidencePack(input: {
  profile: SyntheticPilotProfile;
  readiness: SyntheticPilotReadinessDecision;
  usage: SyntheticPilotBudgetUsage;
  valueHypothesis: SyntheticPilotValueHypothesis;
  candidateReference: string;
}): SyntheticPilotEvidencePack {
  const evidenceLinks = input.profile.evidenceOutputs.map((_, index) => ({
    scenarioId: `${input.profile.id}-scenario-${index + 1}`,
    modelId: "deterministic-policy-engine-v1",
    agentId: `synthetic-${input.profile.id}-agent`,
    workflowId: input.profile.id,
    evaluationId: `${input.profile.id}-evaluation-v1`,
    metricId: `${input.profile.id}-metric-${index + 1}`,
    evidenceSourceId: `${input.profile.id}-fixture-v1`
  }));
  const packet: Omit<SyntheticPilotEvidencePack, "evidenceHash"> = {
    schemaVersion: syntheticPilotReadinessVersion,
    watermark: "SYNTHETIC / NON-PRODUCTION" as const,
    profileId: input.profile.id,
    scope: input.profile.problem,
    baseline: input.valueHypothesis.baselineWorkflow,
    workflowGraph: input.profile.workflow,
    scenarioInventory: evidenceLinks.map((link) => link.scenarioId),
    controls: [
      "no PHI",
      "nonproduction",
      "human-reviewed evidence",
      "bounded spend, tools, runtime, retries, and agent depth",
      "no binding commercial or clinical authority"
    ],
    outcomes: input.profile.evidenceOutputs,
    limitations: [syntheticPilotBoundary, ...input.readiness.gaps],
    cost: input.usage,
    valueHypothesis: input.valueHypothesis,
    evidenceLinks,
    reproducibility: {
      scenarioVersion: `${input.profile.id}-fixtures-v1`,
      candidateReference: input.candidateReference,
      modelVersion: "deterministic-policy-engine-v1",
      configurationVersion: syntheticPilotReadinessVersion,
      evaluationVersion: "synthetic-pilot-evaluation-v1"
    },
    nextDecision:
      input.readiness.status === "READY"
        ? ("REVIEW_PILOT_SCOPE" as const)
        : input.readiness.status === "READY_WITH_GAPS"
          ? ("REMEDIATE_GAPS" as const)
          : ("DO_NOT_PROCEED" as const),
    bindingQuoteAuthorized: false as const,
    productionAuthorityGranted: false as const
  };
  return { ...packet, evidenceHash: pilotHash(packet) };
}

export function buildSyntheticPilotCommercialHandoff(
  packet: SyntheticPilotEvidencePack
): SyntheticPilotCommercialHandoff {
  const handoff = {
    watermark: "DRAFT / SYNTHETIC / NON-BINDING" as const,
    pilotEvidenceHash: packet.evidenceHash,
    unresolvedRisks: packet.limitations,
    requiredCustomerDecisions: [
      "name executive and workflow owners",
      "approve acceptance criteria and synthetic scenario scope",
      "approve any nonbinding commercial proposal",
      "decide whether to stop, remediate, or request protected-pilot diligence"
    ],
    integrationPrerequisites: [
      "approved source and interface inventory",
      "tenant and purpose scopes",
      "tested rollback and recovery plan",
      "separate production connector authorization"
    ],
    securityPrivacyPrerequisites: [
      "security and privacy review",
      "data classification and retention decision",
      "identity, AAL2, RBAC, audit, and idempotency evidence",
      "no-PHI boundary until separately authorized"
    ],
    draftOnly: true as const,
    contractAuthorized: false as const
  };
  return { ...handoff, handoffHash: pilotHash(handoff) };
}

export function buildWorkflowIntelligenceAssessment(input: {
  profile: SyntheticPilotProfile;
  valueHypothesis: SyntheticPilotValueHypothesis;
}): WorkflowIntelligenceAssessment {
  const assessment = {
    workflowMap: input.profile.workflow,
    bottlenecks: [input.valueHypothesis.pain, "fragmented evidence", "unclear review ownership"],
    handoffs: input.profile.workflow.slice(0, -1).map((step, index) => `${step} -> ${input.profile.workflow[index + 1]}`),
    timeAssumptionsMinutes: [input.valueHypothesis.currentTimeAssumptionMinutes],
    risks: ["unsupported claim", "scope expansion", "review burden", "production boundary confusion"],
    boundedAutomationCandidates: input.profile.permittedActivities,
    evidenceNeeds: ["declared baseline", "scenario inventory", "acceptance rubric", "review receipt", "cost record"],
    expectedValueCategories: ["time returned", "rework avoided", "workflow steps removed", "cost avoided"],
    clinicalDiagnosisAuthorized: false as const
  };
  return { ...assessment, assessmentHash: pilotHash(assessment) };
}

export const syntheticPilotCommercialPosture = {
  assessment: {
    name: "Workflow Intelligence Assessment",
    price: "Starting at $25K, subject to written agreement",
    authority: "non-binding-public-starting-point"
  },
  syntheticPilot: {
    name: "SCRIMED Synthetic Workflow Pilot",
    price: "Custom enterprise scope",
    authority: "named-human-proposal-approval-required"
  },
  protectedPilot: {
    name: "Protected Enterprise Pilot",
    price: "Custom enterprise scope subject to security, privacy, insurance, deployment-readiness, and written authorization requirements",
    authority: "blocked-before-external-prerequisites"
  },
  agentAllowed: ["draft pilot scope", "calculate synthetic scenarios", "prepare nonbinding proposal drafts"],
  agentBlocked: [
    "sign or accept terms",
    "issue binding quotes",
    "commit delivery dates",
    "negotiate liability",
    "authorize PHI or production"
  ]
} as const;

export function getSyntheticPilotReadinessSummary() {
  const readiness = evaluateSyntheticPilotReadiness({
    workflowClarity: 86,
    syntheticDataAvailability: 92,
    evidenceDesign: 90,
    buyerProblem: 84,
    technicalFit: 88,
    integrationBurden: 18,
    regulatoryExposure: 12,
    implementationEffort: 36,
    measurableOutcome: 87,
    syntheticOnly: true,
    containsPhi: false,
    productionExecutionRequested: false
  });
  const usage: SyntheticPilotBudgetUsage = {
    modelCostUsd: 34,
    toolCalls: 48,
    runtimeMinutes: 52,
    retries: 2,
    agentDepth: 3
  };
  const profile = syntheticPilotProfiles.find((entry) => entry.id === "enterprise-ai-governance") ?? syntheticPilotProfiles[0];
  const valueHypothesis: SyntheticPilotValueHypothesis = {
    baselineWorkflow: "Synthetic governance review assembled manually across disconnected model, agent, policy, cost, and release records.",
    pain: "Reviewers spend avoidable time reconciling evidence and cannot quickly identify unresolved authority gates.",
    currentCostAssumptionUsd: 4800,
    currentTimeAssumptionMinutes: 960,
    currentErrorOrReworkAssumption: 12,
    expectedMechanismOfImprovement: "Unify inventory, evidence, policy, and release state into one reviewable synthetic workflow packet.",
    measurementMethod: "Compare synthetic baseline time, missing evidence, review burden, and correction counts against the governed pilot output.",
    assumptionsRequired: true
  };
  const evidencePack = buildSyntheticPilotEvidencePack({
    profile,
    readiness,
    usage,
    valueHypothesis,
    candidateReference: "runtime-candidate-bound-at-build"
  });
  const budgetDecision = evaluateSyntheticPilotBudget(profile.defaultBudget, usage);
  const workflowAssessment = buildWorkflowIntelligenceAssessment({ profile, valueHypothesis });
  const commercialHandoff = buildSyntheticPilotCommercialHandoff(evidencePack);
  const verifiedIntelligenceYield = calculateVerifiedIntelligenceYield({
    acceptedUsefulOutputs: 18,
    modelCostUsd: usage.modelCostUsd,
    retries: usage.retries,
    reviewBurdenMinutes: 42,
    corrections: 3
  });
  const economics = calculateSyntheticPilotEconomics({
    modelSpendUsd: usage.modelCostUsd,
    infrastructureUsd: 180,
    implementationUsd: 6400,
    reviewEffortUsd: 2600,
    supportBurdenUsd: 1200
  });
  const pilotOperatingSystem = getPilotOperatingSystemSummary();

  return {
    service: "scrimed-synthetic-pilot-readiness",
    version: syntheticPilotReadinessVersion,
    route: syntheticPilotRoute,
    apiRoute: syntheticPilotApiRoute,
    status: readiness.status,
    package: {
      name: "SCRIMED Synthetic Workflow Pilot",
      scope: "One bounded, owner-defined workflow evaluated with synthetic scenarios and inspectable evidence.",
      deliverables: ["workflow map", "synthetic scenario set", "evaluation results", "evidence packet", "executive readout"],
      duration: "Custom bounded duration set in a written, human-approved scope",
      responsibilities: ["SCRIMED prepares synthetic evaluation", "buyer names workflow and review owners", "humans approve claims and next steps"],
      successCriteria: ["workflow completion measured", "evidence coverage measured", "review burden recorded", "retained safety gates verified"],
      exclusions: blockedPilotActivities,
      evidenceOutputs: profile.evidenceOutputs,
      reversible: true,
      noPhi: true,
      nonclinical: true,
      nonproduction: true
    },
    lifecycle,
    readiness,
    activeProfile: profile,
    profiles: syntheticPilotProfiles,
    valueHypothesis,
    evidencePack,
    workflowAssessment,
    commercialHandoff,
    budgetDecision,
    verifiedIntelligenceYield,
    economics,
    pilotOperatingSystem,
    healthcareValueReturned: {
      simulatedTimeReturnedMinutes: 420,
      simulatedReworkAvoided: 8,
      simulatedWorkflowStepsRemoved: 5,
      simulatedCostAvoidedUsd: 2100,
      assumptionsRequired: true,
      claimAuthorized: false
    },
    commercialPosture: syntheticPilotCommercialPosture,
    commercialReadiness: {
      assessment: "READY_FOR_HUMAN_SCOPING",
      syntheticPilot: readiness.status,
      protectedPilot: "OPERATOR_PREREQUISITES_REQUIRED",
      customerActivation: "BLOCKED"
    },
    decisionEscalation: [
      "binding commercial amount",
      "partnership",
      "customer commitment",
      "material scope",
      "liability",
      "PHI",
      "production"
    ],
    boundary: syntheticPilotBoundary
  };
}
