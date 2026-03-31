import React, { useState } from 'react'
import Navbar from '../Components/Navbar'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { BsBarChart, BsFileEarmarkText, BsCodeSlash, BsAward, BsFilePdf, BsGraphUp , BsClock, BsMic, BsRobot } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi';
import { Navigate, useNavigate } from 'react-router-dom';
import evalImg from "../assets/ai-ans.png"
import confidenceImg from "../assets/confi.png"
import hrImg from "../assets/HR.png"
import techImg from "../assets/tech.png"
import creditImg from "../assets/credit.png"
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png"
import analyticsImg from "../assets/history.png"
import Footer from "../Components/Footer"
import Authmodel from '../Components/Authmodel';
const Home = () => {
  const features = [
    {
      image: evalImg,
      icon: <BsBarChart size={20} />,
      title: "AI Answer Evaluation",
      desc: "Scores communication, technical accuracy and confidence."
    },
    {
      image: resumeImg,
      icon: <BsFileEarmarkText size={20} />,
      title: "Resume Based Interview",
      desc: "Project-specific questions based on uploaded resume."
    },
    {
      image: confidenceImg,
      icon: <BsMic size={20} />,
      title: "Confidence Analysis",
      desc: "AI analyzes tone, clarity and speaking confidence."
    },
    {
      image: hrImg,
      icon: <BsRobot size={20} />,
      title: "HR Interview Simulation",
      desc: "Practice common HR questions with AI feedback."
    },
    {
      image: techImg,
      icon: <BsCodeSlash size={20} />,
      title: "Technical Interviews",
      desc: "Role-specific technical questions for real preparation."
    },
    {
      image: creditImg,
      icon: <BsAward size={20} />,
      title: "Performance Scoring",
      desc: "Detailed AI scoring after every interview session."
    },
    {
      image: pdfImg,
      icon: <BsFilePdf size={20} />,
      title: "PDF Report",
      desc: "Download interview feedback and analysis as a PDF."
    },
    {
      image: analyticsImg,
      icon: <BsGraphUp size={20} />,
      title: "Interview Analytics",
      desc: "Track progress and performance over multiple interviews."
    }
  ];
  const Models = [
    {
      img: hrImg,
      title: "HR Interview Mode",
      desc: "Behavioral and communication based evaluation."
    },
    {
      img: techImg,
      title: "Technical Mode",
      desc: "Deep technical questioning based on selected role."
    },
    {
      img: confidenceImg,
      title: "Confidence Detection",
      desc: "Basic tone and voice analysis inside responses."
    },
    {
      img: creditImg,
      title: "Credits System",
      desc: "Track and manage user credits for interview sessions."
    }
  ];

  const steps = [
    {
      icon: <BsRobot size={24} />,
      step: "STEP 1",
      title: "Role & Experience Selection",
      desc: "AI adjusts difficulty based on selected job role."
    },
    {
      icon: <BsMic size={24} />,
      step: "STEP 2",
      title: "Smart Voice Interview",
      desc: "Dynamic follow-up questions based on your answers."
    },
    {
      icon: <BsClock size={24} />,
      step: "STEP 3",
      title: "Timer Based Simulation",
      desc: "Real interview pressure with time tracking."
    }
  ];

  const { userData } = useSelector((state) => state.user)
    const [showAuth, setShowAuth] = useState(false)
    const navigate = useNavigate();
  const text = "Practice Interviews With"
  const aiText = "AI Intelligence"

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const letter = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col'>
      <Navbar />

      <div className='flex-1 px-6 py-20'>
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2">
            <HiSparkles size={18} className='bg-green-50 text-green-600' />
            AI Powered Smart Interview Platform.
          </div>
        </div>

        <div className="mb-28 text-center">
          <motion.h1
            variants={container}
            initial="hidden"
            animate="visible"
            className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto'
            >

            {text.split("").map((char, index) => (
              <motion.span key={index} variants={letter}>
                {char}
              </motion.span>
            ))}

            <span className='relative inline-block ml-3'>
              <span className='bg-green-100 text-green-600 px-5 py-1 rounded-full'>

                {aiText.split("").map((char, index) => (
                  <motion.span key={index} variants={letter}>
                    {char}
                  </motion.span>
                ))}

              </span>
            </span>

          </motion.h1>
          <motion.p 
             initial = {{opacity:0 
              ,x:-40
            }}
            animate = {{opacity:1,x:0}}
            transition={{duration:1.2}}
            className=' text-gray-500 mt-6 max-w-2xl mx-auto text-lg'>
              Role Based Mock Interviews With Smart Follow-Ups, Adaptive Difficulty & Real Time Performance Evaluation
          </motion.p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <motion.button 
                onClick={() => {
                  if (!userData) return setShowAuth(true)   // 👈 EXACT NAVBAR STYLE

                  navigate("/interview") // or /history
                }}
            whileHover={{opacity:0.9, scale:1.03,y:-6}}
            whileTap={{opacity:1,scale:0.99 ,y:0}}
            transition={{ duration:0.3}}
            className="bg-black text-white px-10 py-3 rounded-full hover:bg-white hover:text-black opacity-90 transition shadow-md">
                Start Your AI Interview
            </motion.button>  


            <motion.button
                onClick={() => {
                  if (!userData) return setShowAuth(true)   // 👈 EXACT NAVBAR STYLE

                  navigate("/history") // or /history
                }}
              whileHover={{ opacity: 0.95, scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.97, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className='border border-gray-300 px-10 py-3  rounded-full hover:bg-black hover:text-white transition shadow-md'>
             Show History
            </motion.button>
          </div>
        </div>
  
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 mb-28">
          {steps.map((item, index) => (
            <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 + index * 0.2 }}
            whileHover={{ rotate: 0, scale: 1.06 }}
            className={`relative bg-white rounded-3xl border-2 border-green-100 
              hover:border-green-500 p-10 w-80 max-w-[90%] shadow-md 
              hover:shadow-2xl transition-all duration-300
              ${index === 0 ? "rotate-[-4deg]" : ""}
    ${index === 1 ? "rotate-3 md:-mt-6 shadow-xl" : ""}
    ${index === 2 ? "-rotate-3deg" : ""}`}
    >
              <div className="mb-4 text-2xl text-green-600">{item.icon}</div>

              <p className="text-sm text-gray-400">{item.step}</p>

              <h3 className="text-lg font-semibold mt-1 mb-2">{item.title}</h3>

              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      <div className="mb-32">
        <motion.h2
        initial = {{opacity:0,y:20}}
        whileInView={{opacity:1, y:0}}
        transition={{duration:0.6}}
        className='text-4xl  font-semibold text-center mb-16'
        >
          Advance AI{" "}
          <span className='text-green-600'> Capabilities</span>

        </motion.h2>
        <div className="grid md:grid-cols-2 gap-10">
            {features.map((item, index) => (
              <motion.div 
              key={index} 
              initial = {{opacity:0 , y:30}}
              whileInView={{opacity:1,y:0}}
              transition={{duration:0.95 , delay:index*0.1}}
              whileHover={{scale:1.02}}
              className=' bg-white border  border-gray-200  rounded-3xl p-8  shadow-sm hover:shadow-xl transition-all '
              > <div className='flex flex-col md:flex-row items-center gap-8'>
                  <div className='w-full md:w-1/2 flex justify-center'>
                  <img src={item.image} alt={item.title} />
                  
                  </div>
                  <div className='w-full md:w-1/2'>
                  <div className="bg-green-50  text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <div>{item.icon}</div>
                  </div>
                  <h3 className='font-semibold mb-3 text-xl'>{item.title}</h3>
                  <p className=' text-gray-500 text-sm leading-relaxed'>{item.desc}</p>
                  </div>
                 
              </div>
              </motion.div>
            ))}
        </div>
      </div>


          <div className="mb-32">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl  font-semibold text-center mb-16'
            >
              Multiples Interviews{" "}
              <span className='text-green-600'> Models</span>

            </motion.h2>
            <div className="grid md:grid-cols-2 gap-10">
              {Models.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.95, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                 
                ><div>
                    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition duration-300">

                      <div className="w-full md:w-1/2 flex justify-center">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-40 h-40 object-contain"
                        />
                      </div>

                      <div className="w-full md:w-1/2 text-center md:text-left">
                        <h3 className="font-semibold mb-3 text-xl">
                          {item.title}
                        </h3>

                        <p className="text-gray-500 text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                    </div>
                  

                  </div>
                </motion.div>
              ))}
            </div>
          </div>



      </div>
      
      
            </div>
      {/* Auth Modal */}
      {showAuth && (
        <Authmodel onClose={() => setShowAuth(false)} />
      )}
      <Footer/>
    </div>
  )
}

export default Home