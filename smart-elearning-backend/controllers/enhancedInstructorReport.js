const Course = require('../models/course');
const CourseProgress = require('../models/courseProgress');
const Student = require('../models/StudentModels/studentModels');
const Quiz = require('../models/quiz');
const QuestionPerformance = require('../models/QuestionPerformance');
const ReportService = require('../services/reportService');
const ReportCache = require('../models/ReportCache');
const ActivityLog = require('../models/ActivityLog');

/**
 * GET /api/report/instructor/enhanced-dashboard
 * Enhanced instructor dashboard with comprehensive analytics
 */
exports.getEnhancedInstructorDashboard = async (req, res) => {
    try {
        const instructorId = req.user.id;

        const cacheKey = ReportCache.generateKey('instructor-dashboard', instructorId);

        const { data, fromCache } = await ReportCache.getOrSet(
            cacheKey,
            600, // 10 minutes TTL
            async () => {
                // Get basic metrics (existing functionality enhanced)
                const basicMetrics = await getBasicMetrics(instructorId);

                // NEW: Time-series analytics
                const weeklyActivity = await getWeeklyActivity(instructorId);

                // NEW: Question-level quiz analysis
                const questionPerformance = await analyzeQuizQuestions(instructorId);

                // NEW: Remedial effectiveness
                const remedialEffectiveness = await analyzeRemedialImpact(instructorId);

                // NEW: Student engagement tiers
                const engagementTiers = await categorizeStudentEngagement(instructorId);

                // NEW: Predictive analytics (at-risk students)
                const atRiskStudents = await ReportService.identifyAtRiskStudents(instructorId);

                // NEW: Course completion trends
                const completionTrends = await getCompletionTrends(instructorId);

                // NEW: Student satisfaction (based on quiz performance and engagement)
                const satisfactionMetrics = await getSatisfactionMetrics(instructorId);

                return {
                    basicMetrics,
                    weeklyActivity,
                    questionPerformance,
                    remedialEffectiveness,
                    engagementTiers,
                    atRiskStudents,
                    completionTrends,
                    satisfactionMetrics,
                    generatedAt: new Date().toISOString()
                };
            }
        );

        // Log report view
        ActivityLog.log({
            userId: instructorId,
            userModel: 'instructors',
            userRole: 'instructor',
            action: 'report_view',
            metadata: {
                reportType: 'enhanced-dashboard',
                fromCache
            }
        });

        res.json({
            success: true,
            data,
            meta: {
                fromCache,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error generating enhanced instructor dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate enhanced dashboard',
            error: error.message
        });
    }
};

/**
 * GET /api/report/instructor/comparative/:courseId
 * Comparative analytics for a specific course
 */
exports.getComparativeAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;
        const instructorId = req.user.id;

        // Verify course belongs to instructor
        const course = await Course.findOne({
            _id: courseId,
            instructor: instructorId
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or access denied'
            });
        }

        const cacheKey = ReportCache.generateKey('instructor-comparative', instructorId, { courseId });

        const { data, fromCache } = await ReportCache.getOrSet(
            cacheKey,
            1800, // 30 minutes TTL
            async () => {
                // Get all progress for this course
                const progressRecords = await CourseProgress.find({ courseID: courseId })
                    .populate('userId', 'firstName lastName email')
                    .lean();

                if (progressRecords.length === 0) {
                    return {
                        message: 'No students enrolled in this course yet',
                        classStats: ReportService.calculateClassStats([]),
                        studentComparisons: []
                    };
                }

                // Calculate class statistics
                const classStats = ReportService.calculateClassStats(progressRecords);

                // Individual student comparisons
                const studentComparisons = progressRecords.map(record => {
                    const quizScore = ReportService.averageQuizScore(record);
                    const completion = ReportService.calculateCourseProgress(record);

                    return {
                        student: {
                            id: record.userId?._id,
                            name: record.userId ?
                                `${record.userId.firstName} ${record.userId.lastName}` : 'Unknown',
                            email: record.userId?.email
                        },
                        metrics: {
                            quizScore: quizScore.toFixed(1),
                            completion: completion,
                            timeSpent: ReportService.formatDuration(record.totalTimeSpent || 0),
                            timeSpentSeconds: record.totalTimeSpent || 0,
                            rankVsClass: ReportService.calculateRank(record, progressRecords, 'quiz')
                        },
                        percentiles: {
                            quizPercentile: ReportService.calculatePercentile(record, progressRecords, 'quiz'),
                            timePercentile: ReportService.calculatePercentile(record, progressRecords, 'time'),
                            completionPercentile: ReportService.calculatePercentile(record, progressRecords, 'completion')
                        },
                        status: this.determineStudentStatus(quizScore, completion, record),
                        lastActive: record.lastAccessed
                    };
                });

                // Sort by quiz score (highest first)
                studentComparisons.sort((a, b) =>
                    parseFloat(b.metrics.quizScore) - parseFloat(a.metrics.quizScore)
                );

                // Generate distribution graph data
                const distribution = ReportService.createDistributionGraph(progressRecords, 'quiz');

                return {
                    courseInfo: {
                        id: course._id,
                        name: course.courseName,
                        level: course.level,
                        totalStudents: progressRecords.length
                    },
                    classStats,
                    studentComparisons,
                    distribution
                };
            }
        );

        res.json({
            success: true,
            data,
            meta: { fromCache }
        });

    } catch (error) {
        console.error('Error generating comparative analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate comparative analytics',
            error: error.message
        });
    }
};

/**
 * GET /api/report/instructor/question-analysis/:quizId
 * Detailed question-level analysis for a quiz
 */
exports.getQuestionAnalysis = async (req, res) => {
    try {
        const { quizId } = req.params;
        const instructorId = req.user.id;

        // Verify quiz belongs to instructor
        const quiz = await Quiz.findOne({
            _id: quizId,
            instructor: instructorId
        }).populate('courseId', 'courseName');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found or access denied'
            });
        }

        // Get question performance data
        const questionPerformance = await QuestionPerformance.find({ quizId })
            .sort({ questionIndex: 1 })
            .lean();

        // If no performance data yet, generate from quiz structure
        if (questionPerformance.length === 0) {
            return res.json({
                success: true,
                data: {
                    quizInfo: {
                        id: quiz._id,
                        title: quiz.title,
                        courseName: quiz.courseId?.courseName,
                        totalQuestions: quiz.questions.length
                    },
                    questions: quiz.questions.map((q, index) => ({
                        index,
                        question: q.question,
                        type: q.type,
                        stats: {
                            totalAttempts: 0,
                            correctRate: 0,
                            difficulty: 0.5,
                            commonMistakes: []
                        }
                    })),
                    message: 'No attempts recorded yet for this quiz'
                }
            });
        }

        // Combine with quiz question text
        const questionsWithStats = quiz.questions.map((q, index) => {
            const perf = questionPerformance.find(p => p.questionIndex === index) || {};

            return {
                index,
                question: q.question,
                type: q.type,
                options: q.options,
                correctAnswerIndex: q.correctAnswerIndex,
                pairs: q.pairs,
                stats: {
                    totalAttempts: perf.totalAttempts || 0,
                    correctAttempts: perf.correctAttempts || 0,
                    incorrectAttempts: perf.incorrectAttempts || 0,
                    correctRate: perf.totalAttempts > 0 ?
                        ((perf.correctAttempts / perf.totalAttempts) * 100).toFixed(1) : 0,
                    difficulty: perf.difficultyIndex ?
                        (perf.difficultyIndex * 100).toFixed(1) : 50,
                    averageTimeSpent: perf.averageTimeSpent ?
                        Math.round(perf.averageTimeSpent) : 0,
                    commonMistakes: (perf.commonMistakes || [])
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3)
                }
            };
        });

        // Calculate overall quiz statistics
        const totalAttempts = questionPerformance.reduce((sum, q) => sum + (q.totalAttempts || 0), 0);
        const averageDifficulty = questionPerformance.reduce((sum, q) =>
            sum + (q.difficultyIndex || 0.5), 0) / questionPerformance.length;

        res.json({
            success: true,
            data: {
                quizInfo: {
                    id: quiz._id,
                    title: quiz.title,
                    courseName: quiz.courseId?.courseName,
                    totalQuestions: quiz.questions.length,
                    totalAttempts,
                    averageDifficulty: (averageDifficulty * 100).toFixed(1),
                    averageTimeSpent: Math.round(questionPerformance.reduce((sum, q) =>
                        sum + (q.averageTimeSpent || 0), 0) / questionPerformance.length)
                },
                questions: questionsWithStats
            }
        });

    } catch (error) {
        console.error('Error generating question analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate question analysis',
            error: error.message
        });
    }
};

/**
 * GET /api/report/instructor/remedial-effectiveness
 * Analyze effectiveness of remedial content
 */
exports.getRemedialEffectiveness = async (req, res) => {
    try {
        const instructorId = req.user.id;

        const cacheKey = ReportCache.generateKey('instructor-remedial', instructorId);

        const { data, fromCache } = await ReportCache.getOrSet(
            cacheKey,
            3600, // 1 hour TTL
            async () => {
                const effectiveness = await analyzeRemedialImpact(instructorId);
                return effectiveness;
            }
        );

        res.json({
            success: true,
            data,
            meta: { fromCache }
        });

    } catch (error) {
        console.error('Error analyzing remedial effectiveness:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze remedial effectiveness',
            error: error.message
        });
    }
};

/**
 * GET /api/report/instructor/at-risk-students
 * Get list of at-risk students with recommendations
 */
exports.getAtRiskStudents = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { courseId } = req.query;

        const atRiskStudents = await ReportService.identifyAtRiskStudents(instructorId, courseId);

        res.json({
            success: true,
            data: {
                total: atRiskStudents.length,
                byRiskLevel: {
                    high: atRiskStudents.filter(s => s.riskLevel === 'high').length,
                    medium: atRiskStudents.filter(s => s.riskLevel === 'medium').length,
                    low: atRiskStudents.filter(s => s.riskLevel === 'low').length
                },
                students: atRiskStudents
            }
        });

    } catch (error) {
        console.error('Error identifying at-risk students:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to identify at-risk students',
            error: error.message
        });
    }
};

// ==================== Helper Functions ====================

async function getBasicMetrics(instructorId) {
    const courses = await Course.find({ instructor: instructorId })
        .populate('studentsEnrolled')
        .lean();

    const metrics = [];

    for (const course of courses) {
        const progressRecords = await CourseProgress.find({ courseID: course._id })
            .lean();

        const totalStudents = course.studentsEnrolled.length;
        const completedCount = progressRecords.filter(p => p.isCourseCompleted).length;

        // Calculate average quiz score
        let totalQuizScore = 0;
        let quizCount = 0;
        progressRecords.forEach(p => {
            if (p.quizAttempts && p.quizAttempts.length > 0) {
                p.quizAttempts.forEach(q => {
                    totalQuizScore += q.percentage || 0;
                    quizCount++;
                });
            }
        });

        // Calculate average time spent
        const totalTimeSpent = progressRecords.reduce((sum, p) =>
            sum + (p.totalTimeSpent || 0), 0);

        // Count at-risk students
        const atRiskCount = progressRecords.filter(p => {
            if (!p.lastAccessed) return true;
            const daysInactive = (Date.now() - p.lastAccessed) / (24 * 60 * 60 * 1000);
            return daysInactive > 14;
        }).length;

        metrics.push({
            courseId: course._id,
            courseName: course.courseName,
            level: course.level,
            totalStudents,
            completionRate: totalStudents > 0 ?
                ((completedCount / totalStudents) * 100).toFixed(1) : 0,
            avgQuizScore: quizCount > 0 ?
                (totalQuizScore / quizCount).toFixed(1) : 0,
            avgTimeSpent: progressRecords.length > 0 ?
                ReportService.formatDuration(totalTimeSpent / progressRecords.length) : '0s',
            atRiskStudents: atRiskCount,
            completionCount: completedCount
        });
    }

    return metrics;
}

async function getWeeklyActivity(instructorId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const courses = await Course.find({ instructor: instructorId }).select('_id');
    const courseIds = courses.map(c => c._id);

    // Get activity logs for these courses
    const activities = await ActivityLog.find({
        courseId: { $in: courseIds },
        timestamp: { $gte: thirtyDaysAgo },
        action: { $in: ['video_complete', 'quiz_submit', 'login'] }
    }).lean();

    // Group by day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyCounts = {
        video: new Array(7).fill(0),
        quiz: new Array(7).fill(0),
        login: new Array(7).fill(0)
    };

    activities.forEach(a => {
        const day = new Date(a.timestamp).getDay();
        if (a.action === 'video_complete') dailyCounts.video[day]++;
        else if (a.action === 'quiz_submit') dailyCounts.quiz[day]++;
        else if (a.action === 'login') dailyCounts.login[day]++;
    });

    return {
        labels: days,
        videoViews: dailyCounts.video,
        quizSubmissions: dailyCounts.quiz,
        logins: dailyCounts.login
    };
}

async function analyzeQuizQuestions(instructorId) {
    // Get all quizzes by this instructor
    const quizzes = await Quiz.find({ instructor: instructorId }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    // Get question performance data
    const questionPerformance = await QuestionPerformance.find({
        quizId: { $in: quizIds }
    }).lean();

    if (questionPerformance.length === 0) {
        return {
            totalQuestions: 0,
            averageDifficulty: 0,
            hardestQuestions: [],
            easiestQuestions: []
        };
    }

    // Calculate statistics
    const totalQuestions = questionPerformance.length;
    const averageDifficulty = questionPerformance.reduce((sum, q) =>
        sum + (q.difficultyIndex || 0.5), 0) / totalQuestions;

    // Find hardest questions (highest difficulty)
    const hardestQuestions = questionPerformance
        .sort((a, b) => (b.difficultyIndex || 0) - (a.difficultyIndex || 0))
        .slice(0, 5)
        .map(q => ({
            quizId: q.quizId,
            questionIndex: q.questionIndex,
            difficulty: (q.difficultyIndex * 100).toFixed(1),
            totalAttempts: q.totalAttempts,
            correctRate: q.totalAttempts > 0 ?
                ((q.correctAttempts / q.totalAttempts) * 100).toFixed(1) : 0
        }));

    // Find easiest questions (lowest difficulty)
    const easiestQuestions = questionPerformance
        .sort((a, b) => (a.difficultyIndex || 0) - (b.difficultyIndex || 0))
        .slice(0, 5)
        .map(q => ({
            quizId: q.quizId,
            questionIndex: q.questionIndex,
            difficulty: (q.difficultyIndex * 100).toFixed(1),
            totalAttempts: q.totalAttempts,
            correctRate: q.totalAttempts > 0 ?
                ((q.correctAttempts / q.totalAttempts) * 100).toFixed(1) : 0
        }));

    return {
        totalQuestions,
        averageDifficulty: (averageDifficulty * 100).toFixed(1),
        hardestQuestions,
        easiestQuestions
    };
}

async function analyzeRemedialImpact(instructorId) {
    const courses = await Course.find({ instructor: instructorId }).select('_id');
    const courseIds = courses.map(c => c._id);

    // Find students who were assigned remedial content
    const progressWithRemedial = await CourseProgress.find({
        courseID: { $in: courseIds },
        remedialContent: { $exists: true, $ne: [] }
    }).populate('courseID', 'courseName').lean();

    if (progressWithRemedial.length === 0) {
        return {
            totalStudentsWithRemedial: 0,
            averageCompletionRate: 0,
            improvementRate: 0,
            effectivenessByCourse: []
        };
    }

    let totalCompletedRemedial = 0;
    let totalImproved = 0;
    const courseMap = new Map();

    progressWithRemedial.forEach(p => {
        const courseName = p.courseID?.courseName || 'Unknown';
        const remedialCount = p.remedialContent?.length || 0;
        const completedRemedial = p.remedialContent?.filter(r => r.completed).length || 0;

        if (!courseMap.has(courseName)) {
            courseMap.set(courseName, {
                courseName,
                totalStudents: 0,
                totalRemedial: 0,
                completedRemedial: 0
            });
        }

        const courseData = courseMap.get(courseName);
        courseData.totalStudents++;
        courseData.totalRemedial += remedialCount;
        courseData.completedRemedial += completedRemedial;

        totalCompletedRemedial += completedRemedial;

        // Check if student improved after remedial
        if (p.quizAttempts && p.quizAttempts.length > 1) {
            const attempts = p.quizAttempts;
            const beforeRemedial = attempts.filter(a =>
                !p.remedialContent?.some(r =>
                    new Date(r.assignedAt) < new Date(a.attemptedAt)
                )
            );
            const afterRemedial = attempts.filter(a =>
                p.remedialContent?.some(r =>
                    new Date(r.assignedAt) > new Date(a.attemptedAt)
                )
            );

            if (beforeRemedial.length > 0 && afterRemedial.length > 0) {
                const avgBefore = beforeRemedial.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                    beforeRemedial.length;
                const avgAfter = afterRemedial.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                    afterRemedial.length;

                if (avgAfter > avgBefore) {
                    totalImproved++;
                }
            }
        }
    });

    const effectivenessByCourse = Array.from(courseMap.values()).map(c => ({
        courseName: c.courseName,
        studentsCount: c.totalStudents,
        averageCompletionRate: c.totalRemedial > 0 ?
            ((c.completedRemedial / c.totalRemedial) * 100).toFixed(1) : 0,
        completedRemedial: c.completedRemedial,
        totalRemedial: c.totalRemedial
    }));

    return {
        totalStudentsWithRemedial: progressWithRemedial.length,
        averageCompletionRate: progressWithRemedial.reduce((sum, p) => {
            const rate = p.remedialContent?.length > 0 ?
                (p.remedialContent.filter(r => r.completed).length / p.remedialContent.length) * 100 : 0;
            return sum + rate;
        }, 0) / progressWithRemedial.length,
        improvementRate: progressWithRemedial.length > 0 ?
            ((totalImproved / progressWithRemedial.length) * 100).toFixed(1) : 0,
        effectivenessByCourse
    };
}

async function categorizeStudentEngagement(instructorId) {
    const courses = await Course.find({ instructor: instructorId }).select('_id');
    const courseIds = courses.map(c => c._id);

    const progressRecords = await CourseProgress.find({
        courseID: { $in: courseIds }
    }).lean();

    const tiers = {
        high: 0,   // Active daily or every other day, good progress
        medium: 0, // Active weekly, making progress
        low: 0,    // Active monthly, slow progress
        inactive: 0 // No activity in 14+ days
    };

    progressRecords.forEach(p => {
        if (!p.lastAccessed) {
            tiers.inactive++;
            return;
        }

        const daysSinceLastAccess = (Date.now() - p.lastAccessed) / (24 * 60 * 60 * 1000);

        if (daysSinceLastAccess > 14) {
            tiers.inactive++;
        } else if (daysSinceLastAccess > 7) {
            tiers.low++;
        } else if (daysSinceLastAccess > 2) {
            tiers.medium++;
        } else {
            // Check if making good progress
            const completion = ReportService.calculateCourseProgress(p);
            if (completion > 50 || p.quizAttempts?.length > 5) {
                tiers.high++;
            } else {
                tiers.medium++;
            }
        }
    });

    return tiers;
}

async function getCompletionTrends(instructorId) {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const courses = await Course.find({ instructor: instructorId }).select('_id');
    const courseIds = courses.map(c => c._id);

    const completions = await CourseProgress.find({
        courseID: { $in: courseIds },
        isCourseCompleted: true,
        updatedAt: { $gte: sixMonthsAgo }
    }).select('updatedAt courseID').lean();

    // Group by month
    const monthlyCompletions = {};
    const months = [];

    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        months.unshift(monthKey);
        monthlyCompletions[monthKey] = 0;
    }

    completions.forEach(c => {
        const date = new Date(c.updatedAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (monthlyCompletions[monthKey] !== undefined) {
            monthlyCompletions[monthKey]++;
        }
    });

    return {
        labels: months.map(m => {
            const [year, month] = m.split('-');
            return `${this.getMonthName(parseInt(month))} ${year}`;
        }),
        data: months.map(m => monthlyCompletions[m] || 0)
    };
}

async function getSatisfactionMetrics(instructorId) {
    const courses = await Course.find({ instructor: instructorId }).select('_id');
    const courseIds = courses.map(c => c._id);

    const progressRecords = await CourseProgress.find({
        courseID: { $in: courseIds }
    }).populate('userId', 'firstName lastName').lean();

    if (progressRecords.length === 0) {
        return {
            averageSatisfaction: 0,
            satisfactionDistribution: { high: 0, medium: 0, low: 0 },
            topPerformers: []
        };
    }

    // Calculate satisfaction score based on:
    // - Quiz performance (40%)
    // - Engagement frequency (30%)
    // - Completion rate (30%)
    const satisfactionScores = progressRecords.map(p => {
        const quizScore = ReportService.averageQuizScore(p) / 100; // Normalize to 0-1

        const daysSinceLastAccess = p.lastAccessed ?
            (Date.now() - p.lastAccessed) / (24 * 60 * 60 * 1000) : 30;
        const engagementScore = Math.max(0, 1 - (daysSinceLastAccess / 30));

        const completion = ReportService.calculateCourseProgress(p) / 100;

        const satisfaction = (quizScore * 0.4) + (engagementScore * 0.3) + (completion * 0.3);

        return {
            student: p.userId ?
                `${p.userId.firstName} ${p.userId.lastName}` : 'Unknown',
            score: satisfaction * 100,
            quizScore: quizScore * 100,
            engagement: engagementScore * 100,
            completion: completion * 100
        };
    });

    const distribution = {
        high: satisfactionScores.filter(s => s.score >= 75).length,
        medium: satisfactionScores.filter(s => s.score >= 50 && s.score < 75).length,
        low: satisfactionScores.filter(s => s.score < 50).length
    };

    const averageSatisfaction = satisfactionScores.reduce((sum, s) => sum + s.score, 0) /
        satisfactionScores.length;

    const topPerformers = satisfactionScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return {
        averageSatisfaction: averageSatisfaction.toFixed(1),
        satisfactionDistribution: distribution,
        topPerformers
    };
}

determineStudentStatus = (quizScore, completion, progress) => {
    if (quizScore >= 80 && completion >= 80) return 'excellent';
    if (quizScore >= 60 && completion >= 60) return 'good';
    if (quizScore >= 40 && completion >= 40) return 'average';
    if (progress.needsRemedial) return 'remedial';
    return 'struggling';
};

getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
};