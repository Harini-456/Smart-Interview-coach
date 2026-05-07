import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Fix SSL certificate verification issues on corporate/college networks
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import connectDB from "./config/db.js";

import userapi from "./api/userapi.js";
import interviewapi from "./api/interviewapi.js";
import adminapi from "./api/adminapi.js";

dotenv.config();

const app = express();

// middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// database
connectDB();

// health check
app.get("/", (req, res) => {
  res.json({ message: "Smart Interview Coach API is running" });
});

// routes
app.use("/api/user", userapi);
app.use("/api/interview", interviewapi);
app.use("/api/admin", adminapi);

// server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});