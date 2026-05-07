import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="text-center max-w-3xl px-6">
        <h1 className="text-6xl font-bold mb-6">
          Smart Interview Coach
        </h1>

        <p className="text-xl mb-8 text-gray-100">
          AI-powered interview preparation platform with analytics,
          mock interviews and intelligent feedback.
        </p>

        <div className="flex justify-center gap-5">
          <Link
            href="/login"
            className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-black/30 px-8 py-3 rounded-xl border border-white"
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}