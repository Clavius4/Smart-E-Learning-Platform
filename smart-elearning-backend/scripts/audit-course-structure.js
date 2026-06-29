require('dotenv').config();
const mongoose = require('mongoose');

require('../models/section');
require('../models/subSection');
const Course = require('../models/course');
const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Quiz = require('../models/quiz');

const args = process.argv.slice(2);
const summaryOnly = args.includes('--summary');
const courseId = args.find((arg) => !arg.startsWith('--'));
const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;

function id(value) {
  return value ? value.toString() : null;
}

function isVideoSubSection(subSection) {
  return Boolean(subSection?.videoUrl);
}

function title(value, fallback) {
  return value || fallback || 'Untitled';
}

async function summarizeCourse(course) {
  const quizIds = new Set((course.quizzes || []).map(id).filter(Boolean));

  const sections = (course.courseContent || []).map((section, sectionIndex) => {
    const subSections = (section.subSection || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const lessons = subSections.map((subSection, subIndex) => {
      if (subSection.linkedQuiz) quizIds.add(id(subSection.linkedQuiz));

      return {
        index: subIndex + 1,
        id: id(subSection._id),
        title: title(subSection.title, `Video ${subIndex + 1}`),
        order: subSection.order ?? 0,
        isRemedial: Boolean(subSection.isRemedial),
        hasVideo: isVideoSubSection(subSection),
        linkedQuiz: id(subSection.linkedQuiz)
      };
    });

    return {
      index: sectionIndex + 1,
      id: id(section._id),
      title: title(section.sectionName || section.moduleName, `Section ${sectionIndex + 1}`),
      lessonCount: lessons.length,
      videoCount: lessons.filter((lesson) => lesson.hasVideo).length,
      normalVideoCount: lessons.filter((lesson) => lesson.hasVideo && !lesson.isRemedial).length,
      remedialVideoCount: lessons.filter((lesson) => lesson.hasVideo && lesson.isRemedial).length,
      linkedQuizCount: lessons.filter((lesson) => lesson.linkedQuiz).length,
      lessons
    };
  });

  const quizzes = await Quiz.find({ _id: { $in: Array.from(quizIds) } })
    .select('title courseId questions')
    .lean();

  return {
    id: id(course._id),
    name: course.courseName,
    status: course.status,
    level: course.level,
    sectionCount: sections.length,
    lessonCount: sections.reduce((sum, section) => sum + section.lessonCount, 0),
    normalVideoCount: sections.reduce((sum, section) => sum + section.normalVideoCount, 0),
    remedialVideoCount: sections.reduce((sum, section) => sum + section.remedialVideoCount, 0),
    courseQuizCount: (course.quizzes || []).length,
    linkedLessonQuizCount: sections.reduce((sum, section) => sum + section.linkedQuizCount, 0),
    sections: summaryOnly
      ? sections.map(({ lessons, ...section }) => section)
      : sections,
    quizzes: quizzes.map((quiz) => ({
      id: id(quiz._id),
      title: quiz.title || 'Untitled quiz',
      courseId: id(quiz.courseId),
      questionCount: quiz.questions?.length || 0
    }))
  };
}

async function main() {
  if (!mongoUri) {
    throw new Error('DATABASE_URL or MONGODB_URI is required');
  }

  await mongoose.connect(mongoUri);

  const query = courseId ? { _id: courseId } : {};
  const courses = await Course.find(query)
    .populate({
      path: 'courseContent',
      populate: { path: 'subSection' }
    })
    .sort({ level: 1, order: 1, courseName: 1 })
    .lean();

  if (courseId && courses.length === 0) {
    throw new Error(`Course not found: ${courseId}`);
  }

  const summaries = [];
  for (const course of courses) {
    summaries.push(await summarizeCourse(course));
  }

  const linkedSectionIds = new Set();
  courses.forEach((course) => {
    (course.courseContent || []).forEach((section) => linkedSectionIds.add(id(section._id)));
  });

  const allSectionIdsInAnyCourse = new Set();
  const allCourses = await Course.find({}).select('courseContent').lean();
  allCourses.forEach((course) => {
    (course.courseContent || []).forEach((sectionId) => allSectionIdsInAnyCourse.add(id(sectionId)));
  });

  const allSections = await Section.find({}).select('sectionName moduleName subSection').lean();
  const orphanSections = allSections
    .filter((section) => !allSectionIdsInAnyCourse.has(id(section._id)))
    .map((section) => ({
      id: id(section._id),
      title: title(section.sectionName || section.moduleName, 'Untitled section'),
      subSectionCount: section.subSection?.length || 0
    }));

  const sectionSubSectionIds = new Set();
  allSections.forEach((section) => {
    (section.subSection || []).forEach((subSectionId) => sectionSubSectionIds.add(id(subSectionId)));
  });

  const allSubSections = await SubSection.find({}).select('title videoUrl isRemedial linkedQuiz').lean();
  const orphanSubSections = allSubSections
    .filter((subSection) => !sectionSubSectionIds.has(id(subSection._id)))
    .map((subSection) => ({
      id: id(subSection._id),
      title: title(subSection.title, 'Untitled video'),
      hasVideo: isVideoSubSection(subSection),
      isRemedial: Boolean(subSection.isRemedial),
      linkedQuiz: id(subSection.linkedQuiz)
    }));

  console.log(JSON.stringify({
    scope: courseId ? 'single-course' : 'all-courses',
    courseCount: summaries.length,
    courses: summaries,
    databaseWarnings: {
      orphanSectionCount: orphanSections.length,
      orphanSections: summaryOnly ? orphanSections.slice(0, 10) : orphanSections,
      orphanSubSectionCount: orphanSubSections.length,
      orphanSubSections: summaryOnly ? orphanSubSections.slice(0, 10) : orphanSubSections
    }
  }, null, 2));

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
