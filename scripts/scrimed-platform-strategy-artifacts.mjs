#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { getPlatformStrategySummary } from "../app/lib/scrimed-control-plane/platformStrategy.ts";

const checkOnly = process.argv.includes("--check");
const summary = getPlatformStrategySummary();

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
