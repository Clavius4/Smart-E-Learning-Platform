const Student = require('../models/StudentModels/studentModels');
const Instructor = require('../models/InstructorModels/InstructorModels');
const Admin = require('../models/admin');
const Course = require('../models/course');
const Category = require('../models/category');
const CourseProgress = require('../models/courseProgress');
const ActivityLog = require('../models/ActivityLog');
const ReportService = require('../services/reportService');
const ReportCache = require('../models/ReportCache');

/**
 * GET /api/admin/report/platform-overview
 * Comprehensive platform overview for admin
 */
exports.getPlatformOverview = async (req, res) => {
    try {
        const cacheKey = ReportCache.generateKey('admin-platform-overview', 'admin');

        const { data, fromCache } = await ReportCache.getOrSet(
            cacheKey,
            1800, // 30 minutes TTL
            async () => {
                // User analytics
                const userMetrics = await getUserAnalytics();

                // Course analytics
                const courseMetrics = await getCourseAnalytics();

                // Engagement analytics
                const engagementMetrics = await getEngagementAnalytics();

                // Performance trends
                const trends = await getPerformanceTrends();

                // Instructor effectiveness
                const instructorMetrics = await getInstructorEffectiveness();

                // System health
                const systemHealth = await getSystemHealth();

                // Revenue/Financial metrics (if applicable)
                const financialMetrics = await getFinancialMetrics();

                return {
                    userMetrics,
                    courseMetrics,
                    engagementMetrics,
                    trends,
                    instructorMetrics,
                    systemHealth,
                    financialMetrics,
                    generatedAt: new Date().toISOString()
                };
            }
        );

        // Log admin report view
        ActivityLog.log({
            userId: req.user.id,
            userModel: 'Admin',
            userRole: 'admin',
            action: 'report_view',
            metadata: {
                reportType: 'platform-overview',
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
        console.error('Error generating platform overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate platform overview',
            error: error.message
        });
    }
};

/**
 * GET /api/admin/report/user-analytics
 * Detailed user analytics
 */
exports.getUserAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        const cacheKey = ReportCache.generateKey('admin-user-analytics', 'admin', { period });

        const { data, fromCache } = await ReportCache.getOrSet(
            cacheKey,
            3600, // 1 hour TTL
            async () => {
                return await getUserAnalytics(period);
            }
        );

        res.json({
            success: true,
            data,
            meta: { fromCache }
        });

    } catch (error) {
        console.error('Error generating user analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate user analytics',
            error: error.message
        });
    }
};

/**
 * GET /api/admin/report/course-analytics
 * Detailed course analytics
 */
exports.getCourseAnalytics = async (req, res) => {
    try {
        const cacheKey = ReportCache.generateKey('admin-course-analytics', 'admin');

        const { data, fromCache } = await ReportCache.getOrSet(
            cacheKey,
            3600, // 1 hour TTL
            async () => {
                return await getCourseAnalytics();
            }
        );

        res.json({
            success: true,
            data,
            meta: { fromCache }
        });

    } catch (error) {
        console.error('Error generating course analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate course analytics',
            error: error.message
        });
    }
};

/**
 * GET /api/admin/report/engagement-analytics
 * Detailed engagement analytics
 */
exports.getEngagementAnalytics = async (req, res) => {
    try {
        const cacheKey = ReportCache.generateKey('admin-engagement', 'admin');

        const { data, fromCache } = await ReportCache.getOrSet(
            cacheKey,
            3600, // 1 hour TTL
            async () => {
                return await getEngagementAnalytics();
            }
        );

        res.json({
            success: true,
            data,
            meta: { fromCache }
        });

    } catch (error) {
        console.error('Error generating engagement analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate engagement analytics',
            error: error.message
        });
    }
};

/**
 * GET /api/admin/report/instructor-performance
 * Instructor performance metrics
 */
exports.getInstructorPerformance = async (req, res) => {
    try {
        const instructorMetrics = await getInstructorEffectiveness();

        res.json({
            success: true,
            data: instructorMetrics
        });

    } catch (error) {
        console.error('Error generating instructor performance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate instructor performance',
            error: error.message
        });
    }
};

/**
 * GET /api/admin/report/system-health
 * System health metrics
 */
exports.getSystemHealth = async (req, res) => {
    try {
        const systemHealth = await getSystemHealth();

        res.json({
            success: true,
            data: systemHealth
        });

    } catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get system health',
            error: error.message
        });
    }
};

// ==================== Helper Functions ====================

async function getUserAnalytics(period = '30d') {
    // Parse period
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;
    if (period === '1y') days = 365;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalStudents = await Student.countDocuments();
    const totalInstructors = await Instructor.countDocuments();
    const totalAdmins = await Admin.countDocuments();

    // New users in period
    const newStudents = await Student.countDocuments({ createdAt: { $gte: since } });
    const newInstructors = await Instructor.countDocuments({ createdAt: { $gte: since } });

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeStudents = await ActivityLog.distinct('userId', {
        userRole: 'student',
        timestamp: { $gte: thirtyDaysAgo }
    });

    const activeInstructors = await ActivityLog.distinct('userId', {
        userRole: 'instructor',
        timestamp: { $gte: thirtyDaysAgo }
    });

    // Onboarding completion rate
    const onboardedStudents = await Student.countDocuments({ onboardingComplete: true });

    // User growth (monthly for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const studentGrowth = await Student.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const instructorGrowth = await Instructor.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format growth data for charts
    const months = [];
    const studentGrowthData = [];
    const instructorGrowthData = [];

    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months.unshift(monthYear);

        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const studentMonth = studentGrowth.find(g => g._id.month === month && g._id.year === year);
        studentGrowthData.unshift(studentMonth ? studentMonth.count : 0);

        const instructorMonth = instructorGrowth.find(g => g._id.month === month && g._id.year === year);
        instructorGrowthData.unshift(instructorMonth ? instructorMonth.count : 0);
    }

    return {
        totals: {
            students: totalStudents,
            instructors: totalInstructors,
            admins: totalAdmins,
            total: totalStudents + totalInstructors + totalAdmins
        },
        new: {
            students: newStudents,
            instructors: newInstructors,
            total: newStudents + newInstructors
        },
        active: {
            students: activeStudents.length,
            instructors: activeInstructors.length,
            percentage: totalStudents > 0 ?
                ((activeStudents.length / totalStudents) * 100).toFixed(1) : 0
        },
        onboarding: {
            completed: onboardedStudents,
            rate: totalStudents > 0 ?
                ((onboardedStudents / totalStudents) * 100).toFixed(1) : 0
        },
        growth: {
            labels: months,
            students: studentGrowthData,
            instructors: instructorGrowthData
        }
    };
}

async function getCourseAnalytics() {
    // Basic course counts
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'Published' });
    const draftCourses = await Course.countDocuments({ status: 'Draft' });

    // Course distribution by level
    const levelDistribution = await Course.aggregate([
        { $group: {
                _id: '$level',
                count: { $sum: 1 },
                totalEnrollments: { $sum: { $size: '$studentsEnrolled' } }
            }},
        { $sort: { '_id': 1 } }
    ]);

    // Course distribution by category
    const categoryDistribution = await Course.aggregate([
        { $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalEnrollments: { $sum: { $size: '$studentsEnrolled' } }
            }},
        { $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryInfo'
            }}
    ]);

    // Format category distribution
    const formattedCategoryDist = categoryDistribution.map(c => ({
        categoryId: c._id,
        categoryName: c.categoryInfo[0]?.name || 'Unknown',
        courseCount: c.count,
        enrollments: c.totalEnrollments
    }));

    // Popular courses (by enrollment)
    const popularCourses = await Course.find()
        .sort({ studentsEnrolled: -1 })
        .limit(10)
        .populate('instructor', 'firstName lastName')
        .select('courseName level studentsEnrolled thumbnail createdAt')
        .lean();

    // Completion rates by course
    const completionRates = await calculateCompletionRates();

    // Recent courses
    const recentCourses = await Course.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('instructor', 'firstName lastName')
        .select('courseName level status createdAt')
        .lean();

    return {
        totals: {
            total: totalCourses,
            published: publishedCourses,
            draft: draftCourses,
            publishedRate: totalCourses > 0 ?
                ((publishedCourses / totalCourses) * 100).toFixed(1) : 0
        },
        levelDistribution: levelDistribution.map(l => ({
            level: l._id || 'Unknown',
            count: l.count,
            enrollments: l.totalEnrollments
        })),
        categoryDistribution: formattedCategoryDist,
        popularCourses: popularCourses.map(c => ({
            id: c._id,
            name: c.courseName,
            level: c.level,
            instructor: c.instructor ?
                `${c.instructor.firstName} ${c.instructor.lastName}` : 'Unknown',
            enrollments: c.studentsEnrolled?.length || 0,
            thumbnail: c.thumbnail
        })),
        completionRates,
        recentCourses
    };
}

async function calculateCompletionRates() {
    const courses = await Course.find().select('_id courseName level').lean();

    const completionRates = [];

    for (const course of courses) {
        const progressRecords = await CourseProgress.find({ courseID: course._id })
            .select('isCourseCompleted')
            .lean();

        const totalStudents = progressRecords.length;
        const completedStudents = progressRecords.filter(p => p.isCourseCompleted).length;

        completionRates.push({
            courseId: course._id,
            courseName: course.courseName,
            level: course.level,
            totalStudents,
            completedStudents,
            completionRate: totalStudents > 0 ?
                ((completedStudents / totalStudents) * 100).toFixed(1) : 0
        });
    }

    return completionRates.sort((a, b) => b.completionRate - a.completionRate);
}

async function getEngagementAnalytics() {
    const allProgress = await CourseProgress.find().lean();

    if (allProgress.length === 0) {
        return {
            averageTimeSpent: 0,
            averageQuizScore: 0,
            passRate: 0,
            remedialRate: 0,
            dailyActive: [],
            weeklyActive: []
        };
    }

    // Average time spent per student
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0);
    const avgTimeSpentSeconds = totalTimeSpent / allProgress.length;

    // Quiz statistics
    const quizAttempts = allProgress.flatMap(p => p.quizAttempts || []);
    const totalQuizScore = quizAttempts.reduce((sum, q) => sum + (q.percentage || 0), 0);
    const avgQuizScore = quizAttempts.length > 0 ? totalQuizScore / quizAttempts.length : 0;

    const passedQuizzes = quizAttempts.filter(q => q.passed).length;
    const passRate = quizAttempts.length > 0 ? (passedQuizzes / quizAttempts.length) * 100 : 0;

    // Remedial usage
    const remedialUsage = allProgress.filter(p => p.remedialContent?.length > 0).length;

    // Daily active users (last 7 days)
    const dailyActive = await getDailyActiveUsers(7);

    // Weekly active users (last 4 weeks)
    const weeklyActive = await getWeeklyActiveUsers(4);

    // Engagement by hour (peak usage times)
    const hourlyActivity = await getHourlyActivity();

    return {
        averages: {
            timeSpent: ReportService.formatDuration(avgTimeSpentSeconds),
            timeSpentSeconds: avgTimeSpentSeconds,
            quizScore: avgQuizScore.toFixed(1),
            passRate: passRate.toFixed(1)
        },
        totals: {
            totalAttempts: quizAttempts.length,
            totalPassed: passedQuizzes,
            studentsInRemedial: remedialUsage,
            remedialRate: allProgress.length > 0 ?
                ((remedialUsage / allProgress.length) * 100).toFixed(1) : 0
        },
        dailyActive,
        weeklyActive,
        hourlyActivity
    };
}

async function getDailyActiveUsers(days = 7) {
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const activeUsers = await ActivityLog.distinct('userId', {
            timestamp: { $gte: date, $lt: nextDate },
            userRole: 'student'
        });

        result.push({
            date: date.toISOString().split('T')[0],
            count: activeUsers.length,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
    }

    return result;
}

async function getWeeklyActiveUsers(weeks = 4) {
    const result = [];

    for (let i = weeks - 1; i >= 0; i--) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (i * 7));
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        const activeUsers = await ActivityLog.distinct('userId', {
            timestamp: { $gte: startDate, $lt: endDate },
            userRole: 'student'
        });

        result.push({
            week: `Week ${weeks - i}`,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            count: activeUsers.length
        });
    }

    return result;
}

async function getHourlyActivity() {
    const result = [];

    for (let hour = 0; hour < 24; hour++) {
        const startHour = new Date();
        startHour.setHours(hour, 0, 0, 0);

        const endHour = new Date();
        endHour.setHours(hour, 59, 59, 999);

        // Get average over last 7 days
        let totalCount = 0;
        let daysCount = 0;

        for (let day = 0; day < 7; day++) {
            const dayStart = new Date(startHour);
            dayStart.setDate(dayStart.getDate() - day);

            const dayEnd = new Date(endHour);
            dayEnd.setDate(dayEnd.getDate() - day);

            const count = await ActivityLog.countDocuments({
                timestamp: { $gte: dayStart, $lt: dayEnd },
                userRole: 'student'
            });

            totalCount += count;
            daysCount++;
        }

        result.push({
            hour,
            displayHour: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
            averageCount: Math.round(totalCount / daysCount)
        });
    }

    return result;
}

async function getPerformanceTrends() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Course completions over time
    const completionsByMonth = await CourseProgress.aggregate([
        { $match: {
                isCourseCompleted: true,
                updatedAt: { $gte: sixMonthsAgo }
            }},
        { $group: {
                _id: {
                    year: { $year: '$updatedAt' },
                    month: { $month: '$updatedAt' }
                },
                count: { $sum: 1 }
            }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Quiz attempts over time
    const quizAttemptsByMonth = await ActivityLog.aggregate([
        { $match: {
                action: { $in: ['quiz_submit', 'quiz_pass', 'quiz_fail'] },
                timestamp: { $gte: sixMonthsAgo }
            }},
        { $group: {
                _id: {
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' }
                },
                total: { $sum: 1 },
                passed: { $sum: { $cond: [{ $eq: ['$action', 'quiz_pass'] }, 1, 0] } }
            }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format for chart
    const months = [];
    const completionsData = [];
    const attemptsData = [];
    const passRatesData = [];

    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months.unshift(monthYear);

        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const completions = completionsByMonth.find(c =>
            c._id.month === month && c._id.year === year
        );
        completionsData.unshift(completions ? completions.count : 0);

        const attempts = quizAttemptsByMonth.find(a =>
            a._id.month === month && a._id.year === year
        );
        attemptsData.unshift(attempts ? attempts.total : 0);

        const passRate = attempts && attempts.total > 0 ?
            (attempts.passed / attempts.total) * 100 : 0;
        passRatesData.unshift(passRate.toFixed(1));
    }

    return {
        labels: months,
        completions: completionsData,
        quizAttempts: attemptsData,
        passRates: passRatesData
    };
}

async function getInstructorEffectiveness() {
    const instructors = await Instructor.find()
        .select('firstName lastName email courses')
        .lean();

    const effectiveness = [];

    for (const instructor of instructors) {
        const courseIds = instructor.courses || [];

        if (courseIds.length === 0) {
            effectiveness.push({
                instructorId: instructor._id,
                name: `${instructor.firstName} ${instructor.lastName}`,
                email: instructor.email,
                courseCount: 0,
                totalStudents: 0,
                averageCompletionRate: 0,
                averageQuizScore: 0,
                studentSatisfaction: 0
            });
            continue;
        }

        // Get all progress for instructor's courses
        const progressRecords = await CourseProgress.find({
            courseID: { $in: courseIds }
        }).lean();

        // Calculate metrics
        let totalStudents = 0;
        let totalQuizScore = 0;
        let quizCount = 0;
        let completions = 0;

        const uniqueStudents = new Set();

        progressRecords.forEach(p => {
            if (p.userId) uniqueStudents.add(p.userId.toString());
            if (p.isCourseCompleted) completions++;

            if (p.quizAttempts && p.quizAttempts.length > 0) {
                p.quizAttempts.forEach(q => {
                    totalQuizScore += q.percentage || 0;
                    quizCount++;
                });
            }
        });

        const studentCount = uniqueStudents.size;

        effectiveness.push({
            instructorId: instructor._id,
            name: `${instructor.firstName} ${instructor.lastName}`,
            email: instructor.email,
            courseCount: courseIds.length,
            totalStudents: studentCount,
            averageCompletionRate: progressRecords.length > 0 ?
                ((completions / progressRecords.length) * 100).toFixed(1) : 0,
            averageQuizScore: quizCount > 0 ?
                (totalQuizScore / quizCount).toFixed(1) : 0,
            studentSatisfaction: calculateSatisfactionScore(progressRecords)
        });
    }

    // Sort by effectiveness (average quiz score)
    return effectiveness.sort((a, b) => b.averageQuizScore - a.averageQuizScore);
}

function calculateSatisfactionScore(progressRecords) {
    if (progressRecords.length === 0) return 0;

    let totalScore = 0;

    progressRecords.forEach(p => {
        // Based on completion and quiz performance
        const completion = p.isCourseCompleted ? 100 : 0;
        const quizAvg = ReportService.averageQuizScore(p);
        const score = (completion * 0.3) + (quizAvg * 0.7);
        totalScore += score;
    });

    return (totalScore / progressRecords.length).toFixed(1);
}

async function getSystemHealth() {
    // Get counts and basic metrics
    const totalUsers = await Student.countDocuments() + await Instructor.countDocuments();
    const totalCourses = await Course.countDocuments();

    // Get activity in last hour
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const activeLastHour = await ActivityLog.distinct('userId', {
        timestamp: { $gte: lastHour }
    });

    // Error rate (simplified - would need error logging in production)
    const errorRate = 0.5; // Placeholder

    // Response times (would need middleware tracking)
    const avgResponseTime = 250; // Placeholder in ms

    // Database connection status
    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';

    // Storage usage (approximate)
    const stats = await mongoose.connection.db.stats();
    const storageUsed = stats.dataSize || 0;

    return {
        status: 'operational',
        uptime: process.uptime(),
        metrics: {
            totalUsers,
            totalCourses,
            activeLastHour: activeLastHour.length,
            errorRate: errorRate.toFixed(1),
            avgResponseTime
        },
        database: {
            status: dbStatus,
            storageUsed: formatBytes(storageUsed),
            collections: stats.collections || 0
        },
        timestamp: new Date().toISOString()
    };
}

async function getFinancialMetrics() {
    // This would integrate with payment system
    // Placeholder for now
    return {
        totalRevenue: 0,
        monthlyRevenue: [],
        averageRevenuePerUser: 0,
        conversionRate: 0
    };
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}