import razorpay from "../services/razorpay.services.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto"
import User from "../models/user.model.js";
export const createOrder = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body;

        if (!amount || !credits) {
            return res.status(400).json({ message: "Invalid plan data" });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            userId: req.userId, // ✅ USE THIS
            planId,
            amount,
            credits,
            razorpayOrderId: order.id,
            status: "created",
        });

        return res.json(order);

    } catch (error) {
        console.error("Create Order Error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // 🔐 Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // 🔍 Find payment
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // 🛑 Prevent duplicate crediting
        if (payment.status === "paid") {
            return res.json({ message: "Already processed" });
        }


        // 🔍 Try finding user by firebaseUid
        let user = await User.findOne({ firebaseUid: payment.userId });

        // 🔥 FALLBACK (for old users)
        if (!user && req.email) {
            console.log("⚠️ Fallback using email:", req.email);

            user = await User.findOne({ email: req.email });

            if (user) {
                user.firebaseUid = payment.userId;
                await user.save();

                console.log("✅ firebaseUid auto-fixed");
            }
        }

        // ❌ still not found
        if (!user) {
            console.log("❌ User not found:", payment.userId);

            return res.status(404).json({
                message: "User not found",
            });
        }

        // ✅ Update payment FIRST (important for safety)
        payment.status = "paid";
        payment.razorpayPaymentId = razorpay_payment_id;
        await payment.save();

        // 💰 Update credits
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $inc: { credits: payment.credits } },
            { returnDocument: "after" }
        );

        // console.log("✅ Credits added:", payment.credits);

        return res.json({
            success: true,
            message: "Payment verified and credits added",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};