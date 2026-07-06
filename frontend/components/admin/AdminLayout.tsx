"use client";

import React from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import DashboardOverview from "@/components/admin/DashboardOverview";
import SettingsPage from "@/components/admin/SettingsPage";
import NotificationPanel from "@/components/admin/NotificationPanel";
import { QuestionBankSummary, ProctoringStatsSummary, ResultStatsSummary } from "@/components/admin/SummaryPanels";
import { RecentStudentsTable, RecentExaminersTable, PendingEvaluationsTable, RecentProctorEventsTable } from "@/components/admin/DataTables";
import ExamManagement from "@/components/admin/ExamManagement";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";

// Placeholder for sections not yet built
function PlaceholderSection({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
      <div className="bg-card border border-border/40 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-2xl">🚧</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            This section is ready for FastAPI integration. The UI structure, routing, and mock data patterns are in place.
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20">
          API Integration Pending
        </span>
      </div>
    </motion.div>
  );
}

function AdminContent() {
  const { collapsed, activeSection } = useSidebar();

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":     return <DashboardOverview />;
      case "settings":      return <SettingsPage />;
      case "notifications": return <NotificationPanel />;
      case "exams":         return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Exam Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage upcoming, live, completed, and cancelled exams</p>
          </div>
          <ExamManagement />
        </motion.div>
      );
      case "students":      return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all registered students</p>
          </div>
          <RecentStudentsTable />
        </motion.div>
      );
      case "examiners":     return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Examiners</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all examiners and their assignments</p>
          </div>
          <RecentExaminersTable />
        </motion.div>
      );
      case "results":       return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Results</h1>
            <p className="text-sm text-muted-foreground mt-1">Student results, scores, and pending evaluations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultStatsSummary />
            <ProctoringStatsSummary />
          </div>
          <PendingEvaluationsTable />
        </motion.div>
      );
      case "proctor-logs":  return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Proctoring Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">AI monitoring events, violations, and suspicious session data</p>
          </div>
          <ProctoringStatsSummary />
          <RecentProctorEventsTable />
        </motion.div>
      );
      case "question-bank": return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Question Bank</h1>
            <p className="text-sm text-muted-foreground mt-1">All questions by type and difficulty level</p>
          </div>
          <QuestionBankSummary />
        </motion.div>
      );
      case "admins":        return <PlaceholderSection title="Admins"        desc="Manage admin accounts and permissions"              />;
      case "subjects":      return <PlaceholderSection title="Subjects"      desc="Configure academic subjects and categories"          />;
      case "exam-sessions": return <PlaceholderSection title="Exam Sessions" desc="View live and historical exam session data"           />;
      default:              return <DashboardOverview />;
    }
  };

  return (
    <main
      className="min-h-screen bg-background transition-all duration-300"
      style={{ paddingLeft: collapsed ? 64 : 240, paddingTop: 64 }}
    >
      {/* Same mesh grid background as homepage */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />

      <div className="p-5 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
        {renderSection()}
      </div>
    </main>
  );
}

export default function AdminDashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <AdminTopbar />
        <AdminContent />
      </div>
    </SidebarProvider>
  );
}
