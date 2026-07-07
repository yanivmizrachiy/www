import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLtiSession } from './useLtiSession';

export function useImportsOverview() {
  const { session } = useLtiSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const siteId = session.site_id;
        const courseId = session.course_id;

        const [
          studentsCount,
          gradeItemsCount,
          gradesCount,
          chaptersCount,
          tasksCount,
          logsCount
        ] = await Promise.all([
          supabase.from('imported_students').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('course_id', courseId),
          supabase.from('imported_grade_items').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('course_id', courseId),
          supabase.from('imported_grades').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('course_id', courseId),
          supabase.from('imported_chapters').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('course_id', courseId),
          supabase.from('imported_tasks').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('course_id', courseId),
          supabase.from('imported_log_events').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('course_id', courseId)
        ]);

        setData({
          students_count: studentsCount.count || 0,
          grade_items_count: gradeItemsCount.count || 0,
          grades_count: gradesCount.count || 0,
          chapters_count: chaptersCount.count || 0,
          tasks_count: tasksCount.count || 0,
          log_events_count: logsCount.count || 0,
        });
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [session]);

  return { data, loading, error };
}

export function useCourseStructure() {
  const { session } = useLtiSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: chapters, error: cErr } = await supabase
          .from('imported_chapters')
          .select('*')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id)
          .order('position', { ascending: true });

        const { data: tasks, error: tErr } = await supabase
          .from('imported_tasks')
          .select('*')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        if (cErr || tErr) throw cErr || tErr;

        setData({ chapters: chapters || [], tasks: tasks || [], completion_summary: {} });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  return { data, loading, error };
}

export function useGradesMatrix() {
  const { session } = useLtiSession();
  const [data, setData] = useState<any>({ students: [], items: [], grades: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const [
          { data: students },
          { data: items },
          { data: grades }
        ] = await Promise.all([
          supabase.from('imported_students').select('*').eq('site_id', session.site_id).eq('course_id', session.course_id),
          supabase.from('imported_grade_items').select('*').eq('site_id', session.site_id).eq('course_id', session.course_id),
          supabase.from('imported_grades').select('*, imported_students!inner(*), imported_grade_items!inner(*)').eq('site_id', session.site_id).eq('course_id', session.course_id)
        ]);

        setData({
          students: students || [],
          items: items || [],
          grades: grades || []
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  return { data, loading, error };
}

export function useActivityOverview() {
  const { session } = useLtiSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: logs, error: lErr } = await supabase
          .from('imported_log_events')
          .select('*')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id)
          .order('occurred_at', { ascending: false })
          .limit(20);

        if (lErr) throw lErr;

        setData({
          recent: logs?.map(l => ({
            id: l.id,
            student_name: l.raw_user_full_name || l.raw_user_username || 'משתמש לא ידוע',
            event_name: l.event_name,
            occurred_at: new Date(l.occurred_at).toLocaleString('he-IL')
          }))
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  return { data, loading, error };
}

export function useStudents() {
  const { session } = useLtiSession();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('imported_students')
          .select('*')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id)
          .order('full_name');

        if (error) throw error;
        setStudents(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  return { students, loading, error };
}

export function useStudentProfile(id?: string) {
  const { session } = useLtiSession();
  const [student, setStudent] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [completion, setCompletion] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      if (!session) {
        setError('יש לפתוח את המערכת מתוך Moodle כדי לצפות בפרופיל תלמיד');
        setLoading(false);
        return;
      }

      try {
        const { data: s, error: sErr } = await supabase
          .from('imported_students')
          .select('*')
          .eq('id', id)
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id)
          .single();

        if (sErr || !s) {
          setError(sErr?.message ?? 'תלמיד לא נמצא בקורס הזה');
          setLoading(false);
          return;
        }

        setStudent(s);

        const [
          { data: gradesData },
          { data: logsData },
          { data: completionData }
        ] = await Promise.all([
          supabase
            .from('imported_grades')
            .select('*, imported_grade_items(item_name)')
            .eq('student_id', id)
            .eq('site_id', session.site_id)
            .eq('course_id', session.course_id),
          supabase
            .from('imported_log_events')
            .select('occurred_at')
            .eq('student_id', id)
            .eq('site_id', session.site_id)
            .eq('course_id', session.course_id)
            .order('occurred_at', { ascending: true }),
          supabase
            .from('imported_task_completion')
            .select('*, imported_tasks(task_name)')
            .eq('student_id', id)
            .eq('site_id', session.site_id)
            .eq('course_id', session.course_id)
        ]);

        const gradesWithNames = (gradesData || []).map((g: any) => ({
          grade_item_id: g.grade_item_id,
          item_name: g.imported_grade_items?.item_name ?? '—',
          numeric_value: g.numeric_value,
          raw_value: g.raw_value,
          is_missing: g.is_missing
        }));
        setGrades(gradesWithNames);

        const logDays = new Set<string>();
        let eventCount = 0;
        let firstEvent: string | null = null;
        (logsData || []).forEach((l: any) => {
          eventCount++;
          const day = new Date(l.occurred_at).toISOString().split('T')[0];
          logDays.add(day);
          if (!firstEvent) firstEvent = l.occurred_at;
        });

        setActivity({
          active_days: logDays.size,
          event_count: eventCount,
          first_event: firstEvent
        });

        const completionWithNames = (completionData || []).map((c: any) => ({
          task_id: c.task_id,
          task_name: c.imported_tasks?.task_name ?? '—',
          is_complete: c.is_complete,
          completed_at: c.completed_at,
          status: c.status
        }));
        setCompletion(completionWithNames);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, session]);

  return { student, grades, activity, completion, loading, error };
}

export interface PracticeDayRow {
  date: string;
  total_seconds: number;
}

export function useActionableInsights() {
  const { session } = useLtiSession();
  const [insights, setInsights] = useState<{
    low_performers: number;
    inactive_days: number;
    struggling_tasks: string[];
  }>({ low_performers: 0, inactive_days: 0, struggling_tasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: grades } = await supabase
          .from('imported_grades')
          .select('student_id, numeric_value')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        if (grades) {
          const studentSums: Record<string, { sum: number; count: number }> = {};
          grades.forEach(g => {
            const val = g.numeric_value;
            if (val !== null && !isNaN(val)) {
              if (!studentSums[g.student_id]) studentSums[g.student_id] = { sum: 0, count: 0 };
              studentSums[g.student_id].sum += val;
              studentSums[g.student_id].count += 1;
            }
          });

          const low = Object.values(studentSums).filter(s => (s.sum / s.count) < 60).length;
          setInsights(prev => ({ ...prev, low_performers: low }));
        }

        setLoading(false);
      } catch (err) {
        console.error('Insights error:', err);
        setLoading(false);
      }
    }

    fetchInsights();
  }, [session]);

  return { insights, loading };
}

export async function postImport(result: {
  report_type: 'students' | 'grades' | 'logs' | 'completion';
  payload: any[];
  file_name?: string;
  source_kind: string;
  detection_confidence: number;
}) {
  try {
    const token = localStorage.getItem('lti_token');
    const { data: sessionData } = await supabase
      .from('teacher_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (!sessionData) throw new Error('No active session');

    const siteId = sessionData.site_id;
    const courseId = sessionData.course_id;

    if (result.report_type === 'students') {
      const studentData = result.payload.map(row => {
        const moodleId = row['ID number'] || row['מזהה'] || row['ID'] || null;
        const email = row['Email address'] || row['כתובת דוא"ל'] || row['דוא"ל'] || null;
        const firstName = row['First name'] || row['שם פרטי'] || '';
        const lastName = row['Surname'] || row['שם משפחה'] || '';
        const externalUsername = row['Username'] || row['שם משתמש'] || null;

        return {
          site_id: siteId,
          course_id: courseId,
          external_id: moodleId ? String(moodleId) : null,
          email,
          external_username: externalUsername,
          full_name: `${firstName} ${lastName}`.trim() || '—',
        };
      }).filter(s => s.email || s.external_id);

      const { error } = await supabase.from('imported_students').upsert(studentData, {
        onConflict: 'site_id,course_id,external_id'
      });
      if (error) throw error;
      return { ok: true, row_count: studentData.length };
    }

    if (result.report_type === 'grades') {
      const userKeyHeaders = ['First name', 'שם פרטי', 'Surname', 'שם משפחה', 'ID number', 'מזהה', 'Email address', 'כתובת דוא"ל', 'Institution', 'Department', 'מוסד', 'מחלקה', 'Last downloaded from this course', 'הורדה אחרונה מקורס זה'];
      const headers = Object.keys(result.payload[0] || {});
      const gradeItemNames = headers.filter(h => !userKeyHeaders.includes(h) && h !== 'ID');

      const gradeItems = gradeItemNames.map(name => ({
        site_id: siteId,
        course_id: courseId,
        item_name: name,
        item_type: name.includes('Total') || name.includes('סיכום') ? 'total' : 'activity'
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('imported_grade_items')
        .upsert(gradeItems, { onConflict: 'site_id,course_id,item_name' })
        .select();

      if (itemsError) throw itemsError;

      const gradeInserts: any[] = [];
      for (const row of result.payload) {
        const email = row['Email address'] || row['כתובת דוא"ל'];
        if (!email) continue;

        const { data: student } = await supabase
          .from('imported_students')
          .select('id')
          .eq('site_id', siteId)
          .eq('course_id', courseId)
          .eq('email', email)
          .single();

        if (!student) continue;

        for (const item of insertedItems || []) {
          const val = row[item.item_name];
          const isMissing = val === undefined || val === null || val === '-' || String(val).trim() === '';
          gradeInserts.push({
            site_id: siteId,
            course_id: courseId,
            student_id: student.id,
            grade_item_id: item.id,
            numeric_value: isMissing ? null : parseFloat(String(val).replace(',', '.')) || null,
            raw_value: isMissing ? null : String(val),
            is_missing: isMissing,
          });
        }
      }

      if (gradeInserts.length > 0) {
        await supabase.from('imported_grades').delete().eq('site_id', siteId).eq('course_id', courseId);
        const { error: gradesError } = await supabase.from('imported_grades').insert(gradeInserts);
        if (gradesError) throw gradesError;
      }
      return { ok: true, row_count: gradeInserts.length };
    }

    if (result.report_type === 'logs') {
      const logs = [];
      for (const row of result.payload) {
        const fullName = row['User full name'] || row['שם מלא'];
        const { data: student } = await supabase
          .from('imported_students')
          .select('id')
          .eq('site_id', siteId)
          .eq('course_id', courseId)
          .eq('full_name', fullName)
          .limit(1)
          .single();

        if (!student) continue;

        logs.push({
          site_id: siteId,
          course_id: courseId,
          student_id: student.id,
          occurred_at: new Date(row['Time'] || row['זמן']).toISOString(),
          event_name: row['Event name'] || row['שם האירוע'] || null,
          event_context: row['Event context'] || row['הקשר האירוע'] || null,
          raw_user_full_name: fullName ?? null,
          raw_user_username: row['Username'] || row['שם משתמש'] || null,
          component: row['Component'] || row['רכיב'] || null,
          description: row['Description'] || row['תיאור'] || null,
        });
      }

      const { error } = await supabase.from('imported_log_events').insert(logs);
      if (error) throw error;
      return { ok: true, row_count: logs.length };
    }

    return { ok: true, row_count: 0 };
  } catch (err: any) {
    console.error('Import error:', err);
    return { ok: false, error: err.message };
  }
}

export function useDailyActivity() {
  const { session } = useLtiSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: logs } = await supabase
          .from('imported_log_events')
          .select('occurred_at, student_id')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        if (!logs) {
          setData([]);
          setLoading(false);
          return;
        }

        const dayMap: Record<string, { events: number; students: Set<string> }> = {};
        logs.forEach(log => {
          const day = new Date(log.occurred_at).toISOString().split('T')[0];
          if (!dayMap[day]) {
            dayMap[day] = { events: 0, students: new Set() };
          }
          dayMap[day].events++;
          if (log.student_id) dayMap[day].students.add(log.student_id);
        });

        const result = Object.entries(dayMap)
          .map(([day, { events, students }]) => ({
            day,
            events,
            active_students: students.size
          }))
          .sort((a, b) => a.day.localeCompare(b.day));

        setData(result);
      } catch (err) {
        console.error('Daily activity error:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  return { data, loading };
}

export function useStudentReports() {
  const { session } = useLtiSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: students } = await supabase
          .from('imported_students')
          .select('id, full_name')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        if (!students) {
          setData([]);
          setLoading(false);
          return;
        }

        const { data: grades } = await supabase
          .from('imported_grades')
          .select('student_id, numeric_value')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        const { data: logs } = await supabase
          .from('imported_log_events')
          .select('student_id, occurred_at')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        const studentStats: Record<string, any> = {};
        students.forEach(s => {
          studentStats[s.id] = {
            student_id: s.id,
            full_name: s.full_name,
            grades: [],
            events: [],
            avg_grade: null,
            tasks_complete: 0,
            tasks_incomplete: 0,
            event_count: 0,
            active_days: 0,
            last_event: null
          };
        });

        if (grades) {
          grades.forEach(g => {
            if (studentStats[g.student_id]) {
              const val = g.numeric_value;
              if (val !== null && !isNaN(val)) {
                studentStats[g.student_id].grades.push(val);
              }
            }
          });
        }

        if (logs) {
          const daysByStudent: Record<string, Set<string>> = {};
          logs.forEach(l => {
            if (!l.student_id || !studentStats[l.student_id]) return;
            const day = new Date(l.occurred_at).toISOString().split('T')[0];
            studentStats[l.student_id].event_count++;
            if (!daysByStudent[l.student_id]) daysByStudent[l.student_id] = new Set();
            daysByStudent[l.student_id].add(day);
            const lastKnown = studentStats[l.student_id].last_event;
            if (!lastKnown || new Date(l.occurred_at) > new Date(lastKnown)) {
              studentStats[l.student_id].last_event = l.occurred_at;
            }
          });
          Object.entries(daysByStudent).forEach(([studentId, days]) => {
            if (studentStats[studentId]) studentStats[studentId].active_days = days.size;
          });
        }

        const result = Object.values(studentStats).map((s: any) => ({
          ...s,
          avg_grade: s.grades.length > 0
            ? s.grades.reduce((a: number, b: number) => a + b, 0) / s.grades.length
            : null
        }));

        setData(result);
      } catch (err) {
        console.error('Student reports error:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  return { data, loading };
}

export function useTaskCompletionDetail() {
  const { session } = useLtiSession();
  const [data, setData] = useState<{ tasks: any[]; rows: any[] }>({ tasks: [], rows: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: tasks } = await supabase
          .from('imported_tasks')
          .select('*')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        const { data: completion } = await supabase
          .from('imported_task_completion')
          .select('*')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        setData({
          tasks: tasks || [],
          rows: completion || []
        });
      } catch (err) {
        console.error('Task completion error:', err);
        setData({ tasks: [], rows: [] });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  return { data, loading };
}

export function usePracticeTime(opts?: { studentId?: string | null }) {
  const { session } = useLtiSession();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('imported_log_events')
          .select('occurred_at, student_id')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id)
          .order('occurred_at', { ascending: true });

        if (opts?.studentId) {
          query = query.eq('student_id', opts.studentId);
        }

        const { data: logs, error: lErr } = await query;
        if (lErr) throw lErr;

        const dayMap: Record<string, { total_seconds: number; student_id: string; student_name: string; event_count: number; windows: any[] }> = {};
        const studentMap: Record<string, string> = {};

        const { data: students } = await supabase
          .from('imported_students')
          .select('id, full_name')
          .eq('site_id', session.site_id)
          .eq('course_id', session.course_id);

        students?.forEach(s => { studentMap[s.id] = s.full_name; });

        const lastTime: Record<string, number> = {};

        logs?.forEach(log => {
          if (!log.student_id) return;
          const time = new Date(log.occurred_at).getTime();
          const day = new Date(log.occurred_at).toISOString().split('T')[0];
          const sid = log.student_id;
          const key = `${day}|${sid}`;

          if (!dayMap[key]) {
            dayMap[key] = {
              total_seconds: 0,
              student_id: sid,
              student_name: studentMap[sid] || '—',
              event_count: 0,
              windows: []
            };
          }

          dayMap[key].event_count++;

          if (lastTime[sid] && (time - lastTime[sid]) < 10 * 60 * 1000) {
            dayMap[key].total_seconds += (time - lastTime[sid]) / 1000;
          }

          lastTime[sid] = time;
        });

        const result = Object.entries(dayMap).map(([key, val]) => ({
          day: key.split('|')[0],
          ...val,
          total_seconds: Math.round(val.total_seconds)
        })).sort((a, b) => a.day.localeCompare(b.day));

        setRows(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, opts?.studentId]);

  return { rows, loading, error };
}
