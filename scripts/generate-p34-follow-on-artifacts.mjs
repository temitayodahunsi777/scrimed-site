#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  inspectP34CandidateState,
  p34Predecessor,
  sha256
} from "./lib/p34-candidate-state.mjs";

const checkOnly = process.argv.includes("--check");
const allowed = new Set(["--check"]);
const unknown = process.argv.slice(2).filter((arg) => !allowed.has(arg));
if (unknown.length > 0) throw new Error(`Unsupported p.34 follow-on artifact option: ${unknown.join(", ")}`);

const state = inspectP34CandidateState();
const integrationBase = {
  schemaVersion: "scrimed-p34-follow-on-integration-map-v1",
  repository: state.repository,
  branch: state.branch,
  predecessor: p34Predecessor,
  bindingArtifact: "artifacts/release/p34-current-candidate.json",
  classificationPolicy: [
    "CORE_RUNTIME", "GOVERNANCE", "SECURITY", "PILOT", "COMMERCIAL", "VERCEL",
    "SUPABASE", "AAL2", "UI", "TEST", "GENERATED_EVIDENCE", "DOCUMENTATION",
    "CONFIGURATION", "UNEXPECTED"
  ],
  fileCount: state.integrationEntries.length,
  classificationCounts: state.classificationCounts,
  unexplainedFileCount: state.unexplainedFileCount,
  files: state.integrationEntries,
  reviewStatus: "EXACT_REVIEW_REQUIRED",
  humanApprovalPresent: false,
  mergeAuthorityGranted: false,
  productionAuthorityGranted: false
};
if (integrationBase.unexplainedFileCount !== 0) {
  throw new Error(`p.34 integration map has ${integrationBase.unexplainedFileCount} unexplained file(s).`);
}
const integrationMap = { ...integrationBase, mapFingerprint: sha256(integrationBase) };

const discovery = `# p.34 Current State Discovery\n\n` +
  `Status: **CURRENT FOLLOW-ON CANDIDATE / AUTOMATED ASSURANCE IN PROGRESS**\n\n` +
  `| Field | Verified repository state |\n| --- | --- |\n` +
  `| Branch | \`${state.branch}\` |\n` +
  `| Exact candidate binding | generated post-commit in \`artifacts/release/p34-current-candidate.json\` |\n` +
  `| Upstream | ${state.upstream ? `\`${state.upstream}\`` : "not configured"} |\n` +
  `| Predecessor | PR #${p34Predecessor.pullRequestNumber}, \`${p34Predecessor.commitSha}\` |\n` +
  `| Current PR | ${state.currentPr ? `#${state.currentPr.number}` : "not created at discovery"} |\n` +
  `| Node | ${state.runtime.node} locally; 24.x required |\n` +
  `| Vercel | current follow-on preview not yet bound at discovery |\n` +
  `| Supabase | \`${state.supabase.projectName}\`; leaked-password protection remains operator-required |\n` +
  `| Migrations | three production-unapplied migrations; production application prohibited |\n` +
  `| AAL2 | fresh exact-preview operator evidence required |\n` +
  `| Human review | not present for this follow-on candidate |\n\n` +
  `The runtime candidate manifest is generated after source stabilization with \`npm run scrimed:p34:evidence\`. It is ignored by Git so exact commit evidence does not create a self-referential source mutation.\n`;

const reconciliation = `# p.34 Source-Control Reconciliation\n\n` +
  `## Preserved Predecessor\n\nPR #${p34Predecessor.pullRequestNumber} and commit \`${p34Predecessor.commitSha}\` remain **PREDECESSOR** evidence. This follow-on never rewrites or force-pushes that target.\n\n` +
  `## Current Lineage\n\nThe current branch \`${state.branch}\` descends directly from the predecessor and is intended for a new, focused PR whose base is \`${p34Predecessor.branch}\`. The generated integration map explains ${integrationMap.fileCount} files and permits zero \`UNEXPECTED\` entries.\n\n` +
  `## Evidence Statuses\n\n` +
  `- PR #39 review material: **PREDECESSOR**\n` +
  `- p.34 follow-on source: **CURRENT**\n` +
  `- tracked route/generation inventories: **REGENERATED** by the inventory-enabled build\n` +
  `- current candidate manifest: **REGENERATED** after every source or evidence change\n` +
  `- old fingerprints copied into predecessor records: **PREDECESSOR**, never current approval\n` +
  `- exact Vercel preview, AAL2, Supabase toggle, named review: **OPERATOR_ACTION_REQUIRED** until observed\n\n` +
  `No force push, merge, deployment, migration, production alias, PHI operation, or customer activation is authorized by this reconciliation.\n`;

const focusedPr = `# p.34 Focused PR Construction\n\n` +
  `Base the follow-on PR on \`${p34Predecessor.branch}\` at \`${p34Predecessor.commitSha}\`. This isolates the Synthetic Pilot Operating System and preproduction-assurance delta instead of replaying the inherited history visible in PR #39.\n\n` +
  `Required PR properties:\n\n` +
  `- new PR; do not retarget or rewrite PR #39;\n` +
  `- head branch \`${state.branch}\`;\n` +
  `- exact candidate manifest attached or quoted after the final commit;\n` +
  `- ${integrationMap.fileCount}/${integrationMap.fileCount} files explained; zero unexpected;\n` +
  `- draft until automated checks and exact preview are complete;\n` +
  `- human review grants review evidence only, never merge or production authority.\n`;

const integrationDoc = `# p.34 Follow-On Integration Map\n\n` +
  `Status: **EXACT_REVIEW_REQUIRED**\n\n` +
  `Files explained: **${integrationMap.fileCount}/${integrationMap.fileCount}**\n\nUnexplained: **${integrationMap.unexplainedFileCount}**\n\nMap SHA-256: \`${integrationMap.mapFingerprint}\`\n\n` +
  `| Classification | Files |\n| --- | ---: |\n` +
  Object.entries(integrationMap.classificationCounts).map(([name, count]) => `| ${name} | ${count} |`).join("\n") +
  `\n\nThe machine-readable path-by-path inventory is \`artifacts/review/p34-integration-map.json\`. Review evidence must bind the exact runtime candidate manifest; this map grants no approval.\n`;

const reviewBrief = `# p.34 Follow-On Review Brief\n\nTarget review time: **10-15 minutes**\n\n` +
  `## Decision\n\nConfirm whether the exact follow-on head preserves synthetic-only, no-PHI, nonproduction operation while adding bounded commercial pilot controls and reproducible preproduction evidence.\n\n` +
  `## Highest-Risk Review Order\n\n` +
  `1. \`app/lib/commercial/pilotManifest.ts\`: no-PHI, exact-candidate, bounded runtime and authority invariants.\n` +
  `2. \`app/lib/commercial/pilotOperatingSystem.ts\`: legal lifecycle transitions, immutable evidence chain, expansion and proposal boundaries.\n` +
  `3. \`app/lib/economics/pilotCostGovernor.ts\`: safe stop, cost/call/depth/storage ceilings, simulated value labels.\n` +
  `4. \`app/lib/scrimed-p34/reviewReadiness.ts\` and preview tooling: stale evidence and exact-head mismatch fail closed.\n` +
  `5. Product Console and UI: truthful candidate, preview, AAL2, Supabase, migration, autonomy, pilot and production states.\n` +
  `6. Route/generation inventories and one-command runners: no manual count drift or false-green fallback.\n\n` +
  `## Retained Boundaries\n\n` +
  `No production, migration, PHI, A3 clinical autonomy, diagnosis, treatment, triage, payer submission, EHR/device writeback, customer activation, external distribution, contract signature, discount, or delivery-date authority.\n\n` +
  `## Reviewer Record\n\nBind reviewer identity and decision to the exact PR, commit, tree, candidate, source, validation, review packet, gate packet, SBOM, and preview. Any source change makes the review stale.\n`;

const outputs = [
  ["artifacts/review/p34-integration-map.json", `${JSON.stringify(integrationMap, null, 2)}\n`],
  ["docs/release/P34_CURRENT_STATE_DISCOVERY.md", discovery],
  ["docs/release/P34_SOURCE_CONTROL_RECONCILIATION.md", reconciliation],
  ["docs/review/P34_FOCUSED_PR_CONSTRUCTION.md", focusedPr],
  ["docs/review/P34_INTEGRATION_MAP.md", integrationDoc],
  ["docs/review/P34_REVIEW_BRIEF.md", reviewBrief]
];

await mkdir("artifacts/review", { recursive: true });
for (const [path, expected] of outputs) {
  if (checkOnly) {
    const actual = await readFile(path, "utf8");
    if (actual !== expected) throw new Error(`${path} is stale; run npm run generate:p34-follow-on-artifacts.`);
  } else {
    await writeFile(path, expected, "utf8");
  }
}
console.log(`${checkOnly ? "pass" : "generated"} p.34 follow-on artifacts (${integrationMap.fileCount} mapped files, 0 unexplained)`);
