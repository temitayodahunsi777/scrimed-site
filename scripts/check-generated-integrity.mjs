import { readdir } from "node:fs/promises";

const generatedRoots = ["node_modules/@types", ".next/types"];
const duplicateSuffixPattern = / \d+(?:\.|$)/;
const duplicates = [];

for (const root of generatedRoots) {
  try {
    const entries = await readdir(root, { recursive: true, withFileTypes: true });

    for (const entry of entries) {
      if (duplicateSuffixPattern.test(entry.name)) {
        duplicates.push(`${root}/${entry.name}`);
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

if (duplicates.length > 0) {
  console.error("Generated workspace integrity check failed.");
  console.error("Duplicate-suffixed generated files can corrupt TypeScript resolution:");
  for (const duplicate of duplicates) {
    console.error(`- ${duplicate}`);
  }
  console.error("Repair with `npm ci`, then remove or quarantine `.next` before rerunning the quality gates.");
  process.exit(1);
}

console.log("Generated workspace integrity check passed.");
