#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

import { designSystemComponentContracts } from "../app/lib/design-system/components.ts";
import { scrimedDesignTokens } from "../app/lib/design-system/tokens.ts";

const check = process.argv.includes("--check");
const tokenPath = "artifacts/design/design-tokens.json";
const mappingPath = "artifacts/design/code-connect-manifest.json";
const codeConnectManifest = {
  version: "scrimed-code-connect-readiness-v1-2026-08-12",
  status: "READY_FOR_FIGMA_MAPPING",
  figmaWritePerformed: false,
  mappings: designSystemComponentContracts
};
const outputs = [
  [tokenPath, `${JSON.stringify(scrimedDesignTokens, null, 2)}\n`],
  [mappingPath, `${JSON.stringify(codeConnectManifest, null, 2)}\n`]
];

if (check) {
  for (const [filePath, expected] of outputs) {
    assert.equal(await readFile(filePath, "utf8"), expected, `${filePath} is stale`);
  }
  console.log(`pass SCRIMED design-system artifact integrity (${outputs.length} artifacts)`);
} else {
  for (const [filePath, content] of outputs) await writeFile(filePath, content, "utf8");
  console.log(`generated SCRIMED design-system artifacts (${outputs.length})`);
}
