// Common TypeScript Types & Interfaces

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "candidate" | "proctor" | "admin";
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  startTime?: string;
  endTime?: string;
}

export interface ProctorEvent {
  id: string;
  examId: string;
  userId: string;
  eventType: "face_missing" | "multiple_faces" | "tab_switched" | "gaze_deviated" | "unauthorized_object";
  confidence: number;
  timestamp: string;
  snapshotUrl?: string;
}
