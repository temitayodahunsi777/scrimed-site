import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import { getPr25FrozenReviewBaseline } from "./pr25FrozenReviewBaseline";

export const platformEvidenceGraphVersion =
  "scrimed-healthcare-evidence-graph-v2-2026-08-09";

export type EvidenceNodeType =
  | "source"
  | "claim"
  | "model"
  | "agent"
  | "workflow"
  | "benchmark"
  | "evaluation"
  | "policy"
  | "product"
  | "release"
  | "economic-metric"
  | "incident"
  | "reviewer"
  | "approval";

export type EvidenceMaturity =
  | "synthetic"
  | "local-verified"
  | "independently-reviewed"
  | "external-validated";

export type EvidenceRelation =
  | "supports"
  | "contradicts"
  | "derived_from"
  | "supersedes"
  | "reviewed_by"
  | "invalidated_by"
  | "approved_for"
  | "prohibited_for"
  | "generated_by"
  | "measured_by";

export type PlatformEvidenceNode = {
  id: string;
  type: EvidenceNodeType;
  label: string;
  sourceType: string;
  sourceReference: string;
  confidence: number;
  maturity: EvidenceMaturity;
  createdAt: string;
  expiresAt: string | null;
  contentHash: string;
};

export type PlatformEvidenceEdge = {
  id: string;
  from: string;
  to: string;
  relation: EvidenceRelation;
  createdAt: string;
  contentHash: string;
};

export type PlatformEvidenceGraph = {
  version: typeof platformEvidenceGraphVersion;
  nodes: PlatformEvidenceNode[];
  edges: PlatformEvidenceEdge[];
};

export function createEvidenceNode(
  input: Omit<PlatformEvidenceNode, "contentHash">
): PlatformEvidenceNode {
  return {
    ...input,
    contentHash: createClinicalEvidenceHash({
      version: platformEvidenceGraphVersion,
      ...input
    })
  };
}

export function createEvidenceEdge(
  input: Omit<PlatformEvidenceEdge, "contentHash">
): PlatformEvidenceEdge {
  return {
    ...input,
    contentHash: createClinicalEvidenceHash({
      version: platformEvidenceGraphVersion,
      ...input
    })
  };
}

export function buildPostPr25EvidenceGraph(): PlatformEvidenceGraph {
  const baseline = getPr25FrozenReviewBaseline();
  const createdAt = "2026-08-09T21:01:09.000Z";
  const nodes = [
    createEvidenceNode({
      id: "source:pr25-exact-head",
      type: "source",
      label: "PR #25 exact source head",
      sourceType: "git-commit",
      sourceReference: baseline.headSha,
      confidence: 1,
      maturity: "local-verified",
      createdAt,
      expiresAt: null
    }),
    createEvidenceNode({
      id: "evaluation:pr25-detached-validation",
      type: "evaluation",
      label: "Detached clean candidate validation",
      sourceType: "validation-manifest",
      sourceReference: baseline.fingerprints.validation,
      confidence: 1,
      maturity: "local-verified",
      createdAt,
      expiresAt: null
    }),
    createEvidenceNode({
      id: "benchmark:pr25-ci",
      type: "benchmark",
      label: "Exact-head CI and security checks",
      sourceType: "github-actions-summary",
      sourceReference: `github:pr/${baseline.pullRequest}@${baseline.headSha}`,
      confidence: 1,
      maturity: "local-verified",
      createdAt,
      expiresAt: null
    }),
    createEvidenceNode({
      id: "policy:synthetic-no-phi",
      type: "policy",
      label: "Synthetic/no-PHI operating boundary",
      sourceType: "repository-policy",
      sourceReference: "app/lib/operatingMode.ts",
      confidence: 1,
      maturity: "local-verified",
      createdAt,
      expiresAt: null
    }),
    createEvidenceNode({
      id: "release:pr25-review-requested",
      type: "release",
      label: "PR #25 exact-head review requested",
      sourceType: "release-state",
      sourceReference: "REVIEW_REQUESTED",
      confidence: 1,
      maturity: "local-verified",
      createdAt,
      expiresAt: null
    }),
    createEvidenceNode({
      id: "approval:pr25-historical-stale",
      type: "approval",
      label: "Historical reviewer approval not valid for current head",
      sourceType: "github-review",
      sourceReference: baseline.review.historicalApprovedHead,
      confidence: 1,
      maturity: "independently-reviewed",
      createdAt: "2026-08-09T20:34:56.000Z",
      expiresAt: "2026-08-09T20:57:25.000Z"
    }),
    createEvidenceNode({
      id: "claim:investor-platform-narrative",
      type: "claim",
      label: "SCRIMED is building governed healthcare intelligence infrastructure",
      sourceType: "internal-positioning",
      sourceReference: "docs/investor/DATA_ROOM_INDEX.md",
      confidence: 0.82,
      maturity: "local-verified",
      createdAt,
      expiresAt: "2026-11-09T21:01:09.000Z"
    }),
    createEvidenceNode({
      id: "economic-metric:cost-per-verified-task",
      type: "economic-metric",
      label: "Cost per verified successful task",
      sourceType: "metric-definition",
      sourceReference: "app/lib/economicUnitModel.ts",
      confidence: 0.5,
      maturity: "synthetic",
      createdAt,
      expiresAt: "2026-11-09T21:01:09.000Z"
    })
  ];
  const edges = [
    createEvidenceEdge({
      id: "edge:validation-derived-from-source",
      from: "evaluation:pr25-detached-validation",
      to: "source:pr25-exact-head",
      relation: "derived_from",
      createdAt
    }),
    createEvidenceEdge({
      id: "edge:ci-supports-validation",
      from: "benchmark:pr25-ci",
      to: "evaluation:pr25-detached-validation",
      relation: "supports",
      createdAt
    }),
    createEvidenceEdge({
      id: "edge:policy-prohibits-production-authority",
      from: "policy:synthetic-no-phi",
      to: "release:pr25-review-requested",
      relation: "prohibited_for",
      createdAt
    }),
    createEvidenceEdge({
      id: "edge:stale-approval-invalid-for-release",
      from: "approval:pr25-historical-stale",
      to: "release:pr25-review-requested",
      relation: "invalidated_by",
      createdAt
    }),
    createEvidenceEdge({
      id: "edge:source-supports-platform-narrative",
      from: "source:pr25-exact-head",
      to: "claim:investor-platform-narrative",
      relation: "supports",
      createdAt
    }),
    createEvidenceEdge({
      id: "edge:metric-measured-by-validation",
      from: "economic-metric:cost-per-verified-task",
      to: "evaluation:pr25-detached-validation",
      relation: "measured_by",
      createdAt
    })
  ];

  return { version: platformEvidenceGraphVersion, nodes, edges };
}

export function verifyPlatformEvidenceGraph(graph: PlatformEvidenceGraph) {
  const failures: string[] = [];
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const edgeIds = new Set(graph.edges.map((edge) => edge.id));
  if (nodeIds.size !== graph.nodes.length) failures.push("duplicate-evidence-node-id");
  if (edgeIds.size !== graph.edges.length) failures.push("duplicate-evidence-edge-id");

  for (const node of graph.nodes) {
    if (node.confidence < 0 || node.confidence > 1) {
      failures.push(`invalid-evidence-confidence:${node.id}`);
    }
    if (!Number.isFinite(Date.parse(node.createdAt))) {
      failures.push(`invalid-evidence-created-at:${node.id}`);
    }
    if (node.expiresAt && Date.parse(node.expiresAt) <= Date.parse(node.createdAt)) {
      failures.push(`invalid-evidence-expiry:${node.id}`);
    }
    const { contentHash, ...input } = node;
    if (createEvidenceNode(input).contentHash !== contentHash) {
      failures.push(`evidence-node-hash-mismatch:${node.id}`);
    }
  }

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      failures.push(`dangling-evidence-edge:${edge.id}`);
    }
    const { contentHash, ...input } = edge;
    if (createEvidenceEdge(input).contentHash !== contentHash) {
      failures.push(`evidence-edge-hash-mismatch:${edge.id}`);
    }
  }

  return {
    valid: failures.length === 0,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    failures,
    graphHash: createClinicalEvidenceHash(graph)
  };
}
