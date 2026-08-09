import { readdir } from "node:fs/promises";
import path from "node:path";

const duplicateSiblingPattern = /^(.*) (\d+)(\..+)$/;

export async function collectDuplicateSiblingFiles(
  root = ".",
  ignoredDirectoryNames = new Set()
) {
  const duplicates = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    const regularFileNames = new Set(
      entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
    );

    for (const entry of entries) {
      const target = path.join(current, entry.name);

      if (entry.isDirectory()) {
        if (!ignoredDirectoryNames.has(entry.name)) {
          await walk(target);
        }
        continue;
      }

      if (!entry.isFile()) continue;
      const match = entry.name.match(duplicateSiblingPattern);
      if (!match) continue;

      const canonicalSibling = `${match[1]}${match[3]}`;
      if (regularFileNames.has(canonicalSibling)) {
        duplicates.push(path.relative(root, target) || entry.name);
      }
    }
  }

  await walk(root);
  return duplicates.sort();
}
