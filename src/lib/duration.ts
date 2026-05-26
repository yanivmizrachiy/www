export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds) || seconds < 0) return "—";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const hLabel = hours === 1 ? "שעה" : `${hours} שעות`;
  const mLabel = minutes === 1 ? "דקה" : `${minutes} דקות`;
  const sLabel = secs === 1 ? "שנייה" : `${secs} שניות`;

  if (hours > 0 && minutes > 0) return `${hLabel} ו־${mLabel}`;
  if (hours > 0) return hLabel;
  if (minutes > 0 && secs > 0) return `${mLabel} ו־${sLabel}`;
  if (minutes > 0) return mLabel;
  return sLabel;
}

export function formatDurationCompact(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds) || seconds < 0) return "—";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function toIsoDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function secondsToHebrewHms(value: number | null | undefined): string {
  const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hLabel = hours === 1 ? "שעה" : `${hours} שעות`;
  const mLabel = minutes === 1 ? "דקה" : `${minutes} דקות`;
  const sLabel = seconds === 1 ? "שנייה" : `${seconds} שניות`;

  if (hours > 0 && minutes > 0) return `${hLabel} ו־${mLabel}`;
  if (hours > 0) return hLabel;
  if (minutes > 0 && seconds > 0) return `${mLabel} ו־${sLabel}`;
  if (minutes > 0) return mLabel;
  return sLabel;
}
