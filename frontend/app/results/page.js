"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import API from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Send, Clock, AlertTriangle, XCircle, Trophy, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const getInsight = (score) => {
  if (score >= 90) return { label: "Excellent", emoji: "🏆", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "bg-emerald-500" };
  if (score >= 75) return { label: "Good", emoji: "👍", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", bar: "bg-blue-500" };
  if (score >= 50) return { label: "Average", emoji: "📈", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", bar: "bg-amber-500" };
  if (score >= 25) return { label: "Needs Work", emoji: "📚", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", bar: "bg-orange-500" };
  return { label: "Poor", emoji: "⚠️", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", bar: "bg-red-500" };
};

export default function ResultsPage() {
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const timerRef = useRef(null);
  const answersRef = useRef([]);
  const router = useRouter();

  useEffect(() => { answersRef.current = answers; }, [answers]);

  const submitInterview = useCallback(async (forced) => {
    const finalAnswers = forced || answersRef.current;
    setLoading(true);
    clearInterval(timerRef.current);
    try {
      const data = JSON.parse(localStorage.getItem("interview") || "null");
      if (!data) return;
      const res = await API.post(`/interview/answer/${data.interviewId}`, { answers: finalAnswers });
      setResult(res.data);
      setSubmitted(true);
      localStorage.removeItem("interview");
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("interview");
    if (!stored) { router.push("/interview"); return; }
    const data = JSON.parse(stored);
    setInterview(data);
    const init = new Array(data.questions.length).fill("");
    setAnswers(init);
    answersRef.current = init;
    const secs = (data.timerMinutes || data.questions.length * 2) * 60;
    setTimeLeft(secs);
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => { if (p <= 1) { clearInterval(timerRef.current); setTimeUp(true); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [router]);

  useEffect(() => { if (timeUp && !submitted) submitInterview(answersRef.current); }, [timeUp, submitted, submitInterview]);

  const setAnswer = (val) => {
    const a = [...answers]; a[currentQ] = val; setAnswers(a);
  };

  const handleSubmit = async () => {
    const bad = answers.findIndex((a) => !a?.trim());
    if (bad !== -1) { alert(`Please answer question ${bad + 1}`); setCurrentQ(bad); return; }
    await submitInterview(answers);
  };

  const formatTime = (s) => {
    if (s === null) return "--:--";
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  const isWarning = timeLeft !== null && timeLeft <= 60;

  if (!interview || loading) return <Loader text={loading ? "Submitting your answers..." : "Loading interview..."} />;

  // ── Results screen ──
  if (submitted && result) {
    const insight = getInsight(result.totalScore);
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64 flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden">

                {/* Score header */}
                <div className={`p-8 text-center border-b border-border ${insight.bg}`}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                    className="text-5xl mb-3">{insight.emoji}</motion.div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {timeUp ? "Time's Up!" : "Interview Complete!"}
                  </h1>
                  <p className="text-muted-foreground text-sm mb-6">
                    {timeUp ? "Auto-submitted when timer ended." : "Great job completing the session."}
                  </p>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <p className={`text-7xl font-extrabold ${insight.color} leading-none`}>
                      {result.totalScore}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">out of 100</p>
                    <div className="w-full bg-border rounded-full h-2.5 mt-4 max-w-xs mx-auto">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.totalScore}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-2.5 rounded-full ${insight.bar}`} />
                    </div>
                    <p className={`text-sm font-semibold mt-2 ${insight.color}`}>{insight.label}</p>
                  </motion.div>
                </div>

                {/* Feedback */}
                <div className="p-6 space-y-3">
                  <h3 className="font-semibold text-foreground mb-4">Question Breakdown</h3>
                  {result.feedback.map((fb, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className={`rounded-xl p-4 border ${fb.score > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">Q{i + 1}</span>
                        <span className={`text-sm font-bold ${fb.score > 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {fb.score} pts
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{fb.text}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Trophy size={16} /> Dashboard
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/interview")}
                    className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted transition-all">
                    New Interview <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const question = interview.questions[currentQ];
  const progress = ((currentQ + 1) / interview.questions.length) * 100;
  const answeredCount = answers.filter((a) => a?.trim()).length;

  // ── Interview screen ──
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Question <span className="text-indigo-500">{currentQ + 1}</span> / {interview.questions.length}
                </p>
                <p className="text-xs text-muted-foreground">{answeredCount} answered</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={isWarning ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm ${
                    isWarning ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-muted text-foreground"
                  }`}>
                  {isWarning ? <AlertTriangle size={15} /> : <Clock size={15} />}
                  {formatTime(timeLeft)}
                </motion.div>
                <button onClick={() => setShowExit(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-all border border-red-500/20">
                  <XCircle size={14} /> Exit
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1.5">
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="bg-card border border-border rounded-2xl overflow-hidden">

                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      question.type === "mcq"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : "bg-violet-500/10 text-violet-500 border-violet-500/20"
                    }`}>
                      {question.type === "mcq" ? "Multiple Choice" : "Written Answer"}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground leading-relaxed">{question.question}</h2>
                </div>

                <div className="p-6">
                  {question.type === "mcq" && question.options?.length > 0 ? (
                    <RadioGroup value={answers[currentQ]} onValueChange={setAnswer}>
                      <div className="space-y-3">
                        {question.options.map((opt, i) => (
                          <motion.div key={i} whileHover={{ scale: 1.005 }}
                            onClick={() => setAnswer(opt)}
                            className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                              answers[currentQ] === opt
                                ? "border-indigo-500/50 bg-indigo-500/5"
                                : "border-border hover:bg-muted/50"
                            }`}>
                            <RadioGroupItem value={opt} id={`opt-${i}`} />
                            <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-sm">
                              <span className="font-semibold text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
                              {opt}
                            </Label>
                          </motion.div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div>
                      <Textarea
                        placeholder="Type your answer here... (aim for 30+ words for full marks)"
                        value={answers[currentQ]}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows={7}
                        className="resize-none rounded-xl text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {answers[currentQ]?.trim().split(/\s+/).filter(Boolean).length || 0} words
                        {(answers[currentQ]?.trim().split(/\s+/).filter(Boolean).length || 0) >= 30
                          ? " ✓ Full marks eligible" : " — aim for 30+"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Nav buttons */}
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={16} /> Prev
                  </button>

                  {currentQ === interview.questions.length - 1 ? (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit} disabled={!answers[currentQ]?.trim()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20">
                      <Send size={15} /> Submit Interview
                    </motion.button>
                  ) : (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentQ(Math.min(interview.questions.length - 1, currentQ + 1))}
                      disabled={!answers[currentQ]?.trim()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20">
                      Next <ChevronRight size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Question dots */}
            <div className="flex gap-2 justify-center flex-wrap">
              {interview.questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                    i === currentQ ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110"
                    : answers[i]?.trim() ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Exit modal */}
      <AnimatePresence>
        {showExit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-foreground mb-2">Exit Interview?</h3>
              <p className="text-muted-foreground text-sm mb-6">Your progress will be lost and the session won't be scored.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowExit(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-all">
                  Continue
                </button>
                <button onClick={() => { clearInterval(timerRef.current); localStorage.removeItem("interview"); router.push("/dashboard"); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
