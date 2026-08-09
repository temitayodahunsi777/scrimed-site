#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));

const runtimeFloors = {
  next: {
    minimum: "16.2.12",
    reason: "Next.js App Router security floor for known RSC, DoS, source exposure, and middleware/proxy bypass fixes."
  },
  react: {
    minimum: "19.2.4",
    reason: "React Server Components security floor for Flight protocol RCE and DoS hardening."
  },
  "react-dom": {
    minimum: "19.2.4",
    reason: "React DOM must stay aligned with React Server Components security fixes."
  },
  "eslint-config-next": {
    minimum: "16.2.12",
    reason: "Next lint/config package must stay aligned with the patched Next.js runtime line."
  }
};

const exactVersionRequired = new Set(["next", "react", "react-dom", "eslint-config-next"]);

function parseVersion(version, packageName) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  if (!match) {
    throw new Error(`${packageName} must use a concrete semver version, received ${version}`);
  }

  return match.slice(1, 4).map(Number);
}

function compareVersions(actual, minimum, packageName) {
  const actualParts = parseVersion(actual, packageName);
  const minimumParts = parseVersion(minimum, `${packageName} minimum`);

  for (let index = 0; index < actualParts.length; index += 1) {
    if (actualParts[index] > minimumParts[index]) {
      return 1;
    }

    if (actualParts[index] < minimumParts[index]) {
      return -1;
    }
  }

  return 0;
}

function assertExactVersion(packageName, specifier) {
  if (typeof specifier !== "string") {
    throw new Error(`${packageName} must be declared in package.json.`);
  }

  if (exactVersionRequired.has(packageName) && specifier !== parseVersion(specifier, packageName).join(".")) {
    throw new Error(`${packageName} must be pinned to an exact version, received ${specifier}`);
  }
}

function dependencySpecifier(packageName) {
  return packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName];
}

function lockedVersion(packageName) {
  return packageLock.packages?.[`node_modules/${packageName}`]?.version;
}

function rootLockedSpecifier(packageName) {
  return packageLock.packages?.[""]?.dependencies?.[packageName] ?? packageLock.packages?.[""]?.devDependencies?.[packageName];
}

for (const [packageName, floor] of Object.entries(runtimeFloors)) {
  const specifier = dependencySpecifier(packageName);
  assertExactVersion(packageName, specifier);

  if (compareVersions(specifier, floor.minimum, packageName) < 0) {
    throw new Error(`${packageName}@${specifier} is below SCRIMED security floor ${floor.minimum}: ${floor.reason}`);
  }

  const rootSpecifier = rootLockedSpecifier(packageName);
  if (rootSpecifier !== specifier) {
    throw new Error(
      `package-lock root specifier for ${packageName} is ${rootSpecifier ?? "missing"} but package.json declares ${specifier}`
    );
  }

  const lockVersion = lockedVersion(packageName);
  if (lockVersion !== specifier) {
    throw new Error(`package-lock resolved ${packageName}@${lockVersion ?? "missing"} but package.json declares ${specifier}`);
  }
}

if (dependencySpecifier("eslint-config-next") !== dependencySpecifier("next")) {
  throw new Error("eslint-config-next must stay pinned to the same version as next.");
}

if (dependencySpecifier("react") !== dependencySpecifier("react-dom")) {
  throw new Error("react and react-dom must stay pinned to the same version.");
}

if (packageLock.lockfileVersion < 3) {
  throw new Error(`package-lock.json must use lockfileVersion 3 or newer, received ${packageLock.lockfileVersion}`);
}

const postcssOverride = packageJson.overrides?.postcss;
if (postcssOverride !== "8.5.25") {
  throw new Error("postcss override must remain pinned to the reviewed 8.5.25 security floor.");
}

if (lockedVersion("postcss") !== postcssOverride) {
  throw new Error(`package-lock resolved postcss@${lockedVersion("postcss") ?? "missing"} but override requires ${postcssOverride}`);
}

const sharpOverride = packageJson.overrides?.sharp;
if (sharpOverride !== "0.35.3") {
  throw new Error("sharp override must remain pinned to the reviewed 0.35.3 security floor.");
}

if (lockedVersion("sharp") !== sharpOverride) {
  throw new Error(`package-lock resolved sharp@${lockedVersion("sharp") ?? "missing"} but override requires ${sharpOverride}`);
}

const lockedPackageVersions = (packageName) =>
  Object.entries(packageLock.packages ?? {})
    .filter(([packagePath]) =>
      packagePath === `node_modules/${packageName}` ||
      packagePath.endsWith(`/node_modules/${packageName}`)
    )
    .map(([, metadata]) => metadata?.version)
    .filter((version) => typeof version === "string");

for (const version of lockedPackageVersions("brace-expansion")) {
  const major = parseVersion(version, "brace-expansion")[0];
  const minimum = major === 1 ? "1.1.17" : major === 5 ? "5.0.8" : null;
  if (!minimum || compareVersions(version, minimum, "brace-expansion") < 0) {
    throw new Error(`brace-expansion@${version} is outside the reviewed security floor.`);
  }
}

for (const version of lockedPackageVersions("js-yaml")) {
  if (compareVersions(version, "4.3.0", "js-yaml") < 0) {
    throw new Error(`js-yaml@${version} is below the reviewed 4.3.0 security floor.`);
  }
}

for (const version of lockedPackageVersions("nanoid")) {
  if (compareVersions(version, "3.3.17", "nanoid") < 0) {
    throw new Error(`nanoid@${version} is below the reviewed 3.3.17 security floor.`);
  }
}

const prohibitedLicensePattern = /\b(?:AGPL|SSPL|BUSL)\b|Commons Clause/i;
for (const [packagePath, metadata] of Object.entries(packageLock.packages ?? {})) {
  if (!packagePath) continue;

  if (typeof metadata?.license !== "string" || metadata.license.trim().length === 0) {
    throw new Error(`${packagePath} must declare a license in the reviewed lockfile.`);
  }

  if (prohibitedLicensePattern.test(metadata.license)) {
    throw new Error(`${packagePath} uses prohibited or review-required license ${metadata.license}.`);
  }
}

console.log(
  `pass SCRIMED dependency security floor contract check (next ${dependencySpecifier("next")}, react ${dependencySpecifier(
    "react"
  )}, postcss ${postcssOverride}, sharp ${sharpOverride}, nanoid ${lockedVersion("nanoid")})`
);
