"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, Search } from "lucide-react";

export default function Navbar({ title }) {
  const { theme, setTheme } = useTheme();
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserName(localStorage.getItem("userName") || "User");
  }, []);

  return (
    <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {title && <h2 className="font-semibold text-foreground">{title}</h2>}
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-3 py-2 text-sm text-muted-foreground">
          <Search size={14} />
          <span>Quick search...</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-all text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        {/* Notifications */}
        <button className="w-9 h-9 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-all text-muted-foreground hover:text-foreground relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
