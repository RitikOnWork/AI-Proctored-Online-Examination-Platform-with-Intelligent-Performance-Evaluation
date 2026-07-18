"use client";

import React from "react";
import { motion } from "framer-motion";
import ExaminerSidebar from "@/components/examiner/ExaminerSidebar";
import ExaminerTopbar from "@/components/examiner/ExaminerTopbar";
import DashboardOverview from "@/components/examiner/DashboardOverview";
import QuestionBank from "@/components/examiner/QuestionBank";
import CreateExam from "@/components/examiner/CreateExam";
import MyExams from "@/components/examiner/MyExams";
import AIGradingQueue from "@/components/examiner/AIGradingQueue";
import ManualReviewQueue from "@/components/examiner/ManualReviewQueue";
import ProctoringReview from "@/components/examiner/ProctoringReview";
import Results from "@/components/examiner/Results";
import Students from "@/components/examiner/Students";
import Analytics from "@/components/examiner/Analytics";
import Settings from "@/components/examiner/Settings";
import { useSidebar } from "@/lib/sidebar-context";

function ExaminerContent() {
  const { collapsed, activeSection } = useSidebar();

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "question-bank":
        return <QuestionBank />;
      case "create-exam":
        return <CreateExam />;
      case "my-exams":
        return <MyExams />;
      case "ai-grading-queue":
        return <AIGradingQueue />;
      case "manual-review-queue":
        return <ManualReviewQueue />;
      case "proctoring-review":
        return <ProctoringReview />;
      case "results":
        return <Results />;
      case "students":
        return <Students />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <main
      className="min-h-screen bg-background transition-all duration-300"
      style={{ paddingLeft: collapsed ? 64 : 240, paddingTop: 64 }}
    >
      {/* Background Dot grid mesh */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />

      <div className="p-5 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
        {renderSection()}
      </div>
    </main>
  );
}

export default function ExaminerLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <ExaminerSidebar />
      <ExaminerTopbar />
      <ExaminerContent />
    </div>
  );
}
