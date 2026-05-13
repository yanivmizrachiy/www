// MTH_PRACTICE_TIME_TRUTH_GATE_V1
// Practice time MUST derive from real log events only.
// Never synthesize, estimate, or invent practice time.
// All fields are aggregate-only — no student rows returned.

export const PRACTICE_TIME_BLOCKER = {
  MISSING_LOGS_REPORT: "missing_logs_report",
  INSUFFICIENT_LOGS_FOR_PRACTICE_TIME: "insufficient_logs_for_practice_time",
  NO_DURATION_FIELD: "no_duration_field"
};

// Minimum log events required before practice time is computable.
export const MIN_LOG_EVENTS_FOR_PRACTICE_TIME = 2;

/**
 * Format total seconds as integer hours and minutes — never decimals.
 * Returns null if input is not a positive finite number.
 */
export function secondsToHoursMinutes(totalSeconds) {
  const safe = Math.floor(Number(totalSeconds) || 0);
  if (safe <= 0) return null;
  return {
    hours: Math.floor(safe / 3600),
    minutes: Math.floor((safe % 3600) / 60)
  };
}

/**
 * Sum duration from log events that carry an explicit duration field.
 * Checks duration_seconds, duration, timeDiff in that order.
 * Does NOT invent or estimate durations from timestamps.
 */
export function sumLogEventDurations(logEvents) {
  if (!Array.isArray(logEvents) || logEvents.length === 0) {
    return { total_seconds: 0, events_with_duration: 0, events_without_duration: 0 };
  }
  let total = 0;
  let withDur = 0;
  let withoutDur = 0;
  for (const ev of logEvents) {
    const raw = ev.duration_seconds ?? ev.duration ?? ev.timeDiff ?? null;
    const dur = Number(raw);
    if (raw !== null && Number.isFinite(dur) && dur > 0) {
      total += dur;
      withDur++;
    } else {
      withoutDur++;
    }
  }
  return { total_seconds: total, events_with_duration: withDur, events_without_duration: withoutDur };
}

/**
 * Build safe, aggregate-only practice time gate status.
 * Returns blocker_keys when data is missing or insufficient.
 * Cites import provenance when available via importBatches.
 */
export function buildPracticeTimeGate(logEvents, activitySessions, importBatches) {
  const logCount = Array.isArray(logEvents) ? logEvents.length : 0;
  const sessionCount = Array.isArray(activitySessions) ? activitySessions.length : 0;

  if (logCount === 0 && sessionCount === 0) {
    return {
      practice_time_available: false,
      blocker_key: PRACTICE_TIME_BLOCKER.MISSING_LOGS_REPORT,
      blocker_keys: [PRACTICE_TIME_BLOCKER.MISSING_LOGS_REPORT],
      completeness_status: "missing",
      total_seconds: null,
      display: null,
      log_event_count: 0,
      activity_session_count: 0,
      events_with_duration: 0,
      events_without_duration: 0,
      source_type: null,
      import_batch_id: null,
      imported_at: null
    };
  }

  const dur = sumLogEventDurations(logEvents);
  const blockerKeys = [];

  if (logCount < MIN_LOG_EVENTS_FOR_PRACTICE_TIME) {
    blockerKeys.push(PRACTICE_TIME_BLOCKER.INSUFFICIENT_LOGS_FOR_PRACTICE_TIME);
  }

  if (logCount >= MIN_LOG_EVENTS_FOR_PRACTICE_TIME && dur.events_with_duration === 0) {
    blockerKeys.push(PRACTICE_TIME_BLOCKER.NO_DURATION_FIELD);
  }

  const completenessStatus =
    blockerKeys.length === 0 && dur.events_without_duration === 0 ? "complete"
    : blockerKeys.length === 0 ? "partial"
    : logCount > 0 ? "partial"
    : "missing";

  const latestBatch = Array.isArray(importBatches)
    ? [...importBatches].reverse().find(b => b.report_type === "logs" || b.source_kind === "logs") ?? null
    : null;

  return {
    practice_time_available: blockerKeys.length === 0 && dur.total_seconds > 0,
    blocker_key: blockerKeys.length > 0 ? blockerKeys[0] : null,
    blocker_keys: blockerKeys,
    completeness_status: completenessStatus,
    total_seconds: dur.total_seconds > 0 ? dur.total_seconds : null,
    display: secondsToHoursMinutes(dur.total_seconds),
    log_event_count: logCount,
    activity_session_count: sessionCount,
    events_with_duration: dur.events_with_duration,
    events_without_duration: dur.events_without_duration,
    source_type: logCount > 0 ? "manual_report_import" : null,
    import_batch_id: latestBatch?.id ?? null,
    imported_at: latestBatch?.imported_at ?? latestBatch?.created_at ?? null
  };
}
