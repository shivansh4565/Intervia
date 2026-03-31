    import express from "express";
    import isAuth from "../middlewares/isAuth.js";
    import {
        createOrder,
        verifyPayment,
    } from "../controllers/payment.controller.js";

    const paymentRouter = express.Router();

    // Create Razorpay order
    paymentRouter.post("/order", isAuth, createOrder);

    // Verify payment
    paymentRouter.post("/verify", isAuth, verifyPayment);

    export default paymentRouter;