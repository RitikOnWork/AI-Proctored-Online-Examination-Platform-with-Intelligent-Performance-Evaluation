import { api } from "./api";

export interface OverviewStat {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}

export interface CompletionRateItem {
  name: string;
  value: number;
  color: string;
}

export interface QuestionsMonthItem {
  month: string;
  count: number;
}

export interface AverageScoreItem {
  subject: string;
  score: number;
}

export interface DifficultyDistItem {
  level: string;
  value: number;
  color: string;
}

export interface AiGradingAccuracyItem {
  month: string;
  accuracy: number;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  desc: string;
  time: string;
}

export interface UpcomingExamItem {
  id: string;
  exam: string;
  subject: string;
  start_time: string;
  duration: number;
  students: number;
  status: string;
}

export interface ExaminerStatsResponse {
  overviewStats: OverviewStat[];
  completionRate: CompletionRateItem[];
  questionsCreatedMonth: QuestionsMonthItem[];
  averageScores: AverageScoreItem[];
  difficultyDistribution: DifficultyDistItem[];
  aiGradingAccuracy: AiGradingAccuracyItem[];
  recentActivity: RecentActivityItem[];
  upcomingExams: UpcomingExamItem[];
}

export interface GradingQueueItem {
  session_id: string;
  student_name: string;
  student_email: string;
  exam_title: string;
  question_count: number;
  ai_score: number;
  confidence: number;
  status: string;
  submitted_at: string;
}

export interface GradingSessionQuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface AiGradingDetails {
  score: number;
  explanation: string;
  matched_keywords: string[];
  missing_keywords: string[];
  rubric_checklist: { item: string; checked: boolean }[];
}

export interface GradingSessionAnswer {
  answer_id: string;
  question_id: string;
  question_title: string;
  question_text: string;
  question_type: string;
  expected_answer: string;
  explanation: string;
  max_marks: number;
  options: GradingSessionQuestionOption[];
  student_answer: string;
  score_obtained: number;
  is_graded: boolean;
  ai_grading: AiGradingDetails;
  ocr_output: string | null;
}

export interface GradingSessionResponse {
  session_id: string;
  student_name: string;
  student_email: string;
  exam_title: string;
  answers: GradingSessionAnswer[];
}

export interface ProctorEventItem {
  id: string;
  event_type: string;
  timestamp: string;
  confidence: number;
  details: string;
  severity: string;
  snapshot_url: string;
}

export interface ResultItem {
  id: string;
  student_name: string;
  student_email: string;
  exam_title: string;
  objective_score: number;
  subjective_score: number;
  total_score: number;
  percentage: number;
  is_passed: boolean;
  status: string;
}

export interface StudentListItem {
  id: string;
  name: string;
  email: string;
  status: string;
  attempts: number;
  violations: number;
  avg_time: string;
  strong_topics: string[];
  weak_topics: string[];
  performance_trend: number[];
}

export interface AnalyticsResponse {
  difficulty: { name: string; count: number }[];
  subjectPerformance: { subject: string; participation: number; average: number }[];
  reviewerConsistency: { name: string; deviation: number }[];
  accuracy: number;
  heatmap: { day: string; hour: string; submissions: number }[];
}

export const examinerService = {
  getStats: async (): Promise<ExaminerStatsResponse> => {
    const response = await api.get<ExaminerStatsResponse>("/examiner/stats");
    return response.data;
  },

  getGradingQueue: async (): Promise<GradingQueueItem[]> => {
    const response = await api.get<GradingQueueItem[]>("/examiner/grading/queue");
    return response.data;
  },

  getGradingSession: async (sessionId: string): Promise<GradingSessionResponse> => {
    const response = await api.get<GradingSessionResponse>(`/examiner/grading/session/${sessionId}`);
    return response.data;
  },

  submitSessionGrade: async (sessionId: string, grades: { answer_id: string; score: number }[], generalFeedback?: string) => {
    const response = await api.post(`/examiner/grading/session/${sessionId}/grade`, {
      grades,
      general_feedback: generalFeedback
    });
    return response.data;
  },

  getProctoringEvents: async (sessionId: string): Promise<ProctorEventItem[]> => {
    const response = await api.get<ProctorEventItem[]>(`/examiner/proctoring/events/${sessionId}`);
    return response.data;
  },

  submitProctorDecision: async (sessionId: string, decision: string, notes: string) => {
    const response = await api.post(`/examiner/proctoring/session/${sessionId}/decision`, {
      decision,
      notes
    });
    return response.data;
  },

  getResults: async (): Promise<ResultItem[]> => {
    const response = await api.get<ResultItem[]>("/examiner/results");
    return response.data;
  },

  getStudents: async (): Promise<StudentListItem[]> => {
    const response = await api.get<StudentListItem[]>("/examiner/students");
    return response.data;
  },

  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const response = await api.get<AnalyticsResponse>("/examiner/analytics");
    return response.data;
  }
};

export default examinerService;
