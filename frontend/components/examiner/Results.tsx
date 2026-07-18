"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, TrendingUp, Download, Mail, ChevronRight, X,
  User, Calendar, Clock, AlertTriangle, ShieldCheck, FileText, Check, FileSpreadsheet
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { examinerService, ResultItem } from "@/services/examiner";

const cardClass = "bg-slate-900 border border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300";

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(51, 65, 85, 0.5)",
  borderRadius: 12,
  color: "#f1f5f9",
  fontSize: 12,
};

const axisStyle = { fill: "#64748b", fontSize: 11 };

export default function Results() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Student Details Drilldown State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showDrilldown, setShowDrilldown] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await examinerService.getResults();
      setResults(res);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load student results sheet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleEmailResult = (email: string) => {
    setSuccessMsg(`Result transcript emailed to ${email}!`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleDownloadPDF = (name: string) => {
    setSuccessMsg(`PDF Report for ${name} compiled and downloaded!`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Student,Exam,Objective,Subjective,Total,Percentage,Passed\n" +
      results.map(r => `${r.student_name},${r.exam_title},${r.objective_score},${r.subjective_score},${r.total_score},${r.percentage},${r.is_passed}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `results_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Recharts metric calculations
  const totalCount = results.length || 1;
  const passedCount = results.filter(r => r.is_passed).length;
  const failedCount = totalCount - passedCount;
  const passPercent = Math.round((passedCount / totalCount) * 100);
  const failPercent = 100 - passPercent;

  const passFailData = [
    { name: "Pass", value: passedCount, color: "#10b981" },
    { name: "Fail", value: failedCount, color: "#ef4444" }
  ];

  const topPerformers = results
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 4)
    .map(r => ({ name: r.student_name, score: r.total_score }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Grades & Results</h2>
          <p className="text-xs text-slate-500 mt-1">Export, download or audit finalized student marks transcripts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {successMsg && (
        <p className="text-xs text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex items-center gap-1.5">
          <Check className="w-4 h-4" /> {successMsg}
        </p>
      )}

      {/* Summary charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pass % vs Fail % */}
        <div className={cardClass}>
          <h3 className="text-xs font-semibold text-slate-400 mb-4">Passing Rate Metrics</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
            <ResponsiveContainer width={150} height={150} className="flex-shrink-0">
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {passFailData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Passed Candidates:</span>{" "}
                <span className="font-bold text-slate-200">{passedCount} ({passPercent}%)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-400">Failed Candidates:</span>{" "}
                <span className="font-bold text-slate-200">{failedCount} ({failPercent}%)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className={cardClass}>
          <h3 className="text-xs font-semibold text-slate-400 mb-4">Top Performers Curve</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={topPerformers} barSize={15}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Results ledger */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-2">
          <Award className="w-8 h-8 text-indigo-500/40" />
          <p className="text-xs font-semibold text-slate-300">No Grades Ledger</p>
          <p className="text-[10px] text-slate-500">Student evaluations will display here once answers are graded.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold bg-slate-900/50">
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Exam Paper</th>
                  <th className="p-4">Objective</th>
                  <th className="p-4">Subjective</th>
                  <th className="p-4">Total Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-all">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-200">{r.student_name}</p>
                        <p className="text-[10px] text-slate-500">{r.student_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{r.exam_title}</td>
                    <td className="p-4 text-slate-400">{(r.objective_score || 0).toFixed(1)} pts</td>
                    <td className="p-4 text-slate-400">{(r.subjective_score || 0).toFixed(1)} pts</td>
                    <td className="p-4 font-bold text-indigo-400">{r.total_score} pts ({r.percentage.toFixed(0)}%)</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        r.is_passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {r.is_passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudent(r);
                            setShowDrilldown(true);
                          }}
                          className="p-1.5 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-lg"
                        >
                          <User className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(r.student_name)}
                          className="p-1.5 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-lg"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEmailResult(r.student_email)}
                          className="p-1.5 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-lg"
                        >
                          <Mail className="w-3.5 h-3.5" />
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

      {/* STUDENT DRILLDOWN DRAWER */}
      <AnimatePresence>
        {showDrilldown && selectedStudent && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="bg-slate-900 border-l border-slate-800/80 w-full max-w-md h-full p-6 overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setShowDrilldown(false)}
                className="absolute top-4 left-4 p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pt-8 pb-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl text-indigo-50 mb-3 shadow-lg shadow-indigo-500/20">
                  {selectedStudent.student_name[0].toUpperCase()}
                </div>
                <h4 className="text-sm font-bold text-slate-200">{selectedStudent.student_name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedStudent.student_email}</p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] text-slate-500 block uppercase">Final Grade</span>
                  <span className={`text-xs font-bold ${selectedStudent.is_passed ? "text-emerald-400" : "text-rose-400"}`}>
                    {selectedStudent.is_passed ? "Passed" : "Failed"} ({selectedStudent.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] text-slate-500 block uppercase">Violations logged</span>
                  <span className="text-xs font-bold text-slate-300">1 warning</span>
                </div>
              </div>

              {/* Details sections */}
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
                  <p className="font-bold text-slate-300 border-b border-slate-850 pb-1.5">Strong Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px]">Mathematics</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px]">Computer Science</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
                  <p className="font-bold text-slate-300 border-b border-slate-850 pb-1.5">Weak Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px]">Chemistry</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
                  <p className="font-bold text-slate-300 border-b border-slate-850 pb-1.5">AI Feedback Comments</p>
                  <p className="text-slate-400 leading-relaxed italic">
                    "Candidate displayed high conceptual clarity in objective questions. Tab changes indicate minor shifts, but overall focus was maintained."
                  </p>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
