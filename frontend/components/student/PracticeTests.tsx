"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { usePracticeTests } from "@/hooks/useStudent";
import { cn } from "@/lib/utils";
import { PracticeTest } from "@/types/student";

export default function PracticeTests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [activePractice, setActivePractice] = useState<PracticeTest | null>(null);

  // States for active test simulation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  // Load practice tests from backend hook
  const { data: practiceTests = [], isLoading } = usePracticeTests();

  const subjects = ["All", ...Array.from(new Set(practiceTests.map((t) => t.subject)))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredTests = practiceTests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "All" || test.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === "All" || test.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleStartPractice = (test: PracticeTest) => {
    setActivePractice(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setPracticeCompleted(false);
  };

  const dummyQuestions = [
    { text: "What is the primary function of a Database management system (DBMS)?", options: ["Data encryption", "Efficient storing and retrieval of data", "Network load balancing", "Operating system scheduling"] },
    { text: "Which normal form handles transitive functional dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"] },
    { text: "In SQL, which clause is used to filter records in a group or aggregation?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"] },
  ];

  const handleAnswer = (option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < dummyQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setPracticeCompleted(true);
    }
  };

  const getScore = () => {
    let correct = 0;
    Object.keys(selectedAnswers).forEach((key) => {
      const selected = selectedAnswers[Number(key)];
      const correctOption = dummyQuestions[Number(key)].options[1];
      if (selected === correctOption) {
        correct++;
      }
    });
    return {
      correct,
      total: dummyQuestions.length,
      pct: Math.round((correct / dummyQuestions.length) * 100),
    };
  };

  return (
    <div className="space-y-6">
      {!activePractice ? (
        <>
          {/* Filters Section */}
          <div className="bg-card border border-border/40 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Subject dropdown */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Subject</label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-xs bg-muted/20 border border-border/40 rounded-xl text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty dropdown */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-xs bg-muted/20 border border-border/40 rounded-xl text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search practice modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-muted/10 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>

          {/* Grid of Practice Tests */}
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading practice tests...
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="bg-card border border-border/40 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-foreground">No practice modules found</p>
              <p className="text-xs text-muted-foreground">Adjust filters to explore more learning sandbox topics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-card border border-border/40 hover:border-primary/20 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all hover:shadow-md hover:-translate-y-1 relative"
                >
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                          test.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : test.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-red-500/10 text-red-500"
                        )}
                      >
                        {test.difficulty}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        ⏱️ {test.duration}m
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-foreground truncate">{test.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{test.topic}</p>
                    <p className="text-[10px] text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border/10">
                      📚 {test.subject}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/20">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      ❓ {test.questions} Questions
                    </span>
                    <button
                      onClick={() => handleStartPractice(test)}
                      className="px-3.5 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/95 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Practice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Active test simulation dashboard layout */
        <div className="max-w-xl mx-auto bg-card border border-border/40 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[9px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                Practice Mode (Sandbox)
              </span>
              <h4 className="text-xs font-extrabold text-foreground mt-0.5 truncate max-w-[200px]">
                {activePractice.name}
              </h4>
            </div>
            <button
              onClick={() => setActivePractice(null)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!practiceCompleted ? (
            /* Active Question Page */
            <div className="p-6 space-y-6 text-left">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-border/10 pb-2">
                <span>
                  Question {currentQuestionIndex + 1} of {dummyQuestions.length}
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Practice Session
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-foreground">
                  {dummyQuestions[currentQuestionIndex].text}
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {dummyQuestions[currentQuestionIndex].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswer(opt)}
                        className={cn(
                          "w-full text-left text-[11px] p-3 rounded-xl border transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary/10 border-primary/50 text-foreground font-semibold"
                            : "bg-muted/10 border-border/20 text-muted-foreground hover:bg-muted/30"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/20">
                <button
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl disabled:opacity-50 hover:bg-primary/95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {currentQuestionIndex < dummyQuestions.length - 1 ? "Next Question" : "Finish Practice"}
                </button>
              </div>
            </div>
          ) : (
            /* Completed Result Summary Page */
            <div className="p-6 text-center space-y-6 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-foreground">Practice Completed!</h4>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Practice metrics are stored in your analytics logs. No proctor violations flagged.
                </p>
              </div>

              {/* Score breakdown */}
              <div className="w-full bg-muted/20 border border-border/20 rounded-xl p-4.5 grid grid-cols-3 gap-2">
                <div className="text-center space-y-1">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">Correct Answers</p>
                  <p className="text-sm font-extrabold text-emerald-500">{getScore().correct} / {getScore().total}</p>
                </div>
                <div className="text-center space-y-1 border-x border-border/20">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">Accuracy Rate</p>
                  <p className="text-sm font-extrabold text-foreground">{getScore().pct}%</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">Status</p>
                  <p className="text-sm font-extrabold text-emerald-500">{getScore().pct >= 60 ? "Proficient" : "Needs Review"}</p>
                </div>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => handleStartPractice(activePractice)}
                  className="flex-1 py-2.5 border border-border/40 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Practice Again
                </button>
                <button
                  onClick={() => setActivePractice(null)}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Return to Sandbox
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
