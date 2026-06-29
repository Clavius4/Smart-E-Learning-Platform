const Assessment = require('../models/assessment');
const CourseProgress = require('../models/courseProgress');
const Student=require('../models/StudentModels/studentModels');
const Course = require('../models/course');
const Category = require('../models/category');
const { QuestionuploadImageToCloudinary } = require('../utils/imageUploader');
const { activeCourseStatusQuery } = require('../utils/courseStatus');
const { rankOf, provenRank, nextRequiredLevel } = require('../utils/levelAccess');

// assessmentController.js

const ASSESSMENT_CATEGORY_TO_COURSE_CATEGORY = {
  literacy: 'kusoma',
  numeracy: 'kuhesabu'
};

// ---- Placement-attempt policy (step 5: attempt limit + cooldown) ----
const MAX_ATTEMPTS = parseInt(process.env.ASSESSMENT_MAX_ATTEMPTS || '3', 10);
const COOLDOWN_MS = parseInt(process.env.ASSESSMENT_COOLDOWN_MIN || '30', 10) * 60 * 1000;

function toCourseLevel(level) {
  return level ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase() : level;
}

async function findCourseCategoryForAssessment(category) {
  const courseCategoryName = ASSESSMENT_CATEGORY_TO_COURSE_CATEGORY[category];
  if (!courseCategoryName) return null;

  return Category.findOne({
    name: { $regex: new RegExp(`^${courseCategoryName}$`, 'i') }
  });
}

// Find an existing attempt record (read-only; does not create).
function findAttemptRecord(student, level, category) {
  return (student.assessmentAttempts || []).find(
    (a) => a.level === level && a.category === category
  );
}

// Find or create the attempt record on a loaded (non-lean) student doc.
function ensureAttemptRecord(student, level, category) {
  if (!Array.isArray(student.assessmentAttempts)) student.assessmentAttempts = [];
  let rec = findAttemptRecord(student, level, category);
  if (!rec) {
    student.assessmentAttempts.push({ level, category, attempts: 0, lastAttemptAt: null, passed: false });
    rec = student.assessmentAttempts[student.assessmentAttempts.length - 1];
  }
  return rec;
}

// Milliseconds left before this record can be re-attempted (0 = ready).
function cooldownRemainingMs(rec) {
  if (!rec || !rec.lastAttemptAt || (rec.attempts || 0) <= 0) return 0;
  const elapsed = Date.now() - new Date(rec.lastAttemptAt).getTime();
  return Math.max(0, COOLDOWN_MS - elapsed);
}

// Ensure a CourseProgress exists for the first course of (level, category) and
// return that course (so the caller can add it to student.courses). Used by both
// the pass path (enroll at newly-proven level) and the settle path.
async function pickFirstCourseAndEnsureProgress(userId, level, assessmentCategory, passInfo) {
  const courseCategory = await findCourseCategoryForAssessment(assessmentCategory);
  if (!courseCategory) return null;

  const firstCourse = await Course.findOne({
    level: toCourseLevel(level),
    category: courseCategory._id,
    ...activeCourseStatusQuery()
  }).sort({ order: 1 });
  if (!firstCourse) return null;

  await CourseProgress.findOneAndUpdate(
    { userId, courseID: firstCourse._id },
    {
      $setOnInsert: {
        userId,
        courseID: firstCourse._id,
        instructor: firstCourse.instructor,
        completedVideos: [],
        quizAttempts: [],
        remedialContent: [],
        needsRemedial: false,
        completionStatus: 'not_started'
      },
      ...(passInfo ? { $addToSet: { passedLevelQuiz: passInfo } } : {})
    },
    { upsert: true, new: true }
  );

  return firstCourse;
}

exports.createAssessment = async (req, res) => {
  try {
    const { category, level, questions } = req.body;
    const instructorId = req.user.id;
    const normalizedLevel = level?.toLowerCase();
    const normalizedCategory = category?.toLowerCase();
    const allowedLevels = ['beginner', 'intermediate', 'advanced'];
    const allowedCategories = ['literacy', 'numeracy'];

    if (!category || !level || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Assessment category, level, and a valid array of questions are required',
      });
    }

    if (!allowedCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be: literacy or numeracy',
      });
    }

    if (!allowedLevels.includes(normalizedLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be: beginner, intermediate, or advanced',
      });
    }

    const updatedQuestions = [];

    for (const [index, question] of questions.entries()) {
      const {
        question: questionText,
        questionImage,
        type = 'mcq',
        options = [],
        correctAnswerIndex,
        pairs = [],
      } = question;

      if (!questionText || typeof questionText !== 'string') {
        return res.status(400).json({
          success: false,
          message: `Missing or invalid question text in question ${index + 1}`,
        });
      }

      if (type.toLowerCase() === 'mcq') {
        if (!Array.isArray(options) || options.length < 2) {
          return res.status(400).json({
            success: false,
            message: `MCQ question ${index + 1} must have at least 2 options`,
          });
        }

        if (
          typeof correctAnswerIndex !== 'number' ||
          correctAnswerIndex < 0 ||
          correctAnswerIndex >= options.length
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid correctAnswerIndex in question ${index + 1}`,
          });
        }

        for (const [optIndex, option] of options.entries()) {
          if (!option.text || typeof option.text !== 'string') {
            return res.status(400).json({
              success: false,
              message: `Option ${optIndex + 1} in question ${index + 1} is invalid`,
            });
          }
        }
      }

      if (type.toLowerCase() === 'dragdrop') {
        if (!Array.isArray(pairs) || pairs.length < 1) {
          return res.status(400).json({
            success: false,
            message: `Drag-and-drop question ${index + 1} must have at least 1 pair`,
          });
        }

        for (const [pairIndex, pair] of pairs.entries()) {
          if (!pair.drag || !pair.drop) {
            return res.status(400).json({
              success: false,
              message: `Missing drag/drop text in pair ${pairIndex + 1} of question ${index + 1}`,
            });
          }
        }
      }

      let cloudinaryImageUrl = '';

      if (typeof questionImage === 'string' && questionImage.startsWith('data:image')) {
        try {
          const uploadResponse = await QuestionuploadImageToCloudinary(questionImage, process.env.FOLDER_NAME);
          cloudinaryImageUrl = uploadResponse.secure_url;
        } catch (uploadError) {
          return res.status(500).json({
            success: false,
            message: 'Image upload failed',
            error: uploadError.message,
          });
        }
      }

      updatedQuestions.push({
        question: questionText,
        questionImage: cloudinaryImageUrl,
        type: type.toLowerCase(),
        ...(type.toLowerCase() === 'mcq'
          ? { options, correctAnswerIndex }
          : { pairs }),
      });
    }

  

    const newAssessment = await Assessment.create({
  instructor: instructorId,
  category: normalizedCategory,
  level: normalizedLevel,
  questions: updatedQuestions,
});

    return res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment: newAssessment,
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating assessment',
      error: error.message,
    });
  }
};





exports.getAllAssessmentsByInstructor = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const assessments = await Assessment.find({ instructor: instructorId });

    res.status(200).json({
      success: true,
      assessments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessments",
      error: error.message,
    });
  }
};


exports.getAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    res.status(200).json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching assessment", error: error.message });
  }
};


exports.updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { questions } = req.body;

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      assessmentId,
      { questions },
      { new: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    };

    res.status(200).json({ success: true, message: "Assessment updated", assessment: updatedAssessment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating assessment", error: error.message });
  }
};


exports.deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findByIdAndDelete(assessmentId);

    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    res.status(200).json({ success: true, message: "Assessment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting assessment", error: error.message });
  }
};

exports.accessAssessmentByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const studentId = req.user.id;
    const normalizedLevel = level?.toLowerCase();
    const allowedLevels = ['beginner', 'intermediate', 'advanced'];

    if (!allowedLevels.includes(normalizedLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be: beginner, intermediate, or advanced'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const styleToCategoryMap = {
      literacy: 'literacy',
      numeracy: 'numeracy',
      numbers: 'numeracy',
      visual: 'literacy',
      text: 'literacy'
    };

    const categoryKey = styleToCategoryMap[student.learningStyle?.toLowerCase()];
    if (!categoryKey) {
      return res.status(400).json({
        success: false,
        message: 'Invalid learning style for assessment category'
      });
    }

    const assessment = await Assessment.findOne({ level: normalizedLevel, category: categoryKey });
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'No assessment found for this level'
      });
    }

    const progress = await CourseProgress.findOne({ userId: studentId });
    const passedOnStudent = student.passedAssessments?.some(
      a =>
        a.assessmentId?.toString() === assessment._id.toString() ||
        (a.level === assessment.level && a.category === assessment.category)
    );
    const passedInProgress = progress?.passedLevelQuiz?.some(
      a =>
        a.passed === true &&
        (
          a.assessmentId?.toString() === assessment._id.toString() ||
          (a.level === assessment.level && a.category === assessment.category)
        )
    );

    if (passedOnStudent || passedInProgress) {
      return res.status(200).json({ success: true, message: "Assessment already passed" });
    }

    // Tiered access: a student may only take the assessment for their NEXT tier.
    const required = nextRequiredLevel(student);
    if (normalizedLevel !== required) {
      if (rankOf(normalizedLevel) <= provenRank(student)) {
        return res.status(200).json({ success: true, message: 'Level already unlocked', alreadyPassed: true });
      }
      return res.status(403).json({
        success: false,
        requireQuiz: true,
        requiredLevel: required,
        message: `Pass the ${required} assessment first.`
      });
    }

    // Attempt limit + cooldown (read-only check here; enforced again on submit).
    const attemptRec = findAttemptRecord(student, normalizedLevel, categoryKey);
    if (attemptRec?.passed) {
      return res.status(200).json({ success: true, message: 'Assessment already passed' });
    }
    if (attemptRec && (attemptRec.attempts || 0) >= MAX_ATTEMPTS) {
      return res.status(403).json({
        success: false,
        locked: true,
        reason: 'attempts_exhausted',
        message: `No attempts left for the ${normalizedLevel} assessment. You remain at your current level.`
      });
    }
    const cdMs = cooldownRemainingMs(attemptRec);
    if (cdMs > 0) {
      return res.status(429).json({
        success: false,
        locked: true,
        reason: 'cooldown',
        retryAfterSeconds: Math.ceil(cdMs / 1000),
        cooldownUntil: new Date(Date.now() + cdMs),
        message: `Please wait before retrying the ${normalizedLevel} assessment.`
      });
    }

    // Never leak answers to the client. Grading happens server-side in submitAssessment.
    const shuffle = (arr) => arr
      .map((v) => [Math.random(), v])
      .sort((a, b) => a[0] - b[0])
      .map((x) => x[1]);

    res.status(200).json({
      success: true,
      attemptsLeft: MAX_ATTEMPTS - (attemptRec?.attempts || 0),
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        level: assessment.level,
        questions: assessment.questions.map(q => {
          const base = {
            question: q.question,
            questionImage: q.questionImage,
            type: q.type || 'mcq',
          };
          if ((q.type || 'mcq') === 'dragdrop') {
            // Send the draggable items and drop targets separately + shuffled,
            // WITHOUT revealing the correct pairing.
            return {
              ...base,
              dragItems: shuffle((q.pairs || []).map((p) => p.drag)),
              dropTargets: shuffle((q.pairs || []).map((p) => p.drop)),
            };
          }
          // mcq: options only, never correctAnswerIndex.
          return { ...base, options: q.options || [] };
        })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.submitAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (!Array.isArray(answers) || answers.length !== assessment.questions.length) {
      return res.status(400).json({ success: false, message: 'Invalid or incomplete answers submitted' });
    }

    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const level = assessment.level;
    const category = assessment.category;

    // Tiered: a student may only submit the assessment for their NEXT tier.
    const required = nextRequiredLevel(student);
    if (level !== required) {
      if (rankOf(level) <= provenRank(student)) {
        return res.status(200).json({ success: true, alreadyPassed: true, message: 'You have already unlocked this level.' });
      }
      return res.status(403).json({ success: false, requireQuiz: true, requiredLevel: required, message: `Pass the ${required} assessment first.` });
    }

    // Attempt limit + cooldown (step 5).
    const attemptRec = ensureAttemptRecord(student, level, category);
    if (attemptRec.passed) {
      return res.status(200).json({ success: true, alreadyPassed: true, message: 'Assessment already passed' });
    }
    if ((attemptRec.attempts || 0) >= MAX_ATTEMPTS) {
      return res.status(403).json({ success: false, locked: true, reason: 'attempts_exhausted', message: 'No attempts left for this assessment. You remain at your current level.' });
    }
    const cdMs = cooldownRemainingMs(attemptRec);
    if (cdMs > 0) {
      return res.status(429).json({ success: false, locked: true, reason: 'cooldown', retryAfterSeconds: Math.ceil(cdMs / 1000), cooldownUntil: new Date(Date.now() + cdMs), message: 'Please wait before retrying the assessment.' });
    }

    let score = 0;
    const results = [];

    for (let i = 0; i < assessment.questions.length; i++) {
      const question = assessment.questions[i];
      const answer = answers[i];
      let correct = false;

      if (question.type === 'mcq') {
        correct = answer.selected === question.correctAnswerIndex;
      } else if (question.type === 'dragdrop') {
        // Order-independent grading: each submitted pair must match the correct
        // drag->drop mapping (items are shuffled when served, so position is meaningless).
        const correctMap = new Map((question.pairs || []).map((p) => [p.drag, p.drop]));
        correct = Array.isArray(answer.selectedPairs) &&
          answer.selectedPairs.length === (question.pairs || []).length &&
          answer.selectedPairs.every((pair) => correctMap.get(pair.drag) === pair.drop);
      }

      if (correct) score++;

      results.push({
        question: question.question,
        type: question.type,
        selected: answer.selected || answer.selectedPairs,
        correct
      });
    }

    const percentage = (score / assessment.questions.length) * 100;
    const passed = percentage >= 60;

    // Record this attempt (step 5).
    attemptRec.attempts = (attemptRec.attempts || 0) + 1;
    attemptRec.lastAttemptAt = new Date();
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attemptRec.attempts);

    let nextStep;
    let settledLevel = null;
    let cooldownUntil = null;

    if (passed) {
      attemptRec.passed = true;

      // Audit record of the pass.
      if (!Array.isArray(student.passedAssessments)) student.passedAssessments = [];
      if (!student.passedAssessments.some((a) => a.assessmentId?.toString() === assessment._id.toString())) {
        student.passedAssessments.push({
          assessmentId: assessment._id, level, category,
          score, total: assessment.questions.length, percentage, passedAt: new Date()
        });
      }

      // Promote proven level to the tier just passed.
      student.difficultyPreference = level;

      // Tiered: keep climbing if the target is still higher; else target reached.
      if (student.desiredLevel && rankOf(student.desiredLevel) > rankOf(level)) {
        nextStep = `assessment:${nextRequiredLevel(student)}`; // e.g. passed intermediate, advance to advanced
      } else {
        student.desiredLevel = null;
        nextStep = 'enrolled';
      }

      // Enroll at the newly-proven level.
      const firstCourse = await pickFirstCourseAndEnsureProgress(userId, level, category, {
        level, assessmentId: assessment._id, category,
        score, total: assessment.questions.length, percentage, passed
      });
      if (firstCourse && !student.courses.some((id) => id.toString() === firstCourse._id.toString())) {
        student.courses.push(firstCourse._id);
      }
      await student.save();
      console.log(`✅ ${userId} passed ${level} (${percentage}%) → nextStep=${nextStep}`);
    } else if (attemptsLeft <= 0) {
      // Out of attempts → SETTLE at highest proven level ("next level down"); stop climbing.
      settledLevel = (student.difficultyPreference || 'beginner').toLowerCase();
      student.desiredLevel = null;
      const firstCourse = await pickFirstCourseAndEnsureProgress(userId, settledLevel, category, null);
      if (firstCourse && !student.courses.some((id) => id.toString() === firstCourse._id.toString())) {
        student.courses.push(firstCourse._id);
      }
      await student.save();
      nextStep = 'settled';
      console.log(`ℹ️ ${userId} exhausted ${level} attempts → settled at ${settledLevel}`);
    } else {
      // Failed but attempts remain → retry after cooldown. No level change.
      cooldownUntil = new Date(Date.now() + COOLDOWN_MS);
      nextStep = 'retry';
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      score,
      total: assessment.questions.length,
      percentage,
      passed,
      results,
      nextStep,
      attemptsLeft,
      provenLevel: (student.difficultyPreference || 'beginner').toLowerCase(),
      ...(settledLevel ? { settledLevel } : {}),
      ...(cooldownUntil ? { cooldownUntil } : {})
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
