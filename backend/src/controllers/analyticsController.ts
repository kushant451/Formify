import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Content from "../models/Content";

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  const total = await Content.countDocuments({ user: userId });
  const completed = await Content.countDocuments({ user: userId, status: "completed" });
  const failed = await Content.countDocuments({ user: userId, status: "failed" });

  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const byDay = await Content.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, total, completed, failed, successRate, byDay });
};
