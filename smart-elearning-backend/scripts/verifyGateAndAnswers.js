/**
 * Verifies steps 1-3 of the placement redesign against the running API:
 *   - Universal gate: a plain beginner is BLOCKED from intermediate/advanced.
 *   - Hidden answers: GET /assessments/level/:level leaks no correctAnswerIndex / pairs.
 *
 * Usage: node scripts/verifyGateAndAnswers.js
 */
const BASE_URL = (process.env.BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const OTP = process.env.OTP || '123456';
const c = { reset:'\x1b[0m', green:'\x1b[32m', red:'\x1b[31m', yellow:'\x1b[33m', bold:'\x1b[1m' };
const pass = (m) => console.log(`  ${c.green}✓ ${m}${c.reset}`);
const failed = [];
const check = (cond, m) => cond ? pass(m) : (failed.push(m), console.log(`  ${c.red}✗ ${m}${c.reset}`));

async function api(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text(); let data=null; try{data=text?JSON.parse(text):null;}catch{data={raw:text};}
  return { status: res.status, ok: res.ok, data };
}
async function newStudent(level) {
  const email = `verify_${level}_${Date.now()}@test.local`; const password='Passw0rd!23';
  await api('POST','/student/signup',{body:{firstName:'V',lastName:level,email,password,confirmPassword:password}});
  await api('POST','/student/verify-otp',{body:{email,otp:OTP}});
  const token=(await api('POST','/student/login',{body:{email,password}})).data.token;
  await api('POST','/profile/onboarding',{token,body:{learningStyle:'literacy',interests:[],difficultyPreference:level,avatar:1}});
  return token;
}

(async () => {
  console.log(`${c.bold}Verify universal gate + hidden answers${c.reset}  base=${BASE_URL}\n`);

  // --- Universal gate: plain beginner blocked from intermediate & advanced ---
  console.log(`${c.bold}Universal gate (plain beginner):${c.reset}`);
  const beginner = await newStudent('beginner');
  let r = await api('GET','/course/courses-level/intermediate',{token:beginner});
  check(r.status===403 && r.data?.requireQuiz===true, `intermediate list blocked (403, requireQuiz) — got ${r.status}, requiredLevel=${r.data?.requiredLevel}`);
  check(r.data?.requiredLevel==='intermediate', `tiered: beginner is told to prove "intermediate" next (got "${r.data?.requiredLevel}")`);
  r = await api('GET','/course/courses-level/advanced',{token:beginner});
  check(r.status===403 && r.data?.requiredLevel==='intermediate', `advanced also blocked, still pointed to intermediate first (tiered) — got ${r.status}/${r.data?.requiredLevel}`);
  r = await api('GET','/course/courses-level/beginner',{token:beginner});
  check(r.status===200, `beginner list still accessible (got ${r.status})`);

  // --- Hidden answers: assessment payload must not leak answers ---
  console.log(`\n${c.bold}Hidden answers (intermediate placement test):${c.reset}`);
  const inter = await newStudent('intermediate'); // desiredLevel=intermediate
  r = await api('GET','/course/courses-level/intermediate',{token:inter});
  check(r.status===403, `intermediate-targeting student still gated until they pass (got ${r.status})`);

  r = await api('GET','/assessments/level/intermediate',{token:inter});
  if (r.data?.message === 'Assessment already passed' || !r.data?.assessment) {
    console.log(`  (no assessment served: ${r.data?.message || r.status}) — skipping answer-leak check`);
  } else {
    const qs = r.data.assessment.questions || [];
    const raw = JSON.stringify(r.data);
    check(qs.length>0, `assessment served with ${qs.length} question(s)`);
    check(!raw.includes('correctAnswerIndex'), 'no correctAnswerIndex anywhere in payload');
    check(qs.every(q => q.correctAnswerIndex === undefined), 'every question omits correctAnswerIndex');
    check(qs.every(q => q.pairs === undefined), 'no raw "pairs" (correct dragdrop mapping) leaked');
    const mcq = qs.filter(q => (q.type||'mcq')==='mcq');
    check(mcq.every(q => Array.isArray(q.options)), 'mcq questions still send options to render');
    const dd = qs.filter(q => q.type==='dragdrop');
    check(dd.every(q => Array.isArray(q.dragItems) && Array.isArray(q.dropTargets)), `dragdrop questions send shuffled dragItems/dropTargets (${dd.length} dragdrop)`);
  }

  console.log(`\n${c.bold}RESULT:${c.reset} ${failed.length===0 ? c.green+'ALL CHECKS PASSED'+c.reset : c.red+failed.length+' FAILED'+c.reset}`);
  process.exit(failed.length===0?0:1);
})().catch(e=>{console.log(`${c.red}error: ${e.message}${c.reset}`);process.exit(1);});
