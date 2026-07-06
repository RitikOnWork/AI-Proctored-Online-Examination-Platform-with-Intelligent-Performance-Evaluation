"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { recentStudents, recentExaminers, pendingEvaluations, recentProctorEvents } from "@/lib/mock-data";
import { Search, ChevronUp, ChevronDown, Download, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

// ─── Table Shell ─────────────────────────────────────────────────────────────
function TableShell({
  title, search, onSearch, children,
}: {
  title: string; search: string; onSearch: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex-1">{title}</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 bg-muted/50 border border-border/40 rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 w-44 transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/40 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-thin">{children}</div>
    </div>
  );
}

// Status badge matching homepage badge style
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    inactive:  "bg-muted text-muted-foreground border-border/40",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[status] ?? map.inactive}`}>
      {status}
    </span>
  );
}

// Shared TH style
const thClass = "px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider";
const tdClass = "px-5 py-3";

// Pagination
function Pagination({ page, total, onChange, count }: { page: number; total: number; onChange: (p: number) => void; count: number }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border/40">
      <span className="text-xs text-muted-foreground">{count} records</span>
      <div className="flex items-center gap-1.5">
        <button disabled={page === 1} onClick={() => onChange(page - 1)}
          className="px-2.5 py-1 rounded-lg text-xs text-muted-foreground disabled:opacity-30 hover:bg-muted transition-colors">Prev</button>
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => onChange(i + 1)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${page === i + 1 ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted"}`}>
            {i + 1}
          </button>
        ))}
        <button disabled={page === total} onClick={() => onChange(page + 1)}
          className="px-2.5 py-1 rounded-lg text-xs text-muted-foreground disabled:opacity-30 hover:bg-muted transition-colors">Next</button>
      </div>
    </div>
  );
}

// Avatar
function Avatar({ initials, gradient = "from-primary/60 to-accent/60" }: { initials: string; gradient?: string }) {
  return (
    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Recent Students ──────────────────────────────────────────────────────────
export function RecentStudentsTable() {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = recentStudents
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === "asc" ? a.registered.localeCompare(b.registered) : b.registered.localeCompare(a.registered));

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <TableShell title="Recent Students" search={search} onSearch={(v) => { setSearch(v); setPage(1); }}>
      <table className="w-full text-xs">
        <thead className="border-b border-border/40 bg-muted/20">
          <tr>
            <th className={thClass}>Name</th>
            <th className={thClass}>Email</th>
            <th className={thClass}>Subject</th>
            <th className={`${thClass} cursor-pointer select-none`} onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}>
              <span className="flex items-center gap-1">
                Registered {sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </th>
            <th className={thClass}>Status</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((s, i) => (
            <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="border-b border-border/20 hover:bg-muted/30 transition-colors group">
              <td className={tdClass}>
                <div className="flex items-center gap-2.5">
                  <Avatar initials={s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)} />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">{s.name}</span>
                </div>
              </td>
              <td className={`${tdClass} text-muted-foreground`}>{s.email}</td>
              <td className={`${tdClass} text-muted-foreground`}>{s.subject}</td>
              <td className={`${tdClass} text-muted-foreground`}>{s.registered}</td>
              <td className={tdClass}><StatusBadge status={s.status} /></td>
            </motion.tr>
          ))}
          {paged.length === 0 && (
            <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-xs">No results found</td></tr>
          )}
        </tbody>
      </table>
      <Pagination page={page} total={totalPages} onChange={setPage} count={filtered.length} />
    </TableShell>
  );
}

// ─── Recent Examiners ────────────────────────────────────────────────────────
export function RecentExaminersTable() {
  const [search, setSearch] = useState("");

  const filtered = recentExaminers.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TableShell title="Recent Examiners" search={search} onSearch={setSearch}>
      <table className="w-full text-xs">
        <thead className="border-b border-border/40 bg-muted/20">
          <tr>
            <th className={thClass}>Name</th>
            <th className={thClass}>Email</th>
            <th className={thClass}>Department</th>
            <th className={thClass}>Exams</th>
            <th className={thClass}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e, i) => (
            <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="border-b border-border/20 hover:bg-muted/30 transition-colors group">
              <td className={tdClass}>
                <div className="flex items-center gap-2.5">
                  <Avatar initials={e.name.split(" ").filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join("").slice(0, 2)} gradient="from-teal-500/60 to-emerald-600/60" />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">{e.name}</span>
                </div>
              </td>
              <td className={`${tdClass} text-muted-foreground`}>{e.email}</td>
              <td className={`${tdClass} text-muted-foreground`}>{e.department}</td>
              <td className={`${tdClass} font-bold text-foreground`}>{e.exams}</td>
              <td className={tdClass}><StatusBadge status={e.status} /></td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Pending Evaluations ──────────────────────────────────────────────────────
export function PendingEvaluationsTable() {
  const [search, setSearch] = useState("");

  const filtered = pendingEvaluations.filter((p) =>
    p.student.toLowerCase().includes(search.toLowerCase()) || p.exam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TableShell title="Pending Evaluations" search={search} onSearch={setSearch}>
      <table className="w-full text-xs">
        <thead className="border-b border-border/40 bg-muted/20">
          <tr>
            <th className={thClass}>Student</th>
            <th className={thClass}>Exam</th>
            <th className={thClass}>Subject</th>
            <th className={thClass}>Submitted At</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="border-b border-border/20 hover:bg-muted/30 transition-colors">
              <td className={`${tdClass} font-medium text-foreground`}>{p.student}</td>
              <td className={`${tdClass} text-muted-foreground`}>{p.exam}</td>
              <td className={`${tdClass} text-muted-foreground`}>{p.subject}</td>
              <td className={`${tdClass} text-muted-foreground`}>{p.submittedAt}</td>
              <td className={tdClass}>
                {p.marks !== null ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />Evaluated
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Clock className="w-3.5 h-3.5" />Pending
                  </span>
                )}
              </td>
              <td className={tdClass}>
                {p.marks === null && (
                  <button className="px-3 py-1 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
                    Evaluate
                  </button>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Proctor Events ───────────────────────────────────────────────────────────
export function RecentProctorEventsTable() {
  const [search, setSearch] = useState("");

  const filtered = recentProctorEvents.filter((p) =>
    p.student.toLowerCase().includes(search.toLowerCase()) || p.event.toLowerCase().includes(search.toLowerCase())
  );

  const severityMap: Record<string, string> = {
    high:   "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    low:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <TableShell title="Recent Proctor Events" search={search} onSearch={setSearch}>
      <table className="w-full text-xs">
        <thead className="border-b border-border/40 bg-muted/20">
          <tr>
            <th className={thClass}>Student</th>
            <th className={thClass}>Exam</th>
            <th className={thClass}>Event Type</th>
            <th className={thClass}>Time</th>
            <th className={thClass}>Severity</th>
            <th className={thClass}>Score</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="border-b border-border/20 hover:bg-muted/30 transition-colors">
              <td className={`${tdClass} font-medium text-foreground`}>{p.student}</td>
              <td className={`${tdClass} text-muted-foreground`}>{p.exam}</td>
              <td className={tdClass}>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  {p.event}
                </span>
              </td>
              <td className={`${tdClass} text-muted-foreground`}>{p.time}</td>
              <td className={tdClass}>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${severityMap[p.severity]}`}>
                  {p.severity}
                </span>
              </td>
              <td className={tdClass}>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 bg-border/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-destructive" style={{ width: `${p.score}%` }} />
                  </div>
                  <span className="text-destructive font-bold">{p.score}</span>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
