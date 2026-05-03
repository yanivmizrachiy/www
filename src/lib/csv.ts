type CsvPrimitive = string | number | boolean | null | undefined;

function normalizeCell(value: CsvPrimitive): string {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value).replace(/\r?\n/g, " ").trim();
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: CsvPrimitive[][]): string {
  const output = [headers.map(normalizeCell).join(",")];
  for (const row of rows) {
    output.push(row.map(normalizeCell).join(","));
  }
  return `\uFEFF${output.join("\n")}`;
}

export function downloadCsv(filename: string, headers: string[], rows: CsvPrimitive[][]): void {
  const csv = toCsv(headers, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
