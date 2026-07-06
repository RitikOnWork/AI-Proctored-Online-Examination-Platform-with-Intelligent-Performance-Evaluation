"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, ChevronDown, User, Settings, LogOut, Shield } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { useSidebar } from "@/lib/sidebar-context";
import { format } from "date-fns";

export default function AdminTopbar() {
  const { collapsed } = useSidebar();
  const [isDark, setIsDark] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const notifColors: Record<string, string> = {
    exam:    "bg-primary/10 text-primary",
    alert:   "bg-amber-500/10 text-amber-500",
    eval:    "bg-accent/10 text-accent",
    student: "bg-emerald-500/10 text-emerald-500",
    system:  "bg-destructive/10 text-destructive",
    proctor: "bg-rose-500/10 text-rose-500",
  };

  return (
    <header
      className="fixed top-0 right-0 z-20 h-16 bg-card/80 backdrop-blur-xl border-b border-border/40 flex items-center gap-4 px-4 sm:px-6 transition-all duration-300"
      style={{ left: collapsed ? 64 : 240 }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exams, students, questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border/40 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 sm:flex-none" />

      {/* Date/Time */}
      <div className="hidden md:flex flex-col items-end">
        <span className="text-xs font-semibold text-foreground">{format(currentTime, "hh:mm:ss a")}</span>
        <span className="text-[10px] text-muted-foreground">{format(currentTime, "EEE, dd MMM yyyy")}</span>
      </div>

      {/* Theme Toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDark(!isDark)}
        className="p-2 rounded-xl bg-muted/50 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.button>

      {/* Notifications */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
          className="relative p-2 rounded-xl bg-muted/50 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-12 w-80 bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl shadow-foreground/5 overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                <span className="text-xs text-primary cursor-pointer hover:text-primary/80 transition-colors">Mark all read</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border/20 hover:bg-muted/50 transition-all cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${notifColors[n.type] ?? "bg-muted text-muted-foreground"}`}>
                        {n.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                      </div>
                      {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/40 hover:bg-muted transition-all"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight">Admin User</p>
            <p className="text-[10px] text-muted-foreground">admin@proctorai.com</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
        </motion.button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-12 w-52 bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl shadow-foreground/5 overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-border/40">
                <p className="text-sm font-semibold text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@proctorai.com</p>
              </div>
              {[
                { icon: User,     label: "My Profile" },
                { icon: Settings, label: "Settings"   },
                { icon: Shield,   label: "Security"   },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
              <div className="border-t border-border/40 mt-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
