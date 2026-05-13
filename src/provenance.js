// MTH_PROVENANCE_V1 — foundation constants and builder for import/sync provenance.
// All keys are English-only. No student data, no secrets, no PII.

export const SOURCE_TYPE = {
  MANUAL_REPORT_IMPORT: "manual_report_import",
  LTI11_CAPTURE: "lti11_capture",
  LTI13_NRPS: "lti13_nrps",
  MOODLE_WS: "moodle_ws",
  UNKNOWN: "unknown"
};

export const COMPLETENESS_STATUS = {
  COMPLETE: "complete",
  PARTIAL: "partial",
  UNKNOWN: "unknown",
  MISSING: "missing"
};

export const MISSING_REASON_KEY = {
  MISSING_PARTICIPANTS_REPORT: "missing_participants_report",
  MISSING_GRADEBOOK_REPORT: "missing_gradebook_report",
  MISSING_LOGS_REPORT: "missing_logs_report",
  MISSING_MOODLE_LAUNCH: "missing_moodle_launch",
  NO_SYNC_CONFIGURED: "no_sync_configured"
};

/**
 * Map a batch status string to a COMPLETENESS_STATUS value.
 */
function resolveCompletenessStatus(status, rowCount) {
  if (status === "completed" && rowCount > 0) return COMPLETENESS_STATUS.COMPLETE;
  if (status === "partial") return COMPLETENESS_STATUS.PARTIAL;
  if (rowCount === 0) return COMPLETENESS_STATUS.MISSING;
  return COMPLETENESS_STATUS.UNKNOWN;
}

/**
 * Derive SOURCE_TYPE from source_kind field written during import.
 */
function resolveSourceType(sourceKind) {
  if (sourceKind === "lti11_capture") return SOURCE_TYPE.LTI11_CAPTURE;
  if (sourceKind === "lti13_nrps") return SOURCE_TYPE.LTI13_NRPS;
  if (sourceKind === "moodle_ws") return SOURCE_TYPE.MOODLE_WS;
  return SOURCE_TYPE.MANUAL_REPORT_IMPORT;
}

/**
 * Build provenance fields for an import batch entry.
 * session must be the verified teacher session (moodleUserId, courseId).
 * Returns only safe, non-secret, aggregate-level fields.
 */
export function buildBatchProvenance({ import_batch_id, source_kind = "unknown", source_name = null, status = "unknown", row_count = 0, sync_operation_id = null } = {}, session = null) {
  const source_type = resolveSourceType(source_kind);
  const completeness_status = resolveCompletenessStatus(status, row_count);
  const now = new Date().toISOString();
  const isSync = source_type !== SOURCE_TYPE.MANUAL_REPORT_IMPORT;

  return {
    source_type,
    source_name,
    imported_at: !isSync ? now : null,
    synced_at: isSync ? now : null,
    teacher_context_id: session?.moodleUserId ? String(session.moodleUserId) : null,
    course_context_id: session?.courseId ? String(session.courseId) : null,
    import_batch_id: import_batch_id ?? null,
    sync_operation_id: sync_operation_id ?? null,
    completeness_status,
    missing_reason_key: completeness_status === COMPLETENESS_STATUS.MISSING ? MISSING_REASON_KEY.NO_SYNC_CONFIGURED : null
  };
}
