import {
  evaluateScrimedAutomationAutopilotRequest,
  type ScrimedAutomationAutopilotDomain
} from "../scrimedAutomationAutopilot";
import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import {
  getScrimedOperatingModeSummary,
  validateScrimedOperatingMode,
  type ScrimedOperatingMode
} from "../operatingMode";
import { getReviewActionOperatingModeBlockReason } from "./reviewPolicyPreflight";
import {
  getReviewRequirement,
  scrimedReviewPolicyVersion,
  type ReviewAction,
  type ReviewPolicyDecision
} from "./reviewPolicyEngine";

export const scrimedDevelopmentContinuityVersion =
  "scrimed-development-continuity-v1-2026-08-08";

export type DevelopmentContinuityStatus =
  | "AUTOMATIC_PREFLIGHT_ELIGIBLE"
  | "EVIDENCE_REQUIRED"
  | "FOUNDER_ACCEPTANCE_REQUIRED"
  | "QUALIFIED_REVIEW_REQUIRED"
  | "PRODUCTION_AUTHORIZATION_REQUIRED"
  | "BLOCKED_BY_OPERATING_MODE"
  | "PROHIBITED";

export type DevelopmentContinuityEffort = "small" | "medium" | "large";

export type DevelopmentStrategicValueFactors = {
  marketValue: 1 | 2 | 3 | 4 | 5;
  moatContribution: 1 | 2 | 3 | 4 | 5;
  evidenceGain: 1 | 2 | 3 | 4 | 5;
  crossSellPotential: 1 | 2 | 3 | 4 | 5;
  investorRelevance: 1 | 2 | 3 | 4 | 5;
  implementationEffort: 1 | 2 | 3 | 4 | 5;
  regulatoryRisk: 1 | 2 | 3 | 4 | 5;
  securityRisk: 1 | 2 | 3 | 4 | 5;
  capitalCost: 1 | 2 | 3 | 4 | 5;
  dependencyRisk: 1 | 2 | 3 | 4 | 5;
};

export type DevelopmentContinuityAction = {
  action: ReviewAction;
  title: string;
  domain: ScrimedAutomationAutopilotDomain;
  owner: string;
  priority: number;
  expectedStrategicImpact: 1 | 2 | 3 | 4 | 5;
  strategicValueScore: number;
  strategicValueFactors: DevelopmentStrategicValueFactors;
  effort: DevelopmentContinuityEffort;
  dependencies: string[];
  valueHypothesis: string;
  founderDecisionRequired: boolean;
  status: DevelopmentContinuityStatus;
  policyDecision: ReviewPolicyDecision;
  riskTier: 0 | 1 | 2 | 3 | "PROHIBITED";
  executionAuthority: string;
  requiredEvidence: string[];
  availableEvidence: string[];
  missingEvidence: string[];
  requiredReviewerRoles: string[];
  humanReviewRequired: boolean;
  preparationAllowed: boolean;
  automaticExecutionEligible: boolean;
  executionAuthorized: false;
  externalMutationAllowed: false;
  operatingModeBlockReason: string | null;
  nextAction: string;
  automationDecision: ReturnType<typeof evaluateScrimedAutomationAutopilotRequest>;
  evidenceHash: string;
};

export type DevelopmentContinuityPlan = {
  service: "scrimed-development-continuity-planner";
  version: typeof scrimedDevelopmentContinuityVersion;
  policyVersion: typeof scrimedReviewPolicyVersion;
  authorizationStatus: "NOT_EVALUATED";
  policyPostureOnly: true;
  mustInvokeReviewPolicyBeforeExecution: true;
  productionAuthorityGranted: false;
  operatingMode: {
    version: ScrimedOperatingMode["version"];
    safeDefaultsActive: boolean;
    syntheticOnly: boolean;
    allowPHI: boolean;
    liveClinicalExecution: boolean;
  };
  evidenceReferences: string[];
  actionCount: number;
  counts: Record<DevelopmentContinuityStatus, number>;
  recommendedAction: DevelopmentContinuityAction | null;
  bestNextAction: DevelopmentContinuityAction | null;
  bestLowRiskAction: DevelopmentContinuityAction | null;
  bestMoatAction: DevelopmentContinuityAction | null;
  bestRevenueAction: DevelopmentContinuityAction | null;
  bestInvestorReadinessAction: DevelopmentContinuityAction | null;
  priorityActions: DevelopmentContinuityAction[];
  actions: DevelopmentContinuityAction[];
  retainedBoundaries: string[];
  planFingerprint: string;
};

type ContinuityCatalogItem = {
  title: string;
  domain: ScrimedAutomationAutopilotDomain;
  owner: string;
  priority: number;
  nextAction: string;
  touchesPhi?: boolean;
  irreversible?: boolean;
  externalAction?: boolean;
  clinicalFacing?: boolean;
  productionTarget?: boolean;
};

const continuityCatalog: Record<ReviewAction, ContinuityCatalogItem> = {
  "synthetic-demonstration": {
    title: "Run a synthetic product demonstration",
    domain: "proof-packaging",
    owner: "Product Operations",
    priority: 10,
    nextAction:
      "Run the bounded synthetic demo rehearsal, retain the no-PHI disclosure, and capture deterministic smoke evidence."
  },
  "source-commit": {
    title: "Promote reviewed source into a local candidate commit",
    domain: "release-readiness",
    owner: "Engineering + Founder",
    priority: 20,
    nextAction:
      "Generate a clean source manifest, validation summary, secret scan, and SBOM before requesting fingerprint-bound founder acceptance."
  },
  "disposable-migration-dry-run": {
    title: "Validate migrations in a disposable environment",
    domain: "release-readiness",
    owner: "Database Owner",
    priority: 30,
    nextAction:
      "Verify the disposable database boundary, migration checksums, and forward-recovery strategy before running the dry-run."
  },
  "preview-deployment": {
    title: "Publish an isolated synthetic preview",
    domain: "release-readiness",
    owner: "Release Steward + Founder",
    priority: 40,
    nextAction:
      "Prepare the preview smoke plan and request founder acceptance bound to the exact candidate and assurance fingerprints.",
    externalAction: true
  },
  "wix-publication": {
    title: "Publish claims-safe Wix content",
    domain: "proof-packaging",
    owner: "Public Claims Owner + Founder",
    priority: 50,
    nextAction:
      "Complete the public-claims scan, FaithCore neutrality check, rollback plan, and fingerprint-bound founder acceptance before publication.",
    externalAction: true
  },
  "legal-policy-adoption": {
    title: "Adopt binding legal policy language",
    domain: "security-governance",
    owner: "Qualified Legal Counsel",
    priority: 60,
    nextAction:
      "Send the scoped policy draft, jurisdiction analysis, and processor register to qualified counsel for a named decision.",
    irreversible: true,
    externalAction: true
  },
  "contract-execution": {
    title: "Execute a binding commercial contract",
    domain: "sales-revenue",
    owner: "Counsel + Founder + Finance",
    priority: 70,
    nextAction:
      "Obtain approved contract language, financial authority, signatory authority, and all candidate-bound approvals before execution.",
    irreversible: true,
    externalAction: true,
    productionTarget: true
  },
  "production-migration": {
    title: "Apply an authorized production migration",
    domain: "release-readiness",
    owner: "Database Owner + Release Authority",
    priority: 80,
    nextAction:
      "Keep production migration blocked until exact migration evidence, recovery proof, database-owner approval, and deployment authorization are current.",
    irreversible: true,
    productionTarget: true
  },
  "production-deployment": {
    title: "Deploy an immutable production candidate",
    domain: "release-readiness",
    owner: "Release Authority + Security Owner",
    priority: 81,
    nextAction:
      "Keep deployment blocked until the worktree is clean and exact candidate, rollback, monitoring, security, and release approvals validate.",
    irreversible: true,
    externalAction: true,
    productionTarget: true
  },
  "customer-activation": {
    title: "Activate a customer environment",
    domain: "service-delivery",
    owner: "Customer Authority + Release Authority",
    priority: 82,
    nextAction:
      "Require customer acceptance, trained operators, support ownership, data agreements, rollback evidence, and explicit go-live authorization.",
    irreversible: true,
    externalAction: true,
    productionTarget: true
  },
  "phi-processing": {
    title: "Process protected health information",
    domain: "security-governance",
    owner: "Privacy Owner + Security Owner",
    priority: 90,
    nextAction:
      "Do not process PHI in this release; prepare purpose-of-use, minimum-necessary, retention, region, agreement, and security evidence for future qualified review only.",
    touchesPhi: true,
    clinicalFacing: true,
    productionTarget: true
  },
  "ehr-connection": {
    title: "Connect a production EHR",
    domain: "interoperability",
    owner: "Interoperability + Privacy + Security + Clinical Safety",
    priority: 91,
    nextAction:
      "Keep production EHR connectivity disabled while connector scope, tenant authority, audit persistence, and rollback remain externally unapproved.",
    touchesPhi: true,
    irreversible: true,
    clinicalFacing: true,
    productionTarget: true
  },
  "device-connection": {
    title: "Connect a production medical device",
    domain: "interoperability",
    owner: "Clinical Safety + Regulatory + Security",
    priority: 92,
    nextAction:
      "Keep device connectivity disabled pending site validation, regulatory review, a clinical safety case, and rollback evidence.",
    touchesPhi: true,
    irreversible: true,
    clinicalFacing: true,
    productionTarget: true
  },
  "clinical-execution": {
    title: "Execute a live clinical workflow",
    domain: "clinical-safety",
    owner: "Clinical Safety + Release Authority",
    priority: 93,
    nextAction:
      "Keep live clinical execution disabled; only synthetic, advisory, human-reviewed workflow preparation is permitted.",
    touchesPhi: true,
    irreversible: true,
    clinicalFacing: true,
    productionTarget: true
  },
  "clinical-alerting": {
    title: "Issue live clinical alerts",
    domain: "clinical-safety",
    owner: "Clinical Safety",
    priority: 100,
    nextAction:
      "Do not issue live clinical alerts; retain demonstration alerts as clearly labeled synthetic workflow output only.",
    touchesPhi: true,
    clinicalFacing: true,
    productionTarget: true
  },
  "diagnosis-support": {
    title: "Provide autonomous diagnosis support",
    domain: "clinical-safety",
    owner: "Clinical Safety",
    priority: 101,
    nextAction:
      "Keep autonomous diagnosis prohibited; confine outputs to evidence-grounded education or decision-support drafts with clinician review.",
    touchesPhi: true,
    clinicalFacing: true,
    productionTarget: true
  },
  "treatment-support": {
    title: "Select or prescribe treatment",
    domain: "clinical-safety",
    owner: "Clinical Safety",
    priority: 102,
    nextAction:
      "Keep treatment selection and prescribing prohibited; preserve qualified clinician authority.",
    touchesPhi: true,
    clinicalFacing: true,
    productionTarget: true
  },
  "payer-decision": {
    title: "Make or submit a payer decision",
    domain: "clinical-safety",
    owner: "Revenue Cycle Governance",
    priority: 103,
    nextAction:
      "Keep payer decisions and submissions prohibited; permit human-reviewable documentation preparation only.",
    touchesPhi: true,
    irreversible: true,
    externalAction: true,
    productionTarget: true
  }
};

const retainedBoundaries = [
  "No live PHI or cross-tenant data use.",
  "No autonomous diagnosis, treatment, prescribing, triage, or clinical alerting.",
  "No payer submission, EHR writeback, production migration, deployment, or customer activation without separate exact authority.",
  "No environment variable, planner output, or agent recommendation grants execution authority.",
  "Every executable action must pass evaluateReviewPolicy with exact current fingerprints, evidence, identity, and approval references."
];

const actionDependencies: Partial<Record<ReviewAction, string[]>> = {
  "source-commit": ["complete attributable change inventory", "full local validation", "secret scan and SBOM"],
  "disposable-migration-dry-run": ["authorized disposable database", "exact migration checksums", "named recovery owner"],
  "preview-deployment": ["clean reviewed candidate", "preview smoke plan", "fingerprint-bound founder acceptance"],
  "wix-publication": ["claims-safe draft", "owner publication approval", "fresh live and mobile verification"],
  "production-migration": ["disposable dry-run evidence", "database-owner approval", "deployment authorization"],
  "production-deployment": ["clean reviewed commit", "named approvals", "rollback and monitoring evidence"],
  "customer-activation": ["contract and data agreements", "trained operators", "customer acceptance", "support and rollback ownership"],
  "phi-processing": ["purpose of use", "minimum necessary scope", "retention and residency policy", "privacy and security approval"],
  "ehr-connection": ["connector conformance", "tenant authorization", "audit persistence", "rollback test"],
  "device-connection": ["site validation", "clinical safety case", "regulatory review", "rollback test"],
  "clinical-execution": ["intended-use approval", "clinical validation", "human authority", "production release authorization"]
};

const actionImpact: Partial<Record<ReviewAction, 1 | 2 | 3 | 4 | 5>> = {
  "synthetic-demonstration": 5,
  "source-commit": 5,
  "disposable-migration-dry-run": 5,
  "preview-deployment": 4,
  "wix-publication": 4,
  "legal-policy-adoption": 5,
  "contract-execution": 5,
  "production-migration": 5,
  "production-deployment": 5,
  "customer-activation": 5,
  "phi-processing": 5,
  "ehr-connection": 5,
  "device-connection": 4,
  "clinical-execution": 5
};

function buildStrategicValueFactors(
  action: ReviewAction,
  catalog: ContinuityCatalogItem
): DevelopmentStrategicValueFactors {
  const impact = actionImpact[action] ?? 3;
  const effort = effortForAction(action);
  const implementationEffort = effort === "small" ? 1 : effort === "medium" ? 2 : 4;

  if (action === "synthetic-demonstration") {
    return {
      marketValue: 4,
      moatContribution: 3,
      evidenceGain: 5,
      crossSellPotential: 4,
      investorRelevance: 5,
      implementationEffort,
      regulatoryRisk: 1,
      securityRisk: 1,
      capitalCost: 1,
      dependencyRisk: 1
    };
  }
  if (action === "source-commit") {
    return {
      marketValue: 3,
      moatContribution: 5,
      evidenceGain: 5,
      crossSellPotential: 3,
      investorRelevance: 5,
      implementationEffort,
      regulatoryRisk: 1,
      securityRisk: 2,
      capitalCost: 1,
      dependencyRisk: 2
    };
  }
  if (action === "disposable-migration-dry-run") {
    return {
      marketValue: 3,
      moatContribution: 4,
      evidenceGain: 5,
      crossSellPotential: 3,
      investorRelevance: 4,
      implementationEffort,
      regulatoryRisk: 2,
      securityRisk: 2,
      capitalCost: 2,
      dependencyRisk: 2
    };
  }

  return {
    marketValue: impact,
    moatContribution: catalog.productionTarget ? 4 : 3,
    evidenceGain: catalog.externalAction ? 4 : 3,
    crossSellPotential: catalog.productionTarget ? 5 : 3,
    investorRelevance: catalog.irreversible ? 4 : 3,
    implementationEffort,
    regulatoryRisk: catalog.clinicalFacing ? 5 : catalog.irreversible ? 4 : 2,
    securityRisk: catalog.touchesPhi ? 5 : catalog.externalAction ? 3 : 2,
    capitalCost: catalog.productionTarget ? 4 : 2,
    dependencyRisk: catalog.productionTarget ? 5 : 3
  };
}

export function calculateDevelopmentStrategicValue(
  factors: DevelopmentStrategicValueFactors
) {
  const value =
    factors.marketValue *
    factors.moatContribution *
    factors.evidenceGain *
    factors.crossSellPotential *
    factors.investorRelevance;
  const risk =
    factors.implementationEffort *
    factors.regulatoryRisk *
    factors.securityRisk *
    factors.capitalCost *
    factors.dependencyRisk;

  return Math.round((value / Math.max(risk, 1)) * 100) / 100;
}

function effortForAction(action: ReviewAction): DevelopmentContinuityEffort {
  if (["synthetic-demonstration", "preview-deployment", "wix-publication"].includes(action)) {
    return "small";
  }
  if (["source-commit", "disposable-migration-dry-run"].includes(action)) return "medium";
  return "large";
}

function valueHypothesisForAction(action: ReviewAction, title: string) {
  if (action === "synthetic-demonstration") {
    return "A bounded rehearsal can improve buyer comprehension and expose workflow defects without expanding data or execution authority.";
  }
  if (action === "source-commit") {
    return "An attributable immutable candidate reduces review ambiguity, deployment drift, and investor diligence risk.";
  }
  if (action === "disposable-migration-dry-run") {
    return "A disposable forward-and-recovery test can retire database uncertainty without touching production data.";
  }
  if (action === "preview-deployment") {
    return "An isolated exact-candidate preview can convert local build evidence into reviewable browser and stakeholder evidence.";
  }
  if (action === "wix-publication") {
    return "Claims-safe public copy can improve trust and investor/buyer clarity once owner publication and live verification are complete.";
  }
  return `${title} may create strategic value only after its evidence, owner, authorization, and retained safety boundary are independently verified.`;
}

function policyDecisionForRiskTier(
  riskTier: 0 | 1 | 2 | 3 | "PROHIBITED"
): ReviewPolicyDecision {
  if (riskTier === "PROHIBITED") return "PROHIBITED";
  if (riskTier === 0) return "PERMITTED_AUTOMATICALLY";
  if (riskTier === 1) return "FOUNDER_INTERIM_ACCEPTANCE_REQUIRED";
  if (riskTier === 2) return "TARGETED_QUALIFIED_REVIEW_REQUIRED";
  return "PRODUCTION_ACTIVATION_APPROVAL_REQUIRED";
}

function normalizeRiskTier(value: string | number): 0 | 1 | 2 | 3 | "PROHIBITED" {
  if (value === "PROHIBITED" || value === 0 || value === 1 || value === 2 || value === 3) {
    return value;
  }

  throw new Error(`Unsupported SCRIMED review risk tier: ${String(value)}`);
}

function statusForAction(input: {
  riskTier: 0 | 1 | 2 | 3 | "PROHIBITED";
  missingEvidence: string[];
  operatingModeBlockReason: string | null;
}): DevelopmentContinuityStatus {
  if (input.riskTier === "PROHIBITED") return "PROHIBITED";
  if (input.operatingModeBlockReason) return "BLOCKED_BY_OPERATING_MODE";
  if (input.riskTier === 0) {
    return input.missingEvidence.length
      ? "EVIDENCE_REQUIRED"
      : "AUTOMATIC_PREFLIGHT_ELIGIBLE";
  }
  if (input.riskTier === 1) return "FOUNDER_ACCEPTANCE_REQUIRED";
  if (input.riskTier === 2) return "QUALIFIED_REVIEW_REQUIRED";
  return "PRODUCTION_AUTHORIZATION_REQUIRED";
}

function buildAction(
  action: ReviewAction,
  evidenceReferences: string[],
  mode: ScrimedOperatingMode
): DevelopmentContinuityAction {
  const requirement = getReviewRequirement(action);
  if (!requirement) throw new Error(`Continuity action is not registered: ${action}`);

  const catalog = continuityCatalog[action];
  const riskTier = normalizeRiskTier(requirement.riskTier);
  const availableEvidence = requirement.requiredEvidence.filter((evidence) =>
    evidenceReferences.includes(evidence)
  );
  const missingEvidence = requirement.requiredEvidence.filter(
    (evidence) => !evidenceReferences.includes(evidence)
  );
  const modeBlockReason = getReviewActionOperatingModeBlockReason(action, mode);
  const status = statusForAction({
    riskTier,
    missingEvidence,
    operatingModeBlockReason: modeBlockReason
  });
  const policyDecision = policyDecisionForRiskTier(riskTier);
  const requiredReviewerRoles = [
    ...requirement.requiredReviewerRoles
  ] as string[];
  const automationDecision = evaluateScrimedAutomationAutopilotRequest({
    requestId: `continuity-${action}`,
    action,
    domain: catalog.domain,
    touchesPhi: catalog.touchesPhi,
    irreversible: catalog.irreversible,
    externalAction: catalog.externalAction,
    clinicalFacing: catalog.clinicalFacing,
    productionTarget: catalog.productionTarget
  });
  const strategicValueFactors = buildStrategicValueFactors(action, catalog);
  const strategicValueScore = calculateDevelopmentStrategicValue(
    strategicValueFactors
  );
  const payload = {
    action,
    policyVersion: scrimedReviewPolicyVersion,
    status,
    riskTier,
    requiredEvidence: requirement.requiredEvidence,
    availableEvidence,
    missingEvidence,
    requiredReviewerRoles,
    operatingModeBlockReason: modeBlockReason,
    automationDecision: automationDecision.decision,
    strategicValueFactors,
    strategicValueScore
  };

  return {
    action,
    title: catalog.title,
    domain: catalog.domain,
    owner: catalog.owner,
    priority: catalog.priority,
    expectedStrategicImpact: actionImpact[action] ?? 3,
    strategicValueScore,
    strategicValueFactors,
    effort: effortForAction(action),
    dependencies: [...(actionDependencies[action] ?? requirement.requiredEvidence)],
    valueHypothesis: valueHypothesisForAction(action, catalog.title),
    founderDecisionRequired:
      riskTier === 1 || requiredReviewerRoles.includes("founder"),
    status,
    policyDecision,
    riskTier,
    executionAuthority: requirement.executionAuthority,
    requiredEvidence: [...requirement.requiredEvidence],
    availableEvidence,
    missingEvidence,
    requiredReviewerRoles,
    humanReviewRequired: riskTier !== 0,
    preparationAllowed: riskTier !== "PROHIBITED",
    automaticExecutionEligible: status === "AUTOMATIC_PREFLIGHT_ELIGIBLE",
    executionAuthorized: false,
    externalMutationAllowed: false,
    operatingModeBlockReason: modeBlockReason,
    nextAction: catalog.nextAction,
    automationDecision,
    evidenceHash: createClinicalEvidenceHash(payload)
  };
}

export function buildDevelopmentContinuityPlan(input: {
  evidenceReferences?: readonly string[];
  operatingMode?: ScrimedOperatingMode;
} = {}): DevelopmentContinuityPlan {
  const operatingMode = input.operatingMode ?? getScrimedOperatingModeSummary().mode;
  const modeValidation = validateScrimedOperatingMode(operatingMode);
  const evidenceReferences = [
    ...new Set(
      input.evidenceReferences ??
        (modeValidation.valid
          ? ["preproduction-disclosure", "synthetic-mode-attestation"]
          : [])
    )
  ].sort();
  const actions = (Object.keys(continuityCatalog) as ReviewAction[])
    .map((action) => buildAction(action, evidenceReferences, operatingMode))
    .sort((left, right) => left.priority - right.priority || left.action.localeCompare(right.action));
  const counts = actions.reduce<Record<DevelopmentContinuityStatus, number>>(
    (result, action) => {
      result[action.status] += 1;
      return result;
    },
    {
      AUTOMATIC_PREFLIGHT_ELIGIBLE: 0,
      EVIDENCE_REQUIRED: 0,
      FOUNDER_ACCEPTANCE_REQUIRED: 0,
      QUALIFIED_REVIEW_REQUIRED: 0,
      PRODUCTION_AUTHORIZATION_REQUIRED: 0,
      BLOCKED_BY_OPERATING_MODE: 0,
      PROHIBITED: 0
    }
  );
  const recommendedAction = actions.find((action) => action.automaticExecutionEligible) ?? null;
  const rankedAdvisoryActions = actions
    .filter((action) => action.preparationAllowed)
    .sort(
      (left, right) =>
        right.strategicValueScore - left.strategicValueScore ||
        left.priority - right.priority
    );
  const bestNextAction = rankedAdvisoryActions[0] ?? null;
  const bestLowRiskAction =
    rankedAdvisoryActions.find(
      (action) => action.riskTier === 0 || action.riskTier === 1
    ) ?? null;
  const bestMoatAction =
    [...rankedAdvisoryActions].sort(
      (left, right) =>
        right.strategicValueFactors.moatContribution -
          left.strategicValueFactors.moatContribution ||
        right.strategicValueScore - left.strategicValueScore
    )[0] ?? null;
  const bestRevenueAction =
    [...rankedAdvisoryActions].sort((left, right) => {
      const rightRevenue =
        right.strategicValueFactors.marketValue *
        right.strategicValueFactors.crossSellPotential;
      const leftRevenue =
        left.strategicValueFactors.marketValue *
        left.strategicValueFactors.crossSellPotential;
      return rightRevenue - leftRevenue || right.strategicValueScore - left.strategicValueScore;
    })[0] ?? null;
  const bestInvestorReadinessAction =
    [...rankedAdvisoryActions].sort(
      (left, right) =>
        right.strategicValueFactors.investorRelevance -
          left.strategicValueFactors.investorRelevance ||
        right.strategicValueScore - left.strategicValueScore
    )[0] ?? null;
  const priorityActions = actions.filter(
    (action) => action.priority <= 60 || action.status === "PROHIBITED"
  );
  const fingerprintPayload = {
    version: scrimedDevelopmentContinuityVersion,
    policyVersion: scrimedReviewPolicyVersion,
    operatingMode,
    evidenceReferences,
    actions: actions.map(({ automationDecision, ...action }) => ({
      ...action,
      automationDecision: automationDecision.decision
    })),
    retainedBoundaries
  };

  return {
    service: "scrimed-development-continuity-planner",
    version: scrimedDevelopmentContinuityVersion,
    policyVersion: scrimedReviewPolicyVersion,
    authorizationStatus: "NOT_EVALUATED",
    policyPostureOnly: true,
    mustInvokeReviewPolicyBeforeExecution: true,
    productionAuthorityGranted: false,
    operatingMode: {
      version: operatingMode.version,
      safeDefaultsActive: modeValidation.safeDefaultsActive,
      syntheticOnly: operatingMode.syntheticOnly,
      allowPHI: operatingMode.allowPHI,
      liveClinicalExecution: operatingMode.liveClinicalExecution
    },
    evidenceReferences,
    actionCount: actions.length,
    counts,
    recommendedAction,
    bestNextAction,
    bestLowRiskAction,
    bestMoatAction,
    bestRevenueAction,
    bestInvestorReadinessAction,
    priorityActions,
    actions,
    retainedBoundaries,
    planFingerprint: createClinicalEvidenceHash(fingerprintPayload)
  };
}
