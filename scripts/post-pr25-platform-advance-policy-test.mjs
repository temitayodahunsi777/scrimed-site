#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  calculateEconomicUnitModel,
  evaluateCapitalEfficiencyBudget
} from "../app/lib/economicUnitModel.ts";
import { getInvestorReadinessScorecard } from "../app/lib/investorReadinessScorecard.ts";
import {
  buildPostPr25EvidenceGraph,
  createEvidenceEdge,
  createEvidenceNode,
  verifyPlatformEvidenceGraph
} from "../app/lib/platformEvidenceGraph.ts";
import { getPostPr25PlatformAdvanceSummary } from "../app/lib/postPr25PlatformAdvance.ts";
import { resolvePublicClaim } from "../app/lib/publicClaimResolver.ts";
import { platformMoatRegistry } from "../app/lib/scrimed-control-plane/platformStrategy.ts";
import { buildDevelopmentContinuityPlan } from "../app/lib/scrimed-work/developmentContinuity.ts";
import { getStrategicPartnerReadinessSummary } from "../app/lib/strategicPartnerReadiness.ts";
import {
  buildDocumentationAuthorizationPilot,
  buildSyntheticPilotEvidencePack
} from "../app/lib/syntheticPilotFactory.ts";

const summary = getPostPr25PlatformAdvanceSummary();
assert.equal(summary.frozenReviewBaseline.headSha, "c15a79c76d59a2f94bb7f999469da8bbc1618d8c");
assert.equal(summary.release.currentState, "REVIEW_REQUESTED");
assert.equal(summary.mergeReadiness.status, "NOT_READY_FOR_MERGE");
assert.equal(
  summary.exactHeadReview.bindingVersion,
  "scrimed-exact-head-review-binding-v5-2026-08-10"
);
assert.ok(
  summary.mergeReadiness.reasonCodes.includes("merge-exact-head-approval-missing")
);
assert.equal(summary.productionAuthorityGranted, false);
assert.equal(summary.externalActionsExecuted, false);

const investor = getInvestorReadinessScorecard();
assert.equal(investor.dimensions.length, 14);
assert.ok(investor.dimensions.every((dimension) => dimension.evidenceSources.length > 0));
assert.ok(investor.dimensions.every((dimension) => dimension.deficiencies.length > 0));
assert.match(investor.boundary, /does not imply investment/i);

const partners = getStrategicPartnerReadinessSummary();
assert.equal(partners.profileCount, 13);
assert.ok(
  partners.profiles.every(
    (entry) => entry.disclaimer === "Strategic readiness profile — no partnership implied."
  )
);
assert.equal(partners.externalActionsExecuted, false);

assert.equal(platformMoatRegistry.length, 13);
assert.ok(platformMoatRegistry.every((entry) => entry.replicationDifficulty >= 1));
assert.ok(platformMoatRegistry.every((entry) => entry.evidenceNeeded.length > 0));
assert.ok(platformMoatRegistry.every((entry) => entry.dependencies.length > 0));
assert.ok(platformMoatRegistry.every((entry) => entry.monetizationRelevance.length > 0));

const graph = buildPostPr25EvidenceGraph();
assert.deepEqual(verifyPlatformEvidenceGraph(graph).failures, []);
const tamperedGraph = structuredClone(graph);
tamperedGraph.nodes[0].label = "tampered";
assert.equal(verifyPlatformEvidenceGraph(tamperedGraph).valid, false);
const tamperedGraphClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: tamperedGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(tamperedGraphClaim.publishable, false);
assert.ok(
  tamperedGraphClaim.reasonCodes.includes("public-claim-evidence-graph-invalid")
);

const unsupportedClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:unsupported-denial-result",
    text: "SCRIMED reduces denials by 40%.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "external-validated",
    owner: "Claims Governance",
    reviewDate: "2026-08-09T21:01:09.000Z",
    publicationAuthorized: false,
    syntheticOrEstimated: false
  },
  graph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(unsupportedClaim.decision, "BLOCK");
assert.equal(unsupportedClaim.publishable, false);

const unpublishedQualitativeClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:unpublished-internal-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-09T21:01:09.000Z",
    publicationAuthorized: false,
    syntheticOrEstimated: false
  },
  graph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(unpublishedQualitativeClaim.decision, "BLOCK");
assert.equal(unpublishedQualitativeClaim.publishable, false);
assert.ok(
  unpublishedQualitativeClaim.reasonCodes.includes(
    "public-claim-publication-approval-missing"
  )
);

const unrelatedEvidenceClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["policy:synthetic-no-phi"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(unrelatedEvidenceClaim.publishable, false);
assert.ok(
  unrelatedEvidenceClaim.reasonCodes.includes(
    "public-claim-evidence-relationship-missing"
  )
);

const contradictedGraph = structuredClone(graph);
contradictedGraph.edges.push(
  createEvidenceEdge({
    id: "edge:source-contradicts-platform-narrative",
    from: "source:pr25-exact-head",
    to: "claim:investor-platform-narrative",
    relation: "contradicts",
    createdAt: "2026-08-10T12:00:00.000Z"
  })
);
const contradictedClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: contradictedGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(contradictedClaim.publishable, false);
assert.ok(
  contradictedClaim.reasonCodes.includes("public-claim-evidence-contradicted")
);
const indirectlyContradictedClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["benchmark:pr25-ci"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: contradictedGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(indirectlyContradictedClaim.publishable, false);
assert.ok(
  indirectlyContradictedClaim.reasonCodes.includes(
    "public-claim-evidence-contradicted"
  )
);

const externalContradictionGraph = structuredClone(graph);
externalContradictionGraph.nodes.push(
  createEvidenceNode({
    id: "source:independent-counter-evidence",
    type: "source",
    label: "Independent counter-evidence",
    sourceType: "synthetic-policy-test",
    sourceReference: "synthetic:counter-evidence",
    confidence: 0.9,
    maturity: "local-verified",
    createdAt: "2026-08-10T10:00:00.000Z",
    expiresAt: null
  })
);
externalContradictionGraph.edges.push(
  createEvidenceEdge({
    id: "edge:external-counter-evidence-contradicts-platform-narrative",
    from: "source:independent-counter-evidence",
    to: "claim:investor-platform-narrative",
    relation: "contradicts",
    createdAt: "2026-08-10T10:00:00.000Z"
  })
);
const externallyContradictedClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: externalContradictionGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(externallyContradictedClaim.publishable, false);
assert.ok(
  externallyContradictedClaim.reasonCodes.includes(
    "public-claim-evidence-contradicted"
  )
);

const expiredEvidenceGraph = structuredClone(graph);
expiredEvidenceGraph.edges.push(
  createEvidenceEdge({
    id: "edge:stale-approval-supports-platform-narrative",
    from: "approval:pr25-historical-stale",
    to: "claim:investor-platform-narrative",
    relation: "supports",
    createdAt: "2026-08-09T20:40:00.000Z"
  })
);
const expiredEvidenceClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["approval:pr25-historical-stale"],
    evidenceMaturityRequired: "independently-reviewed",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: expiredEvidenceGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(expiredEvidenceClaim.publishable, false);
assert.ok(
  expiredEvidenceClaim.reasonCodes.includes("public-claim-evidence-expired")
);

const expiredIntermediateGraph = structuredClone(graph);
expiredIntermediateGraph.nodes = expiredIntermediateGraph.nodes.map((node) =>
  node.id === "source:pr25-exact-head"
    ? createEvidenceNode({
        id: node.id,
        type: node.type,
        label: node.label,
        sourceType: node.sourceType,
        sourceReference: node.sourceReference,
        confidence: node.confidence,
        maturity: node.maturity,
        createdAt: node.createdAt,
        expiresAt: "2026-08-10T11:00:00.000Z"
      })
    : node
);
const expiredIntermediateClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["benchmark:pr25-ci"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: expiredIntermediateGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(expiredIntermediateClaim.publishable, false);
assert.ok(
  expiredIntermediateClaim.reasonCodes.includes(
    "public-claim-evidence-path-inactive"
  )
);

const futureEdgeGraph = structuredClone(graph);
futureEdgeGraph.edges = futureEdgeGraph.edges.map((edge) =>
  edge.id === "edge:source-supports-platform-narrative"
    ? createEvidenceEdge({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        relation: edge.relation,
        createdAt: "2026-08-10T13:00:00.000Z"
      })
    : edge
);
const futureEdgeClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: futureEdgeGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(futureEdgeClaim.publishable, false);
assert.ok(
  futureEdgeClaim.reasonCodes.includes("public-claim-evidence-path-inactive")
);

const malformedExpiryGraph = structuredClone(graph);
malformedExpiryGraph.nodes = malformedExpiryGraph.nodes.map((node) =>
  node.id === "source:pr25-exact-head"
    ? createEvidenceNode({
        id: node.id,
        type: node.type,
        label: node.label,
        sourceType: node.sourceType,
        sourceReference: node.sourceReference,
        confidence: node.confidence,
        maturity: node.maturity,
        createdAt: node.createdAt,
        expiresAt: "not-a-date"
      })
    : node
);
const malformedExpiryIntegrity = verifyPlatformEvidenceGraph(malformedExpiryGraph);
assert.equal(malformedExpiryIntegrity.valid, false);
assert.ok(
  malformedExpiryIntegrity.failures.includes(
    "invalid-evidence-expiry:source:pr25-exact-head"
  )
);
const malformedExpiryClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: malformedExpiryGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(malformedExpiryClaim.publishable, false);
assert.ok(
  malformedExpiryClaim.reasonCodes.includes("public-claim-evidence-graph-invalid")
);

const nonCanonicalTimestampGraph = structuredClone(graph);
nonCanonicalTimestampGraph.nodes = nonCanonicalTimestampGraph.nodes.map((node) => {
  if (node.id === "source:pr25-exact-head") {
    return createEvidenceNode({
      id: node.id,
      type: node.type,
      label: node.label,
      sourceType: node.sourceType,
      sourceReference: node.sourceReference,
      confidence: node.confidence,
      maturity: node.maturity,
      createdAt: "2026-02-30T12:00:00.000Z",
      expiresAt: node.expiresAt
    });
  }
  if (node.id === "benchmark:pr25-ci") {
    return createEvidenceNode({
      id: node.id,
      type: node.type,
      label: node.label,
      sourceType: node.sourceType,
      sourceReference: node.sourceReference,
      confidence: node.confidence,
      maturity: node.maturity,
      createdAt: node.createdAt,
      expiresAt: "2026-11-31T12:00:00.000Z"
    });
  }
  return node;
});
nonCanonicalTimestampGraph.edges = nonCanonicalTimestampGraph.edges.map((edge) =>
  edge.id === "edge:source-supports-platform-narrative"
    ? createEvidenceEdge({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        relation: edge.relation,
        createdAt: "2026-02-30T12:00:00.000Z"
      })
    : edge
);
const nonCanonicalTimestampIntegrity = verifyPlatformEvidenceGraph(
  nonCanonicalTimestampGraph
);
assert.equal(nonCanonicalTimestampIntegrity.valid, false);
assert.ok(
  nonCanonicalTimestampIntegrity.failures.includes(
    "invalid-evidence-created-at:source:pr25-exact-head"
  )
);
assert.ok(
  nonCanonicalTimestampIntegrity.failures.includes(
    "invalid-evidence-expiry:benchmark:pr25-ci"
  )
);
assert.ok(
  nonCanonicalTimestampIntegrity.failures.includes(
    "invalid-evidence-edge-created-at:edge:source-supports-platform-narrative"
  )
);
const nonCanonicalTimestampClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph: nonCanonicalTimestampGraph,
  evaluatedAt: "2026-08-10T12:00:00.000Z"
});
assert.equal(nonCanonicalTimestampClaim.publishable, false);
assert.ok(
  nonCanonicalTimestampClaim.reasonCodes.includes(
    "public-claim-evidence-graph-invalid"
  )
);

const nonCanonicalEvaluationTimeClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:investor-platform-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-10T12:00:00.000Z",
    publicationAuthorized: true,
    syntheticOrEstimated: false
  },
  graph,
  evaluatedAt: "2026-02-30T12:00:00.000Z"
});
assert.equal(nonCanonicalEvaluationTimeClaim.publishable, false);
assert.ok(
  nonCanonicalEvaluationTimeClaim.reasonCodes.includes(
    "public-claim-evaluation-time-invalid"
  )
);

const economics = calculateEconomicUnitModel({
  scenarioId: "policy-test",
  evidenceTag: "SIMULATED",
  attemptedTasks: 10,
  verifiedSuccessfulTasks: 5,
  inferenceCostUsd: 10,
  infrastructureCostUsd: 10,
  reviewCostUsd: 20,
  implementationCostUsd: 40,
  supportCostUsd: 10,
  retryCostUsd: 5,
  correctionCostUsd: 5,
  workflowValuePerVerifiedTaskUsd: null,
  contractedRevenuePerVerifiedTaskUsd: null
});
assert.equal(economics.totalCostUsd, 100);
assert.equal(economics.costPerVerifiedTaskUsd, 20);
assert.equal(economics.grossMarginEstimate, null);
assert.equal(economics.productionMetric, false);

const budget = evaluateCapitalEfficiencyBudget({
  budget: {
    dailyCapUsd: 10,
    monthlyCapUsd: 100,
    taskCapUsd: 4,
    providerConcentrationCap: 0.7
  },
  currentDailySpendUsd: 8,
  currentMonthlySpendUsd: 50,
  proposedTaskCostUsd: 5,
  providerConcentration: 0.8
});
assert.equal(budget.decision, "HARD_STOP");
assert.equal(budget.externalSpendExecuted, false);

const pilot = buildDocumentationAuthorizationPilot();
const pilotPack = buildSyntheticPilotEvidencePack(pilot);
assert.equal(pilot.externalActionsEnabled, false);
assert.equal(pilotPack.label, "SYNTHETIC");
assert.equal(pilotPack.outcomes.length, 0);
assert.equal(pilotPack.cost, "UNAVAILABLE");
assert.equal(pilotPack.productionAuthorityGranted, false);

const continuity = buildDevelopmentContinuityPlan();
assert.ok(continuity.bestNextAction);
assert.ok(continuity.bestLowRiskAction);
assert.ok(continuity.bestMoatAction);
assert.ok(continuity.bestRevenueAction);
assert.ok(continuity.bestInvestorReadinessAction);
assert.ok(continuity.actions.every((action) => action.strategicValueScore >= 0));

console.log(
  "pass post-PR25 platform advancement policy tests (review/release separation, investor and partner truthfulness, moats, evidence integrity, claims, economics, pilots, and strategic planning)"
);
