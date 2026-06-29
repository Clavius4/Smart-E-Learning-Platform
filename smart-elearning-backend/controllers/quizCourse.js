const Quiz = require('../models/quiz');
const CourseProgress = require('../models/courseProgress')
const Course = require('../models/course')
const SubSection = require('../models/subSection');
const mongoose = require('mongoose');

const { QuestionuploadImageToCloudinary } = require('../utils/imageUploader');
const { assessmentCategoryOfStyle } = require('../utils/levelAccess');
// ================ quiz course ================

function flattenCourseSubsections(courseDoc) {
  const items = [];

  (courseDoc.courseContent || []).forEach((section) => {
    (section.subSection || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((subSection) => {
        items.push({
          sectionId: section._id,
          subSection,
          subId: subSection._id.toString(),
          isRemedial: Boolean(subSection.isRemedial),
          linkedQuiz: subSection.linkedQuiz ? subSection.linkedQuiz.toString() : null,
          hasVideo: Boolean(subSection.videoUrl)
        });
      });
  });

  return items;
}

function getPassedQuizIds(courseProgress) {
  return new Set(
    (courseProgress?.passedLevelQuiz || [])
      .filter((entry) => entry.quizId)
      .map((entry) => entry.quizId.toString())
  );
}

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getCompletedSubsectionIds(courseProgress) {
  return new Set(
    (courseProgress?.completedVideos || [])
      .filter((entry) => entry.subsectionId)
      .map((entry) => entry.subsectionId.toString())
  );
}

function allRequiredCourseWorkComplete(courseDoc, courseProgress) {
  const flatSubsections = flattenCourseSubsections(courseDoc);
  const completedSubsections = getCompletedSubsectionIds(courseProgress);
  const passedQuizzes = getPassedQuizIds(courseProgress);
  const normalSubsections = flatSubsections.filter((item) => !item.isRemedial && item.hasVideo);

  const allVideosComplete = normalSubsections.every((item) => completedSubsections.has(item.subId));
  const linkedQuizIds = normalSubsections
    .map((item) => item.linkedQuiz)
    .filter(Boolean);
  const allLinkedQuizzesPassed = linkedQuizIds.every((quizId) => passedQuizzes.has(quizId));
  const hasLinkedQuizzes = linkedQuizIds.length > 0;
  const hasCourseLevelQuiz = (courseDoc.quizzes || []).length > 0;

  if (hasLinkedQuizzes) {
    return allVideosComplete && allLinkedQuizzesPassed;
  }

  return allVideosComplete && (!hasCourseLevelQuiz || (courseDoc.quizzes || []).some((quizId) => passedQuizzes.has(quizId.toString())));
}

function getNextNormalLearningItem(courseDoc, courseProgress) {
  const flatSubsections = flattenCourseSubsections(courseDoc);
  const completedSubsections = getCompletedSubsectionIds(courseProgress);
  const passedQuizzes = getPassedQuizIds(courseProgress);

  for (const item of flatSubsections) {
    if (item.isRemedial || !item.hasVideo) continue;
    if (!completedSubsections.has(item.subId)) {
      return { type: 'video', id: item.subId };
    }
    if (item.linkedQuiz && !passedQuizzes.has(item.linkedQuiz)) {
      return { type: 'quiz', id: item.linkedQuiz };
    }
  }

  const courseQuiz = (courseDoc.quizzes || []).find((quizId) => !passedQuizzes.has(quizId.toString()));
  if (courseQuiz) {
    return { type: 'quiz', id: courseQuiz.toString() };
  }

  return { type: 'completed', id: null };
}



exports.createQuiz = async (req, res) => {
  try {
    const { courseId, subSectionId, questions } = req.body;
    const instructorId = req.user.id;

    if (!courseId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and a valid array of questions are required',
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
        pairs = []
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

      if (type === 'dragdrop') {
        // Normalize field names: accept both 'drag'/'drop' (frontend) and 'left'/'right' (database)
        const normalizedPairs = pairs.map(pair => ({
          left: pair.left || pair.drag,
          right: pair.right || pair.drop
        }));

        if (!Array.isArray(normalizedPairs) || normalizedPairs.length < 1) {
          return res.status(400).json({
            success: false,
            message: `Drag-and-drop question ${index + 1} must have at least 1 pair`,
          });
        }

        for (const [pairIndex, pair] of normalizedPairs.entries()) {
          if (!pair.left || !pair.right) {
            return res.status(400).json({
              success: false,
              message: `Missing left/right text in pair ${pairIndex + 1} of question ${index + 1}`,
            });
          }
        }

        // Store normalized pairs back to question object
        question.pairs = normalizedPairs;
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
          : { pairs: question.pairs }) // Use normalized pairs from question object


      });

    }

    const course = await Course.findById(courseId)
      .populate({
        path: 'courseContent',
        populate: { path: 'subSection' }
      });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let targetSubSection = null;
    if (subSectionId) {
      targetSubSection = flattenCourseSubsections(course).find((item) => item.subId === subSectionId);

      if (!targetSubSection) {
        return res.status(400).json({
          success: false,
          message: 'SubSection does not belong to this course'
        });
      }
    }

    const newQuiz = await Quiz.create({
      courseId,
      instructor: instructorId,
      questions: updatedQuestions,
    });

    if (!course.quizzes.some((quizId) => quizId.toString() === newQuiz._id.toString())) {
      course.quizzes.push(newQuiz._id);
    }
    await course.save();

    if (targetSubSection) {
      await SubSection.findByIdAndUpdate(subSectionId, { linkedQuiz: newQuiz._id });
    }




    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: newQuiz,
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating quiz',
      error: error.message,
    });
  }
};

exports.getAllQuizzesByInstructor = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const quizzes = await Quiz.find({ instructor: instructorId })
      .populate("courseId", "courseName");

    res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
      error: error.message,
    });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz", error: error.message });
  }
};


exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { questions },
      { new: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({ success: true, message: "Quiz updated", quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating quiz", error: error.message });
  }
};


exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByIdAndDelete(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Also remove reference from course
    await Course.findByIdAndUpdate(quiz.courseId, {
      $pull: { quizzes: quiz._id }
    });
    await SubSection.updateMany(
      { linkedQuiz: quiz._id },
      { $set: { linkedQuiz: null } }
    );

    res.status(200).json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting quiz", error: error.message });
  }
};




exports.accessQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const subSectionId = firstQueryValue(req.query.subSectionId);
    const requestedQuizId = firstQueryValue(req.query.quizId);
    const userId = req.user.id;

    // 1. Check if course exists and has quizzes
    const course = await Course.findById(courseId)
      .populate({
        path: 'courseContent',
        populate: { path: 'subSection' }
      });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const flatSubsections = flattenCourseSubsections(course);
    const hasLinkedQuizzes = flatSubsections.some((item) => item.linkedQuiz);
    if ((!course.quizzes || course.quizzes.length === 0) && !hasLinkedQuizzes) {
      return res.status(404).json({
        success: false,
        message: 'No quiz available for this course'
      });
    }

    // 2. Check course progress
    const progress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId
    }).populate('courseID');

    if (!progress) {
      return res.status(403).json({
        success: false,
        message: 'Course progress not found'
      });
    }

    let quizId = null;
    if (requestedQuizId) {
      if (!mongoose.Types.ObjectId.isValid(requestedQuizId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quiz ID'
        });
      }

      const courseQuizIds = new Set([
        ...(course.quizzes || []).map((id) => (id._id || id).toString()),
        ...flatSubsections.map((item) => item.linkedQuiz).filter(Boolean)
      ]);

      if (!courseQuizIds.has(requestedQuizId)) {
        return res.status(400).json({
          success: false,
          message: 'Quiz does not belong to this course'
        });
      }

      quizId = requestedQuizId;
    } else if (subSectionId) {
      const targetSubSection = flatSubsections.find((item) => item.subId === subSectionId);
      if (!targetSubSection) {
        return res.status(400).json({
          success: false,
          message: 'SubSection does not belong to this course'
        });
      }

      quizId = targetSubSection.linkedQuiz;
    } else {
      const next = getNextNormalLearningItem(course, progress);
      quizId = next.type === 'quiz' ? next.id : (course.quizzes[0]?._id || course.quizzes[0]);
    }

    if (!quizId) {
      return res.status(404).json({
        success: false,
        message: 'No quiz is linked to this lesson yet'
      });
    }

    // 3. Get the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // 4. Return full quiz data with correctAnswerIndex
    res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        questions: quiz.questions.map(q => ({
          question: q.question,
          questionImage: q.questionImage,
          type: q.type || 'mcq',
          options: q.options || [],
          correctAnswerIndex: q.correctAnswerIndex,
          pairs: q.pairs || []
        }))

      }
    });

  } catch (error) {
    console.error('Quiz access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.submitQuiz = async (req, res) => {
  const studentId = req.user.id;
  const { quizId } = req.params;
  const { answers } = req.body;

  // Level progression variables (declared here so they're accessible in response)
  let previousLevel = null;
  let newLevel = null;
  let levelChanged = false;

  try {
    const quiz = await Quiz.findById(quizId).populate({
      path: "courseId",
      populate: {
        path: "courseContent",
        populate: { path: "subSection" }
      }
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (!answers || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: "All questions must be answered" });
    }

    let score = 0;
    const results = [];

    // Evaluate answers
    quiz.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      let isCorrect = false;

      if (question.type.toLowerCase() === "mcq") {
        isCorrect = Number(question.correctAnswerIndex) === Number(studentAnswer);
      } else if (question.type.toLowerCase() === "dragdrop") {
        if (Array.isArray(studentAnswer) && studentAnswer.length === question.pairs.length) {
          isCorrect = question.pairs.every((pair, i) => {
            const leftAnswer = studentAnswer[i]?.left;
            const rightAnswer = studentAnswer[i]?.right;
            return (
              typeof leftAnswer === "string" &&
              typeof rightAnswer === "string" &&
              leftAnswer.trim().toLowerCase() === pair.left.trim().toLowerCase() &&
              rightAnswer.trim().toLowerCase() === pair.right.trim().toLowerCase()
            );
          });
        }
      }

      if (isCorrect) score++;

      results.push({
        question: question.question,
        type: question.type.toLowerCase(),
        selected: studentAnswer,
        correctAnswer:
          question.type.toLowerCase() === "mcq"
            ? question.options[question.correctAnswerIndex]
            : question.pairs,
        isCorrect,
      });
    });

    const percentage = (score / quiz.questions.length) * 100;

    // Track question performance
    const QuestionPerformance = require('../models/QuestionPerformance');

// After evaluating answers and before saving courseProgress
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const studentAnswer = answers[i];
      const isCorrect = results[i]?.isCorrect || false;

      // Estimate time spent per question (if you have timing data)
      // For now, use average time from total
      const timeSpentPerQuestion = req.body.timeSpent ?
          req.body.timeSpent / quiz.questions.length : 30; // default 30 seconds

      await QuestionPerformance.updateFromAttempt(
          quiz._id,
          i,
          question.question,
          question.type,
          isCorrect,
          timeSpentPerQuestion,
          studentAnswer
      ).catch(err => console.error('Error tracking question performance:', err));
    }

    // Ensure course progress exists
    let courseProgress = await CourseProgress.findOne({
      courseID: quiz.courseId._id,
      userId: studentId,
    });

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        userId: studentId,
        courseID: quiz.courseId._id,
        instructor: quiz.courseId.instructor,
        completedVideos: [],
        passedLevelQuiz: [],
        quizAttempts: [],
        remedialContent: [],
        needsRemedial: false,
      });
    }

    // Always log the attempt
    const attemptData = {
      quizId: quiz._id,
      courseId: quiz.courseId._id,
      level: quiz.courseId.level,
      percentage,
      score,
      total: quiz.questions.length,
      passed: percentage >= 80,
      attemptedAt: new Date(),
    };
    courseProgress.quizAttempts.push(attemptData);

    let nextCourseData = null;

    // Passed
    if (percentage >= 80) {
      const alreadyPassed = courseProgress.passedLevelQuiz.some(
        (q) => q.quizId.toString() === quiz._id.toString()
      );

      if (!alreadyPassed) {
        courseProgress.passedLevelQuiz.push({
          quizId: quiz._id,
          courseId: quiz.courseId._id,
          level: quiz.courseId.level,
          percentage,
          score,
          total: quiz.questions.length,
          passedAt: new Date(),
        });
      }

      const courseComplete = allRequiredCourseWorkComplete(quiz.courseId, courseProgress);
      courseProgress.isCourseCompleted = courseComplete;
      if (courseComplete) {
        courseProgress.completionStatus = 'completed';
      }

      // -------- LEVEL + ORDER LOGIC --------
      const currentCourse = quiz.courseId;
      const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
      const currentLevelRank = levelOrder[currentCourse.level];

      if (courseComplete) {
        // 1. Next course in same level with higher order (SAME CATEGORY)
        let nextCourse = await Course.findOne({
          level: currentCourse.level,
          category: currentCourse.category,
          order: { $gt: currentCourse.order },
        }).sort({ order: 1 });

        // 2. If none → go to the IMMEDIATE next level (rank+1), SAME CATEGORY.
        //    (Must pick the next level by rank, not by sorting the level string —
        //    'Advanced' sorts before 'Intermediate' alphabetically and would skip it.)
        if (!nextCourse) {
          const nextLevelName = Object.keys(levelOrder).find(
            (lvl) => levelOrder[lvl] === currentLevelRank + 1
          );
          if (nextLevelName) {
            nextCourse = await Course.findOne({
              category: currentCourse.category,
              level: nextLevelName,
            }).sort({ order: 1 });
          }
        }

        if (nextCourse) {
          if (!nextCourse.studentsEnrolled.includes(studentId)) {
            nextCourse.studentsEnrolled.push(studentId);
            await nextCourse.save();
          }

          nextCourseData = {
            _id: nextCourse._id,
            title: nextCourse.courseName || nextCourse.title || nextCourse.name,
            level: nextCourse.level,
            description: nextCourse.description,
          };
        }
      }

      // -------- STUDENT LEVEL PROGRESSION & GAMIFICATION --------
      const Student = require('../models/StudentModels/studentModels');

      // 1. Award Stars for Passing Quiz
      await Student.findByIdAndUpdate(studentId, { $inc: { stars: 10 } });

      // Get current level
      const student = await Student.findById(studentId);

      if (student && courseProgress.isCourseCompleted) {
        previousLevel = student.difficultyPreference || 'beginner';
        // Normalize level string (e.g. 'beginner' -> 'Beginner') for Course query
        const dbLevel = previousLevel.charAt(0).toUpperCase() + previousLevel.slice(1).toLowerCase();

        // 2. Strict Level Completion Check
        // Find ALL courses in this level AND same Category
        const levelCourses = await Course.find({
          level: dbLevel,
          category: currentCourse.category
          // status: 'Published' // Removed strict filter to prevent "vacuously true" completion if all courses are Draft
        }).select('_id order');

        // Find ALL progress for this user in this level (EXCLUDING current course)
        // We exclude current course because we'll add it manually with the NEW quiz result
        const otherProgress = await CourseProgress.find({
          userId: studentId,
          courseID: {
            $in: levelCourses.map(c => c._id).filter(id => id.toString() !== quiz.courseId._id.toString())
          }
        }).select('isCourseCompleted courseID');

        // ✅ FIX: Add current courseProgress (which now includes the NEW quiz pass) to the array
        const allProgress = [...otherProgress, courseProgress];

        const completedCourseIds = new Set();
        allProgress.forEach(p => {
          if (p.isCourseCompleted) {
            completedCourseIds.add(p.courseID.toString());
          }
        });

        console.log(`🔍 Level Completion Check for ${student.firstName}:`, {
          level: dbLevel,
          category: currentCourse.category,
          totalCoursesInLevel: levelCourses.length,
          completedCourses: completedCourseIds.size,
          completedCourseIds: Array.from(completedCourseIds),
          allCourseIds: levelCourses.map(c => c._id.toString())
        });

        // Prevent vacuous truth (if no courses found, don't promote)
        let allDone = false;
        let isLastCourse = false;

        if (levelCourses.length > 0) {
          allDone = levelCourses.every(c => completedCourseIds.has(c._id.toString()));

          // Check if current course is the LAST one (highest order) in this level+category
          const maxOrder = Math.max(...levelCourses.map(c => c.order || 0));
          isLastCourse = currentCourse.order === maxOrder;

          console.log(`📊 Last Course Check:`, {
            currentCourseOrder: currentCourse.order,
            maxOrderInLevel: maxOrder,
            isLastCourse
          });
        } else {
          console.log(`ℹ️ Level ${previousLevel} has 0 courses. Cannot complete logic.`);
        }

        // Only celebrate if ALL courses done AND this is the LAST course
        if (allDone && isLastCourse) {
          console.log(`🎉 Student ${studentId} has COMPLETED level ${previousLevel} on LAST course! Promoting...`);

          // Determine next level
          if (previousLevel === 'beginner') newLevel = 'intermediate';
          else if (previousLevel === 'intermediate') newLevel = 'advanced';
          else newLevel = 'advanced'; // Cap at advanced

          if (newLevel !== previousLevel) {
            levelChanged = true;

            // Update Student Level
            student.difficultyPreference = newLevel;
            // Add Level Completion Badge
            student.badges.push({
              name: `${dbLevel} Master`,
              description: `Completed all courses in ${dbLevel} level`,
              icon: '🏆',
              type: 'level_completion'
            });
            // Bonus Stars
            student.stars += 50;

            // Update level flags for THIS category (Kusoma/Kuhesabu) only.
            const completionCat = assessmentCategoryOfStyle(student.learningStyle);
            student.set(`levelStatus.${completionCat}.${previousLevel}`, true);

            await student.save({ validateBeforeSave: false });
          }
        } else {
          console.log(`ℹ️ Level ${previousLevel} not yet complete. ${completedCourseIds.size}/${levelCourses.length} courses finished.`);
          newLevel = previousLevel;
          levelChanged = false;
        }
      } else if (student) {
        previousLevel = student.difficultyPreference || 'beginner';
        newLevel = previousLevel;
        levelChanged = false;
      }

      // ✅ Clear remedials once passed
      courseProgress.remedialContent = [];
      courseProgress.needsRemedial = false;

    } else {
      // Failed → student stays at current level
      const Student = require('../models/StudentModels/studentModels');

      const student = await Student.findById(studentId).select('difficultyPreference');
      if (student) {
        previousLevel = student.difficultyPreference || 'beginner';
        newLevel = previousLevel; // Stay at same level
        levelChanged = false;
      }

      // Failed → assign remedial content from this course's section tree.
      const remedials = flattenCourseSubsections(quiz.courseId)
        .filter((item) => item.isRemedial && item.hasVideo)
        .map((item) => ({
          _id: item.subSection._id,
          sectionId: item.sectionId
        }));

      if (remedials.length > 0) {
        courseProgress.needsRemedial = true;
        remedials.forEach((r) => {
          if (
            !courseProgress.remedialContent.some(
              (x) => x.subSectionId.toString() === r._id.toString()
            )
          ) {
            courseProgress.remedialContent.push({
              sectionId: r.sectionId,
              subSectionId: r._id,
              completed: false,
            });
          }
        });
      }
    }

    await courseProgress.save();

    let nextLearningItem;
    if (courseProgress.needsRemedial) {
      const nextRemedial = courseProgress.remedialContent.find((item) => !item.completed);
      nextLearningItem = {
        type: nextRemedial ? 'remedial' : 'quiz',
        id: nextRemedial ? nextRemedial.subSectionId : quiz._id
      };
    } else {
      nextLearningItem = getNextNormalLearningItem(quiz.courseId, courseProgress);
    }

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        score,
        total: quiz.questions.length,
        percentage,
        passed: percentage >= 80,
        results,
        remedialAssigned: !(percentage >= 80),
        remedialContent: courseProgress.remedialContent || [],
        next: nextLearningItem,
        nextCourse: nextCourseData,
        // Student level progression data
        studentLevel: {
          previousLevel: previousLevel,
          newLevel: newLevel,
          levelChanged: levelChanged
        }
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error submitting quiz",
      error: err.message,
    });
  }
};
