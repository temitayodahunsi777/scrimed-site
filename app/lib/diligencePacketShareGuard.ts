import {
  boundaryReleaseEvidenceIntakePacketProofStackStatus,
  boundaryReleaseEvidenceIntakeReleaseAuthority,
  boundaryReleaseEvidenceIntakeStorageAuthority
} from "./boundaryReleaseEvidenceIntake";
import { getDiligencePacketManifestSummary } from "./diligencePacketManifest";
import { getDiligenceReleaseGateSummary } from "./diligenceReleaseGate";
import { getReleaseEvidencePromotionSummary } from "./releaseEvidencePromotion";

export type DiligencePacketRecipientClass =
  | "internal-release-steward"
  | "qualified-investor-or-buyer-under-review"
  | "customer-specific-recipient"
  | "public-or-press"
  | "clinical-production-reviewer"
  | "security-certification-reviewer";

export type DiligencePacketShareDecision =
  | "allow-internal-no-secret"
  | "review-required-protected-diligence"
  | "withhold-until-customer-authorization"
  | "withhold-until-qualified-review"
  | "no-go";

export type DiligencePacketShareGuardCard = {
  id: string;
  artifactId?: string;
  protectedPacketRoute?: string;
  recipientClass: DiligencePacketRecipientClass;
  decision: DiligencePacketShareDecision;
  allowedPayload: string[];
  withheldPayload: string[];
  requiredReviewer: string;
  requiredControl: string;
  blockedClaims: string[];
  nextAction: string;
  safetyBoundary: string;
};

export type DiligencePacketShareGuardSummary = {
  service: "scrimed-diligence-packet-share-guard";
  status: typeof diligencePacketShareGuardStatus;
  route: typeof diligencePacketShareGuardRoute;
  apiRoute: typeof diligencePacketShareGuardApiRoute;
  briefRoute: typeof diligencePacketShareGuardBriefRoute;
  generatedAt: "static-no-secret-diligence-share-guard";
  noPhiConfirmed: true;
  tokenMaterialCaptured: false;
  productionApproval: false;
  publicDistributionAuthority: "not-authorized";
  externalShareAuthority: "protected-diligence-only-after-human-review";
  recipientAuthorizationAuthority: "recipient-specific-human-approval-required";
  customerSpecificAuthority: "not-authorized-without-customer-permission";
  securityCertification: "not-security-certified";
  clinicalCareAuthority: "not-authorized-live-care";
  phiAuthority: "not-authorized-production-phi";
  cardCount: number;
  noGoCount: number;
  reviewRequiredCount: number;
  internalAllowCount: number;
  guardHash: string;
  cards: DiligencePacketShareGuardCard[];
  requiredControls: string[];
  allowedClaims: string[];
  blockedClaims: string[];
  shareInstructions: string[];
  boundary: typeof diligencePacketShareGuardBoundary;
};

export const diligencePacketShareGuardStatus =
  "diligence-packet-share-guard-active-human-gated";
export const diligencePacketShareGuardRoute =
  "/release-continuity#diligence-packet-share-guard";
export const diligencePacketShareGuardApiRoute =
  "/api/release-continuity/diligence-packet-share-guard";
export const diligencePacketShareGuardBriefRoute =
  "/api/release-continuity/diligence-packet-share-guard/brief";

export const diligencePacketShareGuardBoundary =
  "SCRIMED Diligence Packet Share Guard is a no-secret recipient and distribution control. It does not share packets, send emails, create calendar invites, approve public distribution, authorize PHI, certify security or compliance, approve production release, approve customer go-live, or authorize live clinical care.";

const noSecretPayload = [
  "artifact label",
  "status",
  "route",
  "API route",
  "brief route",
  "deterministic evidence hash",
  "review owner",
  "safe next action",
  "blocked claims",
  "no-secret boundary"
];

const withheldPayload = [
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
  "unreviewed certification claims",
  "customer-specific release artifacts",
  "protected AAL2 proof claims without retained packet metadata",
  "protected boundary-release evidence intake packet body"
];

const requiredControls = [
  "Release steward selects the recipient class before any packet is referenced externally.",
  "Claim Guard reviews all buyer, investor, public, clinical, security, PHI, certification, and customer-go-live language.",
  "Recipient-specific customer authorization is required before any customer-named packet or buyer-specific artifact leaves SCRIMED.",
  "Protected AAL2 proof may be referenced only after retained no-secret protected packet metadata exists.",
  "Protected Boundary Release Evidence Intake Packet references require a fresh human AAL2 session, retained audit metadata, release-steward review, and qualified external review before any boundary-release language is considered.",
  "Public or press distribution remains blocked until qualified legal, privacy, security, clinical, and release review approve the exact language."
];

const allowedClaims = [
  "SCRIMED can internally prepare no-secret diligence packet metadata for review.",
  "SCRIMED can share no-secret diligence metadata with qualified buyers or investors only after human review and recipient scoping.",
  "SCRIMED explicitly withholds public, customer-specific, PHI, clinical, certification, production, connector, and go-live claims until qualified authorization exists."
];

const blockedClaims = [
  "packet share guard is public distribution approval",
  "packet share guard is production approval",
  "recipient is authorized without human review",
  "customer-specific distribution approved",
  "PHI processing authorized",
  "live clinical care authorized",
  "security or compliance certified",
  "strict AAL2 proof retained",
  "protected boundary-release packet is public-shareable",
  "boundary release approved",
  "production connector approved",
  "customer go-live approved"
];

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function guardHash(payload: unknown) {
  const serialized = stableSerialize(payload);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `diligence-share-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function shareCard(input: DiligencePacketShareGuardCard): DiligencePacketShareGuardCard {
  return input;
}

function buildShareGuardCards(): DiligencePacketShareGuardCard[] {
  const manifest = getDiligencePacketManifestSummary();
  const releaseGate = getDiligenceReleaseGateSummary();
  const promotion = getReleaseEvidencePromotionSummary();

  return [
    shareCard({
      id: "internal-release-steward-review",
      recipientClass: "internal-release-steward",
      decision: "allow-internal-no-secret",
      allowedPayload: noSecretPayload,
      withheldPayload,
      requiredReviewer: "release steward",
      requiredControl:
        "Internal review may inspect no-secret metadata, manifest rules, gate cards, and blocked claims.",
      blockedClaims,
      nextAction:
        "Use the manifest hash and release gate state to prepare a draft packet for human review.",
      safetyBoundary: manifest.boundary
    }),
    shareCard({
      id: "qualified-buyer-investor-review",
      recipientClass: "qualified-investor-or-buyer-under-review",
      decision: "review-required-protected-diligence",
      allowedPayload: noSecretPayload,
      withheldPayload,
      requiredReviewer: "release steward + claim guard reviewer",
      requiredControl:
        "Recipient scope, purpose, no-secret payload, and blocked-claim language must be reviewed before any buyer or investor diligence packet is shared.",
      blockedClaims,
      nextAction:
        "Share only reviewed metadata-safe packet sections through a protected diligence lane; do not send public links or unreviewed claims.",
      safetyBoundary: releaseGate.boundary
    }),
    shareCard({
      id: "protected-boundary-release-evidence-intake-packet-sharing",
      artifactId: "protected-boundary-release-evidence-intake-packet",
      protectedPacketRoute: "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet",
      recipientClass: "qualified-investor-or-buyer-under-review",
      decision: "withhold-until-qualified-review",
      allowedPayload: [
        "artifact label",
        "protected packet route",
        "proof-stack status",
        "storage authority",
        "release authority",
        "blocked claims",
        "safe next action"
      ],
      withheldPayload,
      requiredReviewer:
        "approved AAL2 operator + release steward + qualified legal/privacy/security reviewer",
      requiredControl:
        "Only route metadata may appear in no-secret diligence materials until a human AAL2 packet run, retained audit metadata, release-steward review, and qualified external review are complete.",
      blockedClaims,
      nextAction:
        "Reference the protected packet route as withheld evidence only; do not share packet bodies or claim boundary-release approval.",
      safetyBoundary:
        `Protected packet route is ${boundaryReleaseEvidenceIntakePacketProofStackStatus}; storage authority is ${boundaryReleaseEvidenceIntakeStorageAuthority}; release authority is ${boundaryReleaseEvidenceIntakeReleaseAuthority}.`
    }),
    shareCard({
      id: "customer-specific-recipient",
      recipientClass: "customer-specific-recipient",
      decision: "withhold-until-customer-authorization",
      allowedPayload: noSecretPayload,
      withheldPayload,
      requiredReviewer: "buyer authorization owner + legal/privacy reviewer",
      requiredControl:
        "Customer-specific distribution requires named recipient authorization, customer permission, access logging, and release decision evidence.",
      blockedClaims,
      nextAction:
        "Route the request to protected buyer release control before referencing any customer-specific packet.",
      safetyBoundary:
        "Customer-specific packets require customer permission and do not authorize PHI, connector access, clinical production, or go-live."
    }),
    shareCard({
      id: "public-press-distribution",
      recipientClass: "public-or-press",
      decision: "no-go",
      allowedPayload: [],
      withheldPayload,
      requiredReviewer: "qualified legal/privacy/security/clinical/release reviewers",
      requiredControl:
        "Public or press distribution remains blocked until qualified review approves exact language and public release authority.",
      blockedClaims,
      nextAction:
        "Do not publish diligence packets, retained proof claims, security claims, certification claims, or customer-specific material.",
      safetyBoundary:
        "Public distribution cannot be created by release evidence, internal review, model output, smoke tests, or packet metadata."
    }),
    shareCard({
      id: "clinical-production-reviewer",
      recipientClass: "clinical-production-reviewer",
      decision: "withhold-until-qualified-review",
      allowedPayload: ["synthetic use notice", "clinical robustness scenario counts", "human review requirement"],
      withheldPayload,
      requiredReviewer: "clinical governance + regulatory reviewer",
      requiredControl:
        "Clinical claims require qualified clinical and regulatory review; synthetic readiness cannot be presented as clinical validation.",
      blockedClaims,
      nextAction:
        "Share research/demo-only synthetic readiness language and preserve no diagnosis, treatment, prescribing, or live patient-care authority.",
      safetyBoundary:
        "Clinical production review is not diagnosis, treatment, prescribing, clinical validation, or live-care approval."
    }),
    shareCard({
      id: "security-certification-reviewer",
      recipientClass: "security-certification-reviewer",
      decision: "withhold-until-qualified-review",
      allowedPayload: ["no-secret control list", "boundary headers", "fail-closed smoke status", "open security-review blockers"],
      withheldPayload,
      requiredReviewer: "qualified security/privacy reviewer",
      requiredControl:
        "Security and compliance claims require qualified review; no SOC, HIPAA, HITRUST, FDA, ONC, or security certification may be claimed from internal evidence.",
      blockedClaims,
      nextAction:
        "Share current control posture and blocked claims only; withhold certification, audit, and attestation language.",
      safetyBoundary: promotion.boundary
    })
  ];
}

export function getDiligencePacketShareGuardSummary(): DiligencePacketShareGuardSummary {
  const cards = buildShareGuardCards();

  return {
    service: "scrimed-diligence-packet-share-guard",
    status: diligencePacketShareGuardStatus,
    route: diligencePacketShareGuardRoute,
    apiRoute: diligencePacketShareGuardApiRoute,
    briefRoute: diligencePacketShareGuardBriefRoute,
    generatedAt: "static-no-secret-diligence-share-guard",
    noPhiConfirmed: true,
    tokenMaterialCaptured: false,
    productionApproval: false,
    publicDistributionAuthority: "not-authorized",
    externalShareAuthority: "protected-diligence-only-after-human-review",
    recipientAuthorizationAuthority: "recipient-specific-human-approval-required",
    customerSpecificAuthority: "not-authorized-without-customer-permission",
    securityCertification: "not-security-certified",
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    cardCount: cards.length,
    noGoCount: cards.filter((card) => card.decision === "no-go").length,
    reviewRequiredCount: cards.filter((card) =>
      [
        "review-required-protected-diligence",
        "withhold-until-customer-authorization",
        "withhold-until-qualified-review"
      ].includes(card.decision)
    ).length,
    internalAllowCount: cards.filter((card) => card.decision === "allow-internal-no-secret").length,
    guardHash: guardHash({
      status: diligencePacketShareGuardStatus,
      cards: cards.map((card) => ({
        id: card.id,
        artifactId: card.artifactId,
        protectedPacketRoute: card.protectedPacketRoute,
        recipientClass: card.recipientClass,
        decision: card.decision,
        requiredReviewer: card.requiredReviewer
      }))
    }),
    cards,
    requiredControls,
    allowedClaims,
    blockedClaims,
    shareInstructions: [
      "Start with the Diligence Packet Manifest and Diligence Release Gate.",
      "Select one recipient class and apply the matching share decision.",
      "Share only allowed no-secret fields after human review; never share withheld material.",
      "Treat protected Boundary Release Evidence Intake Packet route metadata as withheld evidence until approved human AAL2 and qualified review evidence exists.",
      "Keep public, customer-specific, PHI, clinical, certification, production, connector, and go-live claims blocked until qualified authorization exists."
    ],
    boundary: diligencePacketShareGuardBoundary
  };
}

export function buildDiligencePacketShareGuardBrief() {
  const summary = getDiligencePacketShareGuardSummary();

  return [
    "# SCRIMED Diligence Packet Share Guard",
    "",
    `Status: ${summary.status}`,
    `Generated: ${summary.generatedAt}`,
    `Guard hash: ${summary.guardHash}`,
    `External share authority: ${summary.externalShareAuthority}`,
    `Recipient authorization: ${summary.recipientAuthorizationAuthority}`,
    `Public distribution authority: ${summary.publicDistributionAuthority}`,
    `Customer-specific authority: ${summary.customerSpecificAuthority}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `PHI authority: ${summary.phiAuthority}`,
    `Production approval: ${summary.productionApproval}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Share Decisions",
    ...summary.cards.map(
      (card) =>
        `- ${card.id} (${card.recipientClass}; ${card.decision}): ${card.protectedPacketRoute ? `route ${card.protectedPacketRoute}. ` : ""}reviewer ${card.requiredReviewer}. Control: ${card.requiredControl} Next: ${card.nextAction}`
    ),
    "",
    "## Required Controls",
    ...summary.requiredControls.map((control) => `- ${control}`),
    "",
    "## Share Instructions",
    ...summary.shareInstructions.map((instruction) => `- ${instruction}`),
    "",
    "## Allowed Claims",
    ...summary.allowedClaims.map((claim) => `- ${claim}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
