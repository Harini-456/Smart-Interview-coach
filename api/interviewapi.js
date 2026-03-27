import express from "express";
import Interview from "../models/interview.js";
import { callGemini } from "../services/gemini.js";

const router = express.Router();


// ✅ START INTERVIEW
router.post("/start", async (req, res) => {
  try {
    const { userId, role } = req.body;

    const prompt = `Generate 3 interview questions for a ${role}`;

    const aiText = await callGemini(prompt);

    const questions = aiText
        .split("\n")
        .filter(q => q.trim() !== "");

    const interview = new Interview({
      userId,
      role,
      questions
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

    interview.answers.push(answer);

    // Temporary feedback (AI later)
    const question = interview.questions[interview.answers.length];

    const prompt = `
    Question: ${question}
    Answer: ${answer}

    Evaluate:
    - Score out of 10
    - Feedback
    `;

    const aiResponse = await callGemini(prompt);

    interview.answers.push(answer);
    interview.feedback.push(aiResponse);
    interview.scores.push(8); // improve later

    await interview.save();

    res.json({
      message: "Answer saved",
      interview
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//  GET HISTORY
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