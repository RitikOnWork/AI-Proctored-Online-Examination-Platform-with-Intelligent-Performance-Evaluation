export interface StudentProfile {
  name: string;
  email: string;
  rollNumber: string;
  branch: string;
  semester: string;
  college: string;
  avatar: string;
  streak: number;
}

export interface ExamStat {
  label: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
  graphData: { val: number }[];
}

export interface UpcomingExam {
  id: string;
  name: string;
  subject: string;
  examiner: string;
  date: string;
  time: string;
  duration: number; // in minutes
  questionCount: number;
  status: "Upcoming" | "Live" | "Completed" | "Missed";
  rules: string[];
  maxMarks: number;
  negativeMarking: boolean;
  attemptsAllowed: number;
  cameraRequired: boolean;
  micRequired: boolean;
  internetRequirement: string;
  instructions: string[];
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

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  college: string;
  badge: "Gold" | "Silver" | "Bronze" | "none";
  isCurrentUser?: boolean;
}

export interface ExamHistoryItem {
  id: string;
  name: string;
  subject: string;
  attemptDate: string;
  score: number;
  totalMarks: number;
  durationUsed: number; // in minutes
  result: "Pass" | "Fail";
  percentile: number;
  rank: number;
  feedback: string;
}

export interface NotificationItem {
  id: string;
  type: "Exam Scheduled" | "Result Published" | "Reminder" | "Warning" | "Announcement";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const mockProfile: StudentProfile = {
  name: "Ritik 👋",
  email: "ritik@example.com",
  rollNumber: "INF/2023/1842",
  branch: "Computer Science & Engineering",
  semester: "6th Semester",
  college: "Infosys Springboard Institute",
  avatar: "R",
  streak: 5,
};

export const mockStats: ExamStat[] = [
  {
    label: "Upcoming Exams",
    value: 2,
    change: 0,
    icon: "Calendar",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    graphData: [{ val: 1 }, { val: 2 }, { val: 2 }, { val: 1 }, { val: 2 }],
  },
  {
    label: "Exams Completed",
    value: 12,
    change: 8.3,
    icon: "CheckCircle",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    graphData: [{ val: 9 }, { val: 10 }, { val: 11 }, { val: 11 }, { val: 12 }],
  },
  {
    label: "Average Score",
    value: "84.2%",
    change: 2.1,
    icon: "Award",
    color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    graphData: [{ val: 81 }, { val: 82 }, { val: 81 }, { val: 83 }, { val: 84 }],
  },
  {
    label: "Current Rank",
    value: "#42",
    change: 12.5,
    icon: "TrendingUp",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    graphData: [{ val: 56 }, { val: 51 }, { val: 48 }, { val: 45 }, { val: 42 }],
  },
  {
    label: "Practice Accuracy",
    value: "91.8%",
    change: 1.4,
    icon: "Target",
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    graphData: [{ val: 89 }, { val: 90 }, { val: 90 }, { val: 91 }, { val: 92 }],
  },
  {
    label: "Certificates",
    value: 4,
    change: 33.3,
    icon: "ShieldAlert",
    color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
    graphData: [{ val: 2 }, { val: 3 }, { val: 3 }, { val: 3 }, { val: 4 }],
  },
];

export const mockUpcomingExams: UpcomingExam[] = [
  {
    id: "exam-db",
    name: "Database Systems End-Sem",
    subject: "Database Management Systems",
    examiner: "Prof. Anita Mehta",
    date: "2026-07-12",
    time: "10:00 AM",
    duration: 120,
    questionCount: 50,
    status: "Live",
    rules: [
      "Keep your face centered and visible to the webcam at all times.",
      "Switching browser tabs or applications will trigger a severe violation.",
      "Do not look away from the monitor screen for more than 5 consecutive seconds.",
      "Ensure there is no noise or speaking in your room during the examination.",
      "No secondary devices (mobile, tablets, books) are allowed in the workspace.",
    ],
    maxMarks: 100,
    negativeMarking: true,
    attemptsAllowed: 1,
    cameraRequired: true,
    micRequired: true,
    internetRequirement: "Min 2 Mbps download & upload, low latency connection",
    instructions: [
      "Verify your photo ID card when prompted during identity validation.",
      "Once you start the examination, you cannot pause or close the window.",
      "Submit the paper before the timer expires. Autocommit will submit active responses if timer runs out.",
      "For short answer responses, specify answers concisely. Long answers support detailed paragraph typing.",
    ],
  },
  {
    id: "exam-algo",
    name: "Analysis of Algorithms Quiz",
    subject: "Data Structures & Algorithms",
    examiner: "Dr. Sunil Joshi",
    date: "2026-07-15",
    time: "02:30 PM",
    duration: 60,
    questionCount: 30,
    status: "Upcoming",
    rules: [
      "Standard proctoring is enabled. Webcam monitoring is mandatory.",
      "Tab locks will monitor exit events.",
    ],
    maxMarks: 50,
    negativeMarking: false,
    attemptsAllowed: 1,
    cameraRequired: true,
    micRequired: false,
    internetRequirement: "Standard internet connection required",
    instructions: [
      "This is a randomized MCQ test paper.",
      "Ensure you have a blank sheet of paper and a pen for rough work.",
    ],
  },
  {
    id: "exam-math",
    name: "Discrete Mathematics Exam",
    subject: "Mathematics",
    examiner: "Dr. Rajesh Kumar",
    date: "2026-07-08",
    time: "09:00 AM",
    duration: 90,
    questionCount: 25,
    status: "Completed",
    rules: [],
    maxMarks: 75,
    negativeMarking: false,
    attemptsAllowed: 1,
    cameraRequired: true,
    micRequired: true,
    internetRequirement: "Stable connection",
    instructions: [],
  },
  {
    id: "exam-cn",
    name: "Computer Networks Mid-Term",
    subject: "Computer Science",
    examiner: "Prof. Riya Bansal",
    date: "2026-07-05",
    time: "11:00 AM",
    duration: 90,
    questionCount: 40,
    status: "Missed",
    rules: [],
    maxMarks: 100,
    negativeMarking: true,
    attemptsAllowed: 1,
    cameraRequired: true,
    micRequired: true,
    internetRequirement: "Stable connection",
    instructions: [],
  },
];

export const mockPracticeTests: PracticeTest[] = [
  { id: "p1", name: "SQL Queries Masterclass", subject: "Database Management Systems", difficulty: "Medium", topic: "Joins & Subqueries", duration: 30, questions: 15 },
  { id: "p2", name: "Dynamic Programming Challenge", subject: "Data Structures & Algorithms", difficulty: "Hard", topic: "Recursion & Memoization", duration: 45, questions: 10 },
  { id: "p3", name: "Linear Algebra Fundamentals", subject: "Mathematics", difficulty: "Easy", topic: "Matrices & Determinants", duration: 20, questions: 20 },
  { id: "p4", name: "TCP/IP Protocol Suite Quiz", subject: "Computer Science", difficulty: "Medium", topic: "Transport Layer protocols", duration: 25, questions: 15 },
  { id: "p5", name: "OOP Principles Test", subject: "Data Structures & Algorithms", difficulty: "Easy", topic: "Classes & Inheritance", duration: 15, questions: 12 },
  { id: "p6", name: "NoSQL DB Architectures", subject: "Database Management Systems", difficulty: "Hard", topic: "MongoDB & Sharding", duration: 40, questions: 20 },
];

export const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Ananya Singh", score: 984, college: "Infosys Springboard Institute", badge: "Gold" },
  { rank: 2, name: "Suresh Reddy", score: 968, college: "Infosys Springboard Institute", badge: "Silver" },
  { rank: 3, name: "Priya Sharma", score: 955, college: "IIT Bombay", badge: "Bronze" },
  { rank: 4, name: "Sneha Pillai", score: 932, college: "BITS Pilani", badge: "none" },
  { rank: 5, name: "Rahul Verma", score: 918, college: "Infosys Springboard Institute", badge: "none" },
  { rank: 42, name: "Ritik (You)", score: 842, college: "Infosys Springboard Institute", badge: "none", isCurrentUser: true },
  { rank: 43, name: "Arjun Kumar", score: 838, college: "DTU Delhi", badge: "none" },
  { rank: 44, name: "Vikram Nair", score: 825, college: "Infosys Springboard Institute", badge: "none" },
];

export const mockExamHistory: ExamHistoryItem[] = [
  {
    id: "hist-math",
    name: "Discrete Mathematics Exam",
    subject: "Mathematics",
    attemptDate: "2026-07-08",
    score: 68,
    totalMarks: 75,
    durationUsed: 78,
    result: "Pass",
    percentile: 92.4,
    rank: 18,
    feedback: "Exceptional logic in set theory and combinations. Double-check graph isomorphism steps.",
  },
  {
    id: "hist-ds",
    name: "Data Structures Practical",
    subject: "Data Structures & Algorithms",
    attemptDate: "2026-06-25",
    score: 82,
    totalMarks: 100,
    durationUsed: 52,
    result: "Pass",
    percentile: 88.1,
    rank: 35,
    feedback: "Tree traversal codes are solid. Optimize heap sorting space complexities.",
  },
  {
    id: "hist-os",
    name: "Operating Systems Final",
    subject: "Computer Science",
    attemptDate: "2026-06-12",
    score: 41,
    totalMarks: 100,
    durationUsed: 88,
    result: "Fail",
    percentile: 45.2,
    rank: 124,
    feedback: "Deadlock prevention algorithms and semaphore syncing need serious revisions.",
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "Reminder",
    title: "Database Systems Live Now",
    message: "Your Database Systems End-Sem exam is live. Click 'Start Exam' immediately to avoid disqualification.",
    time: "Just now",
    read: false,
  },
  {
    id: "n2",
    type: "Result Published",
    title: "Discrete Math Results Out",
    message: "Professor Rajesh Kumar published results for the Discrete Mathematics Exam. Your score: 68/75.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n3",
    type: "Exam Scheduled",
    title: "Algorithms Quiz Scheduled",
    message: "A new quiz 'Analysis of Algorithms' is scheduled for 2026-07-15 at 02:30 PM.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "n4",
    type: "Warning",
    title: "Webcam Integrity Warning",
    message: "During your last practice attempt, the AI flagged 'Face Not Centered'. Make sure your room is well lit.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n5",
    type: "Announcement",
    title: "System Maintenance Completed",
    message: "ProctorAI portal completed cloud migrations. Proctored sessions will run with reduced latency.",
    time: "5 days ago",
    read: true,
  },
];

export const mockQuestionsForActiveExam = [
  {
    id: "q1",
    question_type: "MCQ",
    question_text: "Which of the following database normal forms guarantees no insertion, deletion, or update anomalies, and is based on functional dependencies?",
    title: "Database Normalization Form",
    marks: 2,
    options: [
      { id: "o1", option_text: "First Normal Form (1NF)" },
      { id: "o2", option_text: "Second Normal Form (2NF)" },
      { id: "o3", option_text: "Third Normal Form (3NF)" },
      { id: "o4", option_text: "Boyce-Codd Normal Form (BCNF)" },
    ],
  },
  {
    id: "q2",
    question_type: "Multi Select",
    question_text: "Select all relational database systems that support async replication protocols natively: (Select all that apply)",
    title: "Relational DB Architectures",
    marks: 4,
    options: [
      { id: "o2_1", option_text: "PostgreSQL" },
      { id: "o2_2", option_text: "MySQL" },
      { id: "o2_3", option_text: "SQLite" },
      { id: "o2_4", option_text: "Oracle Database" },
    ],
  },
  {
    id: "q3",
    question_type: "Short Answer",
    question_text: "State the acronym for the properties that guarantee database transactions are processed reliably.",
    title: "Transaction Reliability Acronym",
    marks: 2,
  },
  {
    id: "q4",
    question_type: "Long Answer",
    question_text: "Explain the difference between a Clustered Index and a Non-Clustered Index. Provide examples showing how each impacts lookups vs inserts.",
    title: "Database Indexing Principles",
    marks: 8,
  },
  {
    id: "q5",
    question_type: "Image Upload",
    question_text: "Draw the ER diagram showing a 1-to-many relationship between Students and ExamEnrollments. Upload a snapshot of your drawing.",
    title: "ER Diagram Drawing",
    marks: 6,
  },
];

export const analyticsMonthlyPerformance = [
  { name: "Feb", score: 72 },
  { name: "Mar", score: 78 },
  { name: "Apr", score: 74 },
  { name: "May", score: 81 },
  { name: "Jun", score: 80 },
  { name: "Jul", score: 84 },
];

export const analyticsExamTrend = [
  { exam: "DBMS Quiz", score: 85, avg: 74 },
  { exam: "DS Pract.", score: 82, avg: 70 },
  { exam: "OS Final", score: 41, avg: 62 },
  { exam: "Discr. Math", score: 91, avg: 78 },
  { exam: "SQL Prac.", score: 95, avg: 81 },
];

export const analyticsAccuracyTrend = [
  { week: "Wk 1", mcq: 85, multiselect: 70, short: 78 },
  { week: "Wk 2", mcq: 88, multiselect: 72, short: 80 },
  { week: "Wk 3", mcq: 90, multiselect: 78, short: 83 },
  { week: "Wk 4", mcq: 92, multiselect: 84, short: 85 },
];

export const weakStrongSubjects = [
  { subject: "Algorithms", value: 92, fill: "#10b981" },
  { subject: "Web Dev", value: 88, fill: "#34d399" },
  { subject: "Maths", value: 84, fill: "#60a5fa" },
  { subject: "Networks", value: 75, fill: "#fbbf24" },
  { subject: "Database Norm.", value: 62, fill: "#f87171" },
  { subject: "OS Kernel sync", value: 41, fill: "#ef4444" },
];

export const mockAchievements = [
  { id: "a1", name: "Perfect Score", desc: "Get 100% marks in any exam", icon: "🏆", date: "2026-07-08" },
  { id: "a2", name: "Early Bird", desc: "Submit an exam with 50% time left", icon: "⚡", date: "2026-06-25" },
  { id: "a3", name: "Streak Master", desc: "Study 5 days in a row", icon: "🔥", date: "Active" },
  { id: "a4", name: "Integrity Icon", desc: "Complete 5 proctored exams with 0 flags", icon: "🛡️", date: "2026-07-08" },
];

export const mockRecentActivities = [
  { id: "act1", type: "Exam Completed", text: "Submitted Discrete Mathematics Exam", time: "3 days ago" },
  { id: "act2", type: "Practice Attempt", text: "Scored 93% in SQL Queries Practice", time: "4 days ago" },
  { id: "act3", type: "Badge Unlocked", text: "Unlocked 'Integrity Icon' badge", time: "3 days ago" },
  { id: "act4", type: "Exam Entered", text: "Completed Identity Verification for DBMS", time: "Just now" },
];
