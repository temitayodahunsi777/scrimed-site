export type CapitalPlanningInputs = {
  monthlyRecurringRevenueUsd: number;
  monthlyServicesRevenueUsd: number;
  monthlyCostOfRevenueUsd: number;
  monthlyOperatingExpenseUsd: number;
  cashOnHandUsd: number;
  raiseTargetUsd: number;
  oneTimeRaiseCostsUsd: number;
  targetRunwayMonths: number;
  estimatedMonthsToClose: number;
  acceptedWorkflowOutcomesPerMonth: number;
  monthlyModelInfrastructureCostUsd: number;
  monthlyHumanReviewCostUsd: number;
};

export type CapitalPlanningField = keyof CapitalPlanningInputs;

export type CapitalPlanningValidationError = {
  field: CapitalPlanningField;
  code: "not-finite" | "below-minimum" | "above-maximum" | "must-be-integer" | "raise-cost-exceeds-target";
  message: string;
};

export type CapitalPlanningScenario = {
  id: "base" | "revenue-down-20" | "operating-cost-up-20" | "close-delay-3-months";
  label: string;
  monthlyRevenueUsd: number;
  monthlyNetBurnUsd: number;
  preCloseFundingGapUsd: number;
  cashAtCloseUsd: number;
  runwayAfterCloseMonths: number | null;
  additionalFundingGapUsd: number;
};

export type CapitalPlanningEvaluation =
  | {
      status: "input-required";
      valid: false;
      modelVersion: typeof capitalPlanningModelVersion;
      externalUseAuthorized: false;
      requiredFields: CapitalPlanningField[];
      errors: [];
    }
  | {
      status: "blocked-invalid-input";
      valid: false;
      modelVersion: typeof capitalPlanningModelVersion;
      externalUseAuthorized: false;
      requiredFields: CapitalPlanningField[];
      errors: CapitalPlanningValidationError[];
    }
  | {
      status: "modeled-finance-review-required";
      valid: true;
      modelVersion: typeof capitalPlanningModelVersion;
      externalUseAuthorized: false;
      requiredFields: CapitalPlanningField[];
      errors: [];
      metrics: {
        monthlyRevenueUsd: number;
        monthlyGrossProfitUsd: number;
        grossMarginPercent: number | null;
        monthlyNetBurnUsd: number;
        runwayBeforeRaiseMonths: number | null;
        netRaiseProceedsUsd: number;
        preCloseFundingGapUsd: number;
        cashAtCloseUsd: number;
        runwayAfterCloseMonths: number | null;
        minimumGrossRaiseForTargetRunwayUsd: number;
        additionalFundingGapUsd: number;
        recurringRevenueSharePercent: number | null;
        costPerAcceptedWorkflowOutcomeUsd: number | null;
      };
      scenarios: CapitalPlanningScenario[];
      reviewFlags: string[];
      completionRequirements: string[];
    };

export type InvestorDiligenceArtifactStatus =
  | "metadata-reference-ready"
  | "founder-input-required"
  | "qualified-review-required"
  | "external-evidence-required"
  | "customer-permission-required"
  | "immutable-revision-required";

export type InvestorDiligenceShareability =
  | "internal-only"
  | "withhold-pending-approval"
  | "qualified-review-room-only";

export type FundraisingReviewerRole =
  | "founder"
  | "finance-reviewer"
  | "qualified-counsel"
  | "security-reviewer"
  | "clinical-regulatory-reviewer"
  | "customer-authorized-reviewer"
  | "release-steward";

export type InvestorDiligenceArtifact = {
  id: string;
  title: string;
  owner: string;
  status: InvestorDiligenceArtifactStatus;
  shareability: InvestorDiligenceShareability;
  requiredMetadata: string[];
  requiredReviewerRoles: FundraisingReviewerRole[];
  blockedContent: string[];
  blocksExternalFundraisingRelease: boolean;
  proofRoutes: string[];
  nextAction: string;
};

export type FundraisingEvidenceReference = {
  artifactId: string;
  artifactReference: string;
  artifactSha256: string;
  reviewerRoles: FundraisingReviewerRole[];
  approvedAt: string;
  disposition: "approved-reference-retained";
};

export type FundraisingReleaseAssessment = {
  decision: "blocked-remediation-required" | "ready-for-qualified-release-review";
  externalReleaseAuthorized: false;
  securitiesAuthority: "not-securities-offering-material";
  financialAuthority: "not-audited-financial-report";
  reviewedReferenceCount: number;
  requiredArtifactCount: number;
  missingArtifactIds: string[];
  invalidArtifactIds: string[];
  nextAction: string;
};

export const capitalPlanningModelVersion = "scrimed-capital-plan-v1";

export const capitalPlanningBoundary =
  "SCRIMED Capital Planning is a local-only operating model. It does not persist or transmit entered figures, create audited financial statements, provide accounting, tax, legal, investment, securities, or valuation advice, guarantee fundraising, or authorize external use. Founder-approved inputs require qualified finance, accounting, and counsel review before investor distribution.";

export const capitalPlanningInputFields: CapitalPlanningField[] = [
  "monthlyRecurringRevenueUsd",
  "monthlyServicesRevenueUsd",
  "monthlyCostOfRevenueUsd",
  "monthlyOperatingExpenseUsd",
  "cashOnHandUsd",
  "raiseTargetUsd",
  "oneTimeRaiseCostsUsd",
  "targetRunwayMonths",
  "estimatedMonthsToClose",
  "acceptedWorkflowOutcomesPerMonth",
  "monthlyModelInfrastructureCostUsd",
  "monthlyHumanReviewCostUsd"
];

export const capitalPlanningInputTemplate: CapitalPlanningInputs = {
  monthlyRecurringRevenueUsd: 0,
  monthlyServicesRevenueUsd: 0,
  monthlyCostOfRevenueUsd: 0,
  monthlyOperatingExpenseUsd: 0,
  cashOnHandUsd: 0,
  raiseTargetUsd: 0,
  oneTimeRaiseCostsUsd: 0,
  targetRunwayMonths: 18,
  estimatedMonthsToClose: 6,
  acceptedWorkflowOutcomesPerMonth: 0,
  monthlyModelInfrastructureCostUsd: 0,
  monthlyHumanReviewCostUsd: 0
};

const moneyFields: CapitalPlanningField[] = [
  "monthlyRecurringRevenueUsd",
  "monthlyServicesRevenueUsd",
  "monthlyCostOfRevenueUsd",
  "monthlyOperatingExpenseUsd",
  "cashOnHandUsd",
  "raiseTargetUsd",
  "oneTimeRaiseCostsUsd",
  "monthlyModelInfrastructureCostUsd",
  "monthlyHumanReviewCostUsd"
];

const financialSignalFields: CapitalPlanningField[] = [
  ...moneyFields,
  "acceptedWorkflowOutcomesPerMonth"
];

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundRatio(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function validateRange(
  inputs: CapitalPlanningInputs,
  field: CapitalPlanningField,
  minimum: number,
  maximum: number,
  integer = false
) {
  const value = inputs[field];
  const errors: CapitalPlanningValidationError[] = [];

  if (!Number.isFinite(value)) {
    errors.push({ field, code: "not-finite", message: `${field} must be a finite number.` });
    return errors;
  }

  if (value < minimum) {
    errors.push({ field, code: "below-minimum", message: `${field} must be at least ${minimum}.` });
  }

  if (value > maximum) {
    errors.push({ field, code: "above-maximum", message: `${field} must be no more than ${maximum}.` });
  }

  if (integer && !Number.isInteger(value)) {
    errors.push({ field, code: "must-be-integer", message: `${field} must be a whole number.` });
  }

  return errors;
}

export function validateCapitalPlanningInputs(inputs: CapitalPlanningInputs) {
  const errors = moneyFields.flatMap((field) => validateRange(inputs, field, 0, 1_000_000_000_000));

  errors.push(...validateRange(inputs, "targetRunwayMonths", 6, 60, true));
  errors.push(...validateRange(inputs, "estimatedMonthsToClose", 0, 24, true));
  errors.push(...validateRange(inputs, "acceptedWorkflowOutcomesPerMonth", 0, 1_000_000_000, true));

  if (inputs.raiseTargetUsd > 0 && inputs.oneTimeRaiseCostsUsd > inputs.raiseTargetUsd) {
    errors.push({
      field: "oneTimeRaiseCostsUsd",
      code: "raise-cost-exceeds-target",
      message: "oneTimeRaiseCostsUsd cannot exceed raiseTargetUsd."
    });
  }

  return errors;
}

type ScenarioInputs = Pick<
  CapitalPlanningInputs,
  | "monthlyRecurringRevenueUsd"
  | "monthlyServicesRevenueUsd"
  | "monthlyCostOfRevenueUsd"
  | "monthlyOperatingExpenseUsd"
  | "cashOnHandUsd"
  | "raiseTargetUsd"
  | "oneTimeRaiseCostsUsd"
  | "targetRunwayMonths"
  | "estimatedMonthsToClose"
>;

function calculateScenario(
  id: CapitalPlanningScenario["id"],
  label: string,
  inputs: ScenarioInputs
): CapitalPlanningScenario {
  const monthlyRevenueUsd = inputs.monthlyRecurringRevenueUsd + inputs.monthlyServicesRevenueUsd;
  const monthlyNetBurnUsd = Math.max(
    0,
    inputs.monthlyCostOfRevenueUsd + inputs.monthlyOperatingExpenseUsd - monthlyRevenueUsd
  );
  const monthlyOperatingCashFlowUsd =
    monthlyRevenueUsd - inputs.monthlyCostOfRevenueUsd - inputs.monthlyOperatingExpenseUsd;
  const netRaiseProceedsUsd = Math.max(0, inputs.raiseTargetUsd - inputs.oneTimeRaiseCostsUsd);
  const cashBeforeCloseUsd = inputs.cashOnHandUsd + monthlyOperatingCashFlowUsd * inputs.estimatedMonthsToClose;
  const preCloseFundingGapUsd = Math.max(0, -cashBeforeCloseUsd);
  const projectedCashAfterCloseUsd = cashBeforeCloseUsd + netRaiseProceedsUsd;
  const cashAtCloseUsd = Math.max(0, projectedCashAfterCloseUsd);
  const targetCashUsd = monthlyNetBurnUsd * inputs.targetRunwayMonths;

  return {
    id,
    label,
    monthlyRevenueUsd: roundCurrency(monthlyRevenueUsd),
    monthlyNetBurnUsd: roundCurrency(monthlyNetBurnUsd),
    preCloseFundingGapUsd: roundCurrency(preCloseFundingGapUsd),
    cashAtCloseUsd: roundCurrency(cashAtCloseUsd),
    runwayAfterCloseMonths: monthlyNetBurnUsd > 0 ? roundRatio(cashAtCloseUsd / monthlyNetBurnUsd) : null,
    additionalFundingGapUsd: roundCurrency(Math.max(0, targetCashUsd - projectedCashAfterCloseUsd))
  };
}

export function evaluateCapitalPlan(inputs: CapitalPlanningInputs): CapitalPlanningEvaluation {
  const hasFinancialSignal = financialSignalFields.some((field) => inputs[field] > 0);

  if (!hasFinancialSignal) {
    return {
      status: "input-required",
      valid: false,
      modelVersion: capitalPlanningModelVersion,
      externalUseAuthorized: false,
      requiredFields: capitalPlanningInputFields,
      errors: []
    };
  }

  const errors = validateCapitalPlanningInputs(inputs);
  if (errors.length > 0) {
    return {
      status: "blocked-invalid-input",
      valid: false,
      modelVersion: capitalPlanningModelVersion,
      externalUseAuthorized: false,
      requiredFields: capitalPlanningInputFields,
      errors
    };
  }

  const monthlyRevenueUsd = inputs.monthlyRecurringRevenueUsd + inputs.monthlyServicesRevenueUsd;
  const monthlyGrossProfitUsd = monthlyRevenueUsd - inputs.monthlyCostOfRevenueUsd;
  const monthlyNetBurnUsd = Math.max(
    0,
    inputs.monthlyCostOfRevenueUsd + inputs.monthlyOperatingExpenseUsd - monthlyRevenueUsd
  );
  const monthlyOperatingCashFlowUsd =
    monthlyRevenueUsd - inputs.monthlyCostOfRevenueUsd - inputs.monthlyOperatingExpenseUsd;
  const netRaiseProceedsUsd = Math.max(0, inputs.raiseTargetUsd - inputs.oneTimeRaiseCostsUsd);
  const cashBeforeCloseUsd = inputs.cashOnHandUsd + monthlyOperatingCashFlowUsd * inputs.estimatedMonthsToClose;
  const preCloseFundingGapUsd = Math.max(0, -cashBeforeCloseUsd);
  const projectedCashAfterCloseUsd = cashBeforeCloseUsd + netRaiseProceedsUsd;
  const cashAtCloseUsd = Math.max(0, projectedCashAfterCloseUsd);
  const targetCashUsd = monthlyNetBurnUsd * inputs.targetRunwayMonths;
  const minimumGrossRaiseForTargetRunwayUsd = Math.max(
    0,
    targetCashUsd - cashBeforeCloseUsd + inputs.oneTimeRaiseCostsUsd
  );
  const workflowOutcomeCostUsd =
    inputs.monthlyModelInfrastructureCostUsd + inputs.monthlyHumanReviewCostUsd;
  const reviewFlags: string[] = [];

  if (monthlyRevenueUsd === 0) reviewFlags.push("No monthly revenue is entered; revenue assumptions require founder and finance review.");
  if (monthlyGrossProfitUsd < 0) reviewFlags.push("Gross profit is negative in the base case.");
  if (monthlyRevenueUsd > 0 && inputs.monthlyServicesRevenueUsd / monthlyRevenueUsd > 0.7) {
    reviewFlags.push("Services exceed 70% of modeled monthly revenue; recurring-software mix requires review.");
  }
  if (monthlyNetBurnUsd > 0 && inputs.cashOnHandUsd / monthlyNetBurnUsd < inputs.estimatedMonthsToClose) {
    reviewFlags.push("Modeled pre-raise runway is shorter than the estimated financing close period.");
  }
  if (inputs.acceptedWorkflowOutcomesPerMonth === 0) {
    reviewFlags.push("Cost per accepted workflow outcome cannot be calculated without accepted-outcome volume.");
  }
  if (inputs.raiseTargetUsd < minimumGrossRaiseForTargetRunwayUsd) {
    reviewFlags.push("The planned gross raise does not cover the modeled target runway after close assumptions.");
  }

  const scenarios: CapitalPlanningScenario[] = [
    calculateScenario("base", "Founder-entered base case", inputs),
    calculateScenario("revenue-down-20", "Revenue 20% below base", {
      ...inputs,
      monthlyRecurringRevenueUsd: inputs.monthlyRecurringRevenueUsd * 0.8,
      monthlyServicesRevenueUsd: inputs.monthlyServicesRevenueUsd * 0.8
    }),
    calculateScenario("operating-cost-up-20", "Operating expense 20% above base", {
      ...inputs,
      monthlyOperatingExpenseUsd: inputs.monthlyOperatingExpenseUsd * 1.2
    }),
    calculateScenario("close-delay-3-months", "Financing closes three months later", {
      ...inputs,
      estimatedMonthsToClose: Math.min(24, inputs.estimatedMonthsToClose + 3)
    })
  ];

  return {
    status: "modeled-finance-review-required",
    valid: true,
    modelVersion: capitalPlanningModelVersion,
    externalUseAuthorized: false,
    requiredFields: capitalPlanningInputFields,
    errors: [],
    metrics: {
      monthlyRevenueUsd: roundCurrency(monthlyRevenueUsd),
      monthlyGrossProfitUsd: roundCurrency(monthlyGrossProfitUsd),
      grossMarginPercent: monthlyRevenueUsd > 0 ? roundRatio((monthlyGrossProfitUsd / monthlyRevenueUsd) * 100) : null,
      monthlyNetBurnUsd: roundCurrency(monthlyNetBurnUsd),
      runwayBeforeRaiseMonths: monthlyNetBurnUsd > 0 ? roundRatio(inputs.cashOnHandUsd / monthlyNetBurnUsd) : null,
      netRaiseProceedsUsd: roundCurrency(netRaiseProceedsUsd),
      preCloseFundingGapUsd: roundCurrency(preCloseFundingGapUsd),
      cashAtCloseUsd: roundCurrency(cashAtCloseUsd),
      runwayAfterCloseMonths: monthlyNetBurnUsd > 0 ? roundRatio(cashAtCloseUsd / monthlyNetBurnUsd) : null,
      minimumGrossRaiseForTargetRunwayUsd: roundCurrency(minimumGrossRaiseForTargetRunwayUsd),
      additionalFundingGapUsd: roundCurrency(Math.max(0, targetCashUsd - projectedCashAfterCloseUsd)),
      recurringRevenueSharePercent:
        monthlyRevenueUsd > 0 ? roundRatio((inputs.monthlyRecurringRevenueUsd / monthlyRevenueUsd) * 100) : null,
      costPerAcceptedWorkflowOutcomeUsd:
        inputs.acceptedWorkflowOutcomesPerMonth > 0
          ? roundCurrency(workflowOutcomeCostUsd / inputs.acceptedWorkflowOutcomesPerMonth)
          : null
    },
    scenarios,
    reviewFlags,
    completionRequirements: [
      "Founder confirms every source input and reporting period.",
      "Qualified finance or accounting reviewer reconciles calculations to source records.",
      "Qualified counsel reviews any fundraising, securities, valuation, or investor-distribution use.",
      "Release steward binds the approved model and deck to one immutable revision and recipient scope."
    ]
  };
}

export const investorDiligenceManifest: InvestorDiligenceArtifact[] = [
  {
    id: "category-product-architecture",
    title: "Category, product, and architecture evidence",
    owner: "Founder + Product",
    status: "metadata-reference-ready",
    shareability: "internal-only",
    requiredMetadata: ["approved narrative version", "architecture routes", "demo routes", "NO-GO boundaries"],
    requiredReviewerRoles: ["founder", "release-steward"],
    blockedContent: ["secrets", "raw logs", "PHI", "unreleased customer data"],
    blocksExternalFundraisingRelease: false,
    proofRoutes: ["/investor-audience-readiness", "/scrimed-work", "/clinical-assurance-control-plane"],
    nextAction: "Bind the approved narrative and product proof routes to the release manifest."
  },
  {
    id: "financial-model",
    title: "Reconciled financial model and capital plan",
    owner: "Founder + Finance",
    status: "founder-input-required",
    shareability: "withhold-pending-approval",
    requiredMetadata: ["reporting period", "source owner", "model version", "scenario assumptions", "review disposition"],
    requiredReviewerRoles: ["founder", "finance-reviewer", "qualified-counsel"],
    blockedContent: ["bank credentials", "tax identifiers", "raw bank statements", "unapproved securities terms"],
    blocksExternalFundraisingRelease: true,
    proofRoutes: ["/capital-vitality", "/public-market-readiness"],
    nextAction: "Enter founder-approved inputs locally, reconcile with finance, and retain only the approved artifact reference and digest."
  },
  {
    id: "corporate-cap-table-securities",
    title: "Corporate, cap table, IP ownership, and securities path",
    owner: "Founder + Qualified Counsel",
    status: "qualified-review-required",
    shareability: "qualified-review-room-only",
    requiredMetadata: ["entity status", "cap table as-of date", "IP assignment status", "financing instrument review"],
    requiredReviewerRoles: ["founder", "qualified-counsel"],
    blockedContent: ["tax identifiers", "signatures", "personal addresses", "unredacted legal documents"],
    blocksExternalFundraisingRelease: true,
    proofRoutes: ["/enterprise-business-ops", "/approvals-readiness"],
    nextAction: "Retain qualified counsel and reference the approved external data-room artifacts."
  },
  {
    id: "customer-outcome-permission",
    title: "Permissioned customer and outcome evidence",
    owner: "Customer Evidence Owner + Counsel",
    status: "customer-permission-required",
    shareability: "withhold-pending-approval",
    requiredMetadata: ["customer permission reference", "cohort definition", "measurement method", "claim scope", "expiry"],
    requiredReviewerRoles: ["customer-authorized-reviewer", "qualified-counsel", "release-steward"],
    blockedContent: ["PHI", "patient-level data", "customer-confidential records", "unapproved logo or testimonial"],
    blocksExternalFundraisingRelease: true,
    proofRoutes: ["/pilot-value-evidence", "/buyer-release-control-run"],
    nextAction: "Complete a permissioned pilot and retain explicit customer approval for each external claim."
  },
  {
    id: "independent-assurance",
    title: "Independent security, privacy, clinical, and regulatory assurance",
    owner: "Security + Clinical Governance + External Reviewers",
    status: "external-evidence-required",
    shareability: "qualified-review-room-only",
    requiredMetadata: ["assessment scope", "reviewer organization", "evidence date", "exceptions", "remediation status"],
    requiredReviewerRoles: ["security-reviewer", "clinical-regulatory-reviewer", "qualified-counsel"],
    blockedContent: ["penetration-test exploit details", "credentials", "PHI", "unredacted legal opinions"],
    blocksExternalFundraisingRelease: true,
    proofRoutes: ["/approvals-readiness", "/scrimed-cyber-defense", "/clinical-production-readiness"],
    nextAction: "Commission scoped independent reviews and retain evidence without converting readiness into certification claims."
  },
  {
    id: "immutable-release-provenance",
    title: "Immutable packet provenance and recipient authorization",
    owner: "Release Steward + Founder",
    status: "immutable-revision-required",
    shareability: "withhold-pending-approval",
    requiredMetadata: ["Git SHA", "deck digest", "brief digest", "source manifest", "recipient scope", "approval timestamps"],
    requiredReviewerRoles: ["founder", "qualified-counsel", "finance-reviewer", "release-steward"],
    blockedContent: ["bearer tokens", "deployment credentials", "raw access logs", "recipient personal data"],
    blocksExternalFundraisingRelease: true,
    proofRoutes: ["/release-continuity", "/investor-audience-readiness"],
    nextAction: "Create a clean reviewed revision, run strict provenance, and bind every released artifact to that revision."
  }
];

const safeArtifactReferencePattern = /^[a-z0-9][a-z0-9._:/-]{7,159}$/;
const sha256Pattern = /^[a-f0-9]{64}$/;

function validApprovalTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}

function evidenceReferenceValid(reference: FundraisingEvidenceReference, artifact: InvestorDiligenceArtifact) {
  const reviewerRoles = new Set(reference.reviewerRoles);
  return (
    reference.artifactId === artifact.id &&
    reference.disposition === "approved-reference-retained" &&
    safeArtifactReferencePattern.test(reference.artifactReference) &&
    sha256Pattern.test(reference.artifactSha256) &&
    validApprovalTimestamp(reference.approvedAt) &&
    artifact.requiredReviewerRoles.every((role) => reviewerRoles.has(role))
  );
}

export function evaluateFundraisingReleaseReadiness(
  references: FundraisingEvidenceReference[]
): FundraisingReleaseAssessment {
  const requiredArtifacts = investorDiligenceManifest.filter((artifact) => artifact.blocksExternalFundraisingRelease);
  const invalidArtifactIds: string[] = [];
  const approvedArtifactIds = new Set<string>();

  for (const reference of references) {
    const artifact = investorDiligenceManifest.find((candidate) => candidate.id === reference.artifactId);
    if (!artifact || !evidenceReferenceValid(reference, artifact)) {
      invalidArtifactIds.push(reference.artifactId);
      continue;
    }
    approvedArtifactIds.add(reference.artifactId);
  }

  const missingArtifactIds = requiredArtifacts
    .filter((artifact) => !approvedArtifactIds.has(artifact.id))
    .map((artifact) => artifact.id);
  const readyForQualifiedReview = missingArtifactIds.length === 0 && invalidArtifactIds.length === 0;

  return {
    decision: readyForQualifiedReview ? "ready-for-qualified-release-review" : "blocked-remediation-required",
    externalReleaseAuthorized: false,
    securitiesAuthority: "not-securities-offering-material",
    financialAuthority: "not-audited-financial-report",
    reviewedReferenceCount: approvedArtifactIds.size,
    requiredArtifactCount: requiredArtifacts.length,
    missingArtifactIds,
    invalidArtifactIds,
    nextAction: readyForQualifiedReview
      ? "A named founder, qualified counsel, finance reviewer, and release steward must inspect the exact packet and create a separate recipient-scoped release decision."
      : "Complete the missing artifact references in qualified external systems; keep raw evidence and sensitive documents out of SCRIMED public surfaces."
  };
}

export function getInvestorDiligenceManifestSummary() {
  const releaseAssessment = evaluateFundraisingReleaseReadiness([]);

  return {
    status: "investor-diligence-manifest-active-metadata-only",
    artifactCount: investorDiligenceManifest.length,
    blockingArtifactCount: investorDiligenceManifest.filter((artifact) => artifact.blocksExternalFundraisingRelease).length,
    metadataReadyCount: investorDiligenceManifest.filter((artifact) => artifact.status === "metadata-reference-ready").length,
    customerPermissionRequiredCount: investorDiligenceManifest.filter(
      (artifact) => artifact.status === "customer-permission-required"
    ).length,
    externalEvidenceRequiredCount: investorDiligenceManifest.filter(
      (artifact) => artifact.status === "external-evidence-required"
    ).length,
    acceptsRawEvidence: false,
    externalReleaseAuthorized: false,
    artifacts: investorDiligenceManifest,
    releaseAssessment
  };
}
