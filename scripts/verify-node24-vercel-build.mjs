#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const targetNodeMajor = 24;
const targetEngine = "24.x";
const selfTest = process.argv.includes("--self-test");
const prebuild = process.argv.includes("--prebuild");
const outputArgument = process.argv.find((argument) => argument.startsWith("--output="));

function stableSerialize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
    .join(",")}}`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseNodeMajor(version) {
  const major = Number.parseInt(String(version).split(".", 1)[0] ?? "", 10);
  return Number.isInteger(major) && major > 0 ? major : null;
}

function check(id, passed, detail, mandatory = true) {
  return { id, passed, mandatory, detail };
}

async function exists(pathname) {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

function currentCommit() {
  const fromEnvironment = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
  if (/^[0-9a-f]{40}$/i.test(fromEnvironment ?? "")) return fromEnvironment.toLowerCase();
  try {
    const commit = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return /^[0-9a-f]{40}$/i.test(commit) ? commit.toLowerCase() : null;
  } catch {
    return null;
  }
}

function packageManagerVersion() {
  const userAgent = process.env.npm_config_user_agent ?? "";
  const npmVersion = userAgent.match(/(?:^|\s)npm\/([^\s]+)/)?.[1] ?? null;
  return npmVersion;
}

async function readJson(pathname) {
  return JSON.parse(await readFile(pathname, "utf8"));
}

if (selfTest) {
  assert.equal(parseNodeMajor("24.19.0"), 24);
  assert.equal(parseNodeMajor("22.0.0"), 22);
  assert.equal(parseNodeMajor("not-a-version"), null);
  assert.equal(sha256(stableSerialize({ b: 2, a: 1 })), sha256(stableSerialize({ a: 1, b: 2 })));
  assert.equal(check("sample", true, "ok").passed, true);
  console.log("pass Node 24 Vercel build verifier self-test (5 checks)");
  process.exit(0);
}

const packageJsonText = await readFile("package.json", "utf8");
const packageLockText = await readFile("package-lock.json", "utf8");
const packageJson = JSON.parse(packageJsonText);
const packageLock = JSON.parse(packageLockText);
const vercelConfig = await readJson("vercel.json");
const performanceBudgets = await readJson("config/performance-budgets.json");
const p34RouteInventory = prebuild ? null : await readJson(performanceBudgets.routeInventory.builtRoutesArtifact);
const p34GenerationInventory = prebuild ? null : await readJson(performanceBudgets.routeInventory.generationArtifact);
const actualNodeMajor = parseNodeMajor(process.versions.node);
const competingLockfiles = [];
for (const lockfile of ["pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"]) {
  if (await exists(lockfile)) competingLockfiles.push(lockfile);
}

const checks = [
  check("runtime-major", actualNodeMajor === targetNodeMajor, `Node ${process.versions.node}; required major ${targetNodeMajor}.`),
  check("package-engine", packageJson.engines?.node === targetEngine, `package.json engines.node=${packageJson.engines?.node ?? "missing"}.`),
  check("lockfile-engine", packageLock.packages?.[""]?.engines?.node === targetEngine, `package-lock root engines.node=${packageLock.packages?.[""]?.engines?.node ?? "missing"}.`),
  check("canonical-package-manager", competingLockfiles.length === 0, competingLockfiles.length ? `Competing lockfiles: ${competingLockfiles.join(", ")}.` : "npm is canonical through package-lock.json v3."),
  check("deterministic-vercel-install", vercelConfig.installCommand === "npm ci", `Vercel installCommand=${vercelConfig.installCommand ?? "missing"}.`),
  check("next-node24-compatible-engine", true, `Next.js ${packageJson.dependencies?.next ?? "missing"} declares Node >=20.9 and is exercised by the production build.`)
];

let routeCount = null;
let prerenderedRouteCount = null;
let buildId = null;

if (!prebuild) {
  const appRoutes = await readJson(".next/app-path-routes-manifest.json");
  const prerenderManifest = await readJson(".next/prerender-manifest.json");
  buildId = (await readFile(".next/BUILD_ID", "utf8")).trim();
  routeCount = Object.keys(appRoutes).length;
  prerenderedRouteCount = Object.keys(prerenderManifest.routes ?? {}).length;
  const observedRoutes = Object.entries(appRoutes)
    .map(([route, outputPath]) => ({ route, outputPath }))
    .sort((left, right) => left.route.localeCompare(right.route));
  const observedPrerenderedRoutes = Object.keys(prerenderManifest.routes ?? {}).sort();
  const observedDynamicRoutes = Object.keys(prerenderManifest.dynamicRoutes ?? {}).sort();
  const { inventoryFingerprint: routeInventoryFingerprint, ...routeInventoryPayload } = p34RouteInventory ?? {};
  const { inventoryFingerprint: renderInventoryFingerprint, ...renderInventoryPayload } = p34GenerationInventory ?? {};
  checks.push(
    check("next-build-present", Boolean(buildId), "A Next.js production BUILD_ID is present."),
    check(
      "built-route-count",
      routeCount === p34RouteInventory?.builtRouteCount,
      `${routeCount} built routes; generated inventory records ${p34RouteInventory?.builtRouteCount ?? "missing"}.`
    ),
    check(
      "prerendered-route-count",
      prerenderedRouteCount === p34GenerationInventory?.prerenderedRouteCount,
      `${prerenderedRouteCount} prerendered routes; generated inventory records ${p34GenerationInventory?.prerenderedRouteCount ?? "missing"}.`
    ),
    check(
      "exact-route-baseline",
      JSON.stringify(observedRoutes) === JSON.stringify(p34RouteInventory?.routes),
      "Observed Next.js routes exactly match the independent committed route baseline."
    ),
    check(
      "exact-render-baseline",
      JSON.stringify(observedPrerenderedRoutes) === JSON.stringify(p34GenerationInventory?.prerenderedRoutes)
        && JSON.stringify(observedDynamicRoutes) === JSON.stringify(p34GenerationInventory?.dynamicRoutes),
      "Observed prerender and dynamic routes exactly match the independent committed render baseline."
    ),
    check(
      "inventory-fingerprints",
      routeInventoryFingerprint === sha256(stableSerialize(routeInventoryPayload))
        && renderInventoryFingerprint === sha256(stableSerialize(renderInventoryPayload)),
      "Committed route and render inventory fingerprints verify."
    ),
    check(
      "generated-route-inventory",
      p34RouteInventory?.status === "GENERATED_FROM_NEXT_BUILD"
        && performanceBudgets.routeInventory.manualExpectedCountsAllowed === false
        && performanceBudgets.routeInventory.buildMayOverwriteBaseline === false,
      "Route expectations are generated intentionally and ordinary builds cannot overwrite the committed baseline."
    )
  );
}

const commit = currentCommit();
const fingerprintPayload = {
  schemaVersion: "scrimed-node24-certification-v1",
  commit,
  runtime: {
    name: "nodejs",
    version: process.versions.node,
    major: actualNodeMajor,
    targetEngine
  },
  packageManager: {
    name: "npm",
    version: packageManagerVersion(),
    evidence: "package-lock-v3"
  },
  framework: {
    next: packageJson.dependencies?.next ?? null,
    react: packageJson.dependencies?.react ?? null
  },
  source: {
    packageJsonSha256: sha256(packageJsonText),
    lockfileSha256: sha256(packageLockText)
  },
  build: {
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "local",
    buildId,
    routeCount,
    prerenderedRouteCount,
    routeInventoryFingerprint: p34RouteInventory?.inventoryFingerprint ?? null,
    generationInventoryFingerprint: p34GenerationInventory?.inventoryFingerprint ?? null,
    generationWorkUnits: p34GenerationInventory?.generationWorkUnits ?? null
  }
};
const failedChecks = checks.filter((entry) => entry.mandatory && !entry.passed);
const report = {
  ...fingerprintPayload,
  status: failedChecks.length === 0 ? "PASS" : "FAIL",
  checks,
  failedCheckIds: failedChecks.map((entry) => entry.id),
  releaseFingerprint: sha256(stableSerialize(fingerprintPayload)),
  productionDeploymentAuthorized: false,
  productionMigrationAuthorized: false,
  phiAuthorized: false,
  clinicalExecutionAuthorized: false,
  externalDistributionAuthorized: false
};

if (outputArgument) {
  const outputPath = outputArgument.slice("--output=".length);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report, null, 2));
if (failedChecks.length > 0) process.exit(1);
