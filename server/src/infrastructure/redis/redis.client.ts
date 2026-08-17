import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: (retries) => {
      if (retries > 1) {
        return new Error("Redis connection failed");
      }
      return 500;
    },
  },
});

redis.on("error", (error) => {
  // Handle redis errors gracefully in background
});

export const connectRedis = async (): Promise<void> => {
  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (error) {
      console.warn("⚠️ Redis connection failed or Redis is not running. Proceeding without Redis.");
    }
  }
};