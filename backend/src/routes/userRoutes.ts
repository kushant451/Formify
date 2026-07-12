import express from "express";
import { authMiddleware } from "../middleware/auth";
import { updateProfile } from "../controllers/userController";

const router = express.Router();

router.patch("/profile", authMiddleware, updateProfile);

export default router;
