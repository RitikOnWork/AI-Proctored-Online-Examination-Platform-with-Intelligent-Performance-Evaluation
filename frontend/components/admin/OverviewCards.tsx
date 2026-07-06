"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, UserCheck, ClipboardList, Play, BookOpen,
  CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown
} from "lucide-react";
import { overviewStats } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap, UserCheck, ClipboardList, Play, BookOpen,
  CheckCircle, Clock, AlertTriangle,
};

// Color classes using CSS variables — matching homepage palette
const colorMap: Record<string, { icon: string; iconBg: string; badge: string; bar: string }> = {
  indigo:  { icon: "text-primary",        iconBg: "bg-primary/10 border-primary/20",       badge: "bg-primary/10 text-primary border-primary/20",               bar: "bg-primary/50"          },
  violet:  { icon: "text-accent",         iconBg: "bg-accent/10 border-accent/20",         badge: "bg-accent/10 text-accent border-accent/20",                   bar: "bg-accent/50"           },
  blue:    { icon: "text-blue-500",       iconBg: "bg-blue-500/10 border-blue-500/20",     badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",             bar: "bg-blue-500/50"         },
  emerald: { icon: "text-emerald-500",    iconBg: "bg-emerald-500/10 border-emerald-500/20",badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",   bar: "bg-emerald-500/50"      },
  amber:   { icon: "text-amber-500",      iconBg: "bg-amber-500/10 border-amber-500/20",   badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",         bar: "bg-amber-500/50"        },
  teal:    { icon: "text-accent-teal",    iconBg: "bg-teal-500/10 border-teal-500/20",     badge: "bg-teal-500/10 text-teal-500 border-teal-500/20",             bar: "bg-teal-500/50"         },
  orange:  { icon: "text-orange-500",     iconBg: "bg-orange-500/10 border-orange-500/20", badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",       bar: "bg-orange-500/50"       },
  red:     { icon: "text-destructive",    iconBg: "bg-destructive/10 border-destructive/20",badge: "bg-destructive/10 text-destructive border-destructive/20",   bar: "bg-destructive/50"      },
};

export default function OverviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewStats.map((stat, i) => {
        const Icon = iconMap[stat.icon] ?? ClipboardList;
        const c = colorMap[stat.color] ?? colorMap.indigo;
        const isPositive = stat.change >= 0;

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring" as const, stiffness: 120, damping: 18, delay: i * 0.07 }}
            whileHover={{ y: -4, scale: 1.015 }}
            className="group relative p-5 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-default overflow-hidden"
          >
            {/* Subtle glow on hover — matches homepage feature cards */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500 rounded-2xl" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl border ${c.iconBg}`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? "+" : ""}{stat.change}%
                </div>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-foreground tabular-nums">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </div>

              {/* Animated progress bar */}
              <div className="mt-4 h-1 bg-border/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(Math.abs(stat.change) * 3, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 + 0.4, duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${c.bar}`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
