"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const login = async () => {
    try {
      const res = await API.post("/user/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);

      router.push("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-[400px]">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Login
        </h1>

        <div className="flex flex-col gap-5">
          <input
            className="border p-4 rounded-xl"
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            className="border p-4 rounded-xl"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            onClick={login}
            className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}