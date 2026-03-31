import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import Step3Report from '../Components/Step3Report'
import { auth } from '../Utils/Firebase' // ✅ ADD THIS
function InterviewReport() {
  const { id } = useParams()
  const [report, setReport] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const user = auth.currentUser // ✅ FIX

      

        if (!user) {
          console.log("No user logged in")
          return
        }

        const token = await user.getIdToken()
        // console.log("TOKEN:", token)

        const result = await axios.get(
          serverUrl + "/api/interview/report/" + id,
          {
            withCredentials: true, // kept as you had
            headers: {
              Authorization: `Bearer ${token}` // ✅ THIS IS THE KEY FIX
            }
          }
        )

      
        setReport(result.data)

      } catch (error) {
        console.log(error.response?.data || error.message)
      }
    }

    fetchReport()
  }, [id])

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className='text-lg text-gray-500'>Loading Report..</p>
      </div>
    )
  }

  return <Step3Report report={report} />
}

export default InterviewReport