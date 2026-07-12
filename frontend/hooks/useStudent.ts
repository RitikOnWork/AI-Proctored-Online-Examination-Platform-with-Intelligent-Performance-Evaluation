import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "../services/student";
import { SettingsData } from "../types/student";

// Query keys
export const studentKeys = {
  profile: () => ["student", "profile"] as const,
  stats: () => ["student", "stats"] as const,
  exams: (filters?: any) => ["student", "exams", filters] as const,
  examDetails: (id: string) => ["student", "exam", id] as const,
  sessions: () => ["student", "sessions"] as const,
  practice: () => ["student", "practice"] as const,
  analytics: () => ["student", "analytics"] as const,
  notifications: () => ["student", "notifications"] as const,
};

// 1. Hook for student profile
export function useStudentProfile() {
  return useQuery({
    queryKey: studentKeys.profile(),
    queryFn: () => studentService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes stale
  });
}

// 2. Hook for dashboard statistics
export function useDashboardStats() {
  return useQuery({
    queryKey: studentKeys.stats(),
    queryFn: () => studentService.getDashboardStats(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// 3. Hook for list of exams
export function useUpcomingExams(filters?: any) {
  return useQuery({
    queryKey: studentKeys.exams(filters),
    queryFn: () => studentService.getUpcomingExams(filters),
    staleTime: 15 * 1000, // 15 seconds
  });
}

// 4. Hook for single exam details
export function useExamDetails(examId: string) {
  return useQuery({
    queryKey: studentKeys.examDetails(examId),
    queryFn: () => studentService.getExamDetails(examId),
    enabled: !!examId,
  });
}

// 5. Hook for exam sessions list (completed exams / attempts)
export function useSessions() {
  return useQuery({
    queryKey: studentKeys.sessions(),
    queryFn: () => studentService.getExamSessions(),
    staleTime: 30 * 1000,
  });
}

// 6. Hook for practice tests list
export function usePracticeTests() {
  return useQuery({
    queryKey: studentKeys.practice(),
    queryFn: () => studentService.getPracticeTests(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// 7. Hook for performance analytics data
export function useAnalytics() {
  return useQuery({
    queryKey: studentKeys.analytics(),
    queryFn: () => studentService.getPerformanceAnalytics(),
    staleTime: 5 * 60 * 1000,
  });
}

// 8. Hook for notifications list
export function useNotifications() {
  return useQuery({
    queryKey: studentKeys.notifications(),
    queryFn: () => studentService.getNotifications(),
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Mutations

// 9. Update profile mutation
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { full_name: string; email: string }) => studentService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Optimistic or direct cache update
      queryClient.setQueryData(studentKeys.profile(), updatedProfile);
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
    },
  });
}

// 10. Submit exam mutation
export function useSubmitExamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, answers }: { examId: string; answers: Record<string, any> }) =>
      studentService.submitExam(examId, answers),
    onSuccess: () => {
      // Invalidate exams and sessions lists to refresh dashboard numbers
      queryClient.invalidateQueries({ queryKey: studentKeys.exams() });
      queryClient.invalidateQueries({ queryKey: studentKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: studentKeys.stats() });
    },
  });
}

// 11. Log proctor event warning mutation
export function useProctorWarningMutation() {
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: { event_type: string; confidence: number; details: string };
    }) => studentService.logProctorEvent(sessionId, payload),
  });
}

// 12. Update settings settings mutation
export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingsData) => studentService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.stats() });
    },
  });
}

// 13. Change password mutation
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: any) => studentService.changePassword(data),
  });
}
