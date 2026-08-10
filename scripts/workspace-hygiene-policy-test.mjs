#!/usr/bin/env node

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { collectDuplicateSiblingFiles } from "./lib/workspace-hygiene-policy.mjs";

const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "scrimed-workspace-hygiene-"));

async function writeFixture(relativePath, contents = "fixture") {
  const target = path.join(fixtureRoot, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
}

try {
  await writeFixture("scripts/worker.mjs", "current");
  await writeFixture("scripts/worker 2.mjs", "stale");
  await writeFixture("docs/Phase 2.md", "legitimate numbered name");
  await writeFixture("node_modules/library/index.js", "dependency");
  await writeFixture("node_modules/library/index 2.js", "ignored dependency duplicate");

  const duplicates = await collectDuplicateSiblingFiles(
    fixtureRoot,
    new Set(["node_modules"])
  );

  if (
    duplicates.length !== 1 ||
    duplicates[0] !== path.join("scripts", "worker 2.mjs")
  ) {
    throw new Error(`Unexpected duplicate-sibling classification: ${duplicates.join(", ")}`);
  }

  console.log("pass SCRIMED workspace hygiene policy test");
} finally {
  await rm(fixtureRoot, { force: true, recursive: true });
}
