import { getDiligencePacketManifestSummary } from "./diligencePacketManifest";
import { getDiligencePacketShareGuardSummary } from "./diligencePacketShareGuard";
import { getDiligenceReleaseGateSummary } from "./diligenceReleaseGate";
import { getQaAal2SmokeReadinessPacket } from "./qaAal2RunEvidence";
import { getRecipientQualificationMatrixSummary } from "./recipientQualificationMatrix";
import { getReleaseEvidenceFreshnessGuardSummary } from "./releaseEvidenceFreshnessGuard";
import { getReleaseEvidenceLedgerSummary } from "./releaseEvidenceLedger";
import { getReleaseEvidencePromotionSummary } from "./releaseEvidencePromotion";

export type ReleaseAuthorizationChainControlState =
  | "passed-no-secret"
  | "human-review-required"
  | "operator-required"
  | "external-review-required"
  | "blocked-by-design";

export type ReleaseAuthorizationChainDecision =
  | "metadata-ready-internal-review"
  | "human-review-required"
  | "operator-required"
  | "external-review-required"
  | "blocked-by-design";

export type ReleaseAuthorizationChainControl = {
  id: string;
  label: string;
  state: ReleaseAuthorizationChainControlState;
  sourceRoute: string;
  sourceApiRoute: string;
  sourceHash: string;
  evidence: string;
  requiredControl: string;
  nextAction: string;
  blockedClaims: string[];
  authorityBoundary: string;
};

export type ReleaseAuthorizationChainSummary = {
  service: "scrimed-release-authorization-chain";
  status: typeof releaseAuthorizationChainStatus;
  route: typeof releaseAuthorizationChainRoute;
  apiRoute: typeof releaseAuthorizationChainApiRoute;
  briefRoute: typeof releaseAuthorizationChainBriefRoute;
  generatedAt: "static-no-secret-release-authorization-chain";
  noPhiConfirmed: true;
  tokenMaterialCaptured: false;
  productionApproval: false;
  safeUseLabel: "no-secret-metadata-chain-not-release-approval";
  chainDecision: ReleaseAuthorizationChainDecision;
  weakestLink: string;
  buyerDiligenceMetadataLane: "available-after-release-steward-review";
  protectedProofLane: "blocked-until-human-aal2";
  publicDistributionAuthority: "not-authorized";
  customerSpecificAuthority: "not-authorized-without-customer-permission";
  releaseAuthority: "not-release-approval";
  clinicalCareAuthority: "not-authorized-live-care";
  phiAuthority: "not-authorized-production-phi";
  securityCertification: "not-security-certified";
  authorizationHash: string;
  controlCount: number;
  passedNoSecretCount: number;
  humanReviewRequiredCount: number;
  operatorRequiredCount: number;
  externalReviewRequiredCount: number;
  blockedByDesignCount: number;
  controls: ReleaseAuthorizationChainControl[];
  requiredBeforeExternalReference: string[];
  blockedClaims: string[];
  boundary: typeof releaseAuthorizationChainBoundary;
};

export const releaseAuthorizationChainStatus =
  "release-authorization-chain-active-no-release-approval";
export const releaseAuthorizationChainRoute =
  "/release-continuity#release-authorization-chain";
export const releaseAuthorizationChainApiRoute =
  "/api/release-continuity/authorization-chain";
export const releaseAuthorizationChainBriefRoute =
  "/api/release-continuity/authorization-chain/brief";

export const releaseAuthorizationChainBoundary =
  "SCRIMED Release Authorization Chain composes the no-secret release ledger, evidence freshness guard, diligence gate, packet manifest, recipient qualification matrix, share guard, and AAL2 readiness into one weakest-link control view. It does not approve release, share packets, store recipient identifiers, retain token material, authorize PHI, certify security or compliance, approve customer go-live, or authorize live clinical care.";

const blockedClaims = [
  "release authorization chain is release approval",
  "public distribution approved",
  "recipient approved without human review",
  "customer-specific sharing approved",
  "strict AAL2 proof retained",
  "boundary release approved",
  "PHI processing authorized",
  "live clinical care authorized",
  "security or compliance certified",
  "production connector approved",
  "customer go-live approved"
];

const requiredBeforeExternalReference = [
  "Run the release evidence ledger and promotion queue to identify no-secret metadata candidates.",
  "Run the evidence freshness guard and refresh any stale, protected, or qualified-review evidence before external reuse.",
  "Run the diligence release gate to separate buyer-diligence metadata from protected AAL2, public, production, and clinical NO-GO boundaries.",
  "Run the diligence packet manifest to confirm allowed fields, withheld material, reviewer owners, and blocked claims.",
  "Run the recipient qualification matrix before naming or referencing any external recipient class.",
  "Run the diligence packet share guard before any packet or artifact is referenced outside SCRIMED.",
  "Use a fresh human AAL2 operator session only for strict protected proof, then retain no token values.",
  "Route public, customer-specific, PHI, clinical, certification, connector, reimbursement, and go-live language through qualified review."
];

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function authorizationHash(payload: unknown) {
  const serialized = stableSerialize(payload);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `release-authorization-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function control(input: ReleaseAuthorizationChainControl): ReleaseAuthorizationChainControl {
  return input;
}

function sourceHash(input: string) {
  return authorizationHash(input);
}

function buildControls(): ReleaseAuthorizationChainControl[] {
  const ledger = getReleaseEvidenceLedgerSummary();
  const promotion = getReleaseEvidencePromotionSummary();
  const freshness = getReleaseEvidenceFreshnessGuardSummary();
  const gate = getDiligenceReleaseGateSummary();
  const manifest = getDiligencePacketManifestSummary();
  const recipientMatrix = getRecipientQualificationMatrixSummary();
  const shareGuard = getDiligencePacketShareGuardSummary();
  const aal2Readiness = getQaAal2SmokeReadinessPacket();

  return [
    control({
      id: "release-evidence-ledger",
      label: "Release evidence ledger",
      state: ledger.passedNoSecretCount >= 5 ? "passed-no-secret" : "human-review-required",
      sourceRoute: ledger.route,
      sourceApiRoute: ledger.apiRoute,
      sourceHash: sourceHash(`${ledger.status}:${ledger.entryCount}:${ledger.passedNoSecretCount}`),
      evidence:
        `${ledger.passedNoSecretCount}/${ledger.entryCount} ledger entries are passed no-secret metadata.`,
      requiredControl:
        "Use command names, statuses, routes, no-secret evidence hashes, and blocked claims only.",
      nextAction:
        "Attach no-secret ledger metadata to release review; withhold raw logs, token values, PHI, customer data, and protected payloads.",
      blockedClaims,
      authorityBoundary: ledger.boundary
    }),
    control({
      id: "evidence-promotion-queue",
      label: "Evidence promotion queue",
      state: promotion.shareableNoSecretCount > 0 ? "passed-no-secret" : "human-review-required",
      sourceRoute: promotion.route,
      sourceApiRoute: promotion.apiRoute,
      sourceHash: sourceHash(`${promotion.status}:${promotion.queueCount}:${promotion.shareableNoSecretCount}`),
      evidence:
        `${promotion.shareableNoSecretCount}/${promotion.queueCount} promotion entries are shareable no-secret candidates.`,
      requiredControl:
        "Promote only metadata-safe evidence; keep operator proof and external-review evidence in withheld lanes.",
      nextAction:
        "Use the promotion queue before any buyer or investor packet assembly.",
      blockedClaims,
      authorityBoundary: promotion.boundary
    }),
    control({
      id: "evidence-freshness-guard",
      label: "Evidence freshness guard",
      state: freshness.humanAal2RefreshCount > 0 ? "operator-required" : freshness.refreshRequiredCount > 0 ? "human-review-required" : "passed-no-secret",
      sourceRoute: freshness.route,
      sourceApiRoute: freshness.apiRoute,
      sourceHash: freshness.freshnessHash,
      evidence:
        `${freshness.refreshRequiredCount}/${freshness.cardCount} freshness cards require refresh before external sharing; ${freshness.humanAal2RefreshCount} require human AAL2.`,
      requiredControl:
        "Refresh stale public, contract, protected AAL2, and qualified-review evidence before external reuse.",
      nextAction:
        "Run the freshness guard immediately before external packet reference and withhold stale or protected evidence.",
      blockedClaims,
      authorityBoundary: freshness.boundary
    }),
    control({
      id: "diligence-release-gate",
      label: "Diligence release gate",
      state: gate.noGoCount > 0 ? "blocked-by-design" : gate.reviewRequiredCount > 0 ? "human-review-required" : "passed-no-secret",
      sourceRoute: gate.route,
      sourceApiRoute: gate.apiRoute,
      sourceHash: sourceHash(`${gate.status}:${gate.goCount}:${gate.reviewRequiredCount}:${gate.noGoCount}`),
      evidence:
        `${gate.goCount} buyer-diligence GO cards, ${gate.reviewRequiredCount} review-required cards, and ${gate.noGoCount} NO-GO cards.`,
      requiredControl:
        "Preserve protected AAL2, public distribution, production release, PHI, and clinical production gates as separate NO-GO lanes.",
      nextAction:
        "Use the gate label in every release packet so readiness language cannot drift into approval claims.",
      blockedClaims: gate.blockedClaims,
      authorityBoundary: gate.boundary
    }),
    control({
      id: "diligence-packet-manifest",
      label: "Diligence packet manifest",
      state:
        manifest.noGoCount > 0
          ? "blocked-by-design"
          : manifest.withholdUntilQualifiedReviewCount > 0
            ? "external-review-required"
            : manifest.withholdUntilHumanAal2Count > 0
              ? "operator-required"
              : "passed-no-secret",
      sourceRoute: manifest.route,
      sourceApiRoute: manifest.apiRoute,
      sourceHash: manifest.manifestHash,
      evidence:
        `${manifest.includeNoSecretCount}/${manifest.itemCount} packet items are include-no-secret; ${manifest.withholdUntilHumanAal2Count} need human AAL2 and ${manifest.withholdUntilQualifiedReviewCount} need qualified review.`,
      requiredControl:
        "Assemble packets from allowed fields only and keep withheld material out of buyer-facing artifacts.",
      nextAction:
        "Use the manifest to build metadata-only diligence packets with reviewer ownership and blocked claims.",
      blockedClaims: manifest.blockedClaims,
      authorityBoundary: manifest.boundary
    }),
    control({
      id: "recipient-qualification-matrix",
      label: "Recipient qualification matrix",
      state:
        recipientMatrix.blockedRecipientCount > 0
          ? "human-review-required"
          : recipientMatrix.qualifiedReviewRequiredCount > 0
            ? "external-review-required"
            : "passed-no-secret",
      sourceRoute: recipientMatrix.route,
      sourceApiRoute: recipientMatrix.apiRoute,
      sourceHash: recipientMatrix.qualificationHash,
      evidence:
        `${recipientMatrix.recipientClassCount} recipient classes; ${recipientMatrix.qualifiedReviewRequiredCount} require qualified review and ${recipientMatrix.blockedRecipientCount} are blocked by default.`,
      requiredControl:
        "Classify recipient class, purpose, expiry, revocation path, and no-identifier storage before external packet reference.",
      nextAction:
        "Keep recipient names, emails, access grants, raw logs, and signed approvals outside SCRIMED.",
      blockedClaims: recipientMatrix.blockedClaims,
      authorityBoundary: recipientMatrix.boundary
    }),
    control({
      id: "diligence-packet-share-guard",
      label: "Diligence packet share guard",
      state:
        shareGuard.noGoCount > 0
          ? "blocked-by-design"
          : shareGuard.reviewRequiredCount > 0
            ? "human-review-required"
            : "passed-no-secret",
      sourceRoute: shareGuard.route,
      sourceApiRoute: shareGuard.apiRoute,
      sourceHash: shareGuard.guardHash,
      evidence:
        `${shareGuard.internalAllowCount} internal cards, ${shareGuard.reviewRequiredCount} review-required cards, and ${shareGuard.noGoCount} NO-GO cards.`,
      requiredControl:
        "Run share guard before any packet leaves SCRIMED; public, customer-specific, and protected packet lanes stay blocked until qualified approvals exist.",
      nextAction:
        "Reference only reviewed no-secret metadata in protected diligence lanes.",
      blockedClaims: shareGuard.blockedClaims,
      authorityBoundary: shareGuard.boundary
    }),
    control({
      id: "protected-aal2-proof",
      label: "Protected AAL2 proof",
      state: aal2Readiness.strictAttemptReady ? "human-review-required" : "operator-required",
      sourceRoute: "/qa-aal2-run-evidence",
      sourceApiRoute: aal2Readiness.routes.api,
      sourceHash: sourceHash(`${aal2Readiness.status}:${aal2Readiness.strictAttemptReady}:${aal2Readiness.protectedHumanRunRequired}`),
      evidence:
        `Strict protected smoke ready: ${aal2Readiness.strictAttemptReady}; human run required: ${aal2Readiness.protectedHumanRunRequired}.`,
      requiredControl:
        "Use only a fresh authorized human AAL2 session for strict protected proof and never retain token values.",
      nextAction:
        "Run strict protected smoke only when the target feature flag and authorized tenant role are present.",
      blockedClaims,
      authorityBoundary: aal2Readiness.boundary
    })
  ];
}

function decisionForControls(controls: ReleaseAuthorizationChainControl[]): ReleaseAuthorizationChainDecision {
  if (controls.some((item) => item.state === "blocked-by-design")) return "blocked-by-design";
  if (controls.some((item) => item.state === "operator-required")) return "operator-required";
  if (controls.some((item) => item.state === "external-review-required")) return "external-review-required";
  if (controls.some((item) => item.state === "human-review-required")) return "human-review-required";
  return "metadata-ready-internal-review";
}

function weakestLinkForControls(controls: ReleaseAuthorizationChainControl[]) {
  const priority: ReleaseAuthorizationChainControlState[] = [
    "blocked-by-design",
    "operator-required",
    "external-review-required",
    "human-review-required",
    "passed-no-secret"
  ];

  for (const state of priority) {
    const match = controls.find((item) => item.state === state);
    if (match) return `${match.id}:${match.state}`;
  }

  return "no-controls";
}

export function getReleaseAuthorizationChainSummary(): ReleaseAuthorizationChainSummary {
  const controls = buildControls();
  const passedNoSecretCount = controls.filter((item) => item.state === "passed-no-secret").length;
  const humanReviewRequiredCount = controls.filter(
    (item) => item.state === "human-review-required"
  ).length;
  const operatorRequiredCount = controls.filter((item) => item.state === "operator-required").length;
  const externalReviewRequiredCount = controls.filter(
    (item) => item.state === "external-review-required"
  ).length;
  const blockedByDesignCount = controls.filter((item) => item.state === "blocked-by-design").length;

  return {
    service: "scrimed-release-authorization-chain",
    status: releaseAuthorizationChainStatus,
    route: releaseAuthorizationChainRoute,
    apiRoute: releaseAuthorizationChainApiRoute,
    briefRoute: releaseAuthorizationChainBriefRoute,
    generatedAt: "static-no-secret-release-authorization-chain",
    noPhiConfirmed: true,
    tokenMaterialCaptured: false,
    productionApproval: false,
    safeUseLabel: "no-secret-metadata-chain-not-release-approval",
    chainDecision: decisionForControls(controls),
    weakestLink: weakestLinkForControls(controls),
    buyerDiligenceMetadataLane: "available-after-release-steward-review",
    protectedProofLane: "blocked-until-human-aal2",
    publicDistributionAuthority: "not-authorized",
    customerSpecificAuthority: "not-authorized-without-customer-permission",
    releaseAuthority: "not-release-approval",
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    securityCertification: "not-security-certified",
    authorizationHash: authorizationHash({
      status: releaseAuthorizationChainStatus,
      controls: controls.map((item) => ({
        id: item.id,
        state: item.state,
        sourceHash: item.sourceHash
      }))
    }),
    controlCount: controls.length,
    passedNoSecretCount,
    humanReviewRequiredCount,
    operatorRequiredCount,
    externalReviewRequiredCount,
    blockedByDesignCount,
    controls,
    requiredBeforeExternalReference,
    blockedClaims,
    boundary: releaseAuthorizationChainBoundary
  };
}

export function buildReleaseAuthorizationChainBrief() {
  const summary = getReleaseAuthorizationChainSummary();

  return [
    "# SCRIMED Release Authorization Chain",
    "",
    `Status: ${summary.status}`,
    `Decision: ${summary.chainDecision}`,
    `Weakest link: ${summary.weakestLink}`,
    `Safe use: ${summary.safeUseLabel}`,
    `Authorization hash: ${summary.authorizationHash}`,
    `Buyer diligence metadata lane: ${summary.buyerDiligenceMetadataLane}`,
    `Protected proof lane: ${summary.protectedProofLane}`,
    `Public distribution authority: ${summary.publicDistributionAuthority}`,
    `Release authority: ${summary.releaseAuthority}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `PHI authority: ${summary.phiAuthority}`,
    `Security certification: ${summary.securityCertification}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This chain is not release approval, public distribution approval, customer authorization, security certification, HIPAA certification, FDA clearance, ONC certification, PHI processing approval, production connector approval, customer go-live approval, or live clinical care authorization.",
    "",
    "## Control Counts",
    `- Controls: ${summary.controlCount}`,
    `- Passed no-secret: ${summary.passedNoSecretCount}`,
    `- Human review required: ${summary.humanReviewRequiredCount}`,
    `- Operator required: ${summary.operatorRequiredCount}`,
    `- External review required: ${summary.externalReviewRequiredCount}`,
    `- Blocked by design: ${summary.blockedByDesignCount}`,
    "",
    "## Controls",
    ...summary.controls.map(
      (item) =>
        `- ${item.label} (${item.state}): ${item.evidence} Source: ${item.sourceApiRoute}. Next: ${item.nextAction}`
    ),
    "",
    "## Required Before External Reference",
    ...summary.requiredBeforeExternalReference.map((item) => `- ${item}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
