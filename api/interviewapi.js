import express from "express";
import { callAI } from "../services/gemini.js";
import Interview from "../models/Interview.js";

const router = express.Router();

// START INTERVIEW
router.post("/start", async (req, res) => {
  try {
    const { userId, role, level, type } = req.body;

    if (!userId || !role || !type) {
      return res.status(400).json({
        message: "userId, role, and type are required"
      });
    }

    let prompt = "";

    if (type === "mcq") {
      prompt = `
Generate 3 ${level || "medium"} level MCQ interview questions for a ${role}.

Each question MUST have:
- 4 options
- 1 correct answer

Return STRICT JSON only:
[
  {
    "type": "mcq",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  }
]
`;
    } else if (type === "text") {
      prompt = `
Generate 3 ${level || "medium"} level descriptive interview questions for a ${role}.

Rules:
- Questions must require paragraph answers
- Do NOT include options
- Do NOT include correct answers

Return STRICT JSON only:
[
  {
    "type": "text",
    "question": "..."
  }
]
`;
    } else if (type === "mixed") {
      prompt = `
Generate 3 ${level || "medium"} level interview questions for a ${role}.

Rules:
- Include both MCQ and text questions
- At least 1 MCQ and at least 1 text
- MCQ must contain 4 options and 1 correct answer
- Text must contain only type and question

Return STRICT JSON only:
[
  {
    "type": "mcq",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  },
  {
    "type": "text",
    "question": "..."
  }
]
`;
    } else {
      return res.status(400).json({
        message: "Invalid type. Use 'mcq', 'text', or 'mixed'"
      });
    }

    const aiText = await callAI(prompt);

    let questions;

    try {
      const clean = aiText.match(/\[[\s\S]*\]/)?.[0];
      if (!clean) throw new Error("Invalid AI format");

      questions = JSON.parse(clean);

      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          message: "No questions generated"
        });
      }
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr);
      return res.status(500).json({
        message: "AI response format error. Try again."
      });
    }

    const interview = new Interview({
      userId,
      role,
      level: level || "medium",
      type,
      questions,
      answers: [],
      feedback: [],
      scores: [],
      completed: false
    });

    await interview.save();

    res.json({
      message: "Interview started",
      interviewId: interview._id,
      totalQuestions: interview.questions.length,
      questions: interview.questions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SUBMIT ALL ANSWERS AT ONCE
router.post("/answer/:id", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "answers must be a non-empty array"
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found"
      });
    }

    if (!Array.isArray(interview.questions) || interview.questions.length === 0) {
      return res.status(400).json({
        message: "No questions found for this interview"
      });
    }

    if (interview.completed) {
      return res.status(400).json({
        message: "Interview already completed"
      });
    }

    if (answers.length !== interview.questions.length) {
      return res.status(400).json({
        message: `You must submit exactly ${interview.questions.length} answers`
      });
    }

    let feedback = [];
    let scores = [];

    for (let i = 0; i < interview.questions.length; i++) {
      const currentQ = interview.questions[i];
      const answer = answers[i];

      if (!currentQ || !currentQ.type) {
        feedback.push("Invalid question");
        scores.push(0);
        continue;
      }

      // MCQ
      if (currentQ.type === "mcq") {
        if (answer === currentQ.correctAnswer) {
          scores.push(10);
          feedback.push("Correct answer");
        } else {
          scores.push(0);
          feedback.push(`Wrong. Correct answer is ${currentQ.correctAnswer}`);
        }
      }

      // TEXT
      else if (currentQ.type === "text") {
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

        try {
          const aiResponse = await callAI(prompt);
          const clean = aiResponse.match(/\{[\s\S]*\}/)?.[0];

          if (!clean) throw new Error("Invalid AI response");

          const parsed = JSON.parse(clean);

          scores.push(parsed.score ?? 0);
          feedback.push(parsed.feedback ?? "No feedback");
        } catch (parseErr) {
          console.error("AI Parse Error:", parseErr);
          scores.push(0);
          feedback.push("Could not evaluate answer");
        }
      }

      else {
        scores.push(0);
        feedback.push(`Unsupported question type: ${currentQ.type}`);
      }
    }

    interview.answers = answers;
    interview.feedback = feedback;
    interview.scores = scores;
    interview.completed = true;

    await interview.save();

    const totalScore = scores.reduce((sum, s) => sum + s, 0);

    res.json({
      message: "All answers submitted successfully",
      completed: true,
      totalQuestions: interview.questions.length,
      totalScore,
      scores,
      feedback,
      interview
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE INTERVIEW
router.get("/:id", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found"
      });
    }

    const totalScore = (interview.scores || []).reduce((sum, s) => sum + s, 0);

    res.json({
      interview,
      completed: interview.completed || false,
      totalQuestions: interview.questions.length,
      totalScore
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET HISTORY
router.get("/history/:userId", async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;