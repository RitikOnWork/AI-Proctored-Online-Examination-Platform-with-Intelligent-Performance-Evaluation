"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, ClipboardList, PlusCircle,
  Cpu, Clock, Eye, BarChart3, Users, TrendingUp, Settings,
  LogOut, ChevronRight, Menu, X, ShieldAlert
} from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";

const navItems = [
  { id: "dashboard",           label: "Dashboard",           icon: LayoutDashboard },
  { id: "question-bank",       label: "Question Bank",       icon: BookOpen },
  { id: "create-exam",         label: "Create Exam",         icon: PlusCircle },
  { id: "my-exams",            label: "My Exams",            icon: ClipboardList },
  { id: "ai-grading-queue",    label: "AI Grading Queue",    icon: Cpu },
  { id: "manual-review-queue", label: "Manual Review",       icon: Clock },
  { id: "proctoring-review",   label: "Proctoring Review",   icon: ShieldAlert },
  { id: "results",             label: "Results",             icon: BarChart3 },
  { id: "students",            label: "Students",            icon: Users },
  { id: "analytics",           label: "Analytics",           icon: TrendingUp },
  { id: "settings",            label: "Settings",            icon: Settings }
];

export default function ExaminerSidebar() {
  const { collapsed, setCollapsed, activeSection, setActiveSection } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border/40 text-muted-foreground">
      {/* Brand logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-border/40 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex-shrink-0 w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Eye className="w-5 h-5 text-indigo-50" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <p className="font-extrabold text-sm text-foreground leading-tight">ProctorAI</p>
            <p className="text-[10px] text-indigo-400 font-medium">Examiner Room</p>
          </motion.div>
        )}
      </div>

      {/* Nav Link list */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                } ${collapsed ? "justify-center" : ""}`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeNavExaminer"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-500 rounded-r-full"
                />
              )}
              <Icon className={`flex-shrink-0 w-4 h-4 ${isActive ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground"}`} />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
            </motion.button>
          );
        })}
      </nav>

      {/* Sidebar controls & logout */}
      <div className="px-2 py-3 border-t border-border/40 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card/50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          {!collapsed && "Collapse Sidebar"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-500/80 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop wrapper */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-background/80 backdrop-blur-xl border-r border-border/40 z-30 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-card border border-border/60 text-muted-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile sliding view */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-background/45 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-64 bg-background/95 backdrop-blur-xl z-50 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
