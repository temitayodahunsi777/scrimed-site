#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));

const runtimeFloors = {
  next: {
    minimum: "16.1.5",
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
    minimum: "16.1.5",
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
if (postcssOverride !== "8.5.15") {
  throw new Error("postcss override must remain pinned to 8.5.15 until dependency review intentionally changes it.");
}

if (lockedVersion("postcss") !== postcssOverride) {
  throw new Error(`package-lock resolved postcss@${lockedVersion("postcss") ?? "missing"} but override requires ${postcssOverride}`);
}

console.log(
  `pass SCRIMED dependency security floor contract check (next ${dependencySpecifier("next")}, react ${dependencySpecifier(
    "react"
  )}, postcss ${postcssOverride})`
);
