"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, ClipboardList, BookOpen, UserCheck, BarChart3, AlertTriangle } from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  student:  { icon: GraduationCap, color: "text-primary",     bg: "bg-primary/10"     },
  exam:     { icon: ClipboardList, color: "text-accent",      bg: "bg-accent/10"      },
  question: { icon: BookOpen,      color: "text-amber-500",   bg: "bg-amber-500/10"   },
  examiner: { icon: UserCheck,     color: "text-teal-500",    bg: "bg-teal-500/10"    },
  result:   { icon: BarChart3,     color: "text-emerald-500", bg: "bg-emerald-500/10" },
  proctor:  { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function RecentActivity({ data = [] }: { data?: any[] }) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest platform events</p>
        </div>
        <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          View all
        </button>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border/40" />

        <div className="space-y-1">
          {data.map((item, i) => {
            const cfg = typeConfig[item.type] ?? typeConfig.student;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring" as const, stiffness: 120, damping: 15 }}
                className="flex items-start gap-4 pl-2 py-2.5 rounded-xl hover:bg-muted/50 transition-all group cursor-default"
              >
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center border border-border/20`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-semibold text-foreground group-hover:text-foreground transition-colors">{item.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-[9px] font-bold text-primary-foreground">
                      {item.avatar}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{item.actor}</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0 pt-0.5">{item.time}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
