import React from "react";
const C=[{bg:"bg-blue-100",t:"text-blue-700"},{bg:"bg-emerald-100",t:"text-emerald-700"},{bg:"bg-violet-100",t:"text-violet-700"},{bg:"bg-amber-100",t:"text-amber-700"},{bg:"bg-rose-100",t:"text-rose-700"},{bg:"bg-cyan-100",t:"text-cyan-700"},{bg:"bg-indigo-100",t:"text-indigo-700"},{bg:"bg-teal-100",t:"text-teal-700"},{bg:"bg-orange-100",t:"text-orange-700"},{bg:"bg-pink-100",t:"text-pink-700"}];
const h=(n:string)=>{let x=0;for(let i=0;i<n.length;i++)x=(x*31+n.charCodeAt(i))%C.length;return x;};
const ini=(n:string)=>{const p=n.trim().split(/\s+/);return p.length>=2?(p[0][0]+p[p.length-1][0]).toUpperCase():p[0].slice(0,2).toUpperCase();};
const S={sm:"w-8 h-8 text-xs",md:"w-11 h-11 text-sm",lg:"w-14 h-14 text-base"};
export const StudentAvatar:React.FC<{name:string;size?:"sm"|"md"|"lg";className?:string}>=({name,size="md",className=""})=>{const{bg,t}=C[h(name)];return<div className={S[size]+" "+bg+" "+t+" rounded-full flex items-center justify-center font-semibold select-none shrink-0 "+className} title={name}>{ini(name)}</div>;};
export default StudentAvatar;
