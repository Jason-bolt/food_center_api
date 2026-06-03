import { createClient } from "redis";
import logger from "../logger";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) =>
  logger.error({ err }, "[Redis]: Client error"),
);

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
  logger.info("[Redis]: Connected");
};

export const getRedisData = async (key: string) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const setRedisData = async <T>(
  key: string,
  data: T,
  ttl: number = 60,
): Promise<void> => {
  await redisClient.set(key, JSON.stringify(data), { EX: ttl });
};

export const deleteRedisData = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

// ─── Sorted-set helpers (used by trending) ────────────────────────────────────

/** Increment a sorted-set member's score by `increment`. */
export const zIncrBy = async (
  key: string,
  increment: number,
  member: string,
): Promise<void> => {
  await redisClient.zIncrBy(key, increment, member);
};

/** Expire a key after `ttlSeconds` seconds. */
export const expireKey = async (key: string, ttlSeconds: number): Promise<void> => {
  await redisClient.expire(key, ttlSeconds);
};

/** Return the top `count` members of a sorted set, highest score first. */
export const zTopWithScores = async (
  key: string,
  count: number,
): Promise<{ value: string; score: number }[]> => {
  return redisClient.zRangeWithScores(key, 0, count - 1, { REV: true });
};

/**
 * Increment a counter key and set it to expire at the next UTC midnight (first
 * increment only — subsequent calls just increment without resetting the TTL).
 * Returns the new count.
 */
export const incrExpireAtMidnight = async (key: string): Promise<number> => {
  const count = await redisClient.incr(key);
  if (count === 1) {
    const now = new Date();
    const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);
    await redisClient.expire(key, ttl);
  }
  return count;
};

/** Deletes all keys matching a glob pattern using SCAN (non-blocking). */
export const deleteRedisByPattern = async (pattern: string): Promise<void> => {
  let count = 0;
  for await (const keys of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    if (keys.length > 0) {
      await redisClient.del(keys);
      count += keys.length;
    }
  }
  if (count > 0) {
    logger.debug({ pattern, count }, "[Redis]: Deleted keys by pattern");
  }
};
