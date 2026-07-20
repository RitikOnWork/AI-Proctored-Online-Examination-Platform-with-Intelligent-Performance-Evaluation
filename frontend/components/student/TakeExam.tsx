"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Maximize,
  FileText,
  Lock,
} from "lucide-react";
import { useSubmitExamMutation, useProctorWarningMutation } from "@/hooks/useStudent";
import { RealExam, RealQuestion } from "@/types/student";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import axios from "axios";

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

  // Session & Timer states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(exam.duration_minutes * 60);
  const [isSessionResumed, setIsSessionResumed] = useState<boolean>(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"Saved" | "Saving..." | "Error">("Saved");

  // Security & Proctoring states
  const [suspicionLevel, setSuspicionLevel] = useState<"Green" | "Yellow" | "Red">("Green");
  const [suspicionScore, setSuspicionScore] = useState<number>(0);
  const [proctorLogs, setProctorLogs] = useState<string[]>(["Secure Exam Session initialized."]);
  const [accumulatedEvents, setAccumulatedEvents] = useState<
    { event_type: string; confidence: number; details: string }[]
  >([]);

  // Modals & Dialogs
  const [faceWarningOpen, setFaceWarningOpen] = useState(false);
  const [tabWarningOpen, setTabWarningOpen] = useState(false);
  const [securityWarningOpen, setSecurityWarningOpen] = useState(false);
  const [securityWarningText, setSecurityWarningText] = useState("");
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [isSubmittingPaper, setIsSubmittingPaper] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; ocr: string } | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Mutations
  const submitExamMutation = useSubmitExamMutation();
  const logWarningMutation = useProctorWarningMutation();

  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  };

  const getWsBaseUrl = () => {
    const api = getApiBaseUrl();
    return api.replace(/^http/, "ws");
  };

  // 1. Initialize or Resume Session on Mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const token = localStorage.getItem("token") || examToken;
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        // Try getting active session first
        const activeRes = await axios.get(`${getApiBaseUrl()}/exams/session`, authHeader);
        if (activeRes.data && activeRes.data.has_active_session) {
          setSessionId(activeRes.data.session_id);
          setSecondsRemaining(activeRes.data.remaining_seconds);
          setIsSessionResumed(true);
          if (activeRes.data.saved_answers) {
            setAnswers(activeRes.data.saved_answers);
          }
          setProctorLogs((prev) => [...prev, "Active exam session restored successfully."]);
        } else {
          // Start a new session
          const startRes = await axios.post(
            `${getApiBaseUrl()}/exams/start`,
            { exam_id: exam.id },
            authHeader
          );
          setSessionId(startRes.data.session_id);
          setSecondsRemaining(startRes.data.remaining_seconds);
          setProctorLogs((prev) => [...prev, "New exam session bound to candidate ID."]);
        }
      } catch (err) {
        console.error("Failed to initialize exam session", err);
      }
    };

    initSession();
  }, [exam.id, examToken]);

  // 2. Timer Countdown Hook
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

  // 3. 10-Second WebSocket Heartbeat & Single Active Session Connection
  useEffect(() => {
    if (!sessionId) return;

    const wsUrl = `${getWsBaseUrl()}/ws/proctor/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setProctorLogs((prev) => [...prev, "Live WebSocket proctor stream connected."]);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.loads ? JSON.parse(event.data) : event.data;
        if (data.type === "PONG") {
          if (data.suspicion_score !== undefined) {
            setSuspicionScore(data.suspicion_score);
          }
        } else if (data.type === "SESSION_TERMINATED") {
          alert(`Session Terminated: ${data.reason}`);
          onFinish();
        } else if (data.type === "EVENT_ACKNOWLEDGED") {
          if (data.total_suspicion_score) {
            setSuspicionScore(data.total_suspicion_score);
            if (data.total_suspicion_score > 40) {
              setSuspicionLevel("Red");
            } else if (data.total_suspicion_score > 20) {
              setSuspicionLevel("Yellow");
            }
          }
        }
      } catch (e) {
        console.error("WS message parse error", e);
      }
    };

    // Send 10-second heartbeat
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "HEARTBEAT" }));
      }
    }, 10000);

    return () => {
      clearInterval(heartbeatInterval);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [sessionId]);

  // 4. Record Proctor Event helper
  const recordProctorEvent = useCallback(
    (eventType: string, details: string, confidence: number = 1.0) => {
      const timeStr = new Date().toLocaleTimeString();
      setProctorLogs((prev) => [...prev, `[ALERT] ${eventType.toUpperCase()}: ${details} at ${timeStr}`]);

      setAccumulatedEvents((prev) => [...prev, { event_type: eventType, confidence, details }]);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "PROCTOR_EVENT",
            event_type: eventType,
            confidence,
            details,
          })
        );
      }
    },
    []
  );

  // 5. Browser Security Event Listeners (Tab Switch, Blur, Focus, Fullscreen, Copy, Paste, Right Click)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSuspicionLevel("Yellow");
        setTabWarningOpen(true);
        recordProctorEvent("tab_switched", "Candidate switched browser tabs or minimized window.");
      }
    };

    const handleWindowBlur = () => {
      recordProctorEvent("window_blur", "Exam window lost focus.");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setSecurityWarningText("Fullscreen exit detected. Please return to fullscreen mode immediately.");
        setSecurityWarningOpen(true);
        recordProctorEvent("fullscreen_exit", "Candidate exited required full-screen mode.");
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setSecurityWarningText("Copying content is disabled during proctored examinations.");
      setSecurityWarningOpen(true);
      recordProctorEvent("copy_attempt", "Copy shortcut triggered by candidate.");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setSecurityWarningText("Pasting content is disabled during proctored examinations.");
      setSecurityWarningOpen(true);
      recordProctorEvent("paste_attempt", "Paste shortcut triggered by candidate.");
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordProctorEvent("right_click", "Context menu right-click attempt.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [recordProctorEvent]);

  // 6. Webcam Vision & Canvas Mesh Loop
  useEffect(() => {
    let animationId: number;
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.warn("Webcam access rejected or unavailable. Falling back to synthetic stream.", err);
      }
    };

    startWebcam();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (videoRef.current && videoRef.current.readyState === 4) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Dark background fallback
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid mesh lines
        ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
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

        // Avatar fallback head
        ctx.fillStyle = "rgba(99, 102, 241, 0.3)";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2.2, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 1.1, 55, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scanning overlay beam
      const scanY = (frame * 1.5) % canvas.height;
      ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Face Bounding Box
      const boxColor = suspicionLevel === "Green" ? "#10b981" : suspicionLevel === "Yellow" ? "#f59e0b" : "#ef4444";
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(canvas.width / 2 - 45, canvas.height / 2.2 - 45, 90, 95);

      ctx.fillStyle = boxColor;
      ctx.font = "bold 9px monospace";
      ctx.fillText(suspicionLevel === "Green" ? "FACE IDENTIFIED" : "WARNING FLAG", 10, 20);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [suspicionLevel]);

  // 7. Periodic Answer Autosave
  const triggerAutosave = useCallback(async (currentAnswers: Record<string, any>) => {
    if (!sessionId || Object.keys(currentAnswers).length === 0) return;
    setAutosaveStatus("Saving...");
    try {
      const token = localStorage.getItem("token") || examToken;
      await axios.post(
        `${getApiBaseUrl()}/exams/answers/autosave`,
        { session_id: sessionId, answers: currentAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAutosaveStatus("Saved");
    } catch (err) {
      console.error("Autosave failed", err);
      setAutosaveStatus("Error");
    }
  }, [sessionId, examToken]);

  // 8. Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token") || examToken;
      const res = await axios.post(`${getApiBaseUrl()}/exams/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const currentQId = questions[currentIdx]?.id;
      if (currentQId) {
        handleSelectAnswer(currentQId, res.data.image_url, "image_upload");
        setImagePreview({ url: res.data.image_url, ocr: res.data.ocr_text });
      }
    } catch (err) {
      alert("Failed to upload image answer.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleForceSubmit = () => {
    handleSubmitAnswers();
  };

  const handleSaveAndNext = () => {
    triggerAutosave(answers);
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
    let updated: Record<string, any>;
    if (type === "multi_select") {
      const currentSelection = answers[qId] || [];
      const newList = currentSelection.includes(value)
        ? currentSelection.filter((v: any) => v !== value)
        : [...currentSelection, value];
      updated = { ...answers, [qId]: newList };
    } else {
      updated = { ...answers, [qId]: value };
    }
    setAnswers(updated);
    triggerAutosave(updated);
  };

  const handleToggleReview = (qId: string) => {
    setMarkedReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitAnswers = async () => {
    setIsSubmittingPaper(true);

    try {
      const submitRes = await submitExamMutation.mutateAsync({
        examId: exam.id,
        answers,
      });

      const resolvedSessionId = submitRes.session_id || sessionId;

      if (resolvedSessionId && accumulatedEvents.length > 0) {
        for (const evt of accumulatedEvents) {
          try {
            await logWarningMutation.mutateAsync({
              sessionId: resolvedSessionId,
              payload: evt,
            });
          } catch (logErr) {
            console.error("Failed to log proctor warning", logErr);
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

  // Utility to calculate word count
  const countWords = (text: string) => {
    if (!text || typeof text !== "string") return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
      {/* Hidden Video element for webcam capture */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* 1. Exam Header Panel */}
      <header className="h-16 border-b border-border/40 bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-extrabold text-sm text-foreground truncate max-w-[200px] sm:max-w-none">
            {exam.title}
          </span>
          {isSessionResumed && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Resumed Session
            </span>
          )}
        </div>

        {/* Timer & Autosave Status Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                autosaveStatus === "Saved" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              )}
            />
            <span>Autosave: {autosaveStatus}</span>
          </div>

          <div className="flex items-center gap-3.5 bg-red-500/10 border border-red-500/20 px-4.5 py-1.5 rounded-2xl">
            <Clock className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="font-bold text-sm text-red-500 font-mono tracking-wider">
              {formatTime(secondsRemaining)}
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          Secure AI-Proctored Interface
        </div>
      </header>

      {/* 2. Main Content Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Question Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between min-w-0">
          <div className="space-y-6">
            {/* Top Specs */}
            <div className="flex justify-between items-center text-xs text-muted-foreground border-b border-border/10 pb-3">
              <span className="font-bold text-primary">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-semibold bg-muted/40 px-2.5 py-1 rounded-xl">
                  Type: {currentQuestion.question_type.replace("_", " ").toUpperCase()}
                </span>
                <span className="font-semibold bg-muted/40 px-2.5 py-1 rounded-xl">
                  Marks: {currentQuestion.marks}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-extrabold text-foreground">{currentQuestion.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {currentQuestion.question_text}
              </p>

              {/* Answers Inputs Types Rendering */}
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

                {/* Short Answer with Word Counter */}
                {currentQuestion.question_type === "short_answer" && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value, "short_answer")}
                      placeholder="Type your response acronym or phrase here..."
                      className="w-full px-4 py-3 text-xs bg-muted/10 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                    />
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                      <span>Word Count: {countWords(answers[currentQuestion.id] || "")} words</span>
                      <span>Target: ~10-30 words</span>
                    </div>
                  </div>
                )}

                {/* Long Answer with Word Counter */}
                {currentQuestion.question_type === "long_answer" && (
                  <div className="space-y-2">
                    <textarea
                      rows={6}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value, "long_answer")}
                      placeholder="Type your detailed explanation or codes here..."
                      className="w-full px-4 py-3 text-xs bg-muted/10 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none"
                    />
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-primary" />
                        Word Count: {countWords(answers[currentQuestion.id] || "")} words
                      </span>
                      <span>Target: ~150-300 words</span>
                    </div>
                  </div>
                )}

                {/* Image Upload & Thumbnail / OCR Preview */}
                {currentQuestion.question_type === "image_upload" && (
                  <div className="space-y-4">
                    <label className="border-2 border-dashed border-border/40 hover:border-primary/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/5 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground/60" />
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground">
                          {imageUploading
                            ? "Processing Image Upload & OCR..."
                            : answers[currentQuestion.id]
                            ? "Answer Uploaded! Click to replace image"
                            : "Upload handwritten calculation or diagram snapshot"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Supported formats: PNG, JPG, WEBP
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={imageUploading}
                      />
                    </label>

                    {answers[currentQuestion.id] && (
                      <div className="p-3 border border-border/40 bg-card rounded-xl space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground">Uploaded Answer Snapshot:</p>
                        <div className="flex items-center gap-3">
                          <img
                            src={answers[currentQuestion.id]}
                            alt="Answer preview"
                            className="w-16 h-16 object-cover rounded-lg border border-border/20"
                          />
                          <div className="text-[10px] text-muted-foreground font-mono space-y-1">
                            <p className="text-emerald-500 font-bold">✓ Upload Complete</p>
                            {imagePreview?.ocr && (
                              <p className="truncate max-w-xs text-foreground">{imagePreview.ocr}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
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

        {/* Right Side: AI Proctor stream & Question Palette */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/40 bg-card flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* AI Proctor Cam Stream */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Video className="w-4.5 h-4.5 text-primary" /> AI Proctor Stream
                </span>
                <span className="text-[9px] font-mono text-emerald-500">WS Live</span>
              </h4>

              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border/40 bg-black relative">
                <canvas ref={canvasRef} width={280} height={158} className="w-full h-full" />
                <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-full">
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
                    Score: {suspicionScore.toFixed(0)} ({suspicionLevel})
                  </span>
                </div>
              </div>

              {/* Hardware Checklist */}
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
                  <span>WS 10s Pulse</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-muted/30 border border-border/10 rounded-xl">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Face Sync</span>
                </div>
              </div>
            </div>

            {/* Question Navigation Palette */}
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

              {/* Legend Info */}
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

          {/* Audit Logs Stream */}
          <div className="p-4 border-t border-border/20 bg-muted/10 max-h-36 overflow-y-auto">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider text-left">
              Real-Time Audit Logs
            </p>
            <div className="font-mono text-[8px] space-y-1 mt-1.5 text-left">
              {proctorLogs.slice(-5).map((log, idx) => (
                <div key={idx} className={log.includes("[ALERT]") ? "text-red-500 font-bold" : "text-emerald-500"}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Warning Modals (AnimatePresence) */}
      <AnimatePresence>
        {/* 1. Tab Switch Warning */}
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

        {/* 2. Security Shortcut Warning (Copy, Paste, Fullscreen) */}
        {securityWarningOpen && (
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
                <h4 className="font-extrabold text-sm text-foreground">Proctor Policy Violation</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{securityWarningText}</p>
              </div>
              <button
                onClick={() => setSecurityWarningOpen(false)}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Acknowledge Warning
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
                <CheckCircle className="w-7 h-7 text-emerald-500" />
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
