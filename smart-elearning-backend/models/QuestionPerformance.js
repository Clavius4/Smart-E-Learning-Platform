const mongoose = require('mongoose');

const questionPerformanceSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentQuiz'
    },
    questionIndex: {
        type: Number,
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['mcq', 'dragdrop'],
        required: true
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    correctAttempts: {
        type: Number,
        default: 0
    },
    incorrectAttempts: {
        type: Number,
        default: 0
    },
    averageTimeSpent: {
        type: Number,
        default: 0 // in seconds
    },
    totalTimeSpent: {
        type: Number,
        default: 0
    },
    difficultyIndex: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5 // 0 = very easy, 1 = very hard
    },
    discriminationIndex: {
        type: Number,
        default: 0 // Measures how well question distinguishes high/low performers
    },
    commonMistakes: [{
        answer: mongoose.Schema.Types.Mixed,
        count: Number,
        percentage: Number
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for快速查找
questionPerformanceSchema.index({ quizId: 1, questionIndex: 1 }, { unique: true });
questionPerformanceSchema.index({ assessmentId: 1, questionIndex: 1 });

// Update performance when new attempt comes in
questionPerformanceSchema.statics.updateFromAttempt = async function(
    quizId,
    questionIndex,
    questionText,
    questionType,
    isCorrect,
    timeSpent,
    selectedAnswer
) {
    const perf = await this.findOneAndUpdate(
        { quizId, questionIndex },
        { $setOnInsert: { questionText, questionType } },
        { upsert: true, new: true }
    );

    // Update counts
    perf.totalAttempts++;
    if (isCorrect) {
        perf.correctAttempts++;
    } else {
        perf.incorrectAttempts++;

        // Track common mistakes
        const mistakeIndex = perf.commonMistakes.findIndex(
            m => JSON.stringify(m.answer) === JSON.stringify(selectedAnswer)
        );

        if (mistakeIndex >= 0) {
            perf.commonMistakes[mistakeIndex].count++;
            perf.commonMistakes[mistakeIndex].percentage =
                (perf.commonMistakes[mistakeIndex].count / perf.totalAttempts) * 100;
        } else {
            perf.commonMistakes.push({
                answer: selectedAnswer,
                count: 1,
                percentage: (1 / perf.totalAttempts) * 100
            });
        }
    }

    // Update time metrics
    perf.totalTimeSpent += timeSpent;
    perf.averageTimeSpent = perf.totalTimeSpent / perf.totalAttempts;

    // Calculate difficulty index (1 - correct rate)
    perf.difficultyIndex = 1 - (perf.correctAttempts / perf.totalAttempts);

    perf.lastUpdated = new Date();
    await perf.save();

    return perf;
};

module.exports = mongoose.model('QuestionPerformance', questionPerformanceSchema);