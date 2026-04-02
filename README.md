# 🚀 Intervia – AI-Powered Interview Platform

Intervia is a **full-stack AI interview platform** that simulates real-world interviews using **Gemini AI**.
Users can select a job role, answer questions via text or voice, and receive **instant evaluation, scoring, and personalized feedback**.

---

# 🌐 Live Features

* 🎯 Role-based AI interview generation
* 🎤 Voice + Text answer support
* 🤖 Real-time AI evaluation
* 📊 Performance scoring & analytics
* 📄 PDF report generation
* 📜 Interview history tracking
* 💳 Paid interview sessions (Razorpay)

---

# 🧠 How It Works

1. User selects a **job role**
2. AI (Gemini) generates **role-specific questions**
3. User answers via **typing or speech**
4. AI evaluates answers based on:

   * Communication
   * Technical depth
   * Confidence
5. System generates:

   * Final score
   * Feedback
   * Improvement tips
6. Results stored and shown in **history + report**

---

# 🛠️ Tech Stack

## 🖥️ Frontend

* React.js (Vite)
* Tailwind CSS
* Framer Motion
* Speech Recognition API
* Firebase Authentication

## ⚙️ Backend

* Node.js
* Express.js
* REST API Architecture
* CORS enabled

## 🗄️ Database

* MongoDB Atlas

## 🤖 AI Integration

* Google Gemini API
* Retry + fallback mechanism for reliability

## 💳 Payments

* Razorpay (credit-based system)

---

# 📁 Project Structure

```
intervia/
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── server/                 # Backend (Node + Express)
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── utils/
│   └── index.js
│
└── README.md
```

---

# ⚙️ Environment Variables

## 📌 Frontend (.env)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 📌 Backend (.env)

```
PORT=8000
MONGO_URI=your_mongodb_atlas_uri
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

# 🚀 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/shivansh4565/Intervia
cd intervia
```

---

## 2️⃣ Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

## 3️⃣ Run the Project

### Start Backend

```bash
npm run dev
```

### Start Frontend

```bash
npm run dev
```

---

# 🔐 Authentication Flow

* User logs in using Firebase
* Firebase provides ID Token
* Token is sent in headers:

```js
Authorization: Bearer <token>
```

* Backend verifies user before API access

---

# 🔄 API Flow

```
Resume Upload → AI Analysis → Generate Questions
→ Answer Submission → AI Evaluation → Save
→ Finish Interview → Report Generation
```

---

# 📊 Scoring System

Each answer is evaluated on:

* Confidence
* Communication
* Correctness

Final Score = Average of all responses

---

# ⚠️ Error Handling

* AI failure handled using **fallback scoring**
* Retry mechanism for Gemini API overload (503 errors)
* Proper validation and error responses for APIs

---

# 💳 Payment Flow (Razorpay)

1. User selects a plan
2. Backend creates order
3. Razorpay checkout
4. Payment verification
5. Credits added to user

---

# 📈 Future Improvements

* Multi-AI fallback (Gemini + OpenAI)
* Advanced analytics dashboard
* Video-based interview mode
* Resume-based adaptive questioning
* Mobile responsiveness improvements

---

# 👨‍💻 Author

**Shivansh Saxena**
B.Tech CSE (AI) | Full Stack Developer

---



## 1️⃣ Check the deployed project
```bash
[Intervia](https://intervia-client.onrender.com/)
```

# ⭐ Support

If you like this project:

* ⭐ Star the repository
* 🍴 Fork it
* 🤝 Contribute

---

# 📜 License

This project is licensed under the MIT License.

---

🔥 Built to simulate real interviews and help users improve their communication and technical skills.
