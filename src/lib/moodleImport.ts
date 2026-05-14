import * as XLSX from "xlsx";

export type ReportType = "students" | "grades" | "logs" | "completion" | "unknown";

export interface MoodleImportResult {
  reportType: ReportType;
  confidence: number;
  data: any[];
  headers: string[];
  fileName?: string;
  rowCount: number;
}

const YANIV_PARTICIPANTS_IMPORT_TRUTH_V1 = true;

function normalizeHeader(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u200e\u200f"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
}

function hasAny(headers: string[], candidates: string[]): boolean {
  const normalized = new Set(headers.map(normalizeHeader));
  return candidates.some((candidate) => normalized.has(normalizeHeader(candidate)));
}

function hasSomeContains(headers: string[], parts: string[]): boolean {
  const normalized = headers.map(normalizeHeader);
  return parts.some((part) => normalized.some((header) => header.includes(normalizeHeader(part))));
}

function detectStudents(headers: string[]): { type: ReportType; confidence: number } | null {
  const hasFullName = hasAny(headers, ["שם מלא", "Full name", "Name", "שם"]);
  const hasSplitName =
    hasAny(headers, ["שם פרטי", "First name", "Firstname", "first_name"]) &&
    hasAny(headers, ["שם משפחה", "Surname", "Last name", "lastname", "last_name"]);

  const hasIdentifier = hasAny(headers, [
    "כתובת דואל",
    "כתובת דוא״ל",
    "דואל",
    "דוא״ל",
    "דואר אלקטרוני",
    "Email address",
    "Email",
    "שם משתמש",
    "Username",
    "User name",
    "login",
    "מזהה משתמש",
    "user_id",
    "User ID",
    "ID",
    "id",
    "מזהה",
    "lis_person_sourcedid",
    "lis_person_sourcedId",
    "sourcedid",
    "Source ID",
    "Sourced ID",
    "ID number",
    "idnumber",
    "מספר זהות",
    "תז",
    "ת.ז.",
    "מספר מזהה",
  ]);

  if ((hasFullName || hasSplitName) && hasIdentifier) {
    return { type: "students", confidence: hasFullName ? 0.95 : 0.9 };
  }

  return null;
}

/**
 * Detects Moodle report type based on headers.
 * Truth-first rule:
 * The production server currently accepts only students/Participants imports.
 * Grades/logs/completion may be detected for transparency, but the UI must block saving them until implemented.
 */
export function detectReportType(headers: string[]): { type: ReportType; confidence: number } {
  const students = detectStudents(headers);
  if (students) return students;

  if (
    hasAny(headers, ["ציון סופי", "Course total", "Final grade", "Grade"]) &&
    (hasAny(headers, ["שם", "Full name", "שם מלא"]) ||
      hasAny(headers, ["שם פרטי", "First name"]))
  ) {
    return { type: "grades", confidence: 0.85 };
  }

  if (
    hasAny(headers, ["זמן", "Time"]) &&
    hasAny(headers, ["שם מלא", "User full name", "Full name"]) &&
    (hasAny(headers, ["הקשר האירוע", "Event context"]) ||
      hasAny(headers, ["שם האירוע", "Event name"]))
  ) {
    return { type: "logs", confidence: 0.9 };
  }

  if (
    hasSomeContains(headers, ["completion", "השלמה"]) ||
    (hasAny(headers, ["מצב", "Status"]) && hasAny(headers, ["תיאור", "Description"]))
  ) {
    return { type: "completion", confidence: 0.75 };
  }

  return { type: "unknown", confidence: 0 };
}

/**
 * Parses file (XLSX, CSV, ODS) into JSON objects.
 */
export async function parseMoodleFile(file: File): Promise<MoodleImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) throw new Error("לא התקבל תוכן מהקובץ");
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        if (json.length === 0) {
          throw new Error("הקובץ ריק או שלא זוהו בו שורות נתונים");
        }

        const headers = Object.keys(json[0] as object);
        const { type, confidence } = detectReportType(headers);

        resolve({
          reportType: type,
          confidence,
          data: json,
          headers,
          fileName: file.name,
          rowCount: json.length,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("שגיאה בקריאת הקובץ"));
    reader.readAsArrayBuffer(file);
  });
}

function parseDelimitedLine(line: string, delimiter: string): string[] {
  if (delimiter !== ",") return line.split(delimiter).map((cell) => cell.trim());

  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function guessDelimiter(text: string): string {
  const firstLine = text.trim().split(/\r?\n/)[0] || "";
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  if (tabCount >= semicolonCount && tabCount >= commaCount && tabCount > 0) return "\t";
  if (semicolonCount >= commaCount && semicolonCount > 0) return ";";
  return ",";
}

/**
 * Normalizes pasted table data.
 * Supports copied Moodle HTML-table text as tab-separated content and simple CSV/semicolon text.
 */
export function parsePastedTable(text: string): MoodleImportResult {
  const clean = text.trim();
  if (!clean) throw new Error("יש להדביק טבלה אמיתית ממודל כולל שורת כותרות");

  const lines = clean.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("תוכן לא תקין להדבקה: נדרשת שורת כותרות ולפחות שורת נתונים אחת");

  const delimiter = guessDelimiter(clean);
  const rows = lines.map((line) => parseDelimitedLine(line, delimiter));
  const headers = rows[0].map((header) => String(header || "").trim());

  if (headers.filter(Boolean).length < 2) {
    throw new Error("לא זוהו מספיק כותרות בטבלה. העתק גם את שורת הכותרות ממודל.");
  }

  const data = rows.slice(1).map((row) => {
    const obj: Record<string, string | null> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || null;
    });
    return obj;
  });

  const { type, confidence } = detectReportType(headers);

  return {
    reportType: type,
    confidence,
    data,
    headers,
    rowCount: data.length,
  };
}
