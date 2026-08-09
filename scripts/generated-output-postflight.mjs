#!/usr/bin/env node

import { lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const duplicateSuffixPattern = / \d+(?=\.|$)/;
const topLevelNextDuplicatePattern = /^\.next \d+$/;

function canonicalEntryName(name) {
  return name.replace(duplicateSuffixPattern, "");
}

async function exists(filePath) {
  try {
    await lstat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function assertRedundantDuplicate(duplicatePath, canonicalPath, relativePath = "") {
  let duplicateStats;
  let canonicalStats;

  try {
    [duplicateStats, canonicalStats] = await Promise.all([lstat(duplicatePath), lstat(canonicalPath)]);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(
        `Duplicate generated output has no canonical counterpart: ${relativePath || path.basename(duplicatePath)}.`
      );
    }

    throw error;
  }

  if (duplicateStats.isSymbolicLink() || canonicalStats.isSymbolicLink()) {
    throw new Error(`Generated-output postflight refuses symbolic links: ${relativePath || duplicatePath}.`);
  }

  if (duplicateStats.isFile()) {
    if (!canonicalStats.isFile()) {
      throw new Error(`Duplicate and canonical generated output have different types: ${relativePath}.`);
    }

    if (duplicateStats.size !== canonicalStats.size) {
      throw new Error(`Duplicate generated file differs from its canonical counterpart: ${relativePath}.`);
    }

    const [duplicateContents, canonicalContents] = await Promise.all([
      readFile(duplicatePath),
      readFile(canonicalPath)
    ]);

    if (!duplicateContents.equals(canonicalContents)) {
      throw new Error(`Duplicate generated file differs from its canonical counterpart: ${relativePath}.`);
    }

    return;
  }

  if (!duplicateStats.isDirectory() || !canonicalStats.isDirectory()) {
    throw new Error(`Unsupported generated-output type encountered: ${relativePath || duplicatePath}.`);
  }

  const entries = await readdir(duplicatePath, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const childRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    await assertRedundantDuplicate(
      path.join(duplicatePath, entry.name),
      path.join(canonicalPath, entry.name),
      childRelativePath
    );
  }
}

async function collectDuplicateCandidates(root) {
  const candidates = [];
  const rootEntries = await readdir(root, { withFileTypes: true });

  for (const entry of rootEntries) {
    if (entry.isDirectory() && topLevelNextDuplicatePattern.test(entry.name)) {
      candidates.push({
        canonicalPath: path.join(root, ".next"),
        duplicatePath: path.join(root, entry.name),
        label: entry.name
      });
    }
  }

  const nextRoot = path.join(root, ".next");
  if (!(await exists(nextRoot))) {
    return candidates;
  }

  async function walk(currentPath, relativePath) {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const childPath = path.join(currentPath, entry.name);
      const childRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (duplicateSuffixPattern.test(entry.name)) {
        candidates.push({
          canonicalPath: path.join(currentPath, canonicalEntryName(entry.name)),
          duplicatePath: childPath,
          label: `.next/${childRelativePath}`
        });
        continue;
      }

      if (entry.isDirectory()) {
        await walk(childPath, childRelativePath);
      }
    }
  }

  await walk(nextRoot, "");
  return candidates;
}

async function reconcileGeneratedOutput(root) {
  const candidates = await collectDuplicateCandidates(root);

  for (const candidate of candidates) {
    await assertRedundantDuplicate(candidate.duplicatePath, candidate.canonicalPath, candidate.label);
  }

  for (const candidate of candidates) {
    await rm(candidate.duplicatePath, { force: true, recursive: true });
  }

  return candidates.map((candidate) => candidate.label);
}

async function writeFixture(filePath, contents) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
}

async function requireRejected(operation, expectedMessage) {
  try {
    await operation();
  } catch (error) {
    if (error instanceof Error && error.message.includes(expectedMessage)) {
      return;
    }

    throw error;
  }

  throw new Error(`Expected generated-output postflight rejection: ${expectedMessage}`);
}

async function runSelfTest() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "scrimed-generated-postflight-"));

  try {
    const safeRoot = path.join(fixtureRoot, "safe");
    await writeFixture(path.join(safeRoot, ".next/static/chunks/app.js"), "canonical-static");
    await writeFixture(path.join(safeRoot, ".next/static/manifest.json"), "canonical-manifest");
    await writeFixture(path.join(safeRoot, ".next/static 2/chunks/app.js"), "canonical-static");
    await writeFixture(path.join(safeRoot, ".next/types/routes.d.ts"), "canonical-types");
    await writeFixture(path.join(safeRoot, ".next/types/routes 2.d.ts"), "canonical-types");
    await writeFixture(path.join(safeRoot, ".next/BUILD_ID"), "build-one");
    await writeFixture(path.join(safeRoot, ".next 2/BUILD_ID"), "build-one");

    const removed = await reconcileGeneratedOutput(safeRoot);
    if (removed.length !== 3 || removed.some((label) => !label.includes(" 2"))) {
      throw new Error(`Safe generated-output fixture removed an unexpected set: ${removed.join(", ")}.`);
    }

    for (const removedPath of [
      path.join(safeRoot, ".next/static 2"),
      path.join(safeRoot, ".next/types/routes 2.d.ts"),
      path.join(safeRoot, ".next 2")
    ]) {
      if (await exists(removedPath)) {
        throw new Error(`Redundant generated output was not removed: ${removedPath}.`);
      }
    }

    if (!(await exists(path.join(safeRoot, ".next/static/chunks/app.js")))) {
      throw new Error("Canonical generated output was removed during reconciliation.");
    }

    const divergentRoot = path.join(fixtureRoot, "divergent");
    await writeFixture(path.join(divergentRoot, ".next/server/app.js"), "canonical");
    await writeFixture(path.join(divergentRoot, ".next/server/app 2.js"), "different!");
    await requireRejected(
      () => reconcileGeneratedOutput(divergentRoot),
      "differs from its canonical counterpart"
    );
    if (!(await exists(path.join(divergentRoot, ".next/server/app 2.js")))) {
      throw new Error("Divergent generated output was deleted instead of failing closed.");
    }

    const orphanRoot = path.join(fixtureRoot, "orphan");
    await writeFixture(path.join(orphanRoot, ".next/orphan 2.json"), "orphan");
    await requireRejected(
      () => reconcileGeneratedOutput(orphanRoot),
      "has no canonical counterpart"
    );

    console.log("pass SCRIMED generated-output postflight self-test");
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
}

const options = process.argv.slice(2);
if (options.length > 1 || (options.length === 1 && options[0] !== "--self-test")) {
  throw new Error(`Unsupported generated-output postflight option: ${options.join(", ")}`);
}

if (options[0] === "--self-test") {
  await runSelfTest();
  process.exit(0);
}

try {
  const removed = await reconcileGeneratedOutput(process.cwd());
  console.log(
    `pass SCRIMED generated-output postflight: duplicate_entries_removed=${removed.length} canonical_build_preserved=true`
  );
  if (removed.length > 0) {
    console.log(`removed redundant generated output: ${removed.join(", ")}`);
  }
} catch (error) {
  console.error(
    `fail SCRIMED generated-output postflight: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}
