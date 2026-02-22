const express = require('express');
const router = express.Router();
const {
    getPlatformOverview,
    getUserAnalytics,
    getCourseAnalytics,
    getEngagementAnalytics,
    getInstructorPerformance,
    getSystemHealth
} = require('../controllers/adminReport');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { activityTracker } = require('../middleware/activityTracker');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Platform overview dashboard
router.get(
    '/platform-overview',
    activityTracker('report_view'),
    getPlatformOverview
);

// User analytics
router.get(
    '/user-analytics',
    activityTracker('report_view'),
    getUserAnalytics
);

// Course analytics
router.get(
    '/course-analytics',
    activityTracker('report_view'),
    getCourseAnalytics
);

// Engagement analytics
router.get(
    '/engagement-analytics',
    activityTracker('report_view'),
    getEngagementAnalytics
);

// Instructor performance
router.get(
    '/instructor-performance',
    activityTracker('report_view'),
    getInstructorPerformance
);

// System health
router.get(
    '/system-health',
    activityTracker('report_view'),
    getSystemHealth
);

module.exports = router;