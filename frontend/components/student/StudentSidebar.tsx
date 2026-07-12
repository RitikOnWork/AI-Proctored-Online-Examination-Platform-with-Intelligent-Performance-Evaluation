"use client";

import React from "react";
import { useSidebar } from "@/lib/sidebar-context";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  History,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export default function StudentSidebar() {
  const router = useRouter();
  const { collapsed, setCollapsed, activeSection, setActiveSection } = useSidebar();

  const menuItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "exams", label: "My Exams", icon: BookOpen, badge: "Live" },
    { id: "practice", label: "Practice Tests", icon: Brain },
    { id: "results", label: "Results", icon: History },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "notifications", label: "Notifications", icon: Bell, badge: 2 },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.clear();
    // Clear cookies to immediately trigger middleware route protection
    const cookies = ["access_token", "refresh_token", "user_role", "user_email"];
    cookies.forEach((c) => {
      document.cookie = `${c}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border/40 transition-all duration-300 flex flex-col justify-between hidden md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex flex-col flex-1">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-sm bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent truncate"
              >
                ProctorAI
              </motion.span>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />

                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate text-left flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Badges */}
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide shrink-0",
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : item.badge === "Live"
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-primary/15 text-primary"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-14 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-popover border border-border text-popover-foreground text-xs font-semibold px-2 py-1.5 rounded-lg shadow-md transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-border/40 space-y-2">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : null}

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200 group relative",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0 text-muted-foreground group-hover:text-destructive" />
          {!collapsed && <span>Logout</span>}

          {collapsed && (
            <div className="absolute left-14 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-destructive text-white text-xs font-semibold px-2 py-1.5 rounded-lg shadow-md transition-all duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
