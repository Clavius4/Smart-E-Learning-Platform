/**
 * Verifies steps 4 & 5 (run INSIDE the backend container).
 *   - Tiered climb: target Advanced => must pass Intermediate THEN Advanced.
 *   - Tiered guard: cannot submit a tier above your next required one.
 *   - Cooldown: a 2nd submit right after a fail is 429-blocked.
 *   - Attempt cap: 3 fails => settle at proven level ("next level down").
 *
 * Reads correct answers from the DB (answers are hidden from the API by design)
 * and resets lastAttemptAt to simulate cooldown elapsing between attempts.
 *
 * Usage (in container):  node scripts/verifyTieredFlow.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const Assessment = require('../models/assessment');
const Student = require('../models/StudentModels/studentModels');

const CAT = 'literacy';
const STYLE = 'literacy';
const failures = [];
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const no = (m) => { failures.push(m); console.log(`  \x1b[31m✗ ${m}\x1b[0m`); };
const check = (c, m) => (c ? ok(m) : no(m));
const head = (m) => console.log(`\n\x1b[1m\x1b[36m━━ ${m} ━━\x1b[0m`);

function req(method, path, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request({ host: 'localhost', port: 5000, path: `/api${path}`, method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) } },
      (res) => { let b = ''; res.on('data', (c) => b += c); res.on('end', () => { let j = null; try { j = b ? JSON.parse(b) : null; } catch { j = { raw: b }; } resolve({ status: res.statusCode, data: j }); }); });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}
async function answersFor(level, correct) {
  const a = await Assessment.findOne({ level, category: CAT }).lean();
  return a.questions.map((q) => (q.type === 'dragdrop')
    ? { selectedPairs: (q.pairs || []).map((p) => correct ? { drag: p.drag, drop: p.drop } : { drag: p.drag, drop: 'WRONG' }) }
    : { selected: correct ? q.correctAnswerIndex : (Number(q.correctAnswerIndex || 0) + 1) % ((q.options || []).length || 2) });
}
async function newStudent(target) {
  const email = `tiered_${target}_${Date.now()}@t.local`, password = 'Passw0rd!23';
  await req('POST', '/student/signup', { body: { firstName: 'T', lastName: target, email, password, confirmPassword: password } });
  await req('POST', '/student/verify-otp', { body: { email, otp: '123456' } });
  const token = (await req('POST', '/student/login', { body: { email, password } })).data.token;
  await req('POST', '/profile/onboarding', { token, body: { learningStyle: STYLE, interests: [], difficultyPreference: target, avatar: 1 } });
  return { email, token };
}
const clearCooldown = (email, level) => Student.updateOne({ email, 'assessmentAttempts.level': level }, { $set: { 'assessmentAttempts.$.lastAttemptAt': null } });

(async () => {
  await mongoose.connect(process.env.DATABASE_URL);

  head('Tiered climb: target Advanced must pass Intermediate THEN Advanced');
  const adv = await newStudent('advanced');
  // guard: cannot jump straight to advanced
  let r = await req('GET', '/assessments/level/advanced', { token: adv.token });
  check(r.status === 403 && r.data?.requiredLevel === 'intermediate', `can't access Advanced test yet; told to prove intermediate (got ${r.status}/${r.data?.requiredLevel})`);
  // pass intermediate
  r = await req('GET', '/assessments/level/intermediate', { token: adv.token });
  check(r.status === 200 && r.data?.attemptsLeft === 3, `Intermediate test served, attemptsLeft=3 (got ${r.data?.attemptsLeft})`);
  r = await req('POST', `/assessments/submit/${r.data.assessment._id}`, { token: adv.token, body: { answers: await answersFor('intermediate', true) } });
  check(r.data?.passed && r.data?.nextStep === 'assessment:advanced' && r.data?.provenLevel === 'intermediate',
    `passed Intermediate → still climbing (nextStep=${r.data?.nextStep}, provenLevel=${r.data?.provenLevel})`);
  // now advanced is unlocked
  r = await req('GET', '/assessments/level/advanced', { token: adv.token });
  check(r.status === 200, `Advanced test now served (got ${r.status})`);
  r = await req('POST', `/assessments/submit/${r.data.assessment._id}`, { token: adv.token, body: { answers: await answersFor('advanced', true) } });
  check(r.data?.passed && r.data?.nextStep === 'enrolled' && r.data?.provenLevel === 'advanced',
    `passed Advanced → target reached (nextStep=${r.data?.nextStep}, provenLevel=${r.data?.provenLevel})`);
  const advDoc = await Student.findOne({ email: adv.email }).lean();
  check(advDoc.difficultyPreference === 'advanced' && !advDoc.desiredLevel, `student is now advanced, desiredLevel cleared`);

  head('Cooldown: a 2nd submit right after a fail is blocked');
  const cd = await newStudent('intermediate');
  let g = await req('GET', '/assessments/level/intermediate', { token: cd.token });
  const interId = g.data.assessment._id;
  r = await req('POST', `/assessments/submit/${interId}`, { token: cd.token, body: { answers: await answersFor('intermediate', false) } });
  check(r.data?.passed === false && r.data?.nextStep === 'retry' && r.data?.attemptsLeft === 2, `1st fail → retry, attemptsLeft=2 (got ${r.data?.attemptsLeft})`);
  r = await req('POST', `/assessments/submit/${interId}`, { token: cd.token, body: { answers: await answersFor('intermediate', false) } });
  check(r.status === 429 && r.data?.reason === 'cooldown', `immediate retry blocked by cooldown (got ${r.status}/${r.data?.reason})`);

  head('Attempt cap: 3 fails → settle at "next level down" (beginner)');
  // already 1 fail; clear cooldown and fail 2 more
  await clearCooldown(cd.email, 'intermediate');
  r = await req('POST', `/assessments/submit/${interId}`, { token: cd.token, body: { answers: await answersFor('intermediate', false) } });
  check(r.data?.nextStep === 'retry' && r.data?.attemptsLeft === 1, `2nd fail → retry, attemptsLeft=1 (got ${r.data?.attemptsLeft})`);
  await clearCooldown(cd.email, 'intermediate');
  r = await req('POST', `/assessments/submit/${interId}`, { token: cd.token, body: { answers: await answersFor('intermediate', false) } });
  check(r.data?.nextStep === 'settled' && r.data?.settledLevel === 'beginner' && r.data?.attemptsLeft === 0,
    `3rd fail → SETTLED at beginner (nextStep=${r.data?.nextStep}, settledLevel=${r.data?.settledLevel})`);
  const cdDoc = await Student.findOne({ email: cd.email }).lean();
  check(cdDoc.difficultyPreference === 'beginner' && !cdDoc.desiredLevel, `settled student: difficultyPreference=beginner, desiredLevel cleared`);
  r = await req('GET', '/assessments/level/intermediate', { token: cd.token });
  check(r.status === 403 && r.data?.reason === 'attempts_exhausted', `exhausted student is locked out of the test (got ${r.status}/${r.data?.reason})`);

  console.log(`\n\x1b[1mRESULT:\x1b[0m ${failures.length === 0 ? '\x1b[32mALL PASSED\x1b[0m' : `\x1b[31m${failures.length} FAILED\x1b[0m`}`);
  await mongoose.disconnect();
  process.exit(failures.length === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
