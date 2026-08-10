import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import {
  duplicateGeneratedSuffixPattern,
  inspectNextRoot,
  inspectPreservableNextCache
} from "./lib/generated-cache-policy.mjs";

const supportedOptions = new Set(["--preserve-next-cache"]);
const requestedOptions = new Set(process.argv.slice(2));
const unknownOptions = [...requestedOptions].filter((option) => !supportedOptions.has(option));

if (unknownOptions.length > 0) {
  throw new Error(`Unsupported generated-output cleanup option: ${unknownOptions.join(", ")}`);
}

const preserveNextCacheRequested = requestedOptions.has("--preserve-next-cache");
const removedRoots = [];
const preservedRoots = [];
const duplicateGeneratedEntries = [];

const nextRootInspection = await inspectNextRoot();
if (nextRootInspection.exists && !nextRootInspection.safe) {
  await rm(".next", { force: true, recursive: true });
  removedRoots.push(".next");
  if (preserveNextCacheRequested) {
    console.warn(`Discarded Next build cache: ${nextRootInspection.reason}.`);
  }
} else if (nextRootInspection.safe) {
  const nextEntries = await readdir(".next", { withFileTypes: true });
  const duplicateNextEntries = nextEntries
    .filter((entry) => duplicateGeneratedSuffixPattern.test(entry.name))
    .map((entry) => `.next/${entry.name}`);

  if (duplicateNextEntries.length > 0) {
    duplicateGeneratedEntries.push(...duplicateNextEntries);
  }

  const cacheInspection = preserveNextCacheRequested
    ? await inspectPreservableNextCache()
    : { safe: false, reason: "preservation not requested" };

  if (cacheInspection.safe) {
    const disposableEntries = nextEntries.filter((entry) => entry.name !== "cache");
    for (const entry of disposableEntries) {
      await rm(path.join(".next", entry.name), { force: true, recursive: true });
    }

    if (disposableEntries.length > 0) {
      removedRoots.push(".next generated output (cache preserved)");
    }
    preservedRoots.push(".next/cache");
  } else {
    await rm(".next", { force: true, recursive: true });
    removedRoots.push(".next");
    if (preserveNextCacheRequested && cacheInspection.reason !== "cache is absent") {
      console.warn(`Discarded Next build cache: ${cacheInspection.reason}.`);
    }
  }
}

const entries = await readdir(".", { withFileTypes: true });
const quarantinedGeneratedRoots = entries
  .filter((entry) => entry.isDirectory() && entry.name.startsWith(".next-quarantine-"))
  .map((entry) => entry.name);
const tsBuildInfoFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".tsbuildinfo"))
  .map((entry) => entry.name);

for (const root of quarantinedGeneratedRoots) {
  await rm(root, { force: true, recursive: true });
  removedRoots.push(root);
}

for (const file of tsBuildInfoFiles) {
  await rm(file, { force: true });
  removedRoots.push(file);
}

if (duplicateGeneratedEntries.length > 0) {
  console.warn(`Removed duplicated generated Next output: ${duplicateGeneratedEntries.join(", ")}.`);
}

if (removedRoots.length > 0) {
  console.log(`Cleared disposable generated output: ${removedRoots.join(", ")}.`);
} else {
  console.log("No disposable generated output found.");
}

if (preservedRoots.length > 0) {
  console.log(`Preserved non-authoritative build cache: ${preservedRoots.join(", ")}.`);
}
