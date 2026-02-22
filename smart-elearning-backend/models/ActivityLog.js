const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['students', 'instructors', 'Admin']
    },
    userRole: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login', 'logout', 'signup',
            'video_start', 'video_complete', 'video_progress',
            'quiz_start', 'quiz_submit', 'quiz_pass', 'quiz_fail',
            'course_enroll', 'course_complete',
            'assessment_start', 'assessment_submit', 'assessment_pass', 'assessment_fail',
            'profile_update', 'onboarding_complete',
            'report_view', 'report_export'
        ]
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentQuiz'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    sessionId: String
}, {
    timestamps: true
});

// Compound indexes for common queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ courseId: 1, action: 1 });
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90 days TTL

// Static method to log activity
activityLogSchema.statics.log = async function(data) {
    try {
        // Don't await - fire and forget for performance
        this.create(data).catch(err =>
            console.error('Activity log error:', err)
        );
    } catch (err) {
        // Silently fail - logging should never break main flow
        console.error('Activity log error:', err);
    }
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);