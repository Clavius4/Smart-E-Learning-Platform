# System Algorithms Overview

This document summarizes the key decision and personalization algorithms used in the platform.

## 1) Personalized Course Recommendation and Locking
Where: `smart-elearning-backend/controllers/course.js` (see `getCoursesForOnboardedUser`)

What it does:
- Maps the student's learning style to a course category (e.g., literacy -> "Kusoma", numeracy -> "Kuhesabu").
- Filters courses by:
  - the student's difficulty level (Beginner/Intermediate/Advanced)
  - the mapped category
- Sorts courses by their `order` field to enforce a strict learning sequence.
- Calculates `isLocked` for each course:
  - Course 1 is always unlocked.
  - Each next course is locked until the previous course is completed.
- Returns personalized recommendations and a reason per course.

Why it is unique:
- Uses learning style and difficulty to strictly gate the curriculum.
- Enforces a sequential learning path rather than free navigation.

## 2) Remedial Mode (Recovery Learning)
Where:
- `smart-elearning-backend/controllers/quizCourse.js` (quiz submission logic)
- `smart-elearning-backend/routes/course.js` (course content gating)

What it does:
- When a student fails a course quiz, the system:
  - Enables remedial mode in course progress.
  - Assigns remedial sub-sections to the student.
- When the student opens the course content:
  - In remedial mode, only remedial lessons are visible.
  - In normal mode, remedial lessons are hidden.
- After passing the quiz, remedial mode and remedial content are cleared.

Why it is unique:
- Automatically switches the content structure based on quiz performance.

## 3) Quiz Scoring and Level Progression
Where: `smart-elearning-backend/controllers/quizCourse.js` (see `submitQuiz`)

What it does:
- Scores MCQ and drag-drop questions.
- Pass threshold is 80%.
- On pass:
  - Marks the course as completed.
  - Enrolls the student in the next course (same category, higher order).
  - Awards stars.
  - Checks if all courses in the current level are complete and if this is the last course:
    - If yes, promotes the student to the next level.
    - Adds a level completion badge and bonus stars.
- On fail:
  - Keeps the student at the same level.
  - Assigns remedial content.

Why it is unique:
- Progression depends on both course completion and strict ordering.
- Level promotion is blocked unless the entire level is completed and the last course is passed.

## 4) Level Assessment Scoring
Where: `smart-elearning-backend/controllers/assessmentController.js` (see `submitAssessment`)

What it does:
- Scores MCQ and drag-drop assessment questions.
- Pass threshold is 60%.
- Records assessment results under the student's progress record.

Why it is unique:
- Used to validate skill level for intermediate/advanced onboarding.

## 5) Onboarding Personalization Decision Flow
Where:
- `smart-elearning-frontend/src/components/navigation/OnboardingFlow.vue`
- `smart-elearning-backend/controllers/profile.js` (onboarding persistence)
- `smart-elearning-backend/controllers/authStudent.js` (personalization update)

What it does:
- Collects learning style, interests, difficulty level, and avatar.
- If Beginner:
  - Saves preferences and auto-enrolls into courses.
- If Intermediate/Advanced:
  - Saves preferences and routes the student to a level assessment.

Why it is unique:
- Onboarding path changes based on difficulty, driving either direct enrollment or assessment gating.

