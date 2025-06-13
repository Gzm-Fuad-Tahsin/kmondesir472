import { Document, Types } from 'mongoose';

export interface IAudio extends Document {
  title: string;
  subject: string;
  language: string;
  filePath: string;
  coverImage: string;
  listeners: number;
  duration: number;
  description?: string;
  tags?: string[];
  author: string;
  about?: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
