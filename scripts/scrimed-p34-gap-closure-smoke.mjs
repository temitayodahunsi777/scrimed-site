#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const checks = [
  [
    "--disable-warning=ExperimentalWarning",
    "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
    "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
    "scripts/scrimed-p34-gap-closure-policy-test.mjs"
  ],
  ["scripts/scrimed-p34-gap-closure-contract-check.mjs"]
];

for (const args of checks) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("pass SCRIMED p.34 gap-closure runtime smoke");
