"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle, Flame, Filter, ChevronRight, Check, AlertCircle
} from "lucide-react";
import { examinerService, GradingQueueItem } from "@/services/examiner";

const cardClass = "bg-slate-900 border border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300";

export default function ManualReviewQueue() {
  const [queue, setQueue] = useState<GradingQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  // Checkboxes for bulk actions
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await examinerService.getGradingQueue();
      // Filter to only pending manual reviews
      const filtered = data.filter(q => q.status === "pending");
      setQueue(filtered);
    } catch (err) {
      console.error("Queue load error:", err);
      setErrorMsg("Failed to load manual grading queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleBulkApprove = async () => {
    if (checkedIds.length === 0) return;
    setLoading(true);
    try {
      for (const sessId of checkedIds) {
        // Fetch session answers
        const session = await examinerService.getGradingSession(sessId);
        // Bulk approve: map each answer's current score
        const grades = session.answers.map(a => ({
          answer_id: a.answer_id,
          score: a.score_obtained // Approves current score
        }));
        await examinerService.submitSessionGrade(sessId, grades, "Bulk approved by examiner.");
      }
      setSuccessMsg(`Bulk approved ${checkedIds.length} candidate sheets!`);
      setCheckedIds([]);
      loadQueue();
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      console.error("Bulk approve failed:", err);
      setErrorMsg("Failed to process bulk approval.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getProcessedQueue = () => {
    let list = [...queue];
    
    if (selectedSubject) {
      list = list.filter(item => item.exam_title.toLowerCase().includes(selectedSubject.toLowerCase()));
    }
    
    if (selectedPriority) {
      if (selectedPriority === "high") {
        list = list.filter(item => item.confidence < 75);
      } else {
        list = list.filter(item => item.confidence >= 75);
      }
    }
    
    list.sort((a, b) => {
      const aLow = a.confidence < 75 ? 1 : 0;
      const bLow = b.confidence < 75 ? 1 : 0;
      if (aLow !== bLow) {
        return bLow - aLow;
      }
      return a.confidence - b.confidence; // Lower confidence first
    });
    
    return list;
  };

  const processed = getProcessedQueue();

  const toggleCheckAll = () => {
    if (checkedIds.length === processed.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(processed.map(q => q.session_id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Manual Review Queue</h2>
          <p className="text-sm text-muted-foreground mt-1">Review subjective answers flagged for manual validation or overrides.</p>
        </div>
        <div className="flex gap-2">
          {checkedIds.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-3.5 py-2 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              Bulk Approve ({checkedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: "pending", label: "Pending Evaluations", value: queue.length, icon: Clock, color: "orange" },
          { id: "completed", label: "Completed Evaluations", value: 14, icon: CheckCircle, color: "emerald" },
          { id: "avg_time", label: "Average Evaluation Time", value: "3.4 min", icon: Flame, color: "indigo" }
        ].map((stat) => {
          const Icon = stat.icon;
          const c = stat.color === "orange" ? "text-orange-400 bg-orange-500/10" :
                    stat.color === "emerald" ? "text-emerald-400 bg-emerald-500/10" :
                    "text-indigo-400 bg-indigo-500/10";

          return (
            <div key={stat.id} className={cardClass}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl border border-transparent ${c}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-200">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-500 flex items-center gap-1.5 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
          <AlertCircle className="w-4 h-4" /> {errorMsg}
        </p>
      )}
      {successMsg && (
        <p className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
          <Check className="w-4 h-4" /> {successMsg}
        </p>
      )}

      {/* Filter panel */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filters:</span>
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Subjects</option>
          <option value="math">Mathematics</option>
          <option value="physics">Physics</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="high">High Alert</option>
          <option value="low">Low Alert</option>
        </select>
      </div>

      {/* Grid table */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : processed.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-500/40" />
          <h4 className="text-sm font-semibold text-slate-300">All Graded</h4>
          <p className="text-xs text-slate-500 max-w-xs">No pending student answers match selected filters.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold bg-slate-900/50">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={checkedIds.length === processed.length}
                      onChange={toggleCheckAll}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                  </th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Exam Paper</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">AI Score</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processed.map((item) => (
                  <tr key={item.session_id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-all">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={checkedIds.includes(item.session_id)}
                        onChange={() => toggleCheck(item.session_id)}
                        className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-200">{item.student_name}</p>
                        <p className="text-[10px] text-slate-500">{item.student_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{item.exam_title}</td>
                    <td className="p-4 text-slate-400">{item.submitted_at}</td>
                    <td className="p-4 text-slate-200 font-bold">{item.ai_score} pts</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        item.confidence < 75 ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {item.confidence < 75 ? "High Review" : "Standard"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          // Renders in same section
                          window.location.hash = `#grading-queue`;
                        }}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-[10px] flex items-center gap-1 ml-auto"
                      >
                        Grading View <ChevronRight className="w-3.5 h-3.5" />
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
