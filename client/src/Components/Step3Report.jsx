import React from 'react'
import axios from "axios";
import { auth } from "../Utils/Firebase";
import { serverUrl } from "../App";
import { useParams } from "react-router-dom";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaArrowLeft } from "react-icons/fa6"
import { useEffect } from "react";
import { motion } from 'framer-motion'
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Area} from "recharts"
import { useNavigate } from 'react-router-dom';
import { useCallback } from "react";

function Step3Report({ report }) {
  const { id: interviewId } = useParams();

  const generateReportFromAnswers = (answers = []) => {
    const questionWiseScore = answers.map((a) => {
      let score = 0;

      if (a.answer?.length > 20) score += 4;
      if (a.answer?.includes("example") || a.answer?.includes("because")) score += 3;
      if (a.answer?.length > 80) score += 3;

      return {
        question: a.question,
        score: Math.min(score, 10),
        feedback: score > 6 ? "Good answer" : "Needs improvement",
      };
    });

    const avg =
      questionWiseScore.reduce((acc, q) => acc + q.score, 0) /
      (questionWiseScore.length || 1);

    return {
      finalScore: Number(avg.toFixed(1)),
      confidence: Math.min(avg + 1, 10),
      communication: avg,
      correctness: Math.max(avg - 1, 0),
      questionWiseScore,
    };
  };
 
  const navigate= useNavigate();
  const finalReport = report?.questionWiseScore
    ? report
    : generateReportFromAnswers(report?.answers);

  const {
    finalScore,
    confidence,
    communication,
    correctness,
    questionWiseScore
  } = finalReport;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q ${index + 1}`,
    score: score.score || 0,
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }
  const score = finalScore;
  const percentage = (score / 10) * 100;
 
 
  const downloadPDF = useCallback(() => {
  
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    // ================= TITLE =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);

    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 5;

    // underline
    doc.setDrawColor(34, 197, 94);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;

    // ================= FINAL SCORE BOX =================
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    doc.text(
      `Final Score: ${finalScore}/10`,
      pageWidth / 2,
      currentY + 12,
      { align: "center" }
    );

    currentY += 30;

    // ================= SKILLS BOX =================
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

    doc.setFontSize(12);

    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45;

    // ================= ADVICE =================
    let advice = "";

    if (finalScore >= 8) {
      advice =
        "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
    } else if (finalScore >= 5) {
      advice =
        "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting points.";
    } else {
      advice =
        "Significant improvement needed. Focus on clarity, communication, and confidence. Practice answering questions with structured responses.";
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Professional Advice", margin + 10, currentY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
    doc.text(splitAdvice, margin + 10, currentY + 20);

    currentY += 50;

    // ================= QUESTION TABLE =================
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback,
      ]),
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: "auto" },
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save("AI_Interview_Report.pdf");
  }, [finalScore, confidence, communication, correctness, questionWiseScore]);
  useEffect(() => {
    const handleFinishAndDownload = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        // 🔥 1. SAVE FINAL SCORE
        await axios.post(
          `${serverUrl}/api/interview/finish`,
          { interviewId },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log("✅ Interview saved in DB");

        // 🔥 2. THEN DOWNLOAD PDF
        setTimeout(() => {
          downloadPDF();
        }, 200);

      } catch (err) {
        console.log("❌ Error saving interview:", err);
      }
    };

    if (interviewId) {
      handleFinishAndDownload();
    }

  }, [interviewId, downloadPDF]);
  if (!finalReport) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <p className='text-gray-500 text-lg'>Loading Report....</p>
      </div>
    );
  }
  
 
  return (

    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 px-4 sm:px-6 lg:px-10 py-8'>

      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

        {/* LEFT */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/history")}
            className="p-3 rounded-full bg-white shadow hover:shadow-md transition"
            >
            <FaArrowLeft className="text-gray-600" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Interview Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              AI Powered Performance Insights
            </p>
          </div>
        </div>

        {/* RIGHT BUTTON */}
        <button 
        onClick={downloadPDF}
        className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base w-full sm:w-auto'>
          Download PDF
        </button>

      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center'>
            <h3 className=' text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base'>Overall Performance</h3>
            <div className='relative w-20 h-20 sm:w-25 sm:h-25 mx-auto'>
              <CircularProgressbar
                value={percentage}
                // Displaying actual seconds left is more helpful for the user
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "18px",
                  pathColor: "#10b981", // Turns red when low
                  textColor: "#ef4444",
                  trailColor: "#e5e7eb",
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            <div className="mt-4">
              <p className='font-semibold text-gray-800 text-sm sm:text-base'>{performanceText}</p>
              <p className='text-gray-500 text-xs sm:text-sm mt-1'>{shortTagline}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8'>
            <h3 className='text-base  sm:text-lg font-semibold text-gray-700 mb-6'>Skill Evaluation</h3>
            <div className="space-y-5">
              {
                skills.map((s,i)=>(
                  <div key={i}>
                    <div className="flex justify-between mb-2 text-sm sm:text-base">
                      <span>{s.label}</span>
                      <span className='font-semibold  text-green-700'>{s.value}</span>
                    </div>
                    <div className="bg-gray-200 h-2 sm:h-3 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" 
                      style={{width:`${s.value*10}%`}}></div>
                    </div>
                  </div>
                ))
              }
            </div>
          </motion.div>

        </div>
        <div className='lg:col-span-2 space-y-6'>
          <motion.div 
          className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
            <h3 className=' text-gray-700 mb-4 sm:mb-6 font-semibold text-base sm:text-lg'> Performance Trend</h3>
            <div className="h-64  sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
<AreaChart data={questionScoreData}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="name"/>
<YAxis domain={[0,10]}/>
<Tooltip/>
<Area type="monotone"
 dataKey="score"
 stroke='#22c55e'
 fill='#bbf7d0'
 strokeWidth={3}/>
</AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8'>
<h3 className='text-base sm:text-lg font-semibold text-gray-700 mb-6'>
  Question Breakdown
</h3>
<div className="space-y-6">
              {(questionWiseScore || []).map((q,i)=>(
    <div key={i} className=' bg-gray-50 sm:p-6 p-4 rounded-xl sm:rounded-2xl border border-gray-200'>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <div>
          <p className='text-xs text-gray-400'>
            Question {i+1}
          </p>
          <p className=' font-semibold text-gray-800 text-sm sm:text-base leading-relaxed'>
            {
              q.question || "Question Not Avalible"
            }
          </p>
        </div>
        <div className="py-1 bg-green-100  text-green-600  px-3  rounded-full font-bold text-xs sm:text-sm w-fit">{q.score||0}/10</div>
      </div>
            
    </div>
  ))}
</div>

          </motion.div>
        </div>
      </div>

    </div>
  )
}

export default Step3Report