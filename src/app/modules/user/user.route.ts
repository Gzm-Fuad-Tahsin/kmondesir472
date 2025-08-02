import express from 'express'
import { protect } from '../../../middlewares/auth'
import { getSingleUser, getUsers, updateProfile } from './user.controller'

const router = express.Router()

router.patch('/update-profile',protect, updateProfile)
router.get('/single-user/:id',protect, getSingleUser)
// router.get("/get-notfication", protect, getAllNotification)
// router.get('/mark-as-read', protect, markAllAsRead)

router.get("/get-all-user",protect, getUsers)

export default router
