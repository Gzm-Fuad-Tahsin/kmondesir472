import { Schema, model, Types } from 'mongoose'
import { IPayment } from './payment.interface'

const paymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: Schema.Types.ObjectId, ref: 'Subscription'},
  amount: { type: Number},
  transactionId: { type: String},
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
})

export const Payment = model<IPayment>('Payment', paymentSchema)
