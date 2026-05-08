import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  role: String,
  category: String,
  experienceLevel: String,
  level: String,
  type: String,

  questions: [
    {
      type: {
        type: String,
        required: true
      },
      question: String,
      options: [String],
      correctAnswer: String,
      expectedConcepts: [String]
    }
  ],

  answers: [String],

  scores: [Number],

  // ✅ UPDATED FEEDBACK STRUCTURE
  feedback: [
    {
      text: String,
      score: Number,
      strengths: [String],
      weaknesses: [String]
    }
  ],

  // 🔥 NEW FIELDS (YOU ASKED ABOUT)
  status: {
    type: String,
    enum: ["started", "in_progress", "completed", "reviewed"],
    default: "started"
  },

  startTime: Date,
  endTime: Date,

  totalScore: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Interview", interviewSchema);