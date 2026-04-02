import React from "react"
import { motion } from "framer-motion"
import { FcGoogle } from "react-icons/fc"
import { RiRobot3Fill } from "react-icons/ri"
import { WiStars } from "react-icons/wi"
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../Utils/Firebase"

import axios from "axios"
import { serverUrl } from "../App"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

const Auth = ({ isModel = false }) => {

    const dispatch = useDispatch()

    const handleGoogleAuth = async () => {
        try {
            const response = await signInWithPopup(auth, provider);
            const user = response.user;

            if (!user) {
                console.log("Google user not found");
                return;
            }

            const name = user.displayName;
            const email = user.email;
            const uid = user.uid; // 🔥 IMPORTANT

            // (optional but best practice)
            const token = await user.getIdToken();

            const result = await axios.post(
                `${serverUrl}/api/auth/google`,
                { name, email, uid }, // ✅ SEND UID
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`, // ✅ OPTIONAL (secure)
                    },
                }
            );

            dispatch(setUserData(result.data.user));

        } catch (error) {
            dispatch(setUserData(null));
            console.error("Google Auth Error:", error);
        }
    };
    return (

        <div
            className={`w-full flex items-center justify-center px-6 
            ${isModel ? "" : "min-h-screen bg-[#f3f3f3] py-20"}`}
        >

            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md p-8 rounded-3xl bg-white shadow-xl border border-gray-200"
            >

                <div className="flex items-center justify-center gap-3 mb-6">

                    <div className="bg-black text-white p-2 rounded-lg">
                        <RiRobot3Fill size={18} />
                    </div>

                    <h2 className="font-semibold text-lg">
                        Intervia
                    </h2>

                </div>

                <h1 className="text-2xl md:text-3xl font-semibold text-center mb-4">
                    Continue With
                </h1>

                <div className="flex justify-center mb-6">

                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full flex items-center gap-2 text-sm">

                        <WiStars />
                        AI Smart Interview

                    </span>

                </div>

                <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">

                    Sign in to start AI Powered mock interviews,
                    track your progress and unlock detailed
                    performance insights.

                </p>

                <motion.button
                    onClick={handleGoogleAuth}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full shadow-md hover:bg-gray-900 transition w-fit"
                >
                    <FcGoogle size={20} />
                    Continue with Google
                </motion.button>
            </motion.div>

        </div>
    )
}

export default Auth