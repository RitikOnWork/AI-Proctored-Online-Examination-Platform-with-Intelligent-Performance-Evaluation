"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Video,
  Mic,
  Wifi,
  ShieldAlert,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  Upload,
  User,
} from "lucide-react";
import { useSubmitExamMutation, useProctorWarningMutation } from "@/hooks/useStudent";
import { RealExam, RealQuestion } from "@/types/student";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TakeExamProps {
  exam: RealExam;
  questions: RealQuestion[];
  examToken: string;
  onFinish: () => void;
}

export default function TakeExam({ exam, questions, examToken, onFinish }: TakeExamProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [markedReview, setMarkedReview] = useState<Record<string, boolean>>({});

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState(exam.duration_minutes * 60);

  // Proctor status simulator & accumulator
  const [suspicionLevel, setSuspicionLevel] = useState<"Green" | "Yellow" | "Red">("Green");
  const [proctorLogs, setProctorLogs] = useState<string[]>(["Exam initialized. Camera check complete."]);
  const [accumulatedEvents, setAccumulatedEvents] = useState<
    { event_type: string; confidence: number; details: string }[]
  >([]);

  // Warning Modals
  const [faceWarningOpen, setFaceWarningOpen] = useState(false);
  const [tabWarningOpen, setTabWarningOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [isSubmittingPaper, setIsSubmittingPaper] = useState(false);

  // Mutations
  const submitExamMutation = useSubmitExamMutation();
  const logWarningMutation = useProctorWarningMutation();

  // Webcam Canvas Simulator
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Formatting timer
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer countdown hook
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleForceSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Web camera drawing loop
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simulated grid mesh scanner lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw avatar head placeholder
      ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2.2, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 1.1, 55, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Scan overlay lines
      const scanY = (frame * 1.5) % canvas.height;
      ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Draw bounding box
      ctx.strokeStyle = suspicionLevel === "Green" ? "#10b981" : suspicionLevel === "Yellow" ? "#f59e0b" : "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(canvas.width / 2 - 45, canvas.height / 2.2 - 45, 90, 95);

      // Status text on canvas
      ctx.fillStyle = suspicionLevel === "Green" ? "#10b981" : suspicionLevel === "Yellow" ? "#f59e0b" : "#ef4444";
      ctx.font = "bold 9px monospace";
      ctx.fillText(suspicionLevel === "Green" ? "FACE IDENTIFIED" : "WARNING FLAG", 10, 20);

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [suspicionLevel]);

  // Tab switch listener
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setSuspicionLevel("Yellow");
        setTabWarningOpen(true);
        const timeStr = new Date().toLocaleTimeString();
        setProctorLogs((prev) => [
          ...prev,
          `[ALERT] Exit event: User switched browser tabs at ${timeStr}`,
        ]);
        
        // Accumulate proctor event
        setAccumulatedEvents((prev) => [
          ...prev,
          {
            event_type: "tab_switched",
            confidence: 1.0,
            details: `Candidate switched browser tabs at ${timeStr}.`,
          },
        ]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Simulate Face missing warning on timer (e.g. after 30 seconds)
  useEffect(() => {
    if (!exam.settings?.enable_camera) return;

    const timer = setTimeout(() => {
      setFaceWarningOpen(true);
      setSuspicionLevel("Red");
      const timeStr = new Date().toLocaleTimeString();
      setProctorLogs((prev) => [
        ...prev,
        `[ALERT] webcam integrity: face missing alert at ${timeStr}`,
      ]);

      // Accumulate proctor event
      setAccumulatedEvents((prev) => [
        ...prev,
        {
          event_type: "face_not_detected",
          confidence: 0.95,
          details: `Candidate face not detected on camera feed at ${timeStr}.`,
        },
      ]);
    }, 30000); // 30 seconds into the exam

    return () => clearTimeout(timer);
  }, [exam]);

  const handleForceSubmit = () => {
    handleSubmitAnswers();
  };

  const handleSaveAndNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSelectAnswer = (qId: string, value: any, type: string) => {
    if (type === "multi_select") {
      const currentSelection = answers[qId] || [];
      const updated = currentSelection.includes(value)
        ? currentSelection.filter((v: any) => v !== value)
        : [...currentSelection, value];
      setAnswers((prev) => ({ ...prev, [qId]: updated }));
    } else {
      setAnswers((prev) => ({ ...prev, [qId]: value }));
    }
  };

  const handleToggleReview = (qId: string) => {
    setMarkedReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitAnswers = async () => {
    setIsSubmittingPaper(true);
    setErrorMsg("");

    try {
      // 1. Submit answers to backend
      const submitRes = await submitExamMutation.mutateAsync({
        examId: exam.id,
        answers,
      });

      const sessionId = submitRes.session_id;

      // 2. Sequentially upload proctor events generated during the session
      if (sessionId && accumulatedEvents.length > 0) {
        for (const evt of accumulatedEvents) {
          try {
            await logWarningMutation.mutateAsync({
              sessionId,
              payload: evt,
            });
          } catch (logErr) {
            console.error("Failed to log individual proctor warning", logErr);
          }
        }
      }

      setIsSubmittingPaper(false);
      onFinish();
    } catch (err: any) {
      setIsSubmittingPaper(false);
      alert(err.response?.data?.detail || "Failed to submit assessment paper.");
    }
  };

  const [errorMsg, setErrorMsg] = useState("");

  const currentQuestion = questions[currentIdx];

  const getQuestionStatus = (qId: string) => {
    const isAnswered = answers[qId] !== undefined && answers[qId] !== "";
    const isMarked = markedReview[qId];
    if (isMarked) return "review";
    if (isAnswered) return "answered";
    return "unanswered";
  };

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
        <p className="text-xs text-muted-foreground font-semibold mt-3">No examination questions loaded.</p>
        <button
          onClick={onFinish}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden select-none text-left">
      {/* 1. Exam Header Panel */}
      <header className="h-16 border-b border-border/40 bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-extrabold text-sm text-foreground truncate max-w-[200px] sm:max-w-none">
            {exam.title}
          </span>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-3.5 bg-red-500/10 border border-red-500/20 px-4.5 py-1.5 rounded-2xl">
          <Clock className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="font-bold text-sm text-red-500 font-mono tracking-wider">
            {formatTime(secondsRemaining)}
          </span>
        </div>

        <div className="text-xs text-muted-foreground font-semibold">
          Secure Exam Proctored Interface
        </div>
      </header>

      {/* 2. Main content split layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Question area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between min-w-0">
          
          <div className="space-y-6">
            {/* Top specs */}
            <div className="flex justify-between items-center text-xs text-muted-foreground border-b border-border/10 pb-3">
              <span className="font-bold text-primary">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="font-semibold bg-muted/40 px-2.5 py-1 rounded-xl">
                Marks: {currentQuestion.marks}
              </span>
            </div>

            {/* Question Text block */}
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-extrabold text-foreground">{currentQuestion.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {currentQuestion.question_text}
              </p>

              {/* Answers Inputs Types rendering */}
              <div className="mt-6">
                
                {/* MCQ */}
                {currentQuestion.question_type === "mcq" && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.option_text;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectAnswer(currentQuestion.id, opt.option_text, "mcq")}
                          className={cn(
                            "w-full text-left text-xs p-3.5 rounded-xl border transition-all cursor-pointer",
                            isSelected
                              ? "bg-primary/10 border-primary/50 text-foreground font-semibold"
                              : "bg-muted/10 border-border/20 text-muted-foreground hover:bg-muted/30"
                          )}
                        >
                          {opt.option_text}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Multi Select */}
                {currentQuestion.question_type === "multi_select" && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQuestion.options.map((opt) => {
                      const selectedList = answers[currentQuestion.id] || [];
                      const isSelected = selectedList.includes(opt.option_text);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectAnswer(currentQuestion.id, opt.option_text, "multi_select")}
                          className={cn(
                            "w-full text-left text-xs p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                            isSelected
                              ? "bg-primary/10 border-primary/50 text-foreground font-semibold"
                              : "bg-muted/10 border-border/20 text-muted-foreground hover:bg-muted/30"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded border-border text-primary focus:ring-primary focus:ring-opacity-40"
                          />
                          {opt.option_text}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer */}
                {currentQuestion.question_type === "short_answer" && (
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value, "short_answer")}
                    placeholder="Type your response acronym or phrase here..."
                    className="w-full px-4 py-3 text-xs bg-muted/10 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  />
                )}

                {/* Long Answer */}
                {currentQuestion.question_type === "long_answer" && (
                  <textarea
                    rows={6}
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value, "long_answer")}
                    placeholder="Type your detailed explanation or codes here..."
                    className="w-full px-4 py-3 text-xs bg-muted/10 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none"
                  />
                )}

                {/* Image Upload */}
                {currentQuestion.question_type === "image_upload" && (
                  <div className="border-2 border-dashed border-border/40 hover:border-primary/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/5 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground/60" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-foreground">
                        {answers[currentQuestion.id] ? "file_uploaded.png (Change file)" : "Upload drawing snapshot"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Drag and drop PNG, JPG files here</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQuestion.id, "uploaded_image.png", "image_upload")}
                      className="px-3.5 py-2 text-[10px] font-bold bg-muted hover:bg-muted/60 text-foreground border border-border/40 rounded-xl transition-all"
                    >
                      Browse Storage
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons footer */}
          <div className="flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-border/10 shrink-0">
            <div className="flex gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={handlePrev}
                className="px-4 py-2.5 border border-border/40 hover:bg-muted disabled:opacity-50 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={handleSaveAndNext}
                disabled={currentIdx === questions.length - 1}
                className="px-4 py-2.5 bg-primary text-primary-foreground disabled:opacity-50 text-xs font-semibold hover:bg-primary/95 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleToggleReview(currentQuestion.id)}
                className={cn(
                  "px-4 py-2.5 border text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer",
                  markedReview[currentQuestion.id]
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                    : "border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Bookmark className="w-4 h-4" />
                {markedReview[currentQuestion.id] ? "Marked Review" : "Mark for Review"}
              </button>
              <button
                onClick={() => setConfirmSubmitOpen(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                Submit Paper
              </button>
            </div>
          </div>
        </main>

        {/* Right Side: Proctoring controls and question palette */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/40 bg-card flex flex-col justify-between shrink-0 overflow-y-auto">
          
          <div className="p-5 space-y-6">
            {/* AI Proctor Cam block */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4.5 h-4.5 text-primary" /> AI Proctor Stream
              </h4>

              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border/40 bg-black relative">
                <canvas ref={canvasRef} width={280} height={158} className="w-full h-full" />
                {/* Floating suspicion label */}
                <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 px-2 py-0.5 bg-black/60 rounded-full">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      suspicionLevel === "Green"
                        ? "bg-emerald-500"
                        : suspicionLevel === "Yellow"
                        ? "bg-amber-500 animate-ping"
                        : "bg-red-500 animate-ping"
                    )}
                  />
                  <span className="text-[8px] font-bold text-white uppercase tracking-wider">
                    {suspicionLevel} Risk
                  </span>
                </div>
              </div>

              {/* Hardware checklist */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-muted-foreground">
                <div className="flex items-center gap-1.5 p-2 bg-muted/30 border border-border/10 rounded-xl">
                  <Video className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Cam Active</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-muted/30 border border-border/10 rounded-xl">
                  <Mic className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mic Connected</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-muted/30 border border-border/10 rounded-xl">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ping Stable</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-muted/30 border border-border/10 rounded-xl">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Face Sync</span>
                </div>
              </div>
            </div>

            {/* Question Palette block */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Question Navigation Palette
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, index) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = index === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(index)}
                      className={cn(
                        "h-9 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer border",
                        isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "",
                        status === "review"
                          ? "bg-amber-500 text-white border-amber-400"
                          : status === "answered"
                          ? "bg-emerald-500 text-white border-emerald-400"
                          : "bg-muted/10 text-muted-foreground border-border/20 hover:bg-muted/30"
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend info */}
              <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-muted-foreground pt-2 border-t border-border/15">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  <span>Marked Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-muted/20 border border-border/20 rounded-full" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom logs */}
          <div className="p-4 border-t border-border/20 bg-muted/10 max-h-36 overflow-y-auto">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider text-left">
              Real-Time audit Logs
            </p>
            <div className="font-mono text-[8px] space-y-1 mt-1.5 text-left">
              {proctorLogs.slice(-4).map((log, idx) => (
                <div key={idx} className={log.includes("[ALERT]") ? "text-red-500 font-bold" : "text-emerald-500"}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Warning Modals render (AnimatePresence) */}
      <AnimatePresence>
        {/* 1. Face Missing Warning */}
        {faceWarningOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-card border border-red-500/30 rounded-2xl p-6 text-center space-y-5 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7 text-red-500" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-foreground">Webcam Integrity Flagged</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong>Face Not Detected.</strong> Please return to the center of your webcam. Ensure your face is
                  fully lit and clearly visible to prevent auto-disqualification.
                </p>
              </div>
              <button
                onClick={() => {
                  setFaceWarningOpen(false);
                  setSuspicionLevel("Green");
                }}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Return to Exam Camera
              </button>
            </motion.div>
          </div>
        )}

        {/* 2. Tab Switch Warning */}
        {tabWarningOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-card border border-amber-500/30 rounded-2xl p-6 text-center space-y-5 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-foreground">Secure Lockout Violation</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong>Tab switching detected.</strong> Exiting the test browser is strictly prohibited. Additional
                  violations will flag your session for manual examiner review.
                </p>
              </div>
              <button
                onClick={() => {
                  setTabWarningOpen(false);
                  setSuspicionLevel("Green");
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                I Understand, Resume
              </button>
            </motion.div>
          </div>
        )}

        {/* 3. Confirm Submit Exam */}
        {confirmSubmitOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-card border border-border/40 rounded-2xl p-6 text-center space-y-5 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-foreground">Submit Assessment Paper?</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  You have answered <strong>{Object.keys(answers).length} of {questions.length}</strong> questions. Once
                  submitted, answers are committed and cannot be altered.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  disabled={isSubmittingPaper}
                  onClick={() => setConfirmSubmitOpen(false)}
                  className="flex-1 py-2.5 border border-border/40 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition-all cursor-pointer"
                >
                  Return to Paper
                </button>
                <button
                  disabled={isSubmittingPaper}
                  onClick={handleSubmitAnswers}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isSubmittingPaper ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Exam"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
