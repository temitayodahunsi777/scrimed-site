#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const generatedRootNames = [".next", ".next-quarantine-", "node_modules 2"];
const ignoredDirectoryNames = new Set([
  ".git",
  ".vercel",
  ".tools",
  "node_modules",
  "coverage",
  "out"
]);
const junkFilePatterns = [
  /\.DS_Store$/,
  /\.tmp$/,
  /\.bak$/,
  /\.orig$/,
  /\.rej$/,
  /\.log$/,
  /\.tsbuildinfo$/
];
const requiredIgnoreText = {
  ".gitignore": [".next/", ".next-quarantine-*/", "node_modules 2/", "*.log", "*.tsbuildinfo", ".env.local"],
  ".vercelignore": [".next", ".next-quarantine-*/", "node_modules 2", "coverage", "*.log", "*.tsbuildinfo", ".env.*"]
};
const canonicalTopLevelScrimedDocs = {
  "SCRIMED_CODE_PT_4_IMPLEMENTATION.md": "scripts/scrimed-code-pt-4-contract-check.mjs",
  "SCRIMED_UPGRADE_IMPLEMENTATION_PLAN.md": "scripts/scrimed-upgrade-implementation-plan-contract-check.mjs"
};

async function exists(filePath) {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function collectJunkFiles(root = ".") {
  const junk = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const relative = path.join(current, entry.name);
      const normalized = relative.startsWith(`.${path.sep}`) ? relative.slice(2) : relative;

      if (entry.isDirectory()) {
        if (ignoredDirectoryNames.has(entry.name)) {
          continue;
        }

        await walk(relative);
        continue;
      }

      if (entry.isFile() && junkFilePatterns.some((pattern) => pattern.test(entry.name))) {
        junk.push(normalized);
      }
    }
  }

  await walk(root);
  return junk;
}

function requireIncludes(filePath, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${filePath} missing workspace hygiene entry: ${expected}`);
  }
}

function extractExportedArray(text, name) {
  const marker = `export const ${name} = [`;
  const start = text.indexOf(marker);

  if (start < 0) {
    throw new Error(`Unable to find exported array ${name}.`);
  }

  const openBracket = text.indexOf("[", start);
  let depth = 0;

  for (let index = openBracket; index < text.length; index += 1) {
    if (text[index] === "[") {
      depth += 1;
    }

    if (text[index] === "]") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(openBracket + 1, index);
      }
    }
  }

  throw new Error(`Unable to parse exported array ${name}.`);
}

function requireNoDuplicateStrings(label, values) {
  const duplicates = [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];

  if (duplicates.length > 0) {
    throw new Error(`${label} contains duplicate entries: ${duplicates.join(", ")}`);
  }
}

function extractQuotedStrings(text) {
  return [...text.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

const rootEntries = await readdir(".", { withFileTypes: true });
const generatedRoots = rootEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => generatedRootNames.some((generatedRoot) => name === generatedRoot || name.startsWith(generatedRoot)));

if (generatedRoots.length > 0) {
  throw new Error(
    `Generated workspace output remains after cleanup: ${generatedRoots.join(", ")}. Run npm run clean:generated.`
  );
}

const junkFiles = await collectJunkFiles(".");
if (junkFiles.length > 0) {
  throw new Error(`Disposable junk files remain in workspace: ${junkFiles.join(", ")}`);
}

for (const [filePath, expectedEntries] of Object.entries(requiredIgnoreText)) {
  const text = await readFile(filePath, "utf8");

  for (const expected of expectedEntries) {
    requireIncludes(filePath, text, expected);
  }
}

for (const [docPath, contractPath] of Object.entries(canonicalTopLevelScrimedDocs)) {
  if (!(await exists(docPath))) {
    throw new Error(`${docPath} is missing; it is a canonical contract-backed SCRIMED root artifact.`);
  }

  const contract = await readFile(contractPath, "utf8");
  requireIncludes(contractPath, contract, docPath);
}

const navigationAudit = await readFile("app/lib/navigationAudit.ts", "utf8");
for (const exportName of ["pageRouteInventory", "smokeCoveredHtmlRoutes"]) {
  requireNoDuplicateStrings(
    `app/lib/navigationAudit.ts ${exportName}`,
    extractQuotedStrings(extractExportedArray(navigationAudit, exportName))
  );
}

const siteNavigation = await readFile("app/lib/siteNavigation.ts", "utf8");
const sectionStarts = [...siteNavigation.matchAll(/label: "([^"]+)",\n\s+intent:/g)].map((match) => ({
  index: match.index ?? 0,
  label: match[1]
}));
const journeysStart = siteNavigation.indexOf("export const siteNavigationJourneys");

for (let index = 0; index < sectionStarts.length; index += 1) {
  const start = sectionStarts[index].index;
  const end = index + 1 < sectionStarts.length ? sectionStarts[index + 1].index : journeysStart;
  const section = siteNavigation.slice(start, end > start ? end : siteNavigation.length);
  const hrefs = [...section.matchAll(/href: "([^"]+)"/g)].map((match) => match[1]);

  requireNoDuplicateStrings(`app/lib/siteNavigation.ts section ${sectionStarts[index].label}`, hrefs);
}

console.log("pass SCRIMED workspace hygiene contract check");
