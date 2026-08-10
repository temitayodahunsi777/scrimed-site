import { createAuditHash } from "./audit";

export const scrimedImpactGovernancePolicyVersion =
  "scrimed-impact-governance-v1-2026-08-01";

export type ImpactEvidenceStatus = "verified" | "estimated" | "simulated" | "unavailable";

export type EvidenceTaggedMetric = {
  metricId: string;
  label: string;
  value: number;
  unit: string;
  evidenceStatus: ImpactEvidenceStatus;
  evidenceReference: string;
};

export type VerifiedIntelligenceYield = {
  acceptedEvidenceSupportedOutputs: number;
  totalBurdenUsd: number;
  yieldPerUsd: number | null;
  evidenceStatus: ImpactEvidenceStatus;
  reasonCodes: string[];
  publicRoiClaimAllowed: false;
  clinicalAuthorityGranted: false;
  yieldHash: string;
};

const evidencePrecedence: ImpactEvidenceStatus[] = [
  "verified",
  "estimated",
  "simulated",
  "unavailable"
];

function validateMetric(metric: EvidenceTaggedMetric) {
  if (
    !metric.metricId.trim() ||
    !metric.label.trim() ||
    !metric.unit.trim() ||
    !metric.evidenceReference.trim() ||
    !Number.isFinite(metric.value) ||
    metric.value < 0
  ) {
    throw new Error(`Impact metric ${metric.metricId || "unknown"} is invalid.`);
  }
}

function weakestEvidenceStatus(metrics: EvidenceTaggedMetric[]) {
  return metrics.reduce<ImpactEvidenceStatus>((weakest, metric) =>
    evidencePrecedence.indexOf(metric.evidenceStatus) > evidencePrecedence.indexOf(weakest)
      ? metric.evidenceStatus
      : weakest
  , "verified");
}

export function calculateVerifiedIntelligenceYield(input: {
  acceptedOutputs: EvidenceTaggedMetric;
  inferenceCostUsd: EvidenceTaggedMetric;
  latencyBurdenUsd: EvidenceTaggedMetric;
  humanCorrectionBurdenUsd: EvidenceTaggedMetric;
}): VerifiedIntelligenceYield {
  const metrics = [
    input.acceptedOutputs,
    input.inferenceCostUsd,
    input.latencyBurdenUsd,
    input.humanCorrectionBurdenUsd
  ];
  metrics.forEach(validateMetric);

  if (input.acceptedOutputs.unit !== "accepted-output-count") {
    throw new Error("Verified Intelligence Yield requires accepted-output-count units.");
  }
  for (const costMetric of metrics.slice(1)) {
    if (costMetric.unit !== "usd") {
      throw new Error("Verified Intelligence Yield burden metrics must use USD-equivalent units.");
    }
  }

  const totalBurdenUsd =
    input.inferenceCostUsd.value +
    input.latencyBurdenUsd.value +
    input.humanCorrectionBurdenUsd.value;
  const evidenceStatus = weakestEvidenceStatus(metrics);
  const reasonCodes = [
    evidenceStatus === "verified" ? "all-inputs-verified" : `weakest-evidence-${evidenceStatus}`
  ];
  if (totalBurdenUsd === 0) reasonCodes.push("zero-total-burden-no-ratio");

  const base = {
    acceptedEvidenceSupportedOutputs: input.acceptedOutputs.value,
    totalBurdenUsd,
    yieldPerUsd: totalBurdenUsd > 0 ? input.acceptedOutputs.value / totalBurdenUsd : null,
    evidenceStatus,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    publicRoiClaimAllowed: false as const,
    clinicalAuthorityGranted: false as const
  };

  return {
    ...base,
    yieldHash: createAuditHash({
      type: "scrimed-verified-intelligence-yield",
      policyVersion: scrimedImpactGovernancePolicyVersion,
      input,
      base
    })
  };
}

export type HealthcareValueCategory =
  | "patient-cost"
  | "clinician-time"
  | "administrative-waste"
  | "denial-prevention"
  | "access"
  | "underserved-reach"
  | "education"
  | "workforce-training"
  | "community-reinvestment"
  | "shared-savings";

export type HealthcareValueMetric = EvidenceTaggedMetric & {
  category: HealthcareValueCategory;
  unit: "normalized-value-points";
};

export type HealthcareValueReturned = {
  dimensionCount: number;
  normalizedValuePoints: number;
  totalOperatingAndAiCostUsd: number;
  normalizedValuePerUsd: number | null;
  evidenceStatus: ImpactEvidenceStatus;
  syntheticOrEstimatedLabelRequired: boolean;
  auditedFinancialMetric: false;
  publicRoiClaimAllowed: false;
  valueHash: string;
};

export function calculateHealthcareValueReturned(input: {
  valueMetrics: HealthcareValueMetric[];
  totalOperatingAndAiCostUsd: EvidenceTaggedMetric;
  normalizationMethodReference: string;
}): HealthcareValueReturned {
  if (!input.valueMetrics.length || !input.normalizationMethodReference.trim()) {
    throw new Error("Healthcare Value Returned requires dimensions and a normalization method.");
  }
  input.valueMetrics.forEach(validateMetric);
  validateMetric(input.totalOperatingAndAiCostUsd);
  if (input.totalOperatingAndAiCostUsd.unit !== "usd") {
    throw new Error("Healthcare Value Returned cost must use USD units.");
  }

  const metrics = [...input.valueMetrics, input.totalOperatingAndAiCostUsd];
  const normalizedValuePoints = input.valueMetrics.reduce((sum, metric) => sum + metric.value, 0);
  const totalCost = input.totalOperatingAndAiCostUsd.value;
  const evidenceStatus = weakestEvidenceStatus(metrics);
  const base = {
    dimensionCount: new Set(input.valueMetrics.map((metric) => metric.category)).size,
    normalizedValuePoints,
    totalOperatingAndAiCostUsd: totalCost,
    normalizedValuePerUsd: totalCost > 0 ? normalizedValuePoints / totalCost : null,
    evidenceStatus,
    syntheticOrEstimatedLabelRequired: evidenceStatus !== "verified",
    auditedFinancialMetric: false as const,
    publicRoiClaimAllowed: false as const
  };

  return {
    ...base,
    valueHash: createAuditHash({
      type: "scrimed-healthcare-value-returned",
      policyVersion: scrimedImpactGovernancePolicyVersion,
      input,
      base
    })
  };
}

export type WorkforceTransitionProposal = {
  proposalId: string;
  workflowRedesignCompleted: boolean;
  trainingAndUpskillingPlan: boolean;
  redeploymentConsidered: boolean;
  workloadImpactMeasured: boolean;
  clinicianTimeProtectionPlan: boolean;
  transparentHumanReviewScheduled: boolean;
  roleEliminationProposed: boolean;
};

export type WorkforceTransitionDecision = {
  decision: "review-ready" | "blocked";
  reasonCodes: string[];
  humanReviewRequired: true;
  employmentActionAuthorized: false;
  decisionHash: string;
};

export function evaluateWorkforceTransitionProposal(
  proposal: WorkforceTransitionProposal
): WorkforceTransitionDecision {
  const reasonCodes: string[] = [];
  if (!proposal.workflowRedesignCompleted) reasonCodes.push("workflow-redesign-required");
  if (!proposal.trainingAndUpskillingPlan) reasonCodes.push("training-plan-required");
  if (!proposal.redeploymentConsidered) reasonCodes.push("redeployment-review-required");
  if (!proposal.workloadImpactMeasured) reasonCodes.push("workload-impact-evidence-required");
  if (!proposal.clinicianTimeProtectionPlan) reasonCodes.push("clinician-time-protection-required");
  if (!proposal.transparentHumanReviewScheduled) reasonCodes.push("transparent-human-review-required");
  if (proposal.roleEliminationProposed) reasonCodes.push("employment-decision-external-authority");

  const base = {
    decision: reasonCodes.length ? ("blocked" as const) : ("review-ready" as const),
    reasonCodes: [...new Set(reasonCodes)].sort(),
    humanReviewRequired: true as const,
    employmentActionAuthorized: false as const
  };

  return {
    ...base,
    decisionHash: createAuditHash({
      type: "scrimed-workforce-transition-decision",
      policyVersion: scrimedImpactGovernancePolicyVersion,
      proposal,
      base
    })
  };
}

export type ProcurementEvidenceField = {
  fieldId: string;
  label: string;
  evidenceStatus: ImpactEvidenceStatus;
  evidenceReference: string;
  mandatoryForExternalReadiness: boolean;
};

const procurementLabels = [
  ["safety", "Safety", true],
  ["transparency", "Transparency", true],
  ["data-residency", "Data residency", true],
  ["workforce-impact", "Workforce impact", false],
  ["patient-benefit", "Patient benefit", false],
  ["clinician-benefit", "Clinician benefit", false],
  ["community-impact", "Community impact", false],
  ["accessibility", "Accessibility", true],
  ["bias-evaluation", "Bias evaluation", true],
  ["evidence-quality", "Evidence quality", true],
  ["incident-response", "Incident response", true],
  ["model-governance", "Model governance", true],
  ["human-oversight", "Human oversight", true],
  ["rollback", "Rollback", true],
  ["vendor-continuity", "Vendor continuity", true]
] as const;

export const scrimedPublicBenefitProcurementFields: ProcurementEvidenceField[] =
  procurementLabels.map(([fieldId, label, mandatoryForExternalReadiness]) => ({
    fieldId,
    label,
    evidenceStatus: "simulated",
    evidenceReference: `synthetic-procurement-${fieldId}-fixture`,
    mandatoryForExternalReadiness
  }));

export function evaluateProcurementReadiness(fields: ProcurementEvidenceField[]) {
  const missingMandatory = fields
    .filter(
      (field) =>
        field.mandatoryForExternalReadiness &&
        (field.evidenceStatus !== "verified" || !field.evidenceReference.trim())
    )
    .map((field) => field.fieldId)
    .sort();
  const base = {
    status: missingMandatory.length
      ? ("external-evidence-required" as const)
      : ("human-review-ready" as const),
    fieldCount: fields.length,
    missingMandatory,
    humanReviewRequired: true as const,
    procurementApprovalGranted: false as const,
    contractAuthorityGranted: false as const
  };
  return {
    ...base,
    decisionHash: createAuditHash({
      type: "scrimed-procurement-readiness",
      policyVersion: scrimedImpactGovernancePolicyVersion,
      fields,
      base
    })
  };
}

export const scrimedSovereignHealthcareDeploymentProfile = {
  profileId: "scrimed-sovereign-healthcare-readiness-v1",
  status: "architecture-ready-external-validation-required",
  privateCloudReady: true,
  onPremiseReady: true,
  jurisdictionalHostingPolicyReady: true,
  airGappedDesignReady: true,
  customerControlledEncryptionContractReady: true,
  customerControlledAuditContractReady: true,
  externalInferenceDisabledModeReady: true,
  modelReplacementContractReady: true,
  offlineDegradedNetworkDesignReady: true,
  regionalLanguageEvaluationRequired: true,
  customerPolicyConfigurationReady: true,
  productionActivationAllowed: false,
  phiAuthorization: false,
  clinicalAuthorityGranted: false,
  boundary:
    "This profile records architecture readiness only. Infrastructure, jurisdiction, security, privacy, clinical, contractual, capacity, recovery, and customer approvals remain external gates."
} as const;

export function getScrimedImpactGovernanceSummary() {
  const intelligenceYield = calculateVerifiedIntelligenceYield({
    acceptedOutputs: {
      metricId: "accepted-output-count",
      label: "Accepted evidence-supported outputs",
      value: 8,
      unit: "accepted-output-count",
      evidenceStatus: "simulated",
      evidenceReference: "synthetic-value-yield-fixture"
    },
    inferenceCostUsd: {
      metricId: "inference-cost",
      label: "Inference cost",
      value: 0.8,
      unit: "usd",
      evidenceStatus: "simulated",
      evidenceReference: "synthetic-value-yield-fixture"
    },
    latencyBurdenUsd: {
      metricId: "latency-burden",
      label: "Latency burden",
      value: 0.2,
      unit: "usd",
      evidenceStatus: "simulated",
      evidenceReference: "synthetic-value-yield-fixture"
    },
    humanCorrectionBurdenUsd: {
      metricId: "human-correction-burden",
      label: "Human correction burden",
      value: 1,
      unit: "usd",
      evidenceStatus: "simulated",
      evidenceReference: "synthetic-value-yield-fixture"
    }
  });

  const healthcareValueReturned = calculateHealthcareValueReturned({
    valueMetrics: [
      {
        metricId: "clinician-time-returned",
        label: "Clinician time returned",
        value: 5,
        unit: "normalized-value-points",
        category: "clinician-time",
        evidenceStatus: "simulated",
        evidenceReference: "synthetic-prosperity-fixture"
      },
      {
        metricId: "administrative-waste-reduced",
        label: "Administrative waste reduced",
        value: 3,
        unit: "normalized-value-points",
        category: "administrative-waste",
        evidenceStatus: "simulated",
        evidenceReference: "synthetic-prosperity-fixture"
      }
    ],
    totalOperatingAndAiCostUsd: {
      metricId: "operating-and-ai-cost",
      label: "Operating and AI cost",
      value: 2,
      unit: "usd",
      evidenceStatus: "simulated",
      evidenceReference: "synthetic-prosperity-fixture"
    },
    normalizationMethodReference: "synthetic-normalization-method-v1"
  });

  return {
    policyVersion: scrimedImpactGovernancePolicyVersion,
    intelligenceYield,
    healthcareValueReturned,
    workforceTransition: evaluateWorkforceTransitionProposal({
      proposalId: "synthetic-human-plus-ai-workflow-redesign",
      workflowRedesignCompleted: true,
      trainingAndUpskillingPlan: true,
      redeploymentConsidered: true,
      workloadImpactMeasured: true,
      clinicianTimeProtectionPlan: true,
      transparentHumanReviewScheduled: true,
      roleEliminationProposed: false
    }),
    procurement: evaluateProcurementReadiness(scrimedPublicBenefitProcurementFields),
    procurementFields: scrimedPublicBenefitProcurementFields,
    sovereignDeployment: scrimedSovereignHealthcareDeploymentProfile,
    boundary:
      "All displayed values are simulated planning evidence. They are not audited financial results, production ROI, customer outcomes, procurement approval, employment authority, PHI authority, clinical validation, or deployment authorization."
  };
}
