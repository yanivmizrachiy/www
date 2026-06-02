import { useMoodleData } from "@/hooks/useMoodleData";

export interface Student {
  id: number;
  fullname: string;
  email?: string;
  grade?: number | null;
}

export function useStudents() {
  const { data, loading, error, refresh } = useMoodleData("students");
  return {
    students: (data as Student[]) ?? [],
    loading,
    error,
    refresh,
  };
}
