import { Types } from 'mongoose'

export interface IPayment {
  userId: Types.ObjectId
  plan: Types.ObjectId
  amount: number
  status: 'pending' | 'success' | 'failed'
  transactionId: string
}
