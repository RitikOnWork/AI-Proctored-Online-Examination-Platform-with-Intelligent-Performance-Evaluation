"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, User, History, Check, AlertCircle, Clock, BookOpen,
  ArrowRight, ShieldCheck, ChevronRight, X
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { examinerService, StudentListItem } from "@/services/examiner";

const cardClass = "bg-slate-900 border border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300";

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(51, 65, 85, 0.5)",
  borderRadius: 12,
  color: "#f1f5f9",
  fontSize: 12,
};

const axisStyle = { fill: "#64748b", fontSize: 11 };

export default function Students() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const data = await examinerService.getStudents();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudent(data[0]);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to retrieve students roster.");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const performanceData = selectedStudent
    ? selectedStudent.performance_trend.map((score, index) => ({
        attempt: `Test #${index + 1}`,
        score
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Students Registry</h2>
        <p className="text-sm text-muted-foreground mt-1">Audit student history profiles, performance trends, and security violation aggregates.</p>
      </div>

      {errorMsg && <p className="text-xs text-rose-500 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">{errorMsg}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Students List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidates</h3>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-2xl" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No students found.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedStudent?.id === student.id
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                      : "bg-slate-900 border-slate-800/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center font-bold text-xs">
                      {student.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{student.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{student.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Student Details & Trend Charts */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Profile</h3>
              
              <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-6">
                
                {/* Header info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-lg text-indigo-50 shadow-md">
                    {selectedStudent.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{selectedStudent.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedStudent.email}</p>
                  </div>
                </div>

                {/* Performance stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950/40 p-3.5 border border-slate-850 rounded-2xl text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Attempts</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">{selectedStudent.attempts} exams</span>
                  </div>
                  <div className="bg-slate-950/40 p-3.5 border border-slate-850 rounded-2xl text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Violations logged</span>
                    <span className="text-xs font-bold text-rose-400 mt-1 block">{selectedStudent.violations} alerts</span>
                  </div>
                  <div className="bg-slate-950/40 p-3.5 border border-slate-850 rounded-2xl text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Avg exam time</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">{selectedStudent.avg_time}</span>
                  </div>
                  <div className="bg-slate-950/40 p-3.5 border border-slate-850 rounded-2xl text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Account status</span>
                    <span className="text-xs font-bold text-emerald-400 mt-1 block uppercase">{selectedStudent.status}</span>
                  </div>
                </div>

                {/* Score Trend Chart */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-3 uppercase tracking-wider">Performance Trend (last 4 attempts)</span>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="attempt" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Strong/Weak areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/40 pt-4">
                  <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
                    <p className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      Strong Areas
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudent.strong_topics.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
                    <p className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      Weak Areas
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudent.weak_topics.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-2">
              <Users className="w-8 h-8 text-indigo-500/40" />
              <p className="text-xs font-semibold text-slate-300">Select Student</p>
              <p className="text-[10px] text-slate-500">Pick a student from the sidebar to inspect detailed transcripts.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
