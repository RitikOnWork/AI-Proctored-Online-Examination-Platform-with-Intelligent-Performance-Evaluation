export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  rollNumber?: string;
  branch?: string;
  semester?: string;
  college?: string;
  avatar?: string;
  streak?: number;
}

export interface ExamSettings {
  enable_camera: boolean;
  enable_microphone: boolean;
  enable_browser_lock: boolean;
  max_tab_switches: number;
  max_face_violations: number;
  shuffle_questions: boolean;
  show_results_immediately: boolean;
  proctoring_enabled: boolean;
  face_detection_enabled: boolean;
  enable_gaze_tracking: boolean;
  suspicion_threshold: number;
  enable_negative_marking: boolean;
}

export interface RealExam {
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
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

export interface RealQuestion {
  id: string;
  subject_id: string;
  title: string;
  question_text: string;
  question_image?: string;
  question_type: "mcq" | "multi_select" | "short_answer" | "long_answer" | "image_upload";
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  negative_marks: number;
  tags?: string[];
  options: QuestionOption[];
}

export interface ExamSessionResult {
  total_score: number;
  percentage: number;
  is_passed: boolean;
  feedback?: string;
}

export interface ExamSession {
  id: string;
  exam_id: string;
  exam_name: string;
  subject: string;
  status: "started" | "submitted" | "abandoned";
  started_at?: string;
  completed_at?: string;
  result?: ExamSessionResult;
}

export interface DashboardStats {
  upcomingExamsCount: number;
  completedExamsCount: number;
  averageScore: number;
  currentRank: number;
  practiceAccuracy: number;
  streakDays: number;
}

export interface PracticeTest {
  id: string;
  name: string;
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  duration: number;
  questions: number;
}

export interface PerformanceAnalyticsData {
  monthlyPerformance: { name: string; score: number }[];
  peerBenchmarking: { exam: string; score: number; avg: number }[];
  accuracyTrend: { week: string; mcq: number; multiselect: number; short: number }[];
  proficiencyBreakdown: { subject: string; value: number; fill: string }[];
  insights: { type: "success" | "warning"; title: string; text: string }[];
}

export interface NotificationItem {
  id: string;
  type: "Exam Scheduled" | "Result Published" | "Reminder" | "Warning" | "Announcement";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface SettingsData {
  emailAlerts: boolean;
  pushAlerts: boolean;
  examReminders: boolean;
  language: string;
  sharingStats: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  college: string;
  badge: "Gold" | "Silver" | "Bronze" | "none";
  isCurrentUser?: boolean;
}
