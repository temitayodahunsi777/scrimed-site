type UpstashRedisCredentials = {
  url: string;
  token: string;
  source: "direct-upstash" | "vercel-marketplace";
};

export function getUpstashRedisCredentials(): UpstashRedisCredentials | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      source: "direct-upstash"
    };
  }

  const marketplaceUrl =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ?? process.env.KV_REST_API_URL;
  const marketplaceToken =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (marketplaceUrl && marketplaceToken) {
    return {
      url: marketplaceUrl,
      token: marketplaceToken,
      source: "vercel-marketplace"
    };
  }

  return null;
}

export function isUpstashRedisConfigured() {
  return getUpstashRedisCredentials() !== null;
}
