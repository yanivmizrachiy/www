import { Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { ImportEmptyState } from "@/components/ImportEmptyState";
import { TruthBadge } from "@/components/TruthBadge";
import { MoodleImportResult, parseMoodleFile, parsePastedTable } from "@/lib/moodleImport";
import { postImport } from "@/hooks/useImports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  Loader2,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const YANIV_PARTICIPANTS_IMPORT_TRUTH_V1 = true;

function normalizeHeader(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u200e\u200f"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
}

function hasHeader(headers: string[], candidates: string[]): boolean {
  const normalized = new Set(headers.map(normalizeHeader));
  return candidates.some((candidate) => normalized.has(normalizeHeader(candidate)));
}

function reportTypeLabel(type: string) {
  if (type === "students") return "Participants / תלמידים";
  if (type === "grades") return "ציונים — חסום כרגע";
  if (type === "logs") return "לוגים — חסום כרגע";
  if (type === "completion") return "השלמת פעילות — חסום כרגע";
  return "לא זוהה";
}

function mappingSummary(result: MoodleImportResult | null) {
  const headers = result?.headers || [];

  return {
    hasFullName: hasHeader(headers, ["שם מלא", "Full name", "Name", "שם"]),
    hasSplitName:
      hasHeader(headers, ["שם פרטי", "First name", "Firstname", "first_name"]) &&
      hasHeader(headers, ["שם משפחה", "Surname", "Last name", "lastname", "last_name"]),
    hasEmail: hasHeader(headers, [
      "כתובת דואל",
      "כתובת דוא״ל",
      "דואל",
      "דוא״ל",
      "דואר אלקטרוני",
      "Email address",
      "Email",
    ]),
    hasUsername: hasHeader(headers, ["שם משתמש", "Username", "User name", "login", "מזהה משתמש"]),
    hasMoodleUserId: hasHeader(headers, ["user_id", "User ID", "ID", "id", "מזהה"]),
    hasLisPersonSourcedId: hasHeader(headers, [
      "lis_person_sourcedid",
      "lis_person_sourcedId",
      "sourcedid",
      "Source ID",
      "Sourced ID",
    ]),
    hasIdNumber: hasHeader(headers, ["ID number", "idnumber", "מספר זהות", "תז", "ת.ז.", "מספר מזהה"]),
  };
}

export default function Import() {
  const [result, setResult] = useState<MoodleImportResult | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [serverResult, setServerResult] = useState<any>(null);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapping = useMemo(() => mappingSummary(result), [result]);
  const isStudentsReport = result?.reportType === "students";
  const hasNameForImport = mapping.hasFullName || mapping.hasSplitName;
  const hasIdentityForImport =
    mapping.hasEmail ||
    mapping.hasUsername ||
    mapping.hasMoodleUserId ||
    mapping.hasLisPersonSourcedId ||
    mapping.hasIdNumber;

  const canSubmit = Boolean(result && isStudentsReport && hasNameForImport && hasIdentityForImport);

  const openFilePicker = () => {
    setImportError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const blockingReason = useMemo(() => {
    if (!result) return "";
    if (result.reportType !== "students") {
      return "השרת מאשר כרגע רק Participants / תלמידים. ציונים, לוגים והשלמת פעילות ייבנו רק אחרי שתלמידים עם שמות יאומתו.";
    }
    if (!hasNameForImport) {
      return "חסרה עמודת שם תלמיד. נדרש שם מלא או שם פרטי + שם משפחה.";
    }
    if (!hasIdentityForImport) {
      return "חסר מזהה תלמיד. נדרש לפחות מייל, שם משתמש, user_id, lis_person_sourcedid או ID number.";
    }
    return "";
  }, [result, hasNameForImport, hasIdentityForImport]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setServerResult(null);
      setImportError("");
      const parsed = await parseMoodleFile(file);
      setResult(parsed);

      if (parsed.reportType === "students") {
        toast.success("זוהה דוח Participants / תלמידים");
      } else {
        toast.warning("הדוח זוהה, אך כרגע ניתן לשמור רק Participants / תלמידים");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "שגיאה בטעינת הקובץ";
      setImportError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = () => {
    try {
      if (!pastedText.trim()) throw new Error("יש להדביק תוכן");
      setServerResult(null);
      setImportError("");
      const parsed = parsePastedTable(pastedText);
      setResult(parsed);

      if (parsed.reportType === "students") {
        toast.success("זוהתה טבלת Participants / תלמידים");
      } else {
        toast.warning("הטבלה זוהתה, אך כרגע ניתן לשמור רק Participants / תלמידים");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "שגיאה בניתוח התוכן";
      setImportError(message);
      toast.error(message);
    }
  };

  const handleSubmit = async () => {
    if (!result) return;

    if (!canSubmit) {
      const message = blockingReason || "לא ניתן לשמור את הדוח הזה כרגע";
      setImportError(message);
      toast.error(message);
      return;
    }

    try {
      setImportError("");
      setIsUploading(true);
      const response = await postImport({
        report_type: "students",
        file_name: result.fileName,
        source_kind: result.fileName ? "upload" : "paste",
        detection_confidence: result.confidence,
        payload: result.data,
      });

      if (response.ok) {
        setServerResult(response);
        toast.success(`ייבוא Participants הושלם: ${response.row_count} שורות נקלטו`);
      } else {
        throw new Error(response.error || "שגיאה בשרת");
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "שגיאה בייבוא";
      const message =
        rawMessage === "missing_session" || rawMessage === "NO_VERIFIED_MOODLE_SESSION"
          ? "לא נמצאה פתיחה מאומתת מתוך Moodle. פתח את הכלי מתוך Moodle ואז נסה שוב."
          : rawMessage;
      setImportError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafePage
      title="ייבוא נתוני Moodle אמיתיים"
      description="שלב ראשון מאומת: Participants / תלמידים בלבד. ציונים, לוגים וזמני פעילות לא נשמרים עד שייבוא תלמידים עם שמות יאומת."
    >
      <div className="mx-auto max-w-5xl space-y-6" dir="rtl">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onClick={(event) => { event.currentTarget.value = ""; }}
          onChange={handleFile}
          accept=".csv,.xlsx,.xls,.ods"
        />

        <Card className="border-blue-100 bg-blue-50/60">
          <CardContent className="flex gap-3 p-5 text-sm leading-7 text-blue-950">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
            <div>
              <div className="font-extrabold">אמת לפני נוחות</div>
              <div>
                NRPS כבר מאמת שיש תלמידים אמיתיים במרחב, אך Moodle לא שולח שמות דרך NRPS.
                לכן השלב הנכון הוא ייבוא דוח Participants אמיתי ממודל כדי להשלים שמות — בלי דמו ובלי המצאות.
              </div>
            </div>
          </CardContent>
        </Card>


        {importError && (
          <Card className="border-red-200 bg-red-50/90">
            <CardContent className="flex gap-3 p-4 text-sm leading-7 text-red-950">
              <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <div className="font-extrabold">הייבוא לא התקדם</div>
                <div>{importError}</div>
                <div className="mt-1 text-xs text-red-800">
                  אם זו הודעת Session — פתח את Teacher Hub מתוך Moodle עצמו ולא מקישור ישיר.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="space-y-8"
            >
              <div
                className="cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={openFilePicker}
              >
                <ImportEmptyState />
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <Button
                  onClick={openFilePicker}
                  variant="outline"
                  size="lg"
                  className="h-14 gap-2"
                >
                  <Upload className="h-5 w-5" />
                  בחר קובץ Participants
                </Button>

                <Card>
                  <CardContent className="flex gap-2 p-2">
                    <Textarea
                      placeholder="או הדבק כאן טבלת Participants ממודל כולל שורת כותרות..."
                      className="min-h-[72px] py-2 text-xs"
                      value={pastedText}
                      onChange={(event) => setPastedText(event.target.value)}
                    />
                    <Button
                      onClick={handlePaste}
                      disabled={!pastedText.trim()}
                      size="icon"
                      className="h-[72px] shrink-0"
                      title="נתח טבלה מודבקת"
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-5 text-sm leading-7">
                <div className="flex gap-3">
                  <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h4 className="font-extrabold">מה להעתיק ממודל?</h4>
                    <p className="text-muted-foreground">
                      דוח Participants / משתתפים אמיתי בלבד, כולל שורת הכותרות. מומלץ שיהיו בו שם מלא או שם פרטי+משפחה,
                      וגם לפחות מזהה אחד: מייל, שם משתמש, user_id, lis_person_sourcedid או ID number.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card className={canSubmit ? "border-green-200 bg-green-50/60" : "border-orange-200 bg-orange-50/70"}>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className={canSubmit ? "rounded-full bg-green-100 p-3 text-green-700" : "rounded-full bg-orange-100 p-3 text-orange-700"}>
                      {canSubmit ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">זוהה דוח: {reportTypeLabel(result.reportType)}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {result.fileName ? `קובץ: ${result.fileName}` : "טבלה שהודבקה"} · {result.rowCount} שורות · רמת זיהוי {Math.round(result.confidence * 100)}%
                      </p>
                      {blockingReason && <p className="mt-2 text-sm font-bold text-orange-900">{blockingReason}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setResult(null); setServerResult(null); }} disabled={isUploading}>
                      ביטול
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={isUploading || !canSubmit} className="gap-2 shadow-lg">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      אשר וייבא Participants
                    </Button>
                    {serverResult?.ok && (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/students">פתח תלמידים</Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-white p-3">
                      <div className="text-xs font-bold text-muted-foreground">שם תלמיד</div>
                      <div className="mt-1 font-extrabold">{hasNameForImport ? "קיים" : "חסר"}</div>
                    </div>
                    <div className="rounded-xl border bg-white p-3">
                      <div className="text-xs font-bold text-muted-foreground">מייל</div>
                      <div className="mt-1 font-extrabold">{mapping.hasEmail ? "קיים" : "לא התקבל"}</div>
                    </div>
                    <div className="rounded-xl border bg-white p-3">
                      <div className="text-xs font-bold text-muted-foreground">user_id</div>
                      <div className="mt-1 font-extrabold">{mapping.hasMoodleUserId ? "קיים" : "לא התקבל"}</div>
                    </div>
                    <div className="rounded-xl border bg-white p-3">
                      <div className="text-xs font-bold text-muted-foreground">lis_person_sourcedid</div>
                      <div className="mt-1 font-extrabold">{mapping.hasLisPersonSourcedId ? "קיים" : "לא התקבל"}</div>
                    </div>
                  </div>

                  {serverResult?.ok && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-950">
                      <div className="mb-1 flex items-center gap-2 font-extrabold">
                        <Users className="h-4 w-4" />
                        ייבוא Participants הושלם
                      </div>
                      <div>
                        נקלטו {serverResult.row_count} שורות · נוספו {serverResult.inserted} · עודכנו {serverResult.updated} · נדחו {serverResult.skipped}.
                      </div>
                      {Array.isArray(serverResult.warnings) && serverResult.warnings.length > 0 && (
                        <div className="mt-2 font-bold">אזהרות: {serverResult.warnings.join(" | ")}</div>
                      )}
                    </div>
                  )}

                  <div className="overflow-hidden rounded-2xl border bg-background">
                    <div className="max-h-[380px] overflow-auto">
                      <Table dir="rtl">
                        <TableHeader className="sticky top-0 z-10 bg-muted/70">
                          <TableRow>
                            {result.headers.slice(0, 8).map((header) => (
                              <TableHead key={header} className="whitespace-nowrap text-right text-[11px]">
                                {header}
                              </TableHead>
                            ))}
                            {result.headers.length > 8 && <TableHead className="text-right">...</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.data.slice(0, 12).map((row, index) => (
                            <TableRow key={index}>
                              {result.headers.slice(0, 8).map((header) => (
                                <TableCell key={header} className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px]">
                                  {String(row[header] || "")}
                                </TableCell>
                              ))}
                              {result.headers.length > 8 && <TableCell className="text-muted-foreground">...</TableCell>}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="border-t bg-muted/10 p-3 text-center">
                      <div className="inline-flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <TruthBadge status="imported" />
                        תצוגה מקדימה בלבד — מוצגות 12 שורות ראשונות מתוך {result.rowCount}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SafePage>
  );
}
