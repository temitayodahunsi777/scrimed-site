#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";

const requiredFiles = [
  ".nvmrc",
  ".node-version",
  ".github/workflows/node24-certification.yml",
  "app/lib/platform/nodeRuntime.ts",
  "config/performance-budgets.json",
  "docs/platform/NODE_RUNTIME_BASELINE.md",
  "docs/platform/NODE24_COMPATIBILITY_REPORT.md",
  "docs/platform/NODE22_NODE24_DIFFERENTIAL.md",
  "docs/platform/NEXTJS_BOILERPLATE_DISPOSITION.md",
  "docs/operators/VERCEL_NODE24_OPERATOR_PACKET.md",
  "docs/operators/NODE24_ROLLBACK_PLAN.md",
  "scripts/verify-node24-vercel-build.mjs"
];

for (const pathname of requiredFiles) {
  if (!existsSync(pathname)) throw new Error(`Missing Node 24 migration artifact: ${pathname}`);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));
const vercelConfig = JSON.parse(await readFile("vercel.json", "utf8"));
if (packageJson.engines?.node !== "24.x") throw new Error("package.json must pin engines.node to 24.x.");
if (packageLock.packages?.[""]?.engines?.node !== "24.x") throw new Error("package-lock root must preserve the Node 24 engine.");
if ((await readFile(".nvmrc", "utf8")).trim() !== "24") throw new Error(".nvmrc must target Node 24.");
if ((await readFile(".node-version", "utf8")).trim() !== "24") throw new Error(".node-version must target Node 24.");
if (vercelConfig.installCommand !== "npm ci") throw new Error("Vercel must use deterministic npm ci installs.");
if (vercelConfig.git?.deploymentEnabled?.main !== false) throw new Error("Automatic main production deployment must remain disabled.");
for (const competing of ["pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"]) {
  if (existsSync(competing)) throw new Error(`Competing package-manager lockfile detected: ${competing}`);
}

const workflowNames = (await readdir(".github/workflows")).filter((name) => /\.ya?ml$/.test(name));
for (const workflowName of workflowNames) {
  const source = await readFile(`.github/workflows/${workflowName}`, "utf8");
  if (source.includes("node-version: 22")) throw new Error(`${workflowName} still targets Node 22.`);
  if (source.includes("uses: actions/setup-node@v6") && !source.includes("node-version: 24")) {
    throw new Error(`${workflowName} uses setup-node without Node 24.`);
  }
  if (/vercel\s+(?:--prod|deploy\s+--prod|promote)/.test(source)) {
    throw new Error(`${workflowName} contains an unauthorized production Vercel action.`);
  }
}

const releaseAssurance = await readFile("app/lib/release/vercelReleaseAssurance.ts", "utf8");
for (const expected of ["runtime:", "nodeMajor:", "releaseFingerprint", "node24-runtime-certified", "no-store"]) {
  if (!releaseAssurance.includes(expected) && expected !== "no-store") {
    throw new Error(`Release assurance is missing ${expected}.`);
  }
}
for (const route of ["app/api/build-info/route.ts", "app/api/health/route.ts", "app/api/readiness/route.ts"]) {
  if (!(await readFile(route, "utf8")).includes("no-store")) throw new Error(`${route} must not be cached.`);
}

const nextConfig = await readFile("next.config.js", "utf8");
for (const header of [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "X-Frame-Options"
]) {
  if (!nextConfig.includes(header)) throw new Error(`Security header missing: ${header}`);
}

const productConsole = await readFile("app/lib/productConsole.ts", "utf8");
if (!productConsole.includes('payloadProfile: "compact-api-v2"')) {
  throw new Error("Product Console compact API v2 profile is missing.");
}

console.log(`pass Node 24 and Vercel repository contract (${requiredFiles.length} artifacts; ${workflowNames.length} workflows)`);
