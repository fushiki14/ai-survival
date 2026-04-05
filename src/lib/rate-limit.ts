import { redis } from "./redis";

const DAY_SECONDS = 86400;

export async function checkServerRateLimit(
  ip: string,
  maxPerDay: number = 2
): Promise<boolean> {
  const key = `survival:ratelimit:${ip}`;
  const current = await redis.incr(key);

  // 初回アクセス時にTTL設定
  if (current === 1) {
    await redis.expire(key, DAY_SECONDS);
  }

  return current <= maxPerDay;
}
