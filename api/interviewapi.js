import express from "express";
import { callAI } from "../services/gemini.js";
import Interview from "../models/Interview.js";

const router = express.Router();


// ✅ START INTERVIEW
router.post("/start", async (req, res) => {
  try {
    const { userId, role, level, type } = req.body;

    let prompt = "";

    // 🟢 CASE 1: MCQ
    if (type === "mcq") {
      prompt = `
Generate 3 ${level || "medium"} level MCQ interview questions for a ${role}.

Each question MUST have:
- 4 options
- 1 correct answer

Return STRICT JSON (only JSON, double quotes):
[
  {
    "type": "mcq",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  }
]
`;
    }

    // 🟢 CASE 2: TEXT
    else if (type === "text") {
      prompt = `
Generate 3 ${level || "medium"} level descriptive interview questions for a ${role}.

Rules:
- Questions must require paragraph answers
- Do NOT include options
- Do NOT include correct answers

Return STRICT JSON:
[
  {
    "type": "text",
    "question": "..."
  }
]
`;
    }

    // 🔴 fallback (optional safety)
    else {
      return res.status(400).json({
        message: "Invalid type. Use 'mcq' or 'text'"
      });
    }

    const aiText = await callAI(prompt);

    let questions;

    try {
      const clean = aiText.match(/\[[\s\S]*\]/)?.[0];

      if (!clean) throw new Error("Invalid AI format");

      questions = JSON.parse(clean);

    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr);

      return res.status(500).json({
        message: "AI response format error. Try again."
      });
    }

    const interview = new Interview({
      userId,
      role,
      questions,
      answers: [],
      feedback: [],
      scores: []
    });

    await interview.save();

    res.json({
      message: "Interview started",
      interview
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ SAVE ANSWER
router.post("/answer/:id", async (req, res) => {
  try {
    const { answer } = req.body;

    const interview = await Interview.findById(req.params.id);

    const currentIndex = interview.answers.length;
    const currentQ = interview.questions[currentIndex];

    let feedback = "";
    let score = 0;

    // 🟢 MCQ handling (no AI needed)
    if (currentQ.type === "mcq") {
      if (answer === currentQ.correctAnswer) {
        score = 10;
        feedback = "Correct answer";
      } else {
        score = 0;
        feedback = `Wrong. Correct answer is ${currentQ.correctAnswer}`;
      }
    }

    // 🟢 Descriptive (AI evaluation)
    else {
      const prompt = `
      You are an interview evaluator.

      Question: ${currentQ.question}

      Candidate Answer:
      ${answer}

      Evaluate based on:
      - correctness
      - completeness
      - clarity

      Scoring:
      0 = wrong
      5 = partially correct
      10 = fully correct

      Return ONLY JSON:
      {
        "score": number,
        "feedback": "short explanation"
      }
      `;

      const aiResponse = await callAI(prompt);

      try {
        const clean = aiResponse.match(/\{[\s\S]*\}/)?.[0];

        if (!clean) throw new Error("Invalid AI response");

        const parsed = JSON.parse(clean);

        score = parsed.score ?? 0;
        feedback = parsed.feedback ?? "No feedback";

      } catch (parseErr) {
        console.error("AI Parse Error:", parseErr);

        score = 0;
        feedback = "Could not evaluate answer";
      }
    }

    // ✅ Save data properly
    interview.answers.push(answer);
    interview.feedback.push(feedback);
    interview.scores.push(score);

    await interview.save();

    res.json({
      message: "Answer evaluated",
      feedback,
      score,
      interview
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET HISTORY
router.get("/history/:userId", async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.params.userId
    });

    res.json(interviews);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;