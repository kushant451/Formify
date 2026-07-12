import { Worker, Job } from "bullmq";
import { connectionOptions, deadLetterQueue } from "../config/queue";
import Content from "../models/Content";
import User from "../models/User";
import {
  generateBlogPost,
  generateLinkedInPost,
  generateTwitterThread,
  generateYouTubeScript,
  generateEmailNewsletter,
} from "./aiService";

const MAX_RETRIES = 3;

const processJob = async (job: Job) => {
  const { contentId, topic, tone, userId } = job.data;

  const blogPost = await generateBlogPost(topic, tone);
  await job.updateProgress(20);

  const linkedInPost = await generateLinkedInPost(topic, tone);
  await job.updateProgress(40);

  const twitterThread = await generateTwitterThread(topic, tone);
  await job.updateProgress(60);

  const youtubeScript = await generateYouTubeScript(topic, tone);
  await job.updateProgress(80);

  const emailNewsletter = await generateEmailNewsletter(topic, tone);
  await job.updateProgress(95);

  await Content.findByIdAndUpdate(contentId, {
    generatedContent: { blogPost, linkedInPost, twitterThread, youtubeScript, emailNewsletter },
    status: "completed",
  });

  await User.findByIdAndUpdate(userId, { $inc: { credits: -1 } });
  await job.updateProgress(100);

  return { success: true, contentId };
};

export const worker = new Worker(
  "content-generation",
  async (job) => {
    try {
      return await processJob(job);
    } catch (err) {
      const attemptsMade = job.attemptsMade + 1;
      console.error(`Job ${job.id} failed (attempt ${attemptsMade}):`, (err as Error).message);

      if (attemptsMade >= MAX_RETRIES) {
        // Retries exhausted — move to dead-letter queue instead of
        // silently marking failed, so it can be inspected/replayed later.
        await deadLetterQueue.add("failed-generation", {
          ...job.data,
          error: (err as Error).message,
          failedAt: new Date().toISOString(),
        });
        await Content.findByIdAndUpdate(job.data.contentId, { status: "failed" });
      }
      throw err;
    }
  },
  {
    connection: connectionOptions,
    concurrency: 2,
  }
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) =>
  console.error(`Job ${job?.id} failed permanently:`, err.message)
);
