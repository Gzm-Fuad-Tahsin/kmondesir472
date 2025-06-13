import express from 'express'
import { createSubscription, deleteSubscription, getAllSubscriptions, getSingleSubscription, updateSubscription } from './subscription.controller'


const router = express.Router()

router.post('/subscriptions', createSubscription)
router.patch('/subscriptions/:id', updateSubscription)
router.get('/subscriptions', getAllSubscriptions)
router.get('/subscriptions/:id', getSingleSubscription)
router.delete('/subscription/:id', deleteSubscription)

export default router
