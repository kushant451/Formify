import express from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";
import Content from "../models/Content";

const router = express.Router();

const authViaQueryToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.query.token as string;
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

router.get("/:contentId", authViaQueryToken, async (req: AuthRequest, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { contentId } = req.params;

  const interval = setInterval(async () => {
    const content = await Content.findById(contentId);
    if (!content) {
      clearInterval(interval);
      return res.end();
    }

    res.write(`data: ${JSON.stringify({ status: content.status, content: content.generatedContent })}\n\n`);

    if (content.status === "completed" || content.status === "failed") {
      clearInterval(interval);
      res.end();
    }
  }, 1500);

  req.on("close", () => clearInterval(interval));
});

export default router;
