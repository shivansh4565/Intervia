import mongoose from "mongoose"

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    difficulty: String,
    timeLimit: Number,

    answer: { type: String, default: "" },
    feedback: { type: String, default: "" },

    score: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 }
})

const interviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true // 🔥 important
    },

    role: {
        type: String,
        required: true
    },

    experience: {
        type: String,
        required: true
    },

    mode: {
        type: String,
        enum: ["HR", "Technical"],
        required: true
    },

    resumeText: {
        type: String
    },

    questions: [questionSchema],

    finalScore: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["incompleted", "completed"],
        default: "incompleted"
    }

}, { timestamps: true })

const Interview = mongoose.model("Interview", interviewSchema)

export default Interview