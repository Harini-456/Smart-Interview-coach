import express from "express";
import { callAI } from "../services/gemini.js";
import Interview from "../models/interview.js";
import User from "../models/user.js"; // 🔥 IMPORTANT

const router = express.Router();


// ================= START INTERVIEW =================
router.post("/start", async (req, res) => {
  try {
    const {
      userId,
      role,
      level,
      type,
      category,
      experienceLevel,
      numQuestions,
      questionFormat
    } = req.body;

    if (!userId || !role || !type) {
      return res.status(400).json({
        message: "userId, role, and type are required"
      });
    }

    const totalQ = Math.min(numQuestions || 3, 10);

    // Determine question format rules
    const fmt = (questionFormat || "mixed").toLowerCase();
    let formatRule = "";
    if (fmt === "mcq") {
      formatRule = `- ALL questions must be MCQ type with exactly 4 options and one correct answer.`;
    } else if (fmt === "text") {
      formatRule = `- ALL questions must be TEXT type (open-ended written answers). Do NOT generate any MCQ.`;
    } else {
      formatRule = `- Mix MCQ and TEXT questions roughly equally.`;
    }

    // Difficulty-specific instructions
    const difficultyMap = {
      beginner: "basic, foundational, definition-level questions. Suitable for someone just starting out. Avoid complex scenarios.",
      intermediate: "applied, scenario-based questions that test practical knowledge and problem-solving. Assume 2-5 years of experience.",
      advanced: "deep, expert-level questions involving edge cases, system design trade-offs, optimization, and complex real-world scenarios. Assume 5+ years of experience. Do NOT ask basic or simple questions."
    };
    const difficultyInstruction = difficultyMap[level] || difficultyMap["intermediate"];

    // Behavioral question enhancement
    const behavioralGuidance = type === "behavioral" || type === "mixed"
      ? `\n\nBEHAVIORAL QUESTION REQUIREMENTS (CRITICAL):
- Questions MUST be realistic, precise, and adaptive to the role and experience level.
- Use STAR method framework (Situation, Task, Action, Result).
- Ask about specific scenarios: conflict resolution, leadership, failure handling, decision-making under pressure, ethical dilemmas, team dynamics.
- Make questions tricky by including multi-layered scenarios (e.g., "Describe a time you had to choose between meeting a deadline and maintaining code quality. What factors did you consider?").
- For ${level} difficulty: ${level === "advanced" ? "Ask about strategic decisions, organizational impact, mentoring others through challenges, or navigating ambiguous situations with incomplete information." : level === "intermediate" ? "Focus on collaboration challenges, prioritization under constraints, and learning from mistakes." : "Ask about basic teamwork, communication, and handling feedback."}
- Avoid generic questions like "Tell me about yourself" or "What are your strengths?".
- Examples of good behavioral questions:
  * "Describe a situation where you had to advocate for a technical decision that your team initially disagreed with. How did you approach it?"
  * "Tell me about a time when you missed a critical bug in production. What was your response and what did you learn?"
  * "Give an example of when you had to balance technical debt against new feature development. How did you make the decision?"`
      : "";

    const prompt = `You are a professional interview question generator.

Generate exactly ${totalQ} interview questions with the following strict requirements:

Role: ${role}
Category: ${category || "General"}
Experience Level: ${experienceLevel || "intermediate"}
Difficulty: ${level || "intermediate"}
Interview Type: ${type}

DIFFICULTY REQUIREMENT (CRITICAL):
- Questions must be ${difficultyInstruction}${behavioralGuidance}

QUESTION FORMAT RULES:
${formatRule}
- For behavioral interview type, use only TEXT questions regardless of format.
- Each MCQ must have exactly 4 distinct options and one correct answer.

OUTPUT RULES:
- Return ONLY a valid JSON array. No markdown, no code blocks, no explanation.
- Every question object must have "question_type" as either "MCQ" or "TEXT".

JSON Format:
[
  {
    "question_type": "MCQ",
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A"
  },
  {
    "question_type": "TEXT",
    "question": "Your open-ended question here?"
  }
]`;

    const aiText = await callAI(prompt);

    let rawQuestions = [];

    try {
      // Try to parse the full response as JSON array first
      const cleaned = aiText.trim();
      const jsonStart = cleaned.indexOf("[");
      const jsonEnd = cleaned.lastIndexOf("]");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON array found in AI response");
      }

      const jsonStr = cleaned.substring(jsonStart, jsonEnd + 1);
      rawQuestions = JSON.parse(jsonStr);

      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        throw new Error("AI returned empty or invalid array");
      }

    } catch (err) {
      console.error("❌ Parse error:", err.message);
      console.error("Raw AI text:", aiText);
      return res.status(500).json({ message: "AI returned an invalid format. Please try again." });
    }

    let questions = rawQuestions.slice(0, totalQ).map(q => {
      const qType = (q.question_type || "text").toLowerCase();

      if (qType === "mcq" && Array.isArray(q.options) && q.options.length === 4) {
        return {
          type: "mcq",
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer || q.options[0]
        };
      }

      return {
        type: "text",
        question: q.question,
        options: [],
        correctAnswer: ""
      };
    }).filter(q => q.question && q.question.trim() !== "");

    const interview = new Interview({
      userId: userId.toString(),
      role,
      category,
      experienceLevel,
      level,
      type,
      questions,
      answers: [],
      feedback: [],
      scores: [],
      status: "in_progress",
      startTime: new Date()
    });

    await interview.save();

    const safeQuestions = questions.map(q => ({
      type: q.type,
      question: q.question,
      options: q.options
    }));

    res.json({
      message: "Interview started",
      interviewId: interview._id,
      totalQuestions: safeQuestions.length,
      questions: safeQuestions
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= SUBMIT ANSWERS =================
router.post("/answer/:id", async (req, res) => {
  try {
    const { answers } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Not found" });

    let feedback = [];
    let scores = [];

    for (let i = 0; i < interview.questions.length; i++) {
      const q = interview.questions[i];
      const ans = answers[i] || "";

      if (q.type === "mcq") {
        const correct = ans.trim() === q.correctAnswer.trim();
        // MCQ: 20 pts each (so 5 questions = 100)
        const pts = Math.round(100 / interview.questions.length);
        scores.push(correct ? pts : 0);
        feedback.push({
          text: correct
            ? "✅ Correct answer!"
            : `❌ Wrong. Correct answer: ${q.correctAnswer}`,
          score: correct ? pts : 0
        });
      } else {
        const wordCount = ans.trim().split(/\s+/).filter(Boolean).length;
        const maxPts = Math.round(100 / interview.questions.length);
        let score = 0;
        let feedbackText = "";

        if (wordCount === 0) {
          score = 0;
          feedbackText = "No answer provided.";
        } else if (wordCount < 10) {
          score = Math.round(maxPts * 0.3);
          feedbackText = "Answer is too brief. Try to elaborate more.";
        } else if (wordCount < 30) {
          score = Math.round(maxPts * 0.6);
          feedbackText = "Good attempt. A more detailed answer would score higher.";
        } else {
          score = maxPts;
          feedbackText = "Great answer! Well explained.";
        }

        scores.push(score);
        feedback.push({ text: feedbackText, score });
      }
    }

    interview.answers = answers;
    interview.feedback = feedback;
    interview.scores = scores;
    interview.status = "completed";
    interview.endTime = new Date();
    // Cap at 100
    interview.totalScore = Math.min(scores.reduce((a, b) => a + b, 0), 100);

    await interview.save();

    // ================= 🔥 STEP 2 FIX (USER STATS UPDATE) =================
    const user = await User.findById(interview.userId);

    if (user) {
      user.totalInterviews += 1;

      const allInterviews = await Interview.find({
        userId: interview.userId,
        status: "completed"
      });

      const totalScore = allInterviews.reduce(
        (sum, i) => sum + (i.totalScore || 0),
        0
      );

      user.avgScore = (
        totalScore / allInterviews.length
      ).toFixed(2);

      await user.save();
    }

    res.json({
      message: "Interview completed",
      totalScore: interview.totalScore,
      feedback
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= GET HISTORY =================
router.get("/history/:userId", async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json({
      total: interviews.length,
      interviews
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= GET SINGLE INTERVIEW =================
router.get("/:id", async (req, res) => {
  try {
    const { userId } = req.query;

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: userId
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found or access denied"
      });
    }

    res.json({
      interviewId: interview._id,
      role: interview.role,
      category: interview.category,
      experienceLevel: interview.experienceLevel,
      status: interview.status,
      totalScore: interview.totalScore,
      questions: interview.questions,
      answers: interview.answers,
      feedback: interview.feedback
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= ANALYTICS =================
router.get("/analytics/:userId", async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.params.userId,
      status: "completed"
    });

    const total = interviews.length;

    const avgScore =
      total > 0
        ? (interviews.reduce((s, i) => s + i.totalScore, 0) / total).toFixed(2)
        : 0;

    res.json({
      totalInterviews: total,
      averageScore: avgScore,
      recent: interviews.slice(-5)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;