"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import API from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import Loader from "@/components/Loader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, ReferenceLine, LabelList, AreaChart, Area,
} from "recharts";
import { Brain, Trophy, Activity, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-indigo-500 font-bold">Score: {score}/100</p>
      <p className="text-muted-foreground text-xs">{payload[0].payload.category}</p>
    </div>
  );
};

const getBarColor = (score) => {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
};

const getInsightLabel = (score) => {
  if (score >= 90) return { label: "Excellent", color: "text-emerald-500" };
  if (score >= 75) return { label: "Good", color: "text-blue-500" };
  if (score >= 50) return { label: "Average", color: "text-amber-500" };
  return { label: "Needs Work", color: "text-red-500" };
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setUserName(localStorage.getItem("userName") || "there");
    if (!userId) { router.push("/login"); return; }
    API.get(`/interview/analytics/${userId}`)
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [router]);

  if (!data) return <Loader text="Loading your dashboard..." />;

  const chartData = data.recent.map((item) => ({
    ...item,
    role: item.role?.length > 12 ? item.role.slice(0, 12) + "…" : item.role,
  }));

  const avgScore = parseFloat(data.averageScore) || 0;
  const bestScore = data.recent.length > 0 ? Math.max(...data.recent.map((r) => r.totalScore || 0)) : 0;

  const areaData = [...data.recent].map((item, i) => ({
    session: `S${i + 1}`,
    score: item.totalScore || 0,
  }));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 space-y-6">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Good day, <span className="gradient-text">{userName.split(" ")[0]}</span> 👋
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Here's your interview performance overview.</p>
            </div>
            <Link href="/interview">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow">
                <Sparkles size={15} /> New Interview <ArrowRight size={15} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Stat cards */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Total Interviews" value={data.totalInterviews}
              icon={<Brain size={18} />} subtitle="All time" color="blue" />
            <DashboardCard title="Average Score" value={`${avgScore}`}
              icon={<Trophy size={18} />} subtitle="Out of 100" color="yellow" />
            <DashboardCard title="Recent Sessions" value={data.recent.length}
              icon={<Activity size={18} />} subtitle="Last 5 interviews" color="green" />
            <DashboardCard title="Best Score" value={bestScore}
              icon={<TrendingUp size={18} />} subtitle="Personal best" color="purple" />
          </motion.div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Bar chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-foreground text-lg">Performance Analytics</h2>
                  <p className="text-muted-foreground text-xs mt-0.5">Score per interview session</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />≥75</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />50–74</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />&lt;50</span>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-muted-foreground">
                  <Brain size={40} className="mb-3 opacity-20" />
                  <p className="text-sm">No data yet — complete an interview first.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 24, right: 10, left: -10, bottom: 10 }} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="role" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} dy={6} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", radius: 8 }} />
                    {avgScore > 0 && (
                      <ReferenceLine y={avgScore} stroke="#6366f1" strokeDasharray="5 4"
                        label={{ value: `Avg ${avgScore}`, position: "insideTopRight", fill: "#6366f1", fontSize: 10, fontWeight: 600 }} />
                    )}
                    <Bar dataKey="totalScore" radius={[8, 8, 0, 0]} maxBarSize={52}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={getBarColor(entry.totalScore)} />
                      ))}
                      <LabelList dataKey="totalScore" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "var(--foreground)" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Area trend */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col">
              <h2 className="font-bold text-foreground text-lg mb-1">Score Trend</h2>
              <p className="text-muted-foreground text-xs mb-5">Progress over sessions</p>
              {areaData.length < 2 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Need 2+ sessions
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={areaData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: "#6366f1", r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* Recent interviews */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-foreground text-lg">Recent Interviews</h2>
              <Link href="/history" className="text-indigo-500 hover:text-indigo-400 text-sm font-medium flex items-center gap-1 transition-colors">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {data.recent.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Brain size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No interviews yet. <Link href="/interview" className="text-indigo-500 hover:underline">Start one now →</Link></p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...data.recent].reverse().map((item, i) => {
                  const insight = getInsightLabel(item.totalScore || 0);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                          <Brain size={18} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{item.role}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{item.category || "General"}</span>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-xs text-muted-foreground capitalize">{item.level || "intermediate"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${insight.color}`}>
                          {item.totalScore}<span className="text-xs text-muted-foreground font-normal">/100</span>
                        </p>
                        <p className={`text-xs font-medium ${insight.color}`}>{insight.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

        </main>
      </div>
    </div>
  );
}
