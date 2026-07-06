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

/**
 * Detects Moodle report type based on headers
 */
export function detectReportType(headers: string[]): { type: ReportType; confidence: number } {
  const h = headers.map(s => s.toLowerCase());

  // Participants / Students
  if (h.includes("שם פרטי") && h.includes("שם משפחה") && h.includes("כתובת דוא\"ל")) {
    return { type: "students", confidence: 0.95 };
  }
  if (h.includes("first name") && h.includes("surname") && h.includes("email address")) {
    return { type: "students", confidence: 0.95 };
  }

  // Grades
  if (h.includes("שם") && h.includes("משפחה") && h.includes("מזהה") && h.includes("ציון סופי")) {
    return { type: "grades", confidence: 0.9 };
  }
  if (h.includes("first name") && h.includes("surname") && h.includes("id number") && h.includes("course total")) {
    return { type: "grades", confidence: 0.9 };
  }

  // Logs
  if (h.includes("זמן") && h.includes("שם מלא") && h.includes("הקשר האירוע") && h.includes("שם האירוע")) {
    return { type: "logs", confidence: 0.95 };
  }
  if (h.includes("time") && h.includes("user full name") && h.includes("event context") && h.includes("event name")) {
    return { type: "logs", confidence: 0.95 };
  }

  // Activity Completion
  if (h.includes("completion") || h.includes("השלמה") || (h.includes("שם") && h.includes("תיאור") && h.includes("מצב"))) {
      if (h.some(x => x.includes("completion"))) return { type: "completion", confidence: 0.85 };
  }

  return { type: "unknown", confidence: 0 };
}

/**
 * Parses file (XLSX, CSV, ODS) into a JSON objects
 */
export async function parseMoodleFile(file: File): Promise<MoodleImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        
        if (json.length === 0) {
           throw new Error("קובץ ריק");
        }

        const headers = Object.keys(json[0] as object);
        const { type, confidence } = detectReportType(headers);

        resolve({
          reportType: type,
          confidence,
          data: json,
          headers,
          fileName: file.name,
          rowCount: json.length
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("שגיאה בקריאת הקובץ"));
    reader.readAsBinaryString(file);
  });
}

/**
 * Normalizes pasted table data
 */
export function parsePastedTable(text: string): MoodleImportResult {
  const rows = text.trim().split("\n").map(line => line.split("\t"));
  if (rows.length < 2) throw new Error("תוכן לא תקין להדבקה");

  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || null;
    });
    return obj;
  });

  const { type, confidence } = detectReportType(headers);

  return {
    reportType: type,
    confidence,
    data,
    headers,
    rowCount: data.length
  };
}
