import { Queue } from "bullmq";

export const connectionOptions = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  maxRetriesPerRequest: null as unknown as number,
};

export const contentQueue = new Queue("content-generation", { connection: connectionOptions });

export const deadLetterQueue = new Queue("content-generation-dlq", { connection: connectionOptions });
