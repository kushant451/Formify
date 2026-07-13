import express from "express";
import { authMiddleware } from "../middleware/auth";
import { perUserLimiter } from "../middleware/rateLimiter";
import {
  generateContent,
  getHistory,
  getContentById,
  regenerateSingleFormat,
  updateFormatText,
} from "../controllers/contentController";

const router = express.Router();

router.post("/generate", authMiddleware, perUserLimiter(10, 15 * 60 * 1000), generateContent);
router.get("/history", authMiddleware, getHistory);
router.get("/:id", authMiddleware, getContentById);
router.post("/:id/regenerate", authMiddleware, perUserLimiter(20, 15 * 60 * 1000), regenerateSingleFormat);
router.patch("/:id", authMiddleware, updateFormatText);

export default router;