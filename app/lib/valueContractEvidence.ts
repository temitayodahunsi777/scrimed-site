import {
  createClinicalEvidenceHash,
  verifyCaseEvidencePacketIntegrity,
  type CaseEvidencePacket
} from "./clinicalEvidenceControls";

export const valueContractEvidenceVersion = "scrimed-value-contract-evidence-v1-2026-07-17";
export const valueContractEvidenceBoundary =
  "SCRIMED Value Contracts and renewal dossiers organize synthetic, approved evidence for internal review. They do not create binding commercial terms, audited financial results, causal claims, clinical validation, reimbursement guarantees, customer go-live approval, or permission to market an unapproved claim.";

export type ValueContract = {
  contractId: string;
  customerReference: string;
  workflowId: string;
  baseline: {
    metricId: string;
    value: number | null;
    unit: string;
    sourceRef: string;
    observedAt: string;
  };
  measurableTarget: {
    metricId: string;
    targetDirection: "increase" | "decrease" | "maintain";
    targetValue: number;
    unit: string;
  };
  operationalOwner: string;
  executiveOwner: string;
  clinicalOwner: string | null;
  safetyConstraints: string[];
  adoptionPlan: string[];
  reviews: Array<{
    day: 30 | 60 | 90;
    status: "not-started" | "scheduled" | "completed";
    evidenceRequired: string[];
  }>;
  evidenceRequirements: string[];
  renewalCriteria: string[];
  terminationAndRollbackCriteria: string[];
  humanApprovalRequired: true;
  bindingCommercialAuthority: false;
};

export type DossierClaimStrength =
  | "observed-fact"
  | "association"
  | "adjusted-analysis"
  | "causal-claim"
  | "unverified-claim";

export type RenewalDossierClaim = {
  claimId: string;
  statement: string;
  strength: DossierClaimStrength;
  evidencePacketHashes: string[];
  analysisMethod: string;
};

function safeValueReference(value: string) {
  return /^[a-z0-9][a-z0-9._:/-]{2,180}$/i.test(value) && !/token|secret|password|bearer/i.test(value);
}

function validateValueContract(contract: ValueContract) {
  const errors: string[] = [];
  if (
    ![
      contract.contractId,
      contract.customerReference,
      contract.workflowId,
      contract.baseline.metricId,
      contract.baseline.sourceRef,
      contract.measurableTarget.metricId,
      contract.operationalOwner,
      contract.executiveOwner
    ].every(safeValueReference)
  ) {
    errors.push("contract identifiers must be safe metadata references");
  }
  if (contract.clinicalOwner && !safeValueReference(contract.clinicalOwner)) errors.push("clinical owner is invalid");
  if (!Number.isFinite(Date.parse(contract.baseline.observedAt))) errors.push("baseline timestamp is invalid");
  if (!Number.isFinite(contract.measurableTarget.targetValue)) errors.push("target value is invalid");
  if (!contract.safetyConstraints.length || !contract.evidenceRequirements.length || !contract.renewalCriteria.length) {
    errors.push("safety, evidence, and renewal controls are required");
  }
  if (![30, 60, 90].every((day) => contract.reviews.some((review) => review.day === day))) {
    errors.push("30, 60, and 90 day reviews are required");
  }
  return errors;
}

function claimDecision(claim: RenewalDossierClaim, approvedPackets: CaseEvidencePacket[]) {
  const referencedPackets = claim.evidencePacketHashes.map((packetHash) =>
    approvedPackets.find((packet) => packet.evidencePacketHash === packetHash)
  );
  const evidenceComplete = claim.evidencePacketHashes.length > 0 && referencedPackets.every(Boolean);
  const blockers: string[] = [];
  if (!safeValueReference(claim.claimId)) blockers.push("claim identifier is invalid");
  if (!evidenceComplete) blockers.push("claim evidence is missing or unapproved");
  if (claim.strength === "causal-claim") blockers.push("causal claims are prohibited without a qualified controlled analysis and separate approval");
  if (claim.strength === "unverified-claim") blockers.push("unverified claims cannot enter a renewal dossier");
  if (/guarantee|proven clinical|causes|certified|cleared|customer go-live/i.test(claim.statement)) {
    blockers.push("claim language exceeds the evidence boundary");
  }
  if (claim.strength === "adjusted-analysis" && !/adjusted|regression|stratified|matched/i.test(claim.analysisMethod)) {
    blockers.push("adjusted analysis requires an explicit adjustment method");
  }

  return {
    claimId: claim.claimId,
    strength: claim.strength,
    statement: claim.statement,
    evidencePacketHashes: claim.evidencePacketHashes,
    analysisMethod: claim.analysisMethod,
    status: blockers.length ? "blocked" as const : "eligible-for-internal-review" as const,
    externalUseAllowed: false as const,
    blockers
  };
}

export function buildRenewalEvidenceDossier(input: {
  contract: ValueContract;
  caseEvidence: CaseEvidencePacket[];
  proposedClaims: RenewalDossierClaim[];
  generatedAt?: string;
}) {
  const contractErrors = validateValueContract(input.contract);
  if (contractErrors.length > 0) throw new Error(`Invalid ValueContract: ${contractErrors.join("; ")}`);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(generatedAt))) throw new Error("Invalid renewal dossier timestamp");

  const workflowPackets = input.caseEvidence.filter((packet) => packet.workflowId === input.contract.workflowId);
  const approvedPackets = workflowPackets.filter(
    (packet) =>
      packet.analysisPlanStatus === "approved-for-synthetic-analysis" &&
      packet.trustQaStatus === "approved-for-internal-synthetic-use" &&
      packet.completeness.complete &&
      verifyCaseEvidencePacketIntegrity(packet) &&
      packet.noPhi &&
      packet.syntheticOnly
  );
  const rejectedPacketHashes = workflowPackets
    .filter((packet) => !approvedPackets.includes(packet))
    .map((packet) => packet.evidencePacketHash);
  const claimDecisions = input.proposedClaims.map((claim) => claimDecision(claim, approvedPackets));
  const approvedClaims = claimDecisions.filter((claim) => claim.status === "eligible-for-internal-review");
  const blockedClaims = claimDecisions.filter((claim) => claim.status === "blocked");
  const completedReviews = input.contract.reviews.filter((review) => review.status === "completed").map((review) => review.day);
  const renewalReady =
    approvedPackets.length > 0 &&
    approvedClaims.length > 0 &&
    blockedClaims.length === 0 &&
    completedReviews.includes(90);
  const dossierCore = {
    dossierId: `renewal-dossier-${createClinicalEvidenceHash({ contractId: input.contract.contractId, generatedAt }).slice(0, 20)}`,
    contractId: input.contract.contractId,
    customerReferenceHash: createClinicalEvidenceHash({ customerReference: input.contract.customerReference }),
    workflowId: input.contract.workflowId,
    generatedAt,
    status: renewalReady ? "ready-for-qualified-internal-review" as const : "evidence-or-review-gap" as const,
    approvedEvidencePacketHashes: approvedPackets.map((packet) => packet.evidencePacketHash),
    rejectedEvidencePacketHashes: rejectedPacketHashes,
    claims: claimDecisions,
    claimStrengthLegend: {
      "observed-fact": "Directly recorded descriptive observation; no causal inference.",
      association: "Observed relationship that may be confounded; no causal inference.",
      "adjusted-analysis": "Analysis with an explicit adjustment method; remains noncausal unless separately established.",
      "causal-claim": "Blocked in the current synthetic/internal dossier.",
      "unverified-claim": "Blocked because required evidence or approval is absent."
    },
    reviewCadence: input.contract.reviews,
    renewalCriteria: input.contract.renewalCriteria,
    terminationAndRollbackCriteria: input.contract.terminationAndRollbackCriteria,
    humanReviewRequired: true as const,
    externalDistributionAllowed: false as const,
    bindingCommercialAuthority: false as const,
    causalClaimAllowed: false as const,
    boundary: valueContractEvidenceBoundary
  };

  return { ...dossierCore, auditHash: createClinicalEvidenceHash(dossierCore) };
}

export const documentationBeforeAuthorizationValueContract: ValueContract = {
  contractId: "synthetic-payeriq-value-contract-v1",
  customerReference: "synthetic-health-system",
  workflowId: "documentation-before-authorization",
  baseline: {
    metricId: "documentation-review-minutes",
    value: null,
    unit: "minutes-per-accepted-review-packet",
    sourceRef: "synthetic-baseline-observation-required",
    observedAt: "2026-07-17T12:00:00.000Z"
  },
  measurableTarget: {
    metricId: "documentation-review-minutes",
    targetDirection: "decrease",
    targetValue: 20,
    unit: "minutes-per-accepted-review-packet"
  },
  operationalOwner: "rcm-governance",
  executiveOwner: "synthetic-executive-sponsor",
  clinicalOwner: "clinical-review-governance",
  safetyConstraints: [
    "no-live-phi",
    "no-medical-necessity-determination",
    "no-payer-submission",
    "human-review-required"
  ],
  adoptionPlan: ["baseline-observation", "reviewer-training", "synthetic-canary", "30-60-90-review"],
  reviews: [
    { day: 30, status: "not-started", evidenceRequired: ["baseline", "adoption", "safety-events"] },
    { day: 60, status: "not-started", evidenceRequired: ["comparator", "override-rate", "cost-per-accepted-outcome"] },
    { day: 90, status: "not-started", evidenceRequired: ["approved-analysis", "Trust-QA-review", "renewal-criteria"] }
  ],
  evidenceRequirements: ["CaseEvidence-completeness", "version-lineage", "reviewer-disposition", "approved-analysis-plan", "Trust-QA-approval"],
  renewalCriteria: ["safety-thresholds-pass", "worst-cell-gate-pass", "adoption-target-reviewed", "value-target-reviewed"],
  terminationAndRollbackCriteria: ["safety-event-threshold-exceeded", "evidence-quality-degrades", "reviewer-burden-increases", "policy-authority-revoked"],
  humanApprovalRequired: true,
  bindingCommercialAuthority: false
};

export function getValueContractEvidenceSummary() {
  return {
    service: "scrimed-value-contract-evidence",
    version: valueContractEvidenceVersion,
    status: "synthetic-value-contract-ready",
    contract: documentationBeforeAuthorizationValueContract,
    approvedClaimStrengths: ["observed-fact", "association", "adjusted-analysis"],
    blockedClaimStrengths: ["causal-claim", "unverified-claim"],
    boundary: valueContractEvidenceBoundary
  };
}
