"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import { History, Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, X, Brain, Calendar, Tag } from "lucide-react";

const getInsight = (score) => {
  if (score >= 90) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "bg-emerald-500", emoji: "🏆", commentary: "Outstanding! You demonstrated expert-level knowledge. Keep it up!" };
  if (score >= 75) return { label: "Good", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", bar: "bg-blue-500", emoji: "👍", commentary: "Strong performance. A little more depth in answers will push you to the top." };
  if (score >= 50) return { label: "Average", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", bar: "bg-amber-500", emoji: "📈", commentary: "Decent attempt. Focus on elaborating answers and revisiting core concepts." };
  if (score >= 25) return { label: "Needs Work", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", bar: "bg-orange-500", emoji: "📚", commentary: "More preparation needed. Review fundamentals and practice detailed answers." };
  return { label: "Poor", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", bar: "bg-red-500", emoji: "⚠️", commentary: "Very low score. Study the basics thoroughly and try shorter sessions first." };
};

export default function HistoryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    API.get(`/interview/history/${userId}`)
      .then((res) => setData(res.data.interviews))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading your history..." />;

  const completed = data.filter((i) => i.status === "completed");
  const avgScore = completed.length ? Math.round(completed.reduce((s, i) => s + (i.totalScore || 0), 0) / completed.length) : 0;
  const bestScore = completed.length ? Math.max(...completed.map((i) => i.totalScore || 0)) : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 space-y-6">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground">Interview History</h1>
            <p className="text-muted-foreground mt-1 text-sm">Review your past sessions and track your growth</p>
          </motion.div>

          {/* Summary cards */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Sessions", value: data.length, icon: History, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Average Score", value: `${avgScore}/100`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Best Score", value: `${bestScore}/100`, icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map((card, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
            ))}
          </motion.div>

          {/* List */}
          {data.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <Brain size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-foreground font-medium">No interviews yet</p>
              <p className="text-muted-foreground text-sm mt-1">Start an interview to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item, index) => {
                const insight = getInsight(item.totalScore || 0);
                const prev = data[index + 1]?.totalScore;
                const trend = prev === undefined ? null : item.totalScore > prev ? "up" : item.totalScore < prev ? "down" : "same";

                return (
                  <motion.div key={item._id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -1 }}
                    onClick={() => setSelected(item)}
                    className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                            <Brain size={16} className="text-indigo-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{item.role}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.category && <span className="text-xs text-muted-foreground">{item.category}</span>}
                              {item.level && <><span className="text-muted-foreground/30">·</span><span className="text-xs text-muted-foreground capitalize">{item.level}</span></>}
                              {item.type && <><span className="text-muted-foreground/30">·</span><span className="text-xs text-muted-foreground capitalize">{item.type}</span></>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-12">
                          {item.status === "completed" && (
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${insight.bg} ${insight.color}`}>
                              {insight.emoji} {insight.label}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(item.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 ml-4">
                        {item.status === "completed" ? (
                          <>
                            <div className="flex items-center gap-2">
                              {trend === "up" && <TrendingUp size={14} className="text-emerald-500" />}
                              {trend === "down" && <TrendingDown size={14} className="text-red-500" />}
                              {trend === "same" && <Minus size={14} className="text-muted-foreground" />}
                              <p className={`text-2xl font-bold ${insight.color}`}>
                                {item.totalScore}<span className="text-xs text-muted-foreground font-normal">/100</span>
                              </p>
                            </div>
                            <div className="w-20 bg-muted rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${insight.bar}`} style={{ width: `${item.totalScore}%` }} />
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Incomplete</span>
                        )}
                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg h-full bg-card border-l border-border overflow-y-auto">

              <div className="sticky top-0 bg-card/90 backdrop-blur-xl border-b border-border p-5 flex items-center justify-between z-10">
                <div>
                  <h2 className="font-bold text-foreground">{selected.role}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Interview Details</p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-all">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {selected.status === "completed" && (() => {
                  const ins = getInsight(selected.totalScore || 0);
                  return (
                    <div className={`rounded-2xl p-5 border ${ins.bg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Final Score</p>
                          <p className={`text-5xl font-extrabold ${ins.color}`}>
                            {selected.totalScore}<span className="text-lg text-muted-foreground font-normal">/100</span>
                          </p>
                        </div>
                        <span className="text-4xl">{ins.emoji}</span>
                      </div>
                      <div className="w-full bg-background/50 rounded-full h-2 mb-3">
                        <div className={`h-2 rounded-full ${ins.bar}`} style={{ width: `${selected.totalScore}%` }} />
                      </div>
                      <p className={`text-sm font-semibold ${ins.color} mb-1`}>{ins.label}</p>
                      <p className="text-sm text-muted-foreground">{ins.commentary}</p>
                    </div>
                  );
                })()}

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  {[["Category", selected.category], ["Type", selected.type], ["Difficulty", selected.level],
                    ["Experience", selected.experienceLevel],
                    ["Date", new Date(selected.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })],
                    ["Status", selected.status]
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="bg-muted rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                {selected.feedback?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 text-sm">Question Feedback</h3>
                    <div className="space-y-3">
                      {selected.feedback.map((fb, i) => (
                        <div key={i} className={`rounded-xl p-4 border ${fb.score > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium text-foreground">Q{i + 1}</span>
                            <span className={`text-sm font-bold ${fb.score > 0 ? "text-emerald-500" : "text-red-500"}`}>{fb.score} pts</span>
                          </div>
                          {selected.questions?.[i] && (
                            <p className="text-xs text-muted-foreground italic mb-1.5">"{selected.questions[i].question}"</p>
                          )}
                          <p className="text-xs text-foreground">{fb.text}</p>
                          {selected.answers?.[i] && (
                            <p className="text-xs text-muted-foreground mt-1.5 border-t border-border pt-1.5">
                              Your answer: {selected.answers[i]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
