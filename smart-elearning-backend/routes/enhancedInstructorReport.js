const express = require('express');
const router = express.Router();
const {
    getEnhancedInstructorDashboard,
    getComparativeAnalytics,
    getQuestionAnalysis,
    getRemedialEffectiveness,
    getAtRiskStudents
} = require('../controllers/enhancedInstructorReport');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { activityTracker } = require('../middleware/activityTracker');

// All routes require authentication and instructor role
router.use(authenticate);
router.use(authorize(['instructor']));

// Enhanced dashboard with all metrics
router.get(
    '/enhanced-dashboard',
    activityTracker('report_view'),
    getEnhancedInstructorDashboard
);

// Comparative analytics for a specific course
router.get(
    '/comparative/:courseId',
    activityTracker('report_view'),
    getComparativeAnalytics
);

// Question-level analysis for a quiz
router.get(
    '/question-analysis/:quizId',
    activityTracker('report_view'),
    getQuestionAnalysis
);

// Remedial effectiveness analysis
router.get(
    '/remedial-effectiveness',
    activityTracker('report_view'),
    getRemedialEffectiveness
);

// At-risk students identification
router.get(
    '/at-risk-students',
    activityTracker('report_view'),
    getAtRiskStudents
);

module.exports = router;