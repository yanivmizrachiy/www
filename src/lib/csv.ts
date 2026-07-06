/**
 * Simple CSV Generator for browsers
 */
export function exportToCsv(filename: string, rows: any[][]) {
  const processRow = (row: any[]) => {
    return row.map(v => {
      if (v === null || v === undefined) return "";
      let s = String(v).replace(/"/g, '""');
      if (s.search(/("|,|\n)/g) >= 0) s = `"${s}"`;
      return s;
    }).join(",");
  };

  const csvContent = "\uFEFF" + rows.map(processRow).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
