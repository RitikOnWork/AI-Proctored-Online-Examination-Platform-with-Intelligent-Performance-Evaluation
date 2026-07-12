"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Play, AlertCircle, X, Shield, Calendar, Clock, Award, Settings, Link2, Check } from "lucide-react";
import { motion } from "framer-motion";

type ExamSettings = {
  shuffle_questions: boolean;
  webcam_required: boolean;
  microphone_required: boolean;
  browser_lock_required: boolean;
  gaze_tracking_required: boolean;
  difficulty_distribution?: Record<string, number>;
  question_distribution?: Record<string, number>;
};

type Exam = {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  passing_score: number;
  start_time?: string;
  end_time?: string;
  is_published: boolean;
  subject_id: string;
  question_count?: number;
  settings?: ExamSettings;
};

type Subject = {
  id: string;
  name: string;
};

type Question = {
  id: string;
  title: string;
  marks: number;
  question_type: string;
};

export default function ExamConfigurator() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [linkingExam, setLinkingExam] = useState<Exam | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
    passing_score: 40,
    start_time: "",
    end_time: "",
    subject_id: "",
    question_count: 10,
    shuffle_questions: true,
    webcam_required: false,
    microphone_required: false,
    browser_lock_required: false,
    gaze_tracking_required: false,
    easy_percent: 40,
    medium_percent: 40,
    hard_percent: 20,
  });

  // Link Question State
  const [linkedQuestions, setLinkedQuestions] = useState<{ question_id: string; order: number; points_override?: number }[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("access_token") || "";
    setToken(savedToken);
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/exams?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectQuestions = async (subId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/questions?subject_id=${subId}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubjects();
      fetchExams();
    }
  }, [token]);

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({
      title: "",
      description: "",
      duration_minutes: 60,
      passing_score: 40,
      start_time: "",
      end_time: "",
      subject_id: subjects[0]?.id || "",
      question_count: 10,
      shuffle_questions: true,
      webcam_required: false,
      microphone_required: false,
      browser_lock_required: false,
      gaze_tracking_required: false,
      easy_percent: 40,
      medium_percent: 40,
      hard_percent: 20,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    
    // Parse difficulty distributions if they exist
    const diff = exam.settings?.difficulty_distribution || {};
    
    setFormData({
      title: exam.title,
      description: exam.description || "",
      duration_minutes: exam.duration_minutes,
      passing_score: exam.passing_score,
      start_time: exam.start_time ? new Date(exam.start_time).toISOString().slice(0, 16) : "",
      end_time: exam.end_time ? new Date(exam.end_time).toISOString().slice(0, 16) : "",
      subject_id: exam.subject_id,
      question_count: exam.question_count || 10,
      shuffle_questions: exam.settings?.shuffle_questions ?? true,
      webcam_required: exam.settings?.webcam_required ?? false,
      microphone_required: exam.settings?.microphone_required ?? false,
      browser_lock_required: exam.settings?.browser_lock_required ?? false,
      gaze_tracking_required: exam.settings?.gaze_tracking_required ?? false,
      easy_percent: diff.easy || 40,
      medium_percent: diff.medium || 40,
      hard_percent: diff.hard || 20,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.subject_id) {
      setErrorMsg("Please select a subject.");
      return;
    }

    if (Number(formData.easy_percent) + Number(formData.medium_percent) + Number(formData.hard_percent) !== 100) {
      setErrorMsg("Difficulty distributions percentages must sum up to exactly 100%.");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description || null,
      duration_minutes: Number(formData.duration_minutes),
      passing_score: Number(formData.passing_score),
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
      subject_id: formData.subject_id,
      question_count: Number(formData.question_count),
      settings: {
        shuffle_questions: formData.shuffle_questions,
        webcam_required: formData.webcam_required,
        microphone_required: formData.microphone_required,
        browser_lock_required: formData.browser_lock_required,
        gaze_tracking_required: formData.gaze_tracking_required,
        difficulty_distribution: {
          easy: Number(formData.easy_percent),
          medium: Number(formData.medium_percent),
          hard: Number(formData.hard_percent),
        },
      },
    };

    try {
      const url = editingExam
        ? `http://localhost:8000/api/v1/exams/${editingExam.id}`
        : "http://localhost:8000/api/v1/exams";
      const method = editingExam ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchExams();
      } else {
        const data = await res.json();
        setErrorMsg(data.detail || "Failed to save exam.");
      }
    } catch (err) {
      setErrorMsg("An error occurred while saving.");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/exams/${id}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchExams();
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to publish exam.");
      }
    } catch (err) {
      console.error("Failed to publish exam:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/exams/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchExams();
      }
    } catch (err) {
      console.error("Failed to delete exam:", err);
    }
  };

  const openLinkModal = async (exam: Exam) => {
    setLinkingExam(exam);
    await fetchSubjectQuestions(exam.subject_id);
    
    // Fetch currently assigned questions for this exam
    try {
      const res = await fetch(`http://localhost:8000/api/v1/exams/${exam.id}/paper`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((q: Question, idx: number) => ({
          question_id: q.id,
          order: idx,
        }));
        setLinkedQuestions(mapped);
      } else {
        setLinkedQuestions([]);
      }
    } catch (err) {
      setLinkedQuestions([]);
    }
    setIsLinkModalOpen(true);
  };

  const toggleLinkQuestion = (qId: string) => {
    setLinkedQuestions((prev) => {
      const idx = prev.findIndex((q) => q.question_id === qId);
      if (idx !== -1) {
        // Remove
        const filtered = prev.filter((q) => q.question_id !== qId);
        // Re-order
        return filtered.map((q, oIdx) => ({ ...q, order: oIdx }));
      } else {
        // Add
        return [...prev, { question_id: qId, order: prev.length }];
      }
    });
  };

  const saveLinkedQuestions = async () => {
    if (!linkingExam) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/exams/${linkingExam.id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions: linkedQuestions }),
      });
      if (res.ok) {
        setIsLinkModalOpen(false);
        fetchExams();
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to link questions.");
      }
    } catch (err) {
      console.error("Error linking questions:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configure Toolbar */}
      <div className="flex items-center justify-between bg-card border border-border/40 p-4 rounded-2xl">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Configured Academic Exams</h2>
          <p className="text-xs text-muted-foreground">Modify time limits, scheduling, proctor actions, and randomized papers</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center text-muted-foreground p-12">Loading exams...</div>
      ) : exams.length === 0 ? (
        <div className="text-center text-muted-foreground p-12 bg-card border border-border/40 rounded-2xl">No exams configured yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <motion.div
              key={exam.id}
              whileHover={{ y: -3 }}
              className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground line-clamp-1">{exam.title}</h3>
                  <span className="text-xs text-primary font-semibold">
                    {subjects.find((s) => s.id === exam.subject_id)?.name || "Subject Code"}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  exam.is_published
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {exam.is_published ? "Published" : "Draft"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 h-8">{exam.description || "No description set."}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl">
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration_minutes} mins</div>
                <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Pass: {exam.passing_score}%</div>
                <div className="flex items-center gap-1.5 col-span-2 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {exam.start_time ? new Date(exam.start_time).toLocaleString() : "Flexible Start"}
                  </span>
                </div>
              </div>

              {/* Proctor Policies Indicators */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exam.settings?.webcam_required && <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-2 py-0.5 rounded-full font-bold">Cam</span>}
                {exam.settings?.microphone_required && <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-2 py-0.5 rounded-full font-bold">Mic</span>}
                {exam.settings?.browser_lock_required && <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-2 py-0.5 rounded-full font-bold">Safe Browser</span>}
                {exam.settings?.gaze_tracking_required && <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-2 py-0.5 rounded-full font-bold">AI Gaze</span>}
              </div>

              <div className="border-t border-border/20 pt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openLinkModal(exam)}
                    className="p-2 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors border border-border/10 flex items-center gap-1 text-[11px] font-semibold"
                    title="Link questions"
                  >
                    <Link2 className="w-3.5 h-3.5" /> Links
                  </button>
                  <button
                    onClick={() => openEditModal(exam)}
                    className="p-2 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors border border-border/10"
                    title="Edit parameters"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="p-2 bg-muted/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-colors border border-border/10"
                    title="Delete exam"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!exam.is_published && (
                  <button
                    onClick={() => handlePublish(exam.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3" /> Publish
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/40 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative space-y-4"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                {editingExam ? "Edit Exam Configuration" : "Configure New Exam"}
              </h2>
              <p className="text-xs text-muted-foreground">Adjust timing, access periods, proctor policies, and randomized rules</p>
            </div>

            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none"
                  >
                    <option value="" disabled>Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                      className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Passing Score (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.passing_score}
                      onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 40 })}
                      className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Algorithms Assessment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for students..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none"
                />
              </div>

              {/* Time Window */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Start Time (Access Window)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> End Time (Access Window)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Generation Rules */}
              <div className="border-t border-border/20 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5" /> Randomized Paper & Distributions (Auto-Gen)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Total Questions</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.question_count}
                      onChange={(e) => setFormData({ ...formData, question_count: parseInt(e.target.value) || 10 })}
                      className="w-full bg-muted/30 border border-border/40 text-xs rounded-xl px-3 py-1.5 text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Easy %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.easy_percent}
                      onChange={(e) => setFormData({ ...formData, easy_percent: parseInt(e.target.value) || 0 })}
                      className="w-full bg-muted/30 border border-border/40 text-xs rounded-xl px-3 py-1.5 text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Medium %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.medium_percent}
                      onChange={(e) => setFormData({ ...formData, medium_percent: parseInt(e.target.value) || 0 })}
                      className="w-full bg-muted/30 border border-border/40 text-xs rounded-xl px-3 py-1.5 text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Hard %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.hard_percent}
                      onChange={(e) => setFormData({ ...formData, hard_percent: parseInt(e.target.value) || 0 })}
                      className="w-full bg-muted/30 border border-border/40 text-xs rounded-xl px-3 py-1.5 text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="shuffle_questions"
                    checked={formData.shuffle_questions}
                    onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-0 focus:ring-offset-0 bg-muted border border-border/40"
                  />
                  <label htmlFor="shuffle_questions" className="text-xs text-muted-foreground cursor-pointer">
                    Enable deterministic shuffling (different question order per student)
                  </label>
                </div>
              </div>

              {/* Proctoring Settings */}
              <div className="border-t border-border/20 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Proctoring & Integrity Policies
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="webcam_required"
                      checked={formData.webcam_required}
                      onChange={(e) => setFormData({ ...formData, webcam_required: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-0 focus:ring-offset-0 bg-muted border border-border/40"
                    />
                    <label htmlFor="webcam_required" className="text-xs text-muted-foreground cursor-pointer">Webcam Streaming</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="microphone_required"
                      checked={formData.microphone_required}
                      onChange={(e) => setFormData({ ...formData, microphone_required: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-0 focus:ring-offset-0 bg-muted border border-border/40"
                    />
                    <label htmlFor="microphone_required" className="text-xs text-muted-foreground cursor-pointer">Audio Monitoring</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="browser_lock_required"
                      checked={formData.browser_lock_required}
                      onChange={(e) => setFormData({ ...formData, browser_lock_required: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-0 focus:ring-offset-0 bg-muted border border-border/40"
                    />
                    <label htmlFor="browser_lock_required" className="text-xs text-muted-foreground cursor-pointer">Strict Tab/Browser Lock</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="gaze_tracking_required"
                      checked={formData.gaze_tracking_required}
                      onChange={(e) => setFormData({ ...formData, gaze_tracking_required: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-0 focus:ring-offset-0 bg-muted border border-border/40"
                    />
                    <label htmlFor="gaze_tracking_required" className="text-xs text-muted-foreground cursor-pointer">Eye Gaze Tracking</label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold rounded-xl px-4 py-2 border border-border/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground text-sm font-semibold rounded-xl px-4 py-2 hover:bg-primary/95 transition-colors"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Link Questions Modal */}
      {isLinkModalOpen && linkingExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/40 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative space-y-4"
          >
            <button
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-foreground">Link Specific Exam Questions</h2>
              <p className="text-xs text-muted-foreground">Select questions belonging to {linkingExam.title}</p>
            </div>

            <div className="border border-border/40 rounded-xl divide-y divide-border/40 max-h-96 overflow-y-auto bg-muted/10">
              {questions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">No questions configured for this subject yet. Please create questions first.</div>
              ) : (
                questions.map((q) => {
                  const isLinked = linkedQuestions.some((l) => l.question_id === q.id);
                  const linkedIndex = linkedQuestions.findIndex((l) => l.question_id === q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleLinkQuestion(q.id)}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                        isLinked ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-foreground truncate">{q.title}</h4>
                        <span className="text-[10px] text-muted-foreground uppercase">{q.question_type.replace("_", " ")} • {q.marks} Marks</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isLinked && (
                          <span className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary flex items-center justify-center">
                            {linkedIndex + 1}
                          </span>
                        )}
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isLinked ? "bg-primary border-primary text-primary-foreground" : "border-border/40"
                        }`}>
                          {isLinked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border/20 pt-4">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold rounded-xl px-4 py-2 border border-border/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveLinkedQuestions}
                className="bg-primary text-primary-foreground text-sm font-semibold rounded-xl px-4 py-2 hover:bg-primary/95 transition-colors"
              >
                Save Mappings ({linkedQuestions.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
