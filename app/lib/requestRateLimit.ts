import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getUpstashRedisCredentials } from "./upstashRuntime";

type MemoryBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitProvider = "upstash-redis" | "bounded-memory" | "unavailable";

export type RateLimitReason = "allowed" | "limit-exceeded" | "provider-unavailable";

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
  provider: RateLimitProvider;
  reason: RateLimitReason;
};

export type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowSeconds: number;
  identifier?: string;
  fallbackPolicy?: "bounded-memory" | "deny";
};

const globalRateLimit = globalThis as typeof globalThis & {
  __scrimedRateLimitBuckets?: Map<string, MemoryBucket>;
  __scrimedUpstashLimiters?: Map<string, Ratelimit>;
};

const memoryBuckets = globalRateLimit.__scrimedRateLimitBuckets ?? new Map<string, MemoryBucket>();
const upstashLimiters = globalRateLimit.__scrimedUpstashLimiters ?? new Map<string, Ratelimit>();

globalRateLimit.__scrimedRateLimitBuckets = memoryBuckets;
globalRateLimit.__scrimedUpstashLimiters = upstashLimiters;

function requestFingerprint(request: Request, namespace: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const authorization = request.headers.get("authorization") ?? "anonymous";

  return createHash("sha256")
    .update(`${namespace}|${forwardedFor}|${userAgent}|${authorization}`)
    .digest("hex");
}

function rateLimitIdentifier(request: Request, options: RateLimitOptions) {
  const scopedIdentifier = options.identifier?.trim();

  if (!scopedIdentifier) {
    return requestFingerprint(request, options.namespace);
  }

  return createHash("sha256")
    .update(`${options.namespace}|scoped-identity|${scopedIdentifier}`)
    .digest("hex");
}

function getUpstashLimiter(options: RateLimitOptions) {
  const credentials = getUpstashRedisCredentials();

  if (!credentials) {
    return null;
  }

  const key = `${options.namespace}:${options.limit}:${options.windowSeconds}`;
  const existing = upstashLimiters.get(key);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis: new Redis(credentials),
    limiter: Ratelimit.slidingWindow(options.limit, `${options.windowSeconds} s`),
    analytics: true,
    prefix: `scrimed:${options.namespace}`
  });

  upstashLimiters.set(key, limiter);
  return limiter;
}

function enforceMemoryLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const key = `${options.namespace}:${identifier}`;
  const existing = memoryBuckets.get(key);
  const bucket =
    !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + options.windowSeconds * 1000 }
      : existing;

  bucket.count += 1;
  memoryBuckets.set(key, bucket);

  if (memoryBuckets.size > 5000) {
    for (const [bucketKey, value] of memoryBuckets) {
      if (value.resetAt <= now) {
        memoryBuckets.delete(bucketKey);
      }
    }
  }

  const allowed = bucket.count <= options.limit;

  return {
    allowed,
    limit: options.limit,
    remaining: Math.max(0, options.limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    provider: "bounded-memory",
    reason: allowed ? "allowed" : "limit-exceeded"
  };
}

function unavailableResult(options: RateLimitOptions): RateLimitResult {
  const retryAfterSeconds = Math.min(30, Math.max(1, options.windowSeconds));

  return {
    allowed: false,
    limit: options.limit,
    remaining: 0,
    resetAt: Date.now() + retryAfterSeconds * 1000,
    retryAfterSeconds,
    provider: "unavailable",
    reason: "provider-unavailable"
  };
}

export async function enforceRequestRateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const identifier = rateLimitIdentifier(request, options);
  const upstash = getUpstashLimiter(options);

  if (!upstash) {
    return options.fallbackPolicy === "deny"
      ? unavailableResult(options)
      : enforceMemoryLimit(identifier, options);
  }

  try {
    const result = await upstash.limit(identifier);
    const now = Date.now();

    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetAt: result.reset,
      retryAfterSeconds: result.success ? 0 : Math.max(1, Math.ceil((result.reset - now) / 1000)),
      provider: "upstash-redis",
      reason: result.success ? "allowed" : "limit-exceeded"
    };
  } catch {
    return options.fallbackPolicy === "deny"
      ? unavailableResult(options)
      : enforceMemoryLimit(identifier, options);
  }
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "X-RateLimit-Provider": result.provider,
    "X-RateLimit-Reason": result.reason,
    ...(result.retryAfterSeconds > 0 ? { "Retry-After": String(result.retryAfterSeconds) } : {})
  };
}

export async function verifyDistributedRateLimitProvider() {
  const credentials = getUpstashRedisCredentials();

  if (!credentials) {
    return {
      configured: false,
      verified: false,
      detail: "Upstash Redis runtime credentials are not configured."
    };
  }

  try {
    const response = await new Redis(credentials).ping();

    return {
      configured: true,
      verified: response === "PONG",
      detail:
        response === "PONG"
          ? `Upstash Redis distributed rate-limit storage is reachable through ${credentials.source}.`
          : "Upstash Redis did not return the expected verification response."
    };
  } catch {
    return {
      configured: true,
      verified: false,
      detail: "Upstash Redis distributed rate-limit storage could not be reached."
    };
  }
}
