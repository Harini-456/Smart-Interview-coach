"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import API from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, Clock, Zap, Brain, Target, BookOpen, ChevronRight } from "lucide-react";

const MINUTES_PER_QUESTION = 2;

const CATEGORIES = [
  "Software Development","Frontend Development","Backend Development","Full Stack Development",
  "Mobile Development (iOS/Android)","DevOps & Cloud","Data Science & Machine Learning",
  "Artificial Intelligence","Cybersecurity","Database Administration","System Design & Architecture",
  "Embedded Systems","Blockchain & Web3","Game Development","Product Management",
  "Project Management","Business Analysis","Finance & Accounting","Marketing & Growth",
  "Sales & Business Development","Human Resources","Operations Management",
  "UI/UX Design","Graphic Design","Product Design","Data Analytics",
  "Quality Assurance & Testing","Technical Writing","Customer Success","General / Mixed",
];

const FIELD = ({ label, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default function InterviewPage() {
  const [form, setForm] = useState({
    role: "", type: "technical", questionFormat: "mixed",
    level: "intermediate", category: "Software Development",
    experienceLevel: "intermediate", numQuestions: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const timerMinutes = form.numQuestions * MINUTES_PER_QUESTION;

  const startInterview = async () => {
    setError("");
    if (!form.role.trim()) { setError("Please enter a job role to continue."); return; }
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res = await API.post("/interview/start", { userId, ...form, timerMinutes });
      localStorage.setItem("interview", JSON.stringify({ ...res.data, timerMinutes }));
      router.push("/results");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate questions. Please try again.");
      setLoading(false);
    }
  };

  if (loading) return <Loader text="AI is generating your questions..." />;

  const difficultyColors = { beginner: "text-emerald-500", intermediate: "text-amber-500", advanced: "text-red-500" };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Start New Interview</h1>
            <p className="text-muted-foreground mt-1 text-sm">Configure your AI-powered mock interview session</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Brain size={16} className="text-indigo-500" />
                </div>
                <h2 className="font-semibold text-foreground">Interview Configuration</h2>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3">
                  {error}
                </motion.div>
              )}

              {/* Role */}
              <FIELD label="Job Role" required>
                <input
                  placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                />
              </FIELD>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FIELD label="Category">
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FIELD>

                <FIELD label="Interview Type">
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </FIELD>

                <FIELD label="Question Format">
                  <Select value={form.questionFormat} onValueChange={(v) => setForm({ ...form, questionFormat: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ Only</SelectItem>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="mixed">Mixed (MCQ + Text)</SelectItem>
                    </SelectContent>
                  </Select>
                </FIELD>

                <FIELD label="Experience Level">
                  <Select value={form.experienceLevel} onValueChange={(v) => setForm({ ...form, experienceLevel: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry (0–2 yrs)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (2–5 yrs)</SelectItem>
                      <SelectItem value="senior">Senior (5+ yrs)</SelectItem>
                    </SelectContent>
                  </Select>
                </FIELD>

                <FIELD label="Difficulty Level">
                  <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </FIELD>

                <FIELD label="Number of Questions">
                  <Select value={form.numQuestions.toString()} onValueChange={(v) => setForm({ ...form, numQuestions: parseInt(v) })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions — 6 min</SelectItem>
                      <SelectItem value="5">5 Questions — 10 min</SelectItem>
                      <SelectItem value="7">7 Questions — 14 min</SelectItem>
                      <SelectItem value="10">10 Questions — 20 min</SelectItem>
                    </SelectContent>
                  </Select>
                </FIELD>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={startInterview}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all mt-2"
              >
                <PlayCircle size={18} /> Start Interview
              </motion.button>
            </motion.div>

            {/* Summary panel */}
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                  <Target size={15} className="text-indigo-500" /> Session Summary
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    ["Role", form.role || "—"],
                    ["Category", form.category],
                    ["Type", form.type],
                    ["Format", form.questionFormat],
                    ["Difficulty", form.level],
                    ["Questions", form.numQuestions],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{k}</span>
                      <span className={`font-medium capitalize text-right max-w-[140px] truncate ${k === "Difficulty" ? difficultyColors[v] || "" : "text-foreground"}`}>{v}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={13} /> Time Limit</span>
                    <span className="font-bold text-indigo-500">{timerMinutes} min</span>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Zap size={15} className="text-indigo-500" /> Tips
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {["Timer starts immediately when interview loads",
                    "For text answers, write 30+ words for full marks",
                    "MCQ answers are auto-scored instantly",
                    "You can navigate between questions freely",
                    "Exit button available if you need to quit"].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <BookOpen size={15} className="text-indigo-500" /> Scoring Guide
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    ["MCQ Correct", "Full marks", "text-emerald-500"],
                    ["MCQ Wrong", "0 marks", "text-red-500"],
                    ["Text 30+ words", "Full marks", "text-emerald-500"],
                    ["Text 10–29 words", "60% marks", "text-amber-500"],
                    ["Text < 10 words", "30% marks", "text-orange-500"],
                  ].map(([label, val, color]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-medium ${color}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
