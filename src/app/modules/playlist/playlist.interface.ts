import { Document, Types } from 'mongoose';
export interface IPlaylist extends Document {
  user: Types.ObjectId
  audio: Types.ObjectId[]
}

