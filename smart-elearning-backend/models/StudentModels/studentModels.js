const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },

        active: {
            type: Boolean,
            default: true,
        },
        additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            required: true
        },


        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        image: {
            type: String,
            required: true
        },
        token: {
            type: String
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordTokenExpires: {
            type: Date
        },
        courseProgress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CourseProgress'

            }
        ],

        learningStyle: {
            type: String,
            enum: ['visual', 'text', 'literacy', 'numeracy'],
            default: 'visual'
        },
        interests: {
            type: [String],
            default: []
        },
        difficultyPreference: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        desiredLevel: {
            type: String,
            // null is allowed (cleared once the target level is reached/abandoned).
            enum: ['beginner', 'intermediate', 'advanced', null],
            default: null
        },
        signLanguage: {
            type: String,
            default: 'Tanzanian Sign Language'
        },
        avatar: {
            type: Number,
            default: 1
        },
        onboardingComplete: {
            type: Boolean,
            default: false
        },
        // Gamification & Rewards
        stars: {
            type: Number,
            default: 0
        },
        badges: [
            {
                name: String,
                description: String,
                icon: String, // Emoji or URL
                earnedAt: { type: Date, default: Date.now },
                type: { type: String, enum: ['course_completion', 'level_completion', 'perfect_score', 'streak'] }
            }
        ],
        passedAssessments: [
            {
                assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentQuiz' },
                level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
                category: { type: String, enum: ['literacy', 'numeracy'] },
                percentage: Number,
                score: Number,
                total: Number,
                passedAt: { type: Date, default: Date.now }
            }
        ],
        // Strict Level Progression Tracking — per category. true when ALL courses
        // in that category+level are done. Keyed by assessment category so Kusoma
        // and Kuhesabu completion are tracked independently.
        levelStatus: {
            literacy: {
                beginner: { type: Boolean, default: false },
                intermediate: { type: Boolean, default: false },
                advanced: { type: Boolean, default: false }
            },
            numeracy: {
                beginner: { type: Boolean, default: false },
                intermediate: { type: Boolean, default: false },
                advanced: { type: Boolean, default: false }
            }
        },
        // Placement-assessment attempt tracking (per level+category) for
        // attempt limits + cooldown. See utils/levelAccess + assessmentController.
        assessmentAttempts: [
            {
                level: { type: String, enum: ['intermediate', 'advanced'] },
                category: { type: String, enum: ['literacy', 'numeracy'] },
                attempts: { type: Number, default: 0 },
                lastAttemptAt: { type: Date },
                passed: { type: Boolean, default: false }
            }
        ],
        // Per-category proven/target level. `difficultyPreference` + `desiredLevel`
        // hold the CURRENT category's live values; when the student switches
        // category (learningStyle) the current values are snapshotted here and the
        // other category's values are swapped in. Keeps Kusoma & Kuhesabu progress
        // independent. See utils/levelAccess.applyCategorySwitch.
        categoryProgress: {
            literacy: {
                proven: { type: String, default: 'beginner' },
                desired: { type: String, default: null }
            },
            numeracy: {
                proven: { type: String, default: 'beginner' },
                desired: { type: String, default: null }
            }
        }

    },
    { timestamps: true }
);


module.exports = mongoose.model('students', userSchema);
