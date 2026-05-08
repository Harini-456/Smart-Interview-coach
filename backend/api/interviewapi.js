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
    } = req.body;

    if (!userId || !role || !type) {
      return res.status(400).json({
        message: "userId, role, and type are required"
      });
    }

    const totalQ = Math.min(numQuestions || 3, 10);

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
- Make questions tricky by including multi-layered scenarios.
- For ${level} difficulty: ${level === "advanced" ? "Ask about strategic decisions, organizational impact, mentoring others through challenges, or navigating ambiguous situations with incomplete information." : level === "intermediate" ? "Focus on collaboration challenges, prioritization under constraints, and learning from mistakes." : "Ask about basic teamwork, communication, and handling feedback."}
- Avoid generic questions like "Tell me about yourself" or "What are your strengths?".`
      : "";

    const prompt = `You are a professional voice interview question generator.

Generate exactly ${totalQ} open-ended interview questions for a VOICE interview.

Role: ${role}
Category: ${category || "General"}
Experience Level: ${experienceLevel || "intermediate"}
Difficulty: ${level || "intermediate"}
Interview Type: ${type}

DIFFICULTY REQUIREMENT (CRITICAL):
- Questions must be ${difficultyInstruction}${behavioralGuidance}

IMPORTANT RULES:
- ALL questions must be open-ended TEXT questions suitable for spoken voice answers.
- Do NOT generate MCQ or multiple choice questions.
- Each question should require a detailed spoken explanation (30+ words to answer well).
- Questions should test depth of knowledge, reasoning, and communication.
- Include "expected_concepts" — 3 to 5 key concepts/keywords a good answer should mention.

OUTPUT RULES:
- Return ONLY a valid JSON array. No markdown, no code blocks, no explanation.

JSON Format:
[
  {
    "question_type": "TEXT",
    "question": "Your open-ended question here?",
    "expected_concepts": ["concept1", "concept2", "concept3"]
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
      return {
        type: "text",
        question: q.question,
        options: [],
        correctAnswer: "",
        expectedConcepts: Array.isArray(q.expected_concepts) ? q.expected_concepts : []
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
      options: q.options,
      expectedConcepts: q.expectedConcepts
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
    const maxPts = Math.round(100 / interview.questions.length);

    for (let i = 0; i < interview.questions.length; i++) {
      const q = interview.questions[i];
      const ans = (answers[i] || "").trim();
      const wordCount = ans.split(/\s+/).filter(Boolean).length;
      const expectedConcepts = q.expectedConcepts || [];

      if (!ans || wordCount === 0) {
        scores.push(0);
        feedback.push({ text: "No answer provided. Speak or type your response to earn marks.", score: 0 });
        continue;
      }

      // AI-based scoring: keyword relevance + topic coverage + completeness + communication
      const answerLower = ans.toLowerCase();

      // 1. Keyword relevance (25%)
      const matchedConcepts = expectedConcepts.filter(c =>
        answerLower.includes(c.toLowerCase())
      );
      const keywordScore = expectedConcepts.length > 0
        ? Math.round((matchedConcepts.length / expectedConcepts.length) * 25)
        : (wordCount >= 20 ? 20 : Math.round((wordCount / 20) * 20));

      // 2. Topic relevance — check if answer relates to the question (25%)
      const questionWords = q.question.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const topicMatches = questionWords.filter(w => answerLower.includes(w)).length;
      const topicScore = Math.min(25, Math.round((topicMatches / Math.max(questionWords.length, 1)) * 40));

      // 3. Answer completeness based on word count (25%)
      let completenessScore = 0;
      if (wordCount >= 60) completenessScore = 25;
      else if (wordCount >= 40) completenessScore = 20;
      else if (wordCount >= 25) completenessScore = 15;
      else if (wordCount >= 15) completenessScore = 10;
      else if (wordCount >= 8) completenessScore = 5;

      // 4. Communication quality — sentence structure, variety (25%)
      const sentences = ans.split(/[.!?]+/).filter(s => s.trim().length > 5);
      const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
      let commScore = 0;
      if (sentences.length >= 3 && avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) commScore = 25;
      else if (sentences.length >= 2 && avgWordsPerSentence >= 5) commScore = 18;
      else if (sentences.length >= 1) commScore = 10;

      const rawScore = keywordScore + topicScore + completenessScore + commScore;
      // Scale to maxPts per question
      const finalScore = Math.min(maxPts, Math.round((rawScore / 100) * maxPts));

      scores.push(finalScore);

      // Build detailed feedback
      const conceptsFeedback = expectedConcepts.length > 0
        ? matchedConcepts.length > 0
          ? `Covered concepts: ${matchedConcepts.join(", ")}.`
          : `Key concepts to mention: ${expectedConcepts.slice(0, 3).join(", ")}.`
        : "";

      let qualityLabel = "";
      if (rawScore >= 80) qualityLabel = "Excellent response — well-structured and comprehensive.";
      else if (rawScore >= 60) qualityLabel = "Good response — covers the topic with reasonable depth.";
      else if (rawScore >= 40) qualityLabel = "Average response — try to elaborate more with specific examples.";
      else if (rawScore >= 20) qualityLabel = "Brief response — needs more detail and relevant concepts.";
      else qualityLabel = "Very short response — please provide a more complete answer.";

      feedback.push({
        text: `${qualityLabel} ${conceptsFeedback} (${wordCount} words spoken)`.trim(),
        score: finalScore
      });
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