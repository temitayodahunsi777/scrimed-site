import {
  enforceRequestRateLimit,
  type RateLimitOptions,
  type RateLimitProvider,
  type RateLimitResult
} from "../requestRateLimit";
import { isUpstashRedisConfigured } from "../upstashRuntime";

export const scrimedWorkMutationRateLimitPolicyVersion =
  "scrimed-work-mutation-rate-limit-v1-2026-07-17";

export const scrimedWorkMutationRateLimitBoundary =
  "Protected SCRIMED Work mutations use hashed actor and tenant scopes. Production requires the distributed provider and fails closed when it is missing or unavailable; bounded process memory is allowed only for local or test validation and does not establish production readiness.";

export const scrimedWorkMutationRateLimitPolicy = {
  actor: {
    namespace: "scrimed-work-mutation-actor",
    limit: 30,
    windowSeconds: 600
  },
  tenant: {
    namespace: "scrimed-work-mutation-tenant",
    limit: 120,
    windowSeconds: 600
  }
} as const;

export type ScrimedWorkRateLimitMode = "distributed-required" | "bounded-memory";

export type ScrimedWorkRateLimitPosture = {
  policyVersion: typeof scrimedWorkMutationRateLimitPolicyVersion;
  mode: ScrimedWorkRateLimitMode;
  requestedMode: ScrimedWorkRateLimitMode | "auto" | "invalid";
  productionRuntime: boolean;
  downgradePrevented: boolean;
  configurationValid: boolean;
  distributedProviderConfigured: boolean;
  failClosedOnProviderUnavailable: boolean;
  readyForProtectedMutations: boolean;
  actorLimit: number;
  tenantLimit: number;
  windowSeconds: number;
  boundary: typeof scrimedWorkMutationRateLimitBoundary;
};

type SanitizedLimitResult = {
  evaluated: boolean;
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  provider: RateLimitProvider;
  reason: RateLimitResult["reason"];
};

export type ScrimedWorkMutationRateLimitDecision = {
  allowed: boolean;
  status: 200 | 429 | 503;
  code:
    | "scrimed_work_rate_limit_allowed"
    | "scrimed_work_rate_limit_exceeded"
    | "scrimed_work_rate_limit_provider_unavailable";
  reason: RateLimitResult["reason"];
  policyVersion: typeof scrimedWorkMutationRateLimitPolicyVersion;
  mode: ScrimedWorkRateLimitMode;
  blockedScope: "actor" | "tenant" | null;
  provider: RateLimitProvider;
  retryAfterSeconds: number;
  actor: SanitizedLimitResult;
  tenant: SanitizedLimitResult;
};

type RateLimitEnforcer = (
  request: Request,
  options: RateLimitOptions
) => Promise<RateLimitResult>;

type ScrimedWorkMutationRateLimitInput = {
  request: Request;
  workspaceId: string;
  tenantId: string;
  actorId: string;
  action: string;
  env?: NodeJS.ProcessEnv;
  enforceRateLimit?: RateLimitEnforcer;
};

const decisionsByRequest = new WeakMap<Request, ScrimedWorkMutationRateLimitDecision>();

function parseRequestedMode(env: NodeJS.ProcessEnv) {
  const value = env.SCRIMED_WORK_RATE_LIMIT_MODE?.trim();

  if (!value) return "auto" as const;
  if (value === "distributed-required" || value === "bounded-memory") return value;
  return "invalid" as const;
}

export function getScrimedWorkRateLimitPosture(
  env: NodeJS.ProcessEnv = process.env
): ScrimedWorkRateLimitPosture {
  const requestedMode = parseRequestedMode(env);
  const productionRuntime =
    env.VERCEL_ENV === "production" || env.SCRIMED_DEPLOYMENT_STAGE === "production";
  const downgradePrevented = productionRuntime && requestedMode === "bounded-memory";
  const configurationValid = requestedMode !== "invalid";
  const mode: ScrimedWorkRateLimitMode = productionRuntime
    ? "distributed-required"
    : requestedMode === "distributed-required"
      ? "distributed-required"
      : "bounded-memory";
  const distributedProviderConfigured = isUpstashRedisConfigured(env);
  const failClosedOnProviderUnavailable = mode === "distributed-required";

  return {
    policyVersion: scrimedWorkMutationRateLimitPolicyVersion,
    mode,
    requestedMode,
    productionRuntime,
    downgradePrevented,
    configurationValid,
    distributedProviderConfigured,
    failClosedOnProviderUnavailable,
    readyForProtectedMutations:
      configurationValid &&
      (mode === "bounded-memory" || distributedProviderConfigured),
    actorLimit: scrimedWorkMutationRateLimitPolicy.actor.limit,
    tenantLimit: scrimedWorkMutationRateLimitPolicy.tenant.limit,
    windowSeconds: scrimedWorkMutationRateLimitPolicy.actor.windowSeconds,
    boundary: scrimedWorkMutationRateLimitBoundary
  };
}

function unevaluatedLimit(limit: number): SanitizedLimitResult {
  return {
    evaluated: false,
    allowed: false,
    limit,
    remaining: 0,
    resetAt: 0,
    provider: "unavailable",
    reason: "provider-unavailable"
  };
}

function sanitizeLimitResult(result: RateLimitResult): SanitizedLimitResult {
  return {
    evaluated: true,
    allowed: result.allowed,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: result.resetAt,
    provider: result.provider,
    reason: result.reason
  };
}

function deniedDecision(input: {
  posture: ScrimedWorkRateLimitPosture;
  scope: "actor" | "tenant";
  result: RateLimitResult;
  actor: SanitizedLimitResult;
  tenant: SanitizedLimitResult;
}): ScrimedWorkMutationRateLimitDecision {
  const providerUnavailable = input.result.reason === "provider-unavailable";

  return {
    allowed: false,
    status: providerUnavailable ? 503 : 429,
    code: providerUnavailable
      ? "scrimed_work_rate_limit_provider_unavailable"
      : "scrimed_work_rate_limit_exceeded",
    reason: input.result.reason,
    policyVersion: scrimedWorkMutationRateLimitPolicyVersion,
    mode: input.posture.mode,
    blockedScope: input.scope,
    provider: input.result.provider,
    retryAfterSeconds: input.result.retryAfterSeconds,
    actor: input.actor,
    tenant: input.tenant
  };
}

function configurationDeniedDecision(
  posture: ScrimedWorkRateLimitPosture
): ScrimedWorkMutationRateLimitDecision {
  return {
    allowed: false,
    status: 503,
    code: "scrimed_work_rate_limit_provider_unavailable",
    reason: "provider-unavailable",
    policyVersion: scrimedWorkMutationRateLimitPolicyVersion,
    mode: posture.mode,
    blockedScope: "tenant",
    provider: "unavailable",
    retryAfterSeconds: 30,
    actor: unevaluatedLimit(scrimedWorkMutationRateLimitPolicy.actor.limit),
    tenant: unevaluatedLimit(scrimedWorkMutationRateLimitPolicy.tenant.limit)
  };
}

export async function enforceScrimedWorkMutationRateLimit(
  input: ScrimedWorkMutationRateLimitInput
): Promise<ScrimedWorkMutationRateLimitDecision> {
  const env = input.env ?? process.env;
  const posture = getScrimedWorkRateLimitPosture(env);
  const enforceRateLimit = input.enforceRateLimit ?? enforceRequestRateLimit;
  const fallbackPolicy = posture.mode === "distributed-required" ? "deny" : "bounded-memory";

  if (!posture.configurationValid) {
    const decision = configurationDeniedDecision(posture);
    decisionsByRequest.set(input.request, decision);
    return decision;
  }

  const actorResult = await enforceRateLimit(input.request, {
    ...scrimedWorkMutationRateLimitPolicy.actor,
    identifier: `${input.tenantId}:${input.workspaceId}:${input.actorId}`,
    fallbackPolicy
  });
  const actor = sanitizeLimitResult(actorResult);

  if (!actorResult.allowed) {
    const decision = deniedDecision({
      posture,
      scope: "actor",
      result: actorResult,
      actor,
      tenant: unevaluatedLimit(scrimedWorkMutationRateLimitPolicy.tenant.limit)
    });
    decisionsByRequest.set(input.request, decision);
    return decision;
  }

  const tenantResult = await enforceRateLimit(input.request, {
    ...scrimedWorkMutationRateLimitPolicy.tenant,
    identifier: input.tenantId,
    fallbackPolicy
  });
  const tenant = sanitizeLimitResult(tenantResult);

  if (!tenantResult.allowed) {
    const decision = deniedDecision({
      posture,
      scope: "tenant",
      result: tenantResult,
      actor,
      tenant
    });
    decisionsByRequest.set(input.request, decision);
    return decision;
  }

  const decision: ScrimedWorkMutationRateLimitDecision = {
    allowed: true,
    status: 200,
    code: "scrimed_work_rate_limit_allowed",
    reason: "allowed",
    policyVersion: scrimedWorkMutationRateLimitPolicyVersion,
    mode: posture.mode,
    blockedScope: null,
    provider: tenantResult.provider,
    retryAfterSeconds: 0,
    actor,
    tenant
  };
  decisionsByRequest.set(input.request, decision);
  return decision;
}

function resetSeconds(value: SanitizedLimitResult) {
  return value.evaluated && value.resetAt > 0
    ? String(Math.ceil(value.resetAt / 1000))
    : "not-evaluated";
}

export function scrimedWorkMutationRateLimitHeaders(request?: Request) {
  const posture = getScrimedWorkRateLimitPosture();
  const decision = request ? decisionsByRequest.get(request) : undefined;

  return {
    "X-SCRIMED-Rate-Limit-Policy": scrimedWorkMutationRateLimitPolicyVersion,
    "X-SCRIMED-Rate-Limit-Mode": posture.mode,
    "X-SCRIMED-Rate-Limit-Decision": decision
      ? decision.allowed
        ? "allowed"
        : decision.reason
      : "not-evaluated",
    "X-SCRIMED-Rate-Limit-Scope": decision?.blockedScope ?? "none",
    "X-SCRIMED-Rate-Limit-Provider": decision?.provider ?? "not-evaluated",
    "X-SCRIMED-Actor-RateLimit-Limit": String(
      decision?.actor.limit ?? scrimedWorkMutationRateLimitPolicy.actor.limit
    ),
    "X-SCRIMED-Actor-RateLimit-Remaining": decision?.actor.evaluated
      ? String(decision.actor.remaining)
      : "not-evaluated",
    "X-SCRIMED-Actor-RateLimit-Reset": decision
      ? resetSeconds(decision.actor)
      : "not-evaluated",
    "X-SCRIMED-Tenant-RateLimit-Limit": String(
      decision?.tenant.limit ?? scrimedWorkMutationRateLimitPolicy.tenant.limit
    ),
    "X-SCRIMED-Tenant-RateLimit-Remaining": decision?.tenant.evaluated
      ? String(decision.tenant.remaining)
      : "not-evaluated",
    "X-SCRIMED-Tenant-RateLimit-Reset": decision
      ? resetSeconds(decision.tenant)
      : "not-evaluated",
    ...(decision && decision.retryAfterSeconds > 0
      ? { "Retry-After": String(decision.retryAfterSeconds) }
      : {})
  };
}
