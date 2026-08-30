import { readdir } from "node:fs/promises";

const generatedRoots = ["node_modules/@types", ".next"];
const topLevelGeneratedRootPattern = /^(?:\.next|node_modules) \d+$/;
const duplicateSuffixPattern = / \d+(?:\.|$)/;
const duplicates = new Set();

try {
  const entries = await readdir(".", { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && topLevelGeneratedRootPattern.test(entry.name)) {
      duplicates.add(entry.name);
    }
  }
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

async function collectTopLevelDuplicateEntries(root) {
  try {
    const entries = await readdir(root, { withFileTypes: true });

    for (const entry of entries) {
      if (duplicateSuffixPattern.test(entry.name)) {
        duplicates.add(`${root}/${entry.name}`);
      }
    }

    return entries;
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }

    return [];
  }
}

async function collectRecursiveDuplicateEntries(root) {
  try {
    const entries = await readdir(root, { recursive: true, withFileTypes: true });

    for (const entry of entries) {
      if (duplicateSuffixPattern.test(entry.name)) {
        duplicates.add(`${root}/${entry.name}`);
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

for (const root of generatedRoots) {
  const topLevelEntries = await collectTopLevelDuplicateEntries(root);

  if (root === ".next" && topLevelEntries.some((entry) => duplicateSuffixPattern.test(entry.name))) {
    continue;
  }

  await collectRecursiveDuplicateEntries(root);
}

if (duplicates.size > 0) {
  console.error("Generated workspace integrity check failed.");
  console.error("Duplicate-suffixed generated files can corrupt TypeScript resolution:");
  for (const duplicate of duplicates) {
    console.error(`- ${duplicate}`);
  }
  console.error(
    "Run `node scripts/generated-output-postflight.mjs` to remove byte-identical duplicates. Build and smoke runners may explicitly use `--repair-disposable-conflicts`, then must revalidate canonical build inventories and integrity."
  );
  process.exit(1);
}

console.log("Generated workspace integrity check passed.");
