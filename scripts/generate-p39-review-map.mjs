#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const checkOnly = process.argv.includes("--check");
const allowedArguments = new Set(["--check"]);
const unknownArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument));
if (unknownArguments.length > 0) throw new Error(`Unsupported review-map argument: ${unknownArguments.join(", ")}`);

const inventoryPath = "artifacts/review/p39-pr-file-inventory.json";
const jsonOutputPath = "artifacts/review/p39-review-map.json";
const markdownOutputPath = "docs/review/P39_REVIEW_MAP.md";
const gapClosureBase = "48c49a065f0eef969e0927ca94894e10c693d5f0";

function runGit(args) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sortedUnique(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function worktreePaths() {
  const output = runGit(["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  const entries = output.split("\0").filter(Boolean);
  const paths = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const status = entry.slice(0, 2);
    const path = entry.slice(3);
    if (status.includes("R") || status.includes("C")) {
      paths.push(entries[index + 1] ?? path);
      index += 1;
    } else {
      paths.push(path);
    }
  }
  return paths;
}

function groupFor(path) {
  const lower = path.toLowerCase();
  if (lower.startsWith("supabase/migrations/") || lower.includes("migration")) return "migrations";
  if (lower.includes("supabase") || lower.includes("postgres") || lower.includes("rls")) return "Supabase";
  if (lower.includes("vercel") || lower.includes("node24") || lower.includes("build-info") || lower.includes("release/") || lower.includes("readiness/route") || lower.includes("health/route")) return "Vercel";
  if (lower.includes("productconsole") || lower.startsWith("app/product/") || lower.includes("product-console")) return "Product Console";
  if (lower.includes("commercial") || lower.includes("pricing") || lower.includes("pilot") || lower.includes("sales") || lower.includes("investor")) return "commercial controls";
  if (lower.includes("approval") || lower.includes("review") || lower.includes("aal2") || lower.includes("attestation")) return "approvals";
  if (lower.includes("egress") || lower.includes("network") || lower.includes("proxy")) return "egress";
  if (lower.includes("tenant") || lower.includes("workspace") || lower.includes("organization") || lower.includes("access")) return "tenant isolation";
  if (lower.includes("model") || lower.includes("provider") || lower.includes("router") || lower.includes("inference")) return "model routing";
  if (lower.includes("agent") || lower.includes("scrimed-work")) return "agents";
  if (lower.includes("evidence") || lower.includes("artifact") || lower.includes("trace") || lower.includes("validation") || lower.includes("benchmark")) return "evidence";
  if (lower.includes("clinical") || lower.includes("p34") || lower.includes("patient") || lower.includes("health-record") || lower.includes("fhir") || lower.includes("dicom")) return "clinical operating system";
  if (lower.includes("security") || lower.includes("auth") || lower.includes("secret") || lower.includes("policy")) return "security";
  if (lower.includes("claim") || lower === "app/page.tsx" || lower.includes("sitenavigation") || lower.includes("public")) return "public claims";
  return "governance";
}

function classificationFor(path, direct) {
  if (!path || path.includes("\0") || path.startsWith("/") || path.includes("../")) return "UNEXPECTED";
  if (path.startsWith("artifacts/") || path.startsWith("config/performance-budgets")) return "GENERATED_EVIDENCE";
  if (path.startsWith("scripts/") || path.startsWith("tests/") || path.startsWith(".github/workflows/")) return "TEST";
  if (path.startsWith("docs/") || path === "README.md" || path === "SECURITY.md") return "DOCUMENTATION";
  return direct ? "P34_DIRECT" : "INHERITED_CANONICAL";
}

const groupControls = {
  governance: { risk: "moderate", owner: "governance-owner", priority: "P2", tests: ["strict candidate", "policy and contract suites"], evidence: ["candidate manifest", "gate packet"] },
  "clinical operating system": { risk: "high", owner: "clinical-safety-reviewer", priority: "P0", tests: ["p.34 clinical OS", "nonsecret safety suite"], evidence: ["p.34 validation report", "clinical safety packet"] },
  security: { risk: "high", owner: "security-reviewer", priority: "P0", tests: ["secret scan", "CodeQL", "security policy tests"], evidence: ["security evidence", "SBOM"] },
  approvals: { risk: "high", owner: "independent-technical-reviewer", priority: "P0", tests: ["atomic approval", "replay and stale evidence tests"], evidence: ["review packet", "approval receipts"] },
  evidence: { risk: "moderate", owner: "evidence-owner", priority: "P1", tests: ["generated integrity", "evidence expiry"], evidence: ["validation fingerprint", "artifact hashes"] },
  "tenant isolation": { risk: "high", owner: "privacy-security-reviewer", priority: "P0", tests: ["cross-tenant negative tests", "RLS contracts"], evidence: ["tenant isolation receipts", "Supabase advisory"] },
  egress: { risk: "high", owner: "security-reviewer", priority: "P0", tests: ["egress firewall", "provider-call denial"], evidence: ["egress decision receipts"] },
  "model routing": { risk: "high", owner: "model-governance-reviewer", priority: "P1", tests: ["provider conformance", "no eligible route"], evidence: ["routing rationale", "model registry"] },
  agents: { risk: "high", owner: "agent-runtime-reviewer", priority: "P1", tests: ["agent authorization", "bounded retry"], evidence: ["agent trace", "capability receipts"] },
  migrations: { risk: "critical", owner: "database-migration-owner", priority: "P0", tests: ["87-migration disposable replay", "forward/recovery fingerprint"], evidence: ["migration packet", "production-unapplied state"] },
  Vercel: { risk: "high", owner: "release-platform-reviewer", priority: "P0", tests: ["Node 24 certification", "preview validation"], evidence: ["preview deployment evidence", "build fingerprint"] },
  Supabase: { risk: "high", owner: "supabase-project-owner", priority: "P0", tests: ["security advisor", "RLS contracts"], evidence: ["live advisory result", "migration state"] },
  "Product Console": { risk: "moderate", owner: "product-owner", priority: "P1", tests: ["route contract", "desktop and mobile browser checks"], evidence: ["UI verification", "API response"] },
  "public claims": { risk: "high", owner: "claims-and-legal-reviewer", priority: "P0", tests: ["public claims contract", "prohibited string scan"], evidence: ["claims register", "published surface smoke"] },
  "commercial controls": { risk: "moderate", owner: "commercial-and-finance-reviewer", priority: "P1", tests: ["synthetic pilot policy", "commercial authority contract"], evidence: ["pilot evidence pack", "nonbinding pricing posture"] }
};

const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
if (inventory.pullRequestNumber !== 39 || !Array.isArray(inventory.files) || inventory.files.length !== 286) {
  throw new Error("Authoritative PR #39 inventory is missing or malformed.");
}

const directFiles = sortedUnique([
  ...runGit(["diff", "--name-only", `${gapClosureBase}...HEAD`]).split("\n"),
  ...worktreePaths()
]);
const directSet = new Set(directFiles);
const files = sortedUnique([...inventory.files, ...directFiles]);
const entries = files.map((path) => {
  const group = groupFor(path);
  const controls = groupControls[group];
  const direct = directSet.has(path);
  return {
    path,
    classification: classificationFor(path, direct),
    lineage: direct ? "P34_DIRECT" : "INHERITED_CANONICAL",
    group,
    risk: controls.risk,
    tests: controls.tests,
    evidence: controls.evidence,
    reviewerPriority: controls.priority,
    ownerRole: controls.owner
  };
});
const unexpected = entries.filter((entry) => entry.classification === "UNEXPECTED");
if (unexpected.length > 0) throw new Error(`Unexpected PR files: ${unexpected.map((entry) => entry.path).join(", ")}`);

const groups = Object.keys(groupControls).map((name) => {
  const grouped = entries.filter((entry) => entry.group === name);
  const controls = groupControls[name];
  return {
    name,
    fileCount: grouped.length,
    files: grouped.map((entry) => entry.path),
    risk: controls.risk,
    tests: controls.tests,
    evidence: controls.evidence,
    reviewerPriority: controls.priority,
    ownerRole: controls.owner
  };
}).filter((group) => group.fileCount > 0);

const classificationCounts = Object.fromEntries(
  ["P34_DIRECT", "INHERITED_CANONICAL", "GENERATED_EVIDENCE", "TEST", "DOCUMENTATION", "LEGACY_SUPERSEDED", "UNEXPECTED"]
    .map((classification) => [classification, entries.filter((entry) => entry.classification === classification).length])
);
const lineageCounts = {
  P34_DIRECT: entries.filter((entry) => entry.lineage === "P34_DIRECT").length,
  INHERITED_CANONICAL: entries.filter((entry) => entry.lineage === "INHERITED_CANONICAL").length
};
const mapBase = {
  schemaVersion: "scrimed-p39-review-map-v1",
  repository: inventory.repository,
  pullRequestNumber: 39,
  authoritativePrBaseSha: inventory.baseSha,
  authoritativeInventoryObservedHeadSha: inventory.observedHeadSha,
  authoritativeGapClosureBaseSha: gapClosureBase,
  inventorySource: "GitHub connector inventory plus exact local p.34 direct delta",
  fileCount: entries.length,
  classificationCounts,
  lineageCounts,
  unexpectedCount: unexpected.length,
  groups,
  files: entries,
  reviewDecision: "EXACT_REVIEW_REQUIRED",
  mergeAuthorityGranted: false,
  productionAuthorityGranted: false,
  boundary: "Review compression only. This map does not approve, merge, deploy, migrate, authorize PHI or clinical activity, activate a customer, or satisfy independent human review."
};
const map = { ...mapBase, mapHash: sha256(JSON.stringify(mapBase)) };
const jsonOutput = `${JSON.stringify(map, null, 2)}\n`;
const markdown = `# PR #39 Review Map\n\n` +
  `Status: **EXACT_REVIEW_REQUIRED**\n\n` +
  `Files explained: **${entries.length}/${entries.length}**\n\n` +
  `Unexpected files: **${unexpected.length}**\n\n` +
  `Direct p.34 lineage: **${lineageCounts.P34_DIRECT}**\n\n` +
  `Inherited canonical lineage: **${lineageCounts.INHERITED_CANONICAL}**\n\n` +
  `Map SHA-256: \`${map.mapHash}\`\n\n` +
  `The source inventory came from GitHub PR #39 and is augmented with the exact local delta from the authoritative p.34 base. Primary classifications identify generated evidence, tests, and documentation; the separate lineage field preserves direct-versus-inherited provenance.\n\n` +
  `| Group | Files | Risk | Priority | Owner | Tests | Evidence |\n` +
  `| --- | ---: | --- | --- | --- | --- | --- |\n` +
  groups.map((group) => `| ${group.name} | ${group.fileCount} | ${group.risk} | ${group.reviewerPriority} | ${group.ownerRole} | ${group.tests.join("; ")} | ${group.evidence.join("; ")} |`).join("\n") +
  `\n\n## Classification Counts\n\n` +
  Object.entries(classificationCounts).map(([classification, count]) => `- ${classification}: ${count}`).join("\n") +
  `\n\n## Review Sequence\n\n1. Review P0 groups and all P34_DIRECT lineage files.\n2. Confirm generated evidence and tests bind to the same source tree.\n3. Sample inherited canonical files by group and follow their predecessor evidence.\n4. Record an independent exact-head decision outside this generated map.\n\n## Boundary\n\n${map.boundary}\n`;

if (checkOnly) {
  const [currentJson, currentMarkdown] = await Promise.all([
    readFile(jsonOutputPath, "utf8").catch(() => ""),
    readFile(markdownOutputPath, "utf8").catch(() => "")
  ]);
  if (currentJson !== jsonOutput || currentMarkdown !== markdown) {
    throw new Error("PR #39 review map is stale; run npm run generate:p39-review-map.");
  }
  console.log(`pass PR #39 review map integrity (${entries.length} files, ${unexpected.length} unexpected)`);
} else {
  await Promise.all([
    writeFile(jsonOutputPath, jsonOutput),
    writeFile(markdownOutputPath, markdown)
  ]);
  console.log(`generated PR #39 review map (${entries.length} files, ${unexpected.length} unexpected)`);
}
