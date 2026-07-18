"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Clock, UserCheck, ShieldCheck, AlertCircle, Check,
  ArrowLeft, Edit3, Save, ThumbsUp, ChevronRight, CheckSquare, ListTodo
} from "lucide-react";
import { examinerService, GradingQueueItem, GradingSessionResponse, GradingSessionAnswer } from "@/services/examiner";

const cardClass = "bg-slate-900 border border-slate-800/60 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300";

const colorMap: Record<string, { icon: string; iconBg: string; badge: string; bar: string }> = {
  indigo:  { icon: "text-indigo-400",  iconBg: "bg-indigo-500/10 border-indigo-500/20",  badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",  bar: "bg-indigo-500/50" },
  emerald: { icon: "text-emerald-400", iconBg: "bg-emerald-500/10 border-emerald-500/20",badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",bar: "bg-emerald-500/50" },
  blue:    { icon: "text-blue-400",    iconBg: "bg-blue-500/10 border-blue-500/20",      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",      bar: "bg-blue-500/50" },
  violet:  { icon: "text-purple-400",  iconBg: "bg-purple-500/10 border-purple-500/20",  badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",  bar: "bg-purple-500/50" },
  orange:  { icon: "text-orange-400",  iconBg: "bg-orange-500/10 border-orange-500/20",  badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",  bar: "bg-orange-500/50" },
  teal:    { icon: "text-teal-400",    iconBg: "bg-teal-500/10 border-teal-500/20",      badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",      bar: "bg-teal-500/50" }
};

export default function AIGradingQueue() {
  const [queue, setQueue] = useState<GradingQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Review State
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<GradingSessionResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Current grading overrides stubs (maps answer_id -> score)
  const [scoreOverrides, setScoreOverrides] = useState<Record<string, number>>({});
  const [generalFeedback, setGeneralFeedback] = useState("AI evaluation approved with modifications.");

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await examinerService.getGradingQueue();
      setQueue(data);
      setError(null);
    } catch (err) {
      console.error("Queue load error:", err);
      setError("Failed to retrieve grading queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleOpenReview = async (sessionId: string) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const details = await examinerService.getGradingSession(sessionId);
      setSessionDetails(details);
      
      // Initialize scores stubs
      const overrides: Record<string, number> = {};
      details.answers.forEach(a => {
        overrides[a.answer_id] = a.score_obtained;
      });
      setScoreOverrides(overrides);
      setActiveSessionId(sessionId);
    } catch (err) {
      console.error("Details load error:", err);
      setError("Failed to retrieve candidate answer sheet.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApproveAI = (ansId: string, aiScore: number) => {
    setScoreOverrides(prev => ({ ...prev, [ansId]: aiScore }));
  };

  const handleScoreChange = (ansId: string, val: number) => {
    setScoreOverrides(prev => ({ ...prev, [ansId]: val }));
  };

  const handleSubmitGrades = async () => {
    if (!activeSessionId) return;
    setLoadingDetails(true);
    
    // Map score overrides payload
    const gradesPayload = Object.entries(scoreOverrides).map(([ansId, score]) => ({
      answer_id: ansId,
      score
    }));

    try {
      await examinerService.submitSessionGrade(activeSessionId, gradesPayload, generalFeedback);
      setSuccessMsg("Grading finalized and results published!");
      setTimeout(() => {
        setSuccessMsg("");
        setActiveSessionId(null);
        setSessionDetails(null);
        loadQueue();
      }, 2000);
    } catch (err) {
      console.error("Grade submit failed:", err);
      setError("Failed to save grading changes.");
    } finally {
      setLoadingDetails(false);
    }
  };

  if (activeSessionId && sessionDetails) {
    // Review split pane
    return (
      <div className="space-y-6">
        {/* Back and title bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveSessionId(null);
              setSessionDetails(null);
            }}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </button>
          <div className="text-right">
            <h3 className="text-sm font-bold text-slate-200">{sessionDetails.student_name}</h3>
            <p className="text-[10px] text-slate-500">{sessionDetails.exam_title}</p>
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">{error}</p>}
        {successMsg && <p className="text-xs text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">{successMsg}</p>}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          
          {/* Left panel: answers & question statement */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Student Answer Sheet</h4>
            {sessionDetails.answers.map((a, idx) => (
              <div key={a.answer_id} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                  <span className="text-xs font-bold text-indigo-400">Question #{idx + 1}</span>
                  <span className="text-[10px] text-slate-500">Max marks: {a.max_marks}</span>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-slate-300">Statement:</p>
                  <p className="text-xs text-slate-400 mt-1 bg-slate-950/60 p-3 border border-slate-850 rounded-xl leading-relaxed">{a.question_text}</p>
                </div>

                {a.ocr_output && (
                  <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] font-mono text-indigo-300">
                    {a.ocr_output}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-300">Expected answer criteria / rubric:</p>
                  <p className="text-xs text-slate-400 mt-1 bg-slate-950/30 p-3 border border-slate-850 rounded-xl leading-relaxed">{a.expected_answer || "N/A"}</p>
                </div>

                <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Student response:</p>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {a.student_answer || "[No response provided]"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel: AI analysis & examiner evaluations */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">AI Evaluation & Grading Panel</h4>
            {sessionDetails.answers.map((a, idx) => (
              <div key={a.answer_id} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                  <span className="text-xs font-bold text-emerald-400">AI Report #{idx + 1}</span>
                  <span className="text-[10px] text-slate-500">AI Suggested: {a.ai_grading?.score ?? 0} Marks</span>
                </div>

                {/* AI Explanation details */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">AI Grading Justification:</span>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.ai_grading?.explanation}</p>
                  </div>

                  {/* Keywords */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 block mb-1">Matched keywords</span>
                      <div className="flex flex-wrap gap-1">
                        {a.ai_grading?.matched_keywords?.map((k, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/20">{k}</span>
                        )) || <span className="text-[10px] text-slate-600">None detected</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 block mb-1">Missing keywords</span>
                      <div className="flex flex-wrap gap-1">
                        {a.ai_grading?.missing_keywords?.map((k, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] border border-amber-500/20">{k}</span>
                        )) || <span className="text-[10px] text-slate-600">None</span>}
                      </div>
                    </div>
                  </div>

                  {/* Rubric checklist */}
                  {a.ai_grading?.rubric_checklist && a.ai_grading.rubric_checklist.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">Rubric Criteria Checklist</span>
                      {a.ai_grading.rubric_checklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <CheckSquare className={`w-3.5 h-3.5 ${item.checked ? "text-indigo-400" : "text-slate-700"}`} />
                          <span className={item.checked ? "text-slate-300" : "text-slate-500 line-through"}>{item.item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Examiner marks overrides input */}
                <div className="border-t border-slate-800/40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 block uppercase">Examiner Marks</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Input custom marks or approve AI suggestions.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      max={a.max_marks}
                      value={scoreOverrides[a.answer_id] ?? 0}
                      onChange={(e) => handleScoreChange(a.answer_id, Number(e.target.value))}
                      className="w-16 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => handleApproveAI(a.answer_id, a.ai_grading.score)}
                      className="px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-lg font-bold text-[10px] transition-colors"
                    >
                      Approve AI
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* General Feedback & submit */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-300">Grade Finalization</h4>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">General Feedback Transcript</label>
                <textarea
                  rows={2}
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmitGrades}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" /> Approve & Submit Review
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">AI Grading Queue</h2>
        <p className="text-xs text-slate-500 mt-1">Review subjective answers parsed by LLM models with confidence matrices.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: "pending", label: "Pending Reviews", value: queue.filter(q => q.status === "pending").length, icon: Clock, color: "orange" },
          { id: "completed", label: "Completed Today", value: queue.filter(q => q.status === "completed").length, icon: UserCheck, color: "emerald" },
          { id: "confidence", label: "Avg AI Confidence", value: "88.2%", icon: Cpu, color: "indigo" },
          { id: "overrides", label: "Manual Overrides", value: 3, icon: ShieldCheck, color: "violet" }
        ].map((stat) => {
          const Icon = stat.icon;
          const c = colorMap[stat.color] ?? colorMap.indigo;

          return (
            <div key={stat.id} className={cardClass}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl border ${c.iconBg}`}>
                  <Icon className={`w-4 h-4 ${c.icon}`} />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-200">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-rose-500 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">{error}</p>}

      {/* Main Queue table */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-3">
          <Cpu className="w-10 h-10 text-indigo-500/40" />
          <h4 className="text-sm font-semibold text-slate-300">Grading Queue Empty</h4>
          <p className="text-xs text-slate-500 max-w-xs">All candidate responses have been successfully graded or AI thresholds met.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold bg-slate-900/50">
                  <th className="p-4">Student</th>
                  <th className="p-4">Exam</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">AI Score</th>
                  <th className="p-4">AI Confidence</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.session_id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-all">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-200">{item.student_name}</p>
                        <p className="text-[9px] text-slate-500">{item.student_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{item.exam_title}</td>
                    <td className="p-4 text-slate-400">{item.submitted_at}</td>
                    <td className="p-4 text-slate-200 font-bold">{item.ai_score} pts</td>
                    <td className="p-4">
                      <span className="text-indigo-400 font-bold">{item.confidence}%</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        item.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenReview(item.session_id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-bold rounded-xl text-[10px] flex items-center gap-1 ml-auto shadow-md"
                      >
                        Open Review <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
