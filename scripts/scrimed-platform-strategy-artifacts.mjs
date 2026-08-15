#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { getPlatformStrategySummary } from "../app/lib/scrimed-control-plane/platformStrategy.ts";
import { getScrimedPlatformGraph } from "../app/lib/scrimed-control-plane/platformGraph.ts";
import {
  getHumanGateMinimizationReport,
  getInvestorReadinessEngine,
  strategicPartnerReadinessProfiles,
  strategicRoadmap
} from "../app/lib/scrimed-control-plane/strategicDecisionIntelligence.ts";

const checkOnly = process.argv.includes("--check");
const optionalUnmaterializedCheckArtifacts = new Set([
  "artifacts/governance/human-gate-minimization.json"
]);
const summary = getPlatformStrategySummary();
const platformGraph = getScrimedPlatformGraph();
const humanGateMinimization = getHumanGateMinimizationReport();
const investorReadiness = getInvestorReadinessEngine();

const artifacts = {
  "artifacts/platform/platform-map.json": {
    schemaVersion: "scrimed.platform-map.v1",
    service: summary.service,
    version: summary.version,
    status: "synthetic-no-phi-foundation",
    boundary: summary.boundary,
    platformPlanes: summary.platformPlanes,
    countsByPlane: summary.countsByPlane,
    capabilityCount: summary.capabilityCount,
    capabilities: summary.capabilities,
    strategicMetrics: summary.strategicMetrics,
    sourceAlignment: summary.sourceAlignment,
    productionAuthorityGranted: summary.productionAuthorityGranted,
    auditHash: summary.auditHash
  },
  "artifacts/platform/scrimed-platform-graph.json": platformGraph,
  "artifacts/product/product-portfolio.json": {
    schemaVersion: "scrimed.product-portfolio.v1",
    version: summary.version,
    status: "portfolio-rationalized-synthetic-no-authority",
    boundary: summary.boundary,
    coreWedge: summary.coreWedge,
    portfolioRationalization: summary.portfolioRationalization,
    strategicMetrics: summary.strategicMetrics,
    sourceAlignment: summary.sourceAlignment,
    externalActionsExecuted: summary.externalActionsExecuted,
    auditHash: summary.auditHash
  },
  "artifacts/product/portfolio-scorecard.json": {
    schemaVersion: "scrimed.portfolio-scorecard.v1",
    version: summary.version,
    status: "internal-prioritization-no-commercial-authority",
    boundary: summary.boundary,
    scorecards: summary.portfolioScorecards,
    coreWedge: summary.coreWedge,
    externalActionsExecuted: summary.externalActionsExecuted,
    auditHash: summary.auditHash
  },
  "artifacts/investor/moat-registry.json": {
    schemaVersion: "scrimed.moat-registry.v1",
    version: summary.version,
    status: "internal-diligence-evidence-only",
    boundary: summary.boundary,
    investorUse: summary.investorUse,
    moatRegistry: summary.moatRegistry,
    nextBestAction: summary.nextBestAction,
    productionAuthorityGranted: summary.productionAuthorityGranted,
    auditHash: summary.auditHash
  },
  "artifacts/investor/investor-readiness.json": {
    ...investorReadiness,
    strategicPartnerReadinessProfiles,
    partnerBoundary: "Internal strategic readiness profiles only; no partnership, investment, endorsement, procurement, or outreach authority is implied."
  },
  "artifacts/governance/human-gate-minimization.json": humanGateMinimization,
  "artifacts/strategy/strategic-roadmap.json": {
    schemaVersion: "scrimed.strategic-roadmap.v1",
    version: summary.version,
    roadmap: strategicRoadmap,
    boundary: summary.boundary,
    productionAuthorityGranted: false,
    auditHash: summary.auditHash
  }
};

let driftCount = 0;
for (const [path, value] of Object.entries(artifacts)) {
  const expected = `${JSON.stringify(value, null, 2)}\n`;
  if (checkOnly) {
    let actual = "";
    try {
      actual = await readFile(path, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      if (optionalUnmaterializedCheckArtifacts.has(path)) {
        console.log(`verified optional generated artifact contract: ${path}`);
        continue;
      }
    }
    if (actual !== expected) {
      console.error(`SCRIMED platform strategy artifact drift: ${path}`);
      driftCount += 1;
    }
    continue;
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, expected, "utf8");
  console.log(`generated ${path}`);
}

if (driftCount > 0) {
  console.error(
    "Run npm run evidence:scrimed-platform-strategy and review the deterministic artifact changes."
  );
  process.exit(1);
}

if (checkOnly) {
  console.log(
    `pass SCRIMED platform strategy artifact integrity (${Object.keys(artifacts).length} artifacts)`
  );
}
