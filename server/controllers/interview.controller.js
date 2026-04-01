import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import askAi from "../utils/askAi.js";
import User from "../models/user.model.js"
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "resume required" });
        }
        
        const filepath = req.file.path;
        
        // Read file
        const fileBuffer = await fs.promises.readFile(filepath);
        const uint8Array = new Uint8Array(fileBuffer);
        
        // Load PDF
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";
        
        // Extract text
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }
        
        resumeText = resumeText.replace(/\s+/g, " ").trim();
        
        // 🔥 FIX: include resumeText in messages
        const messages = [
            {
                role: "system",
                content: `
                Extract structured data from resume.
                
                Return strictly JSON:

{
    "role": "string",
    "experience": "string",
    "projects": ["project1", "project2"],
    "skills": ["skill1", "skill2"]
    }
    `
},
{
    role: "user",
    content: resumeText
}
        ];

        // Call AI
        const aiResponse = await askAi(messages);
        
        // 🔥 FIX: clean response before parsing
        const cleaned = aiResponse.replace(/```json|```/g, "").trim();
        
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (err) {
            console.error("JSON parse error:", cleaned);
            throw new Error("Invalid JSON from AI");
        }
        
        // Delete file
        fs.unlinkSync(filepath);
        
        // 🔥 FIX: correct mapping
        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects || [],
            skills: parsed.skills || [],
            resumeText
        });
        
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        console.error(error);
        
        res.status(500).json({
            message: error.message || "Server error"
        });
    }
};


export const generateQuestion = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body;

        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if (!role || !experience || !mode) {
            return res.status(400).json({
                message: "Role, experience, and mode are required"
            });
        }

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let user = await User.findOne({
            $or: [
                { firebaseUid: req.userId },
                { email: req.email }
            ]
        });

        if (!user) {
            user = await User.create({
                firebaseUid: req.userId,
                email: req.email,
                name: req.name || "User",
                credits: 200
            });
        } else {
            if (!user.firebaseUid) {
                user.firebaseUid = req.userId;
                await user.save();
            }
        }

        if (user.credits < 50) {
            return res.status(400).json({
                message: "Minimum 50 Credits are required !!"
            });
        }

        const projectText =
            Array.isArray(projects) && projects.length
                ? projects.join(", ")
                : "None";

        const skillsText =
            Array.isArray(skills) && skills.length
                ? skills.join(", ")
                : "None";

        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
Role: ${role}
Experience: ${experience}
Mode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}
`;

        const messages = [
            {
                role: "system",
                content: "Generate exactly 5 interview questions (15-25 words each). Return only questions."
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const aiResponse = await askAi(messages);

        if (!aiResponse) {
            return res.status(500).json({
                message: "AI did not return any response"
            });
        }

        const questionsArray = aiResponse
            .split("\n")
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .slice(0, 5);

        if (!questionsArray.length) {
            return res.status(500).json({
                message: "Failed to generate valid questions"
            });
        }

        // ✅ Deduct credits AFTER success
        user.credits -= 50;
        await user.save();

        const interview = await Interview.create({
            userId: req.userId,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "medium", "hard", "hard"][index],
                timeLimit: [60, 60, 90, 120, 120][index]
            }))
        });

        return res.status(200).json({
            success: true,
            interviewId: interview._id,
            creditsLeft: user.credits,
            questions: interview.questions
        });

    } catch (error) {
        console.log("🔥 ERROR:", error);
        return res.status(500).json({
            message: error.message
        });
    }
};



export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const question = interview.questions[questionIndex];
        if (!question) {
            return res.status(400).json({ message: "Invalid question index" });
        }

        // =========================
        // HANDLE EDGE CASES
        // =========================
        if (!answer || !answer.trim()) {
            question.answer = "";
            question.score = 0;
            question.feedback = "No answer provided.";
        }
        else if (timeTaken > question.timeLimit) {
            question.answer = answer;
            question.score = 0;
            question.feedback = "Time limit exceeded.";
        }
        else {
            // =========================
            // AI EVALUATION
            // =========================
            const messages = [
                {
                    role: "system",
                    content: `
Return STRICT JSON:
{
 "confidence": number (0-10),
 "communication": number (0-10),
 "correctness": number (0-10),
 "finalScore": number (0-10),
 "feedback": "string"
}`
                },
                {
                    role: "user",
                    content: `Question: ${question.question}\nAnswer: ${answer}`
                }
            ];

            let parsed;

            try {
                let aiResponse = await askAi(messages);

                const cleaned = aiResponse.replace(/```json|```/g, "").trim();

                parsed = JSON.parse(cleaned);

            } catch (err) {
                console.log("❌ AI ERROR:", err.message);

                parsed = {
                    confidence: 5,
                    communication: 5,
                    correctness: 5,
                    finalScore: 5,
                    feedback: "Default evaluation applied"
                };
            }

            // ✅ SAVE VALUES PROPERLY
            question.answer = answer;
            question.confidence = Number(parsed.confidence) || 0;
            question.communication = Number(parsed.communication) || 0;
            question.correctness = Number(parsed.correctness) || 0;
            question.score = Number(parsed.finalScore) || 0;
            question.feedback = parsed.feedback || "";
        }

        // =========================
        // SAVE QUESTION UPDATE
        // =========================
        await interview.save();

        // =========================
        // 🔥 UPDATE FINAL SCORE
        // =========================
        let totalScore = 0;

        interview.questions.forEach((q) => {
            totalScore += Number(q.score) || 0;
        });

        const finalScore =
            interview.questions.length > 0
                ? totalScore / interview.questions.length
                : 0;

        interview.finalScore = Number(finalScore.toFixed(1));

        await interview.save();

        // =========================
        // RESPONSE
        // =========================
        return res.status(200).json({
            feedback: question.feedback,
            questionScore: question.score,
            finalScore: interview.finalScore,
            updatedQuestion: question
        });

    } catch (error) {
        console.log("submitAnswer error:", error);
        return res.status(500).json({
            message: "Failed to submit answer"
        });
    }
};




export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body
        const interview = await Interview.findById(interviewId)
        if (!interview) {
            return res.status(400).json({ messages: "failed to find interview" })
        }
        const totalQuestions = interview.questions.length;
        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;
        interview.questions.forEach((q) => {
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        interview.finalScore = finalScore;
        interview.status = "completed";
        await interview.save();
        return res.status(200).json({
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                score: q.score ?? 0,
                feedback: q.feedback ?? "",
                confidence: q.confidence ?? 0,
                communication: q.communication ?? 0,
                correctness: q.correctness ?? 0,
            })),
        });
    } catch (error) {
        return res.status(500).json({ messages: `failed to finish interview ${error}` })
    }
}
export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select("role experience mode finalScore status createdAt")

        return res.status(200).json(interviews) // ✅ FIXED

    } catch (error) {
        return res.status(500).json({
            messages: `failed to find current interview ${error}`
        })
    }
}
export const getInterviewReport = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const totalQuestions = interview.questions.length;

        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        // 🔥 Calculate final score
        const calculatedScore =
            (avgConfidence + avgCommunication + avgCorrectness) / 3;

        const finalScoreRounded = Number(calculatedScore.toFixed(1));

        // ✅ SAVE ONLY IF NOT ALREADY SAVED (important fix)
        if (!interview.finalScore) {
            interview.finalScore = finalScoreRounded;
            interview.status = "completed";
            await interview.save();
        }

        return res.json({
            finalScore: interview.finalScore, // use DB value
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions,
        });

    } catch (error) {
        console.log("ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to get interview report",
            error: error.message,
        });
    }
};