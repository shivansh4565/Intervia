import React, { useState } from 'react'
import Step1SetUp from "../Components/Step1SetUp"
import Step2Interview from "../Components/Step2Interview"
import Step3Report from "../Components/Step3Report"

function InterviewPage() {
  const [step, setstep] = useState(1)
  const [interviewData, setInterviewData] = useState(null) // ✅ better naming

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* STEP 1 */}
      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data)
            setstep(2)
          }}
        />
      )}

      {/* STEP 2 */}
      {step === 2 && interviewData && (   // ✅ safety check
        <Step2Interview
          interviewData={interviewData}   // ✅ FIXED prop name
          onFinish={(report) => {
            setInterviewData(report)
            setstep(3)                    // ✅ FIXED step change
          }}
        />
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <Step3Report report={interviewData} />
      )}

    </div>
  )
}

export default InterviewPage