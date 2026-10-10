import { API_URL, getUser, clearSession, readError } from "./auth";
import { fetchCached, invalidate } from "./cache";

/*
 * Adapter over the CLS API (https://api.creativelearningsystem.com/api/reference).
 *
 * The API has no parent-specific endpoints, so most functions below build the
 * view-models the dashboard expects out of the generic student / drill / reading
 * resources. See API_GAP_ANALYSIS.md for what each one is derived from and what
 * is still missing.
 */

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // the API authenticates with a session cookie
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error(await readError(res, `Request failed: ${res.status}`));

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

type Query = Record<string, string | number | undefined>;

function withQuery(path: string, query: Query = {}): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined) params.set(k, String(v));
  const s = params.toString();
  return s ? `${path}?${s}` : path;
}

/* ─── Raw API types (only the fields we use) ─────────────── */

type ReasoningType = "logical" | "linguistic";
type Part = "part1" | "part2" | "part3";

interface Paged<T> {
  data: T[];
  meta: { totalItems: number; itemCount: number; totalPages: number; limit: number };
}

interface ApiParentChild {
  id: string;
  fullName: string;
  className: string | null;
  section: string | null;
  relationship: string;
}

interface ApiParent {
  id: string;
  authUserId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  children?: ApiParentChild[];
}

interface ApiStudent {
  id: string;
  fullName: string;
  logicalLevel: number;
  linguisticLevel: number;
}

interface ApiSectionProgress {
  id: string;
  name: string;
  code: string;
  type: ReasoningType;
  order: number;
  average: string | null;
  averageScore: number | null;
  session: number;
  sessionsCompleted: number;
}

interface ApiDrillSession {
  id: string;
  type: ReasoningType;
  level: number;
  totalQuestions: number;
  correctCount?: number | null;
  score?: number | null;
  status: "in_progress" | "completed";
  outcome: "none" | "promoted" | "demoted";
  completedAt?: string | null;
  createdAt: string;
  section?: { id: string; name: string; code: string } | null;
}

interface ApiLevelHistoryEntry {
  id: string;
  source: "automatic" | "manual";
  type: ReasoningType;
  reason?: string | null;
  occurredAt: string;
  fromLevel: number;
  toLevel: number;
}

interface ApiDailyTimeSpent {
  date: string;
  logicalMinutes: number;
  linguisticMinutes: number;
}

interface ApiTopicRef {
  id: string;
  name: string;
  code: string;
}

interface ApiReadingSession {
  id: string;
  part: Part;
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string | null;
  topicId: string;
  topic?: ApiTopicRef | null;
}

interface ApiReflection {
  id: string;
  part: Part;
  description: string;
  rating: number;
  topicId: string;
  topic?: ApiTopicRef | null;
  createdAt: string;
}

interface ApiComprehension {
  id: string;
  part: Part;
  description: string;
  topicId: string;
  topic?: ApiTopicRef | null;
  createdAt: string;
}

interface ApiCareerPath {
  id: string;
  part: Part;
  title: string;
  status: "draft" | "published" | "archived";
  topicId: string;
}

/* ─── Paging helpers ─────────────────────────────────────── */

const PAGE_SIZE = 100;

function getPage<T>(path: string, query: Query = {}, page = 1, limit = PAGE_SIZE) {
  return apiFetch<Paged<T>>(withQuery(path, { ...query, page, limit }));
}

/* Fetches every page (up to maxPages) of a paged list. */
async function fetchAll<T>(path: string, query: Query = {}, maxPages = 10): Promise<{ items: T[]; total: number }> {
  const first = await getPage<T>(path, query);
  const items = [...first.data];
  const pages = Math.min(first.meta.totalPages, maxPages);
  for (let page = 2; page <= pages; page++) {
    items.push(...(await getPage<T>(path, query, page)).data);
  }
  return { items, total: first.meta.totalItems };
}

/*
 * Pages through a newest-first list until items are older than `since`.
 * For endpoints with no from/to filter (reflections, comprehensions).
 */
async function fetchSince<T>(path: string, query: Query, since: Date, dateOf: (item: T) => string, maxPages = 10): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await getPage<T>(path, query, page);
    for (const item of res.data) {
      if (new Date(dateOf(item)) < since) return out;
      out.push(item);
    }
    if (page >= res.meta.totalPages) break;
  }
  return out;
}

/* ─── Date helpers ───────────────────────────────────────── */

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

/* Local calendar day as YYYY-MM-DD */
function dayKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${day}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

/* ─── Shared lookups ─────────────────────────────────────── */

const MEDALS = { 1: "BRONZE", 2: "SILVER", 3: "GOLD" } as const;

function medalFor(level: number): "BRONZE" | "SILVER" | "GOLD" {
  return MEDALS[level as 1 | 2 | 3] ?? "BRONZE";
}

function typeLabel(type: ReasoningType): "Logical" | "Linguistic" {
  return type === "logical" ? "Logical" : "Linguistic";
}

function partNumber(part: Part): number {
  return Number(part.slice(-1));
}

/*
 * The API has no parent self-lookup yet (API_GAP_ANALYSIS.md, M1). Try
 * /parents/me in case it ships, then fall back to matching the signed-in user
 * against Parent.authUserId. The fallback only works if the parent role may list parents.
 */
async function resolveParentId(): Promise<string> {
  const stored = localStorage.getItem("parent_id");
  if (stored) return stored;

  const user = getUser();
  if (!user) throw new Error("Not signed in");

  let id: string | undefined;
  try {
    id = (await apiFetch<ApiParent>("/parents/me")).id;
  } catch {}
  if (!id) {
    const { items } = await fetchAll<ApiParent>("/parents", {}, 50);
    id = items.find((p) => p.authUserId === user.id)?.id;
  }
  if (!id) throw new Error("No parent account is linked to this login.");

  localStorage.setItem("parent_id", id);
  return id;
}

function getParent(): Promise<ApiParent> {
  return fetchCached("parent", async () => apiFetch<ApiParent>(`/parents/${await resolveParentId()}`));
}

function getSectionProgress(studentId: string): Promise<ApiSectionProgress[]> {
  return fetchCached(`c${studentId}:section-progress`, async () => {
    const { items } = await fetchAll<ApiSectionProgress>(`/sections/student/${studentId}`);
    return items.sort((a, b) => a.order - b.order);
  });
}

async function getCompletedSessions(studentId: string, from?: Date, maxPages = 10): Promise<ApiDrillSession[]> {
  const { items } = await fetchAll<ApiDrillSession>(
    "/drill-sessions",
    { studentId, from: from?.toISOString() },
    maxPages,
  );
  return items.filter((s) => s.status === "completed");
}

const sessionTime = (s: ApiDrillSession) => s.completedAt ?? s.createdAt;

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
  DrillType: "Logical" | "Linguistic";
  NewLevel: number;
  ChangedAt: string;
}

export interface DashboardChild {
  student_id: string;
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
  student_id: string;
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
  DrillType: "Logical" | "Linguistic";
  ChangeType: "Promotion" | "Demotion";
  Source: "automatic" | "manual";
  OldLevel: number;
  NewLevel: number;
  ChangedAt: string;
}

export interface ReasoningAnalytics {
  student_id: string;
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
  student_id: string;
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

/* ─── Daily compliance (shared by dashboard, weekly and history views) ─── */

interface DailyCompliance {
  date: string;
  logicalMinutes: number;
  linguisticMinutes: number;
  logicalTargetMet: boolean;
  linguisticTargetMet: boolean;
  reflectionCompleted: boolean;
}

/*
 * The API doesn't expose daily targets (API_GAP_ANALYSIS.md, M8), so a target
 * counts as met when at least one drill session of that type was completed that day.
 */
function targetMet(sessionsThatDay: number): boolean {
  return sessionsThatDay > 0;
}

/* Returns `days` entries ending today, oldest first. */
async function getDailyCompliance(studentId: string, days: number): Promise<DailyCompliance[]> {
  const since = daysAgo(days - 1);
  const [sessions, reflections, timeSpent] = await Promise.all([
    getCompletedSessions(studentId, since),
    fetchSince<ApiReflection>("/student-reflections", { studentId }, since, (r) => r.createdAt),
    getPage<ApiDailyTimeSpent>(`/drill-sessions/student/${studentId}/time-spent`, {}, 1, days + 1),
  ]);

  const minutes = new Map(timeSpent.data.map((t) => [t.date, t]));
  const count = (key: string, type: ReasoningType) =>
    sessions.filter((s) => s.type === type && dayKey(sessionTime(s)) === key).length;

  return Array.from({ length: days }, (_, i) => {
    const key = dayKey(daysAgo(days - 1 - i));
    return {
      date:                key,
      logicalMinutes:      Math.round(minutes.get(key)?.logicalMinutes ?? 0),
      linguisticMinutes:   Math.round(minutes.get(key)?.linguisticMinutes ?? 0),
      logicalTargetMet:    targetMet(count(key, "logical")),
      linguisticTargetMet: targetMet(count(key, "linguistic")),
      reflectionCompleted: reflections.some((r) => dayKey(r.createdAt) === key),
    };
  });
}

/* ─── API functions ──────────────────────────────────────── */

function classInfo(c: ApiParentChild): string {
  return [c.className, c.section].filter(Boolean).join(" ") || "Unassigned";
}

async function buildDashboardChild(child: ApiParentChild): Promise<DashboardChild> {
  const [student, history, today] = await Promise.allSettled([
    apiFetch<ApiStudent>(`/students/${child.id}`),
    getPage<ApiLevelHistoryEntry>(`/drill-sessions/student/${child.id}/level-history`, {}, 1, 5),
    getDailyCompliance(child.id, 1),
  ]);

  const levels: ReasoningLevel[] = [];
  if (student.status === "fulfilled") {
    for (const [type, level] of [["logical", student.value.logicalLevel], ["linguistic", student.value.linguisticLevel]] as const) {
      levels.push({ TypeName: typeLabel(type), CurrentLevel: level, LevelName: `${typeLabel(type)} Level ${level}` });
    }
  }

  const weekAgo = daysAgo(7);
  const achievements: RecentAchievement[] = history.status === "fulfilled"
    ? history.value.data
        .filter((h) => new Date(h.occurredAt) >= weekAgo)
        .map((h) => ({
          ChangeType: h.toLevel > h.fromLevel ? "Promotion" : "Demotion",
          DrillType:  typeLabel(h.type),
          NewLevel:   h.toLevel,
          ChangedAt:  h.occurredAt,
        }))
    : [];

  const day = today.status === "fulfilled" ? today.value[0] : undefined;

  return {
    student_id:  child.id,
    full_name:   child.fullName,
    class_info:  classInfo(child),
    reasoning_levels: levels,
    today_compliance: {
      LogicalTargetMet:           day?.logicalTargetMet ?? false,
      LinguisticTargetMet:        day?.linguisticTargetMet ?? false,
      ReadingReflectionCompleted: day?.reflectionCompleted ?? false,
    },
    recent_achievements: achievements,
  };
}

export async function getDashboard(): Promise<DashboardOverview> {
  const parent = await getParent();
  const children = await Promise.all((parent.children ?? []).map(buildDashboardChild));
  return { total_children: children.length, children };
}

export async function getChildren(): Promise<{ children: LinkedChild[] }> {
  const parent = await getParent();
  return {
    children: (parent.children ?? []).map((c) => ({
      student_id:   c.id,
      full_name:    c.fullName,
      class_info:   classInfo(c),
      relationship: c.relationship,
    })),
  };
}

export async function getReasoningAnalytics(studentId: string): Promise<ReasoningAnalytics> {
  const [{ items: history }, sessions] = await Promise.all([
    fetchAll<ApiLevelHistoryEntry>(`/drill-sessions/student/${studentId}/level-history`, {}, 2),
    getCompletedSessions(studentId, daysAgo(29)),
  ]);

  // Daily average score per reasoning type, oldest first
  const byDay = new Map<string, { logical: number[]; linguistic: number[] }>();
  for (const s of sessions) {
    if (s.score == null) continue;
    const key = dayKey(sessionTime(s));
    const bucket = byDay.get(key) ?? { logical: [], linguistic: [] };
    bucket[s.type].push(s.score);
    byDay.set(key, bucket);
  }
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  const accuracy_trends = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, b]) => ({ date, logical_accuracy: avg(b.logical), linguistic_accuracy: avg(b.linguistic) }));

  // The API returns newest first; the card expects oldest first
  const level_history: LevelHistoryEntry[] = [...history].reverse().map((h) => ({
    DrillType:  typeLabel(h.type),
    ChangeType: h.toLevel > h.fromLevel ? "Promotion" : "Demotion",
    Source:     h.source,
    OldLevel:   h.fromLevel,
    NewLevel:   h.toLevel,
    ChangedAt:  h.occurredAt,
  }));

  return { student_id: studentId, accuracy_trends, level_history };
}

export async function getReadingInterests(studentId: string): Promise<ReadingInterests> {
  const [{ items: sessions }, { items: reflections }] = await Promise.all([
    fetchAll<ApiReadingSession>("/reading-sessions", { studentId }, 5),
    fetchAll<ApiReflection>("/student-reflections", { studentId }, 3),
  ]);
  const completed = sessions.filter((s) => s.status === "completed");

  // Career paths are attached to a topic part; collect them for every topic the child read (most recent 30)
  const topicIds = [...new Set(completed.map((s) => s.topicId))].slice(0, 30);
  const careerLists = await Promise.all(
    topicIds.map((topicId) => getPage<ApiCareerPath>("/career-paths", { topicId }).then((r) => r.data)),
  );
  const careers = careerLists.flat().filter((c) => c.status !== "draft");
  const careersFor = (topicId: string, part: Part) =>
    careers.filter((c) => c.topicId === topicId && c.part === part);

  const byCareer = new Map<string, CareerPath>();
  for (const s of completed) {
    const readAt = s.completedAt ?? s.startedAt;
    for (const c of careersFor(s.topicId, s.part)) {
      const entry = byCareer.get(c.title) ?? { CareerName: c.title, StoriesRead: 0, LastReadAt: readAt };
      entry.StoriesRead += 1;
      if (readAt > entry.LastReadAt) entry.LastReadAt = readAt;
      byCareer.set(c.title, entry);
    }
  }

  const storyReflections: StoryReflection[] = reflections.flatMap((r) => {
    const titles = careersFor(r.topicId, r.part).map((c) => c.title);
    if (titles.length === 0) return [];
    return [{
      StoryTitle:     `${r.topic?.name ?? "Story"} · Part ${partNumber(r.part)}`,
      CareerName:     titles.join(", "),
      ReflectionText: r.description,
      SubmittedAt:    r.createdAt,
    }];
  });

  return {
    student_id:   studentId,
    career_paths: [...byCareer.values()].sort((a, b) => b.LastReadAt.localeCompare(a.LastReadAt)),
    reflections:  storyReflections,
  };
}

export async function getComplianceHistory(studentId: string): Promise<{ compliance: ComplianceDay[] }> {
  const days = await getDailyCompliance(studentId, 30);
  return {
    compliance: days.map((d) => ({
      date:                       d.date,
      LogicalTargetMet:           d.logicalTargetMet,
      LinguisticTargetMet:        d.linguisticTargetMet,
      ReadingReflectionCompleted: d.reflectionCompleted,
    })),
  };
}

/* Not in the API yet (API_GAP_ANALYSIS.md, M4) */
export function getPretests(studentId: string) {
  return apiFetch<{ pretests: PretestResult[] }>(`/api/parent/child/${studentId}/pretests`);
}

/* Not in the API yet (API_GAP_ANALYSIS.md, M3) */
export function getNotifications() {
  return apiFetch<{ notifications: Notification[] }>("/api/parent/notifications");
}

function toProfile(p: ApiParent): ParentProfile {
  return { full_name: p.fullName, email: p.email, phone_number: p.phoneNumber };
}

export async function getProfile(): Promise<ParentProfile> {
  return toProfile(await getParent());
}

export async function updateProfile(data: Partial<ParentProfile>): Promise<ParentProfile> {
  const updated = await apiFetch<ApiParent>(`/parents/${await resolveParentId()}`, {
    method: "PATCH",
    body: JSON.stringify({ fullName: data.full_name, phoneNumber: data.phone_number }),
  });
  invalidate("parent");
  return toProfile(updated);
}

/* ─── 2.6 Academic Profile ───────────────────────────────── */

export interface AcademicStrengthArea {
  area: string;
  score: number;
  type: string;
  details: string;
}

export interface AcademicProfile {
  student_id: string;
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
  student_id: string;
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
  student_id: string;
  subject_progress: CurriculumSubject[];
}

/* ─── 2.9 Reasoning Subsections ──────────────────────────── */

export interface ReasoningSubsection {
  subsection_id: string;
  subsection_name: string;
  subsection_code: string;
  current_level: number;
  medal: "BRONZE" | "SILVER" | "GOLD";
  label: string;
}

export interface ReasoningSubsections {
  student_id: string;
  logical_reasoning: ReasoningSubsection[];
  linguistic_reasoning: ReasoningSubsection[];
}

/* ─── 2.10 Mental Drills ─────────────────────────────────── */

export interface DrillAttempt {
  attempt_id: string;
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
  student_id: string;
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
  reflection_id: string;
  topic_id: string;
  topic_title: string;
  star_rating: number | null;
  submitted_at: string;
  parts: ReflectionPart[];
}

export interface ReadingReflections {
  student_id: string;
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

export async function getAcademicProfile(studentId: string): Promise<AcademicProfile> {
  const [sections, { items: reflections, total }] = await Promise.all([
    getSectionProgress(studentId),
    fetchAll<ApiReflection>("/student-reflections", { studentId }, 5),
  ]);

  const toArea = (s: ApiSectionProgress): AcademicStrengthArea => ({
    area:    s.name,
    score:   s.averageScore ?? 0,
    type:    `${typeLabel(s.type)} reasoning`,
    details: `${s.sessionsCompleted} session${s.sessionsCompleted === 1 ? "" : "s"} completed · currently Level ${s.session}`,
  });

  // Strongest half (max 3) are strengths, the rest (weakest first, max 3) are growth areas
  const attempted = sections
    .filter((s) => s.averageScore !== null)
    .sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0));
  const strengthCount = Math.min(3, Math.ceil(attempted.length / 2));
  const strengths = attempted.slice(0, strengthCount).map(toArea);
  const growth = attempted.slice(strengthCount).reverse().slice(0, 3);

  const recommendations = growth.map(
    (s) => `Encourage more practice on ${s.name} (${typeLabel(s.type).toLowerCase()} reasoning), currently averaging ${Math.round(s.averageScore ?? 0)}%.`,
  );
  const untried = sections.filter((s) => s.averageScore === null);
  if (untried.length > 0) {
    recommendations.push(`Try the drills not attempted yet: ${untried.slice(0, 3).map((s) => s.name).join(", ")}.`);
  }
  if (total === 0) {
    recommendations.push("Encourage writing a short reflection after each reading part.");
  }

  const ratings = reflections.map((r) => r.rating).filter((r) => r > 0);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return {
    student_id:                studentId,
    strengths,
    growth_areas:              growth.map(toArea),
    recommendations,
    total_reflections:         total,
    average_reflection_rating: Math.round(avgRating * 10) / 10,
  };
}

export async function getWeeklyCompliance(studentId: string): Promise<WeeklyCompliance> {
  const days = await getDailyCompliance(studentId, 7);
  const breakdown: WeeklyComplianceDay[] = days.map((d) => ({
    date:                         d.date,
    day_name:                     new Date(`${d.date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long" }),
    logical_target_met:           d.logicalTargetMet,
    logical_time_spent_mins:      d.logicalMinutes,
    linguistic_target_met:        d.linguisticTargetMet,
    linguistic_time_spent_mins:   d.linguisticMinutes,
    reading_reflection_completed: d.reflectionCompleted,
    is_fully_compliant:           d.logicalTargetMet && d.linguisticTargetMet && d.reflectionCompleted,
  }));
  const full = breakdown.filter((d) => d.is_fully_compliant).length;

  return {
    student_id:                        studentId,
    days_fully_compliant:              full,
    total_days_logged:                 breakdown.length,
    compliance_consistency_percentage: (full / breakdown.length) * 100,
    weekly_daily_breakdown:            breakdown,
  };
}

/* Not in the API yet (API_GAP_ANALYSIS.md, M5) */
export function getCurriculumChecklist(studentId: string) {
  return apiFetch<CurriculumChecklist>(`/api/parent/child/${studentId}/curriculum-checklist`);
}

export async function getReasoningSubsections(studentId: string): Promise<ReasoningSubsections> {
  const sections = await getSectionProgress(studentId);
  // `session` is the child's level for the whole reasoning type, not per section
  const toSubsection = (s: ApiSectionProgress): ReasoningSubsection => ({
    subsection_id:   s.id,
    subsection_name: s.name,
    subsection_code: s.code,
    current_level:   s.session,
    medal:           medalFor(s.session),
    label:           s.average
      ? `Averaging ${s.average} over ${s.sessionsCompleted} session${s.sessionsCompleted === 1 ? "" : "s"}`
      : "Not attempted yet",
  });
  return {
    student_id:           studentId,
    logical_reasoning:    sections.filter((s) => s.type === "logical").map(toSubsection),
    linguistic_reasoning: sections.filter((s) => s.type === "linguistic").map(toSubsection),
  };
}

type Timeframe = "today" | "this_week" | "this_month" | "all_time";

function timeframeStart(timeframe: Timeframe): Date | undefined {
  const today = startOfDay(new Date());
  switch (timeframe) {
    case "today":      return today;
    case "this_week":  return daysAgo((today.getDay() + 6) % 7); // Monday
    case "this_month": return new Date(today.getFullYear(), today.getMonth(), 1);
    case "all_time":   return undefined;
  }
}

function toAttempt(s: ApiDrillSession): DrillAttempt {
  return {
    attempt_id:      s.id,
    subsection_name: s.section?.name ?? `${typeLabel(s.type)} drill`,
    subsection_code: s.section?.code ?? "",
    score:           `${s.correctCount ?? 0}/${s.totalQuestions}`,
    accuracy:        Math.round(s.score ?? 0),
    time_label:      formatTime(sessionTime(s)),
  };
}

function splitByType(sessions: ApiDrillSession[]) {
  return {
    logical_drills:       sessions.filter((s) => s.type === "logical").map(toAttempt),
    linguistic_reasoning: sessions.filter((s) => s.type === "linguistic").map(toAttempt),
  };
}

export async function getMentalDrills(studentId: string, timeframe: Timeframe = "this_week"): Promise<MentalDrills> {
  const sessions = await getCompletedSessions(studentId, timeframeStart(timeframe));
  const todayKey = dayKey(new Date());
  const yesterdayKey = dayKey(daysAgo(1));

  const alerts: DrillAlert[] = sessions
    .filter((s) => s.outcome !== "none")
    .map((s) => {
      const promoted = s.outcome === "promoted";
      const newLevel = s.level + (promoted ? 1 : -1);
      const when = sessionTime(s);
      return {
        change_type:     promoted ? "Promotion" : "Demotion",
        category:        `${typeLabel(s.type)} Reasoning`,
        subsection_name: s.section?.name ?? `${typeLabel(s.type)} Reasoning`,
        subsection_code: s.section?.code ?? "",
        previous_level:  s.level,
        new_level:       newLevel,
        timestamp:       when,
        message:         promoted ? `Promoted to Level ${newLevel}` : `Moved to Level ${newLevel}`,
        subtext:         `${typeLabel(s.type)} reasoning · ${new Date(when).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
        status:          promoted ? "success" : "warning",
      };
    });

  // Group the remaining days, newest first (the API already returns newest first)
  const pastByDay = new Map<string, ApiDrillSession[]>();
  for (const s of sessions) {
    const key = dayKey(sessionTime(s));
    if (key === todayKey) continue;
    pastByDay.set(key, [...(pastByDay.get(key) ?? []), s]);
  }
  const past_activity: MentalDrillsDay[] = [...pastByDay.entries()].map(([key, daySessions]) => {
    const date = new Date(`${key}T00:00:00`);
    return {
      date:         key,
      display_date: date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
      day_label:    key === yesterdayKey ? "Yesterday" : `${daySessions.length} drill${daySessions.length === 1 ? "" : "s"} completed`,
      ...splitByType(daySessions),
    };
  });

  return {
    student_id:     studentId,
    timeframe,
    alerts,
    today_activity: splitByType(sessions.filter((s) => dayKey(sessionTime(s)) === todayKey)),
    past_activity,
  };
}

/*
 * Reflections and comprehension notes are stored per topic part. Group them
 * by topic so each entry reads like one story with up to three parts.
 */
export async function getReadingReflections(studentId: string): Promise<ReadingReflections> {
  const [{ items: reflections }, { items: comprehensions }] = await Promise.all([
    fetchAll<ApiReflection>("/student-reflections", { studentId }, 5),
    fetchAll<ApiComprehension>("/student-comprehensions", { studentId }, 5),
  ]);

  interface TopicGroup {
    title: string;
    latest: string;
    ratings: number[];
    parts: Map<number, { understood?: string; reflection?: ApiReflection }>;
  }
  const topics = new Map<string, TopicGroup>();
  const groupFor = (topicId: string, topic: ApiTopicRef | null | undefined, createdAt: string) => {
    const g: TopicGroup = topics.get(topicId) ?? { title: topic?.name ?? "Untitled topic", latest: createdAt, ratings: [], parts: new Map() };
    if (createdAt > g.latest) g.latest = createdAt;
    topics.set(topicId, g);
    return g;
  };

  // Both lists are newest first, so keep the first (latest) record per part
  for (const c of comprehensions) {
    const part = groupFor(c.topicId, c.topic, c.createdAt).parts;
    const n = partNumber(c.part);
    const entry = part.get(n) ?? {};
    entry.understood ??= c.description;
    part.set(n, entry);
  }
  for (const r of reflections) {
    const g = groupFor(r.topicId, r.topic, r.createdAt);
    const n = partNumber(r.part);
    const entry = g.parts.get(n) ?? {};
    if (!entry.reflection) {
      entry.reflection = r;
      g.ratings.push(r.rating);
    }
    g.parts.set(n, entry);
  }

  const result: ReadingReflection[] = [...topics.entries()]
    .sort(([, a], [, b]) => b.latest.localeCompare(a.latest))
    .map(([topicId, g]) => ({
      reflection_id: topicId,
      topic_id:      topicId,
      topic_title:   g.title,
      star_rating:   g.ratings.length ? Math.round(g.ratings.reduce((a, b) => a + b, 0) / g.ratings.length) : null,
      submitted_at:  g.latest,
      parts: [...g.parts.entries()]
        .sort(([a], [b]) => a - b)
        .map(([n, p]) => {
          const reflection = p.reflection
            ? `Reflection (${p.reflection.rating}/5): ${p.reflection.description}`
            : "";
          return {
            part_number: n,
            question:    p.understood ? "What I understood" : "My reflection",
            answer:      p.understood
              ? [p.understood, reflection].filter(Boolean).join(" · ")
              : p.reflection?.description ?? "",
          };
        }),
    }));

  return { student_id: studentId, count: result.length, reflections: result };
}

/* ─── Activity Log ───────────────────────────────────────── */

export interface ActivityEntry {
  id: string;
  type: "drill" | "reading" | "reflection" | string;
  title: string;
  description?: string;
  timestamp: string;
  score?: string;
  accuracy?: number;
}

export interface ActivityLog {
  student_id: string;
  activities: ActivityEntry[];
}

export async function getActivityLog(studentId: string): Promise<ActivityLog> {
  const [drills, reading, reflections] = await Promise.all([
    getPage<ApiDrillSession>("/drill-sessions", { studentId }, 1, 20),
    getPage<ApiReadingSession>("/reading-sessions", { studentId }, 1, 20),
    getPage<ApiReflection>("/student-reflections", { studentId }, 1, 20),
  ]);

  const activities: ActivityEntry[] = [
    ...drills.data.filter((s) => s.status === "completed").map((s) => ({
      id:          `drill-${s.id}`,
      type:        "drill",
      title:       s.section?.name ?? `${typeLabel(s.type)} drill`,
      description: `${typeLabel(s.type)} reasoning · Level ${s.level}${s.outcome !== "none" ? ` · ${s.outcome}` : ""}`,
      timestamp:   sessionTime(s),
      score:       `${s.correctCount ?? 0}/${s.totalQuestions}`,
      accuracy:    s.score ?? undefined,
    })),
    ...reading.data.filter((s) => s.status === "completed").map((s) => ({
      id:        `reading-${s.id}`,
      type:      "reading",
      title:     `Read ${s.topic?.name ?? "a topic"}`,
      description: `Part ${partNumber(s.part)}`,
      timestamp: s.completedAt ?? s.startedAt,
    })),
    ...reflections.data.map((r) => ({
      id:          `reflection-${r.id}`,
      type:        "reflection",
      title:       `Reflected on ${r.topic?.name ?? "a topic"}`,
      description: `Part ${partNumber(r.part)} · ${r.rating}/5 stars`,
      timestamp:   r.createdAt,
    })),
  ];

  activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return { student_id: studentId, activities: activities.slice(0, 25) };
}

/* ─── Not in the API yet (API_GAP_ANALYSIS.md, M6 / M7) ──── */

export function suspendChild(studentId: string): Promise<void> {
  return apiFetch<void>(`/api/parent/child/${studentId}/suspend`, { method: "POST" });
}

export function unsuspendChild(studentId: string): Promise<void> {
  return apiFetch<void>(`/api/parent/child/${studentId}/unsuspend`, { method: "POST" });
}

export function getChildSuspensionStatus(studentId: string) {
  return apiFetch<SuspensionStatus>(`/api/parent/child/${studentId}/suspension-status`);
}

export function resendChildOnboarding(studentId: string): Promise<void> {
  return apiFetch<void>(`/api/parent/child/${studentId}/resend-onboarding`, { method: "POST" });
}
