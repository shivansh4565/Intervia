


import React, { useCallback, useEffect, useRef, useState } from 'react'
import maleVideo from "../assets/Videos/male-ai.mp4"
import femaleVideo from "../assets/Videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from "framer-motion"
import axios from "axios"
import { serverUrl } from '../App'
import { auth } from "../Utils/Firebase";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaMicrophoneSlash, FaStar } from "react-icons/fa";

function Step2Interview({ interviewData, onFinish }) {
  const navigate = useNavigate();
  const { questions = [], userName = "There" } = interviewData || {}
  const { interviewId } = interviewData || {}
  const [answers, setAnswers] = useState([])
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const recognitionRef = useRef(null)
  const [isAIPlaying, setIsAIPlaying] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")

  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voiceGender, setVoiceGender] = useState("female")
  const [subtitle, setSubtitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef(null)
  const isRecordingRef = useRef(false)   // fix: ref to track real recording state inside callbacks
  const currentQuestion = questions[currentIndex];

  // VIDEO LOOPING
  useEffect(() => {
    if (videoRef.current) {
      if (isAIPlaying) {
        videoRef.current.loop = true;
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.loop = false;
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isAIPlaying]);

  // fix: handleSubmit defined with useCallback before it's used in the timer useEffect
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!interviewId) {
      setIsSubmitting(false);
      return;
    }

    if (isRecordingRef.current && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
    }

    try {
      const newEntry = {
        question:
          typeof currentQuestion === "string"
            ? currentQuestion
            : currentQuestion?.question,
        answer: answer,
      };
      const user = auth.currentUser;

      if (!user) {
        setIsSubmitting(false);
        return;
      }
      const token = await user.getIdToken();
      // 🔥 SAVE ANSWER
      await axios.post(
        `${serverUrl}/api/interview/submit-answer`,
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion?.timeLimit - timeLeft
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedAnswers = [...answers, newEntry];

      const isLastQuestion = currentIndex === questions.length - 1;

      if (!isLastQuestion) {
        setAnswers(updatedAnswers);
        setCurrentIndex((prev) => prev + 1);
        setAnswer("");
        setIsSubmitting(false);
        return;
      }

      // ✅ ONLY LAST QUESTION
      await axios.post(
        `${serverUrl}/api/interview/finish`,
        { interviewId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/report/${interviewId}`);

    
      // ✅ REDIRECT TO REPORT PAGE
      navigate(`/report/${interviewId}`);

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    currentIndex,
    questions.length,
    onFinish,
    feedback,
    rating,
    answer,
    answers,
    currentQuestion,
    interviewId,
    timeLeft,
    
  ]);


  // fix: added currentQuestion and handleSubmit to deps
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, currentQuestion, handleSubmit]);

  useEffect(() => {
    if (currentQuestion?.timeLimit) {
      setTimeLeft(currentQuestion.timeLimit);
    } else {
      setTimeLeft(60);
    }
  }, [currentIndex, currentQuestion]);

  // fix: speech recognition with proper mic toggle using ref
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.onerror = (e) => {
      if (e.error !== "aborted") console.error("STT error:", e.error);
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    // fix: auto-restart so continuous mode survives browser cut-offs
    recognition.onend = () => {
      if (isRecordingRef.current) {
        try { recognition.start(); } catch {
          console.log("error at step 2 of")
        }
      }
    };

    recognitionRef.current = recognition;
  }, []);

  // fix: toggleMic now correctly sets isRecording to false on stop, and uses ref
  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isRecordingRef.current) {
      recognitionRef.current.stop();
      isRecordingRef.current = false;
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        isRecordingRef.current = true;
        setIsRecording(true);
      } catch (e) {
        if (e.name !== "InvalidStateError") console.error(e);
      }
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const femaleVoice = voices.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha"));
      const maleVoice = voices.find(v => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("mark"));

      if (femaleVoice) { setSelectedVoice(femaleVoice); setVoiceGender("female"); }
      else if (maleVoice) { setSelectedVoice(maleVoice); setVoiceGender("male"); }
      else { setSelectedVoice(voices[0]); setVoiceGender("female"); }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // fix: wrapped in useCallback so it's stable for useEffect deps
  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice || !text) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 1.05;
      utterance.onstart = () => { setIsAIPlaying(true); setSubtitle(text); };
      utterance.onend = () => { setIsAIPlaying(false); setSubtitle(""); resolve(); };
      utterance.onerror = () => { setIsAIPlaying(false); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice]);

  // fix: added all missing deps — currentQuestion, questions.length, speakText, userName
  useEffect(() => {
    if (!selectedVoice || !questions.length) return;
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`);
        await speakText("I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.");
        setTimeout(() => setIsIntroPhase(false), 100);
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }
        await speakText(typeof currentQuestion === "string" ? currentQuestion : currentQuestion?.question);
      }
    }
    runIntro()
  }, [selectedVoice, isIntroPhase, currentIndex, currentQuestion, questions.length, speakText, userName])

  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100  flex items-center justify-center p-4 sm:p-6'>
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 border-r border-gray-200">
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
            <video className='w-full h-auto object-cover' muted playsInline preload='auto' src={videoSource} key={videoSource} ref={videoRef} />
          </div>

          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}

          <div className="mt-10 w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className=' text-sm text-gray-500'>Interview Status</span>
              {isAIPlaying && <span className='text-sm font-semibold text-emerald-600'> AI Speaking</span>}
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
                <span className='text-xs text-gray-400'>Current Question</span>
              </div>
              <div>
                <span className='text-2x font-bold text-emerald-600'>{questions?.length}</span>
                <span className='text-xs text-gray-400'>Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-700 mb-6'> AI Smart Interview</h2>
          <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>Question {currentIndex + 1} of {questions?.length}</p>
            <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
              {typeof currentQuestion === "string" ? currentQuestion : currentQuestion?.question}
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Speak or Type Your Answer Here!"
              className="w-full h-90 mt-4 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
            />
            {currentIndex === questions.length - 1 && (
              <div className="mt-6 p-5 bg-white rounded-2xl border border-gray-200 shadow-md">

                <h3 className="font-semibold text-gray-700 mb-3 text-lg">
                  Feedback
                </h3>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full p-4 border border-gray-200 rounded-xl mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      onClick={() => setRating(star)}
                      className={`cursor-pointer text-xl transition ${rating >= star
                        ? "text-yellow-400 scale-110"
                        : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Tap stars to rate your experience
                </p>

              </div>

            )}
            <div className="flex items-center gap-4 mt-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMic}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg ${isRecording ? "bg-red-500" : "bg-black"} text-white`}>
                {isRecording ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit}
                disabled={isSubmitting}
                className='flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-2 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:opacity-50'>
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Step2Interview;
