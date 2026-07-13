import express from "express";
import { authMiddleware } from "../middleware/auth";
import { updateProfile, getMe } from "../controllers/userController";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.patch("/profile", authMiddleware, updateProfile);

export default router;