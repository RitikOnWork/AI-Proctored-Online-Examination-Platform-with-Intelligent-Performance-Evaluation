"use client";

import React from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

const cardClass = "bg-card border border-border/40 rounded-2xl p-5 shadow-sm";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  color: "hsl(var(--foreground))",
  fontSize: 12,
};

const axisStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cardClass}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

// 1. Monthly Exams Area Chart
export function MonthlyExamsChart({ data = [] }: { data?: any[] }) {
  return (
    <ChartCard title="Exams Conducted" subtitle="Monthly overview — all year">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="conductedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
          <Area type="monotone" dataKey="conducted" name="Conducted" stroke="#6366f1" strokeWidth={2} fill="url(#conductedGrad)" />
          <Area type="monotone" dataKey="completed"  name="Completed"  stroke="#14b8a6" strokeWidth={2} fill="url(#completedGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 2. Monthly Students Bar Chart
export function MonthlyStudentsChart({ data = [] }: { data?: any[] }) {
  return (
    <ChartCard title="Student Registrations" subtitle="Monthly new registrations vs active">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
          <Bar dataKey="registered" name="Registered" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="active"     name="Active"     fill="#14b8a6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 3. Question Type Pie Chart
export function QuestionTypeChart({ data = [] }: { data?: any[] }) {
  return (
    <ChartCard title="Question Type Distribution" subtitle="Breakdown by question format">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry: any, i: number) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [(v as number).toLocaleString(), "Questions"]} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#64748b" }}
            formatter={(value) => <span style={{ color: "#94a3b8" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 4. Exam Completion Rate Donut
export function ExamCompletionChart({ data = [] }: { data?: any[] }) {
  return (
    <ChartCard title="Exam Completion Rate" subtitle="Completed vs cancelled vs in-progress">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={60} outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry: any, i: number) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 5. Subject-wise Bar Chart
export function SubjectWiseChart({ data = [] }: { data?: any[] }) {
  return (
    <ChartCard title="Exams by Subject" subtitle="Total exams per academic subject">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis dataKey="subject" type="category" tick={axisStyle} axisLine={false} tickLine={false} width={85} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="exams" name="Exams" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 6. Proctoring Violations Area Chart
export function ProctoringViolationsChart({ data = [] }: { data?: any[] }) {
  return (
    <ChartCard title="Proctoring Violations" subtitle="Monthly violation breakdown">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="multiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tabGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
          <Area type="monotone" dataKey="faceMissing"    name="Face Missing"    stroke="#f43f5e" strokeWidth={2} fill="url(#faceGrad)"  />
          <Area type="monotone" dataKey="multipleFaces"  name="Multiple Faces"  stroke="#f59e0b" strokeWidth={2} fill="url(#multiGrad)" />
          <Area type="monotone" dataKey="tabSwitch"      name="Tab Switch"      stroke="#6366f1" strokeWidth={2} fill="url(#tabGrad)"   />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
