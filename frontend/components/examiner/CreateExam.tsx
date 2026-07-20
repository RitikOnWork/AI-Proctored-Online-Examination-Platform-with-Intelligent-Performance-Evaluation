"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info, BookOpen, Settings, Eye, Check, Calendar,
  ShieldAlert, Shield, ArrowRight, ArrowLeft, Plus, CheckSquare, AlertCircle
} from "lucide-react";
import { api } from "@/services/api";

type Subject = {
  id: string;
  name: string;
};

type Question = {
  id: string;
  title: string;
  question_text: string;
  marks: number;
  question_type: string;
  difficulty: string;
};

export default function CreateExam() {
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Wizard state values
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    subject_id: "",
    description: "",
    instructions: "1. Maintain fullscreen mode throughout.\n2. Do not leave the webcam view.\n3. Copy/paste is prohibited."
  });

  const [selectionMode, setSelectionMode] = useState<"manual" | "random">("manual");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [randomParams, setRandomParams] = useState({
    poolSize: 10,
    difficulty: "medium",
    easy_percent: 40,
    medium_percent: 40,
    hard_percent: 20
  });

  const [config, setConfig] = useState({
    duration: 60,
    negativeMarking: 0.0,
    shuffleQuestions: true,
    shuffleOptions: true,
    passingMarks: 40,
    maxAttempts: 1
  });

  const [proctoring, setProctoring] = useState({
    faceDetection: true,
    gazeTracking: true,
    tabSwitch: true,
    multiplePerson: true,
    copyPaste: true,
    fullscreen: true,
    webcam: true,
    microphone: false
  });

  const [startLater, setStartLater] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.get("/subjects");
        setSubjects(res.data);
        if (res.data.length > 0) {
          setBasicInfo(prev => ({ ...prev, subject_id: res.data[0].id }));
        }
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    }
    loadSubjects();
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const res = await api.get(`/questions?subject_id=${basicInfo.subject_id}&limit=200`);
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (basicInfo.subject_id) {
      loadQuestions();
    }
  }, [basicInfo.subject_id]);

  const handleNext = () => {
    if (step === 1 && !basicInfo.title) {
      setErrorMsg("Title is required.");
      return;
    }
    setErrorMsg("");
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep(prev => prev - 1);
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveExam = async (isPublish: boolean) => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    let start_dt = null;
    let end_dt = null;
    if (startLater && scheduledTime) {
      start_dt = new Date(scheduledTime).toISOString();
      end_dt = new Date(new Date(scheduledTime).getTime() + config.duration * 60000).toISOString();
    } else if (isPublish) {
      start_dt = new Date().toISOString();
      end_dt = new Date(new Date().getTime() + config.duration * 60000).toISOString();
    }

    const payload = {
      title: basicInfo.title,
      description: basicInfo.description || basicInfo.instructions,
      duration_minutes: config.duration,
      passing_score: config.passingMarks,
      start_time: start_dt,
      end_time: end_dt,
      is_published: isPublish,
      subject_id: basicInfo.subject_id,
      settings: {
        shuffle_questions: config.shuffleQuestions,
        webcam_required: proctoring.webcam,
        microphone_required: proctoring.microphone,
        browser_lock_required: proctoring.tabSwitch,
        gaze_tracking_required: proctoring.gazeTracking,
        difficulty_distribution: {
          easy: randomParams.easy_percent,
          medium: randomParams.medium_percent,
          hard: randomParams.hard_percent
        }
      }
    };

    try {
      // 1. Create Exam settings config
      const examRes = await api.post("/exams", payload);
      const examId = examRes.data.id;

      // 2. Link questions
      let qLinks = [];
      if (selectionMode === "manual") {
        qLinks = selectedQuestionIds.map((id, index) => ({
          question_id: id,
          order: index + 1
        }));
      } else {
        // Random selection: pick questions automatically matching difficulty
        const filtered = questions.filter(q => q.difficulty === randomParams.difficulty);
        const pool = filtered.slice(0, randomParams.poolSize);
        qLinks = pool.map((q, index) => ({
          question_id: q.id,
          order: index + 1
        }));
      }

      if (qLinks.length > 0) {
        await api.post(`/exams/${examId}/questions`, { questions: qLinks });
      }

      setSuccessMsg(isPublish ? "Exam published successfully!" : "Exam draft saved successfully!");
      
      // Reset wizard
      setTimeout(() => {
        setStep(1);
        setBasicInfo({ title: "", subject_id: subjects[0]?.id || "", description: "", instructions: "" });
        setSelectedQuestionIds([]);
        setSuccessMsg("");
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to configure exam. Review entries.");
    } finally {
      setSaving(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Basic Info", icon: Info },
    { num: 2, label: "Question Pool", icon: BookOpen },
    { num: 3, label: "Timing & Grading", icon: Settings },
    { num: 4, label: "Proctoring Security", icon: ShieldAlert },
    { num: 5, label: "Review & Publish", icon: Eye }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create New Exam</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure assessment templates and AI security constraints.</p>
      </div>

      {/* Progress wizard indicators */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4 flex justify-between items-center overflow-x-auto scrollbar-hide">
        {stepsList.map((s, idx) => {
          const Icon = s.icon;
          const isDone = s.num < step;
          const isCurrent = s.num === step;

          return (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                  isDone ? "bg-indigo-600 border-indigo-500 text-indigo-50" :
                  isCurrent ? "bg-slate-950 border-indigo-500/40 text-indigo-400" :
                  "bg-slate-950 border-slate-800 text-slate-500"
                }`}>
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-[10px] font-bold ${isCurrent ? "text-indigo-400" : isDone ? "text-slate-200" : "text-slate-500"}`}>
                    {s.label}
                  </p>
                </div>
              </div>
              {idx < stepsList.length - 1 && (
                <div className={`flex-1 h-[1px] mx-4 hidden md:block ${isDone ? "bg-indigo-600" : "bg-slate-800"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Card wizard container */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 min-h-[50vh] flex flex-col justify-between">
        
        <div className="space-y-5">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Subject</label>
                  <select
                    value={basicInfo.subject_id}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, subject_id: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Exam Paper Title</label>
                  <input
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Mechanics Final Assessment"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide syllabus chapters or module details..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Candidate Instructions</label>
                <textarea
                  rows={3}
                  value={basicInfo.instructions}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none font-mono text-slate-300"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: Question selection */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200">Select Questions</h3>
                <div className="flex bg-slate-950 rounded-xl p-0.5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectionMode("manual")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectionMode === "manual" ? "bg-indigo-600 text-indigo-50" : "text-slate-400"
                    }`}
                  >
                    Manual Select
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("random")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectionMode === "random" ? "bg-indigo-600 text-indigo-50" : "text-slate-400"
                    }`}
                  >
                    Random Pool
                  </button>
                </div>
              </div>

              {selectionMode === "manual" ? (
                <div className="space-y-2 max-h-[350px] overflow-y-auto border border-slate-800 rounded-xl p-3 bg-slate-950/40 scrollbar-thin">
                  {loadingQuestions ? (
                    <p className="text-xs text-slate-500 text-center py-6">Loading subject questions...</p>
                  ) : questions.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No questions found. Add questions in Question Bank first.</p>
                  ) : (
                    questions.map(q => (
                      <div
                        key={q.id}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          selectedQuestionIds.includes(q.id) ? "bg-indigo-600/5 border-indigo-500/20" : "bg-slate-950 border-slate-850"
                        }`}
                        onClick={() => toggleQuestionSelection(q.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.includes(q.id)}
                          onChange={() => {}}
                          className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-200">{q.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{q.question_text}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500 font-bold uppercase">
                            <span>{q.question_type}</span>
                            <span>•</span>
                            <span>{q.difficulty}</span>
                            <span>•</span>
                            <span className="text-indigo-400">{q.marks} Marks</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-slate-850 bg-slate-950/30 rounded-2xl">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Pool Size (Questions Count)</label>
                    <input
                      type="number"
                      value={randomParams.poolSize}
                      onChange={(e) => setRandomParams(prev => ({ ...prev, poolSize: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Primary Difficulty</label>
                    <select
                      value={randomParams.difficulty}
                      onChange={(e) => setRandomParams(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                    >
                      <option value="easy">Easy Only</option>
                      <option value="medium">Medium Only</option>
                      <option value="hard">Hard Only</option>
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Config */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Timing & Grading Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={config.duration}
                    onChange={(e) => setConfig(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Passing Marks (%)</label>
                  <input
                    type="number"
                    value={config.passingMarks}
                    onChange={(e) => setConfig(prev => ({ ...prev, passingMarks: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Max Attempts</label>
                  <input
                    type="number"
                    value={config.maxAttempts}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxAttempts: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Shuffle Exam Questions</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Scramble item positions uniquely for each candidate.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.shuffleQuestions}
                    onChange={(e) => setConfig(prev => ({ ...prev, shuffleQuestions: e.target.checked }))}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-0 w-4 h-4 bg-slate-950"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Shuffle MCQ Options</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Scramble answer options uniquely for each candidate.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.shuffleOptions}
                    onChange={(e) => setConfig(prev => ({ ...prev, shuffleOptions: e.target.checked }))}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-0 w-4 h-4 bg-slate-950"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Proctoring rules */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">AI Proctoring constraints</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "webcam", label: "Camera Required", desc: "Mandates webcam activation to open paper." },
                  { key: "faceDetection", label: "Face Detection", desc: "Detects missing or unauthorized candidate faces." },
                  { key: "gazeTracking", label: "Gaze Tracking", desc: "Analyzes eye-deviations out of screen boundaries." },
                  { key: "tabSwitch", label: "Tab Lock Protection", desc: "Logs window tab changes and suspends session." },
                  { key: "multiplePerson", label: "Multiple Person Alerts", desc: "Detects secondary persons in workspace." },
                  { key: "copyPaste", label: "Disable Copy/Paste", desc: "Prevents copying questions or pasting stubs." },
                  { key: "fullscreen", label: "Enforce Fullscreen", desc: "Closes session if browser exit is triggered." },
                  { key: "microphone", label: "Microphone Required", desc: "Requires constant ambient noise logging." }
                ].map((item) => (
                  <div key={item.key} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{item.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={(proctoring as any)[item.key]}
                      onChange={(e) => setProctoring(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-0 w-4 h-4 mt-0.5 bg-slate-950"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: Preview & publish */}
          {step === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Review Configuration Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-800 p-4 rounded-2xl bg-slate-950/20">
                <div className="space-y-2">
                  <p className="text-xs"><span className="text-slate-500 font-bold">Title:</span> <span className="text-slate-200">{basicInfo.title}</span></p>
                  <p className="text-xs"><span className="text-slate-500 font-bold">Duration:</span> <span className="text-slate-200">{config.duration} Minutes</span></p>
                  <p className="text-xs"><span className="text-slate-500 font-bold">Passing score:</span> <span className="text-slate-200">{config.passingMarks}%</span></p>
                  <p className="text-xs"><span className="text-slate-500 font-bold">Attempts limit:</span> <span className="text-slate-200">{config.maxAttempts}</span></p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs">
                    <span className="text-slate-500 font-bold">Questions Selection:</span>{" "}
                    <span className="text-indigo-400 font-semibold">
                      {selectionMode === "manual" ? `${selectedQuestionIds.length} Selected` : `${randomParams.poolSize} Random (Difficulty: ${randomParams.difficulty})`}
                    </span>
                  </p>
                  <p className="text-xs">
                    <span className="text-slate-500 font-bold">Proctoring rules:</span>{" "}
                    <span className="text-emerald-400">
                      {Object.entries(proctoring).filter(([_, v]) => v).map(([k]) => k.replace(/^[a-z]/, (m) => m.toUpperCase())).join(", ")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Schedule options */}
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={startLater}
                    onChange={(e) => setStartLater(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-0"
                  />
                  <label className="text-xs font-semibold text-slate-300">Schedule exam for later date</label>
                </div>
                {startLater && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation bottom buttons */}
        <div className="border-t border-slate-800 pt-4 mt-6">
          {errorMsg && (
            <p className="text-xs text-rose-500 mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </p>
          )}
          {successMsg && (
            <p className="text-xs text-emerald-400 mb-3 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {successMsg}
            </p>
          )}

          <div className="flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-400 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-md"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveExam(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveExam(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-semibold rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/10"
                >
                  {saving ? "Creating..." : "Publish & Release"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
