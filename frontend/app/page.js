"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, TrendingUp, Shield, Zap, Star } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Questions", desc: "Adaptive questions tailored to your role, level, and domain." },
  { icon: TrendingUp, title: "Performance Analytics", desc: "Track progress with rich charts and detailed score breakdowns." },
  { icon: Zap, title: "Instant Feedback", desc: "Get scored and reviewed immediately after every session." },
  { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted and never shared with third parties." },
];

const stats = [
  { value: "50+", label: "Job Categories" },
  { value: "3", label: "Difficulty Levels" },
  { value: "100", label: "Max Score" },
  { value: "AI", label: "Powered Engine" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen animated-bg text-white overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-black">SIC</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/login"
            className="px-5 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/25"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-32 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm mb-8 backdrop-blur-sm text-black"
        >
          <Sparkles size={14} className="text-yellow-400" />
          <span>AI-Powered Interview Coaching Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 text-white"
        >
          Smart Interview
          <br />
          <span className="gradient-text">Coach</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-light text-white mb-4 italic"
        >
          &ldquo;Elevate your professional narrative!&rdquo;
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-white max-w-2xl mb-12"
        >
          Practice with AI-generated questions, get instant feedback, track your progress,
          and walk into every interview with confidence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/signup"
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
          >
            Start for Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium bg-white/10 hover:bg-white/15 border border-white/20 transition-all backdrop-blur-sm"
          >
            Already registered? Sign In
          </Link>
        </motion.div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-1 mt-8 text-yellow-400"
        >
          {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          <span className="text-black/60 text-sm ml-2">Trusted by students & professionals</span>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center">
              <p className="text-3xl font-extrabold gradient-text mb-1">{stat.value}</p>
              <p className="text-black/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-3">Everything you need to succeed</h2>
          <p className="text-black/60">Built for serious candidates who want real results.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 flex gap-4 hover:bg-white/15 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <f.icon size={22} className="text-indigo-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-black">{f.title}</h3>
                <p className="text-black/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-black">Ready to ace your next interview?</h2>
          <p className="text-black/60 mb-8">Join now and start practicing with AI-powered mock interviews.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition-all shadow-2xl shadow-indigo-500/30 hover:scale-105"
          >
            Create Free Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-black/40 text-sm">
        © 2026 Smart Interview Coach · Built with AI
      </footer>
    </div>
  );
}
