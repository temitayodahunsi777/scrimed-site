#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { getInvestorReadinessScorecard } from "../app/lib/investorReadinessScorecard.ts";
import {
  buildPostPr25EvidenceGraph,
  verifyPlatformEvidenceGraph
} from "../app/lib/platformEvidenceGraph.ts";
import { getPostPr25PlatformAdvanceSummary } from "../app/lib/postPr25PlatformAdvance.ts";
import { getReleaseStateSummary } from "../app/lib/releaseStateMachine.ts";
import { getStrategicPartnerReadinessSummary } from "../app/lib/strategicPartnerReadiness.ts";
import {
  buildDocumentationAuthorizationPilot,
  buildSyntheticPilotEvidencePack
} from "../app/lib/syntheticPilotFactory.ts";

const checkOnly = process.argv.includes("--check");
const summary = getPostPr25PlatformAdvanceSummary();
const release = getReleaseStateSummary();
const partners = getStrategicPartnerReadinessSummary();
const investor = getInvestorReadinessScorecard();
const graph = buildPostPr25EvidenceGraph();
const pilot = buildDocumentationAuthorizationPilot();

const artifacts = {
  "artifacts/release/release-state.json": {
    schemaVersion: "scrimed.release-state.v1",
    frozenCandidate: summary.frozenReviewBaseline,
    release,
    mergeReadiness: summary.mergeReadiness,
    boundary: summary.boundary
  },
  "artifacts/partners/strategic-readiness-matrix.json": {
    schemaVersion: "scrimed.strategic-readiness-matrix.v1",
    ...partners
  },
  "artifacts/investor/investor-readiness-scorecard.json": {
    schemaVersion: "scrimed.investor-readiness-scorecard.v1",
    ...investor
  },
  "artifacts/evidence/post-pr25-evidence-graph.json": {
    schemaVersion: "scrimed.platform-evidence-graph.v2",
    graph,
    integrity: verifyPlatformEvidenceGraph(graph)
  },
  "artifacts/pilots/documentation-authorization-synthetic-pilot.json": {
    schemaVersion: "scrimed.synthetic-pilot.v1",
    definition: pilot,
    evidencePack: buildSyntheticPilotEvidencePack(pilot)
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
      console.error(`SCRIMED post-PR25 artifact drift: ${path}`);
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
    "Run npm run evidence:post-pr25-platform and review the deterministic artifact changes."
  );
  process.exit(1);
}

if (checkOnly) {
  console.log(
    `pass SCRIMED post-PR25 deterministic artifact integrity (${Object.keys(artifacts).length} artifacts)`
  );
}
