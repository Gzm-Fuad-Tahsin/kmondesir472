import mongoose, { Schema, model } from 'mongoose'
import { ISubscription } from './subscription.interface'

const subscriptionSchema = new Schema<ISubscription>({
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  planValid: { type: Boolean, default: true  },
  feature: [{ type: String }],
})

export const Subscription = model<ISubscription>(
  'Subscription',
  subscriptionSchema
)
