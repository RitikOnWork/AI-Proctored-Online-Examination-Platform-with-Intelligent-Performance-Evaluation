"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, Upload, Check, AlertCircle, X } from "lucide-react";
import { motion } from "framer-motion";

type Option = {
  id?: string;
  option_text: string;
  is_correct: boolean;
};

type Question = {
  id: string;
  title: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  marks: number;
  subject_id: string;
  options: Option[];
  image_url?: string;
};

type Subject = {
  id: string;
  name: string;
};

export default function QuestionBankEditor() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [token, setToken] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    question_text: "",
    question_type: "mcq",
    difficulty: "medium",
    marks: 1,
    subject_id: "",
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ] as Option[],
    image_url: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
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

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/v1/questions?limit=100";
      if (selectedSubject) url += `&subject_id=${selectedSubject}`;
      if (selectedType) url += `&question_type=${selectedType}`;
      if (selectedDifficulty) url += `&difficulty=${selectedDifficulty}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchQuestions();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/questions/search?q=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Failed to search questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubjects();
      fetchQuestions();
    }
  }, [token, selectedSubject, selectedType, selectedDifficulty]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client side size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds the 5MB limit.");
      return;
    }

    setUploadingImage(true);
    setErrorMsg("");

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/questions/upload-image", {
        method: "POST",
        body: uploadData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, image_url: `http://localhost:8000${data.url}` }));
      } else {
        const data = await res.json();
        setErrorMsg(data.detail || "Failed to upload image.");
      }
    } catch (err) {
      setErrorMsg("Image upload failed due to server error.");
    } finally {
      setUploadingImage(false);
    }
  };

  const addOptionField = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { option_text: "", is_correct: false }],
    }));
  };

  const removeOptionField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index),
    }));
  };

  const handleOptionChange = (index: number, field: keyof Option, value: any) => {
    setFormData((prev) => {
      const updated = prev.options.map((opt, idx) => {
        if (idx !== index) return opt;
        // If MCQ and we mark this option as correct, uncheck other options
        if (prev.question_type === "mcq" && field === "is_correct" && value === true) {
          return { ...opt, [field]: value };
        }
        return { ...opt, [field]: value };
      });

      // Handle unchecking other correct options for MCQ
      if (prev.question_type === "mcq" && field === "is_correct" && value === true) {
        return {
          ...prev,
          options: updated.map((opt, idx) => (idx === index ? opt : { ...opt, is_correct: false })),
        };
      }
      return { ...prev, options: updated };
    });
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      title: "",
      question_text: "",
      question_type: "mcq",
      difficulty: "medium",
      marks: 1,
      subject_id: subjects[0]?.id || "",
      options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
      image_url: "",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      title: q.title,
      question_text: q.question_text,
      question_type: q.question_type,
      difficulty: q.difficulty,
      marks: q.marks,
      subject_id: q.subject_id,
      options: q.options.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct })),
      image_url: q.image_url || "",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Front-end Validations
    if (!formData.subject_id) {
      setErrorMsg("Please select a subject.");
      return;
    }
    if (formData.question_type === "mcq" || formData.question_type === "multi_select") {
      if (formData.options.length < 2) {
        setErrorMsg("MCQ and Multi-Select questions must have at least 2 options.");
        return;
      }
      if (formData.options.some((o) => !o.option_text.trim())) {
        setErrorMsg("All options must contain text.");
        return;
      }
      const correctCount = formData.options.filter((o) => o.is_correct).length;
      if (formData.question_type === "mcq" && correctCount !== 1) {
        setErrorMsg("MCQ must have exactly 1 correct option.");
        return;
      }
      if (formData.question_type === "multi_select" && correctCount < 1) {
        setErrorMsg("Multi-Select questions must have at least 1 correct option.");
        return;
      }
    }

    try {
      const url = editingQuestion
        ? `http://localhost:8000/api/v1/questions/${editingQuestion.id}`
        : "http://localhost:8000/api/v1/questions";
      
      const method = editingQuestion ? "PATCH" : "POST";
      const payload = {
        title: formData.title,
        question_text: formData.question_text,
        question_type: formData.question_type,
        difficulty: formData.difficulty,
        marks: Number(formData.marks),
        subject_id: formData.subject_id,
        options: (formData.question_type === "mcq" || formData.question_type === "multi_select")
          ? formData.options
          : [],
        image_url: formData.image_url || null,
      };

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
        fetchQuestions();
      } else {
        const data = await res.json();
        setErrorMsg(data.detail || "Failed to save question.");
      }
    } catch (err) {
      setErrorMsg("An error occurred while saving.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border/40 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-muted/50 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-muted/50 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="multi_select">Multi-Select</option>
            <option value="short_answer">Short Answer</option>
            <option value="long_answer">Long Answer</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-muted/50 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted/50 border border-border/40 text-sm rounded-xl pl-9 pr-3 py-2 text-foreground focus:outline-none focus:border-primary/50 w-full md:w-60"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary text-primary-foreground text-sm font-semibold rounded-xl px-4 py-2 hover:bg-primary/95 transition-colors"
          >
            Search
          </button>
          <button
            onClick={openAddModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No questions found matching your criteria.</div>
        ) : (
          <div className="divide-y divide-border/40">
            {questions.map((q) => (
              <div key={q.id} className="p-6 hover:bg-muted/10 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase">
                      {q.question_type.replace("_", " ")}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                      q.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      q.difficulty === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-muted-foreground font-medium">Marks: {q.marks}</span>
                  </div>

                  <h3 className="text-base font-semibold text-foreground truncate">{q.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{q.question_text}</p>
                  
                  {q.image_url && (
                    <div className="mt-2">
                      <img src={q.image_url} alt="Question Graphic" className="max-h-24 object-cover rounded-lg border border-border/40" />
                    </div>
                  )}

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
                            opt.is_correct
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                              : "bg-muted/10 border-border/20 text-muted-foreground"
                          }`}
                        >
                          <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-black/20 text-[10px] font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 truncate">{opt.option_text}</span>
                          {opt.is_correct && <Check className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors border border-border/10"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors border border-border/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </h2>
              <p className="text-xs text-muted-foreground">Configure question parameters and answer criteria</p>
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
                    className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
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
                    <label className="text-xs font-semibold text-muted-foreground">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Marks</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) || 1 })}
                      className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Question Type</label>
                <select
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                  className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="multi_select">Multi-Select</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="long_answer">Long Answer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Merge Sort Time Complexity"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Question Text</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type the full question instructions..."
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="w-full bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Graphic Attachment */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Graphic (Optional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <label className="bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold rounded-xl px-4 py-2 border border-border/40 cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Options Editor for MCQ / Multi Select */}
              {(formData.question_type === "mcq" || formData.question_type === "multi_select") && (
                <div className="space-y-2 border-t border-border/20 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">Options Setup</label>
                    <button
                      type="button"
                      onClick={addOptionField}
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      + Add Option Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.options.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={opt.is_correct}
                          onChange={(e) => handleOptionChange(index, "is_correct", e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-0 focus:ring-offset-0 bg-muted border border-border/40"
                          title="Is correct option?"
                        />
                        <input
                          type="text"
                          required
                          placeholder={`Option ${index + 1} text`}
                          value={opt.option_text}
                          onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                          className="flex-1 bg-muted/30 border border-border/40 text-sm rounded-xl px-3 py-1.5 text-foreground focus:outline-none"
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionField(index)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  Save Question
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
