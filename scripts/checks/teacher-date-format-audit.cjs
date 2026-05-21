#!/usr/bin/env node

const fs = require("fs");

function fail(message) {
  console.error(`TEACHER_DATE_FORMAT_AUDIT_FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

const requiredFiles = [
  "RULES.md",
  "PROJECT_RULES.md",
  "docs/rules/TEACHER_DATE_DISPLAY_DMY_SHORT_V1.md",
  "src/lib/teacherDateFormat.ts",
  "src/pages/Dashboard.tsx",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) fail(`missing file: ${file}`);
  ok(`found ${file}`);
}

const helper = fs.readFileSync("src/lib/teacherDateFormat.ts", "utf8");
if (!helper.includes("formatTeacherDateDmyShort")) fail("missing helper function");
if (!helper.includes("${day}/${month}/${year}")) fail("helper does not return D/M/YY shape");
ok("helper uses D/M/YY shape");

const rules = fs.readFileSync("RULES.md", "utf8");
const projectRules = fs.readFileSync("PROJECT_RULES.md", "utf8");
for (const text of [rules, projectRules]) {
  if (!text.includes("D/M/YY")) fail("rules missing D/M/YY");
  if (!text.includes("5/3/26")) fail("rules missing required example 5/3/26");
}
ok("rules record permanent date format");

const dashboard = fs.readFileSync("src/pages/Dashboard.tsx", "utf8");
if (!dashboard.includes("formatTeacherDateDmyShort")) fail("Dashboard does not use central teacher date helper");
if (dashboard.includes('month: "long"') || dashboard.includes("weekday:")) {
  fail("Dashboard still uses long teacher-facing date format");
}
ok("Dashboard uses short teacher-facing date format");

console.log("TEACHER_DATE_FORMAT_AUDIT_OK");
