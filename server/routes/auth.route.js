import express from "express"
import { googleAuth, logOut } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/isAuth.js" // 👈 check path
const authRouter = express.Router();
authRouter.post("/google",googleAuth)
authRouter.get("/logOut",logOut)
authRouter.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        user: {
            id: req.userId
        }
    })
})
export default authRouter