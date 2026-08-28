#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import {
  createPendingP34Aal2Evidence,
  createPendingP34PreviewObservability,
  p34RuntimeEvidencePaths
} from "./lib/p34-post-review-runtime-evidence.mjs";

const checkOnly = process.argv.includes("--check");
const allowedArguments = new Set(["--check"]);
const unknownArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument));
if (unknownArguments.length > 0) throw new Error(`Unsupported p.34 artifact argument: ${unknownArguments.join(", ")}`);

const exact = {
  repository: "temitayodahunsi777/scrimed-site",
  pullRequestNumber: 39,
  commitSha: "45be650f48e422b05160821681ff40bb9f1229c9",
  treeSha: "f1d68282f84243a0e20d51eeb47775aff293a6f8",
  candidateFingerprint: "184b07843e9eaa4a0dd0bc2c783944b66df7cbc95b05dc37930663197ae71d16",
  sourceFingerprint: "410a544bfee9e7de246f684ef6966118206f228ef84c63b6508133f1f3647612",
  validationFingerprint: "42d4d7790f8270b8cb1d742938d11590ddb1d3e6fb59c066b97235c3c5960743",
  reviewPacketFingerprint: "7540b5b8c7abf467b9249b80bfcf41c4b180949588641ab4a38f3f0e12015035",
  gatePacketFingerprint: "a4193aab60512c280a425171a868785ea8e07ab30f80b17665001f02975dda0e",
  sbomFingerprint: "9febdb954737f82d9d9be29b0a1013c7cea520c6206f1793e79e5b1422ad38ef",
  reviewRequestedAt: "2026-08-26T00:30:13.000Z",
  reviewRequestUrl: "https://github.com/temitayodahunsi777/scrimed-site/pull/39#issuecomment-5418888268",
  deploymentId: "dpl_MPSXXudmikWZduLxEvAY8afTtXvz",
  deploymentUrl: "https://scrimed-site-8tjd5qyj0-temitayo-dahunsis-projects.vercel.app",
  branchAlias: "https://scrimed-site-git-agent-scrime-02c77f-temitayo-dahunsis-projects.vercel.app",
  builtRoutes: 630,
  prerenderedRoutes: 245
};

function stableSerialize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`).join(",")}}`;
}

function sha256(value) {
  return createHash("sha256").update(typeof value === "string" ? value : stableSerialize(value)).digest("hex");
}

function classification(entry) {
  const path = entry.path;
  if (!path || path.startsWith("/") || path.includes("../") || path.includes("\0")) return "UNEXPECTED";
  if (path.startsWith("artifacts/") || path.startsWith("config/performance-budgets")) return "GENERATED";
  if (path.startsWith("scripts/") || path.startsWith("tests/") || path.startsWith(".github/workflows/")) return "TEST";
  if (path.startsWith("docs/") || path === "README.md" || path === "SECURITY.md") return "DOC";
  if (entry.lineage === "P34_DIRECT") return "CURRENT_P34_DIRECT";
  return "INHERITED_CANONICAL";
}

const existingMap = JSON.parse(await readFile("artifacts/review/p39-review-map.json", "utf8"));
const fullEntries = existingMap.files.map((entry) => ({
  path: entry.path,
  classification: classification(entry),
  lineage: entry.lineage,
  reviewLane: entry.group,
  risk: entry.risk,
  ownerRole: entry.ownerRole,
  tests: entry.tests,
  evidence: entry.evidence
}));
const classes = ["CURRENT_P34_DIRECT", "INHERITED_CANONICAL", "GENERATED", "TEST", "DOC", "SUPERSEDED", "UNEXPECTED"];
const classificationCounts = Object.fromEntries(classes.map((name) => [name, fullEntries.filter((entry) => entry.classification === name).length]));
const fullMapBase = {
  schemaVersion: "scrimed-p39-full-integration-map-v1",
  exactReviewTarget: exact,
  sourceMapHash: existingMap.mapHash,
  fileCount: fullEntries.length,
  classificationCounts,
  unexplainedFileCount: classificationCounts.UNEXPECTED,
  files: fullEntries,
  reviewDecision: "EXACT_REVIEW_REQUIRED",
  mergeAuthorityGranted: false,
  productionAuthorityGranted: false,
  boundary: "Review compression only. The map grants no review approval, merge, deployment, migration, PHI, clinical, payer, EHR/device, customer, certification, compliance, or external-distribution authority."
};
if (fullMapBase.unexplainedFileCount !== 0) throw new Error("Full integration map contains unexplained files.");
const fullMap = { ...fullMapBase, mapHash: sha256(fullMapBase) };

const reviewSections = [
  ["Exact SHA and tree", "docs/release/P34_CURRENT_EXACT_HEAD_BASELINE.md"],
  ["Architecture", "docs/scrimed-p34-clinical-operating-system.md"],
  ["65-file precision wave", "docs/review/P39_FULL_INTEGRATION_MAP.md"],
  ["Synthetic pilot additions", "app/lib/commercial/syntheticPilotReadiness.ts"],
  ["AAL2 verifier", "scripts/run-aal2-candidate-verification.mjs"],
  ["Tenant isolation", "tests/security/supabase-rls-contract.test.mjs"],
  ["Approval logic", "app/lib/scrimed-p34/atomicApproval.ts"],
  ["PHI egress", "app/lib/scrimed-p34/egressFirewall.ts"],
  ["Kill switch", "app/lib/scrimed-p34/controlPlane2.ts"],
  ["Oversight Sentinel", "app/lib/scrimed-p34/controlPlane2.ts"],
  ["Runtime revalidation", "app/lib/scrimed-p34/controlPlane2.ts"],
  ["Migrations", "docs/operators/P34_MIGRATION_OPERATOR_PACKET.md"],
  ["Vercel preview", "docs/review/P34_PREVIEW_ACCEPTANCE_PACKET.md"],
  ["Supabase", "docs/operators/SUPABASE_PASSWORD_SECURITY_CLOSURE.md"],
  ["Commercial controls", "app/lib/commercial/pilotOperatingSystem.ts"],
  ["Security and residual gates", "docs/operators/P34_OPERATOR_COMMAND_CENTER.md"]
];
const reviewIndexBase = {
  schemaVersion: "scrimed-p34-review-index-v1",
  pullRequestNumber: exact.pullRequestNumber,
  exactReviewTarget: exact,
  targetReviewMinutes: { minimum: 10, maximum: 15 },
  sectionCount: reviewSections.length,
  sections: reviewSections.map(([title, evidencePointer], index) => ({
    order: index + 1,
    title,
    evidencePointer
  })),
  integrationMapHash: fullMap.mapHash,
  independentReviewStatus: "EXACT_REVIEW_REQUIRED",
  mergeAuthorityGranted: false,
  productionAuthorityGranted: false
};
const reviewIndex = { ...reviewIndexBase, indexHash: sha256(reviewIndexBase) };

const aal2Evidence = createPendingP34Aal2Evidence(exact);
const observability = createPendingP34PreviewObservability(exact);

const baselineDoc = `# p.34 Current Exact-Head Baseline\n\n` +
  `Status: **P34 EXACT-HEAD REVIEW REQUIRED**\n\n` +
  `This document freezes the independently reviewable p.34 target. Follow-on engineering occurs on a separate branch and does not mutate this SHA.\n\n` +
  `| Evidence | Exact value |\n| --- | --- |\n` +
  `| PR | #${exact.pullRequestNumber} |\n` +
  `| Commit | \`${exact.commitSha}\` |\n` +
  `| Tree | \`${exact.treeSha}\` |\n` +
  `| Candidate | \`${exact.candidateFingerprint}\` |\n` +
  `| Source | \`${exact.sourceFingerprint}\` |\n` +
  `| Validation | \`${exact.validationFingerprint}\` |\n` +
  `| Review packet | \`${exact.reviewPacketFingerprint}\` |\n` +
  `| Gate packet | \`${exact.gatePacketFingerprint}\` |\n` +
  `| SBOM | \`${exact.sbomFingerprint}\` |\n` +
  `| Routes | ${exact.builtRoutes} built / ${exact.prerenderedRoutes} prerendered |\n` +
  `| Review requested | ${exact.reviewRequestedAt} ([evidence](${exact.reviewRequestUrl})) |\n` +
  `| Vercel preview | \`${exact.deploymentId}\`, READY, target null, branch alias only |\n\n` +
  `All seven exact-head GitHub workflows were reported passed for this target. No independent approval, merge authority, production authority, migration authority, PHI authority, customer activation, or external-distribution authority is inferred.\n`;

const reviewBrief = `# p.34 Exact-Head Review Brief\n\n` +
  `Target time: **10-15 minutes**\n\nDecision: **EXACT_REVIEW_REQUIRED**\n\nPR: **#39**\n\nHead: \`${exact.commitSha}\`\n\n` +
  `## First Check\n\nConfirm PR #39 still points to the exact commit and tree above. If it moved, stop: the review request is stale.\n\n` +
  `## Review Sequence\n\n` +
  reviewSections.map(([title, pointer], index) => `${index + 1}. **${title}:** \`${pointer}\``).join("\n") +
  `\n\n## Precision-Wave Scope\n\nThe reported 65-file precision wave sits inside the authoritative full map of ${fullMap.fileCount} files. The current map preserves ${existingMap.lineageCounts.P34_DIRECT} direct-lineage files and ${existingMap.lineageCounts.INHERITED_CANONICAL} inherited-lineage files, with generated, test, and documentation classifications layered on top. Zero files are unexplained.\n\n` +
  `## Required Disposition\n\nRecord reviewer identity, exact commit/tree/candidate, timestamp, decision, findings, and conditions. An approval is review evidence only. It grants no merge, deployment, migration, PHI, clinical, payer, EHR/device, customer, certification, compliance, or distribution authority.\n`;

const fullMapDoc = `# PR #39 Full Integration Map\n\n` +
  `Status: **EXACT_REVIEW_REQUIRED**\n\n` +
  `Exact head: \`${exact.commitSha}\`\n\nFiles explained: **${fullMap.fileCount}/${fullMap.fileCount}**\n\nUnexplained files: **${fullMap.unexplainedFileCount}**\n\nMap SHA-256: \`${fullMap.mapHash}\`\n\n` +
  `| Classification | Files |\n| --- | ---: |\n` +
  Object.entries(classificationCounts).map(([name, count]) => `| ${name} | ${count} |`).join("\n") +
  `\n\n## Review Use\n\nReview CURRENT_P34_DIRECT and high-risk TEST/GENERATED evidence first. Sample INHERITED_CANONICAL by review lane. DOC explains controls but cannot substitute for behavior or independent approval. SUPERSEDED evidence, when present, cannot satisfy the exact-head review. UNEXPECTED must remain zero.\n\n## Boundary\n\n${fullMap.boundary}\n`;

const outputs = [
  ["docs/release/P34_CURRENT_EXACT_HEAD_BASELINE.md", baselineDoc],
  ["docs/review/P34_EXACT_HEAD_REVIEW_BRIEF.md", reviewBrief],
  ["docs/review/P39_FULL_INTEGRATION_MAP.md", fullMapDoc],
  ["artifacts/review/p34-review-index.json", `${JSON.stringify(reviewIndex, null, 2)}\n`],
  ["artifacts/review/p39-full-integration-map.json", `${JSON.stringify(fullMap, null, 2)}\n`],
  ["artifacts/security/p34-aal2-evidence.json", `${JSON.stringify(aal2Evidence, null, 2)}\n`],
  ["artifacts/vercel/p34-preview-observability.json", `${JSON.stringify(observability, null, 2)}\n`]
];

if (checkOnly) {
  for (const [path, expected] of outputs) {
    const actual = await readFile(path, "utf8").catch((error) => {
      if (error?.code === "ENOENT" && p34RuntimeEvidencePaths.has(path)) return null;
      throw error;
    });
    if (actual === null) continue;
    if (actual !== expected) throw new Error(`${path} is stale; run npm run generate:p34-post-review-artifacts.`);
  }
  console.log(`pass p.34 post-review artifact integrity (${outputs.length - p34RuntimeEvidencePaths.size} tracked artifacts, ${p34RuntimeEvidencePaths.size} optional runtime receipts, ${fullMap.fileCount} mapped files)`);
} else {
  for (const [path, content] of outputs) await writeFile(path, content, "utf8");
  console.log(`generated p.34 post-review artifacts (${outputs.length} artifacts, ${fullMap.fileCount} mapped files)`);
}
