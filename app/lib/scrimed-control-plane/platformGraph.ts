import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getP32TechnicalGateCatalog } from "../scrimed-work/p32TechnicalGates";
import {
  platformCapabilityRegistry,
  platformMoatRegistry,
  scrimedPlatformStrategyBoundary,
  scrimedPlatformStrategyVersion,
  strategicMetricRegistry
} from "./platformStrategy";
import {
  controlPlaneAgentRegistry,
  controlPlaneProviderPolicyProfiles,
  controlPlaneWorkflowRegistry
} from "./registries";
import type {
  PlatformGraphEdge,
  PlatformGraphNode,
  PlatformGraphNodeType,
  PlatformGraphRelation,
  RiskLevel
} from "./types";

export const scrimedPlatformGraphVersion = "scrimed-platform-graph-v1-2026-08-11";
export const scrimedPlatformGraphBoundary =
  "This graph is synthetic, metadata-only architecture evidence. It grants no production, clinical, PHI, payer, EHR, device, commercial, partnership, or distribution authority.";

function node(input: {
  id: string;
  type: PlatformGraphNodeType;
  label: string;
  owner: string;
  maturity: string;
  riskTier?: RiskLevel | "not-applicable";
  evidenceStatus: string;
}): PlatformGraphNode {
  const definition = {
    ...input,
    riskTier: input.riskTier ?? "not-applicable",
    syntheticOnly: true as const,
    externalAuthorityGranted: false as const
  };

  return {
    ...definition,
    auditHash: createClinicalEvidenceHash({
      ...definition,
      version: scrimedPlatformGraphVersion,
      boundary: scrimedPlatformGraphBoundary
    })
  };
}

function edge(
  from: string,
  to: string,
  relation: PlatformGraphRelation,
  reason: string
): PlatformGraphEdge {
  const definition = {
    id: `${from}:${relation}:${to}`,
    from,
    to,
    relation,
    reason
  };

  return {
    ...definition,
    auditHash: createClinicalEvidenceHash({
      ...definition,
      version: scrimedPlatformGraphVersion
    })
  };
}

const policyNode = node({
  id: "policy:synthetic-no-phi-boundary",
  type: "policy",
  label: "Synthetic/no-PHI consequential-action boundary",
  owner: "Trust Engineering + Clinical Governance",
  maturity: "enforced",
  riskTier: "high",
  evidenceStatus: "local-verified"
});

const platformPlaneNodes = [...new Set(platformCapabilityRegistry.map((entry) => entry.plane))].map(
  (plane) =>
    node({
      id: `plane:${plane}`,
      type: "platform-plane",
      label: plane,
      owner: "SCRIMED Platform",
      maturity: "mapped",
      evidenceStatus: "registry-derived"
    })
);

const productNodes = [...new Set(platformCapabilityRegistry.map((entry) => entry.product))].map(
  (product) =>
    node({
      id: `product:${product.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
      type: "portfolio-offer",
      label: product,
      owner: "Product + Commercial Strategy",
      maturity: "portfolio-classified",
      evidenceStatus: "internal-strategy-evidence"
    })
);

const productNodeIdByLabel = new Map(productNodes.map((entry) => [entry.label, entry.id]));

const capabilityNodes = platformCapabilityRegistry.map((entry) =>
  node({
    id: `capability:${entry.id}`,
    type: "capability",
    label: entry.name,
    owner: entry.owner,
    maturity: entry.maturity,
    riskTier: entry.riskTier,
    evidenceStatus: entry.evidenceStatus
  })
);

const agentNodes = controlPlaneAgentRegistry.map((entry) =>
  node({
    id: `agent:${entry.id}`,
    type: "agent",
    label: entry.id,
    owner: entry.owner,
    maturity: entry.maturityLevel,
    riskTier: entry.riskCeiling,
    evidenceStatus: entry.activationStatus
  })
);

const workflowNodes = controlPlaneWorkflowRegistry.map((entry) =>
  node({
    id: `workflow:${entry.id}`,
    type: "workflow",
    label: entry.title,
    owner: "Workflow Governance",
    maturity: "synthetic-evaluable",
    riskTier: entry.definitionOfDone.humanApprovalRequired ? "high" : "moderate",
    evidenceStatus: "contract-defined"
  })
);

const providerNodes = controlPlaneProviderPolicyProfiles.map((entry) =>
  node({
    id: `model-policy:${entry.id}`,
    type: "model-policy",
    label: entry.id,
    owner: "AI Platform + Reliability",
    maturity: entry.availability,
    riskTier: "moderate",
    evidenceStatus: entry.availability === "available-no-secret" ? "local-verified" : "configuration-required"
  })
);

const externalGateDefinitions = getP32TechnicalGateCatalog().filter(
  (entry) => entry.classification === "EXTERNAL"
);

const approvalNodes = [
  node({
    id: "approval:automated-no-phi-technical-quality-gate",
    type: "approval",
    label: "Automated no-PHI technical quality gate",
    owner: "Release Engineering",
    maturity: "machine-verifiable",
    riskTier: "moderate",
    evidenceStatus: "must-be-regenerated-for-exact-candidate"
  }),
  ...externalGateDefinitions.map((entry) =>
    node({
      id: `approval:${entry.gateId}`,
      type: "approval",
      label: entry.description,
      owner: entry.ownerRole,
      maturity: "external-evidence-pending",
      riskTier: "high",
      evidenceStatus: "external-or-human-evidence-required"
    })
  )
];

const metricNodes = strategicMetricRegistry.map((entry) =>
  node({
    id: `metric:${entry.id}`,
    type: "metric",
    label: entry.name,
    owner: "Evidence + Value Operations",
    maturity: entry.evidenceStatus,
    evidenceStatus: entry.currentValue === null ? "baseline-not-collected" : "measured"
  })
);

const proofRouteNodes = [...new Set(platformCapabilityRegistry.flatMap((entry) => entry.proofRoutes))].map(
  (route) =>
    node({
      id: `proof-route:${route}`,
      type: "proof-route",
      label: route,
      owner: "Product Evidence",
      maturity: "repository-route",
      evidenceStatus: "local-route-reference"
    })
);

const moatNodes = platformMoatRegistry.map((entry) =>
  node({
    id: `moat:${entry.id}`,
    type: "moat",
    label: entry.name,
    owner: "Strategy + Product",
    maturity: entry.status,
    evidenceStatus: entry.status
  })
);

const infrastructureNodes = [
  node({
    id: "api:scrimed-control-plane",
    type: "api",
    label: "/api/scrimed-control-plane",
    owner: "Platform Engineering",
    maturity: "integrated",
    riskTier: "moderate",
    evidenceStatus: "contract-tested"
  }),
  node({
    id: "database:scrimed-durable-store",
    type: "database",
    label: "SCRIMED durable control-plane store",
    owner: "Data Platform + Security",
    maturity: "migration-authorization-pending",
    riskTier: "high",
    evidenceStatus: "static-migration-review-only"
  }),
  node({
    id: "release:working-tree-candidate",
    type: "release",
    label: "Working-tree follow-on candidate",
    owner: "Release Steward",
    maturity: "review-required",
    riskTier: "high",
    evidenceStatus: "mutable-working-tree"
  }),
  node({
    id: "evidence:deterministic-platform-artifacts",
    type: "evidence",
    label: "Deterministic platform evidence artifacts",
    owner: "Evidence Operations",
    maturity: "generated-and-checked",
    evidenceStatus: "local-machine-verifiable"
  }),
  ...(["local", "test", "preview", "protected-pilot"] as const).map((environment) =>
    node({
      id: `environment:${environment}`,
      type: "environment",
      label: environment,
      owner: "Platform Reliability",
      maturity: environment === "protected-pilot" ? "external-gates-required" : "synthetic-only",
      riskTier: environment === "protected-pilot" ? "high" : "low",
      evidenceStatus: environment === "protected-pilot" ? "not-authorized" : "local-policy-defined"
    })
  )
];

const connectorNodes = [
  node({
    id: "connector:synthetic-healthcare-adapters",
    type: "connector",
    label: "Synthetic FHIR, HL7, DICOM metadata, payer, and document adapters",
    owner: "Interoperability + Security",
    maturity: "read-only-synthetic",
    riskTier: "high",
    evidenceStatus: "no-production-connection"
  })
];

export const scrimedPlatformGraphNodes: PlatformGraphNode[] = [
  policyNode,
  ...platformPlaneNodes,
  ...productNodes,
  ...capabilityNodes,
  ...agentNodes,
  ...workflowNodes,
  ...providerNodes,
  ...approvalNodes,
  ...metricNodes,
  ...proofRouteNodes,
  ...moatNodes,
  ...infrastructureNodes,
  ...connectorNodes
];

const capabilityEdges = platformCapabilityRegistry.flatMap((entry) => {
  const capabilityId = `capability:${entry.id}`;
  const reviewApproval = entry.riskTier === "high"
    ? "approval:named-independent-reviewer"
    : "approval:automated-no-phi-technical-quality-gate";
  const edges: PlatformGraphEdge[] = [
    edge(`plane:${entry.plane}`, capabilityId, "contains", "The capability is owned by this platform plane."),
    edge(productNodeIdByLabel.get(entry.product)!, capabilityId, "contains", "The product exposes this governed capability."),
    edge(capabilityId, policyNode.id, "governed_by", "Every capability is bound by the synthetic/no-PHI policy."),
    edge(capabilityId, reviewApproval, "reviewed_by", "Activation requires the applicable technical or human gate."),
    ...entry.dependencies.map((dependency) =>
      edge(capabilityId, `capability:${dependency}`, "depends_on", "Declared capability dependency.")
    ),
    ...entry.agentIds.map((agentId) =>
      edge(capabilityId, `agent:${agentId}`, "invokes", "Capability may invoke only a declared agent identity.")
    ),
    ...entry.workflowIds.map((workflowId) =>
      edge(capabilityId, `workflow:${workflowId}`, "routes_to", "Capability supports this bounded workflow definition.")
    ),
    ...entry.proofRoutes.map((route) =>
      edge(`proof-route:${route}`, capabilityId, "provides_evidence_for", "Repository route exposes reviewable synthetic evidence.")
    ),
    ...entry.environmentSupport.map((environment) =>
      edge(capabilityId, `environment:${environment}`, "activated_by", "Environment is declared in capability activation policy.")
    )
  ];

  return edges;
});

const orchestrationEdges = controlPlaneWorkflowRegistry.flatMap((workflow) =>
  workflow.participatingAgents.map((agentId) =>
    edge(`workflow:${workflow.id}`, `agent:${agentId}`, "invokes", "Workflow task graph declares this agent role.")
  )
);

const providerEdges = controlPlaneProviderPolicyProfiles.map((provider) =>
  edge(
    "capability:model-compute-gateway",
    `model-policy:${provider.id}`,
    "routes_to",
    "The model gateway evaluates this configured provider policy; availability does not imply admission."
  )
);

const metricEdges = strategicMetricRegistry.map((metric) =>
  edge(
    `metric:${metric.id}`,
    "capability:outcome-learning-loop",
    "measures",
    "Portfolio prioritization requires evidence-backed value and cost measurement."
  )
);

const infrastructureEdges: PlatformGraphEdge[] = [
  edge("api:scrimed-control-plane", "capability:trust-evidence-control", "routes_to", "The API exposes the control-plane read model and guarded commands."),
  edge("database:scrimed-durable-store", policyNode.id, "governed_by", "Persistence remains tenant-scoped and migration-authorized."),
  edge("evidence:deterministic-platform-artifacts", "release:working-tree-candidate", "provides_evidence_for", "Generated artifacts describe the exact working-tree candidate until committed."),
  edge("connector:synthetic-healthcare-adapters", policyNode.id, "governed_by", "Connector write authority and production data remain disabled."),
  edge("capability:data-interoperability-fabric", "connector:synthetic-healthcare-adapters", "invokes", "The interoperability fabric may use only scoped synthetic adapters."),
  edge("environment:protected-pilot", "approval:aal2-operator-evidence", "activated_by", "Protected-pilot access requires real AAL2 operator evidence."),
  ...approvalNodes.map((approval) =>
    edge(
      "release:working-tree-candidate",
      approval.id,
      "reviewed_by",
      "The release retains this approval as an explicit scoped gate; graph presence does not satisfy it."
    )
  ),
  ...platformMoatRegistry.map((moat) =>
    edge(`moat:${moat.id}`, "evidence:deterministic-platform-artifacts", "depends_on", "Moat statements remain bounded by current evidence artifacts.")
  )
];

export const scrimedPlatformGraphEdges: PlatformGraphEdge[] = [
  ...capabilityEdges,
  ...orchestrationEdges,
  ...providerEdges,
  ...metricEdges,
  ...infrastructureEdges
];

export function validateScrimedPlatformGraph() {
  const nodeIds = new Set(scrimedPlatformGraphNodes.map((entry) => entry.id));
  const edgeIds = new Set(scrimedPlatformGraphEdges.map((entry) => entry.id));
  const failures: string[] = [];

  if (nodeIds.size !== scrimedPlatformGraphNodes.length) failures.push("duplicate-node-id");
  if (edgeIds.size !== scrimedPlatformGraphEdges.length) failures.push("duplicate-edge-id");

  for (const graphEdge of scrimedPlatformGraphEdges) {
    if (!nodeIds.has(graphEdge.from)) failures.push(`dangling-edge-from:${graphEdge.id}`);
    if (!nodeIds.has(graphEdge.to)) failures.push(`dangling-edge-to:${graphEdge.id}`);
  }

  for (const capability of platformCapabilityRegistry) {
    const capabilityId = `capability:${capability.id}`;
    if (!scrimedPlatformGraphEdges.some((entry) => entry.from === capabilityId && entry.relation === "governed_by")) {
      failures.push(`ungoverned-capability:${capability.id}`);
    }
    if (
      capability.riskTier === "high" &&
      !scrimedPlatformGraphEdges.some((entry) => entry.from === capabilityId && entry.relation === "reviewed_by")
    ) {
      failures.push(`high-risk-capability-without-review:${capability.id}`);
    }
  }

  const connectedNodeIds = new Set(
    scrimedPlatformGraphEdges.flatMap((entry) => [entry.from, entry.to])
  );
  const orphanNodeIds = scrimedPlatformGraphNodes
    .filter((entry) => !connectedNodeIds.has(entry.id))
    .map((entry) => entry.id);
  if (orphanNodeIds.length) failures.push(...orphanNodeIds.map((id) => `orphan-node:${id}`));

  return {
    valid: failures.length === 0,
    failures,
    orphanNodeIds,
    nodeCount: scrimedPlatformGraphNodes.length,
    edgeCount: scrimedPlatformGraphEdges.length
  };
}

export function getScrimedPlatformGraph() {
  const validation = validateScrimedPlatformGraph();
  const graph = {
    schemaVersion: "scrimed.platform-graph.v1" as const,
    version: scrimedPlatformGraphVersion,
    strategyVersion: scrimedPlatformStrategyVersion,
    status: validation.valid ? "VALID_SYNTHETIC_ARCHITECTURE_GRAPH" : "INVALID_REVIEW_REQUIRED",
    boundary: `${scrimedPlatformGraphBoundary} ${scrimedPlatformStrategyBoundary}`,
    validation,
    nodes: scrimedPlatformGraphNodes,
    edges: scrimedPlatformGraphEdges,
    summaries: {
      byNodeType: Object.fromEntries(
        [...new Set(scrimedPlatformGraphNodes.map((entry) => entry.type))].map((type) => [
          type,
          scrimedPlatformGraphNodes.filter((entry) => entry.type === type).length
        ])
      ),
      byRelation: Object.fromEntries(
        [...new Set(scrimedPlatformGraphEdges.map((entry) => entry.relation))].map((relation) => [
          relation,
          scrimedPlatformGraphEdges.filter((entry) => entry.relation === relation).length
        ])
      ),
      unsafeExternalActionPaths: 0,
      productionAuthorityGranted: false as const,
      externalDistributionAuthorityGranted: false as const
    },
    knownConstraints: [
      "The working-tree release node is mutable until a clean candidate commit is created.",
      "Protected-pilot activation, migration, AAL2, named review, distribution, and deployment remain separate gates.",
      "Graph membership does not establish production maturity, regulatory status, customer adoption, partnership, revenue, or ROI."
    ]
  };

  return {
    ...graph,
    integrityHash: createClinicalEvidenceHash(graph)
  };
}
