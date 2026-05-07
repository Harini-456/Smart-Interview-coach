import express from "express";
import User from "../models/user.js";
import Interview from "../models/interview.js";

const router = express.Router();


// ================= GET USERS (FIXED STATS) =================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    // 🔥 FIX: recalculate stats dynamically
    const updatedUsers = await Promise.all(
      users.map(async (user) => {

        const interviews = await Interview.find({
          userId: user._id,
          status: "completed"
        });

        const totalInterviews = interviews.length;

        const totalScore = interviews.reduce(
          (sum, i) => sum + (i.totalScore || 0),
          0
        );

        const avgScore =
          totalInterviews > 0
            ? (totalScore / totalInterviews).toFixed(2)
            : 0;

        return {
          ...user.toObject(),
          totalInterviews,
          avgScore
        };
      })
    );

    res.json(updatedUsers);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= GET ALL INTERVIEW HISTORY (ADMIN) =================
router.get("/interviews", async (req, res) => {
  try {
    const interviews = await Interview.find()
      .sort({ createdAt: -1 });

    res.json({
      total: interviews.length,
      interviews
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= GET USER-SPECIFIC INTERVIEW HISTORY =================
router.get("/user-interviews/:userId", async (req, res) => {
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


// ================= DELETE USER =================
router.delete("/user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    await Interview.deleteMany({
      userId: req.params.id
    });

    res.json({ message: "User and interviews deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= BLOCK USER =================
router.put("/user/block/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.role = "blocked";
    await user.save();

    res.json({ message: "User blocked" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= UNBLOCK USER =================
router.put("/user/unblock/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.role = "candidate";
    await user.save();

    res.json({ message: "User unblocked" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= ADMIN ANALYTICS (ADVANCED) =================
router.get("/analytics", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalInterviews = await Interview.countDocuments();

    const completedInterviews = await Interview.countDocuments({
      status: "completed"
    });

    const avgScoreAgg = await Interview.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$totalScore" }
        }
      }
    ]);

    const avgScore = avgScoreAgg[0]?.avgScore || 0;

    const topUsers = await User.find()
      .sort({ avgScore: -1 })
      .limit(5)
      .select("name avgScore");

    const recentInterviews = await Interview.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalInterviews,
      completedInterviews,
      averageScore: avgScore.toFixed(2),
      topUsers,
      recentInterviews
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;