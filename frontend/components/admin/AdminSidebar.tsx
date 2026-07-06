"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, GraduationCap, UserCheck, ShieldCheck,
  BookOpen, ClipboardList, PlayCircle, BarChart3, Bell,
  Settings, LogOut, ChevronDown, Menu, X,
  Users, BookMarked, Eye, ChevronRight
} from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";

const navItems = [
  { id: "dashboard",    label: "Dashboard",       icon: LayoutDashboard, children: null },
  {
    id: "users", label: "Users", icon: Users, children: [
      { id: "students",  label: "Students",  icon: GraduationCap },
      { id: "examiners", label: "Examiners", icon: UserCheck     },
      { id: "admins",    label: "Admins",    icon: ShieldCheck   },
    ],
  },
  { id: "subjects",       label: "Subjects",        icon: BookMarked,   children: null },
  { id: "question-bank",  label: "Question Bank",   icon: BookOpen,     children: null },
  { id: "exams",          label: "Exams",           icon: ClipboardList,children: null },
  { id: "exam-sessions",  label: "Exam Sessions",   icon: PlayCircle,   children: null },
  { id: "results",        label: "Results",         icon: BarChart3,    children: null },
  { id: "proctor-logs",   label: "Proctoring Logs", icon: Eye,          children: null },
  { id: "notifications",  label: "Notifications",   icon: Bell,         children: null },
  { id: "settings",       label: "Settings",        icon: Settings,     children: null },
];

export default function AdminSidebar() {
  const { collapsed, setCollapsed, activeSection, setActiveSection } = useSidebar();
  const [expandedGroup, setExpandedGroup] = useState<string | null>("users");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo — matches homepage Shield + ProctorAI */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-border/40 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex-shrink-0 w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
          <ShieldCheck className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <p className="font-extrabold text-sm text-foreground leading-tight">ProctorAI</p>
            <p className="text-[10px] text-muted-foreground font-medium">Admin Console</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children;
          const isExpanded = expandedGroup === item.id;
          const isActive =
            activeSection === item.id ||
            (hasChildren && item.children!.some((c) => c.id === activeSection));

          return (
            <div key={item.id}>
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => {
                  if (hasChildren && !collapsed) {
                    setExpandedGroup(isExpanded ? null : item.id);
                  } else {
                    handleNav(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  } ${collapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full"
                  />
                )}
                <Icon className={`flex-shrink-0 w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {hasChildren && (
                      <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.span>
                    )}
                  </>
                )}
              </motion.button>

              {/* Sub-menu */}
              {hasChildren && !collapsed && (
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden ml-3 mt-0.5 pl-3 border-l border-border/40"
                    >
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <button
                            key={child.id}
                            onClick={() => handleNav(child.id)}
                            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-150
                              ${activeSection === child.id
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                          >
                            <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            {child.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-border/40 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          {!collapsed && "Collapse Sidebar"}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-card/80 backdrop-blur-xl border-r border-border/40 z-30 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-card border border-border/40 text-muted-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-64 bg-card/95 backdrop-blur-xl border-r border-border/40 z-50 flex flex-col"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
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
