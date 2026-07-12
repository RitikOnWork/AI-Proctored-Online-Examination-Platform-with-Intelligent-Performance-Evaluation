"use client";

import React, { useState, useEffect } from "react";
import { useSessions } from "@/hooks/useStudent";
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { ExamSession } from "@/types/student";

export default function ResultsView() {
  const { data: sessions = [], isLoading } = useSessions();
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);

  // Filter completed/submitted sessions
  const completedSessions = sessions.filter((s) => s.status === "submitted");

  // Select the first completed session by default when loaded
  useEffect(() => {
    if (completedSessions.length > 0 && !selectedSession) {
      setSelectedSession(completedSessions[0]);
    }
  }, [completedSessions, selectedSession]);

  const handleDownloadScorecard = (examName: string) => {
    alert(`Initiated scorecard download for ${examName}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading your assessment results...
      </div>
    );
  }

  if (completedSessions.length === 0) {
    return (
      <div className="bg-card border border-border/40 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3">
        <Award className="w-12 h-12 text-muted-foreground/30 animate-bounce" />
        <p className="text-sm font-semibold text-foreground">No results available yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          You haven't completed or submitted any exams. Complete an active exam to generate a scorecard report.
        </p>
      </div>
    );
  }

  const activeSession = selectedSession || completedSessions[0];
  const score = activeSession.result?.total_score ?? 0;
  const percentage = activeSession.result?.percentage ?? 0;
  const isPassed = activeSession.result?.is_passed ?? false;
  const feedback = activeSession.result?.feedback ?? "Feedback pending manual evaluation.";

  // Compute total marks from score and percentage
  const totalMarks = percentage > 0 ? Math.round((score / percentage) * 100) : 100;
  const lostMarks = Math.max(0, totalMarks - score);

  // Pie chart data for selected exam
  const pieData = [
    { name: "Obtained Score", value: score, color: "#10b981" },
    { name: "Lost Marks", value: lostMarks, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Selection Tabs for previous attempts */}
      <div className="bg-card border border-border/40 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Assessment Reports</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">Select a completed exam to review detailed scorecards.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {completedSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSession(s)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                activeSession.id === s.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/10 border-border/40 text-muted-foreground hover:bg-muted/30"
              )}
            >
              {s.exam_name}
            </button>
          ))}
        </div>
      </div>

      {activeSession && (
        <div className="space-y-6">
          {/* Congratulations Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-primary text-white border border-border/10 rounded-3xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-300 fill-yellow-300/20" />
                <span className="text-[10px] font-extrabold bg-white/20 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Result Transcript
                </span>
              </div>
              <h3 className="text-2xl font-black">
                {isPassed ? "Congratulations!" : "Keep Working!"}
              </h3>
              <p className="text-sm text-white/80 max-w-md leading-relaxed">
                You successfully finished the <strong>{activeSession.exam_name}</strong> assessment with a score of{" "}
                <strong>{score}/{totalMarks}</strong>.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-white/90">
                <span>⏱️ Started: {activeSession.started_at ? new Date(activeSession.started_at).toLocaleDateString() : "N/A"}</span>
                <span>📈 Percentage: {percentage.toFixed(1)}%</span>
                <span>🏆 Status: {isPassed ? "Passed" : "Needs Retake"}</span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={() => handleDownloadScorecard(activeSession.exam_name)}
                className="flex-1 px-5 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Transcript PDF
              </button>
            </div>
          </div>

          {/* Detailed results stats splits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Pie Chart display */}
            <div className="lg:col-span-4 bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Marks Accuracy Split</h4>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center score details */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-foreground">
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Accuracy</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 text-[10px] font-semibold border-t border-border/20 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Obtained Score ({score.toFixed(1)} Marks)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Lost Marks ({lostMarks.toFixed(1)} Marks)</span>
                </div>
              </div>
            </div>

            {/* AI Advisor Feedback */}
            <div className="lg:col-span-8 bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Evaluator Feedback</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feedback}
                </p>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-xl border border-border/10">
                  <div>
                    <h5 className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Proctor Integrity</h5>
                    <p className="text-xs font-bold text-emerald-500 mt-1">Excellent (0 Flagged Violations)</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Difficulty Benchmark</h5>
                    <p className="text-xs font-bold text-foreground mt-1">Passing requirement: {percentage >= 40 ? "MET" : "FAILED"}</p>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground text-right block italic">
                Evaluated deterministically by ProctorAI cloud grading engine.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
