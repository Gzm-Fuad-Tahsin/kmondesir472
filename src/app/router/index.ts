import express from "express";
import audioRoute from "../modules/audio/audio.route"


const router = express.Router();

// Mounting the routes
// router.use("/auth", authRoute);
// router.use("/user", userRoute);
// router.use("/seller", sellerRoute);
// router.use("/admin", adminRoute);
// router.use("/cart", cartRoute);
// router.use("/order", orderRoute);
// router.use("/payment",paymentRouter)
router.use("/audio", audioRoute);

export default router;
