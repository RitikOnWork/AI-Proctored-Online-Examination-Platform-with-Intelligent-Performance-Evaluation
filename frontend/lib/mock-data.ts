// ============================================================
// MOCK DATA — AI-Proctored Exam Platform Admin Dashboard
// ============================================================

export const overviewStats = [
  { id: "total-students",     label: "Total Students",         value: 2847, change: +12.4, icon: "GraduationCap",   color: "indigo"  },
  { id: "total-examiners",    label: "Total Examiners",        value: 134,  change: +3.7,  icon: "UserCheck",      color: "violet"  },
  { id: "total-exams",        label: "Total Exams",            value: 312,  change: +8.1,  icon: "ClipboardList",  color: "blue"    },
  { id: "active-exams",       label: "Active Exams",           value: 7,    change: +40.0, icon: "Play",           color: "emerald" },
  { id: "question-bank",      label: "Question Bank",          value: 5624, change: +6.2,  icon: "BookOpen",       color: "amber"   },
  { id: "completed-exams",    label: "Completed Exams",        value: 289,  change: +9.4,  icon: "CheckCircle",    color: "teal"    },
  { id: "pending-eval",       label: "Pending Evaluations",    value: 43,   change: -15.2, icon: "Clock",          color: "orange"  },
  { id: "suspicious-sessions",label: "Suspicious Sessions",    value: 19,   change: +26.3, icon: "AlertTriangle",  color: "red"     },
];

export const monthlyExams = [
  { month: "Jan", conducted: 18, completed: 15, cancelled: 3 },
  { month: "Feb", conducted: 24, completed: 20, cancelled: 4 },
  { month: "Mar", conducted: 30, completed: 27, cancelled: 3 },
  { month: "Apr", conducted: 22, completed: 18, cancelled: 4 },
  { month: "May", conducted: 35, completed: 31, cancelled: 4 },
  { month: "Jun", conducted: 42, completed: 38, cancelled: 4 },
  { month: "Jul", conducted: 28, completed: 24, cancelled: 4 },
  { month: "Aug", conducted: 38, completed: 34, cancelled: 4 },
  { month: "Sep", conducted: 45, completed: 41, cancelled: 4 },
  { month: "Oct", conducted: 52, completed: 46, cancelled: 6 },
  { month: "Nov", conducted: 48, completed: 43, cancelled: 5 },
  { month: "Dec", conducted: 31, completed: 28, cancelled: 3 },
];

export const monthlyStudents = [
  { month: "Jan", registered: 120, active: 98  },
  { month: "Feb", registered: 145, active: 130 },
  { month: "Mar", registered: 210, active: 185 },
  { month: "Apr", registered: 178, active: 162 },
  { month: "May", registered: 265, active: 240 },
  { month: "Jun", registered: 320, active: 295 },
  { month: "Jul", registered: 280, active: 255 },
  { month: "Aug", registered: 350, active: 325 },
  { month: "Sep", registered: 290, active: 270 },
  { month: "Oct", registered: 410, active: 385 },
  { month: "Nov", registered: 375, active: 350 },
  { month: "Dec", registered: 230, active: 215 },
];

export const questionTypeDistribution = [
  { name: "MCQ",          value: 2140, color: "#6366f1" },
  { name: "Multi Select", value: 890,  color: "#8b5cf6" },
  { name: "Short Answer", value: 1240, color: "#14b8a6" },
  { name: "Long Answer",  value: 780,  color: "#f59e0b" },
  { name: "Image Upload", value: 574,  color: "#f43f5e" },
];

export const examCompletionRate = [
  { name: "Completed", value: 289, color: "#14b8a6" },
  { name: "In Progress", value: 7,  color: "#6366f1" },
  { name: "Cancelled",  value: 16, color: "#f43f5e" },
];

export const subjectWiseExams = [
  { subject: "Mathematics",    exams: 68 },
  { subject: "Physics",        exams: 54 },
  { subject: "Chemistry",      exams: 47 },
  { subject: "Biology",        exams: 39 },
  { subject: "Computer Sci.",  exams: 62 },
  { subject: "English",        exams: 31 },
  { subject: "History",        exams: 11 },
];

export const proctoringViolations = [
  { month: "Jan", faceMissing: 12, multipleFaces: 5, tabSwitch: 20 },
  { month: "Feb", faceMissing: 15, multipleFaces: 8, tabSwitch: 28 },
  { month: "Mar", faceMissing: 22, multipleFaces: 11, tabSwitch: 35 },
  { month: "Apr", faceMissing: 18, multipleFaces: 6,  tabSwitch: 30 },
  { month: "May", faceMissing: 25, multipleFaces: 14, tabSwitch: 42 },
  { month: "Jun", faceMissing: 30, multipleFaces: 18, tabSwitch: 50 },
];

export const recentActivity = [
  { id: "a1", type: "student",   action: "New student registered",          actor: "Priya Sharma",    time: "2 minutes ago",  avatar: "PS" },
  { id: "a2", type: "exam",      action: "Exam published",                   actor: "Advanced Maths",  time: "18 minutes ago", avatar: "AM" },
  { id: "a3", type: "question",  action: "50 questions added to bank",       actor: "Dr. Kumar",       time: "45 minutes ago", avatar: "DK" },
  { id: "a4", type: "examiner",  action: "New examiner added",               actor: "Prof. Mehta",     time: "1 hour ago",     avatar: "PM" },
  { id: "a5", type: "result",    action: "Results published",                actor: "Physics Final",   time: "3 hours ago",    avatar: "PF" },
  { id: "a6", type: "proctor",   action: "Suspicious activity flagged",      actor: "Session #4521",   time: "4 hours ago",    avatar: "S4" },
  { id: "a7", type: "student",   action: "New student registered",           actor: "Rahul Verma",     time: "6 hours ago",    avatar: "RV" },
  { id: "a8", type: "exam",      action: "Exam created",                     actor: "Chemistry Quiz",  time: "8 hours ago",    avatar: "CQ" },
];

export const upcomingExams = [
  { id: "e1", name: "Physics Final Examination",  subject: "Physics",    duration: 180, students: 342, status: "upcoming",   date: "2026-07-10 09:00" },
  { id: "e2", name: "Advanced Mathematics",        subject: "Math",       duration: 120, students: 215, status: "upcoming",   date: "2026-07-11 11:00" },
  { id: "e3", name: "Computer Science Practical",  subject: "CS",         duration: 90,  students: 178, status: "upcoming",   date: "2026-07-12 14:00" },
];

export const liveExams = [
  { id: "e4", name: "Chemistry Mid-Term",          subject: "Chemistry",  duration: 90,  students: 186, status: "live",       date: "2026-07-06 09:00" },
  { id: "e5", name: "English Literature Test",     subject: "English",    duration: 60,  students: 94,  status: "live",       date: "2026-07-06 10:30" },
  { id: "e6", name: "Biology Practical Exam",      subject: "Biology",    duration: 120, students: 205, status: "live",       date: "2026-07-06 11:00" },
];

export const completedExams = [
  { id: "e7", name: "History Ancient Period",      subject: "History",    duration: 60,  students: 87,  status: "completed",  date: "2026-07-04 09:00" },
  { id: "e8", name: "Physics Unit Test 2",         subject: "Physics",    duration: 45,  students: 154, status: "completed",  date: "2026-07-03 14:00" },
  { id: "e9", name: "Maths Algebra Quiz",          subject: "Math",       duration: 30,  students: 198, status: "completed",  date: "2026-07-02 10:00" },
];

export const cancelledExams = [
  { id: "e10", name: "Geography Unit 3",           subject: "Geography",  duration: 60,  students: 65,  status: "cancelled",  date: "2026-07-01 09:00" },
];

export const questionBankSummary = {
  total: 5624,
  byType: [
    { type: "MCQ",          count: 2140, color: "#6366f1" },
    { type: "Multi Select", count: 890,  color: "#8b5cf6" },
    { type: "Short Answer", count: 1240, color: "#14b8a6" },
    { type: "Long Answer",  count: 780,  color: "#f59e0b" },
    { type: "Image Upload", count: 574,  color: "#f43f5e" },
  ],
  byDifficulty: [
    { level: "Easy",   count: 2100, color: "#14b8a6", pct: 37 },
    { level: "Medium", count: 2300, color: "#f59e0b", pct: 41 },
    { level: "Hard",   count: 1224, color: "#f43f5e", pct: 22 },
  ],
};

export const proctoringStats = {
  totalSessions: 312,
  suspiciousSessions: 19,
  multipleFaceAlerts: 47,
  faceMissingAlerts: 83,
  tabSwitchEvents: 215,
  avgSuspicionScore: 14.2,
};

export const resultSummary = {
  passed: 231,
  failed: 58,
  avgScore: 71.4,
  highestScore: 98.5,
  lowestScore: 12.0,
  pendingManual: 43,
};

export const recentStudents = [
  { id: "s1",  name: "Priya Sharma",    email: "priya@example.com",   subject: "Physics",   registered: "2026-07-05", status: "active"   },
  { id: "s2",  name: "Rahul Verma",     email: "rahul@example.com",   subject: "Chemistry", registered: "2026-07-04", status: "active"   },
  { id: "s3",  name: "Ananya Singh",    email: "ananya@example.com",  subject: "Math",      registered: "2026-07-04", status: "active"   },
  { id: "s4",  name: "Vikram Nair",     email: "vikram@example.com",  subject: "Biology",   registered: "2026-07-03", status: "inactive" },
  { id: "s5",  name: "Sneha Pillai",    email: "sneha@example.com",   subject: "CS",        registered: "2026-07-02", status: "active"   },
  { id: "s6",  name: "Arjun Kumar",     email: "arjun@example.com",   subject: "English",   registered: "2026-07-01", status: "active"   },
  { id: "s7",  name: "Deepika Patel",   email: "deepika@example.com", subject: "Math",      registered: "2026-06-30", status: "suspended"},
  { id: "s8",  name: "Suresh Reddy",    email: "suresh@example.com",  subject: "Physics",   registered: "2026-06-29", status: "active"   },
];

export const recentExaminers = [
  { id: "ex1", name: "Dr. Rajesh Kumar",   email: "rkumar@example.com",  department: "Physics",   exams: 24, status: "active" },
  { id: "ex2", name: "Prof. Anita Mehta",  email: "amehta@example.com",  department: "Chemistry", exams: 18, status: "active" },
  { id: "ex3", name: "Dr. Sunil Joshi",    email: "sjoshi@example.com",  department: "Math",      exams: 31, status: "active" },
  { id: "ex4", name: "Prof. Riya Bansal",  email: "rbansal@example.com", department: "CS",        exams: 15, status: "inactive"},
  { id: "ex5", name: "Dr. Mohan Gupta",    email: "mgupta@example.com",  department: "Biology",   exams: 22, status: "active" },
];

export const pendingEvaluations = [
  { id: "pe1", student: "Rahul Verma",   exam: "Advanced Maths",       subject: "Math",     submittedAt: "2026-07-05 14:30", marks: 85 },
  { id: "pe2", student: "Priya Sharma",  exam: "Physics Final",        subject: "Physics",  submittedAt: "2026-07-05 12:00", marks: null },
  { id: "pe3", student: "Ananya Singh",  exam: "Chemistry Long Ans.",  subject: "Chemistry",submittedAt: "2026-07-04 16:45", marks: null },
  { id: "pe4", student: "Vikram Nair",   exam: "Biology Practical",    subject: "Biology",  submittedAt: "2026-07-04 10:15", marks: null },
  { id: "pe5", student: "Sneha Pillai",  exam: "CS Project Eval",      subject: "CS",       submittedAt: "2026-07-03 09:00", marks: null },
];

export const recentProctorEvents = [
  { id: "pr1", student: "Ananya Singh",  exam: "Physics Final",   event: "Multiple Faces",  time: "2026-07-06 09:12", severity: "high",   score: 78 },
  { id: "pr2", student: "Vikram Nair",   exam: "Maths Test",      event: "Tab Switch",      time: "2026-07-06 09:34", severity: "medium", score: 42 },
  { id: "pr3", student: "Deepika Patel", exam: "Chemistry Quiz",  event: "Face Missing",    time: "2026-07-05 14:22", severity: "high",   score: 85 },
  { id: "pr4", student: "Suresh Reddy",  exam: "Biology Mid",     event: "Tab Switch",      time: "2026-07-05 11:08", severity: "low",    score: 15 },
  { id: "pr5", student: "Priya Sharma",  exam: "CS Practical",    event: "Multiple Faces",  time: "2026-07-04 15:40", severity: "medium", score: 55 },
];

export const notifications = [
  { id: "n1", type: "exam",    title: "New Exam Published",        message: "Advanced Maths exam published by Dr. Kumar",     time: "2m ago",  read: false },
  { id: "n2", type: "alert",   title: "Exam Ending Soon",          message: "Chemistry Mid-Term ends in 30 minutes",          time: "10m ago", read: false },
  { id: "n3", type: "eval",    title: "Manual Evaluation Pending", message: "43 answers awaiting manual evaluation",          time: "1h ago",  read: false },
  { id: "n4", type: "student", title: "New Student Registered",    message: "Priya Sharma registered in Physics course",      time: "2h ago",  read: true  },
  { id: "n5", type: "system",  title: "System Alert",              message: "Server load at 87% — consider scaling",         time: "3h ago",  read: true  },
  { id: "n6", type: "proctor", title: "Suspicious Session",        message: "Session #4521 flagged — multiple face alerts",   time: "4h ago",  read: true  },
];
