import { readdir, rm } from "node:fs/promises";

await rm(".next", { force: true, recursive: true });

const entries = await readdir(".", { withFileTypes: true });
const quarantinedGeneratedRoots = entries
  .filter((entry) => entry.isDirectory() && entry.name.startsWith(".next-quarantine-"))
  .map((entry) => entry.name);

for (const root of quarantinedGeneratedRoots) {
  await rm(root, { force: true, recursive: true });
}

const removedRoots = [".next", ...quarantinedGeneratedRoots];
console.log(`Cleared disposable generated output: ${removedRoots.join(", ")}.`);
