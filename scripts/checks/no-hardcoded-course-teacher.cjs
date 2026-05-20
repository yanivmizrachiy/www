#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const scanRoots = ["src", "server", "app"].filter(p => fs.existsSync(path.join(root,p)));
const exts = new Set([".js",".jsx",".ts",".tsx",".mjs",".cjs"]);

function walk(dir,out=[]){
  const full = path.join(root,dir);
  if(!fs.existsSync(full)) return out;
  for(const e of fs.readdirSync(full,{withFileTypes:true})){
    const p = path.join(full,e.name);
    const rel = path.relative(root,p).split(path.sep).join("/");
    if(rel.includes("node_modules") || rel.includes(".git") || rel.startsWith("dist/") || rel.startsWith("build/")) continue;
    if(e.isDirectory()) walk(rel,out);
    else if(exts.has(path.extname(e.name))) out.push(rel);
  }
  return out;
}

const rules = [
  {id:"hardcoded_course_259_assignment", regex:/(?:courseId|course_id|contextId|context_id|id)\s*[:=]\s*["'`]259["'`]/i},
  {id:"hardcoded_course_259_query", regex:/(?:course|id)=259\b/i},
  {id:"hardcoded_pilot_course_title", regex:/ספר\s+המודל\s*-\s*חלק\s+ג/}
];

let failures = [];
for(const r of scanRoots){
  for(const f of walk(r)){
    const lines = fs.readFileSync(path.join(root,f),"utf8").split(/\r?\n/);
    lines.forEach((line,i)=>{
      for(const rule of rules){
        if(rule.regex.test(line)){
          failures.push({rule:rule.id,file:f,line:i+1,text:line.trim().slice(0,220)});
        }
      }
    });
  }
}

if(failures.length){
  console.error("MTH_MULTI_TEACHER_SAFETY_AUDIT_FAIL");
  console.error(JSON.stringify(failures,null,2));
  process.exit(1);
}

console.log("MTH_MULTI_TEACHER_SAFETY_AUDIT_OK");