import React from "react";
interface SP{className?:string;width?:string|number;height?:string|number;rounded?:"sm"|"md"|"lg"|"full";lines?:number;}
export const Skeleton:React.FC<SP>=({className="",width,height,rounded="md",lines})=>{
  const r={sm:"rounded-sm",md:"rounded-md",lg:"rounded-lg",full:"rounded-full"}[rounded];
  const b="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";
  if(lines&&lines>1)return(<div className={"flex flex-col gap-2 "+className}>{Array.from({length:lines}).map((_,i)=>(<div key={i} className={b+" "+r+" h-4"} style={{width:i===lines-1?"60%":"100%"}}/>))}</div>);
  return<div className={b+" "+r+" "+className} style={{width:width??"100%",height:height??"1rem"}}/>;
};
export const StudentCardSkeleton:React.FC=()=>(<div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white"><Skeleton rounded="full" width={44} height={44}/><div className="flex-1"><Skeleton height={16} width="55%" className="mb-2"/><Skeleton height={12} width="35%"/></div><Skeleton width={48} height={28} rounded="lg"/></div>);
export const StudentsPageSkeleton:React.FC=()=>(<div className="space-y-3 p-4" dir="rtl"><div className="flex items-center justify-between mb-4"><Skeleton height={28} width={140} rounded="lg"/><Skeleton height={36} width={200} rounded="lg"/></div>{Array.from({length:6}).map((_,i)=><StudentCardSkeleton key={i}/>)}</div>);
export default Skeleton;
