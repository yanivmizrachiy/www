#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = process.cwd();
function exists(p){ return fs.existsSync(path.join(root,p)); }
function read(p){ const f=path.join(root,p); return fs.existsSync(f) ? fs.readFileSync(f,"utf8") : ""; }

function walk(dir,out=[]){
  const full=path.join(root,dir);
  if(!fs.existsSync(full)) return out;
  for(const e of fs.readdirSync(full,{withFileTypes:true})){
    const p=path.join(full,e.name);
    const rel=path.relative(root,p).split(path.sep).join("/");
    if(rel.includes("node_modules")||rel.includes(".git")||rel.startsWith("dist/")||rel.startsWith("build/")||rel.startsWith("coverage/")) continue;
    if(e.isDirectory()) walk(rel,out);
    else if(/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(e.name)) out.push(rel);
  }
  return out;
}

const productionFiles = [...walk("src"), ...walk("server"), ...walk("app")];
const allProdText = productionFiles.map(f => "\n// FILE: "+f+"\n"+read(f)).join("\n");
const serverText = read("src/server.js");
const packageJson = read("package.json");

function regexAny(text, arr){ return arr.some(r => r.test(text)); }

let scripts = {};
try { scripts = JSON.parse(packageJson).scripts || {}; } catch {}

const hardcodeFindings = [];
const hardcodeRules = [
  { id:"pilot_course_assignment_259", regex:/(?:courseId|course_id|contextId|context_id|id)\s*[:=]\s*["'`]259["'`]/i },
  { id:"pilot_course_query_259", regex:/(?:course|id)=259\b/i },
  { id:"pilot_course_title", regex:/ספר\s+המודל\s*-\s*חלק\s+ג/ }
];

for(const f of productionFiles){
  read(f).split(/\r?\n/).forEach((line,i)=>{
    for(const rule of hardcodeRules){
      if(rule.regex.test(line)){
        hardcodeFindings.push({rule:rule.id,file:f,line:i+1,text:line.trim().slice(0,220)});
      }
    }
  });
}

const summary = {
  ok: hardcodeFindings.length === 0,
  mode: "MTH_DEEP_LAUNCH_CONTEXT_AUDIT_V1",
  generated_at: new Date().toISOString(),
  productionFilesScanned: productionFiles.length,
  hardcodeFindings,
  endpoints: {
    automationCapabilities: serverText.includes("/api/automation/capabilities") || allProdText.includes("/api/automation/capabilities"),
    automationExportLinks: serverText.includes("/api/automation/export-links") || allProdText.includes("/api/automation/export-links")
  },
  dynamicContextSignals: {
    ltiSessionMarkers: regexAny(allProdText,[/sessionFromRequest/,/importSessionFromRequest/,/ltiSessionAvailable/,/connected\s*[:=]/,/courseId/,/context/i]),
    nrpsMarkers: regexAny(allProdText,[/NRPS/i,/namesroleservice/i,/NamesRole/i,/membership/i]),
    agsMarkers: regexAny(allProdText,[/AGS/i,/lineitems?/i,/LineItem/i,/scores?/i,/results?/i]),
    webServiceMarkers: regexAny(allProdText,[/MOODLE_WS_TOKEN/,/core_webservice_get_site_info/,/core_enrol_get_enrolled_users/,/core_course_get_contents/,/core_completion_get_activities_completion_status/,/gradereport_user_get_grade_items/,/core_grades_get_grades/,/report_log_get_events/]),
    courseStructureMarkers: regexAny(allProdText,[/courseStructure/,/course_sections/,/course_tasks/,/task_completions/,/course-structure-import/,/Activity Completion/i,/Progress report/i])
  },
  scripts: {
    auditMoodleAutomation: !!scripts["audit:moodle-automation"],
    auditMultiTeacherSafety: !!scripts["audit:multi-teacher-safety"],
    auditDeepLaunchContext: !!scripts["audit:deep-launch-context"]
  },
  projectStateSignals: {
    projectRulesExists: exists("PROJECT_RULES.md"),
    projectStatusExists: exists("STATE/project-status.md"),
    aiControlTowerExists: exists("docs/AI_CONTROL_TOWER.md"),
    maxAutomationSpecExists: exists("docs/architecture/MOODLE_MAX_AUTOMATION_MULTI_TEACHER_SPEC.md")
  },
  recommendedNextWorkOrder: {
    title: "Dynamic LTI Capability Probes V1",
    priorities: [
      "Normalize launch context keys dynamically for every teacher/course.",
      "Add safe NRPS/AGS claim detection without exposing raw private payloads.",
      "Bind every import/API result to platform/context/import_batch/source_provenance.",
      "Keep course 259 as pilot evidence only.",
      "Keep Teacher Release NO until isolation validation passes."
    ]
  }
};

fs.mkdirSync(path.join(root,"STATE","automation"),{recursive:true});
fs.writeFileSync(path.join(root,"STATE","automation","DEEP_LAUNCH_CONTEXT_AUDIT.json"), JSON.stringify(summary,null,2), "utf8");

console.log(JSON.stringify(summary,null,2));

if(hardcodeFindings.length){
  console.error("MTH_DEEP_LAUNCH_CONTEXT_AUDIT_FAIL");
  process.exit(1);
}
console.log("MTH_DEEP_LAUNCH_CONTEXT_AUDIT_OK");