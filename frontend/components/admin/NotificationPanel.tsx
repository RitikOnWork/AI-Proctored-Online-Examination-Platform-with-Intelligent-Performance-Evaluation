"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notifications } from "@/lib/mock-data";
import {
  Bell, ClipboardList, AlertTriangle, Clock, GraduationCap,
  Server, Eye, CheckCheck, X
} from "lucide-react";

const typeIcon: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  exam:    { icon: ClipboardList, color: "text-primary",     bg: "bg-primary/10 border-primary/20"               },
  alert:   { icon: AlertTriangle, color: "text-amber-500",   bg: "bg-amber-500/10 border-amber-500/20"           },
  eval:    { icon: Clock,         color: "text-accent",      bg: "bg-accent/10 border-accent/20"                 },
  student: { icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20"       },
  system:  { icon: Server,        color: "text-destructive", bg: "bg-destructive/10 border-destructive/20"       },
  proctor: { icon: Eye,           color: "text-rose-500",    bg: "bg-rose-500/10 border-rose-500/20"             },
};

type NotifItem = {
  id: string; type: string; title: string;
  message: string; time: string; read: boolean;
};

export default function NotificationPanel() {
  const [items, setItems] = useState<NotifItem[]>(notifications as NotifItem[]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const remove = (id: string) => setItems(prev => prev.filter(n => n.id !== id));
  const markRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const displayed = filter === "unread" ? items.filter(n => !n.read) : items;
  const unreadCount = items.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">System alerts, exam events, and platform updates</p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground bg-muted border border-border/40 rounded-xl hover:bg-muted/80 hover:text-foreground transition-all"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit border border-border/40">
        {(["all", "unread"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === f ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} {f === "unread" && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        <AnimatePresence>
          {displayed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-card border border-border/40 rounded-2xl py-16 flex flex-col items-center gap-3 shadow-sm"
            >
              <Bell className="w-10 h-10 text-muted-foreground/45 animate-bounce" />
              <p className="text-sm text-foreground font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up!</p>
            </motion.div>
          ) : (
            displayed.map((notif, i) => {
              const cfg = typeIcon[notif.type] ?? typeIcon.system;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => markRead(notif.id)}
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    !notif.read
                      ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                      : "bg-card border-border/40 hover:border-primary/20 hover:bg-muted/30"
                  }`}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <span className="absolute top-4 right-12 w-2 h-2 bg-primary rounded-full" />
                  )}

                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center border`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notif.read ? "text-muted-foreground" : "text-foreground"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 mt-0.5">{notif.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.bg}`}>
                        {notif.type}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); remove(notif.id); }}
                    className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
