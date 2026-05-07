# Smart Interview Coach

An AI-powered full-stack interview preparation platform that helps students and job seekers practice technical and HR interviews using AI-generated questions, analytics, and feedback systems.

---

# Features

## Candidate Features
- User Authentication (Login/Signup)
- AI-based Mock Interviews
- Role-based Interview Generation
- Difficulty Selection
- Voice & Text Interview Modes
- AI Feedback & Scoring
- Performance Analytics Dashboard
- Interview History Tracking
- Downloadable Reports

## Admin Features
- Admin Dashboard
- User Management
- Question Bank Management
- Category Management
- Analytics Monitoring
- Feedback Moderation
- Premium Subscription Management

---

# Technology Stack

## Frontend
- Next.js
- Tailwind CSS
- ShadCN UI
- Recharts
- Axios
- Framer Motion

## Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt

## AI Integration
- OpenRouter API

---

# Project Architecture

The project follows a layered MERN stack architecture:

Users
↓
Frontend (Next.js)
↓
REST APIs
↓
Backend (Express.js)
↓
AI Integration Layer
↓
MongoDB Database

---

# Folder Structure

```bash
smart_interview_coach
│
├── backend
│   ├── api
│   ├── config
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   └── index.js
│
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   ├── public
│   └── styles
│
└── README.md
