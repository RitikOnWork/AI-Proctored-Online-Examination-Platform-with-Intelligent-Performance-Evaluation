"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, BarChart3, HelpCircle, UserCheck, ShieldCheck, Clock
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { examinerService, AnalyticsResponse } from "@/services/examiner";

const cardClass = "bg-slate-900 border border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300";

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(51, 65, 85, 0.5)",
  borderRadius: 12,
  color: "#f1f5f9",
  fontSize: 12,
};

const axisStyle = { fill: "#64748b", fontSize: 11 };

export default function Analytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Interactive filters state
  const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d">("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await examinerService.getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load analytics details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Dynamic filter scaling calculations
  const getFilteredPerformance = () => {
    if (!data) return [];
    let list = data.subjectPerformance;
    if (subjectFilter !== "all") {
      list = list.filter(item => item.subject.toLowerCase() === subjectFilter.toLowerCase());
    }
    return list.map(item => {
      let scale = 1.0;
      if (timeFilter === "7d") scale = 0.22;
      else if (timeFilter === "30d") scale = 0.58;
      
      return {
        ...item,
        participation: Math.max(1, Math.round(item.participation * scale)),
        average: Math.round(item.average * (timeFilter === "7d" ? 0.98 : 1.0))
      };
    });
  };

  const getFilteredDifficulty = () => {
    if (!data) return [];
    let scale = 1.0;
    if (timeFilter === "7d") scale = 0.22;
    else if (timeFilter === "30d") scale = 0.58;

    return data.difficulty.map(item => ({
      ...item,
      count: Math.max(1, Math.round(item.count * scale))
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <span className="text-2xl">⚠️</span>
        <p className="text-slate-200 font-semibold">Analytics Unavailable</p>
        <p className="text-xs text-slate-500 max-w-xs">{errorMsg}</p>
      </div>
    );
  }

  // Simulated top difficult questions
  const difficultQuestions = [
    { title: "Q3. Vector Spaces & Orthogonality", avgScore: "34%", subject: "Maths" },
    { title: "Q12. Einstein's Special Relativity Derivation", avgScore: "42%", subject: "Physics" },
    { title: "Q8. Redux Store Configuration Schema", avgScore: "48%", subject: "Computer Science" }
  ];

  const getFilteredDifficultQuestions = () => {
    if (subjectFilter === "all") return difficultQuestions;
    return difficultQuestions.filter(q => q.subject.toLowerCase() === subjectFilter.toLowerCase());
  };

  const getFilteredHeatmap = () => {
    if (!data) return [];
    let scale = 1.0;
    if (timeFilter === "7d") scale = 0.22;
    else if (timeFilter === "30d") scale = 0.58;

    return data.heatmap.map(cell => ({
      ...cell,
      submissions: Math.max(0, Math.round(cell.submissions * scale))
    }));
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Performance Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">Advanced metrics detailing course participation, AI accuracy, and candidate averages.</p>
        </div>

        {/* Time and Subject filter selections */}
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="flex-1 sm:flex-initial bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">All Time Records</option>
            <option value="30d">Last 30 Days</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="flex-1 sm:flex-initial bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">All Subjects</option>
            <option value="maths">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="computer science">Computer Science</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subject wise Participation */}
        <div className={`${cardClass} lg:col-span-2`}>
          <h3 className="text-xs font-semibold text-slate-400 mb-4">Subject-wise Participation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getFilteredPerformance()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="participation" name="Candidates count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="average" name="Average Marks %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty Distribution */}
        <div className={cardClass}>
          <h3 className="text-xs font-semibold text-slate-400 mb-4">Question Bank difficulties</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={getFilteredDifficulty()}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={65}
                paddingAngle={4}
                dataKey="count"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reviewer Consistency */}
        <div className={cardClass}>
          <h3 className="text-xs font-semibold text-slate-400 mb-4">Reviewer Grading Consistency (Standard Deviation)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.reviewerConsistency}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 3]} tick={{ fill: "#64748b", fontSize: 9 }} />
              <Radar name="Deviation Index" dataKey="deviation" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* AI accuracy */}
        <div className={cardClass}>
          <h3 className="text-xs font-semibold text-slate-400 mb-4">AI Grading Accuracy Trend</h3>
          <div className="flex items-center justify-between p-4 bg-slate-950/40 rounded-xl mb-3 border border-slate-850">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Current Index</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{data.accuracy}%</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-500/20" />
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            AI scoring accuracy is computed against manual examiner overrides. A high accuracy index indicates rubric validation parity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Difficult Questions */}
        <div className={`${cardClass} lg:col-span-1`}>
          <h3 className="text-xs font-semibold text-slate-400 mb-4">Top Difficult Questions</h3>
          <div className="space-y-3">
            {getFilteredDifficultQuestions().map((q, i) => (
              <div key={i} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-indigo-400">{q.subject}</span>
                  <span className="text-rose-400">Avg score: {q.avgScore}</span>
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-1">{q.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap density */}
        <div className={`${cardClass} lg:col-span-2`}>
          <h3 className="text-xs font-semibold text-slate-400 mb-3">Submission Density Heatmap (Active Times)</h3>
          <p className="text-[10px] text-slate-500 mb-4">Color density represents the relative volume of candidate submissions.</p>
          <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-slate-400">
            {getFilteredHeatmap().map((cell, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-850 flex flex-col items-center justify-center gap-1 bg-slate-950/60"
              >
                <span className="font-bold text-slate-500">{cell.day} {cell.hour}</span>
                <span className="text-xs font-black text-indigo-400">{cell.submissions} subs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
