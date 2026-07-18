"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Play, Calendar, Cpu, Clock, CheckSquare,
  TrendingUp, TrendingDown, ClipboardList
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { examinerService, ExaminerStatsResponse } from "@/services/examiner";

const sectionAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

const cardClass = "bg-slate-900 border border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-indigo-500/20 transition-all duration-300";

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(51, 65, 85, 0.5)",
  borderRadius: 12,
  color: "#f1f5f9",
  fontSize: 12,
};

const axisStyle = { fill: "#64748b", fontSize: 11 };

const iconMap: Record<string, React.ElementType> = {
  BookOpen, Play, Calendar, Cpu, Clock, CheckSquare
};

const colorMap: Record<string, { icon: string; iconBg: string; badge: string; bar: string }> = {
  indigo:  { icon: "text-indigo-400",  iconBg: "bg-indigo-500/10 border-indigo-500/20",  badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",  bar: "bg-indigo-500/50" },
  emerald: { icon: "text-emerald-400", iconBg: "bg-emerald-500/10 border-emerald-500/20",badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",bar: "bg-emerald-500/50" },
  blue:    { icon: "text-blue-400",    iconBg: "bg-blue-500/10 border-blue-500/20",      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",      bar: "bg-blue-500/50" },
  violet:  { icon: "text-purple-400",  iconBg: "bg-purple-500/10 border-purple-500/20",  badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",  bar: "bg-purple-500/50" },
  orange:  { icon: "text-orange-400",  iconBg: "bg-orange-500/10 border-orange-500/20",  badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",  bar: "bg-orange-500/50" },
  teal:    { icon: "text-teal-400",    iconBg: "bg-teal-500/10 border-teal-500/20",      badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",      bar: "bg-teal-500/50" }
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<ExaminerStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await examinerService.getStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load statistics", err);
        setError("Failed to load dashboard data. Check backend connection.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
        <span className="text-3xl">⚠️</span>
        <p className="text-slate-200 font-semibold">Error Loading Analytics</p>
        <p className="text-xs text-slate-500 max-w-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-slate-100 font-semibold text-xs rounded-xl hover:bg-indigo-500 transition-all shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...sectionAnim}>
        <h1 className="text-xl font-bold text-slate-100">Examiner Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Configure academic papers, proctoring assessments, and AI grading workflows</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.section {...sectionAnim} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.overviewStats.map((stat, i) => {
          const Icon = iconMap[stat.icon] ?? BookOpen;
          const c = colorMap[stat.color] ?? colorMap.indigo;
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className="group bg-slate-900 border border-slate-800/60 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl border ${c.iconBg}`}>
                  <Icon className={`w-4 h-4 ${c.icon}`} />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                  {isPositive ? "+" : ""}{stat.change}%
                </span>
              </div>
              <div>
                <p className="text-xl font-black text-slate-100 tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Charts section */}
      <motion.section {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Exam Completion */}
        <div className={cardClass}>
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400">Exam Completion Rate</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={stats.completionRate}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {stats.completionRate.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#64748b" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Questions per month */}
        <div className={cardClass}>
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400">Questions Created</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={stats.questionsCreatedMonth}>
              <defs>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#createdGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Score */}
        <div className={cardClass}>
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400">Average Scores</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.averageScores} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Extra details (Difficulty, Accuracy) */}
      <motion.section {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Difficulty */}
        <div className={cardClass}>
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400">Difficulty Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={stats.difficultyDistribution}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                nameKey="level"
              >
                {stats.difficultyDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy */}
        <div className={cardClass}>
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400">AI Evaluation Accuracy</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={stats.aiGradingAccuracy}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={2} fill="url(#accGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Activities & Upcoming exams */}
      <motion.section {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activities */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800/60 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-400 mb-4">Recent activity</h3>
          <div className="relative border-l border-slate-800/60 ml-2.5 pl-4 space-y-4">
            {stats.recentActivity.map((act) => (
              <div key={act.id} className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-slate-950" />
                <p className="text-xs font-semibold text-slate-200">{act.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{act.desc}</p>
                <span className="text-[9px] text-indigo-400 mt-1 block">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/60 rounded-2xl p-5 shadow-sm overflow-x-auto scrollbar-thin">
          <h3 className="text-xs font-semibold text-slate-400 mb-4">Upcoming exams</h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                <th className="pb-3">Exam</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Start Time</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Students</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcomingExams.map((ex) => (
                <tr key={ex.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">{ex.exam}</td>
                  <td className="py-3 text-slate-400">{ex.subject}</td>
                  <td className="py-3 text-slate-400">{ex.start_time}</td>
                  <td className="py-3 text-slate-400">{ex.duration}m</td>
                  <td className="py-3 text-indigo-400">{ex.students} candidates</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400">
                      {ex.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
