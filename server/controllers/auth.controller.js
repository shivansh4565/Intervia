import User from "../models/user.model.js";
import genToken from "../config/token.js";

export const googleAuth = async (req, res) => {
    try {
        const { name, email, uid } = req.body;

        if (!email || !uid) {
            return res.status(400).json({
                success: false,
                message: "Email and UID are required"
            });
        }

        // 🔍 First find by email
        let user = await User.findOne({ email });

        if (user) {
            // ✅ FIX: attach firebaseUid to existing user
            if (user) {
                // 🔥 ALWAYS update firebaseUid (force sync)
                user.firebaseUid = uid;
                await user.save();

            }
        } else {
            // ✅ create new user
            user = await User.create({
                name,
                email,
                firebaseUid: uid,
                credits: 100
            });

        }

        const token = genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(200).json({
            success: true,
            message: "Google authentication successful",
            user: safeUser
        });

    } catch (error) {
        console.error("Google Auth Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// ✅ Logout controller (unchanged, already correct)
export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};