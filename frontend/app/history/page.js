"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function History() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    API.get(`/interview/history/${userId}`)
      .then(res => setData(res.data.interviews));
  }, []);

  return (
    <div className="p-6">
      <h1>History</h1>

      {data.map((i) => (
        <div key={i._id} className="bg-white p-3 my-2">
          {i.role} - {i.totalScore}
        </div>
      ))}
    </div>
  );
}