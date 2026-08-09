import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { EvidenceMaturity, PlatformEvidenceGraph } from "./platformEvidenceGraph";

export const publicClaimResolverVersion =
  "scrimed-public-claim-resolver-v2-2026-08-09";

export type PublicClaimInput = {
  claimId: string;
  text: string;
  evidenceIds: string[];
  evidenceMaturityRequired: EvidenceMaturity;
  owner: string;
  reviewDate: string;
  publicationAuthorized: boolean;
  syntheticOrEstimated: boolean;
};

export type PublicClaimResolution = {
  claimId: string;
  decision: "RETAIN" | "QUALIFY" | "REMOVE" | "BLOCK";
  publishable: boolean;
  reasonCodes: string[];
  requiredLabel: "SYNTHETIC" | "ESTIMATED" | null;
  resolutionHash: string;
};

const maturityRank: Record<EvidenceMaturity, number> = {
  synthetic: 0,
  "local-verified": 1,
  "independently-reviewed": 2,
  "external-validated": 3
};

function isQuantitativeOrSuperiorityClaim(text: string) {
  return (
    /\b\d+(?:\.\d+)?\s*%\b/.test(text) ||
    /\b(best|leading|superior|more accurate|reduces?|saves?|improves?)\b/i.test(text)
  );
}

export function resolvePublicClaim(input: {
  claim: PublicClaimInput;
  graph: PlatformEvidenceGraph;
}): PublicClaimResolution {
  const evidenceNodes = input.claim.evidenceIds
    .map((id) => input.graph.nodes.find((node) => node.id === id))
    .filter((node) => node !== undefined);
  const reasons: string[] = [];
  const quantitativeOrSuperior = isQuantitativeOrSuperiorityClaim(input.claim.text);

  if (evidenceNodes.length !== input.claim.evidenceIds.length || evidenceNodes.length === 0) {
    reasons.push("public-claim-evidence-missing");
  }
  if (
    evidenceNodes.some(
      (node) =>
        maturityRank[node.maturity] <
        maturityRank[input.claim.evidenceMaturityRequired]
    )
  ) {
    reasons.push("public-claim-evidence-immature");
  }
  if (!input.claim.publicationAuthorized) {
    reasons.push("public-claim-publication-approval-missing");
  }
  if (quantitativeOrSuperior && input.claim.syntheticOrEstimated) {
    reasons.push("public-claim-synthetic-or-estimated-label-required");
  }
  if (!Number.isFinite(Date.parse(input.claim.reviewDate))) {
    reasons.push("public-claim-review-date-invalid");
  }

  const hardBlock = reasons.some((reason) =>
    [
      "public-claim-evidence-missing",
      "public-claim-evidence-immature",
      "public-claim-publication-approval-missing",
      "public-claim-review-date-invalid"
    ].includes(reason)
  );
  const decision = hardBlock
    ? ("BLOCK" as const)
    : input.claim.syntheticOrEstimated
      ? ("QUALIFY" as const)
      : ("RETAIN" as const);
  const result = {
    claimId: input.claim.claimId,
    decision,
    publishable: !hardBlock,
    reasonCodes: reasons,
    requiredLabel: input.claim.syntheticOrEstimated
      ? (input.claim.text.toLowerCase().includes("estimated")
          ? "ESTIMATED"
          : "SYNTHETIC") as "ESTIMATED" | "SYNTHETIC"
      : null
  };

  return {
    ...result,
    resolutionHash: createClinicalEvidenceHash({
      version: publicClaimResolverVersion,
      claim: input.claim,
      evidenceNodeHashes: evidenceNodes.map((node) => node.contentHash).sort(),
      ...result
    })
  };
}
