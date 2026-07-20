"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Users, BookMarked, ArrowRight, Radio, CheckCircle2, XCircle } from "lucide-react";
import { studentService } from "@/services/student";
import { RealExam } from "@/types/student";

type Exam = {
  id: string;
  name: string;
  subject: string;
  duration: number;
  students: number;
  status: string;
  date: string;
};

const statusConfig: Record<string, { label: string; color: string; dot?: string }> = {
  upcoming: { label: "Upcoming", color: "bg-primary/10 text-primary border-primary/20" },
  live: { label: "Live", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", dot: "bg-emerald-500" },
  completed: { label: "Completed", color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

function ExamCard({ exam, i }: { exam: Exam; i: number }) {
  const cfg = statusConfig[exam.status] ?? statusConfig.upcoming;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.07, type: "spring" as const, stiffness: 150, damping: 18 }}
      whileHover={{ y: -3, borderColor: "rgba(99,102,241,0.3)" }}
      className="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {exam.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">{exam.subject}</p>
        </div>
        <span
          className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${cfg.color}`}
        >
          {exam.status === "live" && cfg.dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />}
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {exam.duration}m
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {exam.students}
        </span>
        <span className="flex items-center gap-1">
          <BookMarked className="w-3 h-3" />
          {exam.subject}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{exam.date}</span>
        <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors opacity-0 group-hover:opacity-100">
          View <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

function ExamSection({ title, exams, icon: Icon }: { title: string; exams: Exam[]; icon: React.ElementType }) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{exams.length}</span>
      </div>
      <div className="space-y-2.5">
        {exams.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">No exams in this category</div>
        ) : (
          exams.map((exam, i) => <ExamCard key={exam.id} exam={exam} i={i} />)
        )}
      </div>
    </div>
  );
}

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const rawExams: RealExam[] = await studentService.getUpcomingExams();
        const mapped: Exam[] = rawExams.map((e) => ({
          id: e.id,
          name: e.title,
          subject: e.subject?.name || e.description || "General",
          duration: e.duration_minutes,
          students: e.question_count || 0,
          status: e.is_published ? "live" : "upcoming",
          date: e.start_time ? new Date(e.start_time).toLocaleDateString() : "Flexible Window",
        }));
        setExams(mapped);
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);

  const upcomingExams = exams.filter((e) => e.status === "upcoming");
  const liveExams = exams.filter((e) => e.status === "live");
  const completedExams = exams.filter((e) => e.status === "completed");
  const cancelledExams = exams.filter((e) => e.status === "cancelled");

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading Exam Configurations from Database...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">Exam Management</h2>
        <button className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
          Manage all <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ExamSection title="Upcoming Exams" exams={upcomingExams} icon={Clock} />
        <ExamSection title="Live Exams" exams={liveExams} icon={Radio} />
        <ExamSection title="Completed Exams" exams={completedExams} icon={CheckCircle2} />
        <ExamSection title="Cancelled Exams" exams={cancelledExams} icon={XCircle} />
      </div>
    </div>
  );
}
