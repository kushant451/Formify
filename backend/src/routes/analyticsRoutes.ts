import express from "express";
import { authMiddleware } from "../middleware/auth";
import { getAnalytics } from "../controllers/analyticsController";

const router = express.Router();

router.get("/", authMiddleware, getAnalytics);

export default router;
