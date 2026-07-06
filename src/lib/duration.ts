/**
 * Formats seconds into Hebrew HMS format (e.g., 2ש 30ד 15ש)
 */
export function secondsToHebrewHms(seconds: number): string {
  if (seconds <= 0) return "0ש";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (h > 0) parts.push(`${h}ש`);
  if (m > 0) parts.push(`${m}ד`);
  if (s > 0 || parts.length === 0) parts.push(`${s}ש`);

  return parts.join(" ");
}

/**
 * Formats seconds into HH:MM:SS
 */
export function secondsToDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
