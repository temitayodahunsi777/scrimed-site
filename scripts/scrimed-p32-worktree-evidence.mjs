#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { inspectWorktreeEvidenceFile } from "./lib/worktree-evidence-policy.mjs";

const repositoryRoot = process.cwd();
const evidenceDirectory = resolve(
  repositoryRoot,
  "artifacts/p32/worktree"
);
const initialAttributionPath = resolve(
  evidenceDirectory,
  "initial-worktree-attribution.json"
);
const attributionOutputPath = resolve(
  evidenceDirectory,
  "final-worktree-attribution.json"
);
const fingerprintOutputPath = resolve(
  evidenceDirectory,
  "noncandidate-worktree-fingerprint.json"
);
const selfExcludedPaths = new Set([
  relative(repositoryRoot, attributionOutputPath),
  relative(repositoryRoot, fingerprintOutputPath)
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function git(args) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed: ${result.stderr.trim() || "unknown error"}`
    );
  }
  return result.stdout;
}

function parsePorcelain(output) {
  if (!output) return [];
  const records = output.split("\0").filter(Boolean);
  const entries = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const status = record.slice(0, 2);
    const path = record.slice(3);
    if (status.includes("R") || status.includes("C")) {
      const destination = records[index + 1];
      if (!destination) {
        throw new Error(`Missing destination for ${status} record ${path}`);
      }
      entries.push({ gitStatus: status.trim(), path: destination, sourcePath: path });
      index += 1;
    } else {
      entries.push({ gitStatus: status.trim(), path });
    }
  }
  return entries.sort((left, right) => left.path.localeCompare(right.path));
}

function classifyAttribution(path, currentHash, initialByPath) {
  if (path.startsWith("artifacts/p32/")) {
    return {
      attribution: "GENERATED_EVIDENCE",
      attributionHistory: ["GENERATED_EVIDENCE"]
    };
  }
  const initial = initialByPath.get(path);
  if (!initial) {
    return {
      attribution: "THIS_RUN_CHANGE",
      attributionHistory: ["THIS_RUN_CHANGE"]
    };
  }
  if (initial.sha256 === currentHash) {
    return {
      attribution: "PREEXISTING_USER_CHANGE",
      attributionHistory: ["PREEXISTING_USER_CHANGE"],
      initialSha256: initial.sha256
    };
  }
  return {
    attribution: "THIS_RUN_CHANGE",
    attributionHistory: ["PREEXISTING_USER_CHANGE", "THIS_RUN_CHANGE"],
    initialSha256: initial.sha256
  };
}

async function buildEvidence() {
  const initial = JSON.parse(await readFile(initialAttributionPath, "utf8"));
  const initialByPath = new Map(
    initial.entries.map((entry) => [entry.path, entry])
  );
  const porcelainEntries = parsePorcelain(
    git(["status", "--porcelain=v1", "-z", "--untracked-files=all"])
  ).filter((entry) => !selfExcludedPaths.has(entry.path));

  const entries = [];
  for (const entry of porcelainEntries) {
    const deleted = entry.gitStatus.includes("D");
    const fileEvidence = deleted
      ? { sha256: null, fileMode: null, fileSizeBytes: null }
      : await inspectWorktreeEvidenceFile(repositoryRoot, entry.path);
    entries.push({
      ...entry,
      ...classifyAttribution(entry.path, fileEvidence.sha256, initialByPath),
      ...fileEvidence
    });
  }

  const branch = git(["branch", "--show-current"]).trim();
  const head = git(["rev-parse", "HEAD"]).trim();
  const mergeBaseWithOriginMain = git([
    "merge-base",
    "HEAD",
    "origin/main"
  ]).trim();
  const stagedEntryCount = parsePorcelain(
    git(["diff", "--cached", "--name-status", "-z"])
  ).length;
  const fingerprintInput = {
    head,
    mergeBaseWithOriginMain,
    entries: entries.map(({ gitStatus, path, sha256: fileHash, fileMode, fileSizeBytes }) => ({
      gitStatus,
      path,
      sha256: fileHash,
      fileMode,
      fileSizeBytes
    }))
  };
  const worktreeFingerprint = sha256(JSON.stringify(fingerprintInput));
  const capturedAt = new Date().toISOString();
  const attribution = {
    schemaVersion: "scrimed-p32-worktree-attribution-v1",
    evidenceClass: "NON_CANDIDATE",
    capturedAt,
    repository: "scrimed-site",
    branch,
    head,
    mergeBaseWithOriginMain,
    stagedEntryCount,
    entries,
    entryCount: entries.length,
    selfExcludedPaths: [...selfExcludedPaths].sort(),
    promotionAllowed: false,
    reason:
      "The worktree is dirty and includes pre-existing user changes. This manifest is review evidence, not an immutable release candidate."
  };
  const fingerprint = {
    schemaVersion: "scrimed-p32-noncandidate-worktree-fingerprint-v1",
    evidenceClass: "NON_CANDIDATE",
    capturedAt,
    branch,
    head,
    mergeBaseWithOriginMain,
    worktreeFingerprint,
    fingerprintAlgorithm: "sha256-canonical-json",
    fingerprintInput,
    candidateFingerprintIssued: false,
    sourceFingerprintIssued: false,
    promotionAllowed: false,
    exactNextGate:
      "A human must review attribution, create an attributable clean commit through the normal workflow, and rerun candidate evidence against that immutable commit."
  };

  await mkdir(dirname(attributionOutputPath), { recursive: true });
  await writeFile(
    attributionOutputPath,
    `${JSON.stringify(attribution, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    fingerprintOutputPath,
    `${JSON.stringify(fingerprint, null, 2)}\n`,
    "utf8"
  );
  return { attribution, fingerprint };
}

const { attribution, fingerprint } = await buildEvidence();
console.log(
  `pass SCRIMED p.32 NON_CANDIDATE worktree evidence entries=${attribution.entryCount} fingerprint=${fingerprint.worktreeFingerprint.slice(0, 16)}`
);
console.log(
  "promotion_allowed=false candidate_fingerprint_issued=false source_fingerprint_issued=false"
);
