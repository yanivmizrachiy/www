// Run on Node 22+: node --experimental-strip-types --test tests/moodle-course-url.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { parseMoodleCourseUrl, isCourseInVerifiedSession } from "../src/lib/moodleCourseUrl.ts";

const host = "https://moodlemoe.lms.education.gov.il";
const site = { site_url: host };
const session = { course_id: 259 };

test("parses only a well formed Moodle course link", () => {
  assert.deepEqual(parseMoodleCourseUrl(host + "/course/view.php?id=259"), {
    ok: true, course: { origin: host, courseId: 259 },
  });
  assert.equal(parseMoodleCourseUrl(host + "/course/view.php?id=259&section=2").ok, true);
  assert.equal(parseMoodleCourseUrl(host + "/course/view.php?section=2&id=259").ok, true);
});

test("rejects malicious, ambiguous and non-course URLs", () => {
  const bad = [
    "https://moodlemoe.lms.education.gov.il.attacker.invalid/course/view.php?id=259",
    "https://moodlemoe.lms.education.gov.il@evil.invalid/course/view.php?id=259",
    "https://user:pass@moodlemoe.lms.education.gov.il/course/view.php?id=259",
    "http://moodlemoe.lms.education.gov.il/course/view.php?id=259",
    "javascript:alert(1)",
    "https://127.0.0.1/course/view.php?id=259",
    "https://moodlemoe.lms.education.gov.il:444/course/view.php?id=259",
    "https://moodlemoe.lms.education.gov.il/course/view.php?id=259#secret",
    "https://moodlemoe.lms.education.gov.il/course/view.php?id=259&id=260",
    "https://moodlemoe.lms.education.gov.il/course/view.php?id=0",
    "https://moodlemoe.lms.education.gov.il/course/view.php?id=-1",
    "https://moodlemoe.lms.education.gov.il/course/view.php?id=9007199254740999",
    "https://moodlemoe.lms.education.gov.il/course/view.php?id=259&redirect=https://evil.invalid",
    "https://moodlemoe.lms.education.gov.il/mod/quiz/view.php?id=259",
    "",
  ];
  for (const url of bad) {
    assert.equal(parseMoodleCourseUrl(url).ok, false, url);
  }
});

test("accepts a non-Ministry HTTPS Moodle only when its origin comes from verified server context", () => {
  const trusted = "https://school.moodle.example";
  const url = trusted + "/course/view.php?id=259";
  assert.equal(parseMoodleCourseUrl(url).ok, false);
  assert.equal(parseMoodleCourseUrl(url, trusted).ok, true);
  assert.equal(parseMoodleCourseUrl(url, "https://different.example").ok, false);
});

test("a pasted URL cannot select a different course, host, or missing session", () => {
  const result = parseMoodleCourseUrl(host + "/course/view.php?id=259");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(isCourseInVerifiedSession(result.course, session, site), true);
  assert.equal(isCourseInVerifiedSession(result.course, { course_id: 260 }, site), false);
  assert.equal(isCourseInVerifiedSession(result.course, session, { site_url: "https://evil.invalid" }), false);
  assert.equal(isCourseInVerifiedSession(result.course, session, null), false);
  assert.equal(isCourseInVerifiedSession(result.course, null, site), false);
});
