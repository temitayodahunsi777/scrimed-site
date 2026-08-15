#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  getScrimedPlatformGraph,
  scrimedPlatformGraphEdges,
  scrimedPlatformGraphNodes,
  validateScrimedPlatformGraph
} from "../app/lib/scrimed-control-plane/platformGraph.ts";

const validation = validateScrimedPlatformGraph();
assert.equal(validation.valid, true);
assert.deepEqual(validation.failures, []);
assert.deepEqual(validation.orphanNodeIds, []);
assert.equal(validation.nodeCount, scrimedPlatformGraphNodes.length);
assert.equal(validation.edgeCount, scrimedPlatformGraphEdges.length);

const graph = getScrimedPlatformGraph();
assert.equal(graph.status, "VALID_SYNTHETIC_ARCHITECTURE_GRAPH");
assert.equal(graph.summaries.unsafeExternalActionPaths, 0);
assert.equal(graph.summaries.productionAuthorityGranted, false);
assert.equal(graph.summaries.externalDistributionAuthorityGranted, false);
assert.match(graph.integrityHash, /^[0-9a-f]{64}$/);
assert.equal(getScrimedPlatformGraph().integrityHash, graph.integrityHash);

for (const node of graph.nodes) {
  assert.equal(node.syntheticOnly, true);
  assert.equal(node.externalAuthorityGranted, false);
  assert.match(node.auditHash, /^[0-9a-f]{64}$/);
}

for (const edge of graph.edges) {
  assert.ok(graph.nodes.some((node) => node.id === edge.from));
  assert.ok(graph.nodes.some((node) => node.id === edge.to));
  assert.match(edge.auditHash, /^[0-9a-f]{64}$/);
}

for (const capability of graph.nodes.filter((node) => node.type === "capability")) {
  assert.ok(graph.edges.some((edge) => edge.from === capability.id && edge.relation === "governed_by"));
  if (capability.riskTier === "high") {
    assert.ok(graph.edges.some((edge) => edge.from === capability.id && edge.relation === "reviewed_by"));
  }
}

console.log(
  `pass SCRIMED platform graph policy tests (${graph.nodes.length} nodes, ${graph.edges.length} edges, zero orphans, zero unsafe external-action paths)`
);
