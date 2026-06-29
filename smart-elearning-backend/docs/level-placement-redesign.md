# Level Placement Redesign — "prove you deserve the level"

Decisions locked (2026-06-29):
- **A. Tiered** — Advanced requires proving Intermediate *and* Advanced.
- **B. On fail → offer the next level down.**
- **C. Integrity** — stop sending answers, attempt limit + cooldown, bigger randomized pool, enforce the gate for **all** students.

---

## 1. The unifying rule

> **A student's level = the highest level they have *consecutively* proven, starting from Beginner.**

| Target level chosen | Must pass (in order) | Lands at if they stop/fail |
|---|---|---|
| Beginner | nothing | Beginner |
| Intermediate | Intermediate assessment | Beginner (if fail) |
| Advanced | Intermediate **then** Advanced assessment | Beginner (fail Inter) / Intermediate (pass Inter, fail Adv) |

This is why **Tiered + "next level down" collapse into one rule**: a failure simply leaves you at the highest tier you already cleared. No special-casing.

All assessments are scoped to the student's **category** (literacy/numeracy, derived from learning style). You prove a level *within your category*.

---

## 2. Onboarding behavior (unchanged intent, clarified)

- Pick Beginner → `difficultyPreference='beginner'`, `desiredLevel=null`.
- Pick Intermediate/Advanced → `difficultyPreference='beginner'`, `desiredLevel=<choice>`.
- `desiredLevel` is the *target*; `difficultyPreference` is the *proven* level. Student climbs from proven → target via assessments, one tier at a time.

**Next required step** = first unproven tier between proven and target. (Choose Advanced, proven=beginner → next = Intermediate assessment.)

---

## 3. Fail / settle behavior

On submit `<passMark`:
- Record the attempt (see §5).
- If attempts remaining: allow retry after cooldown.
- If out of attempts (or student opts out): **settle** — set `difficultyPreference` = highest proven tier, `desiredLevel=null`, enroll in first course of that level+category. Failing the very first tier settles them at Beginner.

On submit `>=passMark`:
- Mark tier proven (`passedAssessments`, `levelStatus`).
- If a higher tier is still required (Advanced after Intermediate) → keep `desiredLevel`, surface the next assessment.
- Else → promote `difficultyPreference` to target, clear `desiredLevel`, auto-enroll.

---

## 4. Integrity hardening

1. **Server-side grading only.** `GET /assessments/level/:level` must NOT return `correctAnswerIndex`. For `dragdrop`, send the drag items and drop targets **separately/shuffled**, never the correct pairing. Grading already happens in `submitAssessment`.
2. **Attempt limit + cooldown.** Default: **3 attempts** per (level,category), **30-min cooldown** between attempts; on exhausting attempts → settle (§3). Configurable via env.
3. **Randomized pool.** Per attempt, draw **N random** questions (default 5) from the level+category bank. Requires a bank larger than N (see §7 dependency).
4. **Universal gate.** Replace the `isSkipFlow`-only check in `getFullCourseDetails`, `getCoursesByLevelExplicit`, and `routes/course.js:getFullCourseDetails` with: *a course is accessible iff `courseLevelRank <= provenLevelRank`* — applied to **every** student. Higher-level content is blocked until proven, regardless of how they onboarded.

---

## 5. Data model changes (`studentModels.js`)

Add attempt tracking (keep existing `passedAssessments`, `levelStatus`):

```js
assessmentAttempts: [{
  level:    { type: String, enum: ['intermediate','advanced'] },
  category: { type: String, enum: ['literacy','numeracy'] },
  attempts: { type: Number, default: 0 },
  lastAttemptAt: Date,
  passed:   { type: Boolean, default: false }
}]
```

Proven-level helper (derive, don't store a second source of truth):
`provenLevel = 'advanced' if levelStatus.advanced else 'intermediate' if levelStatus.intermediate else 'beginner'`
(Set `levelStatus.intermediate/advanced` true when the matching assessment is passed.)

---

## 6. Endpoint changes

| Endpoint | Change |
|---|---|
| `GET /assessments/level/:level` | Resolve the *next required* tier for the student; enforce attempt-limit + cooldown (`429`/locked response with `retryAfter`); return questions **without answers**; sample N random from bank. |
| `POST /assessments/submit/:assessmentId` | Tiered promotion + settle-on-exhaust; increment attempts; set `levelStatus`. Return `{ passed, provenLevel, nextStep: 'assessment:advanced' | 'enrolled' | 'settled', attemptsLeft, cooldownUntil }`. |
| `getFullCourseDetails` (controller + route) , `getCoursesByLevelExplicit` | Universal gate by proven-level rank. |
| `POST /profile/enroll` | (From prior thread) also reject courses above proven level / out of sequence. |

---

## 7. Dependency & risks

- **Content gap:** randomized pool of N=5 needs ≥5 questions per (level,category). Current banks are 2–4 questions (some combos have multiple Assessment docs we can pool). **Either lower N, or author more questions.** Recommend: sample `min(N, bankSize)` and warn if bank < N.
- **Frontend contract change:** hiding `correctAnswerIndex` and reshaping `dragdrop` payload requires a quiz-renderer update on the student app.
- **Migration:** existing students keep `passedAssessments`; backfill `levelStatus` from it on first load.

---

## 8. Verification (reuse existing scripts)

- `scripts/e2eStudentFlow.js` — extend to assert: choose Advanced → must pass Intermediate *then* Advanced; fail Advanced → settles at Intermediate.
- `scripts/studentJourney.js` — assert the universal gate now blocks a plain beginner from intermediate content, and answers are absent from the assessment payload.
- `scripts/dataHealth.js` — add a check: every (intermediate/advanced × category) bank has ≥ N questions.

---

## 9. Suggested build order

1. Model + proven-level helper.
2. Universal gate (closes the bypass immediately).
3. Server-side grading / hide answers.
4. Tiered promotion + settle-on-fail in `submitAssessment`.
5. Attempt limit + cooldown.
6. Randomized sampling (+ content top-up).
7. Update verification scripts.
