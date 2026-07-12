"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { useAnalytics } from "@/hooks/useStudent";
import {
  TrendingUp,
  Brain,
  Download,
  AlertTriangle,
  Lightbulb,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PerformanceAnalytics() {
  const { data: analyticsData, isLoading } = useAnalytics();

  const handleDownloadReport = () => {
    alert("Initiated download for student_analytics_report.pdf");
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading performance diagnostics...
      </div>
    );
  }

  const monthlyPerformance = analyticsData?.monthlyPerformance || [];
  const peerBenchmarking = analyticsData?.peerBenchmarking || [];
  const accuracyTrend = analyticsData?.accuracyTrend || [];
  const proficiencyBreakdown = analyticsData?.proficiencyBreakdown || [];
  const insights = analyticsData?.insights || [];

  return (
    <div className="space-y-6 text-left">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Performance Diagnostics</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            AI-generated performance analytics and peer benchmarking reports.
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="px-4 py-2.5 bg-card hover:bg-muted border border-border/40 text-xs font-semibold text-foreground hover:text-primary rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download Analytics PDF
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Monthly Performance Line Chart */}
        <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Monthly Progress Trend
            </h3>
          </div>
          <div className="h-64 w-full text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[50, 100]} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Peer Benchmarking Bar Chart */}
        <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Student vs Peer Average
            </h3>
          </div>
          <div className="h-64 w-full text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peerBenchmarking} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="exam" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar dataKey="score" name="Your Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg" name="Peer Avg" fill="#8b5cf6" opacity={0.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Accuracy Trend Stacked Area Chart */}
        <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Question Type Accuracy Trend
            </h3>
          </div>
          <div className="h-64 w-full text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Area type="monotone" dataKey="mcq" name="MCQs" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                <Area type="monotone" dataKey="multiselect" name="Multi-Select" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="short" name="Short Ans." stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Strengths & Weaknesses Panel */}
        <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4 w-full">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Subject Proficiency Breakdown
            </h3>
            <div className="space-y-3">
              {proficiencyBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{item.subject}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/30 border border-border/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Diagnosed Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-card border border-primary/20 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">AI Diagnostic Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-card border border-border/30 rounded-xl p-4 flex gap-3 items-start">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                    insight.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}
                >
                  {insight.type === "success" ? "✔️" : "⚠️"}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">{insight.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                    {insight.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
