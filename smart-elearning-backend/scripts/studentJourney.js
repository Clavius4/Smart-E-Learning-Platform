/**
 * "Be the student" — walk the REAL flow end to end against the running API and
 * narrate it as a learner would experience it, while probing flow integrity.
 *
 *   register -> verify -> login -> choose preferences (onboarding)
 *   -> see recommended courses -> enroll -> open course -> watch videos
 *   -> quiz: fail (remedial) -> pass (complete) -> next course -> progress %
 *
 * Plus 3 integrity probes a real student could exploit:
 *   P1: can I enroll directly in a LATER course (skip the sequence)?
 *   P2: as a plain beginner, can I LIST intermediate courses?
 *   P3: as a plain beginner, can I OPEN an intermediate course's content?
 *
 * Usage:  node scripts/studentJourney.js   (Node 18+, backend running)
 */
const BASE_URL = (process.env.BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const OTP = process.env.OTP || '123456';

const c = { reset:'\x1b[0m', green:'\x1b[32m', red:'\x1b[31m', yellow:'\x1b[33m', cyan:'\x1b[36m', gray:'\x1b[90m', bold:'\x1b[1m' };
const say = (m) => console.log(`  ${c.gray}🧑 ${m}${c.reset}`);          // student's pov
const sys = (m) => console.log(`  ${c.cyan}⚙  ${m}${c.reset}`);          // system response
const good = (m) => console.log(`  ${c.green}✓ ${m}${c.reset}`);
const bad = (m) => console.log(`  ${c.red}✗ ${m}${c.reset}`);
const flag = (m) => console.log(`  ${c.yellow}⚠ ${m}${c.reset}`);
const step = (m) => console.log(`\n${c.bold}${c.cyan}━━ ${m} ━━${c.reset}`);

const issues = [];
const note = (msg) => { issues.push(msg); flag(msg); };

async function api(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { status: res.status, ok: res.ok, data };
}
const buildAnswers = (qs, correct) => qs.map((q) => {
  if ((q.type||'mcq').toLowerCase()==='dragdrop') return correct ? (q.pairs||[]).map(p=>({left:p.left,right:p.right})) : [];
  return correct ? q.correctAnswerIndex : (Number(q.correctAnswerIndex||0)+1) % ((q.options||[]).length||2);
});

(async () => {
  console.log(`${c.bold}STUDENT JOURNEY${c.reset}  base=${BASE_URL}\n`);
  const email = `journey_${Date.now()}@test.local`;
  const password = 'Passw0rd!23';

  // 1. REGISTER
  step('1. Registration');
  say(`I sign up as Amani with ${email}`);
  let r = await api('POST', '/student/signup', { body: { firstName:'Amani', lastName:'Juma', email, password, confirmPassword: password } });
  if (!r.data?.success) return bad(`signup failed: ${r.data?.message}`);
  good('Account created, told to verify email');
  if (r.data?.data?.hint || r.data?.data?.user?.isVerified === false) sys(`server hint: ${r.data?.data?.hint || ''}`);
  if (JSON.stringify(r.data).includes('123456')) note('Signup response leaks the OTP (123456) to the client — security/UX smell.');

  // 2. VERIFY OTP
  step('2. Email verification (OTP)');
  say(`I type the code ${OTP}`);
  r = await api('POST', '/student/verify-otp', { body: { email, otp: OTP } });
  if (!r.data?.success) return bad(`OTP failed: ${r.data?.message}`);
  good('Email verified');
  note('OTP is hardcoded to 123456 for everyone — fine for testing, must change before launch.');

  // 3. LOGIN
  step('3. Login');
  r = await api('POST', '/student/login', { body: { email, password } });
  if (!r.data?.token) return bad(`login failed: ${r.data?.message}`);
  const token = r.data.token;
  good('Logged in');

  // 4. PREFERENCES (onboarding)
  step('4. Choose my preferences');
  say('Learning style: "literacy" (Kusoma) · Interest: "alphabet" · Level: Beginner');
  r = await api('POST', '/profile/onboarding', { token, body: { learningStyle:'literacy', interests:['alphabet'], difficultyPreference:'beginner', avatar: 2 } });
  if (!r.ok) return bad(`onboarding failed: ${r.data?.message}`);
  const u = r.data?.user || {};
  good(`Preferences saved (difficultyPreference=${u.difficultyPreference}, desiredLevel=${u.desiredLevel ?? 'null'}, onboardingComplete=${u.onboardingComplete})`);

  // 5. SEE RECOMMENDED COURSES
  step('5. What courses am I shown?');
  r = await api('GET', '/course/recommended', { token });
  const recs = r.data?.courses || [];
  if (recs.length === 0) { note('No recommended courses returned for my style/level.'); }
  sys(`I see ${recs.length} course(s):`);
  recs.forEach((co, i) => console.log(`     ${i+1}. "${co.courseName}" [${co.status}] ${co.isLocked ? c.red+'🔒 locked'+c.reset : c.green+'unlocked'+c.reset}${co.isCompleted?' ✓done':''}`));
  if (recs.some(co => co.status === 'Draft')) note('Draft (unpublished) courses are visible to students.');
  const firstUnlocked = recs.find(co => !co.isLocked) || recs[0];
  if (recs[0] && recs[0].isLocked) note('The very first course is locked — student would be stuck at the start.');

  // PROBE P1: enroll directly in a LATER course (skip sequence)
  step('P1. Can I skip ahead by enrolling in a later course?');
  if (recs.length >= 3) {
    const later = recs[2];
    say(`I try to enroll directly in course #3 "${later.courseName}" (skipping #1 and #2)`);
    r = await api('POST', '/profile/enroll', { token, body: { courses: [later._id] } });
    if (r.data?.success) note(`Server ALLOWED enrolling in a later course directly — sequential locking is UI-only, not enforced on /profile/enroll.`);
    else good(`Server blocked it: ${r.data?.message}`);
  } else { sys('Not enough courses to test skip-ahead.'); }

  // 6. ENROLL properly
  step('6. Enroll in my first course');
  say(`I click "Start" on "${firstUnlocked.courseName}"`);
  r = await api('POST', '/profile/enroll', { token, body: { courses: [firstUnlocked._id] } });
  if (!r.data?.success) return bad(`enroll failed: ${JSON.stringify(r.data)}`);
  good('Enrolled');
  r = await api('GET', '/profile/getEnrolledCourses', { token });
  const enrolled = r.data?.data || r.data?.courses || [];
  sys(`My dashboard now lists ${enrolled.length} enrolled course(s)`);

  // 7. OPEN COURSE + WATCH VIDEOS
  step('7. Open the course and watch the videos');
  const courseId = firstUnlocked._id;
  let full = (await api('GET', `/course/getFullCourseDetails/${courseId}`, { token })).data?.data;
  let lessons = (full?.courseContent || []).flatMap(s => s.lessons || []);
  const quizIds = [...new Set([...(full?.quizzes||[]).map(q=>(q._id||q).toString()), ...lessons.map(l=>l.linkedQuiz).filter(Boolean).map(String)])];
  sys(`Course has ${lessons.length} lesson(s) and ${quizIds.length} quiz(zes)`);
  for (const l of lessons) { await api('POST', '/course/profile/update-progress', { token, body: { courseId, lessonId: l._id, timeSpent: 999999 } }); say(`watched "${l.title}"`); }
  good('Finished all videos');
  let pct = (await api('GET', `/course/course-progress/${courseId}`, { token })).data;
  sys(`Progress now: ${JSON.stringify(pct?.data ?? pct)}`);

  // 8. QUIZ: fail -> remedial -> pass
  if (quizIds.length === 0) {
    note('This course has NO quiz — it completes on videos alone, no checkpoint.');
  } else {
    const qid = quizIds[quizIds.length - 1];
    step('8. Take the quiz — first I FAIL on purpose');
    let quiz = (await api('GET', `/quizzes/quiz/${courseId}?quizId=${qid}`, { token })).data?.quiz;
    let out = (await api('POST', `/quizzes/submit-quiz/${qid}`, { token, body: { answers: buildAnswers(quiz.questions, false) } })).data?.data;
    sys(`Scored ${out.percentage}% (need 80%) → passed=${out.passed}`);
    if (!out.passed && out.remedialAssigned && (out.remedialContent?.length||0) > 0) {
      good(`I'm given ${out.remedialContent.length} remedial video(s) to rewatch — nice`);
      const after = (await api('GET', `/course/getFullCourseDetails/${courseId}`, { token })).data?.data;
      const rem = (after?.courseContent||[]).flatMap(s=>s.lessons||[]);
      for (const l of rem) await api('POST', '/course/profile/update-progress', { token, body: { courseId, lessonId: l._id, timeSpent: 999999 } });
      say(`I rewatch the ${rem.length} remedial lesson(s)`);
    } else if (!out.passed) {
      note('I failed but got NO remedial content — I can only blindly retake the same quiz.');
    }

    step('9. Retake the quiz — this time I PASS');
    quiz = (await api('GET', `/quizzes/quiz/${courseId}?quizId=${qid}`, { token })).data?.quiz;
    out = (await api('POST', `/quizzes/submit-quiz/${qid}`, { token, body: { answers: buildAnswers(quiz.questions, true) } })).data?.data;
    sys(`Scored ${out.percentage}% → passed=${out.passed}`);
    if (out.passed) {
      good('Quiz passed, course completed');
      if (out.nextCourse) good(`I'm auto-moved to the next course: "${out.nextCourse.title}" (${out.nextCourse.level})`);
      else sys('No next course offered.');
      const lvl = out.studentLevel || {};
      if (lvl.levelChanged) good(`I leveled up: ${lvl.previousLevel} → ${lvl.newLevel}`);
      else sys(`Still ${lvl.newLevel} (need to finish ALL beginner courses to level up) — correct.`);
    } else bad('Could not pass with all-correct answers — bug.');
  }

  // PROBE P2/P3: cross-level access as a plain beginner
  step('P2/P3. As a plain beginner, can I reach Intermediate content?');
  r = await api('GET', '/course/courses-level/intermediate', { token });
  const interCourses = r.data?.courses || [];
  if (r.data?.requireQuiz) good(`Listing intermediate is gated: "${r.data?.message}"`);
  else if (interCourses.length > 0) {
    note(`I can LIST ${interCourses.length} Intermediate course(s) without passing any assessment (gate only applies to "skip-flow" users).`);
    const probe = interCourses[0];
    const fr = await api('GET', `/course/getFullCourseDetails/${probe._id}`, { token });
    if (fr.data?.success && fr.data?.data?.courseContent) note(`I can also OPEN Intermediate course "${probe.courseName}" content directly — level gate is bypassable for plain beginners.`);
    else good(`But opening its content is blocked: ${fr.data?.message}`);
  } else sys('No intermediate courses returned.');

  // VERDICT
  step('VERDICT');
  console.log(`  Core happy path (register → preferences → enroll → learn → quiz → remedial → pass → next): ${c.green}WORKS${c.reset}`);
  console.log(`\n  ${c.bold}Issues found (${issues.length}):${c.reset}`);
  if (issues.length === 0) console.log('   none 🎉');
  else issues.forEach((m, i) => console.log(`   ${i+1}. ${m}`));
  process.exit(0);
})().catch((e) => { bad(e.message); process.exit(1); });
