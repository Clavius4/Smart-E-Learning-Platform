const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware to track user activities
 * Add to routes that should be tracked
 */
const activityTracker = (action) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;
        let responseBody;

        // Override send to capture response
        res.send = function(body) {
            responseBody = body;
            return originalSend.call(this, body);
        };

        // Continue to next middleware/route handler
        next();

        // After response is sent, log activity
        res.on('finish', async () => {
            // Only log successful actions (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const metadata = {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    ...extractIdsFromRequest(req)
                };

                // Parse response for additional data if needed
                if (responseBody && typeof responseBody === 'string') {
                    try {
                        const parsed = JSON.parse(responseBody);
                        if (parsed.data) {
                            if (parsed.data.courseId) metadata.courseId = parsed.data.courseId;
                            if (parsed.data.quizId) metadata.quizId = parsed.data.quizId;
                            if (parsed.data.assessmentId) metadata.assessmentId = parsed.data.assessmentId;
                        }
                    } catch (e) {
                        // Ignore parsing errors
                    }
                }

                await ActivityLog.log({
                    userId: req.user.id,
                    userModel: getModelFromRole(req.user.role),
                    userRole: req.user.role,
                    action,
                    courseId: req.params.courseId || req.body.courseId || metadata.courseId,
                    quizId: req.params.quizId || req.body.quizId || metadata.quizId,
                    assessmentId: req.params.assessmentId || req.body.assessmentId || metadata.assessmentId,
                    metadata,
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    sessionId: req.session?.id
                });
            }
        });
    };
};

/**
 * Track video progress
 */
const trackVideoProgress = (req, res, next) => {
    const { courseId, lessonId, timeSpent, completed } = req.body;

    if (req.user && courseId && lessonId) {
        const action = completed ? 'video_complete' : 'video_progress';

        ActivityLog.log({
            userId: req.user.id,
            userModel: 'students',
            userRole: 'student',
            action,
            courseId,
            metadata: {
                lessonId,
                timeSpent,
                completed,
                timestamp: new Date().toISOString()
            }
        }).catch(console.error);
    }

    next();
};

/**
 * Track quiz submission
 */
const trackQuizSubmission = (req, res, next) => {
    const { quizId } = req.params;
    const { answers } = req.body;

    // Store for after response
    req._quizTracking = { quizId, answers, startTime: Date.now() };

    // Override send to capture result
    const originalSend = res.send;
    res.send = function(body) {
        if (req.user && req._quizTracking) {
            try {
                const result = JSON.parse(body);
                if (result.success) {
                    const action = result.data?.passed ? 'quiz_pass' : 'quiz_fail';

                    ActivityLog.log({
                        userId: req.user.id,
                        userModel: 'students',
                        userRole: 'student',
                        action,
                        quizId: req._quizTracking.quizId,
                        metadata: {
                            score: result.data?.score,
                            total: result.data?.total,
                            percentage: result.data?.percentage,
                            passed: result.data?.passed,
                            timeSpent: (Date.now() - req._quizTracking.startTime) / 1000,
                            answers: req._quizTracking.answers
                        }
                    }).catch(console.error);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
        return originalSend.call(this, body);
    };

    next();
};

// Helper functions
function extractIdsFromRequest(req) {
    const ids = {};

    // Check params
    if (req.params.courseId) ids.courseId = req.params.courseId;
    if (req.params.quizId) ids.quizId = req.params.quizId;
    if (req.params.assessmentId) ids.assessmentId = req.params.assessmentId;
    if (req.params.lessonId) ids.lessonId = req.params.lessonId;

    // Check body
    if (req.body.courseId) ids.courseId = req.body.courseId;
    if (req.body.quizId) ids.quizId = req.body.quizId;
    if (req.body.assessmentId) ids.assessmentId = req.body.assessmentId;
    if (req.body.lessonId) ids.lessonId = req.body.lessonId;

    return ids;
}

function getModelFromRole(role) {
    switch(role) {
        case 'student': return 'students';
        case 'instructor': return 'instructors';
        case 'admin': return 'Admin';
        default: return 'students';
    }
}

module.exports = {
    activityTracker,
    trackVideoProgress,
    trackQuizSubmission
};