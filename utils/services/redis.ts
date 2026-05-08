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
