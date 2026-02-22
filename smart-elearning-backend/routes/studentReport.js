const express = require('express');
const router = express.Router();
const {
    getMyProgressReport,
    getStudentBadges,
    getCourseProgressDetail
} = require('../controllers/studentReport');
const authenticate = require('../middleware/authenticate');
const { activityTracker } = require('../middleware/activityTracker');

// All student report routes require authentication
router.use(authenticate);

// My Progress Dashboard
router.get(
    '/my-progress',
    activityTracker('report_view'),
    getMyProgressReport
);

// Badges showcase
router.get('/badges', getStudentBadges);

// Course-specific progress
router.get('/course/:courseId', getCourseProgressDetail);

module.exports = router;