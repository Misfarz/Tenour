import "dotenv/config";

import { createApp } from "./app";
import { prisma } from "../../infrastructure/database/prisma/prisma.client";
import { connectRedis } from "../../infrastructure/redis/redis.client";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");

    await connectRedis();

    console.log("Redis connected successfully");

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`Tenour API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Tenour:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

startServer();