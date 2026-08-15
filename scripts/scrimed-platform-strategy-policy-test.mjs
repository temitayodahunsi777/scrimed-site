#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  getPlatformStrategySummary,
  platformCapabilityRegistry,
  platformMoatRegistry,
  platformPortfolioScorecards,
  platformPortfolioRationalization,
  strategicMetricRegistry,
  validatePlatformCapabilityRegistry
} from "../app/lib/scrimed-control-plane/platformStrategy.ts";

const validation = validatePlatformCapabilityRegistry();
assert.deepEqual(validation, { valid: true, failures: [] });

const summary = getPlatformStrategySummary();
assert.equal(summary.capabilityCount, 12);
assert.equal(summary.platformPlanes.length, 11);
assert.ok(Object.values(summary.countsByPlane).every((count) => count > 0));
assert.equal(summary.productionAuthorityGranted, false);
assert.equal(summary.externalActionsExecuted, false);
assert.equal(summary.coreWedge.offerSlug, "workflow-intelligence-assessment");
assert.equal(summary.sourceAlignment.sourceOfferExists, true);
assert.match(summary.auditHash, /^[0-9a-f]{64}$/);
assert.equal(getPlatformStrategySummary().auditHash, summary.auditHash);

assert.ok(platformCapabilityRegistry.every((entry) => entry.externalActionsEnabled === false));
assert.ok(platformCapabilityRegistry.every((entry) => entry.product.length > 0));
assert.ok(platformCapabilityRegistry.every((entry) => entry.permittedJurisdictions.length > 0));
assert.ok(platformCapabilityRegistry.every((entry) => entry.externalSideEffects.length === 0));
assert.ok(
  platformCapabilityRegistry
    .filter((entry) => entry.riskTier === "high")
    .every((entry) => entry.highRiskDefaultOff)
);
assert.ok(
  platformCapabilityRegistry.every(
    (entry) => !entry.allowedDataClassifications.includes("phi-prohibited")
  )
);
assert.equal(
  platformCapabilityRegistry.find((entry) => entry.id === "governed-partner-marketplace")
    ?.activationStatus,
  "disabled-external-gate"
);
assert.equal(
  platformCapabilityRegistry.find((entry) => entry.id === "documentation-authorization-wedge")
    ?.allowedToolClasses.includes("external-communication"),
  false
);

assert.deepEqual(
  strategicMetricRegistry.map((metric) => metric.currentValue),
  [null, null, null]
);
assert.ok(strategicMetricRegistry.every((metric) => metric.syntheticOnly));
assert.equal(
  platformPortfolioRationalization.find((item) => item.id === "partner-agent-marketplace")
    ?.disposition,
  "incubate"
);
assert.ok(platformMoatRegistry.every((moat) => moat.blockedClaim.length > 0));
assert.equal(platformPortfolioScorecards.length, 7);
assert.ok(platformPortfolioScorecards.every((entry) => entry.priorityScore >= 0 && entry.priorityScore <= 100));
assert.ok(platformPortfolioScorecards.every((entry) => entry.externalAuthorityGranted === false));
assert.equal(
  [...platformPortfolioScorecards].sort((a, b) => b.priorityScore - a.priorityScore)[0]?.id,
  "workflow-intelligence-entry-wedge"
);

console.log(
  "pass SCRIMED platform strategy policy tests (capability ownership, 11-plane coverage, commercial wedge, no-PHI defaults, evidence metrics, and moat boundaries)"
);
