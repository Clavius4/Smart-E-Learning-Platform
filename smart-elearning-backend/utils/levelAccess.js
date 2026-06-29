// Single source of truth for "what level a student has proven" and access gating.
//
// A student's PROVEN level is their `difficultyPreference`. It is promoted in two
// ways, both of which already write to difficultyPreference:
//   1. Passing a level's placement assessment (assessmentController).
//   2. Completing every course in the current level (quizCourse.submitQuiz).
//
// Access rule (universal, applies to EVERY student): a course is accessible iff
// its level rank is <= the student's proven level rank. Higher content is locked
// until proven — closing the old "skip-flow only" bypass.

const LEVEL_RANK = { beginner: 1, intermediate: 2, advanced: 3 };
const RANK_LEVEL = { 1: 'beginner', 2: 'intermediate', 3: 'advanced' };

// learningStyle -> assessment/course category bucket.
const STYLE_TO_ASSESSMENT_CATEGORY = {
  literacy: 'literacy', visual: 'literacy', text: 'literacy',
  numeracy: 'numeracy', numbers: 'numeracy',
};

function assessmentCategoryOfStyle(style) {
  return STYLE_TO_ASSESSMENT_CATEGORY[(style || '').toString().toLowerCase()] || 'literacy';
}

// Switch the student to `newStyle`, keeping per-category level progress separate.
// Snapshots the CURRENT live {difficultyPreference, desiredLevel} into the old
// category and swaps in the new category's saved values. Mutates the doc.
// Returns { oldCat, newCat, switched }.
function applyCategorySwitch(student, newStyle) {
  const oldCat = assessmentCategoryOfStyle(student.learningStyle);
  const newCat = assessmentCategoryOfStyle(newStyle);

  if (oldCat !== newCat) {
    // Persist where the student currently stands in the old category.
    student.set(`categoryProgress.${oldCat}.proven`, student.difficultyPreference || 'beginner');
    student.set(`categoryProgress.${oldCat}.desired`, student.desiredLevel || null);

    // Load the new category's standing (fresh beginner if never visited).
    const saved = (student.categoryProgress && student.categoryProgress[newCat]) || {};
    student.difficultyPreference = saved.proven || 'beginner';
    student.desiredLevel = saved.desired || null;
  }

  student.learningStyle = newStyle;
  return { oldCat, newCat, switched: oldCat !== newCat };
}

function normalize(level) {
  return (level || 'beginner').toString().toLowerCase();
}

function rankOf(level) {
  return LEVEL_RANK[normalize(level)] || 1;
}

// The level the student has proven (their current working level).
function provenLevel(student) {
  return normalize(student?.difficultyPreference);
}

function provenRank(student) {
  return rankOf(provenLevel(student));
}

// Can this student open content at `courseLevel`?
function canAccessLevel(student, courseLevel) {
  return rankOf(courseLevel) <= provenRank(student);
}

// The NEXT tier the student must prove to climb (one step at a time — tiered).
// Beginner -> intermediate -> advanced (capped at advanced).
function nextRequiredLevel(student) {
  return RANK_LEVEL[Math.min(provenRank(student) + 1, 3)];
}

module.exports = {
  LEVEL_RANK,
  RANK_LEVEL,
  rankOf,
  provenLevel,
  provenRank,
  canAccessLevel,
  nextRequiredLevel,
  assessmentCategoryOfStyle,
  applyCategorySwitch,
};
