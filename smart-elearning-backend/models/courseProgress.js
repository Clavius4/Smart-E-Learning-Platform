const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
   userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: true
  },
   instructor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'instructors',
          required: true
      },
  completedVideos: [{
    subsectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection"
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: Number // in seconds
  }],

  passedLevelQuiz: [
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentQuiz" },
    level: { type: String },
    category: { type: String },
    percentage: Number,
    score: Number,
    total: Number,
    passedAt: { type: Date, default: Date.now }
  }
]
,quizAttempts: [
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    level: { type: String },
    percentage: Number,
    score: Number,
    total: Number,
    passed: Boolean,
    attemptedAt: { type: Date, default: Date.now }
  }
],
  // Autoplay control
  currentSection: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
  currentSubSection: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection" },

  // Remedial flow
  remedialContent: [{
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    subSectionId: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection" },
    completed: { type: Boolean, default: false }
  }],
  needsRemedial: { type: Boolean, default: false },

  lastAccessed: Date,
  totalTimeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  progressBySection: [{
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section"
    },
    completedVideos: [mongoose.Schema.Types.ObjectId],
    timeSpent: Number
  }],
  completionStatus: {
    type: String,
    enum: ["not_started", "in_progress", "completed", "remedial_needed", "remedial_in_progress", "remedial_completed"],
    default: "not_started"
  }
  
  ,
   isCourseCompleted: { type: Boolean, default: false },
  nextCourse: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  
}, { timestamps: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
