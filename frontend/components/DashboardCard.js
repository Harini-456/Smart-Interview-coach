"use client";
import { motion } from "framer-motion";

const gradients = {
  blue:   "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
  yellow: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
  green:  "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
  purple: "from-violet-500/10 to-purple-500/10 border-violet-500/20",
  red:    "from-red-500/10 to-rose-500/10 border-red-500/20",
};

const iconBg = {
  blue:   "bg-blue-500/15 text-blue-500",
  yellow: "bg-amber-500/15 text-amber-500",
  green:  "bg-emerald-500/15 text-emerald-500",
  purple: "bg-violet-500/15 text-violet-500",
  red:    "bg-red-500/15 text-red-500",
};

export default function DashboardCard({ title, value, icon, subtitle, color = "blue", trend }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`bg-gradient-to-br ${gradients[color]} border rounded-2xl p-5 backdrop-blur-sm premium-card`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`inline-flex items-center gap-1 text-xs font-medium mt-2 ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last session
        </div>
      )}
    </motion.div>
  );
}
