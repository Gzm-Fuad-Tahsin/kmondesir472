import mongoose, { Schema } from "mongoose";
import { IAudio } from "./audio.interface";

const audioSchema = new mongoose.Schema<IAudio>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  language: { type: String, required: true },
  filePath: { type: String, required: true },
  coverImage: { type: String, required: true },
  listeners: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  description: { type: String, default: '' },
  tags: { type: Array, default: [] },
  author: { type: String, required: true },
  about: { type: String, default: '' },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true });

export const Audio = mongoose.model<IAudio>('Audio', audioSchema);