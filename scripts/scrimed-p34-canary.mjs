#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const startedAt = Date.now();
const commands = [
  { script: "scripts/scrimed-p34-gap-closure-policy-test.mjs", nodeArgs: ["--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--experimental-loader=./scripts/lib/ts-extension-loader.mjs"], scriptArgs: [] },
  { script: "scripts/scrimed-p34-gap-closure-contract-check.mjs", nodeArgs: [], scriptArgs: [] },
  { script: "scripts/scrimed-p34-precision-wave-policy-test.mjs", nodeArgs: ["--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--experimental-loader=./scripts/lib/ts-extension-loader.mjs"], scriptArgs: [] },
  { script: "scripts/scrimed-p34-precision-wave-contract-check.mjs", nodeArgs: [], scriptArgs: [] },
  { script: "scripts/scrimed-p34-post-review-readiness-policy-test.mjs", nodeArgs: ["--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--experimental-loader=./scripts/lib/ts-extension-loader.mjs"], scriptArgs: [] },
  { script: "scripts/scrimed-p34-post-review-readiness-contract-check.mjs", nodeArgs: [], scriptArgs: [] },
  { script: "scripts/scrimed-p34-pilot-assurance-adversarial-test.mjs", nodeArgs: ["--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--experimental-loader=./scripts/lib/ts-extension-loader.mjs"], scriptArgs: [] },
  { script: "scripts/scrimed-p34-follow-on-contract-check.mjs", nodeArgs: [], scriptArgs: [] },
  { script: "scripts/generate-p34-build-inventory.mjs", nodeArgs: [], scriptArgs: ["--self-test"] },
  { script: "scripts/run-aal2-candidate-verification.mjs", nodeArgs: [], scriptArgs: ["--self-test"] },
  { script: "scripts/generate-p39-review-map.mjs", nodeArgs: [], scriptArgs: ["--check"] },
  { script: "scripts/generate-p34-post-review-artifacts.mjs", nodeArgs: [], scriptArgs: ["--check"] }
];

for (const { script, nodeArgs, scriptArgs } of commands) {
  const result = spawnSync(process.execPath, [...nodeArgs, script, ...scriptArgs], {
    encoding: "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024,
    timeout: 4 * 60 * 1_000
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`p.34 canary failed at ${script} with exit ${result.status ?? "timeout"}`);
  }
}

const durationMs = Date.now() - startedAt;
if (durationMs > 5 * 60 * 1_000) throw new Error(`p.34 canary exceeded five-minute target: ${durationMs}ms`);
console.log(`pass SCRIMED p.34 canary (${durationMs}ms, retained synthetic/no-PHI boundary)`);
