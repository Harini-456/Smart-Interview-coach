"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const signup = async () => {
  try {
    console.log(form);

    const res = await API.post("/user/signup", form);

    console.log(res.data);

    alert("Signup successful");

    router.push("/login");

  } catch (err) {
    console.log(err);

    alert(
      err.response?.data?.message ||
      err.message ||
      "Signup failed, Try agian later"
    );
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-[400px]">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Signup
        </h1>

        <div className="flex flex-col gap-5">
          <input
            className="border p-4 rounded-xl"
            placeholder="Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

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
            onClick={signup}
            className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}