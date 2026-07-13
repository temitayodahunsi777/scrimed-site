import {
  getReleaseEvidenceLedgerSummary,
  type ReleaseEvidenceLedgerEntry
} from "./releaseEvidenceLedger";

export type ReleaseEvidencePromotionLane =
  | "buyer-diligence-candidate"
  | "protected-operator-proof-required"
  | "qualified-external-review-required";

export type ReleaseEvidencePromotionStatus =
  | "shareable-no-secret-metadata"
  | "blocked-until-retained-aal2-proof"
  | "blocked-until-qualified-review";

export type ReleaseEvidencePromotionQueueItem = {
  id: string;
  sourceEntryId: string;
  label: string;
  lane: ReleaseEvidencePromotionLane;
  status: ReleaseEvidencePromotionStatus;
  sourceEvidenceHash: string;
  targetPacket: string;
  targetRoute: string;
  allowedAudience: string[];
  requiredApprovals: string[];
  shareableFields: string[];
  withheldMaterial: string[];
  blocker: string;
  nextAction: string;
  safetyBoundary: string;
};

export type ReleaseEvidencePromotionSummary = {
  service: "scrimed-release-evidence-promotion-queue";
  status: typeof releaseEvidencePromotionStatus;
  route: typeof releaseEvidencePromotionRoute;
  apiRoute: typeof releaseEvidencePromotionApiRoute;
  briefRoute: typeof releaseEvidencePromotionBriefRoute;
  sourceLedgerStatus: string;
  generatedAt: "static-no-secret-release-promotion";
  noPhiConfirmed: true;
  tokenMaterialCaptured: false;
  productionApproval: false;
  buyerDistributionAuthority: "protected-buyer-diligence-only-after-review";
  externalDistributionAuthority: "not-authorized";
  publicClaimAuthority: "not-authorized-public-claim";
  queueCount: number;
  shareableNoSecretCount: number;
  operatorProofRequiredCount: number;
  externalReviewRequiredCount: number;
  blockedProductionClaimCount: number;
  queue: ReleaseEvidencePromotionQueueItem[];
  promotionRules: string[];
  blockedClaims: string[];
  boundary: typeof releaseEvidencePromotionBoundary;
};

export const releaseEvidencePromotionStatus =
  "release-evidence-promotion-queue-active-human-gated";
export const releaseEvidencePromotionRoute =
  "/release-continuity#release-evidence-promotion";
export const releaseEvidencePromotionApiRoute =
  "/api/release-continuity/evidence-promotion";
export const releaseEvidencePromotionBriefRoute =
  "/api/release-continuity/evidence-promotion/brief";

export const releaseEvidencePromotionBoundary =
  "SCRIMED Release Evidence Promotion Queue converts no-secret release ledger entries into buyer-diligence candidates, protected operator proof blockers, and qualified-review requirements. It does not store PHI, tokens, raw logs, customer data, production connector payloads, certification evidence, public release approval, or live clinical authority.";

const blockedClaims = [
  "release evidence promotion is production approval",
  "public distribution approved",
  "strict AAL2 proof retained without a protected packet hash",
  "PHI processing authorized",
  "live clinical care authorized",
  "security or compliance certified",
  "production connector approved",
  "customer go-live approved"
];

const promotionRules = [
  "Passed no-secret ledger entries may be attached to buyer diligence as metadata-only candidates.",
  "Operator-required entries remain blocked until a fresh human AAL2 run produces retained no-secret protected packet metadata.",
  "External-review entries remain blocked until qualified legal, privacy, security, clinical, buyer, regulatory, or certification-body review exists.",
  "Promotion may include command names, statuses, routes, evidence hashes, safe-use labels, and next actions only.",
  "Promotion must withhold bearer tokens, JWTs, Supabase keys, service-role keys, PHI, raw logs, customer data, production connector payloads, clinical conclusions, certification proof, and public release approval."
];

const shareableFields = [
  "entry id",
  "label",
  "command name",
  "status",
  "evidence type",
  "source surface",
  "artifact route",
  "deterministic evidence hash",
  "safe use cases",
  "blocked claims",
  "human-review requirement",
  "replay instruction",
  "next action"
];

const withheldMaterial = [
  "bearer tokens",
  "JWTs",
  "refresh tokens",
  "Supabase keys",
  "service-role keys",
  "passwords",
  "PHI",
  "patient identifiers",
  "raw logs",
  "customer data",
  "production connector payloads",
  "clinical conclusions",
  "legal opinions",
  "security certification reports"
];

function laneForEntry(entry: ReleaseEvidenceLedgerEntry): ReleaseEvidencePromotionLane {
  if (entry.status === "blocked-until-human-aal2" || entry.status === "operator-required") {
    return "protected-operator-proof-required";
  }

  if (entry.status === "external-review-required") {
    return "qualified-external-review-required";
  }

  return "buyer-diligence-candidate";
}

function statusForLane(lane: ReleaseEvidencePromotionLane): ReleaseEvidencePromotionStatus {
  if (lane === "protected-operator-proof-required") return "blocked-until-retained-aal2-proof";
  if (lane === "qualified-external-review-required") return "blocked-until-qualified-review";
  return "shareable-no-secret-metadata";
}

function targetRouteForLane(lane: ReleaseEvidencePromotionLane) {
  if (lane === "protected-operator-proof-required") {
    return "/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets";
  }

  if (lane === "qualified-external-review-required") {
    return "/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence";
  }

  return "/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet";
}

function requiredApprovalsForLane(lane: ReleaseEvidencePromotionLane) {
  if (lane === "protected-operator-proof-required") {
    return ["approved tenant-admin/pilot-lead/reviewer AAL2 operator", "release steward"];
  }

  if (lane === "qualified-external-review-required") {
    return ["legal reviewer", "privacy/security reviewer", "clinical/regulatory reviewer", "buyer authorization owner"];
  }

  return ["release steward", "claim guard reviewer before external copy expansion"];
}

function allowedAudienceForLane(lane: ReleaseEvidencePromotionLane) {
  if (lane === "protected-operator-proof-required") {
    return ["internal release operators", "approved AAL2 reviewers"];
  }

  if (lane === "qualified-external-review-required") {
    return ["founder", "qualified legal/security/clinical/reimbursement/regulatory reviewers"];
  }

  return ["internal team", "investor diligence", "buyer diligence under no-secret boundary"];
}

function blockerForLane(lane: ReleaseEvidencePromotionLane) {
  if (lane === "protected-operator-proof-required") {
    return "Fresh human AAL2 operator run and retained no-secret protected packet hash required.";
  }

  if (lane === "qualified-external-review-required") {
    return "Qualified external approval evidence and reviewer signoff required.";
  }

  return "No production blocker for metadata-only buyer diligence use; public claims still require review.";
}

function targetPacketForLane(lane: ReleaseEvidencePromotionLane) {
  if (lane === "protected-operator-proof-required") {
    return "protected retained AAL2 operator proof packet";
  }

  if (lane === "qualified-external-review-required") {
    return "qualified external approval evidence packet";
  }

  return "buyer diligence no-secret release evidence packet";
}

function queueItem(entry: ReleaseEvidenceLedgerEntry): ReleaseEvidencePromotionQueueItem {
  const lane = laneForEntry(entry);

  return {
    id: `promotion-${entry.id}`,
    sourceEntryId: entry.id,
    label: entry.label,
    lane,
    status: statusForLane(lane),
    sourceEvidenceHash: entry.evidenceHash,
    targetPacket: targetPacketForLane(lane),
    targetRoute: targetRouteForLane(lane),
    allowedAudience: allowedAudienceForLane(lane),
    requiredApprovals: requiredApprovalsForLane(lane),
    shareableFields,
    withheldMaterial,
    blocker: blockerForLane(lane),
    nextAction: entry.nextAction,
    safetyBoundary: entry.noSecretBoundary
  };
}

export function getReleaseEvidencePromotionSummary(): ReleaseEvidencePromotionSummary {
  const ledger = getReleaseEvidenceLedgerSummary();
  const queue = ledger.entries.map(queueItem);

  return {
    service: "scrimed-release-evidence-promotion-queue",
    status: releaseEvidencePromotionStatus,
    route: releaseEvidencePromotionRoute,
    apiRoute: releaseEvidencePromotionApiRoute,
    briefRoute: releaseEvidencePromotionBriefRoute,
    sourceLedgerStatus: ledger.status,
    generatedAt: "static-no-secret-release-promotion",
    noPhiConfirmed: true,
    tokenMaterialCaptured: false,
    productionApproval: false,
    buyerDistributionAuthority: "protected-buyer-diligence-only-after-review",
    externalDistributionAuthority: "not-authorized",
    publicClaimAuthority: "not-authorized-public-claim",
    queueCount: queue.length,
    shareableNoSecretCount: queue.filter((item) => item.status === "shareable-no-secret-metadata").length,
    operatorProofRequiredCount: queue.filter((item) => item.lane === "protected-operator-proof-required").length,
    externalReviewRequiredCount: queue.filter((item) => item.lane === "qualified-external-review-required").length,
    blockedProductionClaimCount: blockedClaims.length,
    queue,
    promotionRules,
    blockedClaims,
    boundary: releaseEvidencePromotionBoundary
  };
}

export function buildReleaseEvidencePromotionBrief() {
  const summary = getReleaseEvidencePromotionSummary();

  return [
    "# SCRIMED Release Evidence Promotion Queue",
    "",
    `Status: ${summary.status}`,
    `Generated: ${summary.generatedAt}`,
    `Source ledger: ${summary.sourceLedgerStatus}`,
    `No PHI confirmed: ${summary.noPhiConfirmed}`,
    `Token material captured: ${summary.tokenMaterialCaptured}`,
    `Production approval: ${summary.productionApproval}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Promotion Queue",
    ...summary.queue.map(
      (item) =>
        `- ${item.label} (${item.status}): ${item.targetPacket}; source hash ${item.sourceEvidenceHash}; target ${item.targetRoute}; blocker ${item.blocker}; next ${item.nextAction}`
    ),
    "",
    "## Promotion Rules",
    ...summary.promotionRules.map((rule) => `- ${rule}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
