# 🤖 AI Interview Agent — Production-Ready SaaS Platform

A scalable, full-stack AI-powered interview preparation platform built using the MERN stack. This application enables users to simulate real-world technical and HR interviews through resume-driven question generation, intelligent evaluation, and a credit-based monetization system.

Designed with a SaaS architecture approach, this project goes beyond CRUD operations and focuses on real-world product engineering, secure authentication, payment integration, and deployment.

---

## 🚀 Key Highlights

* Built a **resume-driven AI interview system** capable of generating contextual technical & HR questions
* Designed and implemented a **credit-based usage model** with secure payment integration
* Developed a **modular and scalable backend architecture** using Express & MongoDB
* Integrated **Google OAuth authentication** using Firebase
* Implemented **smooth and dynamic UI interactions** using Framer Motion
* Deployed a **full-stack production-ready application** on Render

---

## 🛠️ Tech Stack

**Frontend**

* React.js (Vite)
* Tailwind CSS
* Redux Toolkit
* Framer Motion

**Backend**

* Node.js
* Express.js
* MongoDB (Mongoose)

**Integrations & Services**

* Firebase Authentication (Google OAuth)
* Razorpay Payment Gateway
* Multer (File Upload Handling)
* OpenRouter / AI APIs

---

## 🧠 Core Features

* 📄 Resume Upload & Parsing (PDF support)
* 🤖 AI-powered Interview Question Generation
* 🧩 Technical & HR Interview Simulation
* 📊 Intelligent Feedback & Performance Tracking
* 💳 Credit-Based Access Control System
* 💰 Razorpay Integration for Credit Purchase
* 🔐 Secure Authentication & Protected APIs
* 📁 User Interview History & Reports

---

## 🏗️ System Architecture Overview

* **Client (React)** handles UI, state management, and API interactions
* **Server (Express)** manages business logic, authentication, and APIs
* **Database (MongoDB)** stores users, credits, interviews, and reports
* **AI Layer** processes resume input and generates dynamic interview content
* **Payment Layer (Razorpay)** manages transactions and credit allocation

---

## ⚙️ Installation & Setup

```bash
# Clone repository
git clone https://github.com/shivansh4565/Intervia

# Backend setup
cd server
npm install
npm run dev

# Frontend setup
cd client
npm install
npm run dev
```

### 🔑 Environment Variables

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY=your_key
RAZORPAY_SECRET=your_secret
FIREBASE_CONFIG=your_firebase_config
OPENROUTER_API_KEY=your_ai_key
```

---

## 📈 Key Learnings

* Architecting **production-level SaaS applications**
* Implementing **secure authentication & authorization flows**
* Designing **scalable backend structures and APIs**
* Integrating **AI services into real-world applications**
* Building **monetization systems (credit + payments)**
* Managing **end-to-end deployment workflows**

---

## 🔮 Future Enhancements

* Real-time voice-based AI interviewer
* Advanced analytics dashboard with performance insights
* Multi-language interview support
* Adaptive difficulty based on user performance

---

## 📌 Conclusion

This project demonstrates the ability to design and build a complete, production-ready SaaS application by integrating AI, secure authentication, payment systems, and scalable backend architecture.

It reflects a strong understanding of full-stack development and real-world product engineering.

---

⭐ If you find this project valuable, feel free to star the repository.
