import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  role: String,
  questions: [
  {
    type: {
      type: String
    },
    question: String,
    options: [String],
    correctAnswer: String
  }
],
  answers: [String],
  feedback: [String],
  scores: [Number],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Interview", interviewSchema);