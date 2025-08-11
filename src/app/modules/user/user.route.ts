import express from 'express'
import { protect } from '../../../middlewares/auth'
import { adminDashboard, getHomeAudios, getSingleUser, getUsers, updateProfile } from './user.controller'

const router = express.Router()

router.patch('/update-profile',protect, updateProfile)
router.get('/single-user',protect, getSingleUser)
// router.get("/get-notfication", protect, getAllNotification)
// router.get('/mark-as-read', protect, markAllAsRead)

router.get("/get-all-user",protect, getUsers)
router.get('/home-audios', getHomeAudios);

router.get("/dashboard",adminDashboard)

export default router
