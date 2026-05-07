import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  // 🔥 FIX: add blocked role
  role: {
    type: String,
    enum: ["candidate", "admin", "blocked"],
    default: "candidate"
  },

  totalInterviews: {
    type: Number,
    default: 0
  },

  avgScore: {
    type: Number,
    default: 0
  },

  experienceLevel: {
    type: String,
    default: ""
  },

  preferredRole: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);