"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, ClipboardList, Eye, Bell, Palette,
  Save, Check, AlertCircle
} from "lucide-react";

const tabs = [
  { id: "profile",      label: "My Profile",      icon: User },
  { id: "security",     label: "Password",        icon: Shield },
  { id: "rules",        label: "Exam Defaults",   icon: ClipboardList },
  { id: "ai-threshold", label: "AI Thresholds",   icon: Eye },
  { id: "notifs",       label: "Notifications",   icon: Bell }
];

function Toggle2({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 flex-shrink-0 ${enabled ? "bg-indigo-600" : "bg-slate-800"}`}
      style={{ height: 22, width: 40 }}
    >
      <motion.span
        layout
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute w-4 h-4 bg-slate-100 rounded-full shadow-md"
        style={{ top: 3 }}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-800/40 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-200">{label}</p>
        {description && <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function InputField({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-slate-500">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none"
      />
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  // Toggle settings states stubs
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [proctorLogs, setProctorLogs] = useState(true);
  const [aiAutoGrade, setAiAutoGrade] = useState(true);
  const [gazeTracking, setGazeTracking] = useState(true);
  const [aiThreshold, setAiThreshold] = useState(75);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Configure profile records, exam rules defaults, and AI thresholds.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/10"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>

      {saved && (
        <p className="text-xs text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex items-center gap-1.5">
          <Check className="w-4 h-4" /> Settings updated successfully!
        </p>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Tabs buttons */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800/60 rounded-2xl p-3 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isCurrent = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Settings Fields */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            
            {/* Tab: Profile */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-slate-300 border-b border-slate-800/40 pb-2">Profile details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Full Name" defaultValue="Prof. Anita Mehta" />
                  <InputField label="Email Address" defaultValue="amehta@example.com" type="email" />
                  <InputField label="Department" defaultValue="Chemistry Department" />
                  <InputField label="Office room number" defaultValue="Block C - 402" />
                </div>
              </motion.div>
            )}

            {/* Tab: Security */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-slate-300 border-b border-slate-800/40 pb-2">Change Password</h3>
                <div className="grid grid-cols-1 gap-4 max-w-sm">
                  <InputField label="Current Password" defaultValue="" type="password" />
                  <InputField label="New Password" defaultValue="" type="password" />
                  <InputField label="Confirm New Password" defaultValue="" type="password" />
                </div>
              </motion.div>
            )}

            {/* Tab: Rules */}
            {activeTab === "rules" && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-slate-300 border-b border-slate-800/40 pb-2">Exam Configuration Defaults</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Default Duration (Minutes)" defaultValue="90" type="number" />
                  <InputField label="Default Passing Marks (%)" defaultValue="40" type="number" />
                </div>
                <div className="border-t border-slate-800/40 pt-4">
                  <SettingRow label="AI Automatic Grader" description="Automatically run LLM grading models on submissions.">
                    <Toggle2 enabled={aiAutoGrade} onChange={setAiAutoGrade} />
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {/* Tab: AI Thresholds */}
            {activeTab === "ai-threshold" && (
              <motion.div
                key="ai-threshold"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-5"
              >
                <h3 className="text-xs font-bold text-slate-300 border-b border-slate-800/40 pb-2">AI Proctoring Sensitivity</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <label className="font-semibold">AI Suspicious Alert threshold</label>
                    <span className="font-bold text-indigo-400">{aiThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    value={aiThreshold}
                    onChange={(e) => setAiThreshold(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Adjusts the minimum confidence threshold to automatically flag candidate violations (e.g. eye gazes, tab switching).
                  </p>
                </div>

                <div className="border-t border-slate-800/40 pt-4">
                  <SettingRow label="Active Gaze tracking" description="Flag deviations away from main screen canvas.">
                    <Toggle2 enabled={gazeTracking} onChange={setGazeTracking} />
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {/* Tab: Notifications */}
            {activeTab === "notifs" && (
              <motion.div
                key="notifs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-slate-300 border-b border-slate-800/40 pb-2">Notification Preferences</h3>
                <SettingRow label="Email Notifications alerts" description="Receive immediate summaries when exams submit.">
                  <Toggle2 enabled={emailAlerts} onChange={setEmailAlerts} />
                </SettingRow>
                <SettingRow label="Log Proctor events warnings" description="Pop toast notifications for critical alerts.">
                  <Toggle2 enabled={proctorLogs} onChange={setProctorLogs} />
                </SettingRow>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
