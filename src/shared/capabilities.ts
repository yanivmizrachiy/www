export type CapabilityStatusKind =
  | "automatic"
  | "available_from_import"
  | "missing_required_report"
  | "blocked_no_permission"
  | "not_implemented_yet";

export type CapabilityKey =
  | "lti_session"
  | "nrps_participants"
  | "participants_names_emails"
  | "course_sections"
  | "course_tasks"
  | "grade_items"
  | "grade_results"
  | "logs"
  | "practice_time"
  | "reports"
  | "export"
  | "persistence";

export interface CapabilityStatus {
  key: CapabilityKey;
  label_he: string;
  status: CapabilityStatusKind;
  source: string;
  count?: number;
  confidence: "high" | "medium" | "low";
  last_checked_at: string;
  teacher_message_he: string;
  next_action_he: string;
  required_report_type?: string | null;
}

export interface SyncStatusResponse {
  ok: boolean;
  mode: string;
  action: "status" | "run";
  no_fake_success: true;
  session_present: boolean;
  counts: {
    students: number;
    tasks: number;
    chapters: number;
    grade_items: number;
    grades: number;
    log_events: number;
    activity_sessions: number;
    import_batches: number;
  };
  teacher_action_budget: {
    ideal_actions: string[];
    allowed_fallback_actions: string[];
    forbidden_teacher_burdens: string[];
  };
  capabilities: Record<CapabilityKey, CapabilityStatus>;
  next_required: CapabilityStatus[];
  privacy: {
    no_student_names_returned: true;
    no_emails_returned: true;
    no_tokens_returned: true;
    aggregate_only: true;
  };
  now: string;
}

export const capabilityStatusLabels: Record<CapabilityStatusKind, string> = {
  automatic: "עובד אוטומטית",
  available_from_import: "זמין מייבוא אמיתי",
  missing_required_report: "חסר דוח נדרש",
  blocked_no_permission: "חסום בהרשאה",
  not_implemented_yet: "מתוכנן"
};

export const capabilityStatusClasses: Record<CapabilityStatusKind, string> = {
  automatic: "bg-emerald-100 text-emerald-800 border-emerald-200",
  available_from_import: "bg-sky-100 text-sky-800 border-sky-200",
  missing_required_report: "bg-amber-100 text-amber-800 border-amber-200",
  blocked_no_permission: "bg-rose-100 text-rose-800 border-rose-200",
  not_implemented_yet: "bg-slate-100 text-slate-700 border-slate-200"
};