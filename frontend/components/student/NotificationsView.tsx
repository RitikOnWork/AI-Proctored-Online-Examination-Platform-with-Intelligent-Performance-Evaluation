"use client";

import React, { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useStudent";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationItem } from "@/types/student";

export default function NotificationsView() {
  const { data: notifications = [], isLoading } = useNotifications();
  const [list, setList] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (notifications) {
      setList(notifications);
    }
  }, [notifications]);

  const handleMarkAllRead = () => {
    setList((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((item) => item.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Warning":
        return <AlertTriangle className="w-4.5 h-4.5 text-red-500" />;
      case "Result Published":
        return <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />;
      case "Reminder":
        return <Clock className="w-4.5 h-4.5 text-amber-500" />;
      default:
        return <Info className="w-4.5 h-4.5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Updates & Notifications</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Stay updated with schedules, exam warnings, and grading publications.
          </p>
        </div>

        {list.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-card hover:bg-muted border border-border/40 text-xs font-semibold text-foreground hover:text-primary rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="bg-card border border-border/40 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3">
          <Bell className="w-12 h-12 text-muted-foreground/30 animate-pulse" />
          <p className="text-sm font-semibold text-foreground">All caught up!</p>
          <p className="text-xs text-muted-foreground">You have no pending notifications at this moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((notice) => (
            <div
              key={notice.id}
              onClick={() => handleMarkRead(notice.id)}
              className={cn(
                "p-4 bg-card border border-border/40 rounded-2xl flex items-start gap-4 hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden",
                !notice.read && "border-primary/30 bg-primary/5"
              )}
            >
              {/* Left strip to indicate unread status */}
              {!notice.read && <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />}

              {/* Status Icon */}
              <div className="p-2 bg-muted/30 rounded-xl border border-border/10 shrink-0">
                {getIcon(notice.type)}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1 text-left min-w-0">
                <div className="flex justify-between items-center gap-3">
                  <span
                    className={cn(
                      "text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                      notice.type === "Warning"
                        ? "bg-red-500/10 text-red-500"
                        : notice.type === "Result Published"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {notice.type}
                  </span>
                  <span className="text-[9px] text-muted-foreground shrink-0">{notice.time}</span>
                </div>
                <h4 className="font-bold text-xs text-foreground truncate">{notice.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {notice.message}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-center">
                {!notice.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notice.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-emerald-500 transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notice.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
