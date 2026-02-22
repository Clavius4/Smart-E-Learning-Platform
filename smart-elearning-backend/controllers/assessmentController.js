const Assessment = require('../models/assessment');
const CourseProgress = require('../models/courseProgress');
const Student=require('../models/StudentModels/studentModels');
const Course = require('../models/course');
const { QuestionuploadImageToCloudinary } = require('../utils/imageUploader');

// assessmentController.js

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
    const alreadyPassed = progress?.passedLevelQuiz?.some(
      a =>
        a.passed === true &&
        (
          a.assessmentId?.toString() === assessment._id.toString() ||
          (a.level === assessment.level && a.category === assessment.category)
        )
    );

    if (alreadyPassed) {
      return res.status(200).json({ success: true, message: "Assessment already passed" });
    }

    res.status(200).json({
      success: true,
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        level: assessment.level,
        questions: assessment.questions.map(q => ({
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

    let score = 0;
    const results = [];

    for (let i = 0; i < assessment.questions.length; i++) {
      const question = assessment.questions[i];
      const answer = answers[i];
      let correct = false;

      if (question.type === 'mcq') {
        correct = answer.selected === question.correctAnswerIndex;
      } else if (question.type === 'dragdrop') {
        correct = Array.isArray(answer.selectedPairs) &&
          answer.selectedPairs.length === question.pairs.length &&
          answer.selectedPairs.every((pair, index) =>
            pair.drag === question.pairs[index].drag &&
            pair.drop === question.pairs[index].drop
          );
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

    const updatedProgress = await CourseProgress.findOneAndUpdate(
      { userId },
      {
        $addToSet: {
          passedLevelQuiz: {
            level: assessment.level,
            assessmentId: assessment._id,
            category: assessment.category,
            score,
            total: assessment.questions.length,
            percentage,
            passed
          }
        }
      },
      { upsert: true, new: true }
    );

    if (passed) {
      await Student.findByIdAndUpdate(
        userId,
        { difficultyPreference: assessment.level, desiredLevel: null },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      score,
      total: assessment.questions.length,
      percentage,
      passed,
      results
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
