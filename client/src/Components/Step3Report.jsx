import React from 'react'
import axios from "axios";
import { auth } from "../Utils/Firebase";
import { serverUrl } from "../App";
import { useParams } from "react-router-dom";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaArrowLeft } from "react-icons/fa6"
import { useMemo } from "react";
import { motion } from 'framer-motion'
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Area} from "recharts"
import { useNavigate } from 'react-router-dom';
import { useCallback } from "react";
function Step3Report({ report, interviewId: propId }) {

  const { id: paramId } = useParams();

  // ✅ FINAL ID (works for BOTH cases)
  const interviewId = propId || paramId;

  const getSkillLine = (type, score) => {
    if (type === "confidence") {
      if (score >= 8)
        return "The candidate demonstrates strong confidence in presenting ideas with clarity and assurance.";
      if (score >= 5)
        return "The candidate shows moderate confidence but can improve consistency in expressing ideas.";
      return "The candidate lacks confidence and should focus on improving self-assurance while responding.";
    }

    if (type === "communication") {
      if (score >= 8)
        return "The candidate communicates effectively with clear structure and articulation.";
      if (score >= 5)
        return "The candidate demonstrates basic communication skills but can improve clarity and structure.";
      return "The candidate needs to improve communication by organizing thoughts more clearly.";
    }

    if (type === "correctness") {
      if (score >= 8)
        return "The candidate shows strong technical accuracy and a solid understanding of concepts.";
      if (score >= 5)
        return "The candidate demonstrates partial understanding but needs better conceptual clarity.";
      return "The candidate lacks technical accuracy and should strengthen fundamental understanding.";
    }
  };
  const generateReportFromAnswers = (answers = []) => {
    const questionWiseScore = answers.map((a) => {
      let confidence = 0;
      let communication = 0;
      let correctness = 0;

      const text = a.answer?.toLowerCase() || "";

      // =========================
      // CONFIDENCE (length + completeness)
      // =========================
      if (text.length > 30) confidence += 3;
      if (text.length > 80) confidence += 3;
      if (text.length > 150) confidence += 4;

      // =========================
      // COMMUNICATION (clarity + structure)
      // =========================
      if (text.includes("because") || text.includes("therefore")) communication += 3;
      if (text.includes("first") || text.includes("second") || text.includes("finally")) communication += 3;
      if (text.split(".").length > 2) communication += 4;

      // =========================
      // CORRECTNESS (keywords / logic)
      // =========================
      if (text.includes("example")) correctness += 3;
      if (text.includes("solution") || text.includes("approach")) correctness += 3;
      if (text.length > 100) correctness += 4;

      // clamp values
      confidence = Math.min(confidence, 10);
      communication = Math.min(communication, 10);
      correctness = Math.min(correctness, 10);

      const finalScore = Math.round(
        (confidence + communication + correctness) / 3
      );

      // =========================
      // FEEDBACK (professional)
      // =========================
      let feedback = "";

      if (finalScore >= 8) {
        feedback =
          "The response is well-structured, confident, and demonstrates strong conceptual clarity with relevant explanations.";
      } else if (finalScore >= 5) {
        feedback =
          "The answer shows a reasonable understanding, but could benefit from better structure, clarity, and supporting details.";
      } else {
        feedback =
          "The response lacks clarity and depth. Improving structure, confidence, and conceptual understanding is recommended.";
      }

      return {
        question: a.question,
        answer: a.answer,
        confidence,

        communication,
        correctness,
        score: finalScore,
        feedback,
      };
    });

    // =========================
    // FINAL AVERAGES
    // =========================
    const total = questionWiseScore.length || 1;

    const avgConfidence =
      questionWiseScore.reduce((acc, q) => acc + q.confidence, 0) / total;

    const avgCommunication =
      questionWiseScore.reduce((acc, q) => acc + q.communication, 0) / total;

    const avgCorrectness =
      questionWiseScore.reduce((acc, q) => acc + q.correctness, 0) / total;

    const finalScore =
      questionWiseScore.reduce((acc, q) => acc + q.score, 0) / total;

    return {
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
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

  const skills = useMemo(() => [
    {
      name: "Confidence",
      label: getSkillLine("confidence", confidence),
      value: confidence,
    },
    {
      name: "Communication",
      label: getSkillLine("communication", communication),
      value: communication,
    },
    {
      name: "Correctness",
      label: getSkillLine("correctness", correctness),
      value: correctness,
    },
  ], [confidence, communication, correctness]);


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
    if (!questionWiseScore || questionWiseScore.length === 0) {
      alert("Report not ready yet");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 20;

    // ================= TITLE =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);

    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 10;

    doc.setDrawColor(16, 185, 129);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 12;

    // ================= FINAL SCORE =================
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 18, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    doc.text(
      `Final Score: ${finalScore}/10`,
      pageWidth / 2,
      currentY + 11,
      { align: "center" }
    );

    currentY += 25;

    // ================= SKILL EVALUATION =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Skill Evaluation", margin, currentY);

    currentY += 10;

    skills.forEach((s) => {
      // Skill Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${s.name} (${s.value}/10)`, margin, currentY);

      currentY += 6;

      // Skill Description (wrapped)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const splitText = doc.splitTextToSize(s.label, contentWidth);
      doc.text(splitText, margin, currentY);

      currentY += splitText.length * 5 + 5;

      // Page break safety
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
    });

    // ================= ADVICE =================
    let advice = "";

    if (finalScore >= 8) {
      advice =
        "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers.";
    } else if (finalScore >= 5) {
      advice =
        "Good foundation shown. Improve clarity and structure. Practice delivering concise and confident answers.";
    } else {
      advice =
        "Significant improvement required. Focus on clarity, communication, and conceptual understanding.";
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Professional Advice", margin, currentY);

    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const splitAdvice = doc.splitTextToSize(advice, contentWidth);
    doc.text(splitAdvice, margin, currentY);

    currentY += splitAdvice.length * 5 + 10;

    // ================= QUESTION TABLE =================
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        i + 1,
        doc.splitTextToSize(q.question, 50),
        `${q.score}/10`,
        doc.splitTextToSize(q.feedback, 60),
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save("AI_Interview_Report.pdf");
  }, [finalScore, skills, questionWiseScore]);
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
          onClick={async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;

              const token = await user.getIdToken();

              // ✅ STEP 1: Save interview
              await axios.post(
                `${serverUrl}/api/interview/finish`,
                { interviewId },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );

              console.log("✅ Interview saved");

              // ✅ STEP 2: Download PDF
              downloadPDF();

            } catch (err) {
              console.log("❌ Error:", err);
            }
          }}
          className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base w-full sm:w-auto'
        >
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
              <div className="space-y-6">
                {skills.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* TOP SECTION */}
                    <div className="flex justify-between items-start gap-4 mb-3">

                      {/* LABEL */}
                      <div className="flex-1">
                        <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                          Skill Evaluation
                        </p>
                        <p className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed tracking-wide">
                          {s.name}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
                          {s.label}
                        </p>
                      </div>

                      {/* SCORE BADGE */}
                      <div className="min-w-[55px] text-center bg-emerald-100 text-emerald-700 font-bold text-sm px-3 py-1 rounded-full shadow-sm">
                        {s.value}/10
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                        style={{ width: `${s.value * 10}%` }}
                      />
                    </div>

                    {/* OPTIONAL SUBTEXT */}
                    <p className="text-xs text-gray-400 mt-2">
                      Performance based on AI evaluation metrics
                    </p>
                  </div>
                ))}
              </div>
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
              <div className="space-y-6">
                {(questionWiseScore || []).map((q, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 sm:p-6 p-4 rounded-xl sm:rounded-2xl border border-gray-200"
                  >
                    {/* QUESTION */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Question {i + 1}</p>

                        <p className="font-semibold text-gray-800 text-sm sm:text-base leading-relaxed">
                          {q.question || "Question Not Available"}
                        </p>
                      </div>

                      <div className="py-1 bg-green-100 text-green-600 px-3 rounded-full font-bold text-xs sm:text-sm w-fit">
                        {q.score || 0}/10
                      </div>
                    </div>

                    {/* ✅ ANSWER */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Your Answer</p>
                      <p className="text-gray-700 text-sm leading-relaxed bg-white p-3 rounded-lg border">
                        {q.answer || "No answer submitted"}
                      </p>
                    </div>

                    {/* ✅ FEEDBACK */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">AI Feedback</p>
                      <p className="text-sm text-gray-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        {q.feedback || "No feedback available"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
</div>

          </motion.div>
        </div>
      </div>

    </div>
  )
}

export default Step3Report