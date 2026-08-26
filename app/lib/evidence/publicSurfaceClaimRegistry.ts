import { createHash } from "node:crypto";

import { evaluatePublicClaims } from "../publicClaimsPolicy";

export type PublicSurfaceType =
  | "app-route"
  | "wix-page"
  | "wix-cms-export"
  | "seo-metadata"
  | "json-ld"
  | "investor-deck"
  | "demo"
  | "proof-packet";

export type PublicClaimStatus =
  | "VERIFIED"
  | "QUALIFIED"
  | "SYNTHETIC"
  | "ESTIMATED"
  | "PLANNED"
  | "PROHIBITED"
  | "MISSING_EVIDENCE";

export type PublicSurfaceClaimInput = {
  id: string;
  surfaceType: PublicSurfaceType;
  locator: string;
  claim: string;
  requestedStatus: Exclude<PublicClaimStatus, "PROHIBITED" | "MISSING_EVIDENCE">;
  evidenceReferences?: string[];
  evidenceOwner?: string | null;
  publicationPermission?: boolean;
  reviewBy?: string | null;
};

export type PublicSurfaceClaimRecord = PublicSurfaceClaimInput & {
  status: PublicClaimStatus;
  reasonCodes: string[];
  evidenceReferences: string[];
  evidenceOwner: string | null;
  publicationPermission: boolean;
  reviewBy: string | null;
  claimFingerprint: string;
};

export const publicSurfaceClaimRegistryVersion =
  "scrimed-public-surface-claim-registry-v1-2026-08-12";

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
    .join(",")}}`;
}

function hash(value: unknown) {
  return createHash("sha256").update(stableSerialize(value)).digest("hex");
}

function canonical(values: string[] = []) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

export function classifyPublicSurfaceClaim(
  input: PublicSurfaceClaimInput,
  evaluatedAt = new Date().toISOString()
): PublicSurfaceClaimRecord {
  const evidenceReferences = canonical(input.evidenceReferences);
  const evidenceOwner = input.evidenceOwner?.trim() || null;
  const reviewBy = input.reviewBy?.trim() || null;
  const publicationPermission = input.publicationPermission === true;
  const policy = evaluatePublicClaims(
    `${input.claim} no phi synthetic human review`
  );
  const reasonCodes: string[] = [];
  let status: PublicClaimStatus = input.requestedStatus;

  if (policy.blockedClaims.length > 0) {
    status = "PROHIBITED";
    reasonCodes.push(...policy.blockedClaims.map((claim) => `PUBLIC_POLICY:${claim.id}`));
  } else if (input.requestedStatus === "VERIFIED") {
    if (!evidenceReferences.length) reasonCodes.push("EVIDENCE_REFERENCE_REQUIRED");
    if (!evidenceOwner) reasonCodes.push("EVIDENCE_OWNER_REQUIRED");
    if (!publicationPermission) reasonCodes.push("PUBLICATION_PERMISSION_REQUIRED");
    if (!reviewBy || Date.parse(reviewBy) <= Date.parse(evaluatedAt)) {
      reasonCodes.push("FRESH_REVIEW_DATE_REQUIRED");
    }
    if (reasonCodes.length) status = "MISSING_EVIDENCE";
  }

  const record = {
    ...input,
    status,
    reasonCodes,
    evidenceReferences,
    evidenceOwner,
    publicationPermission,
    reviewBy
  };

  return { ...record, claimFingerprint: hash(record) };
}

export function createPublicSurfaceClaimRegistry(
  claims: PublicSurfaceClaimInput[],
  evaluatedAt = new Date().toISOString()
) {
  const records = claims.map((claim) => classifyPublicSurfaceClaim(claim, evaluatedAt));
  const blockingStatuses = new Set<PublicClaimStatus>(["PROHIBITED", "MISSING_EVIDENCE"]);
  const blockingRecords = records.filter((record) => blockingStatuses.has(record.status));
  const summary = {
    service: "scrimed-public-surface-claim-registry" as const,
    version: publicSurfaceClaimRegistryVersion,
    evaluatedAt,
    records,
    counts: Object.fromEntries(
      (["VERIFIED", "QUALIFIED", "SYNTHETIC", "ESTIMATED", "PLANNED", "PROHIBITED", "MISSING_EVIDENCE"] as PublicClaimStatus[])
        .map((status) => [status, records.filter((record) => record.status === status).length])
    ),
    publicReleaseEligible: blockingRecords.length === 0,
    blockingClaimIds: blockingRecords.map((record) => record.id),
    productionAuthorityGranted: false as const,
    boundary:
      "Automated classification is a release control, not evidence creation or claim approval. VERIFIED requires evidence, an accountable owner, explicit publication permission, and a future review date."
  };

  return { ...summary, registryFingerprint: hash(summary) };
}
