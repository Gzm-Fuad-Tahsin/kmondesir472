import Stripe from 'stripe'
import catchAsync from '../../utils/catchAsync'
import AppError from '../../errors/AppError'
import { Payment } from './payment.model'
import sendResponse from '../../utils/sendResponse'

//  console.log()
const stripe = new Stripe("sk_test_51RLzmKCctG7Qj84qUuHfTQkx16eK33EzS585wy4jO9k6jwBFne2VlQCuOuH5k56yO4a0kEV0HbMGY2COkCVpge6q00x97HBQk3" as string, {
  apiVersion: '2025-05-28.basil',
})

export const createPayment = catchAsync( async (req, res) => {
  const { userId, subscriptionId, amount } = req.body

  console.log(req.body);

  if (!userId || !amount) {
throw new AppError(400, "All fileds are requied")
  }

  try {
    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects the amount in cents
      currency: 'usd',
      metadata: {
        userId,
        subscriptionId,
      },
    })

    // Save payment record with status 'pending'
    const paymentInfo = new Payment({
      userId,
      subscriptionId,
      amount,
      transactionId: paymentIntent.id,
      status: 'pending',
    })
    await paymentInfo.save()

    // res.status(200).json({
    //   success: true,
    //   clientSecret: paymentIntent.client_secret,
    //   message:
    //     'PaymentIntent created.',
    // })

    sendResponse(res,{
      statusCode: 200,
      success: true,
      message: "payment intent created",
      data: {transactionId: paymentIntent.client_secret}
    
    })
  } catch (error) {
    console.error('Error creating PaymentIntent:', error)
    throw new AppError(500, "Server Error")
  }
})

// Confirm Payment
export const confirmPayment =  catchAsync(async (req, res) => {
  const { paymentIntentId } = req.body

  if (!paymentIntentId) {
    res.status(400).json({ error: 'paymentIntentId is required.' })
    return
  }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    const paymentRecord = await Payment.findOne({ transactionId: paymentIntentId })

    if (!paymentRecord) {
      throw new AppError(404, 'Payment record not found.')
    }

    // const { subscriptionId } = paymentRecord

    if (paymentIntent.status === 'succeeded') {
      await Payment.findOneAndUpdate(
        { transactionId: paymentIntentId },
        { status: 'success' }
      )

      // ✅ Update ticket payment status
    //   await Ticket.findByIdAndUpdate(subscriptionId, { paymentStatus: 'paid' })

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment successful',
        data: { transactionId: paymentIntentId }
      })
    } else {
      await Payment.findOneAndUpdate(
        { transactionId: paymentIntentId },
        { status: 'failed' }
      )

      throw new AppError(400, 'Payment was not successful.')
    }
})

