import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type MemoryBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
  provider: "upstash-redis" | "bounded-memory";
};

type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowSeconds: number;
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

function getUpstashLimiter(options: RateLimitOptions) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const key = `${options.namespace}:${options.limit}:${options.windowSeconds}`;
  const existing = upstashLimiters.get(key);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
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
    provider: "bounded-memory"
  };
}

export async function enforceRequestRateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const identifier = requestFingerprint(request, options.namespace);
  const upstash = getUpstashLimiter(options);

  if (!upstash) {
    return enforceMemoryLimit(identifier, options);
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
      provider: "upstash-redis"
    };
  } catch {
    return enforceMemoryLimit(identifier, options);
  }
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "X-RateLimit-Provider": result.provider,
    ...(result.retryAfterSeconds > 0 ? { "Retry-After": String(result.retryAfterSeconds) } : {})
  };
}

export async function verifyDistributedRateLimitProvider() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      configured: false,
      verified: false,
      detail: "Upstash Redis runtime credentials are not configured."
    };
  }

  try {
    const response = await Redis.fromEnv().ping();

    return {
      configured: true,
      verified: response === "PONG",
      detail:
        response === "PONG"
          ? "Upstash Redis distributed rate-limit storage is reachable."
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
