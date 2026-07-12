import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  plan: "free" | "pro" | "agency";
  credits: number;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: { type: String, required: true, minlength: 6 },
    plan: { type: String, enum: ["free", "pro", "agency"], default: "free" },
    credits: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
