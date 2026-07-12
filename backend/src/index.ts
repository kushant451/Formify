
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "mongo-sanitize";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import contentRoutes from "./routes/contentRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import streamRoutes from "./routes/streamRoutes";
import userRoutes from "./routes/userRoutes";
import { ipLimiter } from "./middleware/rateLimiter";
import "./utils/queueProcessor";

dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.use((req, _res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
});

app.use(ipLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/user", userRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Formify API is live", version: "1.0.0" });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
