"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Eye, BarChart3, Award, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";

function SummaryCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${color ?? "text-foreground"}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

function ProgressRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className="text-xs font-bold text-foreground">
          {count.toLocaleString()} <span className="text-muted-foreground font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function QuestionBankSummary({ data }: { data?: any }) {
  const summary = data || { total: 0, byType: [], byDifficulty: [] };
  const total = summary.total || 0;
  const byType = summary.byType || [];
  const byDifficulty = summary.byDifficulty || [];

  return (
    <SummaryCard title="Question Bank" icon={BookOpen}>
      <div className="mb-4">
        <p className="text-3xl font-extrabold text-foreground">{total.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Total questions in bank</p>
      </div>
      <div className="space-y-3 mb-5">
        {byType.map((q: any) => (
          <ProgressRow key={q.type} label={q.type} count={q.count} total={total} color={q.color} />
        ))}
      </div>
      <div className="border-t border-border/40 pt-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Difficulty Distribution</p>
        <div className="flex gap-2">
          {byDifficulty.map((d: any) => (
            <div key={d.level} className="flex-1 text-center p-2.5 rounded-xl bg-muted/50 border border-border/30">
              <p className="text-sm font-extrabold" style={{ color: d.color }}>{d.pct}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{d.level}</p>
            </div>
          ))}
        </div>
      </div>
    </SummaryCard>
  );
}

export function ProctoringStatsSummary({ data }: { data?: any }) {
  const p = data || {
    totalSessions: 0,
    suspiciousSessions: 0,
    multipleFaceAlerts: 0,
    faceMissingAlerts: 0,
    tabSwitchEvents: 0,
    avgSuspicionScore: 0
  };
  return (
    <SummaryCard title="Proctoring Summary" icon={Eye}>
      <div className="space-y-0">
        <StatRow label="Total Sessions"       value={p.totalSessions}                        />
        <StatRow label="Suspicious Sessions"  value={p.suspiciousSessions}  color="text-destructive" />
        <StatRow label="Multiple Face Alerts" value={p.multipleFaceAlerts}  color="text-amber-500"   />
        <StatRow label="Face Missing Alerts"  value={p.faceMissingAlerts}   color="text-orange-500"  />
        <StatRow label="Tab Switch Events"    value={p.tabSwitchEvents}     color="text-accent"      />
        <StatRow label="Avg Suspicion Score"  value={`${p.avgSuspicionScore}%`}              />
      </div>
      <div className="mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">
            {p.totalSessions > 0 ? Math.round((p.suspiciousSessions / p.totalSessions) * 100) : 0}% sessions flagged as suspicious
          </p>
        </div>
      </div>
    </SummaryCard>
  );
}

export function ResultStatsSummary({ data }: { data?: any }) {
  const r = data || {
    passed: 0,
    failed: 0,
    pendingManual: 0,
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0
  };
  const total = (r.passed + r.failed) || 1;
  return (
    <SummaryCard title="Result Summary" icon={BarChart3}>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Passed",       value: r.passed,         icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Failed",       value: r.failed,         icon: XCircle,      color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
          { label: "Pending Eval", value: r.pendingManual,  icon: Clock,        color: "text-amber-500",   bg: "bg-amber-500/10 border-amber-500/20"     },
          { label: "Avg Score",    value: `${r.avgScore}%`, icon: Award,        color: "text-primary",     bg: "bg-primary/10 border-primary/20"         },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`p-3 rounded-xl border ${bg} flex flex-col gap-1`}>
            <Icon className={`w-4 h-4 ${color}`} />
            <p className={`text-lg font-extrabold ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Pass Rate</span>
          <span className="text-emerald-500 font-bold">{Math.round((r.passed / total) * 100)}%</span>
        </div>
        <div className="h-2 bg-border/40 rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(r.passed / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-emerald-500 rounded-l-full"
          />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(r.failed / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            className="h-full bg-destructive rounded-r-full"
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Highest: {r.highestScore}%</span>
          <span>Lowest: {r.lowestScore}%</span>
        </div>
      </div>
    </SummaryCard>
  );
}
