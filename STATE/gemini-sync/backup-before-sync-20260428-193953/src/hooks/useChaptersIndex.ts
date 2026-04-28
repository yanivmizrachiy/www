import { useMemo } from "react";
import { useMoodleData } from "@/hooks/useMoodleData";

/**
 * Real chapter index built from core_course_get_contents.
 * Provides a cmid → section map so Tasks can show real chapter names
 * derived from the actual Moodle course structure (no invented links).
 */

export interface ChapterModule {
  id: number; // cmid
  name: string;
  modname: string;
  url?: string;
}
export interface Chapter {
  id: number; // section id
  section: number; // section number
  name: string;
  visible: boolean;
  summary?: string;
  modules: ChapterModule[];
}

interface RawSection {
  id: number;
  section?: number;
  name?: string;
  visible?: number;
  summary?: string;
  modules?: Array<{ id: number; name: string; modname: string; url?: string }>;
}

export function useChaptersIndex(enabled: boolean) {
  const { data, loading, error, refresh } = useMoodleData<RawSection[]>("course_contents", enabled);

  const chapters: Chapter[] = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((s) => ({
      id: s.id,
      section: s.section ?? 0,
      name: (s.name && s.name.trim()) || `פרק ${s.section ?? s.id}`,
      visible: s.visible !== 0,
      summary: s.summary,
      modules: (s.modules ?? []).map((m) => ({
        id: m.id, name: m.name, modname: m.modname, url: m.url,
      })),
    }));
  }, [data]);

  // cmid → { chapterId, chapterName }
  const cmidMap = useMemo(() => {
    const m = new Map<number, { chapterId: number; chapterName: string }>();
    chapters.forEach((c) => {
      c.modules.forEach((mod) => {
        m.set(mod.id, { chapterId: c.id, chapterName: c.name });
      });
    });
    return m;
  }, [chapters]);

  return { chapters, cmidMap, loading, error, refresh };
}
