import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Home from "./Pages/Home";
import Auth from "./Pages/Auth";
import InterviewPage from "./Pages/InterviewPage";
import InterviewHistory from "./Pages/InterviewHistory";
import Pricing from "./Pages/Pricing";
import InterviewReport from "./Pages/InterviewReport";

import { setUserData } from "./redux/userSlice";

export const serverUrl = "http://localhost:8000";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 important
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // 🔥 get token
        const token = await firebaseUser.getIdToken();

        // 🔥 fetch user from backend
        const result = await axios.get(
          `${serverUrl}/api/user/current-user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(result.data);
        dispatch(setUserData(result.data));

      } catch (error) {
        console.error(
          "Error fetching user:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);


  return (
    <Routes>
      <Route path="/" element={<Home user={user} />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/history" element={<InterviewHistory />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/report/:id" element={<InterviewReport />} />
    </Routes>
  );
}

export default App;