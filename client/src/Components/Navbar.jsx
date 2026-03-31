import { getAuth } from "firebase/auth"
import { useDispatch, useSelector } from "react-redux"
import { motion as Motion } from "framer-motion"
import { FaLaptop, FaUserAstronaut } from "react-icons/fa6"
import { HiOutlineLogout } from "react-icons/hi"
import { BsCoin } from "react-icons/bs"
import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

import { setUserData } from "../redux/userSlice"
import Authmodel from "./Authmodel"
import { signOut } from "firebase/auth"
import { serverUrl } from "../App"

function Navbar() {
    const { userData } = useSelector((state) => state.user)

    const [showAuth, setShowAuth] = useState(false)
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    // ✅ Fetch user (works after login too)
    const fetchUser = useCallback(async () => {
        try {
            const auth = getAuth()
            const firebaseUser = auth.currentUser

            if (!firebaseUser) {
                dispatch(setUserData(null))
                return
            }

            const token = await firebaseUser.getIdToken()

            const res = await axios.get(
                `${serverUrl}/api/user/current-user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            dispatch(setUserData(res.data))

        } catch (err) {
            console.log("User fetch error:", err.response?.data || err.message)
        }
    }, [dispatch])

   
    // ✅ IMPORTANT: re-fetch when modal closes (login happened)
    useEffect(() => {
        if (!showAuth) {
            fetchUser()
        }
    }, [showAuth])

    // ✅ Close popups
    useEffect(() => {
        const handleClick = () => {
            setShowCreditPopup(false)
            setShowUserPopup(false)
        }

        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [])

    const handleLogout = async () => {
        try {

            const auth = getAuth()
            await signOut(auth)




            dispatch(setUserData(null))
            navigate("/")
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
            <Motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-6xl bg-white rounded-[25px] shadow-sm border px-8 py-2 flex justify-between items-center"
            >
                {/* Logo */}
                <div
                    onClick={() => navigate("/")}
                    className="flex items-center gap-3 cursor-pointer"
                >
                    <div className="bg-black text-white p-2 rounded-lg">
                        <FaLaptop />
                    </div>
                    <h1 className="font-semibold text-lg">
                        Intervia
                    </h1>
                </div>

                <div className="flex items-center gap-6 relative">
                    {/* Credits */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!userData) return setShowAuth(true)

                                setShowCreditPopup(!showCreditPopup)
                                setShowUserPopup(false)
                            }}
                            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200"
                        >
                            <BsCoin />
                            {userData?.credits ?? 0}
                        </button>

                        {showCreditPopup && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute -right-10 mt-3 w-64 bg-white shadow-lg border rounded-xl p-4 z-50"
                            >
                                <p className="text-sm text-gray-600 mb-3">
                                    Need more credits?
                                </p>
                                <button
                                    onClick={() => navigate("/pricing")}
                                    className="w-full bg-black text-white py-2 rounded-lg"
                                >
                                    Buy Credits
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!userData) return setShowAuth(true)

                                setShowUserPopup(!showUserPopup)
                                setShowCreditPopup(false)
                            }}
                            className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center"
                        >
                            {userData
                                ? userData.name?.charAt(0).toUpperCase()
                                : <FaUserAstronaut />
                            }
                        </button>

                        {showUserPopup && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-md shadow-xl border border-gray-100 rounded-2xl p-4 z-50 animate-fadeIn"
                            >
                                {/* User Name */}
                                <p className="text-blue-600 font-semibold mb-3 border-b border-gray-200 pb-2 truncate">
                                    {userData?.name}
                                </p>

                                {/* Menu Items */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => navigate("/history")}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                    >
                                        📜 Interview History
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                    >
                                        <HiOutlineLogout className="text-lg" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Motion.div>

            {showAuth && (
                <Authmodel onClose={() => setShowAuth(false)} />
            )}
        </div>
    )
}

export default Navbar