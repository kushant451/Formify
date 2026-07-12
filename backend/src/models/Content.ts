import mongoose, { Schema, Document } from "mongoose";

export interface IContent extends Document {
  user: mongoose.Types.ObjectId;
  topic: string;
  tone: "professional" | "casual" | "humorous" | "inspiring";
  generatedContent: {
    blogPost: string;
    linkedInPost: string;
    twitterThread: string;
    youtubeScript: string;
    emailNewsletter: string;
  };
  status: "generating" | "completed" | "failed";
  retryCount: number;
}

const contentSchema = new Schema<IContent>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true, trim: true },
    tone: {
      type: String,
      enum: ["professional", "casual", "humorous", "inspiring"],
      default: "professional",
    },
    generatedContent: {
      blogPost: { type: String, default: "" },
      linkedInPost: { type: String, default: "" },
      twitterThread: { type: String, default: "" },
      youtubeScript: { type: String, default: "" },
      emailNewsletter: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["generating", "completed", "failed"],
      default: "generating",
    },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IContent>("Content", contentSchema);
