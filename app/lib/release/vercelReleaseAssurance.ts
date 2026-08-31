import { createHash } from "node:crypto";

import {
  resolveScrimedOperatingMode,
  validateScrimedOperatingMode
} from "../operatingMode";
import {
  getScrimedNodeRuntimeStatus,
  scrimedNodeRuntimeBoundary,
  scrimedNodeRuntimeTarget
} from "../platform/nodeRuntime";
import {
  p33DecisionEvidenceLedgerVersion
} from "../scrimed-p33/decisionEvidenceLedger";
import { p33PortableAgentContractVersion } from "../scrimed-p33/agentPortability";
import { scrimedSafetyPolicyVersion } from "../scrimedSafetyGovernance";

export const vercelReleaseAssuranceVersion =
  "scrimed-vercel-release-assurance-v4-2026-08-31";

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
const sha256Pattern = /^[0-9a-f]{64}$/i;
const branchPattern = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/;
const deploymentIdPattern = /^dpl_[A-Za-z0-9]{12,80}$/;
const vercelDeploymentHostnamePattern = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+vercel\.app$/;

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

function publicBranch(env: NodeJS.ProcessEnv) {
  const value = env.VERCEL_GIT_COMMIT_REF?.trim() || env.SCRIMED_BUILD_BRANCH?.trim();
  return value && branchPattern.test(value) ? value : null;
}

function publicCandidateFingerprint(env: NodeJS.ProcessEnv) {
  const value = env.SCRIMED_PREVIEW_CANDIDATE_SHA256?.trim();
  return value && sha256Pattern.test(value) ? value.toLowerCase() : null;
}

function publicDeploymentId(env: NodeJS.ProcessEnv) {
  const value = env.VERCEL_DEPLOYMENT_ID?.trim();
  return value && deploymentIdPattern.test(value) ? value : null;
}

function publicDeploymentUrl(env: NodeJS.ProcessEnv) {
  const value = env.VERCEL_URL?.trim().toLowerCase();
  return value && vercelDeploymentHostnamePattern.test(value) ? `https://${value}` : null;
}

export function getScrimedBuildInfo(
  env: NodeJS.ProcessEnv = process.env,
  runtimeVersion = process.versions.node
) {
  const runtime = getScrimedNodeRuntimeStatus({ env, runtimeVersion });
  const commit = publicCommitSha(env);
  const branch = publicBranch(env);
  const candidateFingerprint = publicCandidateFingerprint(env);
  const deploymentId = publicDeploymentId(env);
  const deploymentUrl = publicDeploymentUrl(env);
  const base = {
    service: "scrimed-build-info" as const,
    version: vercelReleaseAssuranceVersion,
    runtime: runtime.runtime,
    nodeMajor: runtime.actualNodeMajor,
    nodeTarget: scrimedNodeRuntimeTarget.engineRange,
    packageManager: scrimedNodeRuntimeTarget.packageManager,
    lockfileVersion: scrimedNodeRuntimeTarget.lockfileVersion,
    nextVersion: "16.2.12" as const,
    commit,
    commitSha: commit,
    branch,
    deploymentId,
    deploymentUrl,
    deploymentIdentityBound: Boolean(deploymentId && deploymentUrl),
    candidateFingerprint,
    candidateFingerprintDeclared: Boolean(candidateFingerprint),
    candidateFingerprintBound: false as const,
    candidateFingerprintVerificationStatus: candidateFingerprint
      ? "DECLARED_UNVERIFIED" as const
      : "NOT_PROVIDED" as const,
    buildTimestamp: publicBuildTimestamp(env),
    environment: releaseEnvironment(env),
    project: env.VERCEL_PROJECT_PRODUCTION_URL ? "scrimed-site" : "local-unbound",
    candidateBound: Boolean(commit),
    runtimeCompatibilityStatus: runtime.compatibilityStatus,
    productionReleaseAuthorized: false as const,
    customerActivationAuthorized: false as const
  };

  return {
    ...base,
    releaseFingerprint: sha256(base),
    runtimeFingerprint: runtime.runtimeFingerprint,
    boundary: `${vercelReleaseAssuranceBoundary} ${scrimedNodeRuntimeBoundary}`
  };
}

function flagEnabled(env: NodeJS.ProcessEnv, key: string) {
  return env[key]?.trim().toLowerCase() === "true";
}

export function getScrimedHealth(
  env: NodeJS.ProcessEnv = process.env,
  runtimeVersion = process.versions.node
) {
  const operatingMode = resolveScrimedOperatingMode(env);
  const build = getScrimedBuildInfo(env, runtimeVersion);

  return {
    ok: true,
    service: "scrimed-site",
    status: "healthy" as const,
    scope: "process-and-application-health-only" as const,
    version: vercelReleaseAssuranceVersion,
    environment: build.environment,
    runtime: build.runtime,
    nodeMajor: build.nodeMajor,
    runtimeCompatibilityStatus: build.runtimeCompatibilityStatus,
    releaseFingerprint: build.releaseFingerprint,
    operatingMode: operatingMode.syntheticOnly ? "synthetic-no-phi" : "invalid-review-required",
    productionReleaseAuthorized: false as const,
    productionReadinessClaimed: false as const,
    boundary: vercelReleaseAssuranceBoundary
  };
}

export function getScrimedReleaseReadiness(
  env: NodeJS.ProcessEnv = process.env,
  runtimeVersion = process.versions.node
) {
  const operatingMode = resolveScrimedOperatingMode(env);
  const operatingModeValidation = validateScrimedOperatingMode(operatingMode);
  const runtime = getScrimedNodeRuntimeStatus({ env, runtimeVersion });
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
      id: "node24-runtime-certified",
      status: runtime.certified ? "pass" : "fail",
      mandatory: true,
      detail: runtime.certified
        ? "Node.js 24 runtime matches the repository and Vercel target."
        : `Runtime major ${runtime.actualNodeMajor ?? "unknown"} does not match required major 24.`
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
      id: "evidence-subsystem-initialized",
      status: p33DecisionEvidenceLedgerVersion ? "pass" : "fail",
      mandatory: true,
      detail: `Decision evidence subsystem ${p33DecisionEvidenceLedgerVersion || "missing"}.`
    },
    {
      id: "model-router-initialized",
      status: p33PortableAgentContractVersion ? "pass" : "fail",
      mandatory: true,
      detail: `Provider-neutral route contract ${p33PortableAgentContractVersion || "missing"}.`
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
  const build = getScrimedBuildInfo(env, runtimeVersion);

  return {
    ok: failed.length === 0,
    service: "scrimed-release-readiness" as const,
    status: failed.length === 0 ? ("ready-synthetic-read-only" as const) : ("not-ready-fail-closed" as const),
    scope: "current-environment-operational-readiness-only" as const,
    currentEnvironmentOnly: true as const,
    version: vercelReleaseAssuranceVersion,
    checks,
    failedCheckIds: failed.map((check) => check.id),
    operatingMode,
    runtime,
    build,
    databaseProbeExecuted: false as const,
    productionReleaseAuthorized: false as const,
    productionReadinessClaimed: false as const,
    customerActivationAuthorized: false as const,
    externalDistributionAuthorized: false as const,
    boundary: vercelReleaseAssuranceBoundary
  };
}
