import { getAccessToken, clearSession } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.creativelearningsystem.com";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `Request failed: ${res.status}`);
  return json.data as T;
}

/* ─── Response types ─────────────────────────────────────── */

export interface ReasoningLevel {
  TypeName: string;
  CurrentLevel: number;
  LevelName: string;
}

export interface TodayCompliance {
  LogicalTargetMet: boolean;
  LinguisticTargetMet: boolean;
  ReadingReflectionCompleted: boolean;
}

export interface RecentAchievement {
  ChangeType: "Promotion" | "Demotion";
  DrillTypeID: number;
  NewLevel: number;
  ChangedAt: string;
}

export interface DashboardChild {
  student_id: number;
  full_name: string;
  class_info: string;
  reasoning_levels: ReasoningLevel[];
  today_compliance: TodayCompliance;
  recent_achievements: RecentAchievement[];
}

export interface DashboardOverview {
  total_children: number;
  children: DashboardChild[];
}

export interface LinkedChild {
  student_id: number;
  full_name: string;
  class_info: string;
  relationship: string;
}

export interface AccuracyDataPoint {
  date: string;
  logical_accuracy: number | null;
  linguistic_accuracy: number | null;
}

export interface LevelHistoryEntry {
  DrillTypeID: number;
  ChangeType: string;
  OldLevel: number;
  NewLevel: number;
  ChangedAt: string;
}

export interface ReasoningAnalytics {
  student_id: number;
  accuracy_trends: AccuracyDataPoint[];
  level_history: LevelHistoryEntry[];
}

export interface CareerPath {
  CareerName: string;
  StoriesRead: number;
  LastReadAt: string;
}

export interface StoryReflection {
  StoryTitle: string;
  CareerName: string;
  ReflectionText: string;
  SubmittedAt: string;
}

export interface ReadingInterests {
  student_id: number;
  career_paths: CareerPath[];
  reflections: StoryReflection[];
}

export interface ComplianceDay {
  date: string;
  LogicalTargetMet: boolean;
  LinguisticTargetMet: boolean;
  ReadingReflectionCompleted: boolean;
}

export interface PretestResult {
  subject: string;
  score: number;
  total: number;
  topics: { name: string; correct: boolean }[];
  taken_at: string;
}

export interface Notification {
  id: number;
  type: "WhatsApp" | "InApp";
  message: string;
  sent_at: string;
  read: boolean;
}

export interface ParentProfile {
  full_name: string;
  email: string;
  phone_number: string;
}

/* ─── API functions ──────────────────────────────────────── */

export function getDashboard() {
  return apiFetch<DashboardOverview>("/api/parent/dashboard");
}

export function getChildren() {
  return apiFetch<{ children: LinkedChild[] }>("/api/parent/children");
}

export function getChildOverview(studentId: number) {
  return apiFetch<Record<string, unknown>>(`/api/parent/child/${studentId}/overview`);
}

export function getReasoningAnalytics(studentId: number) {
  return apiFetch<ReasoningAnalytics>(`/api/parent/child/${studentId}/reasoning-analytics`);
}

export function getReadingInterests(studentId: number) {
  return apiFetch<ReadingInterests>(`/api/parent/child/${studentId}/reading-interests`);
}

export function getComplianceHistory(studentId: number) {
  return apiFetch<{ compliance: ComplianceDay[] }>(`/api/parent/child/${studentId}/compliance-history`);
}

export function getPretests(studentId: number) {
  return apiFetch<{ pretests: PretestResult[] }>(`/api/parent/child/${studentId}/pretests`);
}

export function getNotifications() {
  return apiFetch<{ notifications: Notification[] }>("/api/parent/notifications");
}

export function getProfile() {
  return apiFetch<ParentProfile>("/api/parent/profile");
}

export function updateProfile(data: Partial<ParentProfile>) {
  return apiFetch<ParentProfile>("/api/parent/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/* ─── 2.6 Academic Profile ───────────────────────────────── */

export interface AcademicStrengthArea {
  area: string;
  score: number;
  type: string;
  details: string;
}

export interface AcademicProfile {
  student_id: number;
  strengths: AcademicStrengthArea[];
  growth_areas: AcademicStrengthArea[];
  recommendations: string[];
  total_reflections: number;
  average_reflection_rating: number;
}

/* ─── 2.7 Weekly Compliance ──────────────────────────────── */

export interface WeeklyComplianceDay {
  date: string;
  day_name: string;
  logical_target_met: boolean;
  logical_time_spent_mins: number;
  linguistic_target_met: boolean;
  linguistic_time_spent_mins: number;
  reading_reflection_completed: boolean;
  is_fully_compliant: boolean;
}

export interface WeeklyCompliance {
  student_id: number;
  days_fully_compliant: number;
  total_days_logged: number;
  compliance_consistency_percentage: number;
  weekly_daily_breakdown: WeeklyComplianceDay[];
}

/* ─── 2.8 Curriculum Checklist ───────────────────────────── */

export interface CurriculumTopic {
  topic_id: number;
  topic_name: string;
  topic_code: string;
  status: "Mastered" | "Passed" | "Not Started";
  score: string;
}

export interface CurriculumSubject {
  subject_id: number;
  subject_name: string;
  mastery_count: number;
  topics: CurriculumTopic[];
}

export interface CurriculumChecklist {
  student_id: number;
  subject_progress: CurriculumSubject[];
}

/* ─── 2.9 Reasoning Subsections ──────────────────────────── */

export interface ReasoningSubsection {
  subsection_id: number;
  subsection_name: string;
  subsection_code: string;
  current_level: number;
  medal: "BRONZE" | "SILVER" | "GOLD";
  label: string;
}

export interface ReasoningSubsections {
  student_id: number;
  logical_reasoning: ReasoningSubsection[];
  linguistic_reasoning: ReasoningSubsection[];
}

/* ─── 2.10 Mental Drills ─────────────────────────────────── */

export interface DrillAttempt {
  attempt_id: number;
  subsection_name: string;
  subsection_code: string;
  score: string;
  accuracy: number;
  completed_at?: string;
  time_label?: string;
}

export interface DrillAlert {
  change_type: "Promotion" | "Demotion";
  category: string;
  subsection_name: string;
  subsection_code: string;
  previous_level: number;
  new_level: number;
  timestamp: string;
  message: string;
  subtext: string;
  status: "success" | "warning";
}

export interface MentalDrillsDay {
  date: string;
  display_date: string;
  day_label: string;
  logical_drills: DrillAttempt[];
  linguistic_reasoning: DrillAttempt[];
}

export interface MentalDrills {
  student_id: number;
  timeframe: string;
  alerts: DrillAlert[];
  today_activity: {
    logical_drills: DrillAttempt[];
    linguistic_reasoning: DrillAttempt[];
  };
  past_activity: MentalDrillsDay[];
}

/* ─── 2.11 Reading Reflections ───────────────────────────── */

export interface ReflectionPart {
  part_number: number;
  question: string;
  answer: string;
}

export interface ReadingReflection {
  reflection_id: number;
  content_id: number;
  topic_title: string;
  star_rating: number;
  what_liked: string;
  what_missing: string;
  submitted_at: string;
  parts: ReflectionPart[];
}

export interface ReadingReflections {
  student_id: number;
  count: number;
  reflections: ReadingReflection[];
}

/* ─── 4.x Suspension ─────────────────────────────────────── */

export interface SuspensionStatus {
  student_id: number;
  full_name: string;
  status: string;
  is_suspended: boolean;
}

/* ─── New API functions ───────────────────────────────────── */

export function getAcademicProfile(studentId: number) {
  return apiFetch<AcademicProfile>(`/api/parent/child/${studentId}/academic-profile`);
}

export function getWeeklyCompliance(studentId: number) {
  return apiFetch<WeeklyCompliance>(`/api/parent/child/${studentId}/weekly-compliance`);
}

export function getCurriculumChecklist(studentId: number) {
  return apiFetch<CurriculumChecklist>(`/api/parent/child/${studentId}/curriculum-checklist`);
}

export function getReasoningSubsections(studentId: number) {
  return apiFetch<ReasoningSubsections>(`/api/parent/child/${studentId}/reasoning-subsections`);
}

export function getMentalDrills(
  studentId: number,
  timeframe: "today" | "this_week" | "this_month" | "all_time" = "this_week",
) {
  return apiFetch<MentalDrills>(
    `/api/parent/child/${studentId}/mental-drills?timeframe=${timeframe}`,
  );
}

export function getReadingReflections(studentId: number) {
  return apiFetch<ReadingReflections>(`/api/parent/child/${studentId}/reading-reflections`);
}

/* ─── Activity Log ───────────────────────────────────────── */

export interface ActivityEntry {
  id: number;
  type: "drill" | "reflection" | "pretest" | string;
  title: string;
  description?: string;
  timestamp: string;
  score?: string;
  accuracy?: number;
}

export interface ActivityLog {
  student_id: number;
  activities: ActivityEntry[];
}

export function getActivityLog(studentId: number) {
  return apiFetch<ActivityLog>(`/api/parent/child/${studentId}/activity-log`);
}

/* ─── Suspension – Parent ────────────────────────────────── */

export function suspendChild(studentId: number): Promise<void> {
  return apiFetch<void>(`/api/parent/child/${studentId}/suspend`, { method: "POST" });
}

export function unsuspendChild(studentId: number): Promise<void> {
  return apiFetch<void>(`/api/parent/child/${studentId}/unsuspend`, { method: "POST" });
}

export function getChildSuspensionStatus(studentId: number) {
  return apiFetch<SuspensionStatus>(`/api/parent/child/${studentId}/suspension-status`);
}

/* ─── Suspension – Admin/School ──────────────────────────── */

export function adminSuspendStudent(studentId: number): Promise<void> {
  return apiFetch<void>(`/api/users/students/${studentId}/suspend`, { method: "POST" });
}

export function adminUnsuspendStudent(studentId: number): Promise<void> {
  return apiFetch<void>(`/api/users/students/${studentId}/unsuspend`, { method: "POST" });
}

export function adminGetStudentSuspensionStatus(studentId: number) {
  return apiFetch<SuspensionStatus>(`/api/users/students/${studentId}/suspension-status`);
}

/* ─── Onboarding Resend ──────────────────────────────────── */

export function resendChildOnboarding(studentId: number): Promise<void> {
  return apiFetch<void>(`/api/parent/child/${studentId}/resend-onboarding`, { method: "POST" });
}

export function adminResendParentCredentials(parentId: number): Promise<void> {
  return apiFetch<void>(`/api/users/parents/${parentId}/resend-onboarding`, { method: "POST" });
}

export function adminResendStudentOnboarding(studentId: number): Promise<void> {
  return apiFetch<void>(`/api/users/students/${studentId}/resend-onboarding`, { method: "POST" });
}
