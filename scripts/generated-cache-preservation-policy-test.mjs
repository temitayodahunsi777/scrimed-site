#!/usr/bin/env node

import { access, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  inspectCacheOnlyNextRoot,
  inspectPreservableNextCache
} from "./lib/generated-cache-policy.mjs";

const cleanupScript = path.resolve("scripts/clean-generated-cache.mjs");
const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "scrimed-cache-preservation-"));

async function writeFixture(root, relativePath, contents) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function runCleanup(root, args = []) {
  const result = spawnSync(process.execPath, [cleanupScript, ...args], {
    cwd: root,
    encoding: "utf8",
    shell: false
  });

  if (result.status !== 0) {
    throw new Error(`Generated cleanup fixture failed: ${result.stderr || result.stdout}`);
  }

  return `${result.stdout}${result.stderr}`;
}

try {
  const safeRoot = path.join(fixtureRoot, "safe");
  await writeFixture(safeRoot, ".next/cache/webpack/cache.bin", "safe-cache");
  await writeFixture(safeRoot, ".next/server/app.js", "generated-output");
  await writeFixture(safeRoot, ".next/BUILD_ID", "build-id");
  await writeFixture(safeRoot, "tsconfig.tsbuildinfo", "typescript-output");
  if ((await inspectCacheOnlyNextRoot(safeRoot)).safe) {
    throw new Error("Generated application output was misclassified as cache-only.");
  }
  const safeOutput = runCleanup(safeRoot, ["--preserve-next-cache"]);

  if (!(await exists(path.join(safeRoot, ".next/cache/webpack/cache.bin")))) {
    throw new Error("Safe Next cache was not preserved.");
  }
  for (const removedPath of [".next/server/app.js", ".next/BUILD_ID", "tsconfig.tsbuildinfo"]) {
    if (await exists(path.join(safeRoot, removedPath))) {
      throw new Error(`Disposable generated output survived cleanup: ${removedPath}.`);
    }
  }
  if (!safeOutput.includes("Preserved non-authoritative build cache")) {
    throw new Error("Cache-preservation receipt was not emitted.");
  }
  if (!(await inspectCacheOnlyNextRoot(safeRoot)).safe) {
    throw new Error("Preserved cache was not recognized as the only safe .next residue.");
  }

  const unsafeRoot = path.join(fixtureRoot, "unsafe");
  await writeFixture(unsafeRoot, ".next/cache/webpack/cache 2.bin", "duplicate-cache");
  await writeFixture(unsafeRoot, ".next/server/app.js", "generated-output");
  if ((await inspectPreservableNextCache(unsafeRoot)).safe) {
    throw new Error("Duplicate-suffixed cache output was misclassified as safe.");
  }
  const unsafeOutput = runCleanup(unsafeRoot, ["--preserve-next-cache"]);
  if (await exists(path.join(unsafeRoot, ".next"))) {
    throw new Error("Unsafe Next cache survived fail-closed cleanup.");
  }
  if (!unsafeOutput.includes("Discarded Next build cache")) {
    throw new Error("Unsafe-cache disposal receipt was not emitted.");
  }

  const fullCleanRoot = path.join(fixtureRoot, "full-clean");
  await writeFixture(fullCleanRoot, ".next/cache/webpack/cache.bin", "safe-cache");
  runCleanup(fullCleanRoot);
  if (await exists(path.join(fullCleanRoot, ".next"))) {
    throw new Error("Default cleanup did not remove the complete Next output tree.");
  }

  const symlinkRoot = path.join(fixtureRoot, "symlink-root");
  const symlinkTarget = path.join(fixtureRoot, "symlink-target");
  await writeFixture(symlinkTarget, "cache/webpack/cache.bin", "external-cache");
  await mkdir(symlinkRoot, { recursive: true });
  await symlink(symlinkTarget, path.join(symlinkRoot, ".next"));
  const symlinkOutput = runCleanup(symlinkRoot, ["--preserve-next-cache"]);
  if (await exists(path.join(symlinkRoot, ".next"))) {
    throw new Error("Symlinked Next root survived fail-closed cleanup.");
  }
  if (!(await exists(path.join(symlinkTarget, "cache/webpack/cache.bin")))) {
    throw new Error("Cleanup followed a symlinked Next root outside the workspace.");
  }
  if (!symlinkOutput.includes("generated root is not a regular directory")) {
    throw new Error("Symlinked-root disposal receipt was not emitted.");
  }

  console.log("pass SCRIMED generated-cache preservation policy test");
} finally {
  await rm(fixtureRoot, { force: true, recursive: true });
}
