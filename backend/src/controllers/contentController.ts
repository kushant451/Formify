import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Content from "../models/Content";
import User from "../models/User";
import { contentQueue } from "../config/queue";
import {
  generateBlogPost,
  generateLinkedInPost,
  generateTwitterThread,
  generateYouTubeScript,
  generateEmailNewsletter,
} from "../utils/aiService";

export const generateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { topic, tone } = req.body;
    const userId = req.userId as string;

    const user = await User.findById(userId);
    if (!user || user.credits <= 0) {
      return res.status(402).json({ success: false, message: "Not enough credits" });
    }

    const content = await Content.create({ user: userId, topic, tone, status: "generating" });

    await contentQueue.add(
      "generate",
      { contentId: content.id, topic, tone, userId },
      { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
    );

    res.status(202).json({ success: true, contentId: content.id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to start generation" });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  const items = await Content.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, items });
};

export const getContentById = async (req: AuthRequest, res: Response) => {
  const item = await Content.findOne({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, item });
};

const FORMAT_MAP: Record<string, { key: string; generator: (topic: string, tone: string) => Promise<string> }> = {
  blogPost: { key: "blogPost", generator: generateBlogPost },
  linkedInPost: { key: "linkedInPost", generator: generateLinkedInPost },
  twitterThread: { key: "twitterThread", generator: generateTwitterThread },
  youtubeScript: { key: "youtubeScript", generator: generateYouTubeScript },
  emailNewsletter: { key: "emailNewsletter", generator: generateEmailNewsletter },
};

// Regenerate a single format (e.g. only the tweet thread) instead of
// re-running all 5 generations. Runs synchronously since it's one
// lightweight AI call — no need to go through the job queue for this.
export const regenerateSingleFormat = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { format } = req.body as { format: keyof typeof FORMAT_MAP };

    if (!FORMAT_MAP[format]) {
      return res.status(400).json({ success: false, message: "Unknown format requested" });
    }

    const content = await Content.findOne({ _id: id, user: req.userId });
    if (!content) return res.status(404).json({ success: false, message: "Content not found" });

    const user = await User.findById(req.userId);
    if (!user || user.credits <= 0) {
      return res.status(402).json({ success: false, message: "Not enough credits to regenerate" });
    }

    const { generator } = FORMAT_MAP[format];
    const newText = await generator(content.topic, content.tone);

    (content.generatedContent as any)[format] = newText;
    await content.save();

    // Regenerating one format costs a fraction of a full generation —
    // charge a smaller partial credit instead of a full credit.
    await User.findByIdAndUpdate(req.userId, { $inc: { credits: -0.2 } });

    res.json({ success: true, format, content: content.generatedContent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to regenerate format" });
  }
};
