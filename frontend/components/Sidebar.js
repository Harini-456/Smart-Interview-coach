"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  History,
  Brain,
  Shield,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 p-5">
      <h1 className="text-2xl font-bold mb-10">SIC</h1>

      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:bg-slate-800 p-3 rounded-lg"
        >
          <LayoutDashboard size={20} /> Dashboard
        </Link>

        <Link
          href="/interview"
          className="flex items-center gap-3 hover:bg-slate-800 p-3 rounded-lg"
        >
          <Brain size={20} /> Start Interview
        </Link>

        <Link
          href="/history"
          className="flex items-center gap-3 hover:bg-slate-800 p-3 rounded-lg"
        >
          <History size={20} /> History
        </Link>

        <Link
          href="/admin"
          className="flex items-center gap-3 hover:bg-slate-800 p-3 rounded-lg"
        >
          <Shield size={20} /> Admin
        </Link>
      </div>
    </div>
  );
}