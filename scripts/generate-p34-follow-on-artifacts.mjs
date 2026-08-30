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
  bindingArtifact: "artifacts/release/scrimed-p34-release-manifest.json",
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
  `| Exact candidate binding | generated post-commit in \`artifacts/release/scrimed-p34-release-manifest.json\` |\n` +
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

const riskOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "GENERATED", "DOCUMENTATION"];

function p40Risk(path, classification) {
  const lower = path.toLowerCase();
  if (classification === "DOCUMENTATION") return "DOCUMENTATION";
  if (classification === "GENERATED_EVIDENCE") return "GENERATED";
  if (
    lower.includes("atomicapproval")
    || lower.includes("controlplane2")
    || lower.includes("reviewreadiness")
    || lower.includes("previewacceptance")
    || lower.includes("pilotmanifest")
    || lower.includes("migration")
  ) return "CRITICAL";
  if (
    lower.includes("security")
    || lower.includes("secret")
    || lower.includes("egress")
    || lower.includes("exactheadreview")
    || lower.includes("pilotoperatingsystem")
    || lower.includes("pilotcostgovernor")
    || lower.includes("aal2")
    || lower.includes("certif")
  ) return "HIGH";
  if (classification === "UI" || classification === "CORE_RUNTIME" || classification === "CONFIGURATION") return "MEDIUM";
  return "LOW";
}

function reviewEvidenceFor(entry) {
  const lane = entry.reviewLane;
  const tests = lane === "PILOT_OS" || lane === "COMMERCIAL"
    ? ["npm run test:scrimed-p34-post-review-readiness", "npm run test:scrimed-p34-pilot-adversarial"]
    : lane === "SECURITY" || lane === "AAL2"
      ? ["npm run test:scrimed-p34-gap-closure", "npm run test:nonsecret"]
      : lane === "VERCEL" || entry.classification === "UI"
        ? ["npm run smoke:public", "npm run scrimed:p34:certify"]
        : ["npm run contract:scrimed-p34-follow-on", "npm run test:nonsecret"];
  return {
    whyChanged: lane === "PILOT_OS"
      ? "Strengthens bounded synthetic-pilot execution and evidence controls."
      : lane === "COMMERCIAL"
        ? "Strengthens nonbinding economics, proposal, and buyer-readiness controls."
        : lane === "SECURITY" || lane === "AAL2"
          ? "Strengthens fail-closed identity, approval, egress, or security evidence."
          : lane === "VERCEL"
            ? "Binds nonproduction preview behavior and observability to the exact candidate."
            : entry.classification === "GENERATED_EVIDENCE"
              ? "Regenerates deterministic candidate evidence from repository sources."
              : entry.classification === "DOCUMENTATION"
                ? "Explains implemented behavior, retained boundaries, and operator action."
                : "Integrates the p.34 conversion wave into the existing runtime and test surface.",
    relevantTests: tests,
    relevantEvidence: [
      "artifacts/release/scrimed-p34-release-manifest.json",
      entry.classification === "GENERATED_EVIDENCE"
        ? entry.path
        : "artifacts/review/p40-full-integration-map.json"
    ]
  };
}

const p40RiskEntries = p40Entries
  .map((entry) => ({
    ...entry,
    risk: p40Risk(entry.path, entry.classification),
    ...reviewEvidenceFor(entry)
  }))
  .sort((left, right) => riskOrder.indexOf(left.risk) - riskOrder.indexOf(right.risk) || left.path.localeCompare(right.path));
const p40RiskDiffBase = {
  schemaVersion: "scrimed-p40-risk-ranked-diff-v1",
  repository: state.repository,
  pullRequestNumber: 40,
  branch: state.branch,
  exactCandidateBinding: "artifacts/release/scrimed-p34-release-manifest.json",
  rankOrder: riskOrder,
  fileCount: p40RiskEntries.length,
  riskCounts: Object.fromEntries(riskOrder.map((risk) => [risk, p40RiskEntries.filter((entry) => entry.risk === risk).length])),
  files: p40RiskEntries,
  unexplainedFileCount: p40RiskEntries.filter((entry) => entry.classification === "UNEXPECTED").length,
  reviewDecision: "EXACT_REVIEW_REQUIRED",
  productionAuthorityGranted: false
};
if (p40RiskDiffBase.unexplainedFileCount !== 0) throw new Error("PR #40 risk-ranked diff contains unexplained files.");
const p40RiskDiff = { ...p40RiskDiffBase, diffFingerprint: sha256(p40RiskDiffBase) };
const p40ReviewLanes = ["CORE_RUNTIME", "PILOT_OS", "COMMERCIAL", "SECURITY", "GOVERNANCE", "VERCEL", "SUPABASE", "AAL2"];
const p40MapBase = {
  schemaVersion: "scrimed-p40-full-integration-map-v1",
  repository: state.repository,
  pullRequestNumber: 40,
  branch: state.branch,
  machineRepairBaseCommit: "d074658b65399d91124f2a1b737e82ef50f69095",
  exactCandidateBinding: "artifacts/release/scrimed-p34-release-manifest.json",
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
  exactCandidateBinding: "artifacts/release/scrimed-p34-release-manifest.json",
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
  `PR #40 on branch \`${state.branch}\` is the canonical review target. The machine-remediation base is \`d074658b65399d91124f2a1b737e82ef50f69095\`. Exact successor commit, tree, candidate, source, validation, review, gate, SBOM, route, render, preview, migration, AAL2, and security fingerprints are generated only after source stabilization in \`artifacts/release/scrimed-p34-release-manifest.json\`.\n\n` +
  `PR #39 remains predecessor evidence and cannot approve PR #40. Production, PHI, clinical execution, payer/EHR/device writeback, protected-pilot activation, customer activation, merge, migration, and external distribution remain separately gated.\n`;

const sourceIntegrityDoc = `# PR #40 Source-Control Integrity\n\n` +
  `The candidate descends from \`${p34Predecessor.commitSha}\` and preserves PR #39 as **PREDECESSOR**. The current path inventory contains ${p40Map.fileCount} classified files and ${p40Map.unexplainedFileCount} unexplained files.\n\n` +
  `| Artifact class | Status |\n| --- | --- |\n` +
  `| PR #39 exact-head evidence | PREDECESSOR |\n` +
  `| PR #40 source and tests | CURRENT |\n` +
  `| Legacy \`artifacts/p34/P34_*_INVENTORY.json\` | SUPERSEDED |\n` +
  `| \`artifacts/build/routes.json\` | REGENERATED / CANONICAL BASELINE |\n` +
  `| \`artifacts/build/render-inventory.json\` | REGENERATED / CANONICAL BASELINE |\n` +
  `| Exact successor evidence | REGENERATED POST-COMMIT |\n\n` +
  `Ordinary builds are read-only with respect to the committed route/render baseline. An intentional route change requires the explicit baseline-update command plus review. No force push, merge, production deployment, migration, or external distribution is authorized.\n`;

const p40ReviewBrief = `# PR #40 Exact-Head Review Brief\n\nTarget review time: **10 minutes**\n\n` +
  `## Exact Binding\n\nOpen \`artifacts/release/scrimed-p34-release-manifest.json\` and verify PR 40, commit, tree, candidate, source, validation, review packet, gate packet, SBOM, route/render inventories, and preview deployment. Stop if the PR head differs.\n\n` +
  `## Review Order\n\n` +
  p40ReviewIndex.highestRiskFiles.map((path, index) => `${index + 1}. \`${path}\``).join("\n") +
  `\n\n## Required Safety Checks\n\nConfirm strict synthetic/no-PHI boundaries, tenant isolation, atomic approvals, kill switch, Oversight Sentinel, evidence-ledger integrity, independent route baseline, and truthful AAL2, Supabase, migration, commercial-authority, protected-pilot, and production states.\n\n` +
  `Only a named, external, exact-head review receipt may produce \`APPROVED_EXACT_HEAD\`. Review approval grants no merge, migration, production, PHI, clinical, payer, EHR/device, customer, contract, certification, compliance, or distribution authority.\n`;

const p40MapDoc = `# PR #40 Full Integration Map\n\nStatus: **EXACT_REVIEW_REQUIRED**\n\nFiles explained: **${p40Map.fileCount}/${p40Map.fileCount}**\n\nUnexplained: **${p40Map.unexplainedFileCount}**\n\nMap SHA-256: \`${p40Map.mapFingerprint}\`\n\n` +
  `| Review lane | Files |\n| --- | ---: |\n` +
  Object.entries(p40Map.reviewLaneCounts).map(([lane, count]) => `| ${lane} | ${count} |`).join("\n") +
  `\n\nThe machine-readable map is \`artifacts/review/p40-full-integration-map.json\`. Exact candidate values live in the post-commit candidate manifest; this tracked map grants no approval.\n`;

const executiveCanonicalState = `# p.34 Executive Canonical State\n\n` +
  `Status: **AUTOMATED ASSURANCE IN PROGRESS / EXACT-HEAD INDEPENDENT REVIEW REQUIRED**\n\n` +
  `| Control | Canonical source | Current state |\n| --- | --- | --- |\n` +
  `| Candidate | \`artifacts/release/scrimed-p34-release-manifest.json\` | Generated only after the source is frozen |\n` +
  `| Review | PR #40 + \`artifacts/review/p40-risk-ranked-diff.json\` | Named independent review not present |\n` +
  `| Routes | \`artifacts/build/routes.json\` | Generated from the Next build; no manual expected count |\n` +
  `| Rendering | \`artifacts/build/render-inventory.json\` | Generated from build manifests and build output |\n` +
  `| Preview | exact candidate Vercel preview | Nonproduction only; acceptance must be candidate-bound |\n` +
  `| AAL2 | \`artifacts/security/p40-aal2.json\` | Fresh operator evidence required |\n` +
  `| Supabase | project \`yxacqdfeyojrjghpwike\` | Leaked-password protection operator action required |\n` +
  `| Migrations | three checksum-bound files | Static ready; production unapplied and unauthorized |\n` +
  `| Synthetic pilots | six bounded archetypes | No-PHI/nonproduction execution only with scope approval |\n` +
  `| Protected pilot | external authority | Not authorized |\n` +
  `| Production | external authority | Not authorized |\n\n` +
  `The conversion wave began at \`9e58d8dbc2bfe15f1334cc0b6dadf479f5fbddb2\`. The exact successor values must be read from the canonical ignored manifest so tracked documentation never self-references its own commit. No production, migration, PHI, clinical, payer, EHR/device, customer, merge, or external-distribution authority is inferred.\n`;

const executiveReviewBrief = `# PR #40 Executive Review Brief\n\nTarget reading time: **10 minutes**\n\n` +
  `## 1. Purpose\nValidate the exact p.34 conversion candidate as a bounded synthetic/no-PHI pilot and assurance platform.\n\n` +
  `## 2. Exact Candidate\nStart with \`artifacts/release/scrimed-p34-release-manifest.json\`. Stop if PR #40, commit, tree, candidate, source, validation, review, gate, SBOM, or preview differs.\n\n` +
  `## 3. What Changed\nThe wave consolidates release truth, hardens deterministic evidence, focuses Product Console, and productizes six synthetic pilot archetypes without adding clinical authority.\n\n` +
  `## 4. Highest-Risk Files\nRead CRITICAL then HIGH entries in \`docs/review/P40_RISK_RANKED_DIFF.md\`.\n\n` +
  `## 5. Governance Model\nRules, evidence, exact-candidate approvals, one-use execution, budgets, and immediate pre-effect revalidation remain fail closed.\n\n` +
  `## 6. Synthetic-Pilot Boundary\nNO_PHI, NONPRODUCTION, no clinical execution, no payer submission, no EHR/device writeback, and no customer-system writes are invariant.\n\n` +
  `## 7. PHI Controls\nPHI egress and storage are blocked; telemetry and evidence retain hashes and redacted operational facts only.\n\n` +
  `## 8. Approval Controls\nSynthetic approvals cannot authorize external execution. Review, merge, deployment, migration, protected-pilot, and production authority remain separate.\n\n` +
  `## 9. Tenant Isolation\nReview tenant-bound approvals, Supabase RLS contracts, cross-tenant negative tests, and hashed tenant evidence.\n\n` +
  `## 10. Preview Evidence\nThe accepted target must be the exact Node 24 nonproduction Vercel deployment, with public smoke, desktop/390px checks, protected denial, and no production alias.\n\n` +
  `## 11. Migrations\nThree migrations remain unapplied. Verify checksums and static/disposable evidence; do not authorize production application through this review.\n\n` +
  `## 12. AAL2\nFresh candidate-bound operator evidence remains required and contains no credential material.\n\n` +
  `## 13. Supabase\nThe leaked-password warning remains owner action until the Auth setting is changed and Security Advisor is rerun.\n\n` +
  `## 14. Security Evidence\nReview secret scan, dependency audit, SBOM, adversarial/fuzz/concurrency/failure tests, and fail-closed protected APIs.\n\n` +
  `## 15. Commercial Authority\nPricing and value outputs are estimated/simulated and nonbinding. Agents cannot sign, discount, promise dates, activate customers, or distribute investor artifacts.\n\n` +
  `## 16. Reviewer Decision\nRecord exactly one: **APPROVE_EXACT_HEAD**, **REQUEST_CHANGES**, or **REJECT**. Bind identity and disposition to the exact manifest. Approval grants review evidence only.\n`;

const riskDiffDoc = `# PR #40 Risk-Ranked Diff\n\n` +
  `Status: **EXACT_REVIEW_REQUIRED**\n\nFiles: **${p40RiskDiff.fileCount}**\n\nUnexplained: **${p40RiskDiff.unexplainedFileCount}**\n\nFingerprint: \`${p40RiskDiff.diffFingerprint}\`\n\n` +
  `| Rank | Files |\n| --- | ---: |\n` +
  Object.entries(p40RiskDiff.riskCounts).map(([risk, count]) => `| ${risk} | ${count} |`).join("\n") +
  `\n\n## Ordered Files\n\n| Rank | Path | Why | Primary test |\n| --- | --- | --- | --- |\n` +
  p40RiskDiff.files.map((entry) => `| ${entry.risk} | \`${entry.path}\` | ${entry.whyChanged} | \`${entry.relevantTests[0]}\` |`).join("\n") +
  `\n\nExact test and evidence arrays are in \`artifacts/review/p40-risk-ranked-diff.json\`. Generated and documentation files remain reviewable evidence but cannot substitute for behavior or named approval.\n`;

const supabaseCloseout = `# Supabase Leaked-Password Closeout\n\n` +
  `Current warning: **auth_leaked_password_protection / Leaked Password Protection Disabled**\n\n` +
  `Project: **scrimed-protected-pilot** (\`yxacqdfeyojrjghpwike\`)\n\n` +
  `## Two-Minute Owner Action\n\n1. Open Supabase Dashboard and select the exact project above.\n2. Open **Authentication > Sign In / Providers > Password security** (the dashboard label may be **Authentication > Settings > Password Security**).\n3. Enable only **Prevent use of leaked passwords**.\n4. Save. Do not change users, sessions, providers, redirect URLs, RLS, roles, schema, data, or migrations.\n5. Open **Advisors > Security Advisor** and rerun/refresh it.\n\n` +
  `## Expected Result\n\nThe \`auth_leaked_password_protection\` warning is absent. Record a non-sensitive screenshot or advisor result with project name and timestamp; do not capture users, emails, tokens, or configuration secrets.\n\n` +
  `## Verification\n\nRun the connected Security Advisor again and require zero leaked-password warnings. Protected-pilot readiness remains blocked until this is observed and candidate-bound evidence is recorded.\n\n` +
  `## Rollback\n\nIf the setting causes an authentication incident, the project owner may disable only the same setting, record the reason and timestamp, and restore the gate to \`OPERATOR_ACTION_REQUIRED\`. No unrelated Auth setting may be changed.\n`;

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
  ["docs/release/P34_EXECUTIVE_CANONICAL_STATE.md", executiveCanonicalState],
  ["docs/release/P40_SOURCE_CONTROL_INTEGRITY.md", sourceIntegrityDoc],
  ["docs/review/P40_EXACT_HEAD_REVIEW_BRIEF.md", p40ReviewBrief],
  ["docs/review/P40_EXECUTIVE_REVIEW_BRIEF.md", executiveReviewBrief],
  ["docs/review/P40_RISK_RANKED_DIFF.md", riskDiffDoc],
  ["docs/review/P40_FULL_INTEGRATION_MAP.md", p40MapDoc],
  ["docs/operators/SUPABASE_LEAKED_PASSWORD_CLOSEOUT.md", supabaseCloseout],
  ["docs/platform/MACOS_SWC_ENVIRONMENT_NOTE.md", macosSwcNote],
  ["artifacts/review/p40-review-index.json", `${JSON.stringify(p40ReviewIndex, null, 2)}\n`],
  ["artifacts/review/p40-full-integration-map.json", `${JSON.stringify(p40Map, null, 2)}\n`],
  ["artifacts/review/p40-risk-ranked-diff.json", `${JSON.stringify(p40RiskDiff, null, 2)}\n`]
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
