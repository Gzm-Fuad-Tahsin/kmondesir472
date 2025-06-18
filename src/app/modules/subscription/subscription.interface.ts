import { Document, Types } from 'mongoose';
export interface ISubscription extends Document {
  planName: string
  price: number
  planValid: boolean,
  feature: string[]
}

