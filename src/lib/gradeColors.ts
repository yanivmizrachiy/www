export function gradeColor(value: number | null | undefined, max: number | null | undefined): string {
  if (value === null || value === undefined || max === null || max === undefined || max === 0) return "";
  const pct = (value / max) * 100;
  if (pct >= 85) return "text-emerald-600 font-bold";
  if (pct >= 70) return "text-blue-600 font-semibold";
  if (pct >= 55) return "text-amber-600";
  return "text-red-600 font-semibold";
}
export function gradeBg(value: number | null | undefined, max: number | null | undefined): string {
  if (value === null || value === undefined || max === null || max === undefined || max === 0) return "";
  const pct = (value / max) * 100;
  if (pct >= 85) return "bg-emerald-50";
  if (pct >= 70) return "bg-blue-50";
  if (pct >= 55) return "bg-amber-50";
  return "bg-red-50";
}
export function calcAverage(grades: number[]): string {
  if (!grades.length) return "—";
  return (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1);
}
