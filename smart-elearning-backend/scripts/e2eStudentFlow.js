/**
 * End-to-end student flow test: registration -> enrollment, across ALL levels.
 *
 * Covers the two enrollment paths that exist in the codebase:
 *   - BEGINNER:               manual enrollment via POST /api/profile/enroll
 *   - INTERMEDIATE / ADVANCED: "skip flow" -> pass the level assessment, which
 *                              auto-enrolls the student in the first course of
 *                              that level (assessmentController.submitAssessment).
 *
 * Flow per level:
 *   signup -> verify-otp (123456) -> login -> onboarding
 *     beginner:      GET /course/recommended -> POST /profile/enroll
 *     intermediate:  GET /assessments/level/:level -> POST /assessments/submit/:id
 *     advanced:      (same as intermediate)
 *   -> GET /profile/getEnrolledCourses  (verify)
 *
 * Requirements:
 *   - Backend running (default http://localhost:5000) with a seeded DB that has
 *     courses + assessments for the levels you want to test.
 *   - Node 18+ (uses global fetch).
 *
 * Usage:
 *   node scripts/e2eStudentFlow.js
 *   BASE_URL=http://localhost:5000/api node scripts/e2eStudentFlow.js
 *   LEVELS=beginner,intermediate node scripts/e2eStudentFlow.js
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const HARDCODED_OTP = process.env.OTP || '123456';
const LEARNING_STYLE = process.env.LEARNING_STYLE || 'literacy'; // -> assessment category "literacy"
const LEVELS = (process.env.LEVELS || 'beginner,intermediate,advanced')
  .split(',')
  .map((l) => l.trim().toLowerCase())
  .filter(Boolean);

// ----- tiny console helpers -----
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
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(`Network error calling ${method} ${path}: ${e.message}. Is the backend running at ${BASE_URL}?`);
  }
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { status: res.status, ok: res.ok, data };
}

// Build a fully-correct answer set from an assessment payload so the student passes.
function buildCorrectAnswers(questions) {
  return questions.map((q) => {
    const type = q.type || 'mcq';
    if (type === 'dragdrop') {
      // submitAssessment expects selectedPairs to match question.pairs in order.
      return { selectedPairs: (q.pairs || []).map((p) => ({ drag: p.drag, drop: p.drop })) };
    }
    return { selected: q.correctAnswerIndex };
  });
}

async function runLevel(level) {
  header(`LEVEL: ${level.toUpperCase()}`);
  const stamp = Date.now();
  const email = `e2e_${level}_${stamp}@test.local`;
  const password = 'Passw0rd!23';
  const firstName = 'E2E';
  const lastName = level.charAt(0).toUpperCase() + level.slice(1);

  const result = { level, email, enrolled: 0, path: null, passed: false };

  // 1) SIGNUP
  let r = await api('POST', '/student/signup', {
    body: { firstName, lastName, email, password, confirmPassword: password },
  });
  if (!r.ok || !r.data?.success) throw new Error(`Signup failed (${r.status}): ${r.data?.message}`);
  ok(`Signed up ${email}`);

  // 2) VERIFY OTP
  r = await api('POST', '/student/verify-otp', { body: { email, otp: HARDCODED_OTP } });
  if (!r.ok || !r.data?.success) throw new Error(`OTP verify failed (${r.status}): ${r.data?.message}`);
  ok(`Verified email with OTP ${HARDCODED_OTP}`);

  // 3) LOGIN
  r = await api('POST', '/student/login', { body: { email, password } });
  if (!r.ok || !r.data?.token) throw new Error(`Login failed (${r.status}): ${r.data?.message}`);
  const token = r.data.token;
  ok('Logged in, got JWT');

  // 4) ONBOARDING (sets learningStyle + difficultyPreference/desiredLevel)
  r = await api('POST', '/profile/onboarding', {
    token,
    body: { learningStyle: LEARNING_STYLE, interests: [], difficultyPreference: level, avatar: 1 },
  });
  if (!r.ok) throw new Error(`Onboarding failed (${r.status}): ${r.data?.message}`);
  const u = r.data?.user || {};
  ok(`Onboarded (style=${LEARNING_STYLE}, difficultyPreference=${u.difficultyPreference}, desiredLevel=${u.desiredLevel ?? 'null'})`);

  if (level === 'beginner') {
    // ----- BEGINNER: manual enrollment path -----
    result.path = 'manual-enroll';
    r = await api('GET', '/course/recommended', { token });
    const courses = r.data?.courses || [];
    if (!r.ok || courses.length === 0) {
      warn(`No recommended beginner courses returned (${r.status}). Seed beginner "${LEARNING_STYLE}" courses to test enrollment.`);
      return result;
    }
    const target = courses.find((co) => !co.isLocked) || courses[0];
    info(`Found ${courses.length} recommended course(s); enrolling in "${target.courseName}"`);

    r = await api('POST', '/profile/enroll', { token, body: { courses: [target._id] } });
    if (!r.ok || !r.data?.success) throw new Error(`Enroll failed (${r.status}): ${r.data?.message}`);
    ok(`Enrolled in beginner course "${target.courseName}"`);

    r = await api('GET', '/profile/getEnrolledCourses', { token });
    const enrolled = r.data?.data || r.data?.courses || [];
    result.enrolled = Array.isArray(enrolled) ? enrolled.length : 0;
    result.gated = result.enrolled > 0;
    if (result.enrolled > 0) ok(`Verified: ${result.enrolled} enrolled course(s): ${enrolled.map((e) => e.courseName).join(', ')}`);
    else warn('Enrolled-courses list came back empty after enrollment.');
    return result;
  }

  // ----- INTERMEDIATE / ADVANCED: tiered placement. Answers are hidden by
  // design, so this script asserts the GATING is correct; the full pass-through
  // (read answers from DB, climb tiers, settle on fail) lives in verifyTieredFlow.js.
  if (level === 'intermediate') {
    result.path = 'placement-gated';
    r = await api('GET', '/assessments/level/intermediate', { token });
    if (r.status !== 200 || !r.data?.assessment) {
      warn(`Intermediate placement not served (${r.status}): ${r.data?.message}`);
      return result;
    }
    const leaks = JSON.stringify(r.data).includes('correctAnswerIndex');
    result.gated = !leaks;
    if (leaks) fail('Placement payload LEAKS correctAnswerIndex (should be hidden).');
    else ok(`Intermediate placement served WITHOUT answers (attemptsLeft=${r.data.attemptsLeft}). Full climb: scripts/verifyTieredFlow.js`);
  } else { // advanced
    result.path = 'placement-tiered-guard';
    r = await api('GET', '/assessments/level/advanced', { token });
    result.gated = r.status === 403 && r.data?.requiredLevel === 'intermediate';
    if (result.gated) ok('Advanced correctly gated behind Intermediate first (403, requiredLevel=intermediate)');
    else fail(`Expected advanced to require intermediate first; got ${r.status}/${r.data?.requiredLevel}`);
  }
  return result;
}

(async () => {
  console.log(`${c.bold}Student E2E flow${c.reset}  base=${BASE_URL}  levels=[${LEVELS.join(', ')}]`);
  const summary = [];
  for (const level of LEVELS) {
    try {
      summary.push(await runLevel(level));
    } catch (e) {
      fail(e.message);
      summary.push({ level, error: e.message });
    }
  }

  header('SUMMARY');
  let allGood = true;
  for (const s of summary) {
    if (s.error) {
      allGood = false;
      console.log(`  ${c.red}✗ ${s.level.padEnd(13)}${c.reset} ERROR: ${s.error}`);
    } else if (s.gated) {
      const detail = s.enrolled > 0 ? `${s.enrolled} enrolled course(s)` : 'gated correctly';
      console.log(`  ${c.green}✓ ${s.level.padEnd(13)}${c.reset} ${s.path} -> ${detail}`);
    } else {
      allGood = false;
      console.log(`  ${c.yellow}! ${s.level.padEnd(13)}${c.reset} ${s.path || 'n/a'} -> check failed (see above)`);
    }
  }
  process.exit(allGood ? 0 : 1);
})();
