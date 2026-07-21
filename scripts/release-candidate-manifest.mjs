#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--json", "--strict", "--self-test"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));
const maximumHashFileBytes = 32 * 1024 * 1024;

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported release candidate manifest option: ${unknownArgs.join(", ")}`);
}

const categoryOrder = [
  "api",
  "application-ui",
  "core-policy",
  "database",
  "documentation",
  "quality-security",
  "release-infrastructure",
  "configuration",
  "other"
];

function isSha(value, length) {
  return typeof value === "string" && new RegExp(`^[0-9a-f]{${length}}$`, "i").test(value);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const emptyGitTreeSha = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

function classifyPath(path) {
  if (path.startsWith("app/api/")) return "api";
  if (path.startsWith("app/lib/")) return "core-policy";
  if (path.startsWith("app/")) return "application-ui";
  if (path.startsWith("supabase/migrations/") || /(^|\/)migrations?\//i.test(path)) return "database";
  if (path.startsWith("docs/") || /(^|\/)readme/i.test(path)) return "documentation";
  if (path.startsWith("scripts/") || path.startsWith("tests/") || path.startsWith("test/")) return "quality-security";
  if (path.startsWith(".github/") || path.startsWith("vercel") || path.startsWith("proxy.")) return "release-infrastructure";
  if (path === "package.json" || path === "package-lock.json" || path.endsWith("config.ts") || path.endsWith("config.js")) return "configuration";
  return "other";
}

function isDisposablePath(path) {
  return [".next/", "node_modules/", "coverage/", "dist/", "build/"].some((prefix) => path.startsWith(prefix))
    || path.endsWith(".log")
    || path.endsWith(".tsbuildinfo")
    || path.endsWith(".DS_Store");
}

function isNonSourceDeliverable(path) {
  return path.startsWith("outputs/");
}

function isSensitivePath(path) {
  const lower = path.toLowerCase();
  if (lower === ".env.example" || lower.endsWith("/.env.example")) return false;
  return /(^|\/)\.env($|\.)/.test(lower)
    || /(^|\/)(\.npmrc|\.pypirc|\.netrc|\.git-credentials)$/.test(lower)
    || /(^|\/)(id_rsa|id_ed25519|keystore)(\.|$)/.test(lower)
    || /(^|\/)(credentials?|service-account|private[-_]?key)(\.|\/|$)/.test(lower)
    || /\.(pem|p12|pfx|key|jks)$/i.test(path);
}

function deriveSignals(paths) {
  const joined = paths.join("\n").toLowerCase();
  return {
    databaseMigration: paths.some((path) => classifyPath(path) === "database"),
    authenticationOrIdentity: /(^|\/)(auth|identity|tenant|middleware|proxy|protected)/m.test(joined),
    apiContract: paths.some((path) => path.startsWith("app/api/")),
    clinicalSafety: /(clinical|patient|health-record|fhir|hl7|dicom|payer|ehr|medication|imaging)/.test(joined),
    releasePipeline: paths.some((path) => path.startsWith(".github/") || path.startsWith("scripts/release") || path === "package.json" || path === "package-lock.json"),
    publicClaims: /(claims|investor|marketing|public-market|approvals-readiness|capital-vitality)/.test(joined)
  };
}

function deriveRequiredReviewers(signals) {
  const reviewers = ["Release steward", "Principal engineer"];
  if (signals.apiContract) reviewers.push("API contract owner");
  if (signals.authenticationOrIdentity) reviewers.push("Security and identity reviewer");
  if (signals.databaseMigration) reviewers.push("Database migration owner", "Security reviewer");
  if (signals.clinicalSafety) reviewers.push("Clinical safety reviewer");
  if (signals.publicClaims) reviewers.push("Claims and legal reviewer");
  if (signals.releasePipeline) reviewers.push("CI/CD and platform reviewer");
  return [...new Set(reviewers)];
}

function deriveRiskClass(signals) {
  if (signals.databaseMigration && (signals.authenticationOrIdentity || signals.clinicalSafety)) return "critical";
  if (signals.databaseMigration || signals.authenticationOrIdentity || signals.clinicalSafety) return "high";
  if (signals.apiContract || signals.releasePipeline || signals.publicClaims) return "moderate";
  return "low";
}

export function evaluateReleaseCandidateManifest(input) {
  const strictProvenanceEligible = input.gitAvailable
    && input.dirtyEntryCount === 0
    && isSha(input.headSha, 40);
  const candidateDigestReady = isSha(input.candidateDigestSha256, 64)
    && isSha(input.trackedDiffSha256, 64)
    && isSha(input.untrackedContentSha256, 64);
  const sourceDigestReady = isSha(input.sourceCandidateDigestSha256, 64);
  const sourceReviewReady = input.gitAvailable
    && sourceDigestReady
    && input.sourceChangedFileCount > 0
    && input.disposableArtifactCount === 0
    && input.sensitivePathCount === 0
    && input.sourceUnreadableFileCount === 0
    && input.sourceOversizedFileCount === 0;
  const artifactReviewRequired = input.nonSourceDeliverableCount > 0;
  const candidateReviewReady = sourceReviewReady && !artifactReviewRequired && candidateDigestReady;
  const status = !input.gitAvailable
    ? "candidate-manifest-blocked-git-unavailable"
    : strictProvenanceEligible
      ? "clean-source-candidate-manifest-ready"
      : sourceReviewReady && artifactReviewRequired
        ? "dirty-candidate-partitioned-review-required"
        : candidateReviewReady
          ? "dirty-candidate-manifest-ready-review-required"
          : "dirty-candidate-manifest-remediation-required";
  const remediation = [];

  if (input.disposableArtifactCount > 0) {
    remediation.push("Remove or relocate disposable generated artifacts from the intended release set after confirming they are not user-authored evidence.");
  }
  if (input.nonSourceDeliverableCount > 0) {
    remediation.push("Exclude non-source business deliverables from the application source release and route them through the artifact review and distribution-control lane.");
  }
  if (input.sensitivePathCount > 0) {
    remediation.push("Quarantine sensitive-path candidates and complete secret review before staging any release files.");
  }
  if (input.unreadableFileCount > 0 || input.oversizedFileCount > 0) {
    remediation.push("Resolve unreadable or oversized candidate files before relying on the manifest digest.");
  }
  if (input.dirtyEntryCount > 0) {
    remediation.push("Partition the candidate by category and obtain every required reviewer decision before committing.");
  }

  return {
    service: "scrimed-release-candidate-manifest",
    status,
    candidateMode: input.candidateMode,
    candidateBaseRef: input.candidateBaseRef,
    candidateBaseSha: isSha(input.candidateBaseSha, 40) ? input.candidateBaseSha : null,
    baseHeadSha: isSha(input.headSha, 40) ? input.headSha : null,
    baseHeadFingerprint: isSha(input.headSha, 40) ? input.headSha.slice(0, 12) : "unavailable",
    parentCommitSha: isSha(input.parentCommitSha, 40) ? input.parentCommitSha : null,
    headTreeSha: isSha(input.headTreeSha, 40) ? input.headTreeSha : null,
    candidateDigestSha256: candidateDigestReady ? input.candidateDigestSha256 : null,
    sourceCandidateDigestSha256: sourceDigestReady ? input.sourceCandidateDigestSha256 : null,
    nonSourceDeliverablesDigestSha256: isSha(input.nonSourceDeliverablesDigestSha256, 64)
      ? input.nonSourceDeliverablesDigestSha256
      : null,
    trackedDiffSha256: isSha(input.trackedDiffSha256, 64) ? input.trackedDiffSha256 : null,
    untrackedContentSha256: isSha(input.untrackedContentSha256, 64) ? input.untrackedContentSha256 : null,
    dirtyEntryCount: input.dirtyEntryCount,
    changedFileCount: input.changedFileCount,
    sourceChangedFileCount: input.sourceChangedFileCount,
    modifiedFileCount: input.modifiedFileCount,
    untrackedFileCount: input.untrackedFileCount,
    deletedFileCount: input.deletedFileCount,
    renamedFileCount: input.renamedFileCount,
    categoryCounts: input.categoryCounts,
    riskSignals: input.riskSignals,
    riskClass: deriveRiskClass(input.riskSignals),
    requiredReviewers: deriveRequiredReviewers(input.riskSignals),
    disposableArtifactCount: input.disposableArtifactCount,
    nonSourceDeliverableCount: input.nonSourceDeliverableCount,
    sensitivePathCount: input.sensitivePathCount,
    unreadableFileCount: input.unreadableFileCount,
    oversizedFileCount: input.oversizedFileCount,
    sourceUnreadableFileCount: input.sourceUnreadableFileCount,
    sourceOversizedFileCount: input.sourceOversizedFileCount,
    sourceReviewReady,
    artifactReviewRequired,
    candidateReviewReady,
    strictProvenanceEligible,
    releasePromotionAllowed: false,
    pathsPrinted: false,
    fileContentsPrinted: false,
    rawDiffPrinted: false,
    remediation,
    nextActions: strictProvenanceEligible
      ? [
          "Generate the commit-bound review packet for the exact HEAD change set.",
          "Run typecheck, lint, the full nonsecret suite, build, and applicable authenticated or public smoke against the immutable revision.",
          "Record named reviewer decisions against the exact commit, source, review-packet, and validation fingerprints.",
          "Keep deployment, migration, external distribution, PHI, and clinical authority blocked until their independent gates pass."
        ]
      : [
          "Review category counts, risk signals, and required reviewer roles without distributing raw candidate content.",
          "Run typecheck, lint, the full nonsecret suite, build, and applicable authenticated or public smoke in an approved environment.",
          "Stage and commit only the reviewed candidate through the approved source-control workflow.",
          "Run npm run release:provenance:strict on the resulting clean immutable revision.",
          "Record the approved full SHA only after named release authority signs off."
        ],
    boundary: "The candidate manifest fingerprints local source changes without printing paths, file contents, raw diffs, secrets, credentials, or PHI. It is review preparation only and never commits, deploys, applies migrations, approves claims, grants PHI or clinical authority, or permits release promotion."
  };
}

function runGitText(gitArgs) {
  const result = spawnSync("git", gitArgs, {
    encoding: "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024
  });
  return result.status === 0 ? result.stdout : null;
}

function runGitBuffer(gitArgs) {
  const result = spawnSync("git", gitArgs, {
    encoding: null,
    shell: false,
    maxBuffer: 64 * 1024 * 1024
  });
  return result.status === 0 ? result.stdout : null;
}

function splitNullTerminated(value) {
  if (!value) return [];
  return value.split("\0").filter(Boolean);
}

function resolveCandidateBase(headSha, parentCommitSha) {
  const requestedBaseRef = process.env.SCRIMED_RELEASE_CANDIDATE_BASE_REF?.trim();
  if (!requestedBaseRef) {
    return {
      candidateBaseRef: isSha(parentCommitSha, 40) ? "HEAD^" : "EMPTY_TREE",
      candidateBaseSha: isSha(parentCommitSha, 40) ? parentCommitSha : emptyGitTreeSha
    };
  }
  if (
    requestedBaseRef.startsWith("-")
    || requestedBaseRef.includes("..")
    || requestedBaseRef.includes("@{")
    || !/^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/.test(requestedBaseRef)
  ) {
    throw new Error("SCRIMED_RELEASE_CANDIDATE_BASE_REF is not a safe Git commit or reference.");
  }
  const candidateBaseSha = runGitText(["rev-parse", "--verify", `${requestedBaseRef}^{commit}`])?.trim() ?? null;
  if (!isSha(candidateBaseSha, 40)) {
    throw new Error("SCRIMED_RELEASE_CANDIDATE_BASE_REF could not be resolved to a commit.");
  }
  if (runGitText(["merge-base", "--is-ancestor", candidateBaseSha, headSha]) === null) {
    throw new Error("SCRIMED_RELEASE_CANDIDATE_BASE_REF must be an ancestor of HEAD.");
  }
  if (candidateBaseSha === headSha) {
    throw new Error("SCRIMED_RELEASE_CANDIDATE_BASE_REF must precede HEAD.");
  }
  return { candidateBaseRef: requestedBaseRef, candidateBaseSha };
}

async function hashUntrackedFiles(paths) {
  const aggregate = createHash("sha256");
  let unreadableFileCount = 0;
  let oversizedFileCount = 0;

  const updateFramed = (value) => {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value));
    const length = Buffer.alloc(8);
    length.writeBigUInt64BE(BigInt(bytes.length));
    aggregate.update(length);
    aggregate.update(bytes);
  };

  for (const path of [...paths].sort()) {
    try {
      const fileStat = await lstat(path);
      updateFramed("candidate-file-v1");
      updateFramed(path);
      updateFramed(fileStat.mode);
      updateFramed(fileStat.size);
      if (fileStat.isSymbolicLink() || !fileStat.isFile()) {
        unreadableFileCount += 1;
        continue;
      }
      if (fileStat.size > maximumHashFileBytes) {
        oversizedFileCount += 1;
        continue;
      }
      updateFramed(await readFile(path));
    } catch {
      unreadableFileCount += 1;
    }
  }

  return {
    digest: aggregate.digest("hex"),
    unreadableFileCount,
    oversizedFileCount
  };
}

async function inspectCandidate() {
  const headSha = runGitText(["rev-parse", "HEAD"])?.trim() ?? null;
  const parentCommitSha = runGitText(["rev-parse", "HEAD^"])?.trim() ?? null;
  const headTreeSha = runGitText(["rev-parse", "HEAD^{tree}"])?.trim() ?? null;
  const statusText = runGitText(["status", "--porcelain=v1", "--untracked-files=all"]);
  const statusLines = statusText?.split(/\r?\n/).filter(Boolean) ?? [];
  const cleanCommitCandidate = isSha(headSha, 40) && statusText !== null && statusLines.length === 0;
  const candidateMode = cleanCommitCandidate ? "clean-commit" : "working-tree";
  const resolvedBase = cleanCommitCandidate
    ? resolveCandidateBase(headSha, parentCommitSha)
    : { candidateBaseRef: "HEAD", candidateBaseSha: headSha };
  const commitDiffBase = resolvedBase.candidateBaseSha;
  const trackedPaths = splitNullTerminated(runGitText(
    cleanCommitCandidate
      ? ["diff", "--name-only", "-z", commitDiffBase, headSha, "--"]
      : ["diff", "--name-only", "-z", "HEAD", "--"]
  ));
  const untrackedPaths = cleanCommitCandidate
    ? []
    : splitNullTerminated(runGitText(["ls-files", "--others", "--exclude-standard", "-z"]));
  const trackedDiff = runGitBuffer(
    cleanCommitCandidate
      ? ["diff", "--binary", "--no-ext-diff", commitDiffBase, headSha, "--"]
      : ["diff", "--binary", "--no-ext-diff", "HEAD", "--"]
  );
  const commitNameStatus = cleanCommitCandidate
    ? runGitText(["diff", "--name-status", commitDiffBase, headSha, "--"])?.split(/\r?\n/).filter(Boolean) ?? []
    : [];
  const gitAvailable = isSha(headSha, 40)
    && isSha(headTreeSha, 40)
    && statusText !== null
    && trackedDiff !== null;
  const allPaths = [...new Set([...trackedPaths, ...untrackedPaths])].sort();
  const sourcePaths = allPaths.filter((path) => !isNonSourceDeliverable(path));
  const sourceTrackedPaths = trackedPaths.filter((path) => !isNonSourceDeliverable(path));
  const sourceUntrackedPaths = untrackedPaths.filter((path) => !isNonSourceDeliverable(path));
  const nonSourcePaths = allPaths.filter(isNonSourceDeliverable);
  const nonSourceTrackedPaths = trackedPaths.filter(isNonSourceDeliverable);
  const nonSourceUntrackedPaths = untrackedPaths.filter(isNonSourceDeliverable);
  const categoryCounts = Object.fromEntries(categoryOrder.map((category) => [category, 0]));

  for (const path of allPaths) {
    categoryCounts[classifyPath(path)] += 1;
  }

  const untracked = await hashUntrackedFiles(untrackedPaths);
  const sourceUntracked = await hashUntrackedFiles(sourceUntrackedPaths);
  const nonSourceUntracked = await hashUntrackedFiles(nonSourceUntrackedPaths);
  const trackedDiffSha256 = trackedDiff ? sha256(trackedDiff) : null;
  const sourceTrackedDiff = sourceTrackedPaths.length > 0
    ? runGitBuffer(cleanCommitCandidate
      ? ["diff", "--binary", "--no-ext-diff", commitDiffBase, headSha, "--", ...sourceTrackedPaths]
      : ["diff", "--binary", "--no-ext-diff", "HEAD", "--", ...sourceTrackedPaths])
    : Buffer.from("");
  const nonSourceTrackedDiff = nonSourceTrackedPaths.length > 0
    ? runGitBuffer(cleanCommitCandidate
      ? ["diff", "--binary", "--no-ext-diff", commitDiffBase, headSha, "--", ...nonSourceTrackedPaths]
      : ["diff", "--binary", "--no-ext-diff", "HEAD", "--", ...nonSourceTrackedPaths])
    : Buffer.from("");
  const sourceTrackedDiffSha256 = sourceTrackedDiff ? sha256(sourceTrackedDiff) : null;
  const nonSourceTrackedDiffSha256 = nonSourceTrackedDiff ? sha256(nonSourceTrackedDiff) : null;
  const candidateDigestSha256 = gitAvailable && trackedDiffSha256
    ? sha256(JSON.stringify({
      candidateMode,
      candidateBaseSha: resolvedBase.candidateBaseSha,
      headSha,
      parentCommitSha: isSha(parentCommitSha, 40) ? parentCommitSha : null,
      headTreeSha,
      trackedDiffSha256,
      untrackedContentSha256: untracked.digest,
      changedFileCount: allPaths.length
    }))
    : null;
  const sourceCandidateDigestSha256 = gitAvailable && sourceTrackedDiffSha256
    ? sha256(JSON.stringify({
      candidateMode,
      candidateBaseSha: resolvedBase.candidateBaseSha,
      headSha,
      parentCommitSha: isSha(parentCommitSha, 40) ? parentCommitSha : null,
      headTreeSha,
      sourceTrackedDiffSha256,
      sourceUntrackedContentSha256: sourceUntracked.digest,
      sourceChangedFileCount: sourcePaths.length
    }))
    : null;
  const nonSourceDeliverablesDigestSha256 = nonSourcePaths.length > 0 && nonSourceTrackedDiffSha256
    ? sha256(JSON.stringify({
      candidateMode,
      candidateBaseSha: resolvedBase.candidateBaseSha,
      headSha,
      nonSourceTrackedDiffSha256,
      nonSourceUntrackedContentSha256: nonSourceUntracked.digest,
      nonSourceDeliverableCount: nonSourcePaths.length
    }))
    : null;

  return {
    gitAvailable,
    candidateMode,
    candidateBaseRef: resolvedBase.candidateBaseRef,
    candidateBaseSha: resolvedBase.candidateBaseSha,
    headSha,
    parentCommitSha,
    headTreeSha,
    candidateDigestSha256,
    sourceCandidateDigestSha256,
    nonSourceDeliverablesDigestSha256,
    trackedDiffSha256,
    untrackedContentSha256: untracked.digest,
    dirtyEntryCount: statusLines.length,
    changedFileCount: allPaths.length,
    sourceChangedFileCount: sourcePaths.length,
    modifiedFileCount: cleanCommitCandidate
      ? commitNameStatus.filter((line) => line.startsWith("M\t")).length
      : statusLines.filter((line) => !line.startsWith("??") && !line.slice(0, 2).includes("D") && !line.slice(0, 2).includes("R")).length,
    untrackedFileCount: cleanCommitCandidate ? 0 : statusLines.filter((line) => line.startsWith("??")).length,
    deletedFileCount: cleanCommitCandidate
      ? commitNameStatus.filter((line) => line.startsWith("D\t")).length
      : statusLines.filter((line) => line.slice(0, 2).includes("D")).length,
    renamedFileCount: cleanCommitCandidate
      ? commitNameStatus.filter((line) => line.startsWith("R")).length
      : statusLines.filter((line) => line.slice(0, 2).includes("R")).length,
    categoryCounts,
    riskSignals: deriveSignals(allPaths),
    disposableArtifactCount: allPaths.filter(isDisposablePath).length,
    nonSourceDeliverableCount: allPaths.filter(isNonSourceDeliverable).length,
    sensitivePathCount: allPaths.filter(isSensitivePath).length,
    unreadableFileCount: untracked.unreadableFileCount,
    oversizedFileCount: untracked.oversizedFileCount,
    sourceUnreadableFileCount: sourceUntracked.unreadableFileCount,
    sourceOversizedFileCount: sourceUntracked.oversizedFileCount
  };
}

function runSelfTest() {
  const digest = "a".repeat(64);
  const base = {
    gitAvailable: true,
    candidateMode: "working-tree",
    candidateBaseRef: "HEAD",
    candidateBaseSha: "b".repeat(40),
    headSha: "b".repeat(40),
    parentCommitSha: "c".repeat(40),
    headTreeSha: "d".repeat(40),
    candidateDigestSha256: digest,
    sourceCandidateDigestSha256: digest,
    nonSourceDeliverablesDigestSha256: null,
    trackedDiffSha256: digest,
    untrackedContentSha256: digest,
    dirtyEntryCount: 2,
    changedFileCount: 2,
    sourceChangedFileCount: 2,
    modifiedFileCount: 1,
    untrackedFileCount: 1,
    deletedFileCount: 0,
    renamedFileCount: 0,
    categoryCounts: Object.fromEntries(categoryOrder.map((category) => [category, category === "api" ? 2 : 0])),
    riskSignals: {
      databaseMigration: false,
      authenticationOrIdentity: false,
      apiContract: true,
      clinicalSafety: false,
      releasePipeline: false,
      publicClaims: false
    },
    disposableArtifactCount: 0,
    nonSourceDeliverableCount: 0,
    sensitivePathCount: 0,
    unreadableFileCount: 0,
    oversizedFileCount: 0,
    sourceUnreadableFileCount: 0,
    sourceOversizedFileCount: 0
  };
  const reviewable = evaluateReleaseCandidateManifest(base);
  const disposable = evaluateReleaseCandidateManifest({ ...base, disposableArtifactCount: 1 });
  const nonSource = evaluateReleaseCandidateManifest({
    ...base,
    nonSourceDeliverableCount: 1,
    nonSourceDeliverablesDigestSha256: digest
  });
  const sensitive = evaluateReleaseCandidateManifest({ ...base, sensitivePathCount: 1 });
  const clean = evaluateReleaseCandidateManifest({
    ...base,
    candidateMode: "clean-commit",
    candidateBaseRef: "reviewed-base",
    candidateBaseSha: base.parentCommitSha,
    dirtyEntryCount: 0,
    changedFileCount: 0,
    modifiedFileCount: 0,
    untrackedFileCount: 0
  });
  const unavailable = evaluateReleaseCandidateManifest({ ...base, gitAvailable: false, headSha: null });

  if (
    !reviewable.candidateReviewReady
    || reviewable.baseHeadSha !== base.headSha
    || reviewable.strictProvenanceEligible
    || reviewable.releasePromotionAllowed
    || reviewable.pathsPrinted
    || reviewable.fileContentsPrinted
    || disposable.candidateReviewReady
    || nonSource.candidateReviewReady
    || !nonSource.sourceReviewReady
    || !nonSource.artifactReviewRequired
    || nonSource.status !== "dirty-candidate-partitioned-review-required"
    || sensitive.candidateReviewReady
    || !clean.strictProvenanceEligible
    || !clean.candidateReviewReady
    || clean.candidateMode !== "clean-commit"
    || clean.candidateBaseRef !== "reviewed-base"
    || clean.candidateBaseSha !== base.parentCommitSha
    || clean.parentCommitSha !== base.parentCommitSha
    || clean.headTreeSha !== base.headTreeSha
    || unavailable.status !== "candidate-manifest-blocked-git-unavailable"
    || unavailable.baseHeadSha !== null
  ) {
    throw new Error("Release candidate manifest self-test failed.");
  }

  console.log("pass SCRIMED release candidate manifest self-test");
}

if (args.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const report = evaluateReleaseCandidateManifest(await inspectCandidate());

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`report SCRIMED release candidate manifest: ${report.status}`);
  console.log(`base_head=${report.baseHeadFingerprint} candidate_fingerprint=${report.candidateDigestSha256?.slice(0, 16) ?? "unavailable"} dirty_entries=${report.dirtyEntryCount} changed_files=${report.changedFileCount}`);
  console.log(`source_fingerprint=${report.sourceCandidateDigestSha256?.slice(0, 16) ?? "unavailable"} source_files=${report.sourceChangedFileCount} source_review_ready=${report.sourceReviewReady}`);
  console.log(`artifact_fingerprint=${report.nonSourceDeliverablesDigestSha256?.slice(0, 16) ?? "none"} artifact_review_required=${report.artifactReviewRequired}`);
  console.log(`risk=${report.riskClass} candidate_review_ready=${report.candidateReviewReady} strict_provenance_eligible=${report.strictProvenanceEligible}`);
  console.log(`disposable_artifacts=${report.disposableArtifactCount} non_source_deliverables=${report.nonSourceDeliverableCount} sensitive_paths=${report.sensitivePathCount} unreadable_files=${report.unreadableFileCount} oversized_files=${report.oversizedFileCount}`);
  console.log(`required_reviewers=${report.requiredReviewers.join("; ")}`);
  console.log(report.boundary);
  console.log("release_promotion_allowed=false");
}

if (args.has("--strict") && !report.strictProvenanceEligible) {
  process.exitCode = 1;
}
