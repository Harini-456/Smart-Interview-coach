import express from "express"
import axios from "axios"
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userapi from "./api/userapi.js";
import interviewapi from "./api/interviewapi.js";

dotenv.config();
connectDB();

const app = express()

app.use(express.json())
app.use('/api/user', userapi)
app.use('/api/interview', interviewapi);

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
app.use(express.json());