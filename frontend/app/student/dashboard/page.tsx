"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import DashboardHome from "@/components/student/DashboardHome";
import MyExams from "@/components/student/MyExams";
import PracticeTests from "@/components/student/PracticeTests";
import ResultsView from "@/components/student/ResultsView";
import PerformanceAnalytics from "@/components/student/PerformanceAnalytics";
import LeaderboardView from "@/components/student/LeaderboardView";
import NotificationsView from "@/components/student/NotificationsView";
import ProfileView from "@/components/student/ProfileView";
import SettingsView from "@/components/student/SettingsView";
import TakeExam from "@/components/student/TakeExam";
import { useStudentProfile } from "@/hooks/useStudent";
import { RealExam, RealQuestion } from "@/types/student";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

function StudentDashboardContent() {
  const router = useRouter();
  const { collapsed, activeSection, setActiveSection } = useSidebar();
  const [activeExam, setActiveExam] = useState<{
    exam: RealExam;
    questions: RealQuestion[];
    token: string;
  } | null>(null);

  // Authenticate session via React Query
  const { data: profile, isLoading, isError } = useStudentProfile();

  useEffect(() => {
    // If the query completes and isError is true, or user role is not student, redirect to login
    if (!isLoading && (isError || !profile || profile.role !== "student")) {
      router.push("/login");
    }
  }, [profile, isLoading, isError, router]);

  const handleStartExam = (exam: RealExam, paperQuestions: RealQuestion[], examToken: string) => {
    setActiveExam({ exam, questions: paperQuestions, token: examToken });
    setActiveSection("take-exam");
  };

  const handleFinishExam = () => {
    setActiveExam(null);
    setActiveSection("results");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-semibold">Authenticating student session...</p>
      </div>
    );
  }

  // If unauthorized, render empty layout while redirecting
  if (isError || !profile || profile.role !== "student") {
    return null;
  }

  // If in Secure Exam Proctoring, render fullscreen exam interface without sidebars
  if (activeSection === "take-exam" && activeExam) {
    return (
      <TakeExam
        exam={activeExam.exam}
        questions={activeExam.questions}
        examToken={activeExam.token}
        onFinish={handleFinishExam}
      />
    );
  }

  // Render standard layout
  return (
    <div className="min-h-screen bg-background text-foreground relative flex">
      {/* Mesh Grid Background */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <StudentSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <StudentTopbar />

        {/* Dynamic Content View Area */}
        <main
          className="flex-grow p-4 sm:p-6 lg:p-8 transition-all duration-300"
          style={{
            paddingLeft: "1.5rem",
            paddingTop: "5.5rem", // Offset for topbar height
          }}
        >
          <div className="max-w-7xl mx-auto md:pl-16">
            <div className={collapsed ? "lg:pl-4" : "lg:pl-48 transition-all duration-300"}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeSection === "dashboard" && <DashboardHome />}
                  {activeSection === "exams" && <MyExams onStartExam={handleStartExam} />}
                  {activeSection === "practice" && <PracticeTests />}
                  {activeSection === "results" && <ResultsView />}
                  {activeSection === "analytics" && <PerformanceAnalytics />}
                  {activeSection === "leaderboard" && <LeaderboardView />}
                  {activeSection === "notifications" && <NotificationsView />}
                  {activeSection === "profile" && <ProfileView />}
                  {activeSection === "settings" && <SettingsView />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <SidebarProvider>
      <StudentDashboardContent />
    </SidebarProvider>
  );
}
