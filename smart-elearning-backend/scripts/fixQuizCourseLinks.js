const mongoose = require('mongoose');
const Quiz = require('./../models/quiz');
const Course = require('./../models/course');
require('dotenv').config();

async function syncQuizLinks() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected to DB');

  const quizzes = await Quiz.find({}).lean();
  const quizIds = quizzes.map((q) => q._id.toString());
  const courseIds = new Set(quizzes.map((q) => q.courseId?.toString()).filter(Boolean));

  const courseCache = new Map();
  const orphanedQuizzes = [];
  let linkedCount = 0;
  let updatedCourses = 0;
  let restoredLinks = 0;

  for (const quiz of quizzes) {
    if (!quiz.courseId) {
      orphanedQuizzes.push({ _id: quiz._id.toString(), instructor: quiz.instructor?.toString() });
      continue;
    }

    const courseId = quiz.courseId.toString();
    let course = courseCache.get(courseId);
    if (!course) {
      course = await Course.findById(courseId);
      courseCache.set(courseId, course || null);
    }

    if (!course) {
      orphanedQuizzes.push({ _id: quiz._id.toString(), courseId, instructor: quiz.instructor?.toString() });
      continue;
    }

    const quizId = quiz._id.toString();
    if (!course.quizzes?.some((id) => id.toString() === quizId)) {
      course.quizzes = course.quizzes || [];
      course.quizzes.push(quiz._id);
      await course.save();
      restoredLinks += 1;
      if (!course._updated) {
        updatedCourses += 1;
      }
    }

    linkedCount += 1;
  }

  console.log('Total quizzes found:', quizzes.length);
  console.log('Quizzes with valid courseId and found course:', linkedCount);
  console.log('Courses updated to restore missing quiz links:', updatedCourses);
  console.log('Missing course-course associations fixed:', restoredLinks);
  console.log('Orphaned quiz docs (course missing or unset):', orphanedQuizzes.length);
  if (orphanedQuizzes.length > 0) {
    console.log('Sample orphaned quiz docs:', orphanedQuizzes.slice(0, 20));
  }

  // Cleanup course.quiz arrays by removing missing quiz IDs
  const courses = await Course.find({ quizzes: { $exists: true, $ne: [] } }).lean();
  let removedMissingQuizRefs = 0;
  for (const course of courses) {
    const originalCount = course.quizzes.length;
    const cleaned = course.quizzes.filter((qid) => quizIds.includes(qid.toString()));
    if (cleaned.length !== originalCount) {
      await Course.findByIdAndUpdate(course._id, { quizzes: cleaned });
      removedMissingQuizRefs += originalCount - cleaned.length;
    }
  }
  console.log('Removed stale quiz references from course documents:', removedMissingQuizRefs);

  await mongoose.disconnect();
  console.log('Done.');
}

syncQuizLinks().catch((error) => {
  console.error('Error during quiz-course link sync:', error);
  process.exit(1);
});
