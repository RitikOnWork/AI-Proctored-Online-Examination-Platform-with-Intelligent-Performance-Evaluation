"use client";

import React, { useState, useEffect } from "react";
import { useSidebar } from "@/lib/sidebar-context";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Brain,
  History,
  Trophy,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentProfile, useNotifications } from "@/hooks/useStudent";
import { deleteCookie } from "@/services/api";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";

export default function StudentTopbar() {
  const router = useRouter();
  const { collapsed, activeSection, setActiveSection } = useSidebar();
  const { isDark, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authenticate session via React Query
  const { data: profile } = useStudentProfile();
  const { data: notifications = [] } = useNotifications();


  const handleLogout = () => {
    localStorage.clear();
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    deleteCookie("user_role");
    deleteCookie("user_email");
    router.push("/login");
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "dashboard":
        return "Student Dashboard";
      case "exams":
        return "Examination Center";
      case "practice":
        return "Practice Sandbox";
      case "results":
        return "Evaluation Results";
      case "analytics":
        return "Performance Analytics";
      case "leaderboard":
        return "Academic Leaderboard";
      case "notifications":
        return "Notifications Panel";
      case "profile":
        return "Student Profile";
      case "settings":
        return "Portal Settings";
      case "take-exam":
        return "Secure Proctor Mode";
      default:
        return "ProctorAI";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const mobileNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "exams", label: "My Exams", icon: BookOpenIcon },
    { id: "practice", label: "Practice Tests", icon: Brain },
    { id: "results", label: "Results", icon: History },
    { id: "analytics", label: "Analytics", icon: Trophy },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  function BookOpenIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4.5 h-4.5"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  const studentName = profile?.full_name || "Student";
  const studentEmail = profile?.email || "";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-30 flex items-center justify-between px-6 transition-all duration-300",
          "md:pl-16",
          !collapsed && "md:pl-60"
        )}
      >
        {/* Left Section: Section Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-foreground text-sm sm:text-base hidden sm:inline-block">
            {getSectionTitle()}
          </span>
          <span className="font-bold text-foreground text-sm sm:hidden flex items-center gap-1.5 font-sans">
            <ShieldCheck className="w-5 h-5 text-primary" /> ProctorAI
          </span>
        </div>

        {/* Right Section: Toggles & Menu Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label="Toggle theme"
          >

            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-violet-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border/40 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
                <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
                  <span className="font-bold text-xs">Recent Updates</span>
                  <button
                    onClick={() => {
                      setActiveSection("notifications");
                      setNotificationsOpen(false);
                    }}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 3).map((notice) => (
                      <div
                        key={notice.id}
                        onClick={() => {
                          setActiveSection("notifications");
                          setNotificationsOpen(false);
                        }}
                        className={cn(
                          "p-3.5 hover:bg-muted/40 cursor-pointer transition-colors text-left space-y-1",
                          !notice.read && "bg-primary/5"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                              notice.type === "Warning"
                                ? "bg-red-500/10 text-red-500"
                                : notice.type === "Result Published"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {notice.type}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{notice.time}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-foreground truncate">{notice.title}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {notice.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-border/40 bg-card hover:bg-muted transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                {studentName[0]?.toUpperCase() || "R"}
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:inline-block">
                {studentName}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border/40 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
                <div className="px-4 py-2.5 border-b border-border/40 text-left">
                  <p className="font-bold text-xs text-foreground truncate">{studentName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{studentEmail}</p>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveSection("profile");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors text-left font-medium"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection("settings");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors text-left font-medium"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                </div>

                <div className="p-1 border-t border-border/20 font-semibold">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="w-72 max-w-[80vw] h-full bg-card border-r border-border/40 p-4 space-y-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/20">
                <span className="font-bold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-primary" /> ProctorAI
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="space-y-1.5">
                {mobileNavItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <LogOut className="w-4.5 h-4.5" />
              Logout
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
