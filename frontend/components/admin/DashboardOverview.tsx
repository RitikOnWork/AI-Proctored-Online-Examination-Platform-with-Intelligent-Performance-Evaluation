"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { dashboardService, DashboardStatsResponse } from "@/services/dashboard";
import OverviewCards from "@/components/admin/OverviewCards";
import {
  MonthlyExamsChart, MonthlyStudentsChart, QuestionTypeChart,
  ExamCompletionChart, SubjectWiseChart, ProctoringViolationsChart
} from "@/components/admin/DashboardCharts";
import RecentActivity from "@/components/admin/RecentActivity";
import QuickActions from "@/components/admin/QuickActions";
import ExamManagement from "@/components/admin/ExamManagement";
import {
  QuestionBankSummary, ProctoringStatsSummary, ResultStatsSummary
} from "@/components/admin/SummaryPanels";
import {
  RecentStudentsTable, RecentExaminersTable,
  PendingEvaluationsTable, RecentProctorEventsTable
} from "@/components/admin/DataTables";

const sectionAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load dashboard statistics:", err);
        setError(err.response?.data?.detail || err.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div>
          <p className="text-sm font-semibold text-foreground">Loading Analytics...</p>
          <p className="text-xs text-muted-foreground mt-1">Retrieving real-time platform diagnostics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <div>
          <p className="text-sm font-semibold text-destructive">Failed to Load Dashboard</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...sectionAnim}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform analytics and management console</p>
      </motion.div>

      {/* Overview Stat Cards */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.05 }}>
        <OverviewCards data={stats.overviewStats} />
      </motion.section>

      {/* Charts Row 1 — 2 wide + 1 donut */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.1 }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MonthlyExamsChart data={stats.monthlyExams} />
          </div>
          <ExamCompletionChart data={stats.examCompletionRate} />
        </div>
      </motion.section>

      {/* Charts Row 2 — bar + pie + bar */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.15 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MonthlyStudentsChart data={stats.monthlyStudents} />
          <QuestionTypeChart data={stats.questionTypeDistribution} />
          <SubjectWiseChart data={stats.subjectWiseExams} />
        </div>
      </motion.section>

      {/* Charts Row 3 — violations full width */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.18 }}>
        <ProctoringViolationsChart data={stats.proctoringViolations} />
      </motion.section>

      {/* Activity + Quick Actions */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.2 }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentActivity data={stats.recentActivity} />
          </div>
          <QuickActions />
        </div>
      </motion.section>

      {/* Exam Management */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.22 }}>
        <ExamManagement />
      </motion.section>

      {/* Summary Panels */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.25 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuestionBankSummary data={stats.questionBankSummary} />
          <ProctoringStatsSummary data={stats.proctoringStats} />
          <ResultStatsSummary data={stats.resultSummary} />
        </div>
      </motion.section>

      {/* Data Tables */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.28 }}>
        <h2 className="text-lg font-bold text-foreground mb-4">Data Tables</h2>
        <div className="space-y-5">
          <RecentStudentsTable data={stats.recentStudents} />
          <RecentExaminersTable data={stats.recentExaminers} />
          <PendingEvaluationsTable data={stats.pendingEvaluations} />
          <RecentProctorEventsTable data={stats.recentProctorEvents} />
        </div>
      </motion.section>
    </div>
  );
}

