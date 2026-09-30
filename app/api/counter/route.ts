import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

const COUNTER_KEY = "niveaudevie:visits";

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ count: null });
  }
  const count = await redis.incr(COUNTER_KEY);
  return NextResponse.json({ count });
}
