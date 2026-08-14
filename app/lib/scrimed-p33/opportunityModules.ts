import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { OpportunityModule } from "./types";

export const p33OpportunityModulesVersion =
  "scrimed-p33-opportunity-modules-v1-2026-08-13";

export const p33OpportunityModulesBoundary =
  "Opportunity modules operate on public, synthetic, or separately approved de-identified metadata. They prepare evidence and scenarios for human review and never autonomously triage, contact people, submit payer transactions, make legal or actuarial determinations, mutate records, or claim funding, customer outcomes, or deployment.";

export const p33OpportunityModules: OpportunityModule[] = [
  {
    moduleId: "rural-transformation-capture",
    title: "Rural Transformation Capture Lane",
    priority: "P0",
    featureFlag: "SCRIMED_P33_RURAL_TRANSFORMATION_ENABLED",
    enabledByDefault: true,
    workflow: ["register public program source", "record eligibility rules", "score readiness", "track milestones", "assemble review packet"],
    evidenceRequirements: ["canonical source URL", "retrieval date", "deadline", "eligibility provenance", "human owner"],
    operationalKpis: ["programs reviewed", "deadline coverage", "evidence completeness", "owner-confirmed readiness"],
    whyInvestorsCare: "Turns a time-sensitive rural-health funding landscape into an evidence-led workflow without claiming awards or applications.",
    boundary: "Planning only; no funding application, award, eligibility, or partnership claim.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "rural-care-signal-navigator",
    title: "Rural Care Signal Navigator",
    priority: "P0",
    featureFlag: "SCRIMED_P33_RURAL_CARE_SIGNAL_ENABLED",
    enabledByDefault: false,
    workflow: ["validate longitudinal inputs", "apply transparent criteria", "surface exclusions", "rank for clinician review", "record disposition"],
    evidenceRequirements: ["source spans", "criteria version", "exclusions", "clinician review"],
    operationalKpis: ["review acceptance", "time to reviewed outreach plan", "exclusion rate", "override burden"],
    whyInvestorsCare: "Demonstrates a defensible access workflow for resource-constrained care settings while retaining clinician authority.",
    boundary: "No autonomous triage, outreach, risk determination, diagnosis, or care prioritization.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "clinical-signal-compression",
    title: "Clinical Signal Compression",
    priority: "P0",
    featureFlag: "SCRIMED_P33_CLINICAL_SIGNAL_COMPRESSION_ENABLED",
    enabledByDefault: true,
    workflow: ["build shared context", "rank review signals", "preserve citations", "surface omissions", "apply extraction release gate"],
    evidenceRequirements: ["source spans", "timeline", "contradictions", "terminology authorization", "qualified review"],
    operationalKpis: ["facts retained", "citation coverage", "review time", "correction burden", "unsupported claims"],
    whyInvestorsCare: "Converts fragmented longitudinal records into reusable, governed context while preserving traceability and human authority.",
    boundary: "Decision support only; not diagnosis, source-record replacement, EHR writeback, or autonomous clinical action.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "prior-authorization-epa-readiness",
    title: "Prior Authorization / ePA Readiness",
    priority: "P1",
    featureFlag: "SCRIMED_P33_EPA_READINESS_ENABLED",
    enabledByDefault: false,
    workflow: ["inventory payer channels", "map evidence requirements", "record regulatory milestones", "measure turnaround", "prepare human review"],
    evidenceRequirements: ["payer source", "channel version", "effective date", "submission authority"],
    operationalKpis: ["channel coverage", "evidence completeness", "turnaround baseline", "exception rate"],
    whyInvestorsCare: "Creates a provider-neutral administrative readiness layer for a costly healthcare workflow.",
    boundary: "No payer submission, appeal, medical-necessity determination, or coverage decision.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "qpa-regulatory-replay",
    title: "QPA Regulatory Replay Engine",
    priority: "P1",
    featureFlag: "SCRIMED_P33_QPA_REPLAY_ENABLED",
    enabledByDefault: false,
    workflow: ["select methodology version", "bind dated sources", "run deterministic scenario", "record assumptions", "route legal review"],
    evidenceRequirements: ["methodology version", "source effective date", "scenario inputs", "calculation hash"],
    operationalKpis: ["scenario reproducibility", "assumption coverage", "review turnaround"],
    whyInvestorsCare: "Shows how SCRIMED can make complex administrative policy calculations reproducible and reviewable.",
    boundary: "Scenario support only; not legal advice, a payment determination, or payer action.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "pace-rate-viability",
    title: "PACE Rate Viability Lens",
    priority: "P1",
    featureFlag: "SCRIMED_P33_PACE_RATE_LENS_ENABLED",
    enabledByDefault: false,
    workflow: ["define state assumptions", "model payment scenarios", "run sensitivity analysis", "record provenance", "route actuarial review"],
    evidenceRequirements: ["state assumptions", "payment source", "effective date", "sensitivity range"],
    operationalKpis: ["scenario coverage", "sensitivity range", "assumption freshness"],
    whyInvestorsCare: "Adds disciplined scenario intelligence for value-based and community care economics.",
    boundary: "Planning support only; not actuarial advice, rate certification, or financial guarantee.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "vendor-continuity-radar",
    title: "Vendor Continuity Radar",
    priority: "P1",
    featureFlag: "SCRIMED_P33_VENDOR_CONTINUITY_ENABLED",
    enabledByDefault: true,
    workflow: ["register dated vendor signal", "classify uncertainty", "measure concentration", "simulate migration", "route contract review"],
    evidenceRequirements: ["dated source", "ownership state", "contract reference", "fallback evidence"],
    operationalKpis: ["material suppliers covered", "concentration exposure", "fallback readiness", "stale signal count"],
    whyInvestorsCare: "Reduces platform fragility and supports credible model and infrastructure portability.",
    boundary: "No allegation or vendor claim without dated evidence and qualified review.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "hybrid-workload-placement",
    title: "Hybrid Workload Placement",
    priority: "P1",
    featureFlag: "SCRIMED_P33_HYBRID_PLACEMENT_ENABLED",
    enabledByDefault: true,
    workflow: ["classify data", "apply jurisdiction policy", "check qualification", "admit capacity", "select safe route or abstain"],
    evidenceRequirements: ["data class", "jurisdiction", "model qualification", "provider health", "fallback independence"],
    operationalKpis: ["safe placement rate", "abstention rate", "fallback rate", "cost per verified task"],
    whyInvestorsCare: "Supports a model-independent architecture across local, edge, confidential-compute-capable, and approved cloud lanes.",
    boundary: "No protected workload placement without validated residency, privacy, contract, security, and capacity evidence.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "clinician-reengagement-data-quality",
    title: "Clinician Re-engagement Data Quality",
    priority: "P2",
    featureFlag: "SCRIMED_P33_CLINICIAN_REENGAGEMENT_ENABLED",
    enabledByDefault: false,
    workflow: ["detect stale records", "deduplicate identities", "assess reachability confidence", "verify consent", "prepare human-approved outreach"],
    evidenceRequirements: ["record freshness", "consent", "deduplication evidence", "human approval"],
    operationalKpis: ["stale records surfaced", "duplicate rate", "consent coverage", "reviewed reachability"],
    whyInvestorsCare: "Creates a privacy-respecting data-quality wedge for network growth and clinician collaboration.",
    boundary: "No contact, enrichment, sensitive profiling, or outreach without separate permission and approval.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  },
  {
    moduleId: "evidence-backed-ai-discoverability",
    title: "Evidence-Backed AI Discoverability",
    priority: "P2",
    featureFlag: "SCRIMED_P33_AI_DISCOVERABILITY_ENABLED",
    enabledByDefault: true,
    workflow: ["read claims registry", "select publication-permitted facts", "emit machine-readable facts", "verify prohibited strings", "publish only after owner approval"],
    evidenceRequirements: ["claim fingerprint", "evidence owner", "publication permission", "review date"],
    operationalKpis: ["eligible fact coverage", "stale claims", "blocked claims", "source completeness"],
    whyInvestorsCare: "Improves machine-readable trust and discoverability without manufacturing reputation or traction.",
    boundary: "No invented customers, testimonials, traction, partnerships, metrics, or regulatory claims.",
    humanReviewRequired: true,
    externalActionsEnabled: false
  }
];

export function evaluateRuralTransformationProgram(input: {
  programId: string;
  sourceUrl: string;
  retrievedAt: string;
  deadlineAt: string;
  eligibilityRules: string[];
  evidenceIds: string[];
  ownerAssigned: boolean;
  applicationSubmitted: boolean;
  fundingReceived: boolean;
}) {
  const reasonCodes: string[] = [];
  if (!/^https:\/\//.test(input.sourceUrl)) reasonCodes.push("CANONICAL_HTTPS_SOURCE_REQUIRED");
  if (!Number.isFinite(Date.parse(input.retrievedAt))) reasonCodes.push("RETRIEVAL_DATE_REQUIRED");
  if (!Number.isFinite(Date.parse(input.deadlineAt))) reasonCodes.push("DEADLINE_REQUIRED");
  if (!input.eligibilityRules.length) reasonCodes.push("ELIGIBILITY_RULES_REQUIRED");
  if (!input.evidenceIds.length) reasonCodes.push("EVIDENCE_REQUIRED");
  if (!input.ownerAssigned) reasonCodes.push("OWNER_REQUIRED");
  if (input.applicationSubmitted || input.fundingReceived) {
    reasonCodes.push("UNVERIFIED_APPLICATION_OR_AWARD_CLAIM_BLOCKED");
  }
  return {
    status: reasonCodes.length ? "review-required" : "readiness-packet-ready",
    reasonCodes,
    applicationAuthority: false,
    awardClaimAuthority: false,
    readinessScore: Math.max(0, 100 - reasonCodes.length * 15),
    evidenceHash: createClinicalEvidenceHash({ type: "p33-rural-program", input, reasonCodes })
  };
}

export function prioritizeRuralCareSignals(input: Array<{
  signalId: string;
  urgency: number;
  expectedBenefit: number;
  feasibility: number;
  timeSensitivity: number;
  excluded: boolean;
  provenanceIds: string[];
}>) {
  return input
    .map((signal) => ({
      ...signal,
      score: signal.excluded
        ? null
        : Number((signal.urgency * 0.35 + signal.expectedBenefit * 0.3 + signal.feasibility * 0.15 + signal.timeSensitivity * 0.2).toFixed(3)),
      disposition: signal.excluded ? "excluded-for-human-review" : "clinician-review-required",
      autonomousTriageAllowed: false
    }))
    .sort((left, right) => (right.score ?? -1) - (left.score ?? -1));
}

export function evaluatePriorAuthorizationReadiness(input: {
  payerChannel: "fax" | "portal" | "api" | "unknown";
  evidenceRequirementsMapped: boolean;
  sourceEffectiveAt: string | null;
  humanSubmissionOwnerAssigned: boolean;
}) {
  const reasonCodes: string[] = [];
  if (input.payerChannel === "unknown") reasonCodes.push("PAYER_CHANNEL_UNKNOWN");
  if (!input.evidenceRequirementsMapped) reasonCodes.push("EVIDENCE_REQUIREMENTS_NOT_MAPPED");
  if (!input.sourceEffectiveAt || !Number.isFinite(Date.parse(input.sourceEffectiveAt))) {
    reasonCodes.push("DATED_POLICY_SOURCE_REQUIRED");
  }
  if (!input.humanSubmissionOwnerAssigned) reasonCodes.push("HUMAN_SUBMISSION_OWNER_REQUIRED");
  return {
    status: reasonCodes.length ? "review-required" : "preparation-ready",
    reasonCodes,
    submissionAllowed: false,
    payerMutationAllowed: false,
    evidenceHash: createClinicalEvidenceHash({ type: "p33-epa-readiness", input, reasonCodes })
  };
}

export function calculateQpaReplayScenario(input: {
  scenarioId: string;
  methodologyVersion: string;
  allowedAmountsUsd: number[];
  adjustmentFactor: number;
  sourceEffectiveAt: string;
}) {
  if (!input.allowedAmountsUsd.length || input.allowedAmountsUsd.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("QPA replay requires nonnegative scenario amounts");
  }
  if (!Number.isFinite(input.adjustmentFactor) || input.adjustmentFactor <= 0) {
    throw new Error("QPA replay requires a positive adjustment factor");
  }
  const sorted = [...input.allowedAmountsUsd].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  const median = sorted.length % 2
    ? sorted[midpoint]
    : (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  const result = Number((median * input.adjustmentFactor).toFixed(2));
  return {
    scenarioId: input.scenarioId,
    methodologyVersion: input.methodologyVersion,
    sourceEffectiveAt: input.sourceEffectiveAt,
    scenarioResultUsd: result,
    legalAdvice: false,
    paymentDetermination: false,
    calculationHash: createClinicalEvidenceHash({ type: "p33-qpa-replay", input, result })
  };
}

export function calculatePaceRateSensitivity(input: {
  scenarioId: string;
  baseMonthlyRateUsd: number;
  populationCount: number;
  rateAdjustments: number[];
  sourceIds: string[];
}) {
  if (input.baseMonthlyRateUsd < 0 || input.populationCount < 1 || !input.rateAdjustments.length) {
    throw new Error("PACE rate scenario requires valid base rate, population, and adjustments");
  }
  const scenarios = input.rateAdjustments.map((adjustment) => ({
    adjustment,
    monthlyRevenueScenarioUsd: Number((input.baseMonthlyRateUsd * adjustment * input.populationCount).toFixed(2))
  }));
  return {
    scenarioId: input.scenarioId,
    scenarios,
    actuarialAdvice: false,
    financialGuarantee: false,
    analysisHash: createClinicalEvidenceHash({ type: "p33-pace-rate-sensitivity", input, scenarios })
  };
}

export function evaluateVendorContinuitySignal(input: {
  vendorId: string;
  signalType: "ownership" | "roadmap" | "service" | "contract" | "pricing";
  sourceDate: string;
  sourceIds: string[];
  uncertainty: "low" | "moderate" | "high";
  concentrationPercent: number;
  fallbackValidated: boolean;
}) {
  const reasonCodes: string[] = [];
  if (!Number.isFinite(Date.parse(input.sourceDate))) reasonCodes.push("DATED_SOURCE_REQUIRED");
  if (!input.sourceIds.length) reasonCodes.push("SOURCE_REQUIRED");
  if (input.uncertainty === "high") reasonCodes.push("HIGH_UNCERTAINTY");
  if (input.concentrationPercent > 50) reasonCodes.push("CONCENTRATION_THRESHOLD_EXCEEDED");
  if (!input.fallbackValidated) reasonCodes.push("VALIDATED_FALLBACK_REQUIRED");
  return {
    decision: reasonCodes.some((reason) => reason.includes("CONCENTRATION") || reason.includes("FALLBACK"))
      ? "BLOCK"
      : reasonCodes.length
        ? "REQUIRE_HUMAN"
        : "ALLOW",
    reasonCodes,
    automaticVendorClaimAllowed: false,
    signalHash: createClinicalEvidenceHash({ type: "p33-vendor-continuity", input, reasonCodes })
  } as const;
}

export function selectHybridWorkloadPlacement(input: {
  dataClassification: "public" | "synthetic-no-phi" | "deidentified-approved" | "phi";
  jurisdiction: string;
  requiredLatencyMs: number;
  candidates: Array<{
    placementId: string;
    kind: "local" | "edge" | "confidential-compute-capable" | "approved-cloud";
    qualified: boolean;
    jurisdiction: string;
    latencyMs: number;
    estimatedCostUsd: number;
    phiAuthorized: boolean;
  }>;
}) {
  const eligible = input.candidates
    .filter((candidate) =>
      candidate.qualified &&
      candidate.jurisdiction === input.jurisdiction &&
      candidate.latencyMs <= input.requiredLatencyMs &&
      (input.dataClassification !== "phi" || candidate.phiAuthorized)
    )
    .sort((left, right) => left.estimatedCostUsd - right.estimatedCostUsd || left.latencyMs - right.latencyMs);
  const selected = eligible[0] ?? null;
  return {
    status: selected ? "placement-selected-for-synthetic-evaluation" : "safe-abstention",
    selected,
    phiRouteAllowed: false,
    rationale: selected
      ? "Selected the lowest-cost qualified placement satisfying jurisdiction and latency controls."
      : "No candidate satisfied every noncompensable placement gate.",
    placementHash: createClinicalEvidenceHash({ type: "p33-hybrid-placement", input, selected })
  };
}

export function evaluateReengagementDataQuality(input: {
  recordIdHash: string;
  lastVerifiedAt: string;
  consentState: "verified" | "missing" | "revoked";
  duplicateCandidateCount: number;
  reachabilityConfidence: number;
}) {
  const reasonCodes: string[] = [];
  if (!Number.isFinite(Date.parse(input.lastVerifiedAt))) reasonCodes.push("LAST_VERIFIED_DATE_REQUIRED");
  if (input.consentState !== "verified") reasonCodes.push("CONSENT_NOT_VERIFIED");
  if (input.duplicateCandidateCount > 0) reasonCodes.push("DUPLICATE_REVIEW_REQUIRED");
  if (input.reachabilityConfidence < 0.8) reasonCodes.push("REACHABILITY_CONFIDENCE_LOW");
  return {
    status: reasonCodes.length ? "human-review-required" : "data-quality-review-ready",
    reasonCodes,
    outreachAllowed: false,
    enrichmentAllowed: false,
    assessmentHash: createClinicalEvidenceHash({ type: "p33-reengagement-data-quality", input, reasonCodes })
  };
}

export function createDiscoverabilityFact(input: {
  claimId: string;
  claimFingerprint: string;
  claim: string;
  status: "VERIFIED" | "QUALIFIED" | "SYNTHETIC" | "ESTIMATED" | "PLANNED" | "PROHIBITED" | "MISSING_EVIDENCE";
  evidenceOwner: string | null;
  publicationPermission: boolean;
  reviewBy: string | null;
}) {
  const eligible =
    ["VERIFIED", "QUALIFIED", "SYNTHETIC"].includes(input.status) &&
    Boolean(input.evidenceOwner) &&
    input.publicationPermission &&
    Boolean(input.reviewBy && Date.parse(input.reviewBy) > Date.parse("2026-08-13T00:00:00.000Z"));
  return {
    claimId: input.claimId,
    claimFingerprint: input.claimFingerprint,
    claim: eligible ? input.claim : null,
    publicationEligible: eligible,
    reason: eligible
      ? "Claim is evidence-bound, owner-assigned, publication-permitted, and within its review window."
      : "Claim remains excluded from machine-readable public facts.",
    factHash: createClinicalEvidenceHash({ type: "p33-discoverability-fact", input, eligible })
  };
}

export function getP33OpportunitySummary() {
  const ruralProgram = evaluateRuralTransformationProgram({
    programId: "synthetic-rural-program-001",
    sourceUrl: "https://example.gov/synthetic-program",
    retrievedAt: "2026-08-13T00:00:00.000Z",
    deadlineAt: "2027-01-31T23:59:59.000Z",
    eligibilityRules: ["Synthetic rural-health organization scenario"],
    evidenceIds: ["public-source-placeholder-not-a-funding-claim"],
    ownerAssigned: true,
    applicationSubmitted: false,
    fundingReceived: false
  });
  const ruralSignals = prioritizeRuralCareSignals([
    { signalId: "signal-follow-up", urgency: 0.7, expectedBenefit: 0.8, feasibility: 0.9, timeSensitivity: 0.7, excluded: false, provenanceIds: ["ctx-synthetic-discharge-001"] },
    { signalId: "signal-insufficient-evidence", urgency: 0.9, expectedBenefit: 0.7, feasibility: 0.2, timeSensitivity: 0.8, excluded: true, provenanceIds: [] }
  ]);
  return {
    version: p33OpportunityModulesVersion,
    modules: p33OpportunityModules,
    enabledSyntheticModuleCount: p33OpportunityModules.filter((module) => module.enabledByDefault).length,
    externalActionModuleCount: p33OpportunityModules.filter((module) => module.externalActionsEnabled).length,
    sampleResults: {
      ruralProgram,
      ruralSignals,
      priorAuthorization: evaluatePriorAuthorizationReadiness({
        payerChannel: "portal",
        evidenceRequirementsMapped: true,
        sourceEffectiveAt: "2026-08-01T00:00:00.000Z",
        humanSubmissionOwnerAssigned: true
      }),
      qpaReplay: calculateQpaReplayScenario({
        scenarioId: "qpa-synthetic-001",
        methodologyVersion: "synthetic-method-v1",
        allowedAmountsUsd: [100, 110, 120],
        adjustmentFactor: 1.02,
        sourceEffectiveAt: "2026-08-01T00:00:00.000Z"
      }),
      paceSensitivity: calculatePaceRateSensitivity({
        scenarioId: "pace-synthetic-001",
        baseMonthlyRateUsd: 1_000,
        populationCount: 100,
        rateAdjustments: [0.9, 1, 1.1],
        sourceIds: ["synthetic-rate-assumption"]
      }),
      vendorContinuity: evaluateVendorContinuitySignal({
        vendorId: "synthetic-provider",
        signalType: "service",
        sourceDate: "2026-08-13T00:00:00.000Z",
        sourceIds: ["synthetic-service-status"],
        uncertainty: "low",
        concentrationPercent: 25,
        fallbackValidated: true
      }),
      placement: selectHybridWorkloadPlacement({
        dataClassification: "synthetic-no-phi",
        jurisdiction: "local",
        requiredLatencyMs: 500,
        candidates: [{ placementId: "local-synthetic", kind: "local", qualified: true, jurisdiction: "local", latencyMs: 20, estimatedCostUsd: 0, phiAuthorized: false }]
      })
    },
    boundary: p33OpportunityModulesBoundary
  };
}
