import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { getAuth } from "firebase/auth";


import {
  FaUserTie,
  FaMicrophoneAlt,
  FaChartLine,
  FaBriefcase,
  FaFileUpload,
} from "react-icons/fa";
import { setUserData } from "../redux/userSlice";

function Step1Setup({ onStart }) {
const serverUrl = "https://intervia-ai.onrender.com";
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");

  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const isValid = role.trim() && experience.trim();

  // 👉 Resume Upload
  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    setAnalyzing(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("User not logged in");
        return;
      }

      const token = await user.getIdToken();

      const res = await axios.post(
        `${serverUrl}/api/interview/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ FIX
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = res.data;

      setRole(data.role || "");
      setExperience(data.experience || "");
      setProjects(data.projects || []);
      setSkills(data.skills || []);
      setResumeText(data.resumeText || "");

      setAnalysisDone(true);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Resume upload failed");
    } finally {
      setAnalyzing(false);
    }
  };
  const handleStart = async () => {
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const auth = getAuth();

      // 🔥 wait for user properly
      const user = auth.currentUser;

      if (!user) {
        console.log("❌ No user found");
        setError("User not logged in");
        return;
      }

      const token = await user.getIdToken();
      // console.log("🔥 TOKEN:", token); // 👈 MUST PRINT

      const result = await axios.post(
        serverUrl + "/api/interview/generate-questions",
        { role, experience, mode, resumeText, projects, skills },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );



      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.creditsLeft,
          })
        );
      }

      onStart(result.data);

    } catch (err) {
      console.error("API ERROR:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to start interview"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4"
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">

        {/* LEFT PANEL */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Start Your AI Interview
          </h2>

          <p className="text-gray-600 mb-10">
            Practice real-life interview scenarios powered by AI.
          </p>

          <div className="space-y-5">
            {[
              { icon: <FaUserTie />, text: "Choose Role & Experience" },
              { icon: <FaMicrophoneAlt />, text: "Smart Voice Interview" },
              { icon: <FaChartLine />, text: "Performance Analytics" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.15 }}
                whileHover={{ scale: 1.03 }}
                className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-md"
              >
                <span className="text-green-600 text-xl">{item.icon}</span>
                <span className="text-gray-700 font-medium">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="p-12"
        >
          <h2 className="text-3xl font-black text-gray-800 mb-8">
            Interview Setup
          </h2>

          <div className="space-y-6">

            {/* Role */}
            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Role"
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            {/* Experience */}
            <div className="relative">
              <FaBriefcase className="absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                placeholder="Experience (e.g. 2 yrs)"
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            {/* Mode */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-green-500"
            >
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>

            {/* Resume Upload */}
            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() =>
                  document.getElementById("resumeUpload").click()
                }
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50"
              >
                <FaFileUpload className="text-4xl mx-auto text-green-600 mb-3" />

                <input
                  type="file"
                  id="resumeUpload"
                  className="hidden"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />

                <p className="text-gray-600">
                  {resumeFile
                    ? resumeFile.name
                    : "Click to upload resume (optional)"}
                </p>

                {resumeFile && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    whileHover={{ scale: 1.03 }}
                    disabled={analyzing}
                    className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Analysis Result */}
            {analysisDone && (
              <motion.div className="bg-gray-50 border rounded-xl p-5 space-y-4">
                <h3 className="text-lg font-semibold">
                  Resume Analysis Result
                </h3>

                {projects.length > 0 && (
                  <ul className="list-disc list-inside">
                    {projects.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ✅ ERROR FIX */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Start Button */}
          <motion.button
            onClick={handleStart}
            disabled={!isValid || loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 w-full bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-full text-lg font-semibold"
          >
            {loading ? "Starting..." : "Start Interview 🚀"}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step1Setup;
