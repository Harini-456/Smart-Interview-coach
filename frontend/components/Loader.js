"use client";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30"
      >
        <Brain size={24} className="text-white" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-muted-foreground text-sm font-medium"
      >
        {text}
      </motion.p>
    </div>
  );
}
