import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();

const getRedisData = async (key: string) => {
  const data = await redisClient.get(key);
  return JSON.parse(data as string);
};

const setRedisData = async <T>(key: string, data: T, ttl: number = 10) => {
  await redisClient.set(key, JSON.stringify(data), { EX: ttl, NX: true });
};

const deleteRedisData = async (key: string) => {
  await redisClient.del(key);
};

export { getRedisData, setRedisData, deleteRedisData };
