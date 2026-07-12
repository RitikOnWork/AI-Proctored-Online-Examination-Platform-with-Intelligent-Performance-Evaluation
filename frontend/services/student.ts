import { api } from "./api";
import {
  StudentProfile,
  RealExam,
  RealQuestion,
  ExamSession,
  DashboardStats,
  PracticeTest,
  PerformanceAnalyticsData,
  NotificationItem,
  SettingsData,
} from "../types/student";

export const studentService = {
  // 1. Get student profile details
  async getProfile(): Promise<StudentProfile> {
    const response = await api.get<StudentProfile>("/auth/me");
    return response.data;
  },

  // 2. Fetch list of published exams
  async getUpcomingExams(params?: {
    skip?: number;
    limit?: number;
    subject_id?: string;
    is_published?: boolean;
  }): Promise<RealExam[]> {
    const response = await api.get<RealExam[]>("/exams", { params });
    return response.data;
  },

  // 3. Fetch specific exam details
  async getExamDetails(examId: string): Promise<RealExam> {
    const response = await api.get<RealExam>(`/exams/${examId}`);
    return response.data;
  },

  // 4. Enter exam and generate a short-lived exam access token
  async enterExam(examId: string): Promise<{ exam_token: string; token_type: string; expires_in_seconds: number }> {
    const response = await api.post<{ exam_token: string; token_type: string; expires_in_seconds: number }>(
      `/exams/${examId}/enter`
    );
    return response.data;
  },

  // 5. Retrieve exam paper questions with short lived token validation
  async getExamPaper(examId: string, examToken: string): Promise<RealQuestion[]> {
    const response = await api.get<RealQuestion[]>(`/exams/${examId}/paper`, {
      headers: {
        "X-Exam-Token": examToken,
      },
    });
    return response.data;
  },

  // 6. Submit exam answers
  async submitExam(
    examId: string,
    answers: Record<string, any>
  ): Promise<{
    session_id: string;
    total_score: number;
    max_score: number;
    percentage: number;
    is_passed: boolean;
    feedback: string;
  }> {
    const response = await api.post<{
      session_id: string;
      total_score: number;
      max_score: number;
      percentage: number;
      is_passed: boolean;
      feedback: string;
    }>(`/exams/${examId}/submit`, { answers });
    return response.data;
  },

  // 7. Get completed candidate exam sessions
  async getExamSessions(): Promise<ExamSession[]> {
    const response = await api.get<ExamSession[]>("/exams/sessions/me");
    return response.data;
  },

  // 8. Log a proctor event (tab switch, face violations)
  async logProctorEvent(
    sessionId: string,
    payload: { event_type: string; confidence: number; details: string }
  ): Promise<{ status: string }> {
    const response = await api.post<{ status: string }>(`/exams/sessions/${sessionId}/proctor-event`, payload);
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Placeholder endpoints with robust developer fallbacks for missing API routes
  // ─────────────────────────────────────────────────────────────────────────────

  // 9. Fetch dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<DashboardStats>("/student/dashboard/stats");
      return response.data;
    } catch (err) {
      console.warn("Route '/student/dashboard/stats' not found on backend. Using fallback.");
      return {
        upcomingExamsCount: 2,
        completedExamsCount: 12,
        averageScore: 84.2,
        currentRank: 42,
        practiceAccuracy: 91.8,
        streakDays: 5,
      };
    }
  },

  // 10. Fetch practice tests list
  async getPracticeTests(): Promise<PracticeTest[]> {
    try {
      const response = await api.get<PracticeTest[]>("/student/practice");
      return response.data;
    } catch (err) {
      console.warn("Route '/student/practice' not found on backend. Using fallback.");
      return [
        { id: "p1", name: "SQL Queries Masterclass", subject: "Database Management Systems", difficulty: "Medium", topic: "Joins & Subqueries", duration: 30, questions: 15 },
        { id: "p2", name: "Dynamic Programming Challenge", subject: "Data Structures & Algorithms", difficulty: "Hard", topic: "Recursion & Memoization", duration: 45, questions: 10 },
        { id: "p3", name: "Linear Algebra Fundamentals", subject: "Mathematics", difficulty: "Easy", topic: "Matrices & Determinants", duration: 20, questions: 20 },
        { id: "p4", name: "TCP/IP Protocol Suite Quiz", subject: "Computer Science", difficulty: "Medium", topic: "Transport Layer protocols", duration: 25, questions: 15 },
        { id: "p5", name: "OOP Principles Test", subject: "Data Structures & Algorithms", difficulty: "Easy", topic: "Classes & Inheritance", duration: 15, questions: 12 },
        { id: "p6", name: "NoSQL DB Architectures", subject: "Database Management Systems", difficulty: "Hard", topic: "MongoDB & Sharding", duration: 40, questions: 20 },
      ];
    }
  },

  // 11. Fetch performance analytics data
  async getPerformanceAnalytics(): Promise<PerformanceAnalyticsData> {
    try {
      const response = await api.get<PerformanceAnalyticsData>("/student/performance/analytics");
      return response.data;
    } catch (err) {
      console.warn("Route '/student/performance/analytics' not found on backend. Using fallback.");
      return {
        monthlyPerformance: [
          { name: "Feb", score: 72 },
          { name: "Mar", score: 78 },
          { name: "Apr", score: 74 },
          { name: "May", score: 81 },
          { name: "Jun", score: 80 },
          { name: "Jul", score: 84 },
        ],
        peerBenchmarking: [
          { exam: "DBMS Quiz", score: 85, avg: 74 },
          { exam: "DS Pract.", score: 82, avg: 70 },
          { exam: "OS Final", score: 41, avg: 62 },
          { exam: "Discr. Math", score: 91, avg: 78 },
          { exam: "SQL Prac.", score: 95, avg: 81 },
        ],
        accuracyTrend: [
          { week: "Wk 1", mcq: 85, multiselect: 70, short: 78 },
          { week: "Wk 2", mcq: 88, multiselect: 72, short: 80 },
          { week: "Wk 3", mcq: 90, multiselect: 78, short: 83 },
          { week: "Wk 4", mcq: 92, multiselect: 84, short: 85 },
        ],
        proficiencyBreakdown: [
          { subject: "Algorithms", value: 92, fill: "#10b981" },
          { subject: "Web Dev", value: 88, fill: "#34d399" },
          { subject: "Maths", value: 84, fill: "#60a5fa" },
          { subject: "Networks", value: 75, fill: "#fbbf24" },
          { subject: "Database Norm.", value: 62, fill: "#f87171" },
          { subject: "OS Kernel sync", value: 41, fill: "#ef4444" },
        ],
        insights: [
          { type: "success", title: "High Algorithms Proficiency", text: "Your performance in Data Structures & Analysis of Algorithms places you in the top 9th percentile of students. Recursion and array problems have a 94.2% accuracy rate." },
          { type: "warning", title: "Database Normalization Deficiency", text: "You frequently fail to identify 3NF vs BCNF transitive attributes. The system recommends doing a Practice Sandbox session focusing on database design." }
        ]
      };
    }
  },

  // 12. Fetch notifications list
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get<NotificationItem[]>("/student/notifications");
      return response.data;
    } catch (err) {
      console.warn("Route '/student/notifications' not found on backend. Using fallback.");
      return [
        { id: "n1", type: "Reminder", title: "Database Systems Live Now", message: "Your Database Systems End-Sem exam is live. Click 'Start Exam' immediately to avoid disqualification.", time: "Just now", read: false },
        { id: "n2", type: "Result Published", title: "Discrete Math Results Out", message: "Professor Rajesh Kumar published results for the Discrete Mathematics Exam. Your score: 68/75.", time: "2 hours ago", read: false },
        { id: "n3", type: "Exam Scheduled", title: "Algorithms Quiz Scheduled", message: "A new quiz 'Analysis of Algorithms' is scheduled for 2026-07-15 at 02:30 PM.", time: "1 day ago", read: true },
        { id: "n4", type: "Warning", title: "Webcam Integrity Warning", message: "During your last practice attempt, the AI flagged 'Face Not Centered'. Make sure your room is well lit.", time: "2 days ago", read: true },
        { id: "n5", type: "Announcement", title: "System Maintenance Completed", message: "ProctorAI portal completed cloud migrations. Proctored sessions will run with reduced latency.", time: "5 days ago", read: true },
      ];
    }
  },

  // 13. Update profile information
  async updateProfile(data: { full_name: string; email: string }): Promise<StudentProfile> {
    const response = await api.patch<StudentProfile>("/auth/profile/update", data);
    return response.data;
  },

  // 14. Update settings configurations
  async updateSettings(data: SettingsData): Promise<SettingsData> {
    const response = await api.post<SettingsData>("/student/settings", data);
    return response.data;
  },

  // 15. Change password
  async changePassword(passwordData: any): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/auth/password/change", passwordData);
    return response.data;
  }
};
