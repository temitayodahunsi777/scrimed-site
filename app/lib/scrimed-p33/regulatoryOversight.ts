import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type {
  ContextDataClassification,
  OversightDriftResult,
  OversightObservation,
  OversightPolicy,
  RegulatoryLabelTwin
} from "./types";

export const p33RegulatoryLabelTwinVersion =
  "scrimed-p33-regulatory-label-twin-v1-2026-08-13";
export const p33OversightDriftSentinelVersion =
  "scrimed-p33-oversight-drift-sentinel-v1-2026-08-13";

export const p33RegulatoryOversightBoundary =
  "Regulatory Label Twin and Oversight Drift Sentinel are internal policy controls, not legal conclusions, device classifications, regulatory approvals, certifications, or authority to reduce qualified human oversight.";

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

export type RegulatoryLabelTwinInput = Omit<RegulatoryLabelTwin, "labelHash">;

export function createRegulatoryLabelTwin(
  input: RegulatoryLabelTwinInput
): RegulatoryLabelTwin {
  if (!input.labelId.trim() || !input.version.trim() || !input.productModule.trim()) {
    throw new Error("Regulatory label twins require stable label, version, and module identities");
  }
  if (!input.intendedUse.length || !input.excludedUses.length) {
    throw new Error("Regulatory label twins require intended and excluded uses");
  }
  if (!input.requiredHumanReviewRoles.length || !input.requiredReleaseGates.length) {
    throw new Error("Regulatory label twins require human-review roles and release gates");
  }
  if (!Number.isFinite(Date.parse(input.effectiveAt)) || !Number.isFinite(Date.parse(input.expiresAt))) {
    throw new Error("Regulatory label twin effective and expiry times must be valid");
  }
  if (Date.parse(input.expiresAt) <= Date.parse(input.effectiveAt)) {
    throw new Error("Regulatory label twin must expire after its effective date");
  }
  const payload = {
    ...input,
    intendedUse: canonical(input.intendedUse),
    excludedUses: canonical(input.excludedUses),
    authorizedRoles: canonical(input.authorizedRoles),
    requiredHumanReviewRoles: canonical(input.requiredHumanReviewRoles),
    permittedClaimIds: canonical(input.permittedClaimIds),
    supportingEvidenceIds: canonical(input.supportingEvidenceIds),
    allowedDataClasses: [...new Set(input.allowedDataClasses)].sort(),
    requiredValidations: canonical(input.requiredValidations),
    requiredReleaseGates: canonical(input.requiredReleaseGates)
  };
  return {
    ...payload,
    labelHash: createClinicalEvidenceHash({
      type: "p33-regulatory-label-twin",
      version: p33RegulatoryLabelTwinVersion,
      payload
    })
  };
}

export function evaluateRegulatoryLabelRequest(
  label: RegulatoryLabelTwin,
  input: {
    actorRole: string;
    requestedUse: string;
    requestedClaimIds: string[];
    dataClassification: ContextDataClassification;
    validationEvidenceIds: string[];
    passedReleaseGateIds: string[];
    evaluatedAt: string;
  }
) {
  const reasonCodes: string[] = [];
  if (!Number.isFinite(Date.parse(input.evaluatedAt))) {
    throw new Error("Label evaluation requires an ISO timestamp");
  }
  if (Date.parse(label.expiresAt) <= Date.parse(input.evaluatedAt)) {
    reasonCodes.push("REGULATORY_LABEL_EXPIRED");
  }
  if (!label.authorizedRoles.includes(input.actorRole)) {
    reasonCodes.push("ACTOR_ROLE_NOT_AUTHORIZED_BY_LABEL");
  }
  if (!label.intendedUse.includes(input.requestedUse)) {
    reasonCodes.push(
      label.excludedUses.includes(input.requestedUse)
        ? "REQUEST_CONFLICTS_WITH_EXCLUDED_USE"
        : "REQUESTED_USE_OUTSIDE_LABEL"
    );
  }
  if (input.requestedClaimIds.some((claimId) => !label.permittedClaimIds.includes(claimId))) {
    reasonCodes.push("PUBLIC_CLAIM_NOT_PERMITTED_BY_LABEL");
  }
  if (!label.allowedDataClasses.includes(input.dataClassification)) {
    reasonCodes.push("DATA_CLASS_NOT_AUTHORIZED_BY_LABEL");
  }
  if (label.requiredValidations.some((id) => !input.validationEvidenceIds.includes(id))) {
    reasonCodes.push("REQUIRED_VALIDATION_EVIDENCE_MISSING");
  }
  if (label.requiredReleaseGates.some((id) => !input.passedReleaseGateIds.includes(id))) {
    reasonCodes.push("REQUIRED_RELEASE_GATE_MISSING");
  }
  const hardBlock = reasonCodes.some((reason) =>
    [
      "REGULATORY_LABEL_EXPIRED",
      "REQUEST_CONFLICTS_WITH_EXCLUDED_USE",
      "DATA_CLASS_NOT_AUTHORIZED_BY_LABEL"
    ].includes(reason)
  );
  const decision = hardBlock
    ? "BLOCK" as const
    : reasonCodes.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  return {
    decision,
    reasonCodes: canonical(reasonCodes),
    humanReviewRoles: label.requiredHumanReviewRoles,
    clinicalAuthorityGranted: false,
    labelHash: label.labelHash,
    decisionHash: createClinicalEvidenceHash({
      type: "p33-regulatory-label-request",
      labelHash: label.labelHash,
      input,
      decision,
      reasonCodes
    })
  };
}

export function evaluateOversightDrift(
  policy: OversightPolicy,
  observations: OversightObservation[]
): OversightDriftResult {
  const reasonCodes: string[] = [];
  const observedCohorts = new Set(observations.map((observation) => observation.cohortId));
  const missingSentinelCohortIds = policy.fixedSentinelCohortIds.filter(
    (cohortId) => !observedCohorts.has(cohortId)
  );
  if (missingSentinelCohortIds.length) reasonCodes.push("FIXED_SENTINEL_COHORT_MISSING");

  for (const observation of observations) {
    if (observation.riskLevel === "prohibited") {
      reasonCodes.push("PROHIBITED_RISK_OBSERVED");
      continue;
    }
    const policyFloor = policy.reviewRates[observation.riskLevel];
    if (
      observation.observedReviewRate < policyFloor ||
      observation.observedReviewRate < observation.approvedReviewRate
    ) {
      reasonCodes.push("HUMAN_REVIEW_RATE_BELOW_APPROVED_FLOOR");
    }
    if (observation.errorRate > policy.maximumErrorBudget) {
      reasonCodes.push("INDEPENDENT_ERROR_BUDGET_EXCEEDED");
    }
    if (observation.automationBiasSignals > 0) reasonCodes.push("AUTOMATION_BIAS_SIGNAL");
    if (observation.workflowExpansionDetected) reasonCodes.push("SILENT_WORKFLOW_EXPANSION");
    if (observation.falseReassuranceSignals > 0) reasonCodes.push("FALSE_REASSURANCE_SIGNAL");
    if (observation.lowFrequencyHarmSignals > 0) reasonCodes.push("LOW_FREQUENCY_HARM_SIGNAL");
  }

  const hardBlock = reasonCodes.some((reason) =>
    [
      "FIXED_SENTINEL_COHORT_MISSING",
      "PROHIBITED_RISK_OBSERVED",
      "HUMAN_REVIEW_RATE_BELOW_APPROVED_FLOOR",
      "INDEPENDENT_ERROR_BUDGET_EXCEEDED",
      "SILENT_WORKFLOW_EXPANSION",
      "LOW_FREQUENCY_HARM_SIGNAL"
    ].includes(reason)
  );
  const decision = hardBlock
    ? "BLOCK" as const
    : reasonCodes.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const payload = {
    decision,
    reasonCodes: canonical(reasonCodes),
    missingSentinelCohortIds,
    automaticOversightReductionAllowed: false as const
  };
  return {
    ...payload,
    integrityHash: createClinicalEvidenceHash({
      type: "p33-oversight-drift-result",
      version: p33OversightDriftSentinelVersion,
      policy,
      observations,
      payload
    })
  };
}

export const p33SignalCompressionLabel = createRegulatoryLabelTwin({
  labelId: "label-clinical-signal-compression",
  version: "scrimed-p33-label-signal-compression-v1",
  productModule: "Clinical Signal Compression",
  intendedUse: ["synthetic-clinical-review", "synthetic-patient-education"],
  excludedUses: [
    "autonomous diagnosis",
    "autonomous treatment",
    "autonomous triage",
    "EHR writeback",
    "payer submission",
    "replacement of source record"
  ],
  jurisdiction: "unassigned-requires-counsel-review",
  authorizedRoles: ["synthetic-operator", "qualified-clinical-reviewer"],
  requiredHumanReviewRoles: ["qualified-clinical-reviewer"],
  permittedClaimIds: ["scrimed-decision-support-only", "scrimed-synthetic-demo-status"],
  supportingEvidenceIds: ["p33-context-fabric-policy-tests"],
  allowedDataClasses: ["synthetic-no-phi"],
  riskLevel: "high",
  requiredValidations: ["context-provenance", "clinical-extraction-release-gate"],
  requiredReleaseGates: ["qualified-clinical-review"],
  effectiveAt: "2026-08-13T00:00:00.000Z",
  expiresAt: "2027-02-13T00:00:00.000Z",
  supersedesLabelHash: null
});

export const p33OversightPolicy: OversightPolicy = {
  policyId: "oversight-policy-p33",
  version: "scrimed-p33-oversight-policy-v1",
  fixedSentinelCohortIds: ["sentinel-rural", "sentinel-older-adults", "sentinel-language-access"],
  reviewRates: {
    low: 0.1,
    moderate: 0.35,
    high: 1,
    prohibited: 1
  },
  maximumErrorBudget: 0.02,
  minimumReviewRateCanFallWithAccuracyAlone: false
};

export function getP33RegulatoryOversightSummary() {
  const observations: OversightObservation[] = [
    {
      cohortId: "sentinel-rural",
      riskLevel: "moderate",
      observedReviewRate: 0.35,
      approvedReviewRate: 0.35,
      errorRate: 0.01,
      automationBiasSignals: 0,
      workflowExpansionDetected: false,
      falseReassuranceSignals: 0,
      lowFrequencyHarmSignals: 0
    },
    {
      cohortId: "sentinel-older-adults",
      riskLevel: "high",
      observedReviewRate: 1,
      approvedReviewRate: 1,
      errorRate: 0,
      automationBiasSignals: 0,
      workflowExpansionDetected: false,
      falseReassuranceSignals: 0,
      lowFrequencyHarmSignals: 0
    },
    {
      cohortId: "sentinel-language-access",
      riskLevel: "moderate",
      observedReviewRate: 0.35,
      approvedReviewRate: 0.35,
      errorRate: 0.01,
      automationBiasSignals: 0,
      workflowExpansionDetected: false,
      falseReassuranceSignals: 0,
      lowFrequencyHarmSignals: 0
    }
  ];
  return {
    label: p33SignalCompressionLabel,
    labelDecision: evaluateRegulatoryLabelRequest(p33SignalCompressionLabel, {
      actorRole: "synthetic-operator",
      requestedUse: "synthetic-clinical-review",
      requestedClaimIds: ["scrimed-decision-support-only"],
      dataClassification: "synthetic-no-phi",
      validationEvidenceIds: ["context-provenance", "clinical-extraction-release-gate"],
      passedReleaseGateIds: [],
      evaluatedAt: "2026-08-13T12:00:00.000Z"
    }),
    oversightPolicy: p33OversightPolicy,
    oversightResult: evaluateOversightDrift(p33OversightPolicy, observations),
    boundary: p33RegulatoryOversightBoundary
  };
}
