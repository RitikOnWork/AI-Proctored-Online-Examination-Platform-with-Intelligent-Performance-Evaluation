import { api } from "./api";

export interface OverviewStat {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}

export interface MonthlyExam {
  month: string;
  conducted: number;
  completed: number;
  cancelled: number;
}

export interface MonthlyStudent {
  month: string;
  registered: number;
  active: number;
}

export interface QuestionTypeDist {
  name: string;
  value: number;
  color: string;
}

export interface ExamCompletion {
  name: string;
  value: number;
  color: string;
}

export interface SubjectWise {
  subject: string;
  exams: number;
}

export interface ProctoringViolation {
  month: string;
  faceMissing: number;
  multipleFaces: number;
  tabSwitch: number;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  action: string;
  actor: string;
  time: string;
  avatar: string;
}

export interface QuestionTypeSummary {
  type: string;
  count: number;
  color: string;
}

export interface QuestionDifficultySummary {
  level: string;
  count: number;
  color: string;
  pct: number;
}

export interface QuestionBankSummaryType {
  total: number;
  byType: QuestionTypeSummary[];
  byDifficulty: QuestionDifficultySummary[];
}

export interface ProctoringStatsSummaryType {
  totalSessions: number;
  suspiciousSessions: number;
  multipleFaceAlerts: number;
  faceMissingAlerts: number;
  tabSwitchEvents: number;
  avgSuspicionScore: number;
}

export interface ResultSummaryType {
  passed: number;
  failed: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  pendingManual: number;
}

export interface StudentTableItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  registered: string;
  status: string;
}

export interface ExaminerTableItem {
  id: string;
  name: string;
  email: string;
  department: string;
  exams: number;
  status: string;
}

export interface PendingEvalTableItem {
  id: string;
  student: string;
  exam: string;
  subject: string;
  submittedAt: string;
  marks: number | null;
}

export interface RecentProctorTableItem {
  id: string;
  student: string;
  exam: string;
  event: string;
  time: string;
  severity: string;
  score: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface DashboardStatsResponse {
  overviewStats: OverviewStat[];
  monthlyExams: MonthlyExam[];
  monthlyStudents: MonthlyStudent[];
  questionTypeDistribution: QuestionTypeDist[];
  examCompletionRate: ExamCompletion[];
  subjectWiseExams: SubjectWise[];
  proctoringViolations: ProctoringViolation[];
  recentActivity: RecentActivityItem[];
  questionBankSummary: QuestionBankSummaryType;
  proctoringStats: ProctoringStatsSummaryType;
  resultSummary: ResultSummaryType;
  recentStudents: StudentTableItem[];
  recentExaminers: ExaminerTableItem[];
  pendingEvaluations: PendingEvalTableItem[];
  recentProctorEvents: RecentProctorTableItem[];
  notifications: NotificationItem[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStatsResponse> => {
    const response = await api.get<DashboardStatsResponse>("/dashboard/stats");
    return response.data;
  },
};

export default dashboardService;
