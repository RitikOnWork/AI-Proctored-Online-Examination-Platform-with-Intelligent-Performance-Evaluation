"use client";

import React from "react";
import { useSidebar } from "@/lib/sidebar-context";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Award,
  TrendingUp,
  Target,
  FileText,
  Play,
  ArrowRight,
  Flame,
  Sparkles,
  BadgeAlert,
  Loader2,
} from "lucide-react";
import {
  useStudentProfile,
  useDashboardStats,
  useUpcomingExams,
  useSessions,
} from "@/hooks/useStudent";
import { cn } from "@/lib/utils";
import { RealExam } from "@/types/student";

export default function DashboardHome() {
  const { setActiveSection } = useSidebar();

  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: exams, isLoading: examsLoading } = useUpcomingExams();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Calendar":
        return Calendar;
      case "CheckCircle":
        return CheckCircle;
      case "Award":
        return Award;
      case "TrendingUp":
        return TrendingUp;
      case "Target":
        return Target;
      default:
        return FileText;
    }
  };

  const getExamStatus = (exam: RealExam) => {
    const hasTaken = sessions?.some((s) => s.exam_id === exam.id && s.status === "submitted");
    if (hasTaken) return "Completed";

    const now = new Date();
    const start = exam.start_time ? new Date(exam.start_time) : null;
    const end = exam.end_time ? new Date(exam.end_time) : null;

    if (start && end) {
      if (now >= start && now <= end) {
        return "Live";
      } else if (now < start) {
        return "Upcoming";
      } else {
        return "Missed";
      }
    }
    return "Live";
  };

  // Find if there are any live exams in the database list
  const liveExam = exams?.find((e) => getExamStatus(e) === "Live");

  const statCards = [
    {
      label: "Upcoming Exams",
      value: stats?.upcomingExamsCount ?? 0,
      change: 0,
      icon: "Calendar",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      graphData: [{ val: 1 }, { val: 2 }, { val: 2 }, { val: 1 }, { val: stats?.upcomingExamsCount ?? 2 }],
    },
    {
      label: "Exams Completed",
      value: stats?.completedExamsCount ?? 0,
      change: 8.3,
      icon: "CheckCircle",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      graphData: [{ val: 9 }, { val: 10 }, { val: 11 }, { val: 11 }, { val: stats?.completedExamsCount ?? 12 }],
    },
    {
      label: "Average Score",
      value: `${stats?.averageScore ?? 0}%`,
      change: 2.1,
      icon: "Award",
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
      graphData: [{ val: 81 }, { val: 82 }, { val: 81 }, { val: 83 }, { val: stats?.averageScore ?? 84 }],
    },
    {
      label: "Current Rank",
      value: `#${stats?.currentRank ?? 0}`,
      change: 12.5,
      icon: "TrendingUp",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      graphData: [{ val: 56 }, { val: 51 }, { val: 48 }, { val: 45 }, { val: stats?.currentRank ?? 42 }],
    },
    {
      label: "Practice Accuracy",
      value: `${stats?.practiceAccuracy ?? 0}%`,
      change: 1.4,
      icon: "Target",
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      graphData: [{ val: 89 }, { val: 90 }, { val: 90 }, { val: 91 }, { val: stats?.practiceAccuracy ?? 92 }],
    },
    {
      label: "Certificates",
      value: 4,
      change: 33.3,
      icon: "ShieldAlert",
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      graphData: [{ val: 2 }, { val: 3 }, { val: 3 }, { val: 3 }, { val: 4 }],
    },
  ];

  const recentActivities = sessions?.slice(0, 4).map((s) => {
    const timeText = s.completed_at
      ? new Date(s.completed_at).toLocaleDateString()
      : s.started_at
      ? new Date(s.started_at).toLocaleDateString()
      : "Recently";
    return {
      id: s.id,
      type: s.status === "submitted" ? "Exam Submitted" : "Session In-Progress",
      text: `${s.status === "submitted" ? "Completed" : "Started"} ${s.exam_name}`,
      time: timeText,
    };
  }) || [
    { id: "act1", type: "Exam Completed", text: "Submitted Discrete Mathematics Exam", time: "3 days ago" },
    { id: "act2", type: "Practice Attempt", text: "Scored 93% in SQL Queries Practice", time: "4 days ago" },
  ];

  const isLoading = profileLoading || statsLoading || examsLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-12 w-32 bg-muted/40 rounded-2xl animate-pulse" />
        </div>
        <div className="h-32 w-full bg-muted/20 border border-border/10 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-2xl border border-border/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Welcome Back, {profile?.full_name || "Student"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Ready for your next exam? Maintain your streak and check guidelines before starting.
          </p>
        </div>

        {/* Study Streak Display */}
        <div className="flex items-center gap-3 px-4.5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl shrink-0">
          <div className="p-1.5 bg-amber-500 rounded-lg text-white">
            <Flame className="w-5 h-5 fill-white animate-bounce" />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
              Study Streak
            </p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {stats?.streakDays ?? 5} Days Active!
            </p>
          </div>
        </div>
      </div>

      {/* 2. Live Exam Alert Card */}
      {liveExam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden border border-red-500/30 bg-gradient-to-r from-red-500/10 via-destructive/5 to-card rounded-2xl p-6 shadow-md text-left"
        >
          {/* Pulsing indicator */}
          <div className="absolute right-4 top-4 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase">
              Ongoing Session
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-4xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BadgeAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-foreground">
                  Your Live Exam is Active!
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                <strong>{liveExam.title}</strong> is currently waiting for your attempt. Ensure your hardware matches requirement.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-semibold pt-1">
                <span>⏱️ {liveExam.duration_minutes} Minutes</span>
                <span>❓ {liveExam.question_count || "Dynamic"} Questions</span>
                <span className="text-red-500">🛡️ AI Proctoring Mandatory</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSection("exams")}
                className="px-5 py-3 text-xs font-bold text-white bg-red-500 hover:bg-red-600 active:scale-[0.98] rounded-xl transition-all shadow-lg shadow-red-500/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Exam Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = getIcon(stat.icon);
          return (
            <motion.div
              key={idx}
              className="bg-card border border-border/40 rounded-2xl p-4.5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-left"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start">
                <div className={cn("p-2 rounded-xl border shrink-0", stat.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    stat.change >= 0
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  )}
                >
                  {stat.change >= 0 ? "+" : ""}
                  {stat.change}%
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-extrabold text-foreground mt-1 font-mono">
                  {stat.value}
                </p>
              </div>

              {/* Mini Sparkline Graph using SVG */}
              <div className="h-6 w-full mt-1.5 opacity-65 group-hover:opacity-90 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 25">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(
                      stat.change >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                    points={stat.graphData
                      .map((d, i) => `${(i / (stat.graphData.length - 1)) * 100},${25 - (d.val / 100) * 20}`)
                      .join(" ")}
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4. Main Body: Split layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Left Side: Activity, Achievements & AI insights */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Action Buttons */}
          <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Quick Portal Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: "Launch Practice Test", desc: "Take customized topic drills", action: "practice", color: "hover:border-primary/40", icon: "🧠" },
                { title: "View Results History", desc: "Check transcripts & feedback", action: "results", color: "hover:border-indigo/40", icon: "📄" },
                { title: "Performance Reports", desc: "Deep study data reviews", action: "analytics", color: "hover:border-emerald/40", icon: "📈" },
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSection(act.action)}
                  className={cn(
                    "p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/30 transition-all text-left flex flex-col justify-between gap-4 cursor-pointer",
                    act.color
                  )}
                >
                  <span className="text-xl">{act.icon}</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1 group-hover:text-primary">
                      {act.title} <ArrowRight className="w-3.5 h-3.5" />
                    </p>
                    <p className="text-[10px] text-muted-foreground">{act.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Study Recommendations */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-card border border-primary/20 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">AI Study Recommendations</h3>
            </div>

            <div className="space-y-3">
              {[
                { title: "Revise Database Normalization", text: "You typically lose marks in BCNF & 4NF question models. Review transactional anomalies in practice test modules.", difficulty: "Hard" },
                { title: "Practice Algorithms Speed", text: "In your last quiz, you spent an average of 4.2 minutes on Dynamic Programming questions, exceeding recommended times by 32%.", difficulty: "Medium" }
              ].map((rec, i) => (
                <div key={i} className="p-4 bg-card border border-border/40 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-foreground">{rec.title}</h4>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      rec.difficulty === "Hard" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {rec.difficulty} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {rec.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Recent Progress Activity</h3>
            <div className="divide-y divide-border/20">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{act.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{act.type}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Badges & study planner Calendar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Achievements list */}
          <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Achievements Badges</h3>
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                4 Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "a1", name: "Perfect Score", desc: "Get 100% marks in any exam", icon: "🏆", date: "2026-07-08" },
                { id: "a2", name: "Early Bird", desc: "Submit an exam with 50% time left", icon: "⚡", date: "2026-06-25" },
                { id: "a3", name: "Streak Master", desc: "Study 5 days in a row", icon: "🔥", date: "Active" },
                { id: "a4", name: "Integrity Icon", desc: "Complete 5 proctored exams with 0 flags", icon: "🛡️", date: "2026-07-08" },
              ].map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 bg-muted/20 border border-border/20 rounded-xl text-center flex flex-col items-center gap-1.5 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-foreground leading-none">{badge.name}</p>
                    <p className="text-[8px] text-muted-foreground line-clamp-1">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Planner / Calendar Mockup */}
          <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Exam Countdown Planner</h3>
            <div className="space-y-3.5">
              {[
                { name: "DBMS End-Sem", days: 0, date: "July 12 (Today)", status: "bg-red-500 text-white" },
                { name: "Algorithms Quiz", days: 4, date: "July 15", status: "bg-primary/15 text-primary" },
                { name: "Networks Practical", days: 8, date: "July 19", status: "bg-muted text-muted-foreground" },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/20 rounded-xl border border-border/10">
                  <div className="space-y-0.5 text-left font-semibold">
                    <p className="text-xs font-bold text-foreground leading-none">{item.name}</p>
                    <p className="text-[9px] text-muted-foreground">{item.date}</p>
                  </div>
                  <span className={cn("text-[9px] font-bold px-2 py-1 rounded-full", item.status)}>
                    {item.days === 0 ? "LIVE NOW" : `In ${item.days} Days`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
