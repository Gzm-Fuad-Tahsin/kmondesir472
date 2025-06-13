import express from 'express'
import { protect } from '../../../middlewares/auth'
import { changePassword, forgetPassword, login, logout, refreshToken, register, resetPassword, verifyEmail } from './auth.controller'

const router = express.Router()

router.post('/register', register),
router.post('/login', login),
// router.get("/user-data", protect, UserData)
router.post('/verify', verifyEmail),
router.post('/forget', forgetPassword),
router.post('/reset-password', resetPassword)
router.post('/change-password', protect, changePassword)
router.post('/refresh-token', refreshToken)
router.post ('/logout',protect, logout)


export default router
