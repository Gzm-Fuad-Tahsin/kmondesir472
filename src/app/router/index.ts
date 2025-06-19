import express from "express";
import audioRoute from "../modules/audio/audio.route"
import authRoute from "../modules/auth/auth.route"
// import userRoute from "../modules/user/user.route"
import categoryRoute from "../modules/category/category.route"
import subscriptionRoute from "../modules/subscription/subscription.route"
import paymentRoute from "../modules/payment/payment.route"
import playlistRoute from "../modules/playlist/playlist.route"


const router = express.Router();

// Mounting the routes
router.use("/auth", authRoute);
// router.use("/user", userRoute);
// router.use("/seller", sellerRoute);
router.use("/playlist", playlistRoute);
router.use("/subscription", subscriptionRoute);
router.use("/category", categoryRoute);
router.use("/payment",paymentRoute)
router.use("/audio", audioRoute);

export default router;
