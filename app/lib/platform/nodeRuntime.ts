import { createHash } from "node:crypto";

export const scrimedNodeRuntimePolicyVersion =
  "scrimed-node-runtime-policy-v1-2026-08-14";

export const scrimedNodeRuntimeTarget = {
  runtime: "nodejs" as const,
  nodeMajor: 24 as const,
  engineRange: "24.x" as const,
  previousNodeMajor: 22 as const,
  packageManager: "npm" as const,
  lockfile: "package-lock.json" as const,
  lockfileVersion: 3 as const,
  vercelProject: "scrimed-site" as const,
  vercelProjectId: "prj_94JBnKm2BsZ7qHtEDbUvWmiDWLjn" as const
};

export type ScrimedRuntimeEnvironment =
  | "development"
  | "test"
  | "preview"
  | "production"
  | "unknown";

function runtimeEnvironment(env: NodeJS.ProcessEnv): ScrimedRuntimeEnvironment {
  const candidate = env.VERCEL_ENV ?? env.NODE_ENV;
  return candidate === "development" ||
    candidate === "test" ||
    candidate === "preview" ||
    candidate === "production"
    ? candidate
    : "unknown";
}

export function parseNodeMajor(runtimeVersion: string): number | null {
  const major = Number.parseInt(runtimeVersion.split(".", 1)[0] ?? "", 10);
  return Number.isInteger(major) && major > 0 ? major : null;
}

function runtimeFingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function getScrimedNodeRuntimeStatus(input: {
  env?: NodeJS.ProcessEnv;
  runtimeVersion?: string;
} = {}) {
  const env = input.env ?? process.env;
  const runtimeVersion = input.runtimeVersion ?? process.versions.node;
  const actualMajor = parseNodeMajor(runtimeVersion);
  const certified = actualMajor === scrimedNodeRuntimeTarget.nodeMajor;
  const status = {
    version: scrimedNodeRuntimePolicyVersion,
    runtime: scrimedNodeRuntimeTarget.runtime,
    targetNodeMajor: scrimedNodeRuntimeTarget.nodeMajor,
    targetEngineRange: scrimedNodeRuntimeTarget.engineRange,
    actualNodeMajor: actualMajor,
    environment: runtimeEnvironment(env),
    packageManager: scrimedNodeRuntimeTarget.packageManager,
    packageManagerEvidence: "npm-lockfile-v3",
    repositoryOverrideActive: true as const,
    vercelProject: scrimedNodeRuntimeTarget.vercelProject,
    vercelProjectId: scrimedNodeRuntimeTarget.vercelProjectId,
    compatibilityStatus: certified
      ? ("NODE24_CERTIFIED_RUNTIME_ACTIVE" as const)
      : ("RUNTIME_UPGRADE_REQUIRED" as const),
    runtimeUpgradeRequired: !certified,
    certified,
    consequentialAuthorityGranted: false as const
  };

  return {
    ...status,
    runtimeFingerprint: runtimeFingerprint(status)
  };
}

export const scrimedNodeRuntimeBoundary =
  "Runtime certification proves Node.js compatibility only. It does not authorize production deployment, PHI, clinical execution, payer action, EHR or device writeback, customer activation, or external distribution.";
