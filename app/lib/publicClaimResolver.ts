import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import { verifyPlatformEvidenceGraph } from "./platformEvidenceGraph";
import type {
  EvidenceMaturity,
  EvidenceRelation,
  PlatformEvidenceEdge,
  PlatformEvidenceGraph,
  PlatformEvidenceNode
} from "./platformEvidenceGraph";

export const publicClaimResolverVersion =
  "scrimed-public-claim-resolver-v4-2026-08-10";

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

function isNodeEffective(node: PlatformEvidenceNode, evaluatedAtMs: number) {
  const createdAtMs = Date.parse(node.createdAt);
  const expiresAtMs = node.expiresAt === null ? null : Date.parse(node.expiresAt);
  return (
    Number.isFinite(createdAtMs) &&
    createdAtMs <= evaluatedAtMs &&
    (expiresAtMs === null ||
      (Number.isFinite(expiresAtMs) && expiresAtMs > evaluatedAtMs))
  );
}

function isEdgeEffective(edge: PlatformEvidenceEdge, evaluatedAtMs: number) {
  const createdAtMs = Date.parse(edge.createdAt);
  return Number.isFinite(createdAtMs) && createdAtMs <= evaluatedAtMs;
}

function getSupportingReachable(input: {
  graph: PlatformEvidenceGraph;
  startId: string;
  evaluatedAtMs: number;
  reverse?: boolean;
}) {
  const nodes = new Map(input.graph.nodes.map((node) => [node.id, node]));
  const startNode = nodes.get(input.startId);
  if (!startNode || !isNodeEffective(startNode, input.evaluatedAtMs)) {
    return new Set<string>();
  }

  const visited = new Set<string>();
  const pending = [input.startId];
  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    for (const edge of input.graph.edges) {
      if (!supportingRelations.has(edge.relation)) continue;
      const matches = input.reverse ? edge.to === current : edge.from === current;
      if (!matches || !isEdgeEffective(edge, input.evaluatedAtMs)) continue;
      const nextId = input.reverse ? edge.from : edge.to;
      const nextNode = nodes.get(nextId);
      if (
        nextNode &&
        isNodeEffective(nextNode, input.evaluatedAtMs) &&
        !visited.has(nextId)
      ) {
        pending.push(nextId);
      }
    }
  }

  return visited;
}

function hasStructuralSupportingPath(input: {
  graph: PlatformEvidenceGraph;
  evidenceId: string;
  claimId: string;
}) {
  const visited = new Set<string>();
  const pending = [input.evidenceId];
  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    for (const edge of input.graph.edges) {
      if (edge.from !== current || !supportingRelations.has(edge.relation)) continue;
      if (edge.to === input.claimId) return true;
      if (!visited.has(edge.to)) pending.push(edge.to);
    }
  }
  return false;
}

function getEffectiveSupportingPathNodes(input: {
  graph: PlatformEvidenceGraph;
  evidenceId: string;
  claimId: string;
  evaluatedAtMs: number;
}) {
  const forward = getSupportingReachable({
    graph: input.graph,
    startId: input.evidenceId,
    evaluatedAtMs: input.evaluatedAtMs
  });
  if (!forward.has(input.claimId)) return new Set<string>();
  const reverse = getSupportingReachable({
    graph: input.graph,
    startId: input.claimId,
    evaluatedAtMs: input.evaluatedAtMs,
    reverse: true
  });
  return new Set([...forward].filter((nodeId) => reverse.has(nodeId)));
}

function hasDisqualifyingRelationship(input: {
  graph: PlatformEvidenceGraph;
  supportingPathNodeIds: Set<string>;
  evaluatedAtMs: number;
}) {
  const nodes = new Map(input.graph.nodes.map((node) => [node.id, node]));

  return input.graph.edges.some(
    (edge) => {
      if (
        !disqualifyingRelations.has(edge.relation) ||
        !isEdgeEffective(edge, input.evaluatedAtMs)
      ) {
        return false;
      }
      const fromNode = nodes.get(edge.from);
      const toNode = nodes.get(edge.to);
      return (
        Boolean(fromNode && isNodeEffective(fromNode, input.evaluatedAtMs)) &&
        Boolean(toNode && isNodeEffective(toNode, input.evaluatedAtMs)) &&
        (input.supportingPathNodeIds.has(edge.from) ||
          input.supportingPathNodeIds.has(edge.to))
      );
    }
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
  const pathAnalyses = evidenceNodes.map((node) => ({
    node,
    structuralPathExists: hasStructuralSupportingPath({
      graph: input.graph,
      evidenceId: node.id,
      claimId: input.claim.claimId
    }),
    effectivePathNodeIds: evaluationTimeValid
      ? getEffectiveSupportingPathNodes({
          graph: input.graph,
          evidenceId: node.id,
          claimId: input.claim.claimId,
          evaluatedAtMs
        })
      : new Set<string>()
  }));
  const supportingPathNodeIds = new Set(
    pathAnalyses.flatMap((analysis) => [...analysis.effectivePathNodeIds])
  );

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
    pathAnalyses.some(
      (analysis) =>
        analysis.node.id === input.claim.claimId ||
        !analysis.structuralPathExists
    )
  ) {
    reasons.push("public-claim-evidence-relationship-missing");
  }
  if (
    evaluationTimeValid &&
    pathAnalyses.some(
      (analysis) =>
        analysis.structuralPathExists && analysis.effectivePathNodeIds.size === 0
    )
  ) {
    reasons.push("public-claim-evidence-path-inactive");
  }
  if (
    evaluationTimeValid &&
    hasDisqualifyingRelationship({
      graph: input.graph,
      supportingPathNodeIds,
      evaluatedAtMs
    })
  ) {
    reasons.push("public-claim-evidence-contradicted");
  }
  if (
    [...supportingPathNodeIds].some((nodeId) => {
      if (nodeId === input.claim.claimId) return false;
      const node = input.graph.nodes.find((entry) => entry.id === nodeId);
      return (
        node !== undefined &&
        maturityRank[node.maturity] <
          maturityRank[input.claim.evidenceMaturityRequired]
      );
    })
  ) {
    reasons.push("public-claim-evidence-path-immature");
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
      "public-claim-evidence-path-inactive",
      "public-claim-evidence-path-immature",
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
