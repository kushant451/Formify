import rateLimit from "express-rate-limit";
import { AuthRequest } from "./auth";

// Per-IP limiter — protects the server from anonymous abuse
export const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests from this IP, try again later." },
});

const userHits = new Map<string, { count: number; resetAt: number }>();

export const perUserLimiter = (maxPerWindow = 10, windowMs = 15 * 60 * 1000) => {
  return (req: AuthRequest, res: any, next: any) => {
    const userId = req.userId;
    if (!userId) return next();

    const now = Date.now();
    const entry = userHits.get(userId);

    if (!entry || now > entry.resetAt) {
      userHits.set(userId, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxPerWindow) {
      return res.status(429).json({
        success: false,
        message: "You're generating too fast. Please slow down.",
      });
    }

    entry.count += 1;
    next();
  };
};
