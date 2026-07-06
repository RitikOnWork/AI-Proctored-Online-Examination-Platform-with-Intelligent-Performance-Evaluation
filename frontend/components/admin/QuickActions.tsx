"use client";

import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, BookOpen, GraduationCap, UserCheck, BookMarked, BarChart3 } from "lucide-react";

const actions = [
  { id: "qa1", label: "Create Exam",    icon: ClipboardList, color: "from-primary to-primary/80",          shadow: "shadow-primary/20"      },
  { id: "qa2", label: "Add Question",   icon: BookOpen,      color: "from-accent to-accent/80",             shadow: "shadow-accent/20"       },
  { id: "qa3", label: "Add Student",    icon: GraduationCap, color: "from-teal-500 to-teal-600",            shadow: "shadow-teal-500/20"     },
  { id: "qa4", label: "Add Examiner",   icon: UserCheck,     color: "from-blue-500 to-blue-600",            shadow: "shadow-blue-500/20"     },
  { id: "qa5", label: "Create Subject", icon: BookMarked,    color: "from-amber-500 to-amber-600",          shadow: "shadow-amber-500/20"    },
  { id: "qa6", label: "Publish Result", icon: BarChart3,     color: "from-emerald-500 to-emerald-600",      shadow: "shadow-emerald-500/20"  },
];

export default function QuickActions() {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Shortcuts to common tasks</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-gradient-to-br ${action.color} shadow-lg ${action.shadow} text-primary-foreground font-medium text-xs transition-all duration-200 group`}
            >
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-center leading-tight">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
