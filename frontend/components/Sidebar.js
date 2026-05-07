"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, History, Brain, Shield, LogOut, Settings, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("userRole") === "admin");
    setUserName(localStorage.getItem("userName") || "User");
  }, []);

  const confirmLogout = () => {
    ["token","userId","userRole","userName"].forEach(k => localStorage.removeItem(k));
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/interview", icon: Brain, label: "Start Interview" },
    { href: "/history", icon: History, label: "History" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      <aside className="w-64 h-screen bg-[oklch(0.1_0.015_240)] border-r border-white/5 fixed left-0 top-0 flex flex-col z-40">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">SIC</p>
              <p className="text-[10px] text-white/30 mt-0.5">Smart Interview Coach</p>
            </div>
          </Link>
        </div>

        {/* User card */}
        <div className="p-4">
          <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-[11px] text-white/30">{isAdmin ? "Administrator" : "Candidate"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mb-2">Navigation</p>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white border border-indigo-500/20"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.icon size={17} className={active ? "text-indigo-400" : ""} />
                    {link.label}
                  </div>
                  {active && <ChevronRight size={14} className="text-indigo-400" />}
                </motion.div>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mt-4 mb-2">Admin</p>
              <Link href="/admin">
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    pathname === "/admin"
                      ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white border border-indigo-500/20"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield size={17} className={pathname === "/admin" ? "text-indigo-400" : ""} />
                    Admin Panel
                  </div>
                  {pathname === "/admin" && <ChevronRight size={14} className="text-indigo-400" />}
                </motion.div>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[oklch(0.15_0.015_240)] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-2">Sign out?</h3>
            <p className="text-white/50 text-sm mb-6">You will be redirected to the login page.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm transition-all">
                Cancel
              </button>
              <button onClick={confirmLogout} className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-all">
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
