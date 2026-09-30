import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  // Vercel's "KV" storage product provisions Upstash Redis under these
  // names; UPSTASH_REDIS_REST_* is kept as a fallback for a database
  // created directly on upstash.com instead of via the Vercel Marketplace.
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!client) client = new Redis({ url, token });
  return client;
}
