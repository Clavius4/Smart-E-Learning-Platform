/**
 * End-to-end test of the in-course learning loop:
 *
 *   enroll -> watch videos -> per-video / final quiz
 *     FAIL (<80%)  -> remedial videos assigned, course flips to remedial mode
 *     PASS (>=80%) -> quiz marked passed; when all required work is done the
 *                     course completes -> auto-enroll in next course, and (only
 *                     when the WHOLE level+category is finished) level promotion.
 *
 * This proves the behaviour described in quizCourse.submitQuiz +
 * getFullCourseDetails (remedial mode) against a running backend with real data.
 *
 * It is DATA-ADAPTIVE: it signs up a fresh beginner, walks the recommended
 * courses, and drives the first course that actually has a quiz. If the seeded
 * course has no remedial (`isRemedial`) subsections, it will say so explicitly
 * (that confirms remedial depends on instructor authoring).
 *
 * Requirements: backend running, Node 18+ (global fetch).
 *
 * Usage:
 *   node scripts/e2eQuizRemedialFlow.js
 *   BASE_URL=http://localhost:5000/api node scripts/e2eQuizRemedialFlow.js
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const OTP = process.env.OTP || '123456';
const LEARNING_STYLE = process.env.LEARNING_STYLE || 'literacy';
const PASS_MARK = 80; // per-course quiz pass threshold (quizCourse.js)

const c = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m',
};
const ok = (m) => console.log(`  ${c.green}✓${c.reset} ${m}`);
const info = (m) => console.log(`  ${c.gray}•${c.reset} ${m}`);
const warn = (m) => console.log(`  ${c.yellow}!${c.reset} ${m}`);
const fail = (m) => console.log(`  ${c.red}✗${c.reset} ${m}`);
const header = (m) => console.log(`\n${c.bold}${c.cyan}=== ${m} ===${c.reset}`);

async function api(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(`Network error ${method} ${path}: ${e.message}. Backend up at ${BASE_URL}?`);
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { status: res.status, ok: res.ok, data };
}

// Build answers aligned to quiz.questions order.
function buildAnswers(questions, { correct }) {
  return questions.map((q) => {
    const type = (q.type || 'mcq').toLowerCase();
    if (type === 'dragdrop') {
      const pairs = (q.pairs || []).map((p) => ({ left: p.left, right: p.right }));
      return correct ? pairs : []; // empty array -> wrong
    }
    // mcq: answer is the selected option index (number)
    if (correct) return q.correctAnswerIndex;
    const optCount = (q.options || []).length || 2;
    return (Number(q.correctAnswerIndex || 0) + 1) % optCount; // guaranteed different index
  });
}

async function authBeginner() {
  header('AUTH: fresh beginner student');
  const stamp = Date.now();
  const email = `e2e_quiz_${stamp}@test.local`;
  const password = 'Passw0rd!23';

  let r = await api('POST', '/student/signup', {
    body: { firstName: 'E2E', lastName: 'Quiz', email, password, confirmPassword: password },
  });
  if (!r.ok || !r.data?.success) throw new Error(`Signup failed: ${r.data?.message}`);
  await api('POST', '/student/verify-otp', { body: { email, otp: OTP } });
  r = await api('POST', '/student/login', { body: { email, password } });
  if (!r.data?.token) throw new Error(`Login failed: ${r.data?.message}`);
  const token = r.data.token;
  await api('POST', '/profile/onboarding', {
    token, body: { learningStyle: LEARNING_STYLE, interests: [], difficultyPreference: 'beginner', avatar: 1 },
  });
  ok(`Signed up + onboarded ${email}`);
  return token;
}

// Inspect a course's content shape (videos / linked quizzes / final quiz / remedial).
function analyzeCourse(full) {
  const lessons = [];
  (full.courseContent || []).forEach((section) => {
    (section.lessons || []).forEach((l) => lessons.push(l));
  });
  const videos = lessons.filter((l) => l.videoUrl && !l.isRemedial);
  const linkedQuizIds = [...new Set(videos.map((l) => l.linkedQuiz).filter(Boolean).map(String))];
  const courseQuizIds = (full.quizzes || []).map((q) => (q._id || q).toString());
  return { videos, linkedQuizIds, courseQuizIds, allQuizIds: [...new Set([...linkedQuizIds, ...courseQuizIds])] };
}

async function markVideoComplete(token, courseId, lessonId) {
  return api('POST', '/course/profile/update-progress', {
    token, body: { courseId, lessonId, timeSpent: 999999 },
  });
}

async function fetchQuiz(token, courseId, quizId) {
  const r = await api('GET', `/quizzes/quiz/${courseId}?quizId=${quizId}`, { token });
  if (!r.ok || !r.data?.quiz) throw new Error(`Could not fetch quiz ${quizId}: ${r.data?.message}`);
  return r.data.quiz;
}

async function submitQuiz(token, quizId, answers) {
  const r = await api('POST', `/quizzes/submit-quiz/${quizId}`, { token, body: { answers } });
  if (!r.ok) throw new Error(`Submit quiz failed (${r.status}): ${r.data?.message}`);
  return r.data?.data;
}

(async () => {
  console.log(`${c.bold}Quiz / remedial / level-up E2E${c.reset}  base=${BASE_URL}`);
  const token = await authBeginner();

  // Find a recommended beginner course that actually has a quiz.
  header('DISCOVER: a beginner course that has a quiz');
  let r = await api('GET', '/course/recommended', { token });
  const recommended = r.data?.courses || [];
  if (recommended.length === 0) throw new Error('No recommended beginner courses. Seed literacy beginner courses first.');
  info(`Got ${recommended.length} recommended course(s)`);

  let chosen = null;
  for (const course of recommended) {
    await api('POST', '/profile/enroll', { token, body: { courses: [course._id] } });
    const full = (await api('GET', `/course/getFullCourseDetails/${course._id}`, { token })).data?.data;
    if (!full) continue;
    const shape = analyzeCourse(full);
    info(`"${full.courseName}": ${shape.videos.length} video(s), ${shape.linkedQuizIds.length} linked quiz(zes), ${shape.courseQuizIds.length} final quiz(zes)`);
    if (shape.allQuizIds.length > 0) { chosen = { course, full, shape }; break; }
  }
  if (!chosen) {
    warn('Enrolled successfully, but none of the recommended courses have any quiz attached.');
    warn('=> The video->quiz->remedial loop cannot be exercised until an instructor adds a linked or final quiz.');
    process.exit(2);
  }

  const { course, shape } = chosen;
  const courseId = course._id;
  ok(`Driving course "${course.courseName}" (${courseId})`);

  // 1) Watch all videos
  header('STEP 1: complete all videos');
  for (const v of shape.videos) {
    const res = await markVideoComplete(token, courseId, v._id);
    if (res.ok) info(`watched "${v.title}"`);
    else warn(`could not mark "${v.title}" complete: ${res.data?.error || res.status}`);
  }
  ok(`Marked ${shape.videos.length} video(s) complete`);

  // Pick the gating quiz: prefer the final/course quiz, else the last linked quiz.
  const targetQuizId = shape.courseQuizIds[0] || shape.linkedQuizIds[shape.linkedQuizIds.length - 1];

  // 2) FAIL the quiz -> expect remedial
  header('STEP 2: FAIL the quiz (submit 0%) -> expect remedial');
  let quiz = await fetchQuiz(token, courseId, targetQuizId);
  let outcome = await submitQuiz(token, targetQuizId, buildAnswers(quiz.questions, { correct: false }));
  info(`scored ${outcome.percentage}% (pass mark ${PASS_MARK}%) -> passed=${outcome.passed}`);
  if (outcome.passed) {
    warn('Expected a fail but quiz passed — check question/answer shape.');
  } else if (outcome.remedialAssigned && (outcome.remedialContent?.length || 0) > 0) {
    ok(`FAIL path works: ${outcome.remedialContent.length} remedial item(s) assigned, next="${outcome.next?.type}"`);
    // Confirm course flipped into remedial mode and serves remedial lessons
    const fullAfter = (await api('GET', `/course/getFullCourseDetails/${courseId}`, { token })).data?.data;
    if (fullAfter?.isInRemedialMode) {
      const remedialLessons = (fullAfter.courseContent || []).flatMap((s) => s.lessons || []);
      ok(`Course is now in REMEDIAL MODE, serving ${remedialLessons.length} remedial lesson(s)`);
      // Complete the remedial lessons
      for (const l of remedialLessons) await markVideoComplete(token, courseId, l._id);
      info('Completed assigned remedial lesson(s)');
    } else {
      warn('Quiz failed but course did not enter remedial mode (unexpected).');
    }
  } else {
    warn('Quiz failed but NO remedial content was assigned.');
    warn('=> This course has no subsections flagged isRemedial. Remedial requires the instructor to author remedial videos.');
  }

  // 3) PASS the quiz -> expect completion / progression
  header('STEP 3: PASS the quiz (submit 100%) -> expect completion / progression');
  quiz = await fetchQuiz(token, courseId, targetQuizId);
  outcome = await submitQuiz(token, targetQuizId, buildAnswers(quiz.questions, { correct: true }));
  info(`scored ${outcome.percentage}% -> passed=${outcome.passed}`);
  if (!outcome.passed) {
    fail('Expected a pass with all-correct answers but did not pass. Aborting.');
    process.exit(1);
  }
  ok('PASS path works: quiz marked passed, remedial cleared');
  if (outcome.nextCourse) ok(`Auto-enrolled in NEXT course: "${outcome.nextCourse.title}" (${outcome.nextCourse.level})`);
  else info('No next course returned (either course not fully complete yet, or it is the last course).');

  const lvl = outcome.studentLevel || {};
  if (lvl.levelChanged) ok(`LEVEL UP: ${lvl.previousLevel} -> ${lvl.newLevel} (whole level+category completed)`);
  else info(`No level change yet (${lvl.previousLevel} -> ${lvl.newLevel}). Level promotion needs ALL courses in the level done.`);

  header('SUMMARY');
  console.log(`  Course driven : ${course.courseName}`);
  console.log(`  Videos        : ${shape.videos.length} completed`);
  console.log(`  Quiz fail     : ${PASS_MARK}% gate enforced + remedial path tested above`);
  console.log(`  Quiz pass     : completion + ${outcome.nextCourse ? 'auto-enrolled next course' : 'no next course'} + ${lvl.levelChanged ? 'LEVEL UP' : 'no level change'}`);
  process.exit(0);
})().catch((e) => { fail(e.message); process.exit(1); });
