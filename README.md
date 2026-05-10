# Smart Interview Coach 🚀

An AI-powered full-stack interview preparation platform designed to help students and job seekers improve their interview skills through AI-generated mock interviews, voice-based interaction, analytics dashboards, and personalized feedback systems.

---

# 🌐 Live Deployment Links

## 🚀 Frontend (Vercel)

Frontend Live URL:
https://smart-interview-coach-frontend-5hewlmmjf.vercel.app/

---

## ⚙️ Backend (Render)

Backend Live URL:
https://smart-interview-coach.onrender.com/

---

# 📌 Project Overview

Smart Interview Coach simulates real-world technical, HR, and behavioural interviews using Artificial Intelligence. The platform dynamically generates adaptive interview questions based on:

* Job Role
* Experience Level
* Interview Category
* Difficulty Level

The system evaluates candidate responses and provides:

* AI-generated feedback
* Performance analytics
* Strength & weakness analysis
* Interview history tracking
* Voice-based interview interaction

---

# 🎯 Main Objectives

* Provide realistic AI-powered interview simulation
* Improve candidate confidence and communication skills
* Enable role-based adaptive interview preparation
* Offer voice-based interactive interview mode
* Track candidate performance using analytics
* Deliver personalized AI feedback and scoring

---

# ✨ Key Features

## 👨‍💻 Candidate Features

* User Registration & Login
* Secure JWT Authentication
* AI-generated Mock Interviews
* Technical, HR & Behavioural Interview Modes
* Role-based Question Generation
* Difficulty Selection
* Voice-based Interview Interaction
* Speech-to-Text Conversion
* Editable Voice Transcript
* AI-based Evaluation & Scoring
* Performance Analytics Dashboard
* Interview History Tracking
* Responsive Modern UI

---

## 🛠️ Admin Features

* Admin Authentication
* User Management
* Interview Monitoring
* Question Bank Management
* Category Management
* Analytics Dashboard
* Feedback Moderation
* Platform Monitoring

---

# 🤖 AI Features

* AI Question Generation
* AI Answer Evaluation
* Dynamic Interview Flow
* Personalized Feedback
* STAR Method Evaluation
* Keyword & Relevancy Scoring
* Adaptive Difficulty Handling

---

# 🏗️ System Architecture

The project follows a layered MERN Stack architecture.

```text
Users (Candidate/Admin)
        ↓
Frontend UI (Next.js + Tailwind CSS)
        ↓
REST API Communication
        ↓
Backend Server (Node.js + Express.js)
        ↓
AI Integration Layer (OpenRouter API)
        ↓
MongoDB Atlas Database
        ↓
Analytics & Feedback System
```

---

# 🧩 Technology Stack

## Frontend

* Next.js
* Tailwind CSS
* ShadCN UI
* Axios
* Recharts
* Framer Motion
* Lucide React
* Web Speech API

---

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcrypt
* dotenv

---

## AI Integration

* OpenRouter API

---

## Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Database)

---

# 📂 Project Folder Structure

```bash
smart_interview_coach
│
├── backend
│   ├── api
│   ├── config
│   ├── middleware
│   ├── models
│   ├── services
│   ├── package.json
│   └── index.js
│
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   ├── public
│   ├── package.json
│   └── next.config.js
│
├── README.md
└── .gitignore
```

---

# 🔐 Authentication & Security

The platform includes multiple security mechanisms:

* JWT-based Authentication
* Password Hashing using bcrypt
* Protected API Routes
* Role-based Access Control
* Secure Environment Variables
* Middleware-based Authorization

---

# 🎙️ Voice Interview Workflow

```text
Candidate Starts Interview
            ↓
AI Generates Questions
            ↓
Candidate Answers Through Voice
            ↓
Speech Converted to Text
            ↓
Editable Transcript Displayed
            ↓
AI Evaluates Response
            ↓
Score & Feedback Generated
            ↓
Results Stored in MongoDB Atlas
            ↓
Dashboard Analytics Updated
```

---

# 📊 Analytics Features

The platform provides:

* Interview Score Tracking
* Category-wise Performance
* Strength & Weakness Analysis
* Average Score Monitoring
* Interview History Reports
* Dashboard Visualizations

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Harini-456/Smart-Interview-coach.git
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=8000

MONGO_URI=your_mongodb_connection_string

SECRET_CODE=your_jwt_secret

OPENROUTER_API_KEY=your_openrouter_api_key
```

---

# 📡 API Modules

| Module           | Purpose                          |
| ---------------- | -------------------------------- |
| `/api/user`      | Authentication & User Management |
| `/api/interview` | Interview Sessions               |
| `/api/admin`     | Admin Operations                 |
| `/api/analytics` | Dashboard Analytics              |

---

# 🧠 AI Workflow

```text
Candidate Selects Role & Difficulty
                ↓
Backend Requests AI Questions
                ↓
AI Generates Questions
                ↓
Candidate Answers Questions
                ↓
AI Evaluates Responses
                ↓
Feedback & Scores Generated
                ↓
Results Stored in MongoDB
                ↓
Dashboard Analytics Updated
```

---

# 🚀 Future Enhancements

* AI Resume Analysis
* Real-time Coding Interviews
* AI Career Suggestions
* Video Interview Mode
* Subscription Billing System
* AI-generated Improvement Roadmaps

---

# 👨‍🎓 Use Cases

* Placement Preparation
* Technical Interview Practice
* HR Interview Simulation
* Communication Skill Development
* Self-Evaluation & Analytics

---

# 📖 Learning Outcomes

This project demonstrates:

* Full Stack MERN Development
* REST API Architecture
* AI Integration
* Authentication & Authorization
* Cloud Deployment
* Responsive UI Design
* Voice-based AI Interaction
* Analytics Dashboard Implementation

---

# 📌 Conclusion

Smart Interview Coach is a modern AI-powered interview preparation platform that helps candidates improve interview readiness through adaptive AI interview simulation, intelligent feedback systems, voice interaction, and performance analytics.

---

# 🔗 GitHub Repository

https://github.com/Harini-456/Smart-Interview-coach

---

# 👨‍💻 Author

Developed using MERN Stack + AI Integration.
