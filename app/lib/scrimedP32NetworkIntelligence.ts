import { createAuditHash } from "./scrimed-work/audit";

export const scrimedP32NetworkIntelligenceVersion =
  "scrimed-p32-network-intelligence-v1-2026-07-28";

export const scrimedP32NetworkIntelligenceBoundary =
  "SCRIMED network and prior-authorization intelligence preserves site and subgroup variance and produces policy research and human-reviewable preparation only. It does not determine coverage, submit prior authorization, file appeals, change claims, mutate payer or RCM systems, or guarantee reimbursement or outcomes.";

export type FacilityPerformanceNode = {
  facilityId: string;
  tenantId: string;
  facilityType:
    | "hospital"
    | "practice"
    | "imaging-center"
    | "urgent-care"
    | "outpatient-center"
    | "rehab-facility"
    | "other-affiliate";
  region: string;
  metrics: {
    utilizationRate: number;
    accessWaitDays: number;
    documentationMinutesPerCase: number;
    denialRate: number;
    netReimbursementPerCase: number;
    aiAdoptionRate: number;
    safetyEventRate: number;
    outcomeAcceptanceRate: number;
    costPerCase: number;
  };
  subgroupMetrics: Array<{
    subgroupId: string;
    sampleSize: number;
    accessWaitDays: number;
    denialRate: number;
    outcomeAcceptanceRate: number;
  }>;
  evidenceIds: string[];
  nodeHash: string;
};

export type FacilityRelationship = {
  relationshipId: string;
  tenantId: string;
  fromFacilityId: string;
  toFacilityId: string;
  relationshipType: "referral" | "transfer" | "shared-service" | "network-affiliate";
  effectiveAt: string;
  evidenceIds: string[];
  relationshipHash: string;
};

export type NetworkVarianceMonitor = {
  monitorId: string;
  tenantId: string;
  facilityResults: Array<{
    facilityId: string;
    accessWaitDays: number;
    denialRate: number;
    outcomeAcceptanceRate: number;
    sampleSize: number;
  }>;
  subgroupResults: Array<{
    facilityId: string;
    subgroupId: string;
    sampleSize: number;
    accessWaitDays: number;
    denialRate: number;
    outcomeAcceptanceRate: number;
  }>;
  enterpriseAverages: {
    accessWaitDays: number;
    denialRate: number;
    outcomeAcceptanceRate: number;
  };
  materialVarianceFacilityIds: string[];
  sparseSubgroupIds: string[];
  siteAndSubgroupVariancePreserved: true;
  generatedAt: string;
  monitorHash: string;
};

export type OutcomeBaseline = {
  baselineId: string;
  tenantId: string;
  facilityId: string;
  metricId: string;
  value: number;
  unit: string;
  observationWindow: string;
  sampleSize: number;
  sourceEvidenceIds: string[];
  baselineHash: string;
};

export type BenefitsRealizationReview = {
  reviewId: string;
  baselineId: string;
  observedValue: number;
  observedSampleSize: number;
  associationOnly: true;
  causalClaimAllowed: false;
  reviewerIdentityHash: string | null;
  reviewState: "pending" | "reviewed";
  reviewedAt: string | null;
  limitations: string[];
  reviewHash: string;
};

export type AdministrativeBurdenCase = {
  caseId: string;
  tenantId: string;
  facilityId: string;
  workflow: string;
  administrativeMinutes: number;
  staffCostUsd: number;
  expectedReimbursementUsd: number;
  burdenToReimbursementRatio: number | null;
  sourceEvidenceIds: string[];
  caseHash: string;
};

export type PriorAuthorizationProportionalityAnalysis = {
  analysisId: string;
  tenantId: string;
  administrativeBurdenCaseId: string;
  serviceCode: string;
  policyVersion: string;
  criteria: Array<{
    criterionId: string;
    criterionText: string;
    addressesReviewedService: boolean;
    evidenceIds: string[];
  }>;
  specialtyParitySignals: Array<{
    specialty: string;
    comparableBurdenMinutes: number;
    parityConcern: boolean;
  }>;
  accessEffect: {
    expectedDelayDays: number;
    evidenceIds: string[];
  };
  proportionalityStatus: "review-supported" | "potentially-disproportionate" | "insufficient-evidence";
  missingEvidence: string[];
  humanReviewRequired: true;
  coverageDecisionAllowed: false;
  payerSubmissionAllowed: false;
  payerMutationAllowed: false;
  analysisHash: string;
};

export type PolicyEvidencePacket = {
  packetId: string;
  tenantId: string;
  analysisId: string;
  policyReferences: string[];
  evidenceIds: string[];
  observedFacts: string[];
  analystInferences: string[];
  unresolvedQuestions: string[];
  reviewState: "draft" | "human-reviewed-internal";
  reviewerIdentityHash: string | null;
  generatedAt: string;
  submissionAllowed: false;
  appealAllowed: false;
  payerMutationAllowed: false;
  packetHash: string;
};

const hashPattern = /^[0-9a-f]{64}$/i;

function finiteNonnegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be finite and nonnegative`);
}

function unitInterval(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`${label} must be in [0, 1]`);
}

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

export function isNetworkIntelligenceEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_NETWORK_INTELLIGENCE_ENABLED === "true";
}

export function createFacilityPerformanceNode(
  input: Omit<FacilityPerformanceNode, "nodeHash">
): FacilityPerformanceNode {
  unitInterval(input.metrics.utilizationRate, "utilization rate");
  unitInterval(input.metrics.denialRate, "denial rate");
  unitInterval(input.metrics.aiAdoptionRate, "AI adoption rate");
  unitInterval(input.metrics.safetyEventRate, "safety event rate");
  unitInterval(input.metrics.outcomeAcceptanceRate, "outcome acceptance rate");
  finiteNonnegative(input.metrics.accessWaitDays, "access wait");
  finiteNonnegative(input.metrics.documentationMinutesPerCase, "documentation minutes");
  finiteNonnegative(input.metrics.netReimbursementPerCase, "net reimbursement");
  finiteNonnegative(input.metrics.costPerCase, "cost per case");
  input.subgroupMetrics.forEach((subgroup) => {
    finiteNonnegative(subgroup.sampleSize, "subgroup sample size");
    finiteNonnegative(subgroup.accessWaitDays, "subgroup access wait");
    unitInterval(subgroup.denialRate, "subgroup denial rate");
    unitInterval(subgroup.outcomeAcceptanceRate, "subgroup outcome acceptance");
  });
  const base = {
    ...input,
    evidenceIds: canonical(input.evidenceIds),
    subgroupMetrics: [...input.subgroupMetrics].sort((left, right) => left.subgroupId.localeCompare(right.subgroupId))
  };
  return { ...base, nodeHash: createAuditHash({ type: "facility-performance-node", base }) };
}

function average(values: number[]) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

export function buildNetworkVarianceMonitor(input: {
  monitorId: string;
  tenantId: string;
  nodes: FacilityPerformanceNode[];
  minimumSubgroupSampleSize: number;
  materialDenialVariance: number;
  generatedAt: string;
}): NetworkVarianceMonitor {
  const nodes = input.nodes.filter((node) => node.tenantId === input.tenantId);
  if (nodes.length !== input.nodes.length) throw new Error("Cross-tenant facility data is not allowed");
  if (!nodes.length) throw new Error("Network variance monitor requires at least one facility");
  const enterpriseAverages = {
    accessWaitDays: average(nodes.map((node) => node.metrics.accessWaitDays)),
    denialRate: average(nodes.map((node) => node.metrics.denialRate)),
    outcomeAcceptanceRate: average(nodes.map((node) => node.metrics.outcomeAcceptanceRate))
  };
  const facilityResults = nodes.map((node) => ({
    facilityId: node.facilityId,
    accessWaitDays: node.metrics.accessWaitDays,
    denialRate: node.metrics.denialRate,
    outcomeAcceptanceRate: node.metrics.outcomeAcceptanceRate,
    sampleSize: node.subgroupMetrics.reduce((total, subgroup) => total + subgroup.sampleSize, 0)
  }));
  const subgroupResults = nodes.flatMap((node) =>
    node.subgroupMetrics.map((subgroup) => ({ facilityId: node.facilityId, ...subgroup }))
  );
  const materialVarianceFacilityIds = facilityResults
    .filter((result) => Math.abs(result.denialRate - enterpriseAverages.denialRate) >= input.materialDenialVariance)
    .map((result) => result.facilityId)
    .sort();
  const sparseSubgroupIds = subgroupResults
    .filter((result) => result.sampleSize < input.minimumSubgroupSampleSize)
    .map((result) => `${result.facilityId}:${result.subgroupId}`)
    .sort();
  const base = {
    monitorId: input.monitorId,
    tenantId: input.tenantId,
    facilityResults,
    subgroupResults,
    enterpriseAverages,
    materialVarianceFacilityIds,
    sparseSubgroupIds,
    siteAndSubgroupVariancePreserved: true as const,
    generatedAt: input.generatedAt
  };
  return { ...base, monitorHash: createAuditHash({ type: "network-variance-monitor", base }) };
}

export function buildAdministrativeBurdenCase(
  input: Omit<AdministrativeBurdenCase, "burdenToReimbursementRatio" | "caseHash">
): AdministrativeBurdenCase {
  finiteNonnegative(input.administrativeMinutes, "administrative minutes");
  finiteNonnegative(input.staffCostUsd, "staff cost");
  finiteNonnegative(input.expectedReimbursementUsd, "expected reimbursement");
  const base = {
    ...input,
    sourceEvidenceIds: canonical(input.sourceEvidenceIds),
    burdenToReimbursementRatio:
      input.expectedReimbursementUsd > 0 ? input.staffCostUsd / input.expectedReimbursementUsd : null
  };
  return { ...base, caseHash: createAuditHash({ type: "administrative-burden-case", base }) };
}

export function analyzePriorAuthorizationProportionality(
  input: Omit<
    PriorAuthorizationProportionalityAnalysis,
    | "tenantId"
    | "administrativeBurdenCaseId"
    | "proportionalityStatus"
    | "humanReviewRequired"
    | "coverageDecisionAllowed"
    | "payerSubmissionAllowed"
    | "payerMutationAllowed"
    | "analysisHash"
  > & { administrativeBurdenCase: AdministrativeBurdenCase }
): PriorAuthorizationProportionalityAnalysis {
  const { administrativeBurdenCase, ...analysis } = input;
  const unrelatedCriteria = input.criteria.filter((criterion) => !criterion.addressesReviewedService);
  const parityConcern = input.specialtyParitySignals.some((signal) => signal.parityConcern);
  const missing = canonical(input.missingEvidence);
  const proportionalityStatus: PriorAuthorizationProportionalityAnalysis["proportionalityStatus"] =
    missing.length
      ? "insufficient-evidence"
      : unrelatedCriteria.length || parityConcern
        ? "potentially-disproportionate"
        : "review-supported";
  const base = {
    ...analysis,
    tenantId: administrativeBurdenCase.tenantId,
    administrativeBurdenCaseId: administrativeBurdenCase.caseId,
    missingEvidence: missing,
    proportionalityStatus,
    humanReviewRequired: true as const,
    coverageDecisionAllowed: false as const,
    payerSubmissionAllowed: false as const,
    payerMutationAllowed: false as const
  };
  return { ...base, analysisHash: createAuditHash({ type: "prior-authorization-proportionality", base }) };
}

export function buildPolicyEvidencePacket(
  input: Omit<
    PolicyEvidencePacket,
    "tenantId" | "analysisId" | "submissionAllowed" | "appealAllowed" | "payerMutationAllowed" | "packetHash"
  > & { analysis: PriorAuthorizationProportionalityAnalysis }
): PolicyEvidencePacket {
  const { analysis, ...packet } = input;
  if (input.reviewState === "human-reviewed-internal" && !input.reviewerIdentityHash) {
    throw new Error("Reviewed policy evidence packet requires a named reviewer");
  }
  if (input.reviewerIdentityHash && !hashPattern.test(input.reviewerIdentityHash)) {
    throw new Error("Policy evidence reviewer must use a hashed identity reference");
  }
  const base = {
    ...packet,
    tenantId: analysis.tenantId,
    analysisId: analysis.analysisId,
    policyReferences: canonical(input.policyReferences),
    evidenceIds: canonical(input.evidenceIds),
    observedFacts: canonical(input.observedFacts),
    analystInferences: canonical(input.analystInferences),
    unresolvedQuestions: canonical(input.unresolvedQuestions),
    submissionAllowed: false as const,
    appealAllowed: false as const,
    payerMutationAllowed: false as const
  };
  return { ...base, packetHash: createAuditHash({ type: "policy-evidence-packet", base }) };
}

export function getNetworkIntelligenceSummary(env: NodeJS.ProcessEnv = process.env) {
  return {
    version: scrimedP32NetworkIntelligenceVersion,
    enabled: isNetworkIntelligenceEnabled(env),
    siteAndSubgroupVariancePreserved: true,
    policyResearchOnly: true,
    coverageDecisionAllowed: false,
    payerSubmissionAllowed: false,
    payerMutationAllowed: false,
    boundary: scrimedP32NetworkIntelligenceBoundary
  } as const;
}
