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
            enum: ['beginner', 'intermediate', 'advanced']
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
        // Strict Level Progression Tracking
        levelStatus: {
            beginner: { type: Boolean, default: false }, // true when ALL beginner courses are done
            intermediate: { type: Boolean, default: false },
            advanced: { type: Boolean, default: false }
        }

    },
    { timestamps: true }
);


module.exports = mongoose.model('students', userSchema);
