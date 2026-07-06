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

        // Fetch counts from various tables
        const [
          studentsCount,
          gradeItemsCount,
          gradesCount,
          chaptersCount,
          tasksCount,
          logsCount
        ] = await Promise.all([
          supabase.from("students").select("*", { count: "exact", head: true }).eq("site_id", siteId),
          supabase.from("grade_items").select("*", { count: "exact", head: true }).eq("site_id", siteId).eq("course_id", courseId),
          supabase.from("grades").select("*, grade_items!inner(*)").eq("grade_items.site_id", siteId).eq("grade_items.course_id", courseId).select("*", { count: "exact", head: true }),
          supabase.from("chapters").select("*", { count: "exact", head: true }).eq("site_id", siteId).eq("course_id", courseId),
          supabase.from("grade_items").select("*", { count: "exact", head: true }).eq("site_id", siteId).eq("course_id", courseId),
          supabase.from("activity_logs").select("*", { count: "exact", head: true }).eq("site_id", siteId).eq("course_id", courseId)
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
        console.error("Error fetching stats:", err);
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
          .from('chapters')
          .select('*')
          .eq('course_id', session.course_id)
          .order('order_index');

        const { data: tasks, error: tErr } = await supabase
          .from('grade_items')
          .select('*')
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
          supabase.from('students').select('*').eq('site_id', session.site_id),
          supabase.from('grade_items').select('*').eq('course_id', session.course_id),
          supabase.from('grades').select('*, students!inner(*), grade_items!inner(*)').eq('grade_items.course_id', session.course_id)
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
          .from('activity_logs')
          .select('*, students(full_name)')
          .eq('course_id', session.course_id)
          .order('event_time', { ascending: false })
          .limit(20);

        if (lErr) throw lErr;

        setData({
          recent: logs?.map(l => ({
            id: l.id,
            student_name: l.students?.full_name || "משתמש לא ידוע",
            event_name: l.event_name,
            occurred_at: new Date(l.event_time).toLocaleString('he-IL')
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
          .from('students')
          .select('*')
          .eq('site_id', session.site_id)
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
  return {
    student: null,
    grades: [],
    activity: [],
    loading: false,
    error: null
  };
}

export interface PracticeDayRow {
  date: string;
  total_seconds: number;
}

export function usePracticeTime() {
  const { session } = useLtiSession();
  const [rows, setRows] = useState<PracticeDayRow[]>([]);
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
          .from('activity_logs')
          .select('event_time, student_id')
          .eq('course_id', session.course_id)
          .order('event_time', { ascending: true });

        if (lErr) throw lErr;

        // "Sophisticated" grouping logic
        const dayMap: Record<string, number> = {};
        
        // Simple heuristic: sum up sessions
        // Each session starts at first event and continues as long as events are within 10 mins
        const studentSessions: Record<string, number> = {};
        let lastTime: Record<string, number> = {};
        
        logs?.forEach(log => {
          const time = new Date(log.event_time).getTime();
          const day = new Date(log.event_time).toISOString().split('T')[0];
          const sid = log.student_id;
          
          if (!dayMap[day]) dayMap[day] = 0;
          
          if (lastTime[sid] && (time - lastTime[sid]) < 10 * 60 * 1000) {
            dayMap[day] += (time - lastTime[sid]) / 1000;
          }
          lastTime[sid] = time;
        });

        const result = Object.entries(dayMap).map(([date, seconds]) => ({
          date,
          total_seconds: Math.round(seconds)
        }));

        setRows(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  return { rows, loading, error };
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
        // Average grades per student
        const { data: grades } = await supabase
          .from('grades')
          .select('student_id, grade_value, grade_items!inner(course_id)')
          .eq('grade_items.course_id', session.course_id);
        
        if (grades) {
           const studentSums: Record<string, { sum: number, count: number }> = {};
           grades.forEach(g => {
             const val = parseFloat(String(g.grade_value));
             if (!isNaN(val)) {
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
        console.error("Insights error:", err);
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

    if (!sessionData) throw new Error("No active session");

    const siteId = sessionData.site_id;
    const courseId = sessionData.course_id;

    if (result.report_type === 'students') {
      const studentData = result.payload.map(row => {
        // Handle both Hebrew and English headers from Moodle
        const moodleId = row['ID number'] || row['מזהה'] || row['ID'] || null;
        const email = row['Email address'] || row['כתובת דוא"ל'] || row['דוא"ל'] || null;
        const firstName = row['First name'] || row['שם פרטי'] || "";
        const lastName = row['Surname'] || row['שם משפחה'] || "";
        
        return {
          site_id: siteId,
          moodle_id: moodleId ? parseInt(moodleId) : null,
          email,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          metadata: row
        };
      }).filter(s => s.email || s.moodle_id);

      const { error } = await supabase.from('students').upsert(studentData, { 
        onConflict: 'site_id, email' 
      });
      if (error) throw error;
      return { ok: true, row_count: studentData.length };
    }

    if (result.report_type === 'grades') {
      // 1. Extract grade items (columns that aren't user info)
      const userKeyHeaders = ['First name', 'שם פרטי', 'Surname', 'שם משפחה', 'ID number', 'מזהה', 'Email address', 'כתובת דוא"ל', 'Institution', 'Department', 'מוסד', 'מחלקה', 'Last downloaded from this course', 'הורדה אחרונה מקורס זה'];
      const headers = Object.keys(result.payload[0] || {});
      const gradeItemNames = headers.filter(h => !userKeyHeaders.includes(h) && h !== 'ID');

      // 2. Create/Get grade items
      const gradeItems = gradeItemNames.map(name => ({
        site_id: siteId,
        course_id: courseId,
        item_name: name,
        item_type: name.includes('Total') || name.includes('סיכום') ? 'total' : 'activity'
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('grade_items')
        .upsert(gradeItems, { onConflict: 'site_id, course_id, item_name' })
        .select();

      if (itemsError) throw itemsError;

      // 3. Insert grades
      const gradeInserts: any[] = [];
      for (const row of result.payload) {
         // Find or create student reference (need student ID)
         const email = row['Email address'] || row['כתובת דוא"ל'];
         if (!email) continue;

         // We assume student exists from 'students' import or we create a stub
         const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('site_id', siteId)
            .eq('email', email)
            .single();
         
         if (!student) continue;

         for (const item of insertedItems) {
            const val = row[item.item_name];
            if (val !== undefined && val !== null && val !== '-') {
               gradeInserts.push({
                  student_id: student.id,
                  grade_item_id: item.id,
                  grade_value: parseFloat(String(val)) || 0,
                  raw_grade: String(val)
               });
            }
         }
      }

      const { error: gradesError } = await supabase.from('grades').upsert(gradeInserts, {
        onConflict: 'student_id, grade_item_id'
      });
      if (gradesError) throw gradesError;
      return { ok: true, row_count: gradeInserts.length };
    }

    if (result.report_type === 'logs') {
       const logs = [];
       for (const row of result.payload) {
          const fullName = row['User full name'] || row['שם מלא'];
          const { data: student } = await supabase
             .from('students')
             .select('id')
             .eq('site_id', siteId)
             .eq('full_name', fullName)
             .limit(1)
             .single();
          
          if (!student) continue;

          logs.push({
             site_id: siteId,
             student_id: student.id,
             course_id: courseId,
             event_time: new Date(row['Time'] || row['זמן']),
             event_name: row['Event name'] || row['שם האירוע'],
             event_context: row['Event context'] || row['הקשר האירוע'],
             origin_data: row
          });
       }

       const { error } = await supabase.from('activity_logs').insert(logs);
       if (error) throw error;
       return { ok: true, row_count: logs.length };
    }

    return { ok: true, row_count: 0 };
  } catch (err: any) {
    console.error("Import error:", err);
    return { ok: false, error: err.message };
  }
}
