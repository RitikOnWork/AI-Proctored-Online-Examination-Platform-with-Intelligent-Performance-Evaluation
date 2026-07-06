"use client";

import React from "react";
import { motion } from "framer-motion";
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
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...sectionAnim}>
        <h1 className="text-xl font-bold text-slate-100">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time platform analytics and management console</p>
      </motion.div>

      {/* Overview Stat Cards */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.05 }}>
        <OverviewCards />
      </motion.section>

      {/* Charts Row 1 — 2 wide + 1 donut */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.1 }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><MonthlyExamsChart /></div>
          <ExamCompletionChart />
        </div>
      </motion.section>

      {/* Charts Row 2 — bar + pie + bar */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.15 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MonthlyStudentsChart />
          <QuestionTypeChart />
          <SubjectWiseChart />
        </div>
      </motion.section>

      {/* Charts Row 3 — violations full width */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.18 }}>
        <ProctoringViolationsChart />
      </motion.section>

      {/* Activity + Quick Actions */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.2 }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><RecentActivity /></div>
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
          <QuestionBankSummary />
          <ProctoringStatsSummary />
          <ResultStatsSummary />
        </div>
      </motion.section>

      {/* Data Tables */}
      <motion.section {...sectionAnim} transition={{ duration: 0.45, delay: 0.28 }}>
        <h2 className="text-base font-bold text-slate-100 mb-4">Data Tables</h2>
        <div className="space-y-5">
          <RecentStudentsTable />
          <RecentExaminersTable />
          <PendingEvaluationsTable />
          <RecentProctorEventsTable />
        </div>
      </motion.section>
    </div>
  );
}
