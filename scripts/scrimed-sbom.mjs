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

function gitJsonAt(commitSha, pathname) {
  const result = spawnSync("git", ["show", `${commitSha}:${pathname}`], { encoding: "utf8", shell: false });
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

function lockfileComponentRecords(lock) {
  return Object.entries(lock?.packages ?? {})
    .filter(([path, record]) => path.includes("node_modules/") && record?.version)
    .map(([packagePath, record]) => {
      const name = packagePath.slice(
        packagePath.lastIndexOf("node_modules/") + "node_modules/".length
      );
      return {
        packagePath,
        name,
        version: record.version,
        integrityHash: record.integrity ? sha256(record.integrity) : null,
        resolvedHash: record.resolved ? sha256(record.resolved) : null,
        dev: record.dev === true,
        optional: record.optional === true,
        peer: record.peer === true,
        license: record.license ?? null
      };
    })
    .sort((left, right) => left.packagePath.localeCompare(right.packagePath));
}

function buildLockfileComponentDelta(currentLock, priorLock) {
  const current = new Map(
    lockfileComponentRecords(currentLock).map((record) => [record.packagePath, record])
  );
  const prior = new Map(
    lockfileComponentRecords(priorLock).map((record) => [record.packagePath, record])
  );
  return [...new Set([...current.keys(), ...prior.keys()])]
    .sort()
    .filter((packagePath) =>
      stableHash(current.get(packagePath) ?? null) !==
      stableHash(prior.get(packagePath) ?? null)
    )
    .map((packagePath) => {
      const before = prior.get(packagePath) ?? null;
      const after = current.get(packagePath) ?? null;
      return {
        packagePath,
        name: after?.name ?? before?.name ?? "unknown",
        before: before
          ? {
              version: before.version,
              integrityHash: before.integrityHash,
              resolvedHash: before.resolvedHash
            }
          : null,
        after: after
          ? {
              version: after.version,
              integrityHash: after.integrityHash,
              resolvedHash: after.resolvedHash
            }
          : null
      };
    });
}

async function buildReport() {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
  const candidateBase = resolveCandidateBase();
  const components = lockfileComponentRecords(lock)
    .map((record) => ({
      type: "library",
      name: record.name,
      version: record.version,
      scope: record.dev ? "optional" : "required",
      licenses: record.license ? [{ license: { id: record.license } }] : [],
      purl: `pkg:npm/${encodeURIComponent(record.name)}@${encodeURIComponent(record.version)}`
    }))
    .sort((left, right) => `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`));
  const priorPackageJson = gitJsonAt(candidateBase.candidateBaseSha, "package.json");
  const priorLock = gitJsonAt(candidateBase.candidateBaseSha, "package-lock.json");
  if (!priorPackageJson || !priorLock) {
    throw new Error("SCRIMED SBOM candidate-base dependency manifests are unavailable");
  }
  const manifestDependencyDelta = buildDependencyDelta(
    packageJson,
    priorPackageJson
  );
  const lockfileComponentDelta = buildLockfileComponentDelta(lock, priorLock);
  const dependencyDeltaCount =
    manifestDependencyDelta.length + lockfileComponentDelta.length;
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
    dependencyDelta: manifestDependencyDelta,
    lockfileComponentDelta
  };
  return {
    service: "scrimed-supply-chain-evidence",
    status: "LOCAL_SBOM_GENERATED_REVIEW_REQUIRED",
    componentCount: components.length,
    dependencyDeltaCount,
    manifestDependencyDeltaCount: manifestDependencyDelta.length,
    lockfileComponentDeltaCount: lockfileComponentDelta.length,
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
  const lockfileDelta = buildLockfileComponentDelta(
    {
      packages: {
        "node_modules/alpha": {
          version: "2.0.0",
          integrity: "sha512-current"
        }
      }
    },
    {
      packages: {
        "node_modules/alpha": {
          version: "1.0.0",
          integrity: "sha512-prior"
        }
      }
    }
  );
  if (
    lockfileDelta.length !== 1 ||
    lockfileDelta[0]?.before?.version !== "1.0.0" ||
    lockfileDelta[0]?.after?.version !== "2.0.0"
  ) {
    throw new Error("SBOM candidate-base lockfile component delta self-test failed");
  }
  const integrityOnlyDelta = buildLockfileComponentDelta(
    {
      packages: {
        "node_modules/alpha": {
          version: "1.0.0",
          integrity: "sha512-repacked"
        }
      }
    },
    {
      packages: {
        "node_modules/alpha": {
          version: "1.0.0",
          integrity: "sha512-original"
        }
      }
    }
  );
  if (integrityOnlyDelta.length !== 1) {
    throw new Error("SBOM lockfile integrity-only delta self-test failed");
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
else console.log(`pass SCRIMED local SBOM component_count=${report.componentCount} manifest_delta=${report.manifestDependencyDeltaCount} lockfile_delta=${report.lockfileComponentDeltaCount} dependency_delta=${report.dependencyDeltaCount} sbom_hash=${report.sbomHash.slice(0, 16)} signing=external-review-required`);
