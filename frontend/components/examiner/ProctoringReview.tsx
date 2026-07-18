"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, ShieldCheck, Eye, Clock, AlertTriangle, Check,
  CameraOff, RefreshCw, ChevronRight, X, Flag, AlertCircle
} from "lucide-react";
import { examinerService, ProctorEventItem, GradingQueueItem } from "@/services/examiner";

const cardClass = "bg-slate-900 border border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300";

export default function ProctoringReview() {
  const [sessions, setSessions] = useState<GradingQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeEvents, setActiveEvents] = useState<ProctorEventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Video Scrubbing Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(25); // Starts mid-timeline
  const [playSpeed, setPlaySpeed] = useState(1);
  const maxTime = 120; // 2 minutes simulated timeline

  // Decision state stubs
  const [notes, setNotes] = useState("");
  const [decisionSaving, setDecisionSaving] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await examinerService.getGradingQueue();
      setSessions(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to retrieve candidate exam sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= maxTime) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed]);

  const handleSelectSession = async (sessId: string) => {
    setLoadingEvents(true);
    setErrorMsg("");
    try {
      const events = await examinerService.getProctoringEvents(sessId);
      setActiveEvents(events);
      setActiveSessionId(sessId);
      setNotes("");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to retrieve proctor audit log for this session.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleDecision = async (decision: string) => {
    if (!activeSessionId) return;
    setDecisionSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await examinerService.submitProctorDecision(activeSessionId, decision, notes);
      setSuccessMsg(`Session updated: Candidate has been ${decision.replace("_", " ")}.`);
      setTimeout(() => {
        setSuccessMsg("");
        setActiveSessionId(null);
        loadSessions();
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to submit proctor decision.");
    } finally {
      setDecisionSaving(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "face_missing": return <CameraOff className="w-4 h-4 text-rose-400" />;
      case "multiple_faces": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "tab_switched": return <Flag className="w-4 h-4 text-orange-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">Proctoring Review Console</h2>
        <p className="text-xs text-slate-500 mt-1">Audit AI proctor events, check screen captures, and submit final flags.</p>
      </div>

      {errorMsg && <p className="text-xs text-rose-500 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">{errorMsg}</p>}
      {successMsg && <p className="text-xs text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">{successMsg}</p>}

      {activeSessionId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left panel: events list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setActiveSessionId(null)}
                className="px-3 py-1.5 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Sessions
              </button>
              <span className="text-xs font-bold text-slate-400">Events: {activeEvents.length}</span>
            </div>

            {loadingEvents ? (
              <p className="text-xs text-slate-500 text-center py-6">Loading proctor audit trail...</p>
            ) : activeEvents.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <p className="text-xs font-semibold text-slate-300">Clean Session Record</p>
                <p className="text-[10px] text-slate-500">No suspicious events or warnings detected by AI models.</p>
              </div>
            ) : (
              <div className="space-y-4 relative border-l border-slate-800/60 ml-3 pl-6">
                {activeEvents.map((e, idx) => (
                  <div key={e.id} className="relative bg-slate-900 border border-slate-800/60 rounded-2xl p-4 space-y-3">
                    <span className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center p-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </span>
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {getEventIcon(e.event_type)}
                        <span className="text-xs font-bold text-slate-200 uppercase">{e.event_type.replace("_", " ")}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        e.severity === "high" ? "bg-rose-500/10 text-rose-400" :
                        e.severity === "medium" ? "bg-amber-500/10 text-amber-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>
                        {e.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">{e.details}</p>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/20">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Timestamp:</span>
                        <span className="text-[10px] font-semibold text-slate-300">{e.timestamp}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">AI Confidence:</span>
                        <span className="text-[10px] font-semibold text-indigo-400">{(e.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Scrubbing Visual Player */}
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="aspect-video bg-slate-950 border border-slate-850 rounded-xl flex flex-col items-center justify-center text-[9px] text-slate-500 relative overflow-hidden">
                          <span className="absolute top-2 left-2 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800/40 text-slate-300 font-semibold">Camera Feed</span>
                          {isPlaying ? (
                            <span className="absolute top-2 right-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 px-1 py-0.5 rounded text-[8px] font-bold uppercase animate-pulse">🔴 LIVE PLAYBACK</span>
                          ) : (
                            <span className="absolute top-2 right-2 bg-slate-850 text-slate-500 border border-slate-800 px-1 py-0.5 rounded text-[8px] font-bold uppercase">PAUSED</span>
                          )}
                          
                          {/* Simulated stream eye tracking box */}
                          <div className="w-16 h-16 rounded-full border border-dashed border-indigo-500/40 flex items-center justify-center relative bg-indigo-950/10">
                            <span className="w-8 h-2 bg-slate-900 border border-slate-800 rounded-full flex justify-between px-1.5 items-center">
                              <span className={`w-1.5 h-1.5 rounded-full bg-indigo-400 ${isPlaying ? "translate-y-0.5 animate-bounce" : ""}`} />
                              <span className={`w-1.5 h-1.5 rounded-full bg-indigo-400 ${isPlaying ? "translate-y-0.5 animate-bounce" : ""}`} />
                            </span>
                            <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                          </div>
                          
                          <span className="text-[10px] text-slate-400 mt-2 font-medium">Eye Gaze Tracking Active</span>
                        </div>

                        <div className="aspect-video bg-slate-950 border border-slate-850 rounded-xl flex flex-col items-center justify-center text-[9px] text-slate-500 relative overflow-hidden">
                          <span className="absolute top-2 left-2 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800/40 text-slate-300 font-semibold">Screen Feed</span>
                          
                          <div className="w-20 h-12 bg-slate-900 border border-slate-800 rounded-lg p-1 flex flex-col justify-between">
                            <div className="h-1 bg-slate-800 rounded w-8" />
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded bg-indigo-500/40" />
                              <div className="w-10 h-2 bg-slate-850 rounded" />
                            </div>
                            <div className="h-1 bg-slate-850 rounded w-16" />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-2 font-medium">Simulated Candidate Workspace</span>
                        </div>
                      </div>

                      {/* Controls bar */}
                      <div className="bg-slate-950 border border-slate-855 rounded-xl p-3 flex flex-col gap-2 shadow-inner">
                        <div className="flex items-center justify-between gap-3 text-slate-300">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-indigo-50 transition-colors font-bold text-[10px]"
                            >
                              {isPlaying ? "Pause" : "Play"}
                            </button>
                            <span className="text-[10px] font-mono text-slate-400">
                              {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{(currentTime % 60).toString().padStart(2, '0')} / 02:00
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 4].map(speed => (
                              <button
                                key={speed}
                                type="button"
                                onClick={() => setPlaySpeed(speed)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                                  playSpeed === speed ? "bg-indigo-600 text-indigo-50" : "bg-slate-900 hover:bg-slate-850 text-slate-400"
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Scrub Slider */}
                        <div className="relative pt-1">
                          <input
                            type="range"
                            min={0}
                            max={maxTime}
                            value={currentTime}
                            onChange={(e) => {
                              setCurrentTime(Number(e.target.value));
                              setIsPlaying(false);
                            }}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                          />
                          {/* Event Marker flags */}
                          <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-2 h-2 rounded-full bg-rose-500 border border-slate-950 cursor-pointer" title="Eye Gaze deviation" />
                          <div className="absolute top-1/2 -translate-y-1/2 left-[45%] w-2 h-2 rounded-full bg-amber-500 border border-slate-950 cursor-pointer" title="Multiple faces" />
                          <div className="absolute top-1/2 -translate-y-1/2 left-[80%] w-2 h-2 rounded-full bg-orange-500 border border-slate-950 cursor-pointer" title="Tab switched" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: decision controls */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Examiner Decision</h4>
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Decision Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Justification for marking candidate safe, flagging or disqualifying."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={decisionSaving}
                  onClick={() => handleDecision("mark_safe")}
                  className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl transition-all"
                >
                  Mark Safe
                </button>
                <button
                  type="button"
                  disabled={decisionSaving}
                  onClick={() => handleDecision("flag")}
                  className="w-full py-2 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-400 font-bold text-xs rounded-xl transition-all"
                >
                  Flag Session
                </button>
                <button
                  type="button"
                  disabled={decisionSaving}
                  onClick={() => handleDecision("disqualify")}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-rose-50 font-bold text-xs rounded-xl transition-all"
                >
                  Disqualify Candidate
                </button>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Sessions Table */
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold bg-slate-900/50">
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Exam Paper</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Suspicion Score</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Loading active candidate sessions...</td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No active exam sessions logs.</td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.session_id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-all">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-200">{s.student_name}</p>
                          <p className="text-[10px] text-slate-500">{s.student_email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{s.exam_title}</td>
                      <td className="p-4 text-slate-400">{s.submitted_at}</td>
                      <td className="p-4">
                        <span className="text-rose-400 font-bold">Medium Priority</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSelectSession(s.session_id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-bold rounded-xl text-[10px] flex items-center gap-1 ml-auto shadow-md"
                        >
                          Audit Feed <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
