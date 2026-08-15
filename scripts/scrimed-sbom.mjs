#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs.filter((arg) => !arg.startsWith("--base-ref=")));
const allowed = new Set(["--json", "--verify", "--self-test"]);
const unknown = rawArgs.filter((arg) => !allowed.has(arg) && !arg.startsWith("--base-ref="));
if (unknown.length) throw new Error(`Unsupported SBOM option: ${unknown.join(", ")}`);
const baseRefArgument = rawArgs.find((arg) => arg.startsWith("--base-ref="))?.slice("--base-ref=".length);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, canonicalize(nested)]));
  }
  return value;
}

function stableHash(value) {
  return sha256(JSON.stringify(canonicalize(value)));
}

function gitJsonAtCommit(commitSha, path) {
  const result = spawnSync("git", ["show", `${commitSha}:${path}`], { encoding: "utf8", shell: false });
  if (result.status !== 0) return null;
  try { return JSON.parse(result.stdout); } catch { return null; }
}

function resolveBaseline(overrideRef = null) {
  const requestedRef = overrideRef || baseRefArgument || process.env.SCRIMED_SBOM_BASE_REF?.trim() || "HEAD^";
  if (
    !requestedRef
    || requestedRef.startsWith("-")
    || requestedRef.includes("..")
    || requestedRef.includes("@{")
    || (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/.test(requestedRef) && requestedRef !== "HEAD^")
  ) {
    throw new Error("SCRIMED SBOM baseline is not a safe Git commit or reference.");
  }
  const resolved = spawnSync("git", ["rev-parse", "--verify", `${requestedRef}^{commit}`], {
    encoding: "utf8",
    shell: false
  });
  const baselineSha = resolved.status === 0 ? resolved.stdout.trim().toLowerCase() : "";
  if (!/^[0-9a-f]{40}$/.test(baselineSha)) {
    throw new Error(`SCRIMED SBOM baseline could not be resolved: ${requestedRef}`);
  }
  const head = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", shell: false });
  const headSha = head.status === 0 ? head.stdout.trim().toLowerCase() : "";
  if (!/^[0-9a-f]{40}$/.test(headSha) || baselineSha === headSha) {
    throw new Error("SCRIMED SBOM baseline must be a prior revision, not the current HEAD.");
  }
  const ancestry = spawnSync("git", ["merge-base", "--is-ancestor", baselineSha, headSha], {
    encoding: "utf8",
    shell: false
  });
  if (ancestry.status !== 0) {
    throw new Error("SCRIMED SBOM baseline must be an ancestor of the current HEAD.");
  }
  return { requestedRef, baselineSha, headSha };
}

function lockComponentVersions(lock) {
  return new Map(Object.entries(lock?.packages ?? {})
    .filter(([path, record]) => path.startsWith("node_modules/") && record?.version)
    .map(([path, record]) => [path.slice("node_modules/".length), record.version]));
}

function compareLockComponents(priorLock, currentLock) {
  if (!priorLock) return [];
  const before = lockComponentVersions(priorLock);
  const after = lockComponentVersions(currentLock);
  return [...new Set([...before.keys(), ...after.keys()])]
    .sort()
    .filter((name) => before.get(name) !== after.get(name))
    .map((name) => ({
      name,
      before: before.get(name) ?? null,
      after: after.get(name) ?? null,
      change: !before.has(name) ? "added" : !after.has(name) ? "removed" : "version-changed"
    }));
}

async function buildReport() {
  const baseline = resolveBaseline();
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
  const components = Object.entries(lock.packages ?? {})
    .filter(([path, record]) => path.startsWith("node_modules/") && record?.version)
    .map(([path, record]) => ({
      type: "library",
      name: path.slice("node_modules/".length),
      version: record.version,
      scope: record.dev ? "optional" : "required",
      licenses: record.license ? [{ license: { id: record.license } }] : [],
      purl: `pkg:npm/${encodeURIComponent(path.slice("node_modules/".length))}@${encodeURIComponent(record.version)}`
    }))
    .sort((left, right) => `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`));
  const prior = gitJsonAtCommit(baseline.baselineSha, "package.json");
  const priorLock = gitJsonAtCommit(baseline.baselineSha, "package-lock.json");
  if (!prior || !priorLock) {
    throw new Error("SCRIMED SBOM baseline does not contain readable package manifests.");
  }
  const componentDelta = compareLockComponents(priorLock, lock);
  const currentDependencies = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
  const priorDependencies = { ...(prior?.dependencies ?? {}), ...(prior?.devDependencies ?? {}) };
  const dependencyDelta = [...new Set([...Object.keys(currentDependencies), ...Object.keys(priorDependencies)])]
    .sort()
    .filter((name) => currentDependencies[name] !== priorDependencies[name])
    .map((name) => ({ name, before: priorDependencies[name] ?? null, after: currentDependencies[name] ?? null }));
  const bom = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    version: 1,
    metadata: {
      component: { type: "application", name: packageJson.name, version: packageJson.version },
      properties: [
        { name: "scrimed:evidence-boundary", value: "local-no-secret-no-release-authority" },
        { name: "scrimed:synthetic-only", value: "true" },
        { name: "scrimed:baseline-sha", value: baseline.baselineSha }
      ]
    },
    components,
    dependencyDelta
  };
  return {
    service: "scrimed-supply-chain-evidence",
    status: "LOCAL_SBOM_GENERATED_REVIEW_REQUIRED",
    baselineRef: baseline.requestedRef,
    baselineSha: baseline.baselineSha,
    headSha: baseline.headSha,
    componentCount: components.length,
    dependencyDeltaCount: dependencyDelta.length,
    componentDeltaCount: componentDelta.length,
    componentDelta,
    packageLockHash: sha256(JSON.stringify(lock)),
    sbomHash: stableHash(bom),
    bom,
    externalSigningComplete: false,
    licenseReviewComplete: false,
    releaseAuthorityGranted: false
  };
}

if (args.has("--self-test")) {
  const first = stableHash({ b: 2, a: 1 });
  const second = stableHash({ a: 1, b: 2 });
  if (first !== second) throw new Error("SBOM canonical hashing self-test failed");
  const delta = compareLockComponents(
    { packages: { "node_modules/example": { version: "1.0.0" } } },
    { packages: { "node_modules/example": { version: "1.0.1" } } }
  );
  if (delta.length !== 1 || delta[0]?.change !== "version-changed") {
    throw new Error("SBOM lockfile component delta self-test failed");
  }
  let rejectedCurrentHead = false;
  try {
    resolveBaseline("HEAD");
  } catch {
    rejectedCurrentHead = true;
  }
  if (!rejectedCurrentHead) throw new Error("SBOM current-HEAD baseline must fail closed");
  console.log("pass SCRIMED deterministic SBOM hashing self-test");
  process.exit(0);
}

const report = await buildReport();
if (!/^[0-9a-f]{64}$/.test(report.sbomHash) || report.componentCount < 1) {
  throw new Error("SCRIMED SBOM verification failed");
}
if (args.has("--json")) console.log(JSON.stringify(report, null, 2));
else console.log(`pass SCRIMED local SBOM component_count=${report.componentCount} direct_delta=${report.dependencyDeltaCount} component_delta=${report.componentDeltaCount} baseline=${report.baselineSha.slice(0, 12)} sbom_hash=${report.sbomHash.slice(0, 16)} signing=external-review-required`);
