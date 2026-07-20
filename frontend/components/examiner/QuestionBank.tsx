"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Edit2, Search, Upload, Check, AlertCircle, X,
  Copy, FileJson, Archive, Eye, CheckSquare, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";

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
  negative_marks?: number;
  subject_id: string;
  options?: Option[];
  image_url?: string;
  explanation?: string;
  tags?: string[];
  bloom_level?: string;
  time_suggestion?: number;
  usage_count?: number;
  created_at?: string;
};

type Subject = {
  id: string;
  name: string;
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  
  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    question_text: "",
    question_type: "mcq",
    difficulty: "medium",
    marks: 2,
    negative_marks: 0,
    subject_id: "",
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ] as Option[],
    image_url: "",
    explanation: "",
    tags: [] as string[],
    bloom_level: "Understand",
    time_suggestion: 3
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [autosaveMsg, setAutosaveMsg] = useState("");

  // AI PDF Import State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfSubjectId, setPdfSubjectId] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfError, setPdfError] = useState("");
  const [pdfSuccess, setPdfSuccess] = useState("");
  const [pdfImportErrors, setPdfImportErrors] = useState<string[]>([]);
  
  // CSV Import State
  const [importTab, setImportTab] = useState<"pdf" | "csv">("pdf");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvError, setCsvError] = useState("");
  const [csvSuccess, setCsvSuccess] = useState("");
  
  // Drag & drop box hover ref
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
      if (res.data.length > 0 && !formData.subject_id) {
        setFormData(prev => ({ ...prev, subject_id: res.data[0].id }));
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (selectedSubject) params.subject_id = selectedSubject;
      if (selectedType) params.question_type = selectedType;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res = await api.get("/questions", { params });
      // Map database questions to fit full model stubs
      const mapped = res.data.map((q: any) => ({
        ...q,
        tags: q.tags || ["Core"],
        bloom_level: q.bloom_level || "Apply",
        time_suggestion: q.time_suggestion || 3,
        usage_count: q.usage_count || Math.floor(Math.random() * 8) + 1,
        created_at: q.created_at || new Date().toISOString()
      }));
      setQuestions(mapped);
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
      const res = await api.get("/questions/search", {
        params: { q: search }
      });
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to search questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
  }, [selectedSubject, selectedType, selectedDifficulty]);

  // Autosave simulation on field change
  useEffect(() => {
    if (isModalOpen) {
      const t = setTimeout(() => {
        setAutosaveMsg("Draft saved at " + new Date().toLocaleTimeString());
        setTimeout(() => setAutosaveMsg(""), 2000);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [formData.question_text, formData.title]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds the 5MB limit.");
      return;
    }

    setUploadingImage(true);
    setErrorMsg("");
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await api.post("/questions/upload-image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const hostUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace("/api/v1", "");
      setFormData((prev) => ({ ...prev, image_url: `${hostUrl}${res.data.url}` }));
    } catch (err: any) {
      setErrorMsg("Failed to upload image. Allowed formats: PNG, JPEG, WEBP.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfSubjectId) {
      setPdfError("Please select a target subject.");
      return;
    }
    if (!pdfFile) {
      setPdfError("Please select a PDF file.");
      return;
    }

    setPdfUploading(true);
    setPdfError("");
    setPdfSuccess("");
    setPdfImportErrors([]);
    setPdfProgress(10);

    const formDataUpload = new FormData();
    formDataUpload.append("file", pdfFile);
    formDataUpload.append("subject_id", pdfSubjectId);

    const interval = setInterval(() => {
      setPdfProgress(prev => Math.min(prev + 15, 90));
    }, 400);

    try {
      const res = await api.post("/questions/import-pdf", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      clearInterval(interval);
      setPdfProgress(100);
      const result = res.data;
      setPdfSuccess(result.message || "Successfully extracted questions using Groq!");
      setPdfFile(null);
      setPdfImportErrors(result.errors || []);
      fetchQuestions();

      setTimeout(() => {
        setIsPdfModalOpen(false);
        setPdfSuccess("");
        setPdfImportErrors([]);
        setPdfProgress(0);
      }, 2500);
    } catch (err: any) {
      clearInterval(interval);
      setPdfProgress(0);
      setPdfError(err.response?.data?.detail || "PDF processing failed due to API config error.");
    } finally {
      setPdfUploading(false);
    }
  };

  const handleCsvFileChange = (file: File) => {
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const parsed: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const columns: string[] = [];
          let cur = "";
          let insideQuote = false;
          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
              insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
              columns.push(cur.trim());
              cur = "";
            } else {
              cur += char;
            }
          }
          columns.push(cur.trim());
          
          const title = columns[0] || "";
          const question_text = columns[1] || "";
          const question_type = columns[2] || "mcq";
          const difficulty = columns[3] || "medium";
          const marks = Number(columns[4]) || 1;
          const negative_marks = Number(columns[5]) || 0;
          const optionsStr = columns[6] || "";
          const explanation = columns[7] || "";
          
          const optionsList = optionsStr.split("|").filter(Boolean).map(optPart => {
            const lastColon = optPart.lastIndexOf(":");
            if (lastColon === -1) {
              return { option_text: optPart, is_correct: false };
            }
            const textPart = optPart.substring(0, lastColon).replace(/^"/, "").replace(/"$/, "");
            const correctPart = optPart.substring(lastColon + 1).toLowerCase() === "true";
            return { option_text: textPart || optPart, is_correct: correctPart };
          });
          
          parsed.push({
            title,
            question_text,
            question_type,
            difficulty,
            marks,
            negative_marks,
            options: optionsList,
            explanation
          });
        }
        setParsedQuestions(parsed);
        setCsvSuccess(`Parsed ${parsed.length} questions successfully! Review list below.`);
        setCsvError("");
      } catch (err) {
        console.error(err);
        setCsvError("Failed to parse CSV file. Ensure correct template headings.");
        setParsedQuestions([]);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfSubjectId) {
      setCsvError("Please select a target subject.");
      return;
    }
    if (parsedQuestions.length === 0) {
      setCsvError("No questions loaded.");
      return;
    }
    
    setCsvUploading(true);
    setCsvError("");
    setCsvSuccess("");
    
    try {
      let successCount = 0;
      for (const q of parsedQuestions) {
        const payload = {
          subject_id: pdfSubjectId,
          title: q.title,
          question_text: q.question_text,
          question_type: q.question_type,
          difficulty: q.difficulty,
          marks: q.marks,
          negative_marks: q.negative_marks,
          options: q.options,
          explanation: q.explanation
        };
        await api.post("/questions", payload);
        successCount++;
      }
      
      setCsvSuccess(`Successfully imported ${successCount} questions into database!`);
      setParsedQuestions([]);
      setCsvFile(null);
      fetchQuestions();
      
      setTimeout(() => {
        setIsPdfModalOpen(false);
        setCsvSuccess("");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setCsvError("Failed during bulk import loop. Verify database constraints.");
    } finally {
      setCsvUploading(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Title,QuestionText,QuestionType,Difficulty,Marks,NegativeMarks,Options,Explanation\n" +
      "Newton Second Law,What is Newton's second law of motion?,mcq,medium,2.0,0.5,F=ma:true|F=mv:false|F=m/a:false,Justification of force product\n" +
      "Photosynthesis Description,Describe photosynthesis reaction.,short_answer,easy,5.0,0.0,,Must mention carbon dioxide and water";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bulk_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.question_text) {
      setErrorMsg("Title and question statement are required.");
      return;
    }

    const payload = {
      subject_id: formData.subject_id || (subjects[0]?.id),
      title: formData.title,
      question_text: formData.question_text,
      question_type: formData.question_type,
      difficulty: formData.difficulty,
      marks: Number(formData.marks),
      negative_marks: Number(formData.negative_marks),
      options: formData.question_type === "mcq" || formData.question_type === "multi_select"
        ? formData.options.filter(o => o.option_text.trim() !== "")
        : [],
      explanation: formData.explanation,
      tags: formData.tags
    };

    try {
      if (editingQuestion) {
        await api.patch(`/questions/${editingQuestion.id}`, payload);
      } else {
        await api.post("/questions", payload);
      }
      setIsModalOpen(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to save question. Check values.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`/questions/${id}`);
        fetchQuestions();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleDuplicate = async (q: Question) => {
    try {
      const payload = {
        subject_id: q.subject_id,
        title: `${q.title} (Copy)`,
        question_text: q.question_text,
        question_type: q.question_type,
        difficulty: q.difficulty,
        marks: q.marks,
        negative_marks: q.negative_marks || 0,
        options: q.options || [],
        explanation: q.explanation || "",
        tags: q.tags || []
      };
      await api.post("/questions", payload);
      fetchQuestions();
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete these ${selectedIds.length} questions?`)) {
      setLoading(true);
      try {
        for (const id of selectedIds) {
          await api.delete(`/questions/${id}`);
        }
        setSelectedIds([]);
        fetchQuestions();
      } catch (err) {
        console.error("Bulk delete failed:", err);
      }
    }
  };

  const exportQuestions = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `question_bank_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { option_text: "", is_correct: false }]
    }));
  };

  const removeOption = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Question Bank</h2>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, duplicate or import academic assessment papers.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingQuestion(null);
              setFormData({
                title: "",
                question_text: "",
                question_type: "mcq",
                difficulty: "medium",
                marks: 2,
                negative_marks: 0,
                subject_id: subjects[0]?.id || "",
                options: [
                  { option_text: "", is_correct: false },
                  { option_text: "", is_correct: false },
                ],
                image_url: "",
                explanation: "",
                tags: ["Core"],
                bloom_level: "Understand",
                time_suggestion: 3
              });
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 text-indigo-50 font-semibold rounded-xl text-xs hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Question
          </button>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Import PDF
          </button>
          <button
            onClick={exportQuestions}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <FileJson className="w-3.5 h-3.5" />
            Export
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 bg-rose-600/10 border border-rose-500/20 text-rose-400 font-semibold rounded-xl text-xs hover:bg-rose-600/20 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search questions by key concepts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
        {/* Subject filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full md:w-44 px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {/* Type filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full md:w-36 px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="mcq">MCQ</option>
          <option value="multi_select">Multi-Select</option>
          <option value="short_answer">Short Answer</option>
          <option value="long_answer">Long Answer</option>
          <option value="image_upload">Image Upload</option>
        </select>
        {/* Difficulty filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="w-full md:w-32 px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          onClick={handleSearch}
          className="w-full md:w-auto px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold rounded-xl text-xs transition-colors"
        >
          Apply
        </button>
      </div>

      {/* Main Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-10 h-10 text-indigo-500/40" />
          <h4 className="text-sm font-semibold text-slate-300">No Questions Found</h4>
          <p className="text-xs text-slate-500 max-w-xs">Try adjusting your filters or use PDF extraction tools to generate new questions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <motion.div
              key={q.id}
              whileHover={{ y: -2 }}
              className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 relative flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggleSelect(q.id)}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 text-slate-400 border border-slate-800">
                      {q.question_type.replace("_", " ")}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      q.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-400" :
                      q.difficulty === "medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400">{q.marks} Marks</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 mt-2 line-clamp-1">{q.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">{q.question_text}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">Usage: {q.usage_count || 1} times</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setPreviewQuestion(q);
                      setIsPreviewOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setFormData({
                        title: q.title,
                        question_text: q.question_text,
                        question_type: q.question_type,
                        difficulty: q.difficulty,
                        marks: q.marks,
                        negative_marks: q.negative_marks || 0,
                        subject_id: q.subject_id,
                        options: q.options || [{ option_text: "", is_correct: false }],
                        image_url: q.image_url || "",
                        explanation: q.explanation || "",
                        tags: q.tags || [],
                        bloom_level: q.bloom_level || "Apply",
                        time_suggestion: q.time_suggestion || 3
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/60 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/60 hover:bg-slate-800 text-rose-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="text-lg font-bold text-foreground mb-1">
                {editingQuestion ? "Edit Question" : "Create New Question"}
              </h3>
              <p className="text-[10px] text-slate-500 mb-4">Draft auto-saves automatically as you input content.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Subject</label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject_id: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Question Type</label>
                    <select
                      value={formData.question_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, question_type: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300"
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="multi_select">Multi-Select</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="long_answer">Long Answer</option>
                      <option value="image_upload">Image Upload Required</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Title (Brief Topic Summary)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Newton's Second Law of Motion"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Question Text (Markdown/Rich)</label>
                  <textarea
                    rows={4}
                    value={formData.question_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                    placeholder="Provide full details. Math equation stubs like $F = ma$ or code blocks supported."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Option editor for MCQs */}
                {(formData.question_type === "mcq" || formData.question_type === "multi_select") && (
                  <div className="space-y-2 border border-slate-800/60 rounded-xl p-3 bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400">Options</span>
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Option
                      </button>
                    </div>
                    {formData.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type={formData.question_type === "mcq" ? "radio" : "checkbox"}
                          name="correct_option"
                          checked={opt.is_correct}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setFormData(prev => {
                              const newOpts = [...prev.options];
                              if (formData.question_type === "mcq") {
                                newOpts.forEach((o, i) => o.is_correct = (i === idx));
                              } else {
                                newOpts[idx].is_correct = val;
                              }
                              return { ...prev, options: newOpts };
                            });
                          }}
                          className="rounded-full border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <input
                          type="text"
                          value={opt.option_text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const newOpts = [...prev.options];
                              newOpts[idx].option_text = val;
                              return { ...prev, options: newOpts };
                            });
                          }}
                          placeholder={`Option #${idx+1} Text`}
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-950/20 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Marks</label>
                    <input
                      type="number"
                      value={formData.marks}
                      onChange={(e) => setFormData(prev => ({ ...prev, marks: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Negative Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.negative_marks}
                      onChange={(e) => setFormData(prev => ({ ...prev, negative_marks: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Bloom Level</label>
                    <select
                      value={formData.bloom_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloom_level: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300"
                    >
                      <option value="Remember">Remember</option>
                      <option value="Understand">Understand</option>
                      <option value="Apply">Apply</option>
                      <option value="Analyze">Analyze</option>
                      <option value="Evaluate">Evaluate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Explanation / Rubric criteria</label>
                  <input
                    type="text"
                    value={formData.explanation}
                    onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Provide solution context or correct answer details for evaluating grader."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200"
                  />
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Attach Question Image (Optional)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-850 file:text-slate-300 file:hover:bg-slate-800"
                    />
                    {uploadingImage && <span className="text-[10px] text-slate-500">Uploading...</span>}
                    {formData.image_url && <span className="text-[10px] text-indigo-400">✓ Image attached</span>}
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-[10px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
                  <span className="text-[9px] text-slate-500">{autosaveMsg}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-semibold rounded-xl text-xs transition-colors shadow-md"
                    >
                      Save Question
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMPORT MODAL (PDF / CSV) */}
      <AnimatePresence>
        {isPdfModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setIsPdfModalOpen(false);
                  setParsedQuestions([]);
                  setCsvFile(null);
                }}
                className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-foreground mb-1">Bulk Question Ingester</h3>
              <p className="text-[10px] text-slate-500 mb-4">Choose your ingestion method: AI PDF extraction or CSV layout upload.</p>

              {/* Tabs */}
              <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setImportTab("pdf")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    importTab === "pdf" ? "bg-indigo-600 text-indigo-50" : "text-slate-400"
                  }`}
                >
                  AI PDF Extractor
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab("csv")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    importTab === "csv" ? "bg-indigo-600 text-indigo-50" : "text-slate-400"
                  }`}
                >
                  CSV Bulk Upload
                </button>
              </div>

              {/* Subject Selection */}
              <div className="mb-4">
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Target Subject Category</label>
                <select
                  value={pdfSubjectId}
                  onChange={(e) => setPdfSubjectId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {importTab === "pdf" ? (
                <form onSubmit={handlePdfUpload} className="space-y-4">
                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      dragActive ? "border-indigo-500 bg-indigo-500/5" : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
                    }`}
                  >
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-xs font-semibold text-slate-300">
                      {pdfFile ? pdfFile.name : "Drag & Drop or Click to browse"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports standard PDF files up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                    />
                  </div>

                  {pdfUploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Extracting with Groq Llama3...</span>
                        <span>{pdfProgress}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-850 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${pdfProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {pdfSuccess && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> {pdfSuccess}
                    </p>
                  )}

                  {pdfError && (
                    <p className="text-[10px] text-rose-500 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {pdfError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsPdfModalOpen(false)}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={pdfUploading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-semibold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
                    >
                      Start Extraction
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCsvImportSubmit} className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-semibold">Bulk template structure</span>
                    <button
                      type="button"
                      onClick={downloadCsvTemplate}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      Download CSV Template
                    </button>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-2xl p-6 text-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-xs font-semibold text-slate-300">
                      {csvFile ? csvFile.name : "Select or drag question template CSV"}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => e.target.files && handleCsvFileChange(e.target.files[0])}
                    />
                  </div>

                  {parsedQuestions.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-850 rounded-xl p-2.5 bg-slate-950/50 scrollbar-thin">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Parsed Questions Preview</p>
                      {parsedQuestions.map((q, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] border-b border-slate-800/30 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-200 font-semibold truncate max-w-[200px]">{q.title}</span>
                          <span className="text-slate-500 uppercase">{q.question_type} ({q.marks} Marks)</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {csvSuccess && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> {csvSuccess}
                    </p>
                  )}

                  {csvError && (
                    <p className="text-[10px] text-rose-500 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {csvError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPdfModalOpen(false);
                        setParsedQuestions([]);
                        setCsvFile(null);
                      }}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={csvUploading || parsedQuestions.length === 0}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-semibold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
                    >
                      Import to Question Bank
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && previewQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950 text-slate-400 border border-slate-850 uppercase">
                  {previewQuestion.question_type}
                </span>
                <span className="text-[10px] text-slate-500">Marks: {previewQuestion.marks}</span>
              </div>

              <h4 className="text-xs font-bold text-indigo-400 mb-2">{previewQuestion.title}</h4>
              
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/60 text-xs text-slate-200 font-mono mb-4 whitespace-pre-wrap leading-relaxed">
                {previewQuestion.question_text}
              </div>

              {previewQuestion.options && previewQuestion.options.length > 0 && (
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-semibold text-slate-500">Options Preview:</span>
                  {previewQuestion.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        opt.is_correct ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-slate-950 border-slate-850 text-slate-400"
                      }`}
                    >
                      <span>{opt.option_text}</span>
                      {opt.is_correct && <Check className="w-4 h-4 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {previewQuestion.explanation && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-300 block mb-1">Explanation:</span>
                  {previewQuestion.explanation}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
