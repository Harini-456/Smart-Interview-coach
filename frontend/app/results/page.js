"use client";
import { useState } from "react";
import API from "@/lib/api";

export default function Results() {
  const interview = JSON.parse(localStorage.getItem("interview"));
  const [answers, setAnswers] = useState([]);

  const submit = async () => {
    const res = await API.post(
      `/interview/answer/${interview.interviewId}`,
      { answers }
    );

    alert("Score: " + res.data.totalScore);
  };

  return (
    <div className="p-6">
      {interview.questions.map((q, i) => (
        <div key={i}>
          <p>{q.question}</p>
          <input onChange={(e)=>{
            const newAns = [...answers];
            newAns[i] = e.target.value;
            setAnswers(newAns);
          }} />
        </div>
      ))}

      <button onClick={submit}>Submit</button>
    </div>
  );
}