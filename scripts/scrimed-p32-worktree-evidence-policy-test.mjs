#!/usr/bin/env node

import { mkdir, mkdtemp, rm, symlink, truncate, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  inspectWorktreeEvidenceFile,
  maximumWorktreeEvidenceFileBytes,
  resolveRepositoryFile
} from "./lib/worktree-evidence-policy.mjs";

const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "scrimed-worktree-evidence-"));

async function expectRejected(label, operation, expectedMessage) {
  try {
    await operation();
  } catch (error) {
    if (!String(error?.message).includes(expectedMessage)) {
      throw new Error(`${label} returned an unexpected error: ${error?.message ?? error}`);
    }
    return;
  }

  throw new Error(`${label} was not rejected.`);
}

try {
  const repositoryRoot = path.join(fixtureRoot, "repository");
  const externalRoot = path.join(fixtureRoot, "external");
  await mkdir(path.join(repositoryRoot, "src"), { recursive: true });
  await mkdir(externalRoot, { recursive: true });
  await writeFile(path.join(repositoryRoot, "src", "safe.ts"), "safe\n", "utf8");
  await writeFile(path.join(externalRoot, "outside.txt"), "outside\n", "utf8");

  const firstInspection = await inspectWorktreeEvidenceFile(repositoryRoot, "src/safe.ts");
  const secondInspection = await inspectWorktreeEvidenceFile(repositoryRoot, "src/safe.ts");
  if (
    firstInspection.sha256 !== secondInspection.sha256 ||
    !/^[a-f0-9]{64}$/.test(firstInspection.sha256) ||
    firstInspection.fileSizeBytes !== 5 ||
    !Number.isInteger(firstInspection.fileMode)
  ) {
    throw new Error("Regular-file worktree evidence was not deterministic.");
  }

  await expectRejected(
    "parent traversal",
    async () => resolveRepositoryFile(repositoryRoot, "../external/outside.txt"),
    "outside the repository"
  );
  await expectRejected(
    "directory input",
    async () => inspectWorktreeEvidenceFile(repositoryRoot, "src"),
    "only accepts regular files"
  );

  await symlink(path.join(externalRoot, "outside.txt"), path.join(repositoryRoot, "src", "linked.ts"));
  await expectRejected(
    "symbolic-link input",
    async () => inspectWorktreeEvidenceFile(repositoryRoot, "src/linked.ts"),
    "rejects symbolic links"
  );

  const oversizedPath = path.join(repositoryRoot, "src", "oversized.bin");
  await writeFile(oversizedPath, "", "utf8");
  await truncate(oversizedPath, maximumWorktreeEvidenceFileBytes + 1);
  await expectRejected(
    "oversized input",
    async () => inspectWorktreeEvidenceFile(repositoryRoot, "src/oversized.bin"),
    "exceeds"
  );

  console.log("pass SCRIMED p.32 worktree evidence policy test");
} finally {
  await rm(fixtureRoot, { force: true, recursive: true });
}
