import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import feedbackRoute from "./routes/feedback.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();
const PORT = process.env.PORT || 3000;
connectDb();




app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "https://intervia-client.onrender.com",
  credentials: true
}));


app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/interview",interviewRouter)
app.use("/api/payment",paymentRouter)
app.use("/api/feedback", feedbackRoute);

app.listen(PORT, () => {
    console.log(`the server is running on ${PORT}`);
});
