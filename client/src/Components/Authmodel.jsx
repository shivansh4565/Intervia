import React, { useEffect } from "react"

import { useSelector } from "react-redux"
import { motion } from "framer-motion"

import Auth from "../Pages/Auth"

function Authmodel({ onClose }) {
  const { userData } = useSelector((state) => state.user)

  useEffect(() => {
    if (userData) onClose()
  }, [userData, onClose])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md"
      >
   

        {/* Auth already has card → no wrapper */}
        <Auth isModel={true} />
      </motion.div>
    </div>
  )
}

export default Authmodel