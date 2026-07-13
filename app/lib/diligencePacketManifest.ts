import {
  boundaryReleaseEvidenceIntakeBoundary,
  boundaryReleaseEvidenceIntakePacketProofStackStatus,
  boundaryReleaseEvidenceIntakeReleaseAuthority,
  boundaryReleaseEvidenceIntakeStatus,
  boundaryReleaseEvidenceIntakeStorageAuthority
} from "./boundaryReleaseEvidenceIntake";
import { getClinicalRobustnessLabSummary } from "./clinicalRobustnessLab";
import { getDiligenceReleaseGateSummary } from "./diligenceReleaseGate";
import { getEnterpriseRiskRegisterSummary } from "./enterpriseRiskRegister";
import { getExecutionAttemptDurableStoreSummary } from "./executionAttemptDurableStore";
import { getExecutionAttemptEnvelopeSummary } from "./executionAttemptEnvelope";
import { getProductReadinessRegistrySummary } from "./productReadinessRegistry";
import { getQaAal2SmokeReadinessPacket } from "./qaAal2RunEvidence";
import { getReleaseEvidenceLedgerSummary } from "./releaseEvidenceLedger";
import { getReleaseEvidencePromotionSummary } from "./releaseEvidencePromotion";

export type DiligencePacketShareability =
  | "include-no-secret-metadata"
  | "include-summary-only"
  | "withhold-until-human-aal2"
  | "withhold-until-qualified-review";

export type DiligencePacketManifestItem = {
  id: string;
  label: string;
  packetSection:
    | "executive-snapshot"
    | "synthetic-clinical-readiness"
    | "audit-and-durability"
    | "release-evidence"
    | "risk-and-products"
    | "blocked-authority";
  sourceRoute: string;
  apiRoute: string;
  status: string;
  shareability: DiligencePacketShareability;
  goNoGo: "go-no-secret" | "review-required" | "no-go";
  reviewerOwner: string;
  allowedFields: string[];
  withheldMaterial: string[];
  safetyBoundary: string;
  nextAction: string;
};

export type DiligencePacketManifestSummary = {
  service: "scrimed-diligence-packet-manifest";
  status: typeof diligencePacketManifestStatus;
  route: typeof diligencePacketManifestRoute;
  apiRoute: typeof diligencePacketManifestApiRoute;
  briefRoute: typeof diligencePacketManifestBriefRoute;
  generatedAt: "static-no-secret-diligence-packet-manifest";
  manifestHash: string;
  noPhiConfirmed: true;
  tokenMaterialCaptured: false;
  productionApproval: false;
  packetUseAuthority: "no-secret-buyer-investor-diligence-only";
  publicDistributionAuthority: "not-authorized";
  clinicalCareAuthority: "not-authorized-live-care";
  phiAuthority: "not-authorized-production-phi";
  securityCertification: "not-security-certified";
  itemCount: number;
  includeNoSecretCount: number;
  summaryOnlyCount: number;
  withholdUntilHumanAal2Count: number;
  withholdUntilQualifiedReviewCount: number;
  noGoCount: number;
  items: DiligencePacketManifestItem[];
  allowedClaims: string[];
  blockedClaims: string[];
  requiredReviewerRoles: string[];
  packetAssemblyRules: string[];
  boundary: typeof diligencePacketManifestBoundary;
};

export const diligencePacketManifestStatus =
  "diligence-packet-manifest-active-no-secret";
export const diligencePacketManifestRoute =
  "/release-continuity#diligence-packet-manifest";
export const diligencePacketManifestApiRoute =
  "/api/release-continuity/diligence-packet-manifest";
export const diligencePacketManifestBriefRoute =
  "/api/release-continuity/diligence-packet-manifest/brief";

export const diligencePacketManifestBoundary =
  "SCRIMED Diligence Packet Manifest assembles no-secret buyer and investor diligence metadata only. It does not store PHI, bearer tokens, Supabase secrets, service-role keys, raw logs, customer data, production connector payloads, certification proof, release approval, public distribution approval, or live clinical authority.";

const allowedFields = [
  "service name",
  "status",
  "public route",
  "API route",
  "brief route",
  "evidence hash",
  "GO/NO-GO state",
  "review owner",
  "blocked claims",
  "safe next action",
  "no-secret boundary"
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
  "security certification reports",
  "unreviewed public claims"
];

const allowedClaims = [
  "SCRIMED can provide no-secret synthetic diligence metadata for buyer and investor review.",
  "SCRIMED separates metadata-safe evidence from protected AAL2 proof blockers and qualified-review blockers.",
  "SCRIMED preserves NO-GO boundaries for PHI, live clinical care, public distribution, certification, production connector approval, and customer go-live."
];

const blockedClaims = [
  "diligence packet is production approval",
  "public distribution approved",
  "PHI processing authorized",
  "live clinical care authorized",
  "strict AAL2 protected proof retained",
  "HIPAA, SOC 2, HITRUST, FDA, ONC, security, or clinical validation completed",
  "boundary release approved",
  "production connector approved",
  "payer submission or reimbursement certainty approved",
  "customer go-live approved"
];

const requiredReviewerRoles = [
  "release steward",
  "claim guard reviewer",
  "security/privacy reviewer before security or PHI claims",
  "clinical/regulatory reviewer before clinical claims",
  "legal/reimbursement reviewer before payer, financial, or regional claims",
  "buyer authorization owner before customer-specific distribution"
];

const packetAssemblyRules = [
  "Include no-secret metadata only: status, routes, evidence hashes, safe-use labels, review owners, and blocked claims.",
  "Attach Diligence Release Gate state before any buyer or investor packet is shared.",
  "Withhold strict AAL2 proof claims until retained protected packet metadata exists.",
  "List protected packet routes as withheld artifacts until an approved human AAL2 operator and release steward review the packet audit metadata.",
  "Withhold public distribution, certification, PHI, clinical, connector, reimbursement, and customer go-live claims until qualified review.",
  "Never paste bearer tokens, JWTs, Supabase secrets, service-role credentials, PHI, customer payloads, or raw logs into a diligence packet."
];

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function manifestHash(payload: unknown) {
  const serialized = stableSerialize(payload);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `diligence-manifest-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function manifestItem(input: DiligencePacketManifestItem): DiligencePacketManifestItem {
  return input;
}

function buildManifestItems(): DiligencePacketManifestItem[] {
  const aal2Readiness = getQaAal2SmokeReadinessPacket();
  const clinical = getClinicalRobustnessLabSummary();
  const envelope = getExecutionAttemptEnvelopeSummary();
  const durableStore = getExecutionAttemptDurableStoreSummary();
  const gate = getDiligenceReleaseGateSummary();
  const ledger = getReleaseEvidenceLedgerSummary();
  const promotion = getReleaseEvidencePromotionSummary();
  const products = getProductReadinessRegistrySummary();
  const risks = getEnterpriseRiskRegisterSummary();

  return [
    manifestItem({
      id: "enterprise-diligence-snapshot",
      label: "Enterprise diligence snapshot",
      packetSection: "executive-snapshot",
      sourceRoute: "/investor-readiness",
      apiRoute: "/api/investor-readiness/status",
      status: "synthetic-demo-ready",
      shareability: "include-no-secret-metadata",
      goNoGo: "go-no-secret",
      reviewerOwner: "release steward",
      allowedFields,
      withheldMaterial,
      safetyBoundary:
        "Use only current-state synthetic/no-PHI readiness language; do not imply investment advice, customer approval, certification, or production authority.",
      nextAction: "Attach the Enterprise Diligence Snapshot JSON and current NO-GO boundaries."
    }),
    manifestItem({
      id: "diligence-release-gate",
      label: "Diligence Release Gate",
      packetSection: "executive-snapshot",
      sourceRoute: gate.route,
      apiRoute: gate.apiRoute,
      status: gate.status,
      shareability: "include-no-secret-metadata",
      goNoGo: "go-no-secret",
      reviewerOwner: "release steward + claim guard reviewer",
      allowedFields,
      withheldMaterial,
      safetyBoundary: gate.boundary,
      nextAction: "Attach GO/NO-GO gate cards before any buyer or investor distribution."
    }),
    manifestItem({
      id: "clinical-robustness-lab",
      label: "Clinical Robustness Lab",
      packetSection: "synthetic-clinical-readiness",
      sourceRoute: "/clinical-robustness-lab",
      apiRoute: "/api/clinical-robustness-lab",
      status: clinical.status,
      shareability: "include-summary-only",
      goNoGo: "go-no-secret",
      reviewerOwner: "clinical safety reviewer",
      allowedFields,
      withheldMaterial,
      safetyBoundary: clinical.useNotice,
      nextAction: "Share synthetic scenario counts and use notice only; do not claim clinical validation."
    }),
    manifestItem({
      id: "execution-attempt-envelope",
      label: "Execution Attempt Envelope",
      packetSection: "audit-and-durability",
      sourceRoute: envelope.route,
      apiRoute: envelope.apiRoute,
      status: envelope.status,
      shareability: "include-no-secret-metadata",
      goNoGo: "go-no-secret",
      reviewerOwner: "platform audit reviewer",
      allowedFields,
      withheldMaterial,
      safetyBoundary:
        "Execution envelope metadata is no-PHI and does not include raw chart text, patient identifiers, connector payloads, secrets, or credentials.",
      nextAction: "Attach envelope audit counts and evidence envelope route."
    }),
    manifestItem({
      id: "execution-attempt-durable-store",
      label: "Execution Attempt Durable Store",
      packetSection: "audit-and-durability",
      sourceRoute: durableStore.route,
      apiRoute: durableStore.apiRoute,
      status: durableStore.status,
      shareability: "include-no-secret-metadata",
      goNoGo: "go-no-secret",
      reviewerOwner: "platform audit reviewer",
      allowedFields,
      withheldMaterial,
      safetyBoundary:
        "Durable-store source contract evidence is metadata-only; protected writes still require AAL2 and target enablement.",
      nextAction: "Attach durable-store source contract status and protected-write boundary."
    }),
    manifestItem({
      id: "release-evidence-ledger",
      label: "Release Evidence Ledger",
      packetSection: "release-evidence",
      sourceRoute: ledger.route,
      apiRoute: ledger.apiRoute,
      status: ledger.status,
      shareability: "include-no-secret-metadata",
      goNoGo: "go-no-secret",
      reviewerOwner: "release steward",
      allowedFields,
      withheldMaterial,
      safetyBoundary: ledger.boundary,
      nextAction: "Attach ledger entry counts, deterministic evidence hashes, and blocked claims."
    }),
    manifestItem({
      id: "release-evidence-promotion",
      label: "Release Evidence Promotion Queue",
      packetSection: "release-evidence",
      sourceRoute: promotion.route,
      apiRoute: promotion.apiRoute,
      status: promotion.status,
      shareability: "include-no-secret-metadata",
      goNoGo: "go-no-secret",
      reviewerOwner: "release steward + claim guard reviewer",
      allowedFields,
      withheldMaterial,
      safetyBoundary: promotion.boundary,
      nextAction: "Attach lane counts and list withheld operator-proof and external-review blockers."
    }),
    manifestItem({
      id: "aal2-smoke-readiness",
      label: "AAL2 Smoke Readiness",
      packetSection: "release-evidence",
      sourceRoute: "/qa-aal2-run-evidence",
      apiRoute: aal2Readiness.routes.api,
      status: aal2Readiness.status,
      shareability: "withhold-until-human-aal2",
      goNoGo: "no-go",
      reviewerOwner: "approved AAL2 operator",
      allowedFields,
      withheldMaterial,
      safetyBoundary: aal2Readiness.boundary,
      nextAction: "Share readiness preflight only; withhold strict proof claims until retained protected packet metadata exists."
    }),
    manifestItem({
      id: "protected-boundary-release-evidence-intake-packet",
      label: "Protected Boundary Release Evidence Intake Packet",
      packetSection: "release-evidence",
      sourceRoute: "/pilot-workspace/access#boundary-release-evidence-intake",
      apiRoute: "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet",
      status: boundaryReleaseEvidenceIntakePacketProofStackStatus,
      shareability: "withhold-until-human-aal2",
      goNoGo: "no-go",
      reviewerOwner: "approved AAL2 operator + release steward",
      allowedFields: [
        ...allowedFields,
        "protected packet route",
        "packet proof-stack status",
        "storage authority",
        "release authority"
      ],
      withheldMaterial,
      safetyBoundary: `${boundaryReleaseEvidenceIntakeBoundary} Packet status: ${boundaryReleaseEvidenceIntakeStatus}. Storage authority: ${boundaryReleaseEvidenceIntakeStorageAuthority}. Release authority: ${boundaryReleaseEvidenceIntakeReleaseAuthority}.`,
      nextAction:
        "Run the protected packet route only inside an approved AAL2 session, retain audit metadata, and keep boundary-release claims blocked until qualified external review."
    }),
    manifestItem({
      id: "product-readiness-registry",
      label: "Product Readiness Registry",
      packetSection: "risk-and-products",
      sourceRoute: "/product",
      apiRoute: products.apiRoute,
      status: products.status,
      shareability: "include-summary-only",
      goNoGo: "go-no-secret",
      reviewerOwner: "product owner",
      allowedFields,
      withheldMaterial,
      safetyBoundary:
        "Product readiness stages are planning and diligence metadata; blocked production modes remain blocked until formal activation.",
      nextAction: "Attach product counts, stage counts, and blocked production modes."
    }),
    manifestItem({
      id: "enterprise-risk-register",
      label: "Enterprise Risk Register",
      packetSection: "risk-and-products",
      sourceRoute: risks.route,
      apiRoute: risks.apiRoute,
      status: risks.status,
      shareability: "include-summary-only",
      goNoGo: "review-required",
      reviewerOwner: "security/privacy/compliance reviewer",
      allowedFields,
      withheldMaterial,
      safetyBoundary:
        "Risk register material is not approval, certification, legal advice, security attestation, or clinical validation.",
      nextAction: "Attach risk counts and mitigations, then route high-risk claims to qualified review."
    }),
    manifestItem({
      id: "qualified-external-approval-claims",
      label: "Qualified External Approval Claims",
      packetSection: "blocked-authority",
      sourceRoute: "/approvals-readiness",
      apiRoute: "/api/global-certification-readiness",
      status: "external-review-required",
      shareability: "withhold-until-qualified-review",
      goNoGo: "no-go",
      reviewerOwner: "legal/privacy/security/clinical/regulatory reviewers",
      allowedFields,
      withheldMaterial,
      safetyBoundary:
        "No internal release artifact can create legal, privacy, security, certification, regulatory, reimbursement, connector, customer go-live, or clinical authority.",
      nextAction: "Withhold external approval claims until qualified evidence and reviewer signoff exist."
    })
  ];
}

export function getDiligencePacketManifestSummary(): DiligencePacketManifestSummary {
  const items = buildManifestItems();

  return {
    service: "scrimed-diligence-packet-manifest",
    status: diligencePacketManifestStatus,
    route: diligencePacketManifestRoute,
    apiRoute: diligencePacketManifestApiRoute,
    briefRoute: diligencePacketManifestBriefRoute,
    generatedAt: "static-no-secret-diligence-packet-manifest",
    manifestHash: manifestHash({
      status: diligencePacketManifestStatus,
      items: items.map((item) => ({
        id: item.id,
        status: item.status,
        shareability: item.shareability,
        goNoGo: item.goNoGo,
        apiRoute: item.apiRoute
      }))
    }),
    noPhiConfirmed: true,
    tokenMaterialCaptured: false,
    productionApproval: false,
    packetUseAuthority: "no-secret-buyer-investor-diligence-only",
    publicDistributionAuthority: "not-authorized",
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    securityCertification: "not-security-certified",
    itemCount: items.length,
    includeNoSecretCount: items.filter((item) => item.shareability === "include-no-secret-metadata").length,
    summaryOnlyCount: items.filter((item) => item.shareability === "include-summary-only").length,
    withholdUntilHumanAal2Count: items.filter((item) => item.shareability === "withhold-until-human-aal2").length,
    withholdUntilQualifiedReviewCount: items.filter((item) => item.shareability === "withhold-until-qualified-review").length,
    noGoCount: items.filter((item) => item.goNoGo === "no-go").length,
    items,
    allowedClaims,
    blockedClaims,
    requiredReviewerRoles,
    packetAssemblyRules,
    boundary: diligencePacketManifestBoundary
  };
}

export function buildDiligencePacketManifestBrief() {
  const summary = getDiligencePacketManifestSummary();

  return [
    "# SCRIMED Diligence Packet Manifest",
    "",
    `Status: ${summary.status}`,
    `Generated: ${summary.generatedAt}`,
    `Manifest hash: ${summary.manifestHash}`,
    `Packet use authority: ${summary.packetUseAuthority}`,
    `Public distribution authority: ${summary.publicDistributionAuthority}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `PHI authority: ${summary.phiAuthority}`,
    `Production approval: ${summary.productionApproval}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Manifest Items",
    ...summary.items.map(
      (item) =>
        `- ${item.label} (${item.shareability}; ${item.goNoGo}): ${item.status}. API: ${item.apiRoute}. Reviewer: ${item.reviewerOwner}. Next: ${item.nextAction}`
    ),
    "",
    "## Packet Assembly Rules",
    ...summary.packetAssemblyRules.map((rule) => `- ${rule}`),
    "",
    "## Required Reviewer Roles",
    ...summary.requiredReviewerRoles.map((role) => `- ${role}`),
    "",
    "## Allowed Claims",
    ...summary.allowedClaims.map((claim) => `- ${claim}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
