import express from 'express'
import { confirmPayment, createPayment } from './payment.controller'
import { protect } from '../../../middlewares/auth'



const router = express.Router()

// Create Payment
router.post('/create-payment',protect, createPayment)

// Confirm Payment
router.post('/confirm-payment',protect, confirmPayment)

export default router
