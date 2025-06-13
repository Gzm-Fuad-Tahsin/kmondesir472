import { Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  about?: string;
  image?: string;
  slug?: string;
  createdAt: Date;
  updatedAt: Date;
}