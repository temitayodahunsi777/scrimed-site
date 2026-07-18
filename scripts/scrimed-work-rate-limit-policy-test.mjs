#!/usr/bin/env node

import assert from "node:assert/strict";

import { enforceRequestRateLimit } from "../app/lib/requestRateLimit.ts";
import {
  enforceScrimedWorkMutationRateLimit,
  getScrimedWorkRateLimitPosture,
  scrimedWorkMutationRateLimitHeaders,
  scrimedWorkMutationRateLimitPolicy
} from "../app/lib/scrimed-work/rateLimitPolicy.ts";

const targetUrl = "https://app.scrimedsolutions.com/api/scrimed-work/sessions";
const identity = {
  workspaceId: "workspace-sensitive-test-id",
  tenantId: "tenant-sensitive-test-id",
  actorId: "actor-sensitive-test-id"
};
const redisEnvironmentNames = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "UPSTASH_REDIS_REST_KV_REST_API_URL",
  "UPSTASH_REDIS_REST_KV_REST_API_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN"
];

function request() {
  return new Request(targetUrl, { method: "POST" });
}

function result({
  allowed = true,
  limit = 30,
  remaining = 29,
  provider = "upstash-redis",
  reason = allowed ? "allowed" : "limit-exceeded",
  retryAfterSeconds = allowed ? 0 : 60
} = {}) {
  return {
    allowed,
    limit,
    remaining,
    resetAt: Date.now() + 60_000,
    retryAfterSeconds,
    provider,
    reason
  };
}

const savedRedisEnvironment = Object.fromEntries(
  redisEnvironmentNames.map((name) => [name, process.env[name]])
);
for (const name of redisEnvironmentNames) delete process.env[name];

try {
  const directProviderUnavailable = await enforceRequestRateLimit(request(), {
    namespace: "scrimed-work-test-provider-unavailable",
    identifier: "synthetic-identity",
    limit: 1,
    windowSeconds: 60,
    fallbackPolicy: "deny"
  });
  assert.equal(directProviderUnavailable.allowed, false);
  assert.equal(directProviderUnavailable.provider, "unavailable");
  assert.equal(directProviderUnavailable.reason, "provider-unavailable");

  const directLocalFallback = await enforceRequestRateLimit(request(), {
    namespace: "scrimed-work-test-local-fallback",
    identifier: "synthetic-identity",
    limit: 1,
    windowSeconds: 60,
    fallbackPolicy: "bounded-memory"
  });
  assert.equal(directLocalFallback.allowed, true);
  assert.equal(directLocalFallback.provider, "bounded-memory");
} finally {
  for (const name of redisEnvironmentNames) {
    const value = savedRedisEnvironment[name];
    if (typeof value === "string") process.env[name] = value;
    else delete process.env[name];
  }
}

const localPosture = getScrimedWorkRateLimitPosture({});
assert.equal(localPosture.mode, "bounded-memory");
assert.equal(localPosture.productionRuntime, false);
assert.equal(localPosture.readyForProtectedMutations, true);
assert.equal(localPosture.failClosedOnProviderUnavailable, false);

const productionCannotDowngrade = getScrimedWorkRateLimitPosture({
  VERCEL_ENV: "production",
  SCRIMED_WORK_RATE_LIMIT_MODE: "bounded-memory"
});
assert.equal(productionCannotDowngrade.mode, "distributed-required");
assert.equal(productionCannotDowngrade.downgradePrevented, true);
assert.equal(productionCannotDowngrade.readyForProtectedMutations, false);
assert.equal(productionCannotDowngrade.failClosedOnProviderUnavailable, true);

const productionReady = getScrimedWorkRateLimitPosture({
  VERCEL_ENV: "production",
  UPSTASH_REDIS_REST_URL: "https://synthetic-upstash.example",
  UPSTASH_REDIS_REST_TOKEN: "nonsecret-test-token"
});
assert.equal(productionReady.mode, "distributed-required");
assert.equal(productionReady.distributedProviderConfigured, true);
assert.equal(productionReady.readyForProtectedMutations, true);

const invalidConfiguration = await enforceScrimedWorkMutationRateLimit({
  request: request(),
  ...identity,
  action: "create-session",
  env: { SCRIMED_WORK_RATE_LIMIT_MODE: "permissive" },
  enforceRateLimit: async () => {
    throw new Error("invalid configuration must stop before provider use");
  }
});
assert.equal(invalidConfiguration.allowed, false);
assert.equal(invalidConfiguration.status, 503);
assert.equal(invalidConfiguration.code, "scrimed_work_rate_limit_provider_unavailable");

const calls = [];
const allowedRequest = request();
const allowed = await enforceScrimedWorkMutationRateLimit({
  request: allowedRequest,
  ...identity,
  action: "create-session",
  env: { SCRIMED_WORK_RATE_LIMIT_MODE: "distributed-required" },
  enforceRateLimit: async (_request, options) => {
    calls.push(options);
    return result({
      limit: options.limit,
      remaining: options.limit - 1
    });
  }
});
assert.equal(allowed.allowed, true);
assert.equal(allowed.status, 200);
assert.equal(calls.length, 2);
assert.equal(calls[0].namespace, scrimedWorkMutationRateLimitPolicy.actor.namespace);
assert.equal(calls[1].namespace, scrimedWorkMutationRateLimitPolicy.tenant.namespace);
assert.equal(calls[0].fallbackPolicy, "deny");
assert.equal(calls[1].fallbackPolicy, "deny");

const allowedHeaders = scrimedWorkMutationRateLimitHeaders(allowedRequest);
assert.equal(allowedHeaders["X-SCRIMED-Rate-Limit-Decision"], "allowed");
assert.equal(allowedHeaders["X-SCRIMED-Rate-Limit-Scope"], "none");
assert.equal(allowedHeaders["X-SCRIMED-Rate-Limit-Provider"], "upstash-redis");
const serializedHeaders = JSON.stringify(allowedHeaders);
for (const sensitiveValue of Object.values(identity)) {
  assert.equal(serializedHeaders.includes(sensitiveValue), false);
}

const actorExceededRequest = request();
let actorExceededCalls = 0;
const actorExceeded = await enforceScrimedWorkMutationRateLimit({
  request: actorExceededRequest,
  ...identity,
  action: "create-session",
  env: {},
  enforceRateLimit: async () => {
    actorExceededCalls += 1;
    return result({ allowed: false, limit: 30, remaining: 0 });
  }
});
assert.equal(actorExceeded.allowed, false);
assert.equal(actorExceeded.status, 429);
assert.equal(actorExceeded.blockedScope, "actor");
assert.equal(actorExceededCalls, 1);
assert.equal(
  scrimedWorkMutationRateLimitHeaders(actorExceededRequest)["Retry-After"],
  "60"
);

const tenantExceededRequest = request();
let tenantExceededCalls = 0;
const tenantExceeded = await enforceScrimedWorkMutationRateLimit({
  request: tenantExceededRequest,
  ...identity,
  action: "plan-session",
  env: {},
  enforceRateLimit: async (_request, options) => {
    tenantExceededCalls += 1;
    return tenantExceededCalls === 1
      ? result({ limit: options.limit, remaining: options.limit - 1 })
      : result({ allowed: false, limit: options.limit, remaining: 0 });
  }
});
assert.equal(tenantExceeded.allowed, false);
assert.equal(tenantExceeded.status, 429);
assert.equal(tenantExceeded.blockedScope, "tenant");
assert.equal(tenantExceededCalls, 2);

const providerUnavailableRequest = request();
const providerUnavailable = await enforceScrimedWorkMutationRateLimit({
  request: providerUnavailableRequest,
  ...identity,
  action: "review-artifact",
  env: { VERCEL_ENV: "production" },
  enforceRateLimit: async () =>
    result({
      allowed: false,
      remaining: 0,
      provider: "unavailable",
      reason: "provider-unavailable",
      retryAfterSeconds: 30
    })
});
assert.equal(providerUnavailable.allowed, false);
assert.equal(providerUnavailable.status, 503);
assert.equal(
  providerUnavailable.code,
  "scrimed_work_rate_limit_provider_unavailable"
);
assert.equal(
  scrimedWorkMutationRateLimitHeaders(providerUnavailableRequest)[
    "X-SCRIMED-Rate-Limit-Decision"
  ],
  "provider-unavailable"
);

const boundedFallbackOptions = [];
await enforceScrimedWorkMutationRateLimit({
  request: request(),
  ...identity,
  action: "local-test",
  env: { SCRIMED_WORK_RATE_LIMIT_MODE: "bounded-memory" },
  enforceRateLimit: async (_request, options) => {
    boundedFallbackOptions.push(options.fallbackPolicy);
    return result({
      limit: options.limit,
      remaining: options.limit - 1,
      provider: "bounded-memory"
    });
  }
});
assert.deepEqual(boundedFallbackOptions, ["bounded-memory", "bounded-memory"]);

console.log(
  "pass SCRIMED Work mutation rate-limit policy (actor and tenant quotas, production downgrade prevention, 429 exhaustion, and 503 provider fail-closed)"
);
