import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import userapi from "./api/userapi.js";
import interviewapi from "./api/interviewapi.js";
import adminapi from "./api/adminapi.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// database
connectDB();

// routes
app.use("/api/user", userapi);
app.use("/api/interview", interviewapi);
app.use("/api/admin", adminapi);

// server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});