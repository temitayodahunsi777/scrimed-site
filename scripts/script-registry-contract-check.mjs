#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const packageJsonPath = "package.json";
const nonsecretSuitePath = "scripts/scrimed-nonsecret-test-suite.mjs";
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const nonsecretSuite = await readFile(nonsecretSuitePath, "utf8");

const scripts = packageJson.scripts ?? {};
const missingTargets = [];
const unsafeCommands = [];
const nonNodeSmokeCommands = [];

function extractNodeScriptTargets(command) {
  return [...command.matchAll(/(?:^|&&\s*|\|\|\s*)node\s+(scripts\/[^\s]+\.mjs)/g)].map(
    (match) => match[1]
  );
}

function assertTargetExists(label, target) {
  if (!existsSync(target)) {
    missingTargets.push(`${label} -> ${target}`);
  }
}

for (const [scriptName, command] of Object.entries(scripts)) {
  const targets = extractNodeScriptTargets(command);

  for (const target of targets) {
    assertTargetExists(`package script ${scriptName}`, target);
  }

  if (/SCRIMED_(?:BEARER|SUPABASE|SERVICE|SALES_QA).*=\S+/.test(command)) {
    unsafeCommands.push(scriptName);
  }

  if (
    (scriptName.startsWith("smoke:") || scriptName.startsWith("contract:") || scriptName.startsWith("security:")) &&
    targets.length === 0 &&
    !command.startsWith("next ") &&
    !command.startsWith("eslint ")
  ) {
    nonNodeSmokeCommands.push(`${scriptName}: ${command}`);
  }
}

for (const match of nonsecretSuite.matchAll(/args:\s*\[\s*"([^"]+\.mjs)"/g)) {
  assertTargetExists("nonsecret suite", match[1]);
}

for (const match of nonsecretSuite.matchAll(/scripts\/[A-Za-z0-9./_-]+\.mjs/g)) {
  assertTargetExists("nonsecret suite text", match[0]);
}

if (missingTargets.length > 0) {
  throw new Error(`Script registry references missing files:\n${missingTargets.join("\n")}`);
}

if (unsafeCommands.length > 0) {
  throw new Error(
    `Package scripts must not embed token-like environment assignments: ${unsafeCommands.join(", ")}`
  );
}

if (nonNodeSmokeCommands.length > 0) {
  throw new Error(
    `Smoke/contract/security scripts should be explicit local Node or recognized tool commands:\n${nonNodeSmokeCommands.join(
      "\n"
    )}`
  );
}

if (!scripts["contract:script-registry"]) {
  throw new Error("package.json must expose contract:script-registry.");
}

if (!nonsecretSuite.includes("scripts/script-registry-contract-check.mjs")) {
  throw new Error("nonsecret suite must include script-registry-contract-check.mjs.");
}

console.log(
  `pass SCRIMED script registry contract check (${Object.keys(scripts).length} package scripts verified)`
);
