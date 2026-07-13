import { readdir, rm } from "node:fs/promises";

const duplicateSuffixPattern = / \d+(?:\.|$)/;
const removedRoots = [];
const duplicateGeneratedEntries = [];

try {
  const nextEntries = await readdir(".next", { withFileTypes: true });
  const duplicateNextEntries = nextEntries
    .filter((entry) => duplicateSuffixPattern.test(entry.name))
    .map((entry) => `.next/${entry.name}`);

  if (duplicateNextEntries.length > 0) {
    duplicateGeneratedEntries.push(...duplicateNextEntries);
  }

  await rm(".next", { force: true, recursive: true });
  removedRoots.push(".next");
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
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
