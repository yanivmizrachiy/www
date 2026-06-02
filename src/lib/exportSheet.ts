import * as XLSX from "xlsx";
import { formatTeacherDateDmyShort, formatTeacherDateTime } from "@/lib/teacherDateFormat";

// MTH_EXCEL_EXPORT_PREMIUM_V1
// Single source of truth for producing professional, Hebrew RTL Excel/CSV files
// from real imported / NRPS data. Every sheet is right-to-left, uses the Israeli
// short date (D/M/YY), and offers a Hebrew-weekday helper for date-centric
// reports. Headers are explicit Hebrew strings supplied by the caller. This
// module never invents rows: an empty input produces an empty (header-only) file
// or, when there is nothing at all, the caller decides not to download.
//
// Privacy: this layer only writes the values it is handed. Callers are
// responsible for stripping emails, raw IDs, tokens, secrets and national IDs
// before passing rows in. See Export.tsx for the safe field selection.

const HE_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

// Israeli short date — D/M/YY. Returns "" for empty so blank cells stay blank
// in the spreadsheet rather than showing a dash placeholder meant for the UI.
export function sheetDate(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const out = formatTeacherDateDmyShort(value);
  return out === "—" ? "" : out;
}

export function sheetDateTime(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const out = formatTeacherDateTime(value);
  return out === "—" ? "" : out;
}

// Hebrew weekday name (e.g. "שלישי") for a given date. Empty when unparseable.
export function sheetWeekday(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return HE_DAYS[date.getDay()];
}

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

export interface ExportSheet<T> {
  name: string; // Hebrew sheet/tab name
  columns: ExportColumn<T>[];
  rows: T[];
}

function sanitizeSheetName(name: string): string {
  // Excel forbids : \ / ? * [ ] and caps tab names at 31 chars.
  const cleaned = name.replace(/[:\\/?*[\]]/g, " ").trim();
  return (cleaned || "גיליון").slice(0, 31);
}

function toAoa<T>(sheet: ExportSheet<T>): (string | number)[][] {
  const head = sheet.columns.map((c) => c.header);
  const body = sheet.rows.map((row) =>
    sheet.columns.map((col) => {
      const v = col.value(row);
      if (v === null || v === undefined) return "";
      return typeof v === "number" ? v : String(v);
    }),
  );
  return [head, ...body];
}

function buildWorksheet<T>(sheet: ExportSheet<T>): XLSX.WorkSheet {
  const aoa = toAoa(sheet);
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Right-to-left sheet view so Hebrew reports open the natural way in Excel /
  // LibreOffice / Google Sheets.
  ws["!sheetView"] = [{ RTL: true }];
  (ws as { "!views"?: { RTL: boolean }[] })["!views"] = [{ RTL: true }];

  // Auto-ish column widths from the longest cell in each column, clamped so a
  // long free-text value cannot blow the layout out.
  ws["!cols"] = sheet.columns.map((col, i) => {
    let width = String(col.header).length;
    for (const row of aoa.slice(1)) {
      const cell = row[i];
      const len = cell === undefined || cell === null ? 0 : String(cell).length;
      if (len > width) width = len;
    }
    return { wch: Math.min(Math.max(width + 2, 10), 48) };
  });

  return ws;
}

function timestampSuffix(): string {
  return new Date().toISOString().slice(0, 10);
}

// Download a single-sheet workbook. Returns false (and downloads nothing) when
// there are no data rows, so the caller can keep the truth-first "no data"
// behaviour instead of handing the teacher an empty file.
export function exportSheetXlsx<T>(filenameBase: string, sheet: ExportSheet<T>): boolean {
  if (!sheet.rows.length) return false;
  const wb = XLSX.utils.book_new();
  (wb as { Workbook?: { Views?: { RTL?: boolean }[] } }).Workbook = { Views: [{ RTL: true }] };
  XLSX.utils.book_append_sheet(wb, buildWorksheet(sheet), sanitizeSheetName(sheet.name));
  XLSX.writeFile(wb, `${filenameBase}-${timestampSuffix()}.xlsx`);
  return true;
}

// Download a multi-sheet workbook (used for the full-course report). Returns
// false when every sheet is empty.
export function exportWorkbookXlsx(filenameBase: string, sheets: ExportSheet<unknown>[]): boolean {
  const populated = sheets.filter((s) => s.rows.length > 0);
  if (!populated.length) return false;
  const wb = XLSX.utils.book_new();
  (wb as { Workbook?: { Views?: { RTL?: boolean }[] } }).Workbook = { Views: [{ RTL: true }] };
  const used = new Set<string>();
  for (const sheet of populated) {
    let name = sanitizeSheetName(sheet.name);
    let n = 2;
    while (used.has(name)) {
      name = sanitizeSheetName(`${sheet.name} ${n++}`);
    }
    used.add(name);
    XLSX.utils.book_append_sheet(wb, buildWorksheet(sheet), name);
  }
  XLSX.writeFile(wb, `${filenameBase}-${timestampSuffix()}.xlsx`);
  return true;
}
