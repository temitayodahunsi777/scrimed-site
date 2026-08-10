#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const allowed = new Set(["--json", "--verify", "--self-test"]);
const DEFAULT_CANDIDATE_BASE_REF = "HEAD^";
const unknown = [...args].filter((arg) => !allowed.has(arg));
if (unknown.length) throw new Error(`Unsupported SBOM option: ${unknown.join(", ")}`);

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

function gitText(args) {
  const result = spawnSync("git", args, { encoding: "utf8", shell: false });
  return result.status === 0 ? result.stdout.trim() : null;
}

function isSafeCandidateBaseRef(value) {
  return value === DEFAULT_CANDIDATE_BASE_REF || (
    /^[A-Za-z0-9][A-Za-z0-9._/-]{0,159}$/.test(value) &&
    !value.includes("..")
  );
}

function resolveCandidateBase() {
  const requested = process.env.SCRIMED_RELEASE_CANDIDATE_BASE_REF?.trim() || DEFAULT_CANDIDATE_BASE_REF;
  if (!isSafeCandidateBaseRef(requested)) {
    throw new Error("SCRIMED SBOM candidate base ref is invalid");
  }
  const candidateBaseSha = gitText(["rev-parse", "--verify", `${requested}^{commit}`]);
  const headSha = gitText(["rev-parse", "--verify", "HEAD^{commit}"]);
  if (
    !candidateBaseSha ||
    !headSha ||
    !/^[0-9a-f]{40}$/.test(candidateBaseSha) ||
    !/^[0-9a-f]{40}$/.test(headSha) ||
    candidateBaseSha === headSha ||
    gitText(["merge-base", "--is-ancestor", candidateBaseSha, headSha]) === null
  ) {
    throw new Error("SCRIMED SBOM candidate base must be an ancestor of HEAD");
  }
  return { candidateBaseRef: requested, candidateBaseSha, headSha };
}

function gitPackageJsonAt(commitSha) {
  const result = spawnSync("git", ["show", `${commitSha}:package.json`], { encoding: "utf8", shell: false });
  if (result.status !== 0) return null;
  try { return JSON.parse(result.stdout); } catch { return null; }
}

function buildDependencyDelta(current, prior) {
  const currentDependencies = { ...(current.dependencies ?? {}), ...(current.devDependencies ?? {}) };
  const priorDependencies = { ...(prior?.dependencies ?? {}), ...(prior?.devDependencies ?? {}) };
  return [...new Set([...Object.keys(currentDependencies), ...Object.keys(priorDependencies)])]
    .sort()
    .filter((name) => currentDependencies[name] !== priorDependencies[name])
    .map((name) => ({ name, before: priorDependencies[name] ?? null, after: currentDependencies[name] ?? null }));
}

async function buildReport() {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
  const candidateBase = resolveCandidateBase();
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
  const prior = gitPackageJsonAt(candidateBase.candidateBaseSha);
  if (!prior) throw new Error("SCRIMED SBOM candidate-base package manifest is unavailable");
  const dependencyDelta = buildDependencyDelta(packageJson, prior);
  const bom = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    version: 1,
    metadata: {
      component: { type: "application", name: packageJson.name, version: packageJson.version },
      properties: [
        { name: "scrimed:evidence-boundary", value: "local-no-secret-no-release-authority" },
        { name: "scrimed:synthetic-only", value: "true" },
        { name: "scrimed:candidate-base-sha", value: candidateBase.candidateBaseSha },
        { name: "scrimed:candidate-head-sha", value: candidateBase.headSha }
      ]
    },
    components,
    dependencyDelta
  };
  return {
    service: "scrimed-supply-chain-evidence",
    status: "LOCAL_SBOM_GENERATED_REVIEW_REQUIRED",
    componentCount: components.length,
    dependencyDeltaCount: dependencyDelta.length,
    candidateBaseRef: candidateBase.candidateBaseRef,
    candidateBaseSha: candidateBase.candidateBaseSha,
    candidateHeadSha: candidateBase.headSha,
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
  const delta = buildDependencyDelta(
    { dependencies: { alpha: "2", beta: "1" } },
    { dependencies: { alpha: "1", gamma: "1" } }
  );
  if (delta.length !== 3 || delta[0]?.name !== "alpha") {
    throw new Error("SBOM candidate-base dependency delta self-test failed");
  }
  if (!isSafeCandidateBaseRef(DEFAULT_CANDIDATE_BASE_REF) || isSafeCandidateBaseRef("HEAD;rm -rf /")) {
    throw new Error("SBOM candidate-base reference validation self-test failed");
  }
  console.log("pass SCRIMED deterministic SBOM hashing and candidate-base dependency delta self-test");
  process.exit(0);
}

const report = await buildReport();
if (!/^[0-9a-f]{64}$/.test(report.sbomHash) || report.componentCount < 1) {
  throw new Error("SCRIMED SBOM verification failed");
}
if (args.has("--json")) console.log(JSON.stringify(report, null, 2));
else console.log(`pass SCRIMED local SBOM component_count=${report.componentCount} dependency_delta=${report.dependencyDeltaCount} sbom_hash=${report.sbomHash.slice(0, 16)} signing=external-review-required`);
