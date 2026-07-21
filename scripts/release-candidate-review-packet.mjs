#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, readFile, readlink } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--json", "--markdown", "--strict", "--self-test"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));
const maximumHashFileBytes = 32 * 1024 * 1024;
const emptyGitTreeSha = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported release candidate review packet option: ${unknownArgs.join(", ")}`);
}

if (args.has("--json") && args.has("--markdown")) {
  throw new Error("Choose either --json or --markdown, not both.");
}

const reviewerResponsibilities = {
  "Release steward": "Confirm the intended release scope, dispositions, and candidate-bound review completion.",
  "Principal engineer": "Review implementation integrity, compatibility, test evidence, and residual technical risk.",
  "API contract owner": "Review request, response, authorization, error, and compatibility contracts.",
  "Database migration owner": "Review migration safety, reversibility, dry-run evidence, and data compatibility.",
  "Security reviewer": "Review least privilege, isolation, secret handling, and fail-closed controls.",
  "Security and identity reviewer": "Review authentication, authorization, identity, tenant isolation, and protected paths.",
  "Clinical safety reviewer": "Review clinical boundaries, evidence requirements, abstention, and human oversight.",
  "Claims and legal reviewer": "Review public, investor, commercial, legal, and regulatory claim boundaries.",
  "CI/CD and platform reviewer": "Review build, release, dependency, workflow, and platform controls.",
  "Product and UI owner": "Review user-facing behavior, accessibility, navigation, and product consistency.",
  "Documentation owner": "Review operational accuracy, limitations, runbooks, and documentation consistency."
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function isSha(value, length) {
  return typeof value === "string" && new RegExp(`^[0-9a-f]{${length}}$`, "i").test(value);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)])
    );
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(stableValue(value));
}

function classifyPath(filePath) {
  if (filePath.startsWith("app/api/")) return "api";
  if (filePath.startsWith("app/lib/")) return "core-policy";
  if (filePath.startsWith("app/")) return "application-ui";
  if (filePath.startsWith("supabase/migrations/") || /(^|\/)migrations?\//i.test(filePath)) return "database";
  if (filePath.startsWith("docs/") || /(^|\/)readme/i.test(filePath)) return "documentation";
  if (filePath.startsWith("scripts/") || filePath.startsWith("tests/") || filePath.startsWith("test/")) return "quality-security";
  if (filePath.startsWith(".github/") || filePath.startsWith("vercel") || filePath.startsWith("proxy.")) return "release-infrastructure";
  if (
    filePath === "package.json"
    || filePath === "package-lock.json"
    || /(^|\/)(next|eslint|tsconfig|postcss|tailwind)\./i.test(filePath)
    || filePath.endsWith("config.ts")
    || filePath.endsWith("config.js")
  ) return "configuration";
  return "other";
}

function isDisposablePath(filePath) {
  return [".next/", "node_modules/", "coverage/", "dist/", "build/"].some((prefix) => filePath.startsWith(prefix))
    || filePath.endsWith(".log")
    || filePath.endsWith(".tsbuildinfo")
    || filePath.endsWith(".DS_Store");
}

function isSensitivePath(filePath) {
  const lower = filePath.toLowerCase();
  if (lower === ".env.example" || lower.endsWith("/.env.example")) return false;
  return /(^|\/)\.env($|\.)/.test(lower)
    || /(^|\/)(\.npmrc|\.pypirc|\.netrc|\.git-credentials)$/.test(lower)
    || /(^|\/)(id_rsa|id_ed25519|keystore)(\.|$)/.test(lower)
    || /(^|\/)(credentials?|service-account|private[-_]?key)(\.|\/|$)/.test(lower)
    || /\.(pem|p12|pfx|key|jks)$/i.test(filePath);
}

function isNonSourceDeliverable(filePath) {
  return filePath.startsWith("outputs/");
}

function isSafeRelativePath(filePath) {
  return typeof filePath === "string"
    && filePath.length > 0
    && !path.isAbsolute(filePath)
    && !filePath.includes("\0")
    && !filePath.split("/").includes("..")
    && !/[\u0000-\u001f\u007f]/.test(filePath);
}

function normalizeStatus(rawStatus) {
  if (rawStatus === "??") return "untracked";
  if (rawStatus.includes("U") || rawStatus === "AA" || rawStatus === "DD") return "unmerged";
  if (rawStatus.includes("R")) return "renamed";
  if (rawStatus.includes("C")) return "copied";
  if (rawStatus.includes("D")) return "deleted";
  if (rawStatus.includes("A")) return "added";
  if (rawStatus.includes("M")) return "modified";
  return "changed";
}

function deriveRiskTags(filePath, category) {
  const lower = filePath.toLowerCase();
  const tags = new Set([category]);
  if (/(^|\/)(auth|identity|tenant|middleware|proxy|protected|security)/.test(lower)) tags.add("security-identity");
  if (/(clinical|patient|health-record|fhir|hl7|dicom|payer|ehr|medication|imaging)/.test(lower)) tags.add("clinical-safety");
  if (/(claims|investor|marketing|public-market|approvals-readiness|capital-vitality)/.test(lower)) tags.add("public-claims");
  if (category === "database") tags.add("database-migration");
  if (category === "api") tags.add("api-contract");
  if (category === "release-infrastructure" || category === "configuration" || filePath.startsWith("scripts/release")) tags.add("release-pipeline");
  if (category === "application-ui") tags.add("user-interface");
  if (category === "documentation") tags.add("documentation");
  return [...tags].sort();
}

function assignReviewerRoles(filePath, category, riskTags) {
  const roles = new Set(["Release steward", "Principal engineer"]);
  if (category === "api") roles.add("API contract owner");
  if (category === "database") {
    roles.add("Database migration owner");
    roles.add("Security reviewer");
  }
  if (riskTags.includes("security-identity")) roles.add("Security and identity reviewer");
  if (riskTags.includes("clinical-safety")) roles.add("Clinical safety reviewer");
  if (riskTags.includes("public-claims")) roles.add("Claims and legal reviewer");
  if (riskTags.includes("release-pipeline") || category === "quality-security") roles.add("CI/CD and platform reviewer");
  if (category === "application-ui") roles.add("Product and UI owner");
  if (category === "documentation") roles.add("Documentation owner");
  if (/\.(tsx|css)$/i.test(filePath)) roles.add("Product and UI owner");
  return [...roles];
}

function buildLane(role, files) {
  return {
    reviewerRole: role,
    responsibility: reviewerResponsibilities[role] ?? "Review the candidate within the assigned specialist scope.",
    fileCount: files.length,
    fileRefs: files.map((file) => ({ fileId: file.fileId, path: file.path })),
    disposition: "pending-named-reviewer",
    approvalAuthority: false
  };
}

function redactPath(filePath) {
  return {
    path: null,
    pathHashSha256: sha256(filePath),
    pathDisclosure: "withheld-sensitive-or-non-source"
  };
}

function toReviewFile(input) {
  const safePath = isSafeRelativePath(input.path);
  const category = safePath ? classifyPath(input.path) : "other";
  const riskTags = safePath ? deriveRiskTags(input.path, category) : ["invalid-path"];
  const sensitive = safePath && isSensitivePath(input.path);
  const disposable = safePath && isDisposablePath(input.path);
  const nonSourceDeliverable = safePath && isNonSourceDeliverable(input.path);
  const rejectedReasons = [];

  if (!safePath) rejectedReasons.push("unsafe-path");
  if (sensitive) rejectedReasons.push("sensitive-path-withheld");
  if (disposable) rejectedReasons.push("disposable-generated-path");
  if (nonSourceDeliverable) rejectedReasons.push("non-source-deliverable");
  if (input.status === "unmerged") rejectedReasons.push("unmerged-source-state");
  if (input.inspectionError) rejectedReasons.push(input.inspectionError);
  if (input.sizeBytes > maximumHashFileBytes) rejectedReasons.push("file-exceeds-review-hash-limit");

  const reviewable = rejectedReasons.length === 0;
  const disclosure = sensitive || nonSourceDeliverable || !safePath
    ? redactPath(input.path)
    : { path: input.path, pathHashSha256: sha256(input.path), pathDisclosure: "internal-review-only" };
  const reviewerRoles = reviewable ? assignReviewerRoles(input.path, category, riskTags) : [];

  return {
    fileId: `file-${sha256(`${input.rawStatus}:${input.path}`).slice(0, 16)}`,
    ...disclosure,
    previousPathHashSha256: input.previousPath ? sha256(input.previousPath) : null,
    status: input.status,
    rawStatus: input.rawStatus,
    category,
    fileType: input.fileType,
    sizeBytes: input.sizeBytes,
    contentSha256: input.contentSha256,
    riskTags,
    reviewerRoles,
    reviewable,
    rejectedReasons
  };
}

export function buildCandidateReviewPacket({ manifest, inspectedFiles, generatedAt = new Date().toISOString() }) {
  const files = inspectedFiles
    .map(toReviewFile)
    .sort((left, right) => (left.path ?? left.pathHashSha256).localeCompare(right.path ?? right.pathHashSha256));
  const reviewableFiles = files.filter((file) => file.reviewable);
  const rejectedFiles = files.filter((file) => !file.reviewable);
  const reviewerRoles = [...new Set(reviewableFiles.flatMap((file) => file.reviewerRoles))].sort();
  const lanes = reviewerRoles.map((role) => buildLane(role, reviewableFiles.filter((file) => file.reviewerRoles.includes(role))));
  const requiredBaseCoverage = reviewableFiles.every((file) => (
    file.reviewerRoles.includes("Release steward") && file.reviewerRoles.includes("Principal engineer")
  ));
  const manifestReviewerCoverage = (manifest.requiredReviewers ?? []).every((role) => reviewerRoles.includes(role));
  const fileCountMatchesManifest = files.length === manifest.changedFileCount;
  const sourceFileCount = files.filter((file) => !file.rejectedReasons.includes("non-source-deliverable")).length;
  const sourceFileCountMatchesManifest = sourceFileCount === manifest.sourceChangedFileCount;
  const duplicateFileIds = files.length - new Set(files.map((file) => file.fileId)).size;
  const categoryCounts = Object.fromEntries(
    [...new Set(files.map((file) => file.category))]
      .sort()
      .map((category) => [category, files.filter((file) => file.category === category).length])
  );
  const blockers = [];

  if (!manifest.candidateReviewReady) blockers.push("candidate-manifest-not-review-ready");
  if (!isSha(manifest.candidateDigestSha256, 64)) blockers.push("candidate-fingerprint-missing");
  if (!isSha(manifest.sourceCandidateDigestSha256, 64)) blockers.push("source-fingerprint-missing");
  if (!fileCountMatchesManifest) blockers.push("candidate-file-count-mismatch");
  if (!sourceFileCountMatchesManifest) blockers.push("source-file-count-mismatch");
  if (!requiredBaseCoverage || !manifestReviewerCoverage) blockers.push("reviewer-lane-coverage-incomplete");
  if (duplicateFileIds > 0) blockers.push("duplicate-file-identity");
  if (rejectedFiles.length > 0) blockers.push("candidate-files-withheld-or-unreviewable");

  const completeCoverage = blockers.length === 0;
  const packetCore = {
    schemaVersion: "1.0.0",
    candidateMode: manifest.candidateMode,
    baseHeadSha: manifest.baseHeadSha,
    parentCommitSha: manifest.parentCommitSha,
    headTreeSha: manifest.headTreeSha,
    candidateDigestSha256: manifest.candidateDigestSha256,
    sourceCandidateDigestSha256: manifest.sourceCandidateDigestSha256,
    changedFileCount: manifest.changedFileCount,
    sourceChangedFileCount: manifest.sourceChangedFileCount,
    riskClass: manifest.riskClass,
    riskSignals: manifest.riskSignals,
    categoryCounts,
    reviewerRoles,
    lanes,
    files,
    blockers,
    completeCoverage
  };
  const candidateReviewPacketSha256 = sha256(stableJson(packetCore));
  const decision = completeCoverage
    ? "ready-for-named-reviewer-disposition"
    : "review-packet-failed-closed";

  return {
    service: "scrimed-release-candidate-review-packet",
    schemaVersion: "1.0.0",
    status: decision,
    generatedAt,
    ...packetCore,
    reviewableFileCount: reviewableFiles.length,
    rejectedFileCount: rejectedFiles.length,
    duplicateFileIdCount: duplicateFileIds,
    fileCountMatchesManifest,
    sourceFileCountMatchesManifest,
    requiredBaseCoverage,
    manifestReviewerCoverage,
    candidateReviewPacketSha256,
    approvalEvidenceTemplate: {
      status: "unrecorded",
      reviewerRole: null,
      reviewerIdentityHashSha256: null,
      candidateDigestSha256: manifest.candidateDigestSha256,
      sourceCandidateDigestSha256: manifest.sourceCandidateDigestSha256,
      candidateReviewPacketSha256,
      decision: null,
      decidedAt: null,
      expiresAt: null,
      evidencePointer: null,
      decisionHashSha256: null
    },
    authority: {
      sourceCommitAuthorized: false,
      deploymentAuthorized: false,
      migrationApplyAuthorized: false,
      releasePromotionAllowed: false,
      externalDistributionAuthorized: false,
      investorOutreachAuthorized: false,
      phiProcessingAuthorized: false,
      autonomousClinicalCareAuthorized: false
    },
    handling: {
      defaultOutputContainsPaths: false,
      jsonAndMarkdownAreInternalReviewArtifacts: true,
      fileContentsIncluded: false,
      rawDiffIncluded: false,
      secretsIncluded: false,
      phiIncluded: false
    },
    nextActions: completeCoverage
      ? [
        "Provide the internal JSON or Markdown packet to the named reviewers through the approved access-controlled channel.",
        "Record each reviewer disposition against the exact candidate, source, and packet SHA-256 values.",
        "Rerun candidate validation after any source change; stale review evidence must be rejected.",
        "Only an authorized release steward may advance a fully reviewed candidate into the approved commit workflow."
      ]
      : [
        "Resolve every packet blocker without deleting, staging, committing, or rewriting unrelated user work.",
        "Regenerate the candidate manifest and review packet after remediation."
      ],
    boundary: "This packet partitions a local candidate for human review. It includes hashes and internal path metadata only, grants no approval or release authority, and never commits, deploys, applies migrations, distributes artifacts, enables PHI, or authorizes clinical care."
  };
}

function runGit(gitArgs, options = {}) {
  const result = spawnSync("git", gitArgs, {
    cwd: options.cwd,
    encoding: options.encoding ?? "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status !== 0) {
    const message = typeof result.stderr === "string" ? result.stderr.trim() : "";
    throw new Error(`Git command failed closed: git ${gitArgs.join(" ")}${message ? ` (${message})` : ""}`);
  }
  return result.stdout;
}

function parsePorcelainStatus(statusBuffer) {
  const records = statusBuffer.toString("utf8").split("\0");
  const files = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!record) continue;
    const rawStatus = record.slice(0, 2);
    const filePath = record.slice(3);
    let previousPath = null;
    if (rawStatus.includes("R") || rawStatus.includes("C")) {
      previousPath = records[index + 1] || null;
      index += 1;
    }
    files.push({ rawStatus, status: normalizeStatus(rawStatus), path: filePath, previousPath });
  }

  return files;
}

function parseCommittedNameStatus(statusBuffer) {
  const records = statusBuffer.toString("utf8").split("\0").filter(Boolean);
  const files = [];

  for (let index = 0; index < records.length;) {
    const rawStatus = records[index++];
    if (!rawStatus) continue;
    if (rawStatus.startsWith("R") || rawStatus.startsWith("C")) {
      const previousPath = records[index++] ?? "";
      const filePath = records[index++] ?? "";
      files.push({ rawStatus, status: normalizeStatus(rawStatus), path: filePath, previousPath });
      continue;
    }
    const filePath = records[index++] ?? "";
    files.push({ rawStatus, status: normalizeStatus(rawStatus), path: filePath, previousPath: null });
  }

  return files;
}

async function inspectFile(repoRoot, file) {
  if (!isSafeRelativePath(file.path)) {
    return { ...file, fileType: "invalid", sizeBytes: 0, contentSha256: null, inspectionError: "unsafe-path" };
  }
  if (file.status === "deleted") {
    return { ...file, fileType: "deleted", sizeBytes: 0, contentSha256: null, inspectionError: null };
  }

  const absolutePath = path.resolve(repoRoot, file.path);
  const relativeToRoot = path.relative(repoRoot, absolutePath);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    return { ...file, fileType: "invalid", sizeBytes: 0, contentSha256: null, inspectionError: "outside-workspace-path" };
  }

  try {
    const fileStat = await lstat(absolutePath);
    if (fileStat.isSymbolicLink()) {
      const linkTarget = await readlink(absolutePath);
      return {
        ...file,
        fileType: "symbolic-link",
        sizeBytes: Buffer.byteLength(linkTarget),
        contentSha256: sha256(`symlink:${linkTarget}`),
        inspectionError: "symbolic-link-not-reviewable"
      };
    }
    if (!fileStat.isFile()) {
      return { ...file, fileType: "unsupported", sizeBytes: fileStat.size, contentSha256: null, inspectionError: "unsupported-file-type" };
    }
    if (fileStat.size > maximumHashFileBytes) {
      return { ...file, fileType: "file", sizeBytes: fileStat.size, contentSha256: null, inspectionError: null };
    }
    return {
      ...file,
      fileType: "file",
      sizeBytes: fileStat.size,
      contentSha256: sha256(await readFile(absolutePath)),
      inspectionError: null
    };
  } catch {
    return { ...file, fileType: "unreadable", sizeBytes: 0, contentSha256: null, inspectionError: "file-unreadable" };
  }
}

function loadManifest(repoRoot) {
  const result = spawnSync(process.execPath, ["scripts/release-candidate-manifest.mjs", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status !== 0) throw new Error("Release candidate manifest failed closed while building the review packet.");
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error("Release candidate manifest returned invalid JSON.");
  }
}

async function inspectCurrentCandidate() {
  const repoRoot = runGit(["rev-parse", "--show-toplevel"]).trim();
  const manifest = loadManifest(repoRoot);
  const parsedFiles = manifest.candidateMode === "clean-commit"
    ? parseCommittedNameStatus(runGit([
        "diff",
        "--name-status",
        "-z",
        manifest.parentCommitSha ?? emptyGitTreeSha,
        manifest.baseHeadSha,
        "--"
      ], { cwd: repoRoot, encoding: null }))
    : parsePorcelainStatus(runGit(["status", "--porcelain=v1", "-z", "--untracked-files=all"], {
        cwd: repoRoot,
        encoding: null
      }));
  const inspectedFiles = [];
  for (const file of parsedFiles) {
    inspectedFiles.push(await inspectFile(repoRoot, file));
  }
  return buildCandidateReviewPacket({ manifest, inspectedFiles });
}

function escapeMarkdown(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("`", "\\`");
}

function renderMarkdown(packet) {
  const lines = [
    "# SCRIMED Release Candidate Review Packet",
    "",
    `- Status: \`${packet.status}\``,
    `- Base commit: \`${packet.baseHeadSha}\``,
    `- Candidate SHA-256: \`${packet.candidateDigestSha256}\``,
    `- Source SHA-256: \`${packet.sourceCandidateDigestSha256}\``,
    `- Review packet SHA-256: \`${packet.candidateReviewPacketSha256}\``,
    `- Changed files: ${packet.changedFileCount}`,
    `- Reviewable files: ${packet.reviewableFileCount}`,
    `- Risk: \`${packet.riskClass}\``,
    "",
    "> Internal reviewer metadata only. This packet grants no commit, deployment, migration, release, distribution, PHI, or clinical authority.",
    "",
    "## Reviewer Lanes",
    "",
    "| Reviewer role | Files | Disposition |",
    "| --- | ---: | --- |",
    ...packet.lanes.map((lane) => `| ${escapeMarkdown(lane.reviewerRole)} | ${lane.fileCount} | ${lane.disposition} |`),
    "",
    "## Candidate Files",
    "",
    "| File | Status | Category | Content SHA-256 | Required reviewers |",
    "| --- | --- | --- | --- | --- |",
    ...packet.files.map((file) => `| ${escapeMarkdown(file.path ?? `[withheld:${file.pathHashSha256.slice(0, 12)}]`)} | ${file.status} | ${file.category} | ${file.contentSha256 ?? "deleted/unavailable"} | ${escapeMarkdown(file.reviewerRoles.join("; ") || "blocked")} |`),
    "",
    "## Blockers",
    "",
    ...(packet.blockers.length > 0 ? packet.blockers.map((blocker) => `- ${blocker}`) : ["- None at packet-generation time."]),
    "",
    "## Boundary",
    "",
    packet.boundary
  ];
  return `${lines.join("\n")}\n`;
}

function runSelfTest() {
  const digest = "a".repeat(64);
  const manifest = {
    candidateMode: "working-tree",
    baseHeadSha: "b".repeat(40),
    parentCommitSha: "c".repeat(40),
    headTreeSha: "d".repeat(40),
    candidateDigestSha256: digest,
    sourceCandidateDigestSha256: digest,
    changedFileCount: 3,
    sourceChangedFileCount: 3,
    candidateReviewReady: true,
    riskClass: "critical",
    riskSignals: { apiContract: true, clinicalSafety: true, databaseMigration: true },
    requiredReviewers: [
      "Release steward",
      "Principal engineer",
      "API contract owner",
      "Database migration owner",
      "Security reviewer",
      "Clinical safety reviewer"
    ]
  };
  const inspectedFiles = [
    {
      path: "app/api/clinical-context/route.ts",
      previousPath: null,
      rawStatus: " M",
      status: "modified",
      fileType: "file",
      sizeBytes: 10,
      contentSha256: "c".repeat(64),
      inspectionError: null
    },
    {
      path: "supabase/migrations/20260101000000_policy.sql",
      previousPath: null,
      rawStatus: "??",
      status: "untracked",
      fileType: "file",
      sizeBytes: 10,
      contentSha256: "d".repeat(64),
      inspectionError: null
    },
    {
      path: "docs/clinical-safety.md",
      previousPath: null,
      rawStatus: " M",
      status: "modified",
      fileType: "file",
      sizeBytes: 10,
      contentSha256: "e".repeat(64),
      inspectionError: null
    }
  ];
  const generatedAt = "2026-01-01T00:00:00.000Z";
  const ready = buildCandidateReviewPacket({ manifest, inspectedFiles, generatedAt });
  const repeated = buildCandidateReviewPacket({ manifest, inspectedFiles, generatedAt: "2026-01-02T00:00:00.000Z" });
  const blocked = buildCandidateReviewPacket({
    manifest: { ...manifest, changedFileCount: 4, sourceChangedFileCount: 4 },
    inspectedFiles: [
      ...inspectedFiles,
      {
        path: ".env.local",
        previousPath: null,
        rawStatus: "??",
        status: "untracked",
        fileType: "file",
        sizeBytes: 10,
        contentSha256: "f".repeat(64),
        inspectionError: null
      }
    ],
    generatedAt
  });
  const symlinkBlocked = buildCandidateReviewPacket({
    manifest: { ...manifest, changedFileCount: 4, sourceChangedFileCount: 4 },
    inspectedFiles: [
      ...inspectedFiles,
      {
        path: "app/lib/external-link.ts",
        previousPath: null,
        rawStatus: "??",
        status: "untracked",
        fileType: "symbolic-link",
        sizeBytes: 12,
        contentSha256: "f".repeat(64),
        inspectionError: "symbolic-link-not-reviewable"
      }
    ],
    generatedAt
  });

  if (
    ready.status !== "ready-for-named-reviewer-disposition"
    || ready.candidateMode !== "working-tree"
    || ready.parentCommitSha !== manifest.parentCommitSha
    || ready.headTreeSha !== manifest.headTreeSha
    || !ready.completeCoverage
    || !ready.requiredBaseCoverage
    || ready.reviewableFileCount !== 3
    || ready.authority.releasePromotionAllowed
    || ready.authority.sourceCommitAuthorized
    || ready.handling.fileContentsIncluded
    || ready.handling.rawDiffIncluded
    || ready.candidateReviewPacketSha256 !== repeated.candidateReviewPacketSha256
    || blocked.status !== "review-packet-failed-closed"
    || blocked.rejectedFileCount !== 1
    || blocked.files.find((file) => file.pathHashSha256 === sha256(".env.local"))?.path !== null
    || symlinkBlocked.status !== "review-packet-failed-closed"
    || !symlinkBlocked.files.some((file) => file.rejectedReasons.includes("symbolic-link-not-reviewable"))
  ) {
    throw new Error("Release candidate review packet self-test failed.");
  }

  console.log("pass SCRIMED release candidate review packet self-test");
}

if (args.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const packet = await inspectCurrentCandidate();

if (args.has("--json")) {
  console.log(JSON.stringify(packet, null, 2));
} else if (args.has("--markdown")) {
  console.log(renderMarkdown(packet));
} else {
  console.log(`report SCRIMED release candidate review packet: ${packet.status}`);
  console.log(`base_head=${packet.baseHeadSha?.slice(0, 12) ?? "unavailable"} candidate_fingerprint=${packet.candidateDigestSha256?.slice(0, 16) ?? "unavailable"} source_fingerprint=${packet.sourceCandidateDigestSha256?.slice(0, 16) ?? "unavailable"}`);
  console.log(`review_packet_fingerprint=${packet.candidateReviewPacketSha256.slice(0, 16)} changed_files=${packet.changedFileCount} reviewable_files=${packet.reviewableFileCount} rejected_files=${packet.rejectedFileCount}`);
  console.log(`reviewer_lanes=${packet.lanes.length} complete_coverage=${packet.completeCoverage} risk=${packet.riskClass}`);
  console.log(`blockers=${packet.blockers.length > 0 ? packet.blockers.join(";") : "none"}`);
  console.log(packet.boundary);
  console.log("release_promotion_allowed=false");
}

if (args.has("--strict") && !packet.completeCoverage) {
  process.exitCode = 1;
}
