import mongoose from "mongoose";
import { ICategory } from "./category.interface";

const categorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  about: { type: String, default: '' },
  image: { type: String },
  slug: { type: String },
}, { timestamps: true });

export const Category = mongoose.model<ICategory>('category', categorySchema);