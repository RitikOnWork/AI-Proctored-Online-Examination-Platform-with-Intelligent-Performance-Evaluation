"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trash2, Edit2, Play, AlertCircle, X,
  ExternalLink, Calendar, Clock, Award, BarChart3, Check
} from "lucide-react";
import { api } from "@/services/api";

type Exam = {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  passing_score: number;
  start_time?: string;
  end_time?: string;
  is_published: boolean;
  subject?: { name: string };
};

export default function MyExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get("/exams?limit=100");
      setExams(res.data);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
      setErrorMsg("Failed to retrieve exams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      await api.post(`/exams/${id}/publish`);
      setSuccessMsg("Exam published successfully!");
      fetchExams();
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      console.error("Publish failed:", err);
      setErrorMsg("Failed to publish exam.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this exam configurator?")) {
      try {
        await api.delete(`/exams/${id}`);
        setSuccessMsg("Exam config deleted.");
        fetchExams();
        setTimeout(() => setSuccessMsg(""), 2000);
      } catch (err) {
        console.error("Delete failed:", err);
        setErrorMsg("Failed to delete exam.");
      }
    }
  };

  const getStatusBadge = (exam: Exam) => {
    const now = new Date();
    if (!exam.is_published) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
          Draft
        </span>
      );
    }

    if (exam.start_time) {
      const start = new Date(exam.start_time);
      const end = exam.end_time ? new Date(exam.end_time) : null;
      
      if (start > now) {
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Scheduled
          </span>
        );
      }
      if (end && end < now) {
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900 text-slate-500 border border-slate-800">
            Completed
          </span>
        );
      }
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
        Active
      </span>
    );
  };

  // Filter exams based on search query
  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">My Examinations</h2>
          <p className="text-sm text-muted-foreground mt-1">Review active, completed, or draft online papers.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search exam papers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-500 flex items-center gap-1.5 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4" /> {errorMsg}
        </p>
      )}
      {successMsg && (
        <p className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
          <Check className="w-4 h-4" /> {successMsg}
        </p>
      )}

      {/* Grid items */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-3">
          <Calendar className="w-10 h-10 text-indigo-500/40" />
          <h4 className="text-sm font-semibold text-slate-300">No Exams Configured</h4>
          <p className="text-xs text-slate-500 max-w-xs">Use the Create Exam Wizard to deploy your first assessment paper.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold bg-slate-900/50">
                  <th className="p-4">Exam Paper</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Passing Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-all">
                    <td className="p-4 font-bold text-slate-200">
                      <div>
                        <p>{exam.title}</p>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">ID: {exam.id}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{exam.subject?.name || "General"}</td>
                    <td className="p-4 text-slate-400 flex items-center gap-1.5 mt-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {exam.duration_minutes} mins
                    </td>
                    <td className="p-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        {exam.passing_score}%
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(exam)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!exam.is_published && (
                          <button
                            onClick={() => handlePublish(exam.id)}
                            className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg font-bold text-[10px] transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-rose-500 hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
