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
  `| Current PR | #40 canonical review target; exact runtime state is recorded outside tracked source |\n` +
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

function p40ReviewLane(path) {
  const lower = path.toLowerCase();
  if (lower.includes("aal2")) return "AAL2";
  if (path.startsWith("supabase/") || lower.includes("supabase")) return "SUPABASE";
  if (lower.includes("vercel") || lower.includes("preview")) return "VERCEL";
  if (lower.includes("security") || lower.includes("secret") || lower.includes("egress") || lower.includes("tenant")) return "SECURITY";
  if (lower.includes("pilot") && !lower.includes("commercial")) return "PILOT_OS";
  if (lower.includes("commercial") || lower.includes("economics") || lower.includes("proposal") || lower.includes("buyer")) return "COMMERCIAL";
  if (path.startsWith("app/lib/scrimed-p34/") || lower.includes("governance") || lower.includes("review") || lower.includes("release") || path.startsWith("docs/") || path.startsWith("artifacts/")) return "GOVERNANCE";
  return "CORE_RUNTIME";
}

const p40Entries = state.integrationEntries.map((entry) => ({
  ...entry,
  reviewLane: p40ReviewLane(entry.path)
}));
const p40ReviewLanes = ["CORE_RUNTIME", "PILOT_OS", "COMMERCIAL", "SECURITY", "GOVERNANCE", "VERCEL", "SUPABASE", "AAL2"];
const p40MapBase = {
  schemaVersion: "scrimed-p40-full-integration-map-v1",
  repository: state.repository,
  pullRequestNumber: 40,
  branch: state.branch,
  machineRepairBaseCommit: "d074658b65399d91124f2a1b737e82ef50f69095",
  exactCandidateBinding: "artifacts/release/p34-exact-candidate-manifest.json",
  fileCount: p40Entries.length,
  reviewLaneCounts: Object.fromEntries(p40ReviewLanes.map((lane) => [lane, p40Entries.filter((entry) => entry.reviewLane === lane).length])),
  unexplainedFileCount: p40Entries.filter((entry) => entry.classification === "UNEXPECTED").length,
  files: p40Entries,
  reviewState: "EXACT_REVIEW_REQUIRED",
  humanApprovalPresent: false,
  mergeAuthorityGranted: false,
  productionAuthorityGranted: false
};
if (p40MapBase.unexplainedFileCount !== 0) throw new Error("PR #40 integration map contains unexplained files.");
const p40Map = { ...p40MapBase, mapFingerprint: sha256(p40MapBase) };

const p40ReviewIndexBase = {
  schemaVersion: "scrimed-p40-review-index-v1",
  repository: state.repository,
  pullRequestNumber: 40,
  branch: state.branch,
  exactCandidateBinding: "artifacts/release/p34-exact-candidate-manifest.json",
  integrationMap: "artifacts/review/p40-full-integration-map.json",
  integrationMapFingerprint: p40Map.mapFingerprint,
  targetReviewMinutes: 10,
  reviewState: "EXACT_REVIEW_REQUIRED",
  highestRiskFiles: [
    "app/lib/commercial/pilotManifest.ts",
    "app/lib/commercial/pilotOperatingSystem.ts",
    "app/lib/scrimed-p34/exactHeadReviewState.ts",
    "app/lib/scrimed-p34/reviewReadiness.ts",
    "app/lib/release/previewAcceptance.ts",
    "scripts/generate-p34-build-inventory.mjs",
    "scripts/scrimed-p34-certify.mjs"
  ],
  operatorStates: {
    aal2: "OPERATOR_ACTION_REQUIRED",
    supabaseLeakedPasswordProtection: "OPERATOR_ACTION_REQUIRED",
    productionMigrations: "PRODUCTION_MIGRATION_AUTHORIZATION_REQUIRED",
    protectedPilot: "PROTECTED_PILOT_AUTHORIZATION_REQUIRED"
  },
  safetyBoundary: {
    noPhi: true,
    nonproduction: true,
    noClinicalExecution: true,
    noPayerSubmission: true,
    noEhrWriteback: true,
    noDeviceWriteback: true,
    productionAuthorityGranted: false
  }
};
const p40ReviewIndex = { ...p40ReviewIndexBase, indexFingerprint: sha256(p40ReviewIndexBase) };

const canonicalBaselineDoc = `# p.34 Current Canonical Baseline\n\n` +
  `Status: **EXACT-HEAD INDEPENDENT REVIEW REQUIRED**\n\n` +
  `PR #40 on branch \`${state.branch}\` is the canonical review target. The machine-remediation base is \`d074658b65399d91124f2a1b737e82ef50f69095\`. Exact successor commit, tree, candidate, source, validation, review, gate, SBOM, route, render, preview, migration, AAL2, and security fingerprints are generated only after source stabilization in \`artifacts/release/p34-exact-candidate-manifest.json\`.\n\n` +
  `PR #39 remains predecessor evidence and cannot approve PR #40. Production, PHI, clinical execution, payer/EHR/device writeback, protected-pilot activation, customer activation, merge, migration, and external distribution remain separately gated.\n`;

const sourceIntegrityDoc = `# PR #40 Source-Control Integrity\n\n` +
  `The candidate descends from \`${p34Predecessor.commitSha}\` and preserves PR #39 as **PREDECESSOR**. The current path inventory contains ${p40Map.fileCount} classified files and ${p40Map.unexplainedFileCount} unexplained files.\n\n` +
  `| Artifact class | Status |\n| --- | --- |\n` +
  `| PR #39 exact-head evidence | PREDECESSOR |\n` +
  `| PR #40 source and tests | CURRENT |\n` +
  `| Legacy \`artifacts/p34/P34_*_INVENTORY.json\` | SUPERSEDED |\n` +
  `| \`artifacts/build/route-inventory.json\` | REGENERATED / CANONICAL BASELINE |\n` +
  `| \`artifacts/build/render-inventory.json\` | REGENERATED / CANONICAL BASELINE |\n` +
  `| Exact successor evidence | REGENERATED POST-COMMIT |\n\n` +
  `Ordinary builds are read-only with respect to the committed route/render baseline. An intentional route change requires the explicit baseline-update command plus review. No force push, merge, production deployment, migration, or external distribution is authorized.\n`;

const p40ReviewBrief = `# PR #40 Exact-Head Review Brief\n\nTarget review time: **10 minutes**\n\n` +
  `## Exact Binding\n\nOpen \`artifacts/release/p34-exact-candidate-manifest.json\` and verify PR 40, commit, tree, candidate, source, validation, review packet, gate packet, SBOM, route/render inventories, and preview deployment. Stop if the PR head differs.\n\n` +
  `## Review Order\n\n` +
  p40ReviewIndex.highestRiskFiles.map((path, index) => `${index + 1}. \`${path}\``).join("\n") +
  `\n\n## Required Safety Checks\n\nConfirm strict synthetic/no-PHI boundaries, tenant isolation, atomic approvals, kill switch, Oversight Sentinel, evidence-ledger integrity, independent route baseline, and truthful AAL2, Supabase, migration, commercial-authority, protected-pilot, and production states.\n\n` +
  `Only a named, external, exact-head review receipt may produce \`APPROVED_EXACT_HEAD\`. Review approval grants no merge, migration, production, PHI, clinical, payer, EHR/device, customer, contract, certification, compliance, or distribution authority.\n`;

const p40MapDoc = `# PR #40 Full Integration Map\n\nStatus: **EXACT_REVIEW_REQUIRED**\n\nFiles explained: **${p40Map.fileCount}/${p40Map.fileCount}**\n\nUnexplained: **${p40Map.unexplainedFileCount}**\n\nMap SHA-256: \`${p40Map.mapFingerprint}\`\n\n` +
  `| Review lane | Files |\n| --- | ---: |\n` +
  Object.entries(p40Map.reviewLaneCounts).map(([lane, count]) => `| ${lane} | ${count} |`).join("\n") +
  `\n\nThe machine-readable map is \`artifacts/review/p40-full-integration-map.json\`. Exact candidate values live in the post-commit candidate manifest; this tracked map grants no approval.\n`;

const macosSwcNote = `# macOS SWC Environment Note\n\n` +
  `The local macOS environment may report \`next-swc-native-binding-unavailable-wasm-fallback\`. The warning remains visible. It is environmental, not classified as a pass for native SWC, and does not grant production authority. A candidate may proceed to human review only when the supported WASM fallback completes the same typecheck, build, route/render baseline, public-smoke, and generated-integrity checks without behavioral drift. CI and any authorized deployment must still use a supported Node 24 environment and report their actual native/fallback state.\n`;

const outputs = [
  ["artifacts/review/p34-integration-map.json", `${JSON.stringify(integrationMap, null, 2)}\n`],
  ["docs/release/P34_CURRENT_STATE_DISCOVERY.md", discovery],
  ["docs/release/P34_SOURCE_CONTROL_RECONCILIATION.md", reconciliation],
  ["docs/review/P34_FOCUSED_PR_CONSTRUCTION.md", focusedPr],
  ["docs/review/P34_INTEGRATION_MAP.md", integrationDoc],
  ["docs/review/P34_REVIEW_BRIEF.md", reviewBrief],
  ["docs/release/P34_CURRENT_CANONICAL_BASELINE.md", canonicalBaselineDoc],
  ["docs/release/P40_SOURCE_CONTROL_INTEGRITY.md", sourceIntegrityDoc],
  ["docs/review/P40_EXACT_HEAD_REVIEW_BRIEF.md", p40ReviewBrief],
  ["docs/review/P40_FULL_INTEGRATION_MAP.md", p40MapDoc],
  ["docs/platform/MACOS_SWC_ENVIRONMENT_NOTE.md", macosSwcNote],
  ["artifacts/review/p40-review-index.json", `${JSON.stringify(p40ReviewIndex, null, 2)}\n`],
  ["artifacts/review/p40-full-integration-map.json", `${JSON.stringify(p40Map, null, 2)}\n`]
];

await mkdir("artifacts/review", { recursive: true });
await mkdir("docs/platform", { recursive: true });
for (const [path, expected] of outputs) {
  if (checkOnly) {
    const actual = await readFile(path, "utf8");
    if (actual !== expected) throw new Error(`${path} is stale; run npm run generate:p34-follow-on-artifacts.`);
  } else {
    await writeFile(path, expected, "utf8");
  }
}
console.log(`${checkOnly ? "pass" : "generated"} p.34 follow-on artifacts (${integrationMap.fileCount} mapped files, 0 unexplained)`);
