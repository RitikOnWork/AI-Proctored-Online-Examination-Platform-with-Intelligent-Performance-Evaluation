"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Shield, ClipboardList, Eye, Bell, Palette,
  Save, RefreshCw, ChevronRight, Sun, Moon,
  Laptop, Check
} from "lucide-react";

const tabs = [
  { id: "general",      label: "General",        icon: Settings      },
  { id: "auth",         label: "Authentication",  icon: Shield        },
  { id: "exam-rules",   label: "Exam Rules",      icon: ClipboardList },
  { id: "proctoring",   label: "Proctoring",      icon: Eye           },
  { id: "notifications",label: "Notifications",   icon: Bell          },
  { id: "theme",        label: "Theme",           icon: Palette       },
];

function Toggle2({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 flex-shrink-0 ${enabled ? "bg-primary" : "bg-muted-foreground/20"}`}
      style={{ height: 22, width: 40 }}
    >
      <motion.span
        layout
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
        className="absolute w-4 h-4 bg-primary-foreground rounded-full shadow-md"
        style={{ top: 3 }}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/40 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function InputField({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full px-3 py-2.5 bg-muted/30 border border-border/40 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
      />
    </div>
  );
}

function SelectField({ label, options, defaultValue }: { label: string; options: string[]; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <select
        defaultValue={defaultValue}
        className="w-full px-3 py-2.5 bg-muted/30 border border-border/40 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
      >
        {options.map(o => (
          <option key={o} value={o} className="bg-card text-foreground">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Tab Panels ───────────────────────────────────────────────────────────────

function GeneralSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [registration, setRegistration] = useState(true);
  const [publicResults, setPublicResults] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Platform Name" defaultValue="ProctorAI" />
        <InputField label="Support Email" defaultValue="support@proctorai.com" type="email" />
        <InputField label="Admin Contact" defaultValue="+91 98765 43210" />
        <SelectField label="Default Language" options={["English", "Hindi", "French", "Arabic"]} defaultValue="English" />
        <SelectField label="Timezone" options={["IST (UTC+5:30)", "UTC", "EST (UTC-5)", "PST (UTC-8)"]} defaultValue="IST (UTC+5:30)" />
        <SelectField label="Date Format" options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} defaultValue="DD/MM/YYYY" />
      </div>
      <div className="border-t border-border/40 pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Platform Visibility</p>
        <SettingRow label="Maintenance Mode" description="Temporarily disable platform access for all users">
          <Toggle2 enabled={maintenance} onChange={setMaintenance} />
        </SettingRow>
        <SettingRow label="Student Registration Open" description="Allow new students to create accounts">
          <Toggle2 enabled={registration} onChange={setRegistration} />
        </SettingRow>
        <SettingRow label="Public Result Pages" description="Allow results to be viewed without authentication">
          <Toggle2 enabled={publicResults} onChange={setPublicResults} />
        </SettingRow>
      </div>
    </div>
  );
}

function AuthSettings() {
  const [tfa, setTfa] = useState(true);
  const [ipWhite, setIpWhite] = useState(false);
  const [binding, setBinding] = useState(true);
  const [audit, setAudit] = useState(true);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="JWT Secret Key" defaultValue="••••••••••••••••••••••••" type="password" />
        <InputField label="Access Token Expiry" defaultValue="30 minutes" />
        <InputField label="Refresh Token Expiry" defaultValue="7 days" />
        <InputField label="Session Token Expiry" defaultValue="3 hours" />
        <InputField label="Max Login Attempts" defaultValue="5" />
        <InputField label="Lockout Duration" defaultValue="15 minutes" />
      </div>
      <div className="border-t border-border/40 pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Security Options</p>
        <SettingRow label="Two-Factor Authentication" description="Require 2FA for all admin and examiner accounts">
          <Toggle2 enabled={tfa} onChange={setTfa} />
        </SettingRow>
        <SettingRow label="IP Whitelisting" description="Restrict admin access to approved IP addresses">
          <Toggle2 enabled={ipWhite} onChange={setIpWhite} />
        </SettingRow>
        <SettingRow label="Session Token Binding" description="Bind exam tokens to student IP for anti-sharing">
          <Toggle2 enabled={binding} onChange={setBinding} />
        </SettingRow>
        <SettingRow label="Audit Log" description="Log all authentication events for compliance">
          <Toggle2 enabled={audit} onChange={setAudit} />
        </SettingRow>
      </div>
    </div>
  );
}

function ExamRulesSettings() {
  const [lateSub, setLateSub] = useState(false);
  const [autoSub, setAutoSub] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [navFree, setNavFree] = useState(true);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Default Exam Duration (min)" defaultValue="60" />
        <InputField label="Max Questions per Exam" defaultValue="100" />
        <InputField label="Default Marks per Question" defaultValue="1" />
        <InputField label="Default Negative Marks" defaultValue="0.25" />
        <InputField label="Result Release Delay (hrs)" defaultValue="24" />
        <SelectField label="Default Question Shuffle" options={["Enabled", "Disabled"]} defaultValue="Enabled" />
        <SelectField label="Default Answer Shuffle" options={["Enabled", "Disabled"]} defaultValue="Enabled" />
        <InputField label="Min Pass Percentage" defaultValue="40" />
      </div>
      <div className="border-t border-border/40 pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Exam Behaviour</p>
        <SettingRow label="Allow Late Submission" description="Accept answers submitted after time expires">
          <Toggle2 enabled={lateSub} onChange={setLateSub} />
        </SettingRow>
        <SettingRow label="Auto Submit on Timeout" description="Automatically submit when the timer reaches zero">
          <Toggle2 enabled={autoSub} onChange={setAutoSub} />
        </SettingRow>
        <SettingRow label="Show Timer to Student" description="Display countdown timer during the exam">
          <Toggle2 enabled={showTimer} onChange={setShowTimer} />
        </SettingRow>
        <SettingRow label="Allow Question Navigation" description="Students can navigate between questions freely">
          <Toggle2 enabled={navFree} onChange={setNavFree} />
        </SettingRow>
      </div>
    </div>
  );
}

function ProctoringSettings() {
  const [webcam, setWebcam] = useState(true);
  const [gaze, setGaze] = useState(true);
  const [tabSwitch, setTabSwitch] = useState(true);
  const [multiFace, setMultiFace] = useState(true);
  const [autoTerm, setAutoTerm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Webcam Snapshot Interval (s)" defaultValue="30" />
        <InputField label="Gaze Deviation Threshold" defaultValue="30 degrees" />
        <InputField label="Max Tab Switches Allowed" defaultValue="3" />
        <InputField label="Face Missing Timeout (s)" defaultValue="10" />
        <InputField label="Suspicion Score Threshold" defaultValue="70" />
        <SelectField label="AI Model Sensitivity" options={["Low", "Medium", "High"]} defaultValue="Medium" />
      </div>
      <div className="border-t border-border/40 pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Proctoring Features</p>
        <SettingRow label="Webcam Monitoring" description="Capture periodic snapshots during exam">
          <Toggle2 enabled={webcam} onChange={setWebcam} />
        </SettingRow>
        <SettingRow label="Gaze Tracking" description="Monitor eye gaze direction for off-screen alerts">
          <Toggle2 enabled={gaze} onChange={setGaze} />
        </SettingRow>
        <SettingRow label="Tab Switch Detection" description="Alert when student switches browser tabs">
          <Toggle2 enabled={tabSwitch} onChange={setTabSwitch} />
        </SettingRow>
        <SettingRow label="Multiple Face Detection" description="Flag sessions where multiple faces are detected">
          <Toggle2 enabled={multiFace} onChange={setMultiFace} />
        </SettingRow>
        <SettingRow label="Auto Terminate on Violation" description="Automatically end exam on critical violations">
          <Toggle2 enabled={autoTerm} onChange={setAutoTerm} />
        </SettingRow>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [newStud, setNewStud] = useState(true);
  const [examPub, setExamPub] = useState(true);
  const [resPub, setResPub] = useState(true);
  const [suspAlert, setSuspAlert] = useState(true);
  const [examAssign, setExamAssign] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="SMTP Host" defaultValue="smtp.gmail.com" />
        <InputField label="SMTP Port" defaultValue="587" />
        <InputField label="SMTP Username" defaultValue="notify@proctorai.com" />
        <InputField label="SMTP Password" defaultValue="••••••••••••" type="password" />
        <InputField label="Sender Display Name" defaultValue="ProctorAI Platform" />
        <SelectField label="Notification Frequency" options={["Instant", "Batched (hourly)", "Digest (daily)"]} defaultValue="Instant" />
      </div>
      <div className="border-t border-border/40 pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Email Triggers</p>
        <SettingRow label="New Student Registration" description="Send welcome email on student signup">
          <Toggle2 enabled={newStud} onChange={setNewStud} />
        </SettingRow>
        <SettingRow label="Exam Published Alert" description="Notify enrolled students when exam goes live">
          <Toggle2 enabled={examPub} onChange={setExamPub} />
        </SettingRow>
        <SettingRow label="Result Published Alert" description="Email students when results are released">
          <Toggle2 enabled={resPub} onChange={setResPub} />
        </SettingRow>
        <SettingRow label="Suspicious Session Alert" description="Notify admin on high suspicion score">
          <Toggle2 enabled={suspAlert} onChange={setSuspAlert} />
        </SettingRow>
        <SettingRow label="Examiner Assignment Alert" description="Notify examiner when assigned to an exam">
          <Toggle2 enabled={examAssign} onChange={setExamAssign} />
        </SettingRow>
      </div>
    </div>
  );
}

function ThemeSettings() {
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const themes = [
    { id: "dark",   label: "Dark",   icon: Moon,   preview: "bg-[#0d1117]" },
    { id: "light",  label: "Light",  icon: Sun,    preview: "bg-slate-100" },
    { id: "system", label: "System", icon: Laptop, preview: "bg-gradient-to-r from-[#0d1117] to-slate-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Color Mode</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTheme(t.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                  selectedTheme === t.id ? "border-primary bg-primary/10" : "border-border/40 bg-card hover:border-primary/30"
                }`}
              >
                <div className={`w-full h-10 rounded-xl ${t.preview} border border-border/40`} />
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{t.label}</span>
                </div>
                {selectedTheme === t.id && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/40 pt-4 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground">Accent Color</p>
        <div className="flex gap-3">
          {[
            { color: "#6366f1", label: "Indigo"  },
            { color: "#8b5cf6", label: "Violet"  },
            { color: "#14b8a6", label: "Teal"    },
            { color: "#f59e0b", label: "Amber"   },
            { color: "#f43f5e", label: "Rose"    },
            { color: "#3b82f6", label: "Blue"    },
          ].map(c => (
            <button key={c.label} type="button" title={c.label} className="w-9 h-9 rounded-xl border-2 border-border/40 hover:border-primary/50 transition-colors" style={{ backgroundColor: c.color }} />
          ))}
        </div>
      </div>

      <div className="border-t border-border/40 pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Interface Options</p>
        <SettingRow label="Compact Sidebar" description="Use smaller sidebar with icon-only mode">
          <Toggle2 enabled={false} onChange={() => {}} />
        </SettingRow>
        <SettingRow label="Smooth Animations" description="Enable all Framer Motion transitions">
          <Toggle2 enabled={true} onChange={() => {}} />
        </SettingRow>
        <SettingRow label="Dense Table Mode" description="Reduce row padding in data tables">
          <Toggle2 enabled={false} onChange={() => {}} />
        </SettingRow>
      </div>
    </div>
  );
}

// ── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const panelMap: Record<string, React.ReactNode> = {
    "general":       <GeneralSettings />,
    "auth":          <AuthSettings />,
    "exam-rules":    <ExamRulesSettings />,
    "proctoring":    <ProctoringSettings />,
    "notifications": <NotificationSettings />,
    "theme":         <ThemeSettings />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure platform preferences and system behaviour.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tab Nav */}
        <div className="lg:w-52 flex-shrink-0">
          <nav className="space-y-1 lg:sticky lg:top-20">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {tabs.find(t => t.id === activeTab)?.label} Settings
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} configuration</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground bg-muted border border-border/40 rounded-xl hover:bg-muted/80 transition-all">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <motion.button
                    type="button"
                    onClick={handleSave}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                      saved
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                        : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20"
                    }`}
                  >
                    {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                  </motion.button>
                </div>
              </div>
              {panelMap[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
