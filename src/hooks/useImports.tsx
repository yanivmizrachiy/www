import{useState,useEffect,useCallback}from"react";
import{supabase}from"@/lib/supabaseClient";
import{useLTIContext}from"@/hooks/useLTIContext";
export interface ImportRecord{id:string;created_at:string;course_id:number;teacher_id:number;source:"manual"|"lti"|"api";status:"success"|"partial"|"failed";rows_imported:number;rows_failed:number;filename?:string|null;}
let _c:{data:ImportRecord[];ts:number;cid:number}|null=null;
export function useImports(){const{course,teacher}=useLTIContext();const[imports,setI]=useState<ImportRecord[]>([]);const[loading,setL]=useState(true);const[error,setE]=useState<string|null>(null);
  const load=useCallback(async(force=false)=>{if(!course?.id||!teacher?.id){setL(false);return;}const now=Date.now();if(!force&&_c&&_c.cid===course.id&&now-_c.ts<300000){setI(_c.data);setL(false);return;}setL(true);setE(null);try{const{data,error:e}=await supabase.from("grade_imports").select("*").eq("course_id",course.id).eq("teacher_id",teacher.id).order("created_at",{ascending:false}).limit(20);if(e)throw e;const r=data??[];_c={data:r,ts:now,cid:course.id};setI(r);}catch(e:unknown){setE(e instanceof Error?e.message:"שגיאה");setI([]);}finally{setL(false);}
  },[course?.id,teacher?.id]);
  useEffect(()=>{load();},[load]);
  return{imports,loading,error,refresh:()=>load(true),lastImport:imports[0]??null};
}
