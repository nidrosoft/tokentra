import { NextRequest } from "next/server";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 60 * 1000
): Promise<RateLimitResult> {
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "anonymous";
  
  const key = `rate-limit:${ip}`;
  const now = Date.now();
  
  let record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    rateLimitStore.set(key, record);
  }
  
  record.count++;
  
  const remaining = Math.max(0, limit - record.count);
  const reset = Math.ceil((record.resetAt - now) / 1000);
  
  return {
    success: record.count <= limit,
    limit,
    remaining,
    reset,
  };
}

// TODO: Replace with Upstash Redis for production
// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
// 
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });
// 
// const ratelimit = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(100, "1 m"),
// });
