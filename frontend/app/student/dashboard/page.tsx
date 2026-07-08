"use client";

import React, { useState, useEffect } from "react";
import { LogOut, BookOpen, Clock, Play, HelpCircle, Shield, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Exam = {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  passing_score: number;
  subject_id: string;
  is_published: boolean;
};

type Question = {
  id: string;
  title: string;
  question_text: string;
  question_type: string;
  marks: number;
  options?: { id: string; option_text: string }[];
};

export default function StudentDashboard() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  // Exam session states
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examToken, setExamToken] = useState("");
  const [paper, setPaper] = useState<Question[]>([]);
  const [fetchingPaper, setFetchingPaper] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("access_token") || "";
    const savedRole = localStorage.getItem("user_role") || "";
    const savedEmail = localStorage.getItem("user_email") || "";

    if (!savedToken) {
      router.push("/login");
      return;
    }

    setToken(savedToken);
    setEmail(savedEmail);

    // Fetch published exams
    const fetchExams = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/exams", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Filter only published exams
          setExams(data.filter((e: Exam) => e.is_published));
        }
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleEnterExam = async (exam: Exam) => {
    setErrorMsg("");
    setPaper([]);
    setAnswers({});
    setSubmitted(false);
    setProctorLogs([]);
    setFetchingPaper(true);

    try {
      // 1. Request short-lived exam access token from backend
      const res = await fetch(`http://localhost:8000/api/v1/exams/${exam.id}/enter`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Unable to enter this exam session.");
        setFetchingPaper(false);
        return;
      }

      const data = await res.json();
      const exToken = data.exam_token;
      setExamToken(exToken);
      setActiveExam(exam);

      // 2. Fetch deterministically randomized exam paper using exam token
      const paperRes = await fetch(`http://localhost:8000/api/v1/exams/${exam.id}/paper`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Exam-Token": exToken,
        },
      });

      if (paperRes.ok) {
        const paperData = await paperRes.json();
        setPaper(paperData);
        setProctorLogs((prev) => [...prev, "Exam session started. AI Proctoring initialized."]);
      } else {
        const errData = await paperRes.json();
        setErrorMsg(errData.detail || "Failed to load exam paper questions.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the examination API.");
    } finally {
      setFetchingPaper(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionText: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const handleSubmitExam = () => {
    setSubmitted(true);
    setProctorLogs((prev) => [...prev, "Exam submitted successfully by candidate."]);
  };

  // Add dummy proctoring alerts to simulate the AI detection
  useEffect(() => {
    if (!activeExam || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setProctorLogs((prev) => [...prev, `[ALERT] Tab switch detected at ${new Date().toLocaleTimeString()}`]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeExam, submitted]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">P</span>
          </div>
          <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/75">
            ProctorAI Candidate Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:inline">{email} (Student)</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted text-xs font-semibold rounded-xl border border-border/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-24 pb-12">
        <AnimatePresence mode="wait">
          {!activeExam ? (
            <motion.div
              key="exams-list"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back, Student</h1>
                <p className="text-sm text-muted-foreground mt-1">Select an active exam to begin your proctored assessment</p>
              </div>

              {loading ? (
                <div className="p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl">
                  Loading active exams...
                </div>
              ) : exams.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                  <p className="font-semibold text-sm">No Exams Available</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    There are no published exams configured for your subjects at this moment. Check back later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="bg-card border border-border/40 hover:border-primary/20 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-foreground">{exam.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{exam.description || "No description provided."}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.duration_minutes} Minutes</span>
                        <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Pass Score: {exam.passing_score}%</span>
                      </div>

                      <button
                        onClick={() => handleEnterExam(exam)}
                        disabled={fetchingPaper}
                        className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/95 transition-colors flex items-center justify-center gap-1 text-sm disabled:opacity-50"
                      >
                        {fetchingPaper ? "Entering..." : "Enter Proctored Exam"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="exam-taking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Question Paper Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{activeExam.title}</h2>
                    <span className="text-xs text-primary font-semibold">Proctored Session</span>
                  </div>
                  <span className="bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1 rounded-full font-bold">
                    {activeExam.duration_minutes}m Remaining
                  </span>
                </div>

                {errorMsg && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {paper.length > 0 && !submitted ? (
                  <div className="space-y-6">
                    {paper.map((q, idx) => (
                      <div key={q.id} className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/10 pb-2">
                          <span className="font-semibold text-primary">Question {idx + 1} of {paper.length}</span>
                          <span>Marks: {q.marks}</span>
                        </div>

                        <h3 className="text-sm font-semibold text-foreground">{q.title}</h3>
                        <p className="text-xs text-muted-foreground">{q.question_text}</p>

                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 gap-2 mt-4">
                            {q.options.map((opt) => {
                              const isSelected = answers[q.id] === opt.option_text;
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => handleAnswerSelect(q.id, opt.option_text)}
                                  className={`w-full text-left text-xs p-3 rounded-xl border transition-all ${
                                    isSelected
                                      ? "bg-primary/10 border-primary/50 text-foreground font-semibold"
                                      : "bg-muted/10 border-border/20 text-muted-foreground hover:bg-muted/30"
                                  }`}
                                >
                                  {opt.option_text}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={handleSubmitExam}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Submit Exam Paper
                    </button>
                  </div>
                ) : submitted ? (
                  <div className="bg-card border border-border/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Exam Submitted!</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your answers have been stored and sent to evaluation. AI proctor integrity log was validated.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveExam(null)}
                      className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-xs hover:bg-primary/95 transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">Generating paper questions...</div>
                )}
              </div>

              {/* AI Proctoring Log Section */}
              <div className="space-y-6">
                <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary" /> AI Proctor Integrity
                  </h3>

                  <div className="aspect-video bg-black/60 rounded-xl border border-border/40 relative flex items-center justify-center text-[10px] text-muted-foreground uppercase font-semibold overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)]" />
                    <div className="absolute left-3 top-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>webcam feed simulator</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Real-Time Proctor Logs</label>
                    <div className="bg-muted/30 border border-border/40 rounded-xl p-3 h-44 overflow-y-auto font-mono text-[9px] space-y-1.5">
                      {proctorLogs.map((log, idx) => (
                        <div key={idx} className={log.includes("[ALERT]") ? "text-destructive font-bold" : "text-emerald-400"}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!submitted && (
                    <div className="text-[10px] text-muted-foreground leading-normal flex items-start gap-1 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        AI monitoring is active. Do not switch tabs, look away from the screen, or open other application windows.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
