"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import Loader from "@/components/Loader";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  Brain,
  Trophy,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) return;

    API.get(`/interview/analytics/${userId}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  if (!data) return <Loader />;

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="ml-64 w-full">
        <Navbar />

        <div className="p-8">

          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-slate-800">
              Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Track your interview performance and AI feedback.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            <DashboardCard
              title="Total Interviews"
              value={data.totalInterviews}
              icon={<Brain className="text-blue-600" />}
            />

            <DashboardCard
              title="Average Score"
              value={data.averageScore}
              icon={<Trophy className="text-yellow-500" />}
            />

            <DashboardCard
              title="Recent Sessions"
              value={data.recent.length}
              icon={<Activity className="text-green-600" />}
            />

          </div>

          {/* CHART */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Performance Analytics
                </h2>

                <p className="text-slate-500">
                  AI evaluated interview scores
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.recent}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="role"
                  tick={{ fontSize: 12 }}
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="totalScore"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* RECENT INTERVIEWS */}
          <div className="mt-10 bg-white rounded-3xl shadow-sm border p-8">

            <h2 className="text-2xl font-bold mb-6">
              Recent Interviews
            </h2>

            <div className="space-y-5">

              {data.recent.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-2xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">

                    <div>
                      <h3 className="font-bold text-lg">
                        {item.role}
                      </h3>

                      <p className="text-slate-500">
                        {item.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {item.totalScore}
                      </p>

                      <p className="text-sm text-slate-500">
                        {item.status}
                      </p>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}