// MTH_REPORT_STATUS_SEMANTICS_V1
// Single source of truth for report status labels. Every report must distinguish
// these statuses truthfully. We never infer one status from the absence of another:
// missing logs is not "did not work", a missing grade is not zero, and no submission
// is not "no data". When a dimension cannot be determined from imported source data
// we surface "אין נתון" / "לא ידוע" rather than an inferred fact.

export type ReportStatusKey =
  | "not_done" // לא עשה — explicit not-done from real source data
  | "not_submitted" // לא הגיש — explicit no-submission from real source data
  | "no_data" // אין נתון — source report for this dimension was not imported
  | "unknown" // לא ידוע — source imported but value indeterminate
  | "missing_grade" // חסר ציון — grade item exists but no grade value
  | "not_relevant"; // לא רלוונטי — dimension does not apply to this row

export const REPORT_STATUS_LABEL: Record<ReportStatusKey, string> = {
  not_done: "לא עשה",
  not_submitted: "לא הגיש",
  no_data: "אין נתון",
  unknown: "לא ידוע",
  missing_grade: "חסר ציון",
  not_relevant: "לא רלוונטי",
};

// Tailwind text/background tone per status. Kept neutral for "no data"/"unknown"
// so the eye is not drawn to absence of source as if it were a real negative.
export const REPORT_STATUS_TONE: Record<ReportStatusKey, string> = {
  not_done: "text-status-blocked",
  not_submitted: "text-status-blocked",
  no_data: "text-muted-foreground/60",
  unknown: "text-muted-foreground/60",
  missing_grade: "text-status-pending",
  not_relevant: "text-muted-foreground/40",
};

export interface ReportStatusLegendEntry {
  key: ReportStatusKey;
  label: string;
  desc: string;
}

// Concise Hebrew legend explaining what each status means, so a teacher never
// confuses "we have no source data" with "the student did not do the work".
export const REPORT_STATUS_LEGEND: ReportStatusLegendEntry[] = [
  { key: "not_done", label: REPORT_STATUS_LABEL.not_done, desc: "המקור מציין שהמשימה לא בוצעה" },
  { key: "not_submitted", label: REPORT_STATUS_LABEL.not_submitted, desc: "המקור מציין שלא הוגשה הגשה" },
  { key: "missing_grade", label: REPORT_STATUS_LABEL.missing_grade, desc: "פריט ציון קיים אך ללא ערך — לא אפס" },
  { key: "no_data", label: REPORT_STATUS_LABEL.no_data, desc: "דוח המקור לא יובא — לא ניתן לקבוע" },
  { key: "unknown", label: REPORT_STATUS_LABEL.unknown, desc: "המקור יובא אך הערך אינו חד-משמעי" },
  { key: "not_relevant", label: REPORT_STATUS_LABEL.not_relevant, desc: "הממד אינו רלוונטי לשורה זו" },
];
