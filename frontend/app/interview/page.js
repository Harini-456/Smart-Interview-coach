"use client";
import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Interview() {
  const [form, setForm] = useState({
    role: "",
    type: "technical",
    level: "beginner",
  });

  const router = useRouter();

  const startInterview = async () => {
    const userId = localStorage.getItem("userId");

    const res = await API.post("/interview/start", {
      userId,
      ...form,
      numQuestions: 5,
    });

    localStorage.setItem("interview", JSON.stringify(res.data));
    router.push("/results");
  };

  return (
    <div className="p-6">
      <h1>Start Interview</h1>

      <input placeholder="Role" onChange={(e)=>setForm({...form, role:e.target.value})} />

      <button onClick={startInterview} className="bg-green-500 text-white p-2">
        Start
      </button>
    </div>
  );
}