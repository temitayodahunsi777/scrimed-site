import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import { verifyPlatformEvidenceGraph } from "./platformEvidenceGraph";
import type {
  EvidenceMaturity,
  EvidenceRelation,
  PlatformEvidenceGraph
} from "./platformEvidenceGraph";

export const publicClaimResolverVersion =
  "scrimed-public-claim-resolver-v3-2026-08-10";

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

const supportingRelations = new Set<EvidenceRelation>(["supports", "derived_from"]);
const disqualifyingRelations = new Set<EvidenceRelation>([
  "contradicts",
  "invalidated_by"
]);

function getSupportingClosure(input: {
  graph: PlatformEvidenceGraph;
  evidenceId: string;
}) {
  const visited = new Set<string>();
  const pending = [input.evidenceId];
  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    for (const edge of input.graph.edges) {
      if (edge.from !== current || !supportingRelations.has(edge.relation)) continue;
      if (!visited.has(edge.to)) pending.push(edge.to);
    }
  }

  return visited;
}

function hasDisqualifyingRelationship(input: {
  graph: PlatformEvidenceGraph;
  evidenceId: string;
  claimId: string;
}) {
  const supportingClosure = getSupportingClosure({
    graph: input.graph,
    evidenceId: input.evidenceId
  });

  return input.graph.edges.some(
    (edge) =>
      disqualifyingRelations.has(edge.relation) &&
      ((supportingClosure.has(edge.from) && edge.to === input.claimId) ||
        (edge.from === input.claimId && supportingClosure.has(edge.to)) ||
        (edge.relation === "invalidated_by" && supportingClosure.has(edge.from)))
  );
}

function isQuantitativeOrSuperiorityClaim(text: string) {
  return (
    /\b\d+(?:\.\d+)?\s*%\b/.test(text) ||
    /\b(best|leading|superior|more accurate|reduces?|saves?|improves?)\b/i.test(text)
  );
}

export function resolvePublicClaim(input: {
  claim: PublicClaimInput;
  graph: PlatformEvidenceGraph;
  evaluatedAt: string;
}): PublicClaimResolution {
  const evidenceNodes = input.claim.evidenceIds
    .map((id) => input.graph.nodes.find((node) => node.id === id))
    .filter((node) => node !== undefined);
  const reasons: string[] = [];
  const graphIntegrity = verifyPlatformEvidenceGraph(input.graph);
  const quantitativeOrSuperior = isQuantitativeOrSuperiorityClaim(input.claim.text);
  const evaluatedAtMs = Date.parse(input.evaluatedAt);
  const evaluationTimeValid = Number.isFinite(evaluatedAtMs);

  if (evidenceNodes.length !== input.claim.evidenceIds.length || evidenceNodes.length === 0) {
    reasons.push("public-claim-evidence-missing");
  }
  if (!graphIntegrity.valid) {
    reasons.push("public-claim-evidence-graph-invalid");
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
  if (
    evidenceNodes.some(
      (node) =>
        node.id === input.claim.claimId ||
        !getSupportingClosure({
          graph: input.graph,
          evidenceId: node.id
        }).has(input.claim.claimId)
    )
  ) {
    reasons.push("public-claim-evidence-relationship-missing");
  }
  if (
    evidenceNodes.some((node) =>
      hasDisqualifyingRelationship({
        graph: input.graph,
        evidenceId: node.id,
        claimId: input.claim.claimId
      })
    )
  ) {
    reasons.push("public-claim-evidence-contradicted");
  }
  if (
    evaluationTimeValid &&
    evidenceNodes.some(
      (node) => node.expiresAt !== null && Date.parse(node.expiresAt) <= evaluatedAtMs
    )
  ) {
    reasons.push("public-claim-evidence-expired");
  }
  if (
    evaluationTimeValid &&
    evidenceNodes.some((node) => Date.parse(node.createdAt) > evaluatedAtMs)
  ) {
    reasons.push("public-claim-evidence-not-yet-effective");
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
  if (!evaluationTimeValid) {
    reasons.push("public-claim-evaluation-time-invalid");
  }

  const hardBlock = reasons.some((reason) =>
    [
      "public-claim-evidence-missing",
      "public-claim-evidence-graph-invalid",
      "public-claim-evidence-immature",
      "public-claim-evidence-relationship-missing",
      "public-claim-evidence-contradicted",
      "public-claim-evidence-expired",
      "public-claim-evidence-not-yet-effective",
      "public-claim-publication-approval-missing",
      "public-claim-review-date-invalid",
      "public-claim-evaluation-time-invalid"
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
      evaluatedAt: input.evaluatedAt,
      evidenceGraphHash: graphIntegrity.graphHash,
      evidenceNodeHashes: evidenceNodes.map((node) => node.contentHash).sort(),
      ...result
    })
  };
}
