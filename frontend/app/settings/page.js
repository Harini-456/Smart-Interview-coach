"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { User, Mail, Lock, Sun, Moon, Shield, LogOut, Camera, Check, Eye, EyeOff } from "lucide-react";

const Section = ({ title, desc, children }) => (
  <div className="bg-card border border-border rounded-2xl p-6">
    <div className="mb-5">
      <h2 className="font-semibold text-foreground">{title}</h2>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
    {children}
  </div>
);

const Field = ({ label, icon: Icon, type = "text", value, onChange, placeholder, disabled }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />}
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-background border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 disabled:opacity-50 transition-all"
        />
        {type === "password" && (
          <button onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  useEffect(() => {
    setMounted(true);
    setProfile({
      name: localStorage.getItem("userName") || "",
      email: "",
    });
  }, []);

  const saveProfile = () => {
    localStorage.setItem("userName", profile.name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const logout = () => {
    ["token","userId","userRole","userName"].forEach(k => localStorage.removeItem(k));
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 space-y-5 max-w-2xl">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your account preferences</p>
          </motion.div>

          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Section title="Profile" desc="Update your personal information">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                    {profile.name.charAt(0).toUpperCase() || "U"}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md">
                    <Camera size={12} className="text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-foreground">{profile.name || "Your Name"}</p>
                  <p className="text-xs text-muted-foreground">Click the camera to update photo</p>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="Full Name" icon={User} value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your full name" />
                <Field label="Email Address" icon={Mail} value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your@email.com" type="email" />
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={saveProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all">
                  {saved ? <><Check size={15} /> Saved!</> : "Save Changes"}
                </motion.button>
              </div>
            </Section>
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Section title="Change Password" desc="Use a strong password with at least 6 characters">
              <div className="space-y-4">
                <Field label="Current Password" icon={Lock} type="password" value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" />
                <Field label="New Password" icon={Lock} type="password" value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="••••••••" />
                <Field label="Confirm New Password" icon={Lock} type="password" value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="••••••••" />
                <button className="px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-all">
                  Update Password
                </button>
              </div>
            </Section>
          </motion.div>

          {/* Appearance */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Section title="Appearance" desc="Choose your preferred theme">
              {mounted && (
                <div className="flex gap-3">
                  {[
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "dark", icon: Moon, label: "Dark" },
                  ].map((t) => (
                    <button key={t.value} onClick={() => setTheme(t.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                        theme === t.value
                          ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-500"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}>
                      <t.icon size={16} /> {t.label}
                      {theme === t.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </Section>
          </motion.div>

          {/* Privacy */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Section title="Privacy & Security" desc="Manage your account security settings">
              <div className="space-y-3">
                {[
                  { label: "Two-Factor Authentication", desc: "Add an extra layer of security", badge: "Coming Soon" },
                  { label: "Login History", desc: "View recent login activity", badge: "Coming Soon" },
                  { label: "Profile Visibility", desc: "Control who can see your profile", badge: "Coming Soon" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Shield size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-muted border border-border text-muted-foreground px-2.5 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h2 className="font-semibold text-foreground mb-1">Danger Zone</h2>
              <p className="text-xs text-muted-foreground mb-4">These actions are irreversible.</p>
              <button onClick={() => setShowLogout(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-all">
                <LogOut size={15} /> Sign Out of Account
              </button>
            </div>
          </motion.div>

        </main>
      </div>

      {/* Logout confirm */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Sign out?</h3>
            <p className="text-muted-foreground text-sm mb-6">You will be redirected to the login page.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-all">
                Cancel
              </button>
              <button onClick={logout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
