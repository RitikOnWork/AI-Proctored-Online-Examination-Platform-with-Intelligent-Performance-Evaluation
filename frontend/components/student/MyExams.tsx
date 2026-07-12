"use client";

import React, { useState } from "react";
import { useSidebar } from "@/lib/sidebar-context";
import {
  Search,
  AlertTriangle,
  BookOpen,
  Info,
  CheckCircle,
  FileDown,
  Play,
  X,
  FileText,
  Video,
  Mic,
  Wifi,
  UserCheck,
} from "lucide-react";
import { useUpcomingExams, useSessions } from "@/hooks/useStudent";
import { studentService } from "@/services/student";
import { cn } from "@/lib/utils";
import { RealExam, RealQuestion } from "@/types/student";

interface MyExamsProps {
  onStartExam: (exam: RealExam, paperQuestions: RealQuestion[], examToken: string) => void;
}

export default function MyExams({ onStartExam }: MyExamsProps) {
  const { setActiveSection } = useSidebar();
  const [filter, setFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<RealExam | null>(null);
  const [agreed, setAgreed] = useState(false);

  // TanStack Query states
  const { data: exams = [], isLoading: examsLoading } = useUpcomingExams();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();

  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const statuses = ["All", "Live", "Upcoming", "Completed", "Missed"];

  // Compute status dynamically
  const getExamStatus = (exam: RealExam) => {
    const hasTaken = sessions.some((s) => s.exam_id === exam.id && s.status === "submitted");
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

  const handleOpenDetails = (exam: RealExam) => {
    setSelectedExam(exam);
    setAgreed(false);
    setErrorMsg("");
  };

  const handleStartExamClick = async () => {
    if (!selectedExam || !agreed) return;
    const exam = selectedExam;
    setEnteringId(exam.id);
    setErrorMsg("");

    try {
      // 1. Call Enter Exam Endpoint to generate short-lived token
      const enterData = await studentService.enterExam(exam.id);
      const examToken = enterData.exam_token;

      // 2. Fetch paper questions from backend
      const paperQuestions = await studentService.getExamPaper(exam.id, examToken);

      setSelectedExam(null);
      setEnteringId(null);

      // Pass real exam, questions, and access token up to the page manager
      onStartExam(exam, paperQuestions, examToken);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail || "Failed to enter the exam session. Please check eligibility rules."
      );
      setEnteringId(null);
    }
  };

  // Filter and search logic
  const filteredExams = exams.filter((exam) => {
    const status = getExamStatus(exam);
    const matchesFilter = filter === "All" || status === filter;
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const loading = examsLoading || sessionsLoading;

  return (
    <div className="space-y-6 text-left">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/40 p-4 rounded-2xl shadow-sm">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                filter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/10 border-border/40 text-muted-foreground hover:bg-muted/30"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-muted/10 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Exams */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading exam configurations...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-card border border-border/40 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3">
          <BookOpen className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-foreground">No exams found</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            There are no exams matching the selected criteria in the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((exam) => {
            const status = getExamStatus(exam);
            return (
              <div
                key={exam.id}
                className={cn(
                  "bg-card border border-border/40 hover:border-primary/20 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all hover:shadow-md relative overflow-hidden group",
                  status === "Live" && "border-red-500/30 shadow-red-500/5 shadow-sm"
                )}
              >
                {/* Highlight strip for live exam */}
                {status === "Live" && <div className="absolute top-0 inset-x-0 h-1 bg-red-500 animate-pulse" />}

                {/* Card Header */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        status === "Live"
                          ? "bg-red-500 text-white animate-pulse"
                          : status === "Upcoming"
                          ? "bg-blue-500/10 text-blue-500"
                          : status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {status}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ID: {exam.id.slice(0, 8)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground line-clamp-1 leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {exam.description || "No description configured."}
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 rounded-xl text-left border border-border/10">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">
                      Active Window
                    </p>
                    <p className="text-[10px] font-semibold text-foreground truncate">
                      ⏱️ {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : "Always Available"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">
                      Evaluation Pass
                    </p>
                    <p className="text-[10px] font-semibold text-foreground truncate">
                      🏆 Min {exam.passing_score}% Score
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">
                      Duration & Count
                    </p>
                    <p className="text-[10px] font-semibold text-foreground">
                      ⏱️ {exam.duration_minutes}m | ❓ {exam.question_count || "Dynamic"} Qs
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">
                      Proctoring Guard
                    </p>
                    <p className="text-[10px] font-semibold text-foreground truncate">
                      🛡️ {exam.settings?.enable_camera ? "AI Webcam Active" : "No Camera Req."}
                    </p>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 w-full">
                  {status === "Live" ? (
                    <>
                      <button
                        onClick={() => handleOpenDetails(exam)}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-[0.98] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Start Exam
                      </button>
                      <button
                        onClick={() => handleOpenDetails(exam)}
                        className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/20 border border-border/20 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" /> Details
                      </button>
                    </>
                  ) : status === "Upcoming" ? (
                    <>
                      <button
                        onClick={() => handleOpenDetails(exam)}
                        className="flex-1 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/95 rounded-xl transition-colors cursor-pointer"
                      >
                        View Guidelines
                      </button>
                      <button
                        onClick={() => alert("Downloading admit card PDF from database...")}
                        className="px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/20 border border-border/20 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Download Admit Card"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </>
                  ) : status === "Completed" ? (
                    <button
                      onClick={() => setActiveSection("results")}
                      className="w-full py-2.5 text-xs font-semibold text-emerald-500 hover:text-white hover:bg-emerald-500 border border-emerald-500/30 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" /> View Evaluation Report
                    </button>
                  ) : (
                    <div className="w-full py-2.5 text-xs font-semibold bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Disqualified / Missed Session
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guidelines & Details Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border/40 rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/40 flex justify-between items-center bg-muted/20">
              <div className="text-left">
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full uppercase tracking-wider">
                  Guidelines & Controls
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1 truncate">
                  {selectedExam.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-left">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4.5 h-4.5" /> {errorMsg}
                </div>
              )}

              {/* Exam metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 border border-border/20 rounded-xl text-left">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Duration</p>
                  <p className="text-sm font-extrabold text-foreground">{selectedExam.duration_minutes} Min</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Questions</p>
                  <p className="text-sm font-extrabold text-foreground">
                    {selectedExam.question_count || "Dynamic"} Qs
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Minimum Pass</p>
                  <p className="text-sm font-extrabold text-foreground">{selectedExam.passing_score}% Score</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Negative Marks</p>
                  <p className="text-sm font-extrabold text-foreground">
                    {selectedExam.settings?.enable_negative_marking ? "Yes" : "None"}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-primary" /> Examination Instructions
                </h4>
                <ul className="list-disc pl-5 text-[11px] text-muted-foreground leading-relaxed space-y-1.5">
                  <li>Ensure that you do not close or minimize the window once the exam starts.</li>
                  <li>AI proctoring monitors all movement and audio streams.</li>
                  <li>Any attempt to exit the fullscreen mode will submit the exam automatically.</li>
                  <li>You must accept the camera validation checks to retrieve exam paper sheets.</li>
                </ul>
              </div>

              {/* Rules list */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-500" /> AI Proctoring Guidelines
                </h4>
                <div className="grid grid-cols-1 gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
                    Keep your face centered and visible to the webcam at all times.
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
                    Tab switching will trigger immediate proctor lockout warnings. Max allowed:{" "}
                    {selectedExam.settings?.max_tab_switches || 3}.
                  </p>
                </div>
              </div>

              {/* Hardware checklist */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-foreground">Hardware Checklist</h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="flex items-center gap-2.5 p-3 border border-border/20 rounded-xl">
                    <Video
                      className={cn(
                        "w-4.5 h-4.5",
                        selectedExam.settings?.enable_camera ? "text-emerald-500" : "text-muted-foreground"
                      )}
                    />
                    <div className="text-left leading-none">
                      <p className="font-bold text-foreground">Webcam Required</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {selectedExam.settings?.enable_camera ? "Mandatory Stream" : "Optional"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 border border-border/20 rounded-xl">
                    <Mic
                      className={cn(
                        "w-4.5 h-4.5",
                        selectedExam.settings?.enable_microphone ? "text-emerald-500" : "text-muted-foreground"
                      )}
                    />
                    <div className="text-left leading-none">
                      <p className="font-bold text-foreground">Microphone Required</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {selectedExam.settings?.enable_microphone ? "Mandatory Sync" : "Optional"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 border border-border/20 rounded-xl">
                    <Wifi className="w-4.5 h-4.5 text-emerald-500" />
                    <div className="text-left leading-none">
                      <p className="font-bold text-foreground">Stable Internet</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Min 2 Mbps bandwidth</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 border border-border/20 rounded-xl">
                    <UserCheck className="w-4.5 h-4.5 text-emerald-500" />
                    <div className="text-left leading-none">
                      <p className="font-bold text-foreground">Identity Verified</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Face ID verification</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Guideline checklist */}
              <label className="flex items-start gap-2.5 pt-2 border-t border-border/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary focus:ring-opacity-50 cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  I agree that I have read the examination instructions, verified my camera/hardware configurations,
                  and understand that violations during monitoring will flag and terminate my session.
                </span>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/40 bg-muted/20 flex justify-end gap-3">
              <button
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2.5 rounded-xl border border-border/40 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close Window
              </button>
              {getExamStatus(selectedExam) === "Live" && (
                <button
                  disabled={!agreed || enteringId !== null}
                  onClick={handleStartExamClick}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-500/20 cursor-pointer"
                >
                  {enteringId !== null ? "Loading Paper..." : "Confirm & Start Exam"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
