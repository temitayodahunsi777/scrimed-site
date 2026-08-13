import { createHash } from "node:crypto";

import {
  resolveScrimedOperatingMode,
  validateScrimedOperatingMode
} from "../operatingMode";
import { scrimedSafetyPolicyVersion } from "../scrimedSafetyGovernance";

export const vercelReleaseAssuranceVersion =
  "scrimed-vercel-release-assurance-v1-2026-08-12";

export const vercelReleaseAssuranceBoundary =
  "Safe operational metadata only. These endpoints expose no secret values, credentials, tenant data, PHI, deployment authorization, migration approval, customer activation, certification, or production claim.";

export type ReleaseEnvironment =
  | "development"
  | "test"
  | "preview"
  | "production"
  | "unknown";

export type ReleaseAssuranceCheck = {
  id: string;
  status: "pass" | "fail" | "not_checked";
  mandatory: boolean;
  detail: string;
};

const shaPattern = /^[0-9a-f]{40}$/i;

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
    .join(",")}}`;
}

function sha256(value: unknown) {
  return createHash("sha256").update(stableSerialize(value)).digest("hex");
}

function releaseEnvironment(env: NodeJS.ProcessEnv): ReleaseEnvironment {
  const value = env.VERCEL_ENV ?? env.NODE_ENV;
  if (value === "development" || value === "test" || value === "preview" || value === "production") {
    return value;
  }
  return "unknown";
}

function publicCommitSha(env: NodeJS.ProcessEnv) {
  const candidate = env.VERCEL_GIT_COMMIT_SHA?.trim() || env.SCRIMED_BUILD_COMMIT_SHA?.trim();
  return candidate && shaPattern.test(candidate) ? candidate.toLowerCase() : null;
}

function publicBuildTimestamp(env: NodeJS.ProcessEnv) {
  const value = env.SCRIMED_BUILD_TIMESTAMP?.trim();
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
}

export function getScrimedBuildInfo(env: NodeJS.ProcessEnv = process.env) {
  const base = {
    service: "scrimed-build-info" as const,
    version: vercelReleaseAssuranceVersion,
    commitSha: publicCommitSha(env),
    buildTimestamp: publicBuildTimestamp(env),
    environment: releaseEnvironment(env),
    project: env.VERCEL_PROJECT_PRODUCTION_URL ? "scrimed-site" : "local-unbound",
    candidateBound: Boolean(publicCommitSha(env)),
    productionReleaseAuthorized: false as const,
    customerActivationAuthorized: false as const
  };

  return {
    ...base,
    releaseFingerprint: sha256(base),
    boundary: vercelReleaseAssuranceBoundary
  };
}

function flagEnabled(env: NodeJS.ProcessEnv, key: string) {
  return env[key]?.trim().toLowerCase() === "true";
}

export function getScrimedHealth(env: NodeJS.ProcessEnv = process.env) {
  const operatingMode = resolveScrimedOperatingMode(env);
  const build = getScrimedBuildInfo(env);

  return {
    ok: true,
    service: "scrimed-site",
    status: "healthy" as const,
    version: vercelReleaseAssuranceVersion,
    environment: build.environment,
    releaseFingerprint: build.releaseFingerprint,
    operatingMode: operatingMode.syntheticOnly ? "synthetic-no-phi" : "invalid-review-required",
    productionReleaseAuthorized: false as const,
    boundary: vercelReleaseAssuranceBoundary
  };
}

export function getScrimedReleaseReadiness(env: NodeJS.ProcessEnv = process.env) {
  const operatingMode = resolveScrimedOperatingMode(env);
  const operatingModeValidation = validateScrimedOperatingMode(operatingMode);
  const protectedStoreRequested =
    flagEnabled(env, "SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED") ||
    flagEnabled(env, "SCRIMED_WORK_DURABLE_STORE_ENABLED") ||
    flagEnabled(env, "SCRIMED_WORK_PROTECTED_WRITES_ENABLED");
  const unsafeRuntimeFlags = [
    "SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED",
    "SCRIMED_EXTERNAL_PROVIDER_CALLS_ENABLED",
    "SCRIMED_AI_PROVIDER_CALLS_ENABLED",
    "SCRIMED_SCHEDULES_ENABLED"
  ].filter((key) => flagEnabled(env, key));

  const checks: ReleaseAssuranceCheck[] = [
    {
      id: "application-initialized",
      status: "pass",
      mandatory: true,
      detail: "Next.js release assurance initialized."
    },
    {
      id: "operating-mode-safe",
      status: operatingModeValidation.valid ? "pass" : "fail",
      mandatory: true,
      detail: operatingModeValidation.valid
        ? "Synthetic-only, no-PHI, and no-live-clinical controls are active."
        : `Unsafe operating mode: ${operatingModeValidation.violations.join(", ")}.`
    },
    {
      id: "policy-engine-initialized",
      status: scrimedSafetyPolicyVersion ? "pass" : "fail",
      mandatory: true,
      detail: `Policy engine ${scrimedSafetyPolicyVersion || "missing"}.`
    },
    {
      id: "forbidden-capabilities-disabled",
      status: unsafeRuntimeFlags.length === 0 ? "pass" : "fail",
      mandatory: true,
      detail: unsafeRuntimeFlags.length === 0
        ? "Consequential actions, provider calls, and schedules remain disabled."
        : `Unsafe runtime flags enabled: ${unsafeRuntimeFlags.join(", ")}.`
    },
    {
      id: "database-protected-write-readiness",
      status: protectedStoreRequested ? "not_checked" : "pass",
      mandatory: protectedStoreRequested,
      detail: protectedStoreRequested
        ? "Protected persistence was requested; authenticated AAL2, migration, tenant, and database smoke evidence is required."
        : "Database reachability is not required for the current read-only synthetic mode."
    },
    {
      id: "distribution-lockbox",
      status: "pass",
      mandatory: true,
      detail: "External packet distribution and customer activation remain closed."
    }
  ];
  const failed = checks.filter((check) => check.mandatory && check.status !== "pass");
  const build = getScrimedBuildInfo(env);

  return {
    ok: failed.length === 0,
    service: "scrimed-release-readiness" as const,
    status: failed.length === 0 ? ("ready-synthetic-read-only" as const) : ("not-ready-fail-closed" as const),
    version: vercelReleaseAssuranceVersion,
    checks,
    failedCheckIds: failed.map((check) => check.id),
    operatingMode,
    build,
    databaseProbeExecuted: false as const,
    productionReleaseAuthorized: false as const,
    customerActivationAuthorized: false as const,
    externalDistributionAuthorized: false as const,
    boundary: vercelReleaseAssuranceBoundary
  };
}
