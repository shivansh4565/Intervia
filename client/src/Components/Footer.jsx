import React from "react";
import { BsRobot } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

function Footer() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#f3f3f3] flex justify-center px-4 py-10">
            <div className="w-full max-w-6xl bg-white `rounded-3xl` shadow-sm px-8 py-10 text-center">

                {/* Logo */}
                <div
                    onClick={() => navigate("/")}
                    className="flex justify-center items-center gap-3 mb-4 cursor-pointer group"
                >
                    <div className="bg-black text-white p-2 rounded-lg group-hover:scale-105 transition">
                        <BsRobot size={18} />
                    </div>
                    <h2 className="font-semibold text-lg group-hover:text-gray-700 transition">
                        Intervia
                    </h2>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
                    Intervia helps you prepare for interviews with AI-powered technical and
                    HR simulations, confidence analysis, and structured feedback.
                </p>

                {/* Divider */}
                <div className="border-t border-gray-200 my-8"></div>

                {/* Bottom */}
                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} Intervia. All rights reserved.
                </p>

            </div>
        </div>
    );
}

export default Footer;