"use client";

import React from "react";
import { Trophy, Award, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { LeaderboardUser } from "@/types/student";

export default function LeaderboardView() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["student", "leaderboard"],
    queryFn: async () => {
      try {
        const response = await api.get<LeaderboardUser[]>("/student/leaderboard");
        return response.data;
      } catch (err) {
        console.warn("Backend '/student/leaderboard' not found. Using fallback.");
        return [
          { rank: 1, name: "Ananya Singh", score: 984, college: "Infosys Springboard Institute", badge: "Gold" },
          { rank: 2, name: "Suresh Reddy", score: 968, college: "Infosys Springboard Institute", badge: "Silver" },
          { rank: 3, name: "Priya Sharma", score: 955, college: "IIT Bombay", badge: "Bronze" },
          { rank: 4, name: "Sneha Pillai", score: 932, college: "BITS Pilani", badge: "none" },
          { rank: 5, name: "Rahul Verma", score: 918, college: "Infosys Springboard Institute", badge: "none" },
          { rank: 42, name: "Ritik (You)", score: 842, college: "Infosys Springboard Institute", badge: "none", isCurrentUser: true },
          { rank: 43, name: "Arjun Kumar", score: 838, college: "DTU Delhi", badge: "none" },
          { rank: 44, name: "Vikram Nair", score: 825, college: "Infosys Springboard Institute", badge: "none" },
        ];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale
  });

  // Extract top 3 for podium
  const goldUser = leaderboard.find((u) => u.rank === 1);
  const silverUser = leaderboard.find((u) => u.rank === 2);
  const bronzeUser = leaderboard.find((u) => u.rank === 3);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading global rankings...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-bold text-foreground">Academic Leaderboard</h2>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
          Global rankings of students based on completed assessment averages.
        </p>
      </div>

      {/* Podium Display (Top 3 Users) */}
      <div className="grid grid-cols-3 gap-4 items-end max-w-xl mx-auto pt-6 pb-2">
        {/* Silver (Rank 2) */}
        {silverUser && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-300 border-4 border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm sm:text-base">
                {silverUser.name[0]}
              </div>
              <span className="absolute -top-2.5 -right-1 text-xl">🥈</span>
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-xs text-foreground truncate max-w-[80px] sm:max-w-none">
                {silverUser.name}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 font-mono">{silverUser.score} Pts</p>
            </div>
            <div className="h-16 w-full bg-gradient-to-t from-slate-200/20 to-slate-200/5 border border-slate-200/20 rounded-t-xl" />
          </motion.div>
        )}

        {/* Gold (Rank 1) */}
        {goldUser && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-2 text-center -mt-4 z-10"
          >
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-400 border-4 border-yellow-300 flex items-center justify-center font-bold text-yellow-900 text-base sm:text-xl shadow-lg shadow-yellow-500/20">
                {goldUser.name[0]}
              </div>
              <span className="absolute -top-3.5 -right-1 text-2xl animate-bounce">👑</span>
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-sm text-foreground truncate max-w-[100px] sm:max-w-none">
                {goldUser.name}
              </h4>
              <p className="text-xs font-bold text-yellow-500 font-mono">{goldUser.score} Pts</p>
            </div>
            <div className="h-24 w-full bg-gradient-to-t from-yellow-400/20 to-yellow-400/5 border border-yellow-400/20 rounded-t-xl" />
          </motion.div>
        )}

        {/* Bronze (Rank 3) */}
        {bronzeUser && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-600 border-4 border-amber-500 flex items-center justify-center font-bold text-amber-100 text-sm sm:text-base">
                {bronzeUser.name[0]}
              </div>
              <span className="absolute -top-2.5 -right-1 text-xl">🥉</span>
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-xs text-foreground truncate max-w-[80px] sm:max-w-none">
                {bronzeUser.name}
              </h4>
              <p className="text-[10px] font-bold text-amber-500 font-mono">{bronzeUser.score} Pts</p>
            </div>
            <div className="h-12 w-full bg-gradient-to-t from-amber-600/20 to-amber-600/5 border border-amber-600/20 rounded-t-xl" />
          </motion.div>
        )}
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4.5">Rank</th>
                <th className="py-3.5 px-4.5">Student Name</th>
                <th className="py-3.5 px-4.5">Institute / College</th>
                <th className="py-3.5 px-4.5 text-right">Aggregate Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {leaderboard.map((user) => {
                const isRank1 = user.rank === 1;
                const isRank2 = user.rank === 2;
                const isRank3 = user.rank === 3;

                return (
                  <tr
                    key={user.rank}
                    className={cn(
                      "hover:bg-muted/10 transition-colors",
                      user.isCurrentUser && "bg-primary/5 font-semibold text-primary"
                    )}
                  >
                    <td className="py-3.5 px-4.5 font-mono">
                      {isRank1 ? (
                        <span className="flex items-center gap-1">🥇 1</span>
                      ) : isRank2 ? (
                        <span className="flex items-center gap-1">🥈 2</span>
                      ) : isRank3 ? (
                        <span className="flex items-center gap-1">🥉 3</span>
                      ) : (
                        `#${user.rank}`
                      )}
                    </td>
                    <td className="py-3.5 px-4.5 font-bold text-foreground">
                      {user.name}
                    </td>
                    <td className="py-3.5 px-4.5 text-muted-foreground truncate max-w-[200px]">
                      {user.college}
                    </td>
                    <td className="py-3.5 px-4.5 text-right font-bold text-foreground font-mono">
                      {user.score} Pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
