const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Course = require('../models/course');
const Quiz = require('../models/quiz');
require('../models/section');
const SubSection = require('../models/subSection');

const apply = process.argv.includes('--apply');

function oid(value) {
  return value && value.toString ? value.toString() : String(value);
}

function sortSubsections(subsections) {
  return [...subsections].sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return oid(a._id).localeCompare(oid(b._id));
  });
}

function sortQuizzes(quizzes) {
  return [...quizzes].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;
    return oid(a._id).localeCompare(oid(b._id));
  });
}

function flattenCourseSubsections(course) {
  const subsections = [];

  for (const section of course.courseContent || []) {
    for (const subSection of section.subSection || []) {
      subsections.push({
        sectionId: section._id,
        subSection
      });
    }
  }

  return subsections;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  await mongoose.connect(process.env.DATABASE_URL);

  const courses = await Course.find({})
    .populate({
      path: 'courseContent',
      populate: { path: 'subSection' }
    })
    .sort({ category: 1, level: 1, order: 1 });

  const quizzes = await Quiz.find({}).sort({ createdAt: 1 });
  const courseIds = new Set(courses.map((course) => oid(course._id)));
  const quizzesByCourse = new Map();
  const orphanQuizzes = [];

  for (const quiz of quizzes) {
    const courseId = oid(quiz.courseId);
    if (!courseIds.has(courseId)) {
      orphanQuizzes.push({
        quizId: oid(quiz._id),
        missingCourseId: courseId,
        questions: quiz.questions?.length || 0,
        createdAt: quiz.createdAt
      });
      continue;
    }

    if (!quizzesByCourse.has(courseId)) quizzesByCourse.set(courseId, []);
    quizzesByCourse.get(courseId).push(quiz);
  }

  const operations = [];
  const ambiguous = [];

  for (const course of courses) {
    const courseId = oid(course._id);
    const courseQuizzes = sortQuizzes(quizzesByCourse.get(courseId) || []);
    const courseQuizRefs = new Set((course.quizzes || []).map(oid));
    const missingQuizRefs = courseQuizzes
      .filter((quiz) => !courseQuizRefs.has(oid(quiz._id)))
      .map((quiz) => quiz._id);

    if (missingQuizRefs.length > 0) {
      operations.push({
        type: 'add_course_quiz_refs',
        courseId,
        courseName: course.courseName,
        quizIds: missingQuizRefs.map(oid)
      });

      if (apply) {
        await Course.findByIdAndUpdate(course._id, {
          $addToSet: { quizzes: { $each: missingQuizRefs } }
        });
      }
    }

    const allSubsections = flattenCourseSubsections(course);
    const normalSubsections = sortSubsections(
      allSubsections
        .map((entry) => entry.subSection)
        .filter((subSection) => subSection && !subSection.isRemedial)
    );
    const linkedNormalCount = normalSubsections.filter((subSection) => subSection.linkedQuiz).length;
    if (normalSubsections.length > 0 && linkedNormalCount === normalSubsections.length) {
      continue;
    }

    if (normalSubsections.length === 0 || courseQuizzes.length === 0) {
      if (normalSubsections.length > 0 && courseQuizzes.length === 0) {
        ambiguous.push({
          type: 'missing_quizzes_for_videos',
          courseId,
          courseName: course.courseName,
          normalVideos: normalSubsections.length,
          quizzes: 0
        });
      }
      continue;
    }

    const canMapOneToOne =
      linkedNormalCount === 0 &&
      normalSubsections.length === courseQuizzes.length;

    if (!canMapOneToOne) {
      ambiguous.push({
        type: 'manual_review_required',
        courseId,
        courseName: course.courseName,
        normalVideos: normalSubsections.length,
        linkedNormalVideos: linkedNormalCount,
        quizzes: courseQuizzes.length
      });
      continue;
    }

    for (let index = 0; index < normalSubsections.length; index++) {
      const subSection = normalSubsections[index];
      const quiz = courseQuizzes[index];

      operations.push({
        type: 'link_subsection_quiz',
        courseId,
        courseName: course.courseName,
        subSectionId: oid(subSection._id),
        subSectionTitle: subSection.title,
        quizId: oid(quiz._id)
      });

      if (apply) {
        await SubSection.findByIdAndUpdate(subSection._id, {
          linkedQuiz: quiz._id
        });
      }
    }
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    summary: {
      operations: operations.length,
      linkedSubsectionQuizzes: operations.filter((op) => op.type === 'link_subsection_quiz').length,
      addedCourseQuizRefs: operations.filter((op) => op.type === 'add_course_quiz_refs').length,
      ambiguous: ambiguous.length,
      orphanQuizzes: orphanQuizzes.length
    },
    operations,
    ambiguous,
    orphanQuizzes
  }, null, 2));

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
