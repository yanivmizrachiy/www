#!/usr/bin/env node
// MTH_AI_CONTROL_TOWER_SANITY_V1
// Verifies that the AI work-control foundation files are in place and correct.

const fs = require("fs");

let failures = 0;

function check(label, fn) {
  try {
    const result = fn();
    if (result === false) {
      console.error("FAIL: " + label);
      failures++;
    } else {
      console.log("OK:   " + label);
    }
  } catch (e) {
    console.error("FAIL: " + label + " — " + e.message);
    failures++;
  }
}

function fileExists(p) {
  return fs.existsSync(p);
}

function fileContains(p, str) {
  if (!fs.existsSync(p)) return false;
  return fs.readFileSync(p, "utf8").includes(str);
}

check("docs/AI_CONTROL_TOWER.md exists", () => fileExists("docs/AI_CONTROL_TOWER.md"));

check("WORK_ORDERS/CLAUDE_COURSE_STRUCTURE_ACTIVITIES_V1.md exists", () =>
  fileExists("WORK_ORDERS/CLAUDE_COURSE_STRUCTURE_ACTIVITIES_V1.md")
);

check("STATE/project-status.md exists", () => fileExists("STATE/project-status.md"));

check("STATE/progress/2026-05-19-fast-sync.md exists", () =>
  fileExists("STATE/progress/2026-05-19-fast-sync.md")
);

check('Work Order contains "Course Structure & Activities Import V1"', () =>
  fileContains(
    "WORK_ORDERS/CLAUDE_COURSE_STRUCTURE_ACTIVITIES_V1.md",
    "Course Structure & Activities Import V1"
  )
);

check('Work Order contains "Do not touch Participants"', () =>
  fileContains(
    "WORK_ORDERS/CLAUDE_COURSE_STRUCTURE_ACTIVITIES_V1.md",
    "Do not touch Participants"
  )
);

check('Work Order contains "Teacher Release remains NO"', () =>
  fileContains(
    "WORK_ORDERS/CLAUDE_COURSE_STRUCTURE_ACTIVITIES_V1.md",
    "Teacher Release remains NO"
  )
);

if (failures > 0) {
  console.error("\nAI_CONTROL_TOWER_SANITY_FAIL: " + failures + " check(s) failed.");
  process.exit(1);
} else {
  console.log("\nAI_CONTROL_TOWER_SANITY_OK");
}
