/**
 * Read-only data-health audit for the course catalog + placement banks.
 * Run inside the backend container:  node scripts/dataHealth.js
 *
 *   [CRITICAL] vacuous courses (0 videos AND no quiz -> auto-complete instantly)
 *   [CRITICAL] dangling refs (course.quizzes / subSection.linkedQuiz -> missing Quiz;
 *              Quiz.courseId -> missing Course; course.courseContent -> missing Section)
 *   [CRITICAL] level+category that has courses but NO assessment gate (skip-flow impossible)
 *   [WARN]     placement bank smaller than the randomized pool size (step 6 dependency)
 *   [WARN]     ungated courses / fail-with-no-remedy / draft-only level / duplicate names
 *   [INFO]     empty sections, orphan quizzes, courses with no category
 */
require('dotenv').config();
const mongoose = require('mongoose');

const Course = require('../models/course');
const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Quiz = require('../models/quiz');
const Category = require('../models/category');
const Assessment = require('../models/assessment');

const oid = (x) => (x ? x.toString() : null);
const CAT_TO_ASSESS = { kusoma: 'literacy', kuhesabu: 'numeracy' };
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const POOL_MIN = parseInt(process.env.ASSESSMENT_POOL_MIN || '5', 10); // randomized-pool target (step 6)

const findings = { CRITICAL: [], WARN: [], INFO: [] };
const add = (sev, msg) => findings[sev].push(msg);

(async () => {
  await mongoose.connect(process.env.DATABASE_URL);

  const [courses, sections, subs, quizzes, categories, assessments] = await Promise.all([
    Course.find().lean(),
    Section.find().lean(),
    SubSection.find().lean(),
    Quiz.find().select('courseId questions').lean(),
    Category.find().select('name').lean(),
    Assessment.find().select('level category questions').lean(),
  ]);

  const sectionById = new Map(sections.map((s) => [oid(s._id), s]));
  const subById = new Map(subs.map((s) => [oid(s._id), s]));
  const quizById = new Map(quizzes.map((q) => [oid(q._id), q]));
  const courseById = new Map(courses.map((c) => [oid(c._id), c]));
  const assessSet = new Set(assessments.map((a) => `${a.level}/${a.category}`));

  // Placement bank size per level/category (questions summed across docs).
  const bankSize = {};
  assessments.forEach((a) => {
    const k = `${a.level}/${a.category}`;
    bankSize[k] = (bankSize[k] || 0) + (a.questions?.length || 0);
  });

  const referencedQuizIds = new Set();

  for (const co of courses) {
    const label = `"${co.courseName}" (order ${co.order}, ${co.level}, ${co.status})`;
    if (!co.category) add('INFO', `No category: ${label}`);

    const secIds = (co.courseContent || []).map(oid);
    secIds.filter((id) => !sectionById.has(id)).forEach((id) => add('CRITICAL', `Dangling section ref ${id} in ${label}`));

    const courseSubs = [];
    for (const sid of secIds) {
      const sec = sectionById.get(sid);
      if (!sec) continue;
      if ((sec.subSection || []).length === 0) add('INFO', `Empty section ${sid} in ${label}`);
      for (const subId of (sec.subSection || [])) {
        const sub = subById.get(oid(subId));
        if (!sub) { add('CRITICAL', `Dangling subSection ref ${oid(subId)} in ${label}`); continue; }
        courseSubs.push(sub);
      }
    }

    const videos = courseSubs.filter((s) => s.videoUrl && !s.isRemedial);
    const remedial = courseSubs.filter((s) => s.isRemedial);
    const perVideoQuizIds = courseSubs.map((s) => s.linkedQuiz).filter(Boolean).map(oid);
    const finalQuizIds = (co.quizzes || []).map(oid);
    [...perVideoQuizIds, ...finalQuizIds].forEach((q) => referencedQuizIds.add(q));

    finalQuizIds.filter((q) => !quizById.has(q)).forEach((q) => add('CRITICAL', `course.quizzes -> missing Quiz ${q} in ${label}`));
    perVideoQuizIds.filter((q) => !quizById.has(q)).forEach((q) => add('CRITICAL', `subSection.linkedQuiz -> missing Quiz ${q} in ${label}`));

    const hasGate = perVideoQuizIds.length > 0 || finalQuizIds.length > 0;
    if (videos.length === 0 && !hasGate) add('CRITICAL', `Vacuous course (0 videos, 0 quiz -> auto-completes instantly): ${label}`);
    else if (videos.length === 0) add('WARN', `Course has a quiz but 0 videos: ${label}`);
    else if (!hasGate) add('WARN', `Ungated course (has videos, no quiz checkpoint): ${label}`);
    if (hasGate && remedial.length === 0) add('WARN', `Gated but NO remedial videos (fail -> retake only): ${label}`);
  }

  for (const q of quizzes) {
    const id = oid(q._id);
    if (!q.courseId || !courseById.has(oid(q.courseId))) add('CRITICAL', `Quiz ${id} -> Quiz.courseId points to missing/empty Course (${oid(q.courseId)})`);
    if (!referencedQuizIds.has(id)) add('INFO', `Orphan quiz ${id} (not referenced by any course.quizzes or subSection.linkedQuiz)`);
  }

  for (const cat of categories) {
    const assessCat = CAT_TO_ASSESS[cat.name.toLowerCase()] || cat.name.toLowerCase();
    for (let li = 0; li < LEVELS.length; li++) {
      const level = LEVELS[li];
      const group = courses.filter((c) => c.level === level && oid(c.category) === oid(cat._id));
      if (group.length === 0) continue;

      if (li > 0) {
        const key = `${level.toLowerCase()}/${assessCat}`;
        if (!assessSet.has(key)) {
          add('CRITICAL', `${cat.name}/${level}: ${group.length} course(s) but NO ${level} assessment for ${assessCat} -> students cannot unlock this level`);
        } else if ((bankSize[key] || 0) < POOL_MIN) {
          add('WARN', `${cat.name}/${level}: placement bank has ${bankSize[key]} question(s) < pool size ${POOL_MIN} -> randomized pool (step 6) will sample fewer; author more questions`);
        }
      }

      if (group.every((c) => c.status !== 'Published')) add('WARN', `${cat.name}/${level}: all ${group.length} course(s) are Draft (none Published)`);
      const byName = {};
      group.forEach((c) => { byName[c.courseName] = (byName[c.courseName] || 0) + 1; });
      Object.entries(byName).filter(([, n]) => n > 1).forEach(([name, n]) => add('WARN', `${cat.name}/${level}: course name "${name}" appears ${n}× (duplicates)`));
    }
  }

  console.log(`\nDATA HEALTH AUDIT  (courses:${courses.length} quizzes:${quizzes.length} assessments:${assessments.length}, pool target N=${POOL_MIN})`);
  for (const sev of ['CRITICAL', 'WARN', 'INFO']) {
    const list = findings[sev];
    console.log(`\n${'─'.repeat(70)}\n${sev}  (${list.length})\n${'─'.repeat(70)}`);
    if (list.length === 0) console.log('  none');
    else list.forEach((m) => console.log(`  • ${m}`));
  }
  console.log(`\nSUMMARY: ${findings.CRITICAL.length} critical, ${findings.WARN.length} warnings, ${findings.INFO.length} info`);
  await mongoose.disconnect();
  process.exit(findings.CRITICAL.length > 0 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
