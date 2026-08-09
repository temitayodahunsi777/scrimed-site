export type UpstashRedisCredentials = {
  url: string;
  token: string;
  source: "direct-upstash" | "vercel-marketplace";
};

export function getUpstashRedisCredentials(
  env: NodeJS.ProcessEnv = process.env
): UpstashRedisCredentials | null {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      source: "direct-upstash"
    };
  }

  const marketplaceUrl =
    env.UPSTASH_REDIS_REST_KV_REST_API_URL ?? env.KV_REST_API_URL;
  const marketplaceToken =
    env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ?? env.KV_REST_API_TOKEN;

  if (marketplaceUrl && marketplaceToken) {
    return {
      url: marketplaceUrl,
      token: marketplaceToken,
      source: "vercel-marketplace"
    };
  }

  return null;
}

export function isUpstashRedisConfigured(env: NodeJS.ProcessEnv = process.env) {
  return getUpstashRedisCredentials(env) !== null;
}
