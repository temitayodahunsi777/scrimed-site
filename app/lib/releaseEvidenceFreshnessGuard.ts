import {
  getReleaseEvidenceLedgerSummary,
  type ReleaseEvidenceLedgerEntry
} from "./releaseEvidenceLedger";
import { getReleaseEvidencePromotionSummary } from "./releaseEvidencePromotion";

export type ReleaseEvidenceFreshnessStatus =
  | "fresh-for-internal-readiness"
  | "refresh-required-before-external-sharing"
  | "blocked-until-human-aal2-refresh"
  | "blocked-until-qualified-review-refresh";

export type ReleaseEvidenceFreshnessGuardCard = {
  id: string;
  sourceEntryId: string;
  label: string;
  command: string;
  artifactRoute: string;
  evidenceHash: string;
  evidenceType: ReleaseEvidenceLedgerEntry["evidenceType"];
  sourceStatus: ReleaseEvidenceLedgerEntry["status"];
  freshnessStatus: ReleaseEvidenceFreshnessStatus;
  maxAgeHours: number | null;
  internalUseAuthority: string;
  externalUseAuthority: string;
  refreshTrigger: string;
  requiredReviewer: string;
  blockedClaims: string[];
  safetyBoundary: string;
};

export type ReleaseEvidenceFreshnessGuardSummary = {
  service: "scrimed-release-evidence-freshness-guard";
  status: typeof releaseEvidenceFreshnessGuardStatus;
  route: typeof releaseEvidenceFreshnessGuardRoute;
  apiRoute: typeof releaseEvidenceFreshnessGuardApiRoute;
  briefRoute: typeof releaseEvidenceFreshnessGuardBriefRoute;
  generatedAt: "static-no-secret-freshness-policy";
  noPhiConfirmed: true;
  tokenMaterialCaptured: false;
  productionApproval: false;
  clinicalCareAuthority: "not-authorized-live-care";
  phiAuthority: "not-authorized-production-phi";
  releaseAuthority: "not-release-approval";
  securityCertification: "not-security-certified";
  freshnessAuthority: "fresh-rerun-required-before-external-use";
  publicDistributionAuthority: "not-authorized";
  customerSpecificAuthority: "not-authorized-without-customer-permission";
  sourceLedgerStatus: string;
  sourcePromotionStatus: string;
  cardCount: number;
  internalFreshCount: number;
  refreshRequiredCount: number;
  humanAal2RefreshCount: number;
  qualifiedReviewRefreshCount: number;
  freshnessHash: string;
  cards: ReleaseEvidenceFreshnessGuardCard[];
  freshnessRules: string[];
  blockedClaims: string[];
  boundary: typeof releaseEvidenceFreshnessGuardBoundary;
};

export const releaseEvidenceFreshnessGuardStatus =
  "release-evidence-freshness-guard-active-no-secret";
export const releaseEvidenceFreshnessGuardRoute =
  "/release-continuity#release-evidence-freshness-guard";
export const releaseEvidenceFreshnessGuardApiRoute =
  "/api/release-continuity/evidence-freshness-guard";
export const releaseEvidenceFreshnessGuardBriefRoute =
  "/api/release-continuity/evidence-freshness-guard/brief";

export const releaseEvidenceFreshnessGuardBoundary =
  "SCRIMED Release Evidence Freshness Guard is a no-secret recency and revalidation policy for release evidence. It does not rerun commands, store logs, store PHI, capture tokens, certify evidence, approve public distribution, approve production release, approve customer go-live, or authorize live clinical care.";

const blockedClaims = [
  "freshness guard is production release approval",
  "freshness guard is public distribution approval",
  "stale evidence approved for buyer use",
  "strict AAL2 proof refreshed without human operator",
  "customer-specific evidence approved",
  "PHI processing authorized",
  "live clinical care authorized",
  "security or compliance certified",
  "production connector approved",
  "customer go-live approved"
];

const freshnessRules = [
  "Static no-secret evidence may support internal readiness tracking, but external packet language requires a fresh rerun or human reviewer confirmation.",
  "Contract, lint, typecheck, build, and public-smoke evidence should be refreshed before buyer, investor, security, clinical, or customer-specific use.",
  "Protected AAL2 evidence remains blocked until a fresh authorized tenant-admin, pilot-lead, or reviewer session produces retained no-secret packet metadata.",
  "External-review evidence remains blocked until qualified legal, privacy/security, clinical/regulatory, buyer-authorization, or certification-body review exists.",
  "Freshness records may include command names, status labels, routes, review owners, refresh triggers, and hashes only; never include raw logs, bearer tokens, JWTs, Supabase keys, PHI, or customer data."
];

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function freshnessHash(payload: unknown) {
  const serialized = stableSerialize(payload);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `freshness-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function maxAgeHoursForEntry(entry: ReleaseEvidenceLedgerEntry): number | null {
  if (entry.evidenceType === "strict-protected-smoke") return 1;
  if (entry.evidenceType === "aal2-preflight") return 2;
  if (entry.evidenceType === "external-review") return null;
  if (entry.evidenceType === "public-smoke") return 12;
  return 24;
}

function statusForEntry(entry: ReleaseEvidenceLedgerEntry): ReleaseEvidenceFreshnessStatus {
  if (entry.status === "blocked-until-human-aal2" || entry.status === "operator-required") {
    return "blocked-until-human-aal2-refresh";
  }

  if (entry.status === "external-review-required") {
    return "blocked-until-qualified-review-refresh";
  }

  if (entry.evidenceType === "static-check" && entry.status === "passed-no-secret") {
    return "fresh-for-internal-readiness";
  }

  return "refresh-required-before-external-sharing";
}

function externalUseAuthorityForStatus(status: ReleaseEvidenceFreshnessStatus) {
  if (status === "fresh-for-internal-readiness") {
    return "internal-no-secret-only-refresh-before-external-use";
  }

  if (status === "blocked-until-human-aal2-refresh") {
    return "blocked-until-fresh-human-aal2-retained-packet";
  }

  if (status === "blocked-until-qualified-review-refresh") {
    return "blocked-until-qualified-review-confirms-current";
  }

  return "refresh-required-before-external-use";
}

function requiredReviewerForStatus(status: ReleaseEvidenceFreshnessStatus) {
  if (status === "blocked-until-human-aal2-refresh") {
    return "authorized tenant-admin/pilot-lead/reviewer AAL2 operator + release steward";
  }

  if (status === "blocked-until-qualified-review-refresh") {
    return "qualified legal/privacy/security/clinical/buyer reviewer";
  }

  if (status === "fresh-for-internal-readiness") {
    return "release steward before external reuse";
  }

  return "release steward + claim guard reviewer";
}

function refreshTriggerForEntry(entry: ReleaseEvidenceLedgerEntry, status: ReleaseEvidenceFreshnessStatus) {
  if (status === "blocked-until-human-aal2-refresh") {
    return "Run only with a fresh short-lived human AAL2 session and retain no-secret protected packet metadata.";
  }

  if (status === "blocked-until-qualified-review-refresh") {
    return "Refresh when qualified external reviewer confirms evidence is current for the exact claim and recipient scope.";
  }

  if (entry.evidenceType === "public-smoke") {
    return "Refresh after deployment, domain, route, auth, navigation, fail-closed, or buyer-facing copy changes.";
  }

  if (entry.evidenceType === "contract-smoke") {
    return "Refresh after source, schema, route, safety, evidence, model, durable-store, or contract changes.";
  }

  return "Refresh after source, dependency, environment, generated output, build, or release packaging changes.";
}

function freshnessCard(entry: ReleaseEvidenceLedgerEntry): ReleaseEvidenceFreshnessGuardCard {
  const freshnessStatus = statusForEntry(entry);

  return {
    id: `freshness-${entry.id}`,
    sourceEntryId: entry.id,
    label: entry.label,
    command: entry.command,
    artifactRoute: entry.artifactRoute,
    evidenceHash: entry.evidenceHash,
    evidenceType: entry.evidenceType,
    sourceStatus: entry.status,
    freshnessStatus,
    maxAgeHours: maxAgeHoursForEntry(entry),
    internalUseAuthority: "allowed-no-secret-readiness-metadata",
    externalUseAuthority: externalUseAuthorityForStatus(freshnessStatus),
    refreshTrigger: refreshTriggerForEntry(entry, freshnessStatus),
    requiredReviewer: requiredReviewerForStatus(freshnessStatus),
    blockedClaims,
    safetyBoundary: entry.noSecretBoundary
  };
}

export function getReleaseEvidenceFreshnessGuardSummary(): ReleaseEvidenceFreshnessGuardSummary {
  const ledger = getReleaseEvidenceLedgerSummary();
  const promotion = getReleaseEvidencePromotionSummary();
  const cards = ledger.entries.map(freshnessCard);

  return {
    service: "scrimed-release-evidence-freshness-guard",
    status: releaseEvidenceFreshnessGuardStatus,
    route: releaseEvidenceFreshnessGuardRoute,
    apiRoute: releaseEvidenceFreshnessGuardApiRoute,
    briefRoute: releaseEvidenceFreshnessGuardBriefRoute,
    generatedAt: "static-no-secret-freshness-policy",
    noPhiConfirmed: true,
    tokenMaterialCaptured: false,
    productionApproval: false,
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    releaseAuthority: "not-release-approval",
    securityCertification: "not-security-certified",
    freshnessAuthority: "fresh-rerun-required-before-external-use",
    publicDistributionAuthority: "not-authorized",
    customerSpecificAuthority: "not-authorized-without-customer-permission",
    sourceLedgerStatus: ledger.status,
    sourcePromotionStatus: promotion.status,
    cardCount: cards.length,
    internalFreshCount: cards.filter((card) => card.freshnessStatus === "fresh-for-internal-readiness").length,
    refreshRequiredCount: cards.filter((card) => card.freshnessStatus === "refresh-required-before-external-sharing").length,
    humanAal2RefreshCount: cards.filter((card) => card.freshnessStatus === "blocked-until-human-aal2-refresh").length,
    qualifiedReviewRefreshCount: cards.filter((card) => card.freshnessStatus === "blocked-until-qualified-review-refresh").length,
    freshnessHash: freshnessHash({
      status: releaseEvidenceFreshnessGuardStatus,
      cards: cards.map((card) => ({
        id: card.id,
        sourceEntryId: card.sourceEntryId,
        freshnessStatus: card.freshnessStatus,
        maxAgeHours: card.maxAgeHours
      }))
    }),
    cards,
    freshnessRules,
    blockedClaims,
    boundary: releaseEvidenceFreshnessGuardBoundary
  };
}

export function buildReleaseEvidenceFreshnessGuardBrief() {
  const summary = getReleaseEvidenceFreshnessGuardSummary();

  return [
    "# SCRIMED Release Evidence Freshness Guard",
    "",
    `Status: ${summary.status}`,
    `Generated: ${summary.generatedAt}`,
    `Freshness hash: ${summary.freshnessHash}`,
    `Freshness authority: ${summary.freshnessAuthority}`,
    `Public distribution authority: ${summary.publicDistributionAuthority}`,
    `Customer-specific authority: ${summary.customerSpecificAuthority}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `PHI authority: ${summary.phiAuthority}`,
    `Production approval: ${summary.productionApproval}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Freshness Cards",
    ...summary.cards.map(
      (card) =>
        `- ${card.id} (${card.freshnessStatus}): ${card.command}; max age ${card.maxAgeHours ?? "qualified-review"}h; reviewer ${card.requiredReviewer}; trigger ${card.refreshTrigger}`
    ),
    "",
    "## Freshness Rules",
    ...summary.freshnessRules.map((rule) => `- ${rule}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
