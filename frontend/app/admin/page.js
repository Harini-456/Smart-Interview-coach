"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, TrendingUp, Award, Trash2, Ban, CheckCircle, Shield, X, Eye } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-card border border-border rounded-2xl p-5`}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={17} />
      </div>
    </div>
    <p className="text-3xl font-bold text-foreground">{value}</p>
  </div>
);

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInterviews, setUserInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin") { setAccessDenied(true); setLoading(false); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [aRes, uRes] = await Promise.all([API.get("/admin/analytics"), API.get("/admin/users")]);
      setAnalytics(aRes.data);
      setUsers(uRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const viewUser = async (user) => {
    const res = await API.get(`/admin/user-interviews/${user._id}`);
    setUserInterviews(res.data.interviews);
    setSelectedUser(user);
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user and all their interviews?")) return;
    await API.delete(`/admin/user/${id}`);
    loadData();
  };

  const toggleBlock = async (user) => {
    if (user.role === "blocked") await API.put(`/admin/user/unblock/${user._id}`);
    else await API.put(`/admin/user/block/${user._id}`);
    loadData();
  };

  if (loading) return <Loader text="Loading admin panel..." />;

  if (accessDenied) return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={36} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">Only administrators can access this panel.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 space-y-6">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage users and monitor platform activity</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={analytics.totalUsers} icon={Users} color="bg-blue-500/10 text-blue-500" />
            <StatCard title="Total Interviews" value={analytics.totalInterviews} icon={FileText} color="bg-emerald-500/10 text-emerald-500" />
            <StatCard title="Completed" value={analytics.completedInterviews} icon={TrendingUp} color="bg-violet-500/10 text-violet-500" />
            <StatCard title="Avg Score" value={analytics.averageScore} icon={Award} color="bg-amber-500/10 text-amber-500" />
          </motion.div>

          {/* Top performers */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Top Performers</h2>
            <div className="space-y-3">
              {analytics.topUsers.map((u, i) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-amber-500/20 text-amber-500" : i === 1 ? "bg-slate-400/20 text-slate-400" : "bg-orange-500/20 text-orange-500"
                    }`}>{i + 1}</span>
                    <span className="text-sm font-medium text-foreground">{u.name}</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-500">{u.avgScore}/100</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Users table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Name","Email","Role","Interviews","Avg Score","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 font-medium text-foreground">{user.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">{user.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          user.role === "admin" ? "bg-indigo-500/10 text-indigo-500"
                          : user.role === "blocked" ? "bg-red-500/10 text-red-500"
                          : "bg-emerald-500/10 text-emerald-500"
                        }`}>{user.role}</span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{user.totalInterviews}</td>
                      <td className="py-3 pr-4 font-semibold text-foreground">{user.avgScore}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => viewUser(user)}
                            className="w-7 h-7 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-all" title="View interviews">
                            <Eye size={13} className="text-muted-foreground" />
                          </button>
                          {user.role !== "admin" && (
                            <>
                              <button onClick={() => toggleBlock(user)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                  user.role === "blocked" ? "bg-emerald-500/10 hover:bg-emerald-500/20" : "bg-amber-500/10 hover:bg-amber-500/20"
                                }`} title={user.role === "blocked" ? "Unblock" : "Block"}>
                                {user.role === "blocked"
                                  ? <CheckCircle size={13} className="text-emerald-500" />
                                  : <Ban size={13} className="text-amber-500" />}
                              </button>
                              <button onClick={() => deleteUser(user._id)}
                                className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all" title="Delete">
                                <Trash2 size={13} className="text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent interviews */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Recent Interviews</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Role","Category","Type","Status","Score","Date"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analytics.recentInterviews.map((iv) => (
                    <tr key={iv._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 font-medium text-foreground">{iv.role}</td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">{iv.category}</td>
                      <td className="py-3 pr-4 text-muted-foreground capitalize">{iv.type}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          iv.status === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                        }`}>{iv.status}</span>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-foreground">{iv.totalScore || 0}</td>
                      <td className="py-3 text-muted-foreground text-xs">{new Date(iv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>

      {/* User interviews slide panel */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end"
            onClick={() => setSelectedUser(null)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg h-full bg-card border-l border-border overflow-y-auto">
              <div className="sticky top-0 bg-card/90 backdrop-blur-xl border-b border-border p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-foreground">{selectedUser.name}</h2>
                  <p className="text-xs text-muted-foreground">{userInterviews.length} interviews</p>
                </div>
                <button onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-all">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                {userInterviews.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No interviews found.</p>
                ) : userInterviews.map((iv) => (
                  <div key={iv._id} className="bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground text-sm">{iv.role}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{iv.type} · {iv.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{iv.totalScore || 0}/100</p>
                        <p className="text-xs text-muted-foreground">{new Date(iv.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
