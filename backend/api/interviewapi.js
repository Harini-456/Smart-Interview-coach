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
      numQuestions
    } = req.body;

    if (!userId || !role || !type) {
      return res.status(400).json({
        message: "userId, role, and type are required"
      });
    }

    const totalQ = Math.min(numQuestions || 3, 10);

    let prompt = `
Generate EXACTLY ${totalQ} ${type.toUpperCase()} interview questions.

Role: ${role}
Experience: ${experienceLevel}
Category: ${category}
Difficulty: ${level}

STRICT:
- Return ONLY JSON objects
- DO NOT number questions
- Use:
  "question_type": "MCQ" or "TEXT"
`;

    const aiText = await callAI(prompt);

    let rawQuestions = [];

    try {
      const matches = aiText.match(/\{[\s\S]*?\}/g);

      if (!matches || matches.length === 0) {
        throw new Error("No questions found");
      }

      rawQuestions = matches.map(q => JSON.parse(q));

    } catch (err) {
      console.error("❌ Parse error:", err);
      return res.status(500).json({ message: "AI format error" });
    }

    let questions = rawQuestions.map(q => {
      const qType = q.question_type?.toLowerCase();

      if (qType === "mcq") {
        return {
          type: "mcq",
          question: q.question,
          options: q.options?.length === 4
            ? q.options
            : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: q.options?.[0] || "Option A"
        };
      }

      return {
        type: "text",
        question: q.question,
        options: [],
        correctAnswer: ""
      };
    });

    if (questions.length < totalQ) {
      const missing = totalQ - questions.length;

      for (let i = 0; i < missing; i++) {
        questions.push({
          type: "text",
          question: `Fallback Question ${i + 1}`,
          options: [],
          correctAnswer: ""
        });
      }
    }

    if (questions.length > totalQ) {
      questions = questions.slice(0, totalQ);
    }

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
      const ans = answers[i];

      if (q.type === "mcq") {
        const correct = ans === q.correctAnswer;

        scores.push(correct ? 10 : 0);

        feedback.push({
          text: correct ? "Correct" : `Correct answer: ${q.correctAnswer}`,
          score: correct ? 10 : 0
        });
      } else {
        scores.push(5);
        feedback.push({
          text: "Answer submitted",
          score: 5
        });
      }
    }

    interview.answers = answers;
    interview.feedback = feedback;
    interview.scores = scores;
    interview.status = "completed";
    interview.endTime = new Date();
    interview.totalScore = scores.reduce((a, b) => a + b, 0);

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