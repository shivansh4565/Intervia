import User from "../models/user.model.js"

export const getCurrentUser  = async (req,res) => {
try {

    const userId  = req.userId
    let user = await User.findOne({
        $or: [
            { firebaseUid: req.userId },
            { email: req.email }
        ]
    })

    if (!user) {
        user = await User.create({
            firebaseUid: req.userId,
            email: req.email,
            name: req.name || "User",
            credits: 200
        })
    }
    if (!user) {
        return res.status(404).json({ message: "user doesnt have founded" })
    } 
    return res.status(200).json(user)
        
} catch (error) {
    return res.status(404).json({ message:`google auth error ${error}`})
}
}