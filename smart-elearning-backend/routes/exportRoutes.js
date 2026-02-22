const express = require('express');
const router = express.Router();
const {
    exportStudentProgress,
    exportInstructorDashboard,
    exportPlatformOverview,
    batchExportStudents
} = require('../controllers/exportController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { activityTracker } = require('../middleware/activityTracker');

// Student exports
router.get(
    '/student/progress',
    authenticate,
    authorize(['student']),
    activityTracker('report_export'),
    exportStudentProgress
);

// Instructor exports
router.get(
    '/instructor/dashboard',
    authenticate,
    authorize(['instructor']),
    activityTracker('report_export'),
    exportInstructorDashboard
);

// Admin exports
router.get(
    '/admin/platform-overview',
    authenticate,
    authorize(['admin']),
    activityTracker('report_export'),
    exportPlatformOverview
);

router.post(
    '/admin/batch-students',
    authenticate,
    authorize(['admin', 'instructor']),
    activityTracker('report_export'),
    batchExportStudents
);

module.exports = router;