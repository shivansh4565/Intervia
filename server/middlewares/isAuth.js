

import admin from "../config/firebaseAdmin.js"

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided",
            })
        }

        const token = authHeader.split(" ")[1]

        const decoded = await admin.auth().verifyIdToken(token)

        req.userId = decoded.uid
        req.email = decoded.email
        req.name = decoded.name

        next()

    } catch (error) {
        console.log("Auth error:", error.message)

        return res.status(401).json({
            message: "Invalid or expired token",
        })
    }
}

export default authMiddleware