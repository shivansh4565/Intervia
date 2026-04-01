import React, { useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getAuth } from "firebase/auth";
import { serverUrl } from '../App';
const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [loading, setLoading] = useState(false) // ✅ FIXED
  const navigate = useNavigate();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Performance Report",
        "Voice + Text Interview Access",
        "Extended History Tracking",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 750,
      description: "Best value for serious job preparation.",
      features: [
        "750 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  // 💳 PAYMENT FUNCTION
  const handlePayment = async (plan) => {
    if (plan.id === "free") return;

    try {
      setLoading(true);

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      const token = await user.getIdToken(); // 🔥 FIX
      console.log(`token gen: ${token}`);
      // 1️⃣ Create order
      const res = await fetch(`${serverUrl}/api/payment/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ correct token
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: Number(plan.price.replace("₹", "")),
          credits: plan.credits,
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      const order = await res.json();

      // 2️⃣ Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "AI Interview Prep",
        description: plan.name,
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              `${serverUrl}/api/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                })
              }
            );

            const data = await verifyRes.json();

            if (data.success) {
            console.log("payment successfull")
            } else {
              console.log("Verification Failed ");
            }
          } catch (err) {
            console.error(err);
            console.log("Verification Error ❌");
          }
        },

        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      // alert("Payment Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-16'>

      {/* HEADER */}
      <div className='max-w-6xl mx-auto mb-14 flex items-start gap-4'>
        <button
          onClick={() => navigate("/")}
          className='mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition'
        >
          <FaArrowLeft className='text-gray-600' />
        </button>

        <div className="text-center w-full">
          <h1 className='text-4xl font-bold text-gray-800'>Choose Your Plan</h1>
          <p className='text-gray-500 mt-3 text-lg'>
            Flexible pricing to match your interview preparation goals
          </p>
        </div>
      </div>

      {/* PLANS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={!plan.default ? { scale: 1.03 } : {}}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              className={`relative rounded-3xl p-8 transition-all duration-300 border
                ${isSelected
                  ? "border-emerald-600 shadow-2xl bg-white"
                  : "border-gray-200 bg-white shadow-md"}
                ${plan.default ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {plan.badge && (
                <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-4">{plan.price}</p>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    • {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();

                  if (!isSelected) {
                    setSelectedPlan(plan.id);
                  } else {
                    handlePayment(plan);
                  }
                }}
                className={`w-full py-2 rounded-xl font-medium transition
                  ${isSelected
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-800"}
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {plan.default
                  ? "Current Plan"
                  : loading && isSelected
                    ? "Processing..."
                    : isSelected
                      ? "Pay Now"
                      : "Choose Plan"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  )
}

export default Pricing;