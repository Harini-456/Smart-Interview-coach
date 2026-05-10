"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function Navbar({ title }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {title && <h2 className="font-semibold text-foreground">{title}</h2>}
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-all text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}
      </div>
    </header>
  );
}
