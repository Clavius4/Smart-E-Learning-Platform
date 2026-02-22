const ExportService = require('../services/exportService');
const ReportService = require('../services/reportService');
const Student = require('../models/StudentModels/studentModels');
const CourseProgress = require('../models/courseProgress');
const Course = require('../models/course');
const ActivityLog = require('../models/ActivityLog');

/**
 * Export student progress report
 */
exports.exportStudentProgress = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        const studentId = req.user.id;

        // Fetch report data (reuse from studentReport controller)
        const student = await Student.findById(studentId)
            .populate({
                path: 'courses',
                populate: { path: 'category' }
            })
            .lean();

        const progressRecords = await CourseProgress.find({ userId: studentId })
            .populate({
                path: 'courseID',
                populate: { path: 'category' }
            })
            .lean();

        const courseProgress = progressRecords.map(p =>
            ReportService.formatCourseProgress(p)
        );

        const recentActivity = await ReportService.getRecentActivity(studentId, 30);
        const overallStats = ReportService.calculateOverallStats(progressRecords);

        const reportData = {
            student: {
                name: `${student.firstName} ${student.lastName}`,
                level: student.difficultyPreference || 'beginner',
                learningStyle: student.learningStyle,
                signLanguage: student.signLanguage,
                stars: student.stars || 0
            },
            overallStats,
            courseProgress,
            recentActivity,
            badges: student.badges || []
        };

        // Generate export based on format
        if (format === 'pdf') {
            const pdfBuffer = await ExportService.generatePDF(
                reportData,
                'student-progress',
                { studentName: reportData.student.name }
            );

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=student-progress-${studentId}.pdf`
            );
            res.send(pdfBuffer);

        } else if (format === 'excel') {
            const workbook = await ExportService.generateExcel(reportData, 'student-progress');

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=student-progress-${studentId}.xlsx`
            );

            await workbook.xlsx.write(res);
            res.end();

        } else if (format === 'csv') {
            // Simple CSV export of course progress
            const headers = ['Course', 'Level', 'Progress %', 'Quiz Avg', 'Time Spent', 'Status'];
            const csvData = courseProgress.map(c => ({
                'Course': c.courseName,
                'Level': c.level,
                'Progress %': c.metrics.videoCompletion,
                'Quiz Avg': c.metrics.averageQuizScore,
                'Time Spent': c.metrics.timeSpent,
                'Status': c.status
            }));

            const csv = ExportService.generateCSV(csvData, headers);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=student-progress-${studentId}.csv`
            );
            res.send(csv);

        } else {
            res.status(400).json({
                success: false,
                message: 'Unsupported export format. Use pdf, excel, or csv.'
            });
        }

        // Log export
        ActivityLog.log({
            userId: studentId,
            userModel: 'students',
            userRole: 'student',
            action: 'report_export',
            metadata: { format, reportType: 'student-progress' }
        });

    } catch (error) {
        console.error('Error exporting student progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export report',
            error: error.message
        });
    }
};

/**
 * Export instructor dashboard report
 */
exports.exportInstructorDashboard = async (req, res) => {
    try {
        const { format = 'pdf', courseId } = req.query;
        const instructorId = req.user.id;

        // Fetch instructor data
        const basicMetrics = await getBasicMetrics(instructorId);
        const atRiskStudents = await ReportService.identifyAtRiskStudents(instructorId, courseId);
        const remedialEffectiveness = await analyzeRemedialImpact(instructorId);

        const reportData = {
            basicMetrics,
            atRiskStudents,
            remedialEffectiveness,
            generatedAt: new Date().toISOString()
        };

        if (format === 'pdf') {
            const pdfBuffer = await ExportService.generatePDF(
                reportData,
                'instructor-dashboard'
            );

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=instructor-dashboard-${instructorId}.pdf`
            );
            res.send(pdfBuffer);

        } else if (format === 'excel') {
            const workbook = await ExportService.generateExcel(reportData, 'instructor-dashboard');

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=instructor-dashboard-${instructorId}.xlsx`
            );

            await workbook.xlsx.write(res);
            res.end();

        } else {
            res.status(400).json({
                success: false,
                message: 'Unsupported export format. Use pdf or excel.'
            });
        }

        ActivityLog.log({
            userId: instructorId,
            userModel: 'instructors',
            userRole: 'instructor',
            action: 'report_export',
            metadata: { format, reportType: 'instructor-dashboard' }
        });

    } catch (error) {
        console.error('Error exporting instructor dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export report',
            error: error.message
        });
    }
};

/**
 * Export platform overview report (admin only)
 */
exports.exportPlatformOverview = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;

        // Fetch platform data
        const userMetrics = await getUserAnalytics();
        const courseMetrics = await getCourseAnalytics();
        const engagementMetrics = await getEngagementAnalytics();
        const trends = await getPerformanceTrends();

        const reportData = {
            userMetrics,
            courseMetrics,
            engagementMetrics,
            trends,
            generatedAt: new Date().toISOString()
        };

        if (format === 'pdf') {
            const pdfBuffer = await ExportService.generatePDF(reportData, 'platform-overview');

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=platform-overview.pdf`
            );
            res.send(pdfBuffer);

        } else if (format === 'excel') {
            const workbook = await ExportService.generateExcel(reportData, 'platform-overview');

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=platform-overview.xlsx`
            );

            await workbook.xlsx.write(res);
            res.end();

        } else {
            res.status(400).json({
                success: false,
                message: 'Unsupported export format. Use pdf or excel.'
            });
        }

        ActivityLog.log({
            userId: req.user.id,
            userModel: 'Admin',
            userRole: 'admin',
            action: 'report_export',
            metadata: { format, reportType: 'platform-overview' }
        });

    } catch (error) {
        console.error('Error exporting platform overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export report',
            error: error.message
        });
    }
};

/**
 * Batch export multiple student reports (admin/instructor)
 */
exports.batchExportStudents = async (req, res) => {
    try {
        const { studentIds, format = 'excel' } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of student IDs'
            });
        }

        const workbook = new ExcelJS.Workbook();

        for (const studentId of studentIds) {
            const student = await Student.findById(studentId)
                .select('firstName lastName email difficultyPreference')
                .lean();

            const progressRecords = await CourseProgress.find({ userId: studentId })
                .populate('courseID', 'courseName level')
                .lean();

            const sheet = workbook.addWorksheet(`${student.firstName} ${student.lastName}`);

            sheet.columns = [
                { header: 'Course', key: 'course', width: 30 },
                { header: 'Level', key: 'level', width: 15 },
                { header: 'Progress %', key: 'progress', width: 12 },
                { header: 'Videos', key: 'videos', width: 15 },
                { header: 'Quiz Avg', key: 'quizAvg', width: 12 },
                { header: 'Time Spent', key: 'time', width: 15 },
                { header: 'Completed', key: 'completed', width: 10 }
            ];

            progressRecords.forEach(p => {
                const totalVideos = p.courseID?.courseContent?.reduce(
                    (sum, s) => sum + (s.subSection?.length || 0), 0
                ) || 0;

                const completedVideos = p.completedVideos?.length || 0;
                const progress = totalVideos > 0 ?
                    Math.round((completedVideos / totalVideos) * 100) : 0;

                const quizAvg = p.quizAttempts?.length > 0 ?
                    p.quizAttempts.reduce((sum, q) => sum + (q.percentage || 0), 0) /
                    p.quizAttempts.length : 0;

                sheet.addRow({
                    course: p.courseID?.courseName || 'Unknown',
                    level: p.courseID?.level || 'Unknown',
                    progress,
                    videos: `${completedVideos}/${totalVideos}`,
                    quizAvg: quizAvg.toFixed(1),
                    time: ReportService.formatDuration(p.totalTimeSpent || 0),
                    completed: p.isCourseCompleted ? 'Yes' : 'No'
                });
            });

            sheet.getRow(1).font = { bold: true };
        }

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=batch-student-reports.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();

        ActivityLog.log({
            userId: req.user.id,
            userModel: req.user.role === 'admin' ? 'Admin' : 'instructors',
            userRole: req.user.role,
            action: 'report_export',
            metadata: { format: 'excel', reportType: 'batch', studentCount: studentIds.length }
        });

    } catch (error) {
        console.error('Error batch exporting student reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export batch reports',
            error: error.message
        });
    }
};

// Helper functions (reused from earlier controllers)
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

        const atRiskCount = progressRecords.filter(p => {
            if (!p.lastAccessed) return true;
            const daysInactive = (Date.now() - p.lastAccessed) / (24 * 60 * 60 * 1000);
            return daysInactive > 14;
        }).length;

        metrics.push({
            courseName: course.courseName,
            level: course.level,
            totalStudents,
            completionRate: totalStudents > 0 ?
                ((completedCount / totalStudents) * 100).toFixed(1) : 0,
            avgQuizScore: quizCount > 0 ?
                (totalQuizScore / quizCount).toFixed(1) : 0,
            avgTimeSpent: progressRecords.length > 0 ?
                ReportService.formatDuration(progressRecords.reduce((sum, p) =>
                    sum + (p.totalTimeSpent || 0), 0) / progressRecords.length) : '0s',
            atRiskStudents: atRiskCount
        });
    }

    return metrics;
}

async function analyzeRemedialImpact(instructorId) {
    const courses = await Course.find({ instructor: instructorId }).select('_id');
    const courseIds = courses.map(c => c._id);

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

    const courseMap = new Map();

    progressWithRemedial.forEach(p => {
        const courseName = p.courseID?.courseName || 'Unknown';
        const completedRemedial = p.remedialContent?.filter(r => r.completed).length || 0;
        const totalRemedial = p.remedialContent?.length || 0;

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
        courseData.totalRemedial += totalRemedial;
        courseData.completedRemedial += completedRemedial;
    });

    const effectivenessByCourse = Array.from(courseMap.values()).map(c => ({
        courseName: c.courseName,
        studentsCount: c.totalStudents,
        totalRemedial: c.totalRemedial,
        completedRemedial: c.completedRemedial,
        averageCompletionRate: c.totalRemedial > 0 ?
            ((c.completedRemedial / c.totalRemedial) * 100).toFixed(1) : 0
    }));

    return {
        totalStudentsWithRemedial: progressWithRemedial.length,
        averageCompletionRate: progressWithRemedial.reduce((sum, p) => {
            const rate = p.remedialContent?.length > 0 ?
                (p.remedialContent.filter(r => r.completed).length / p.remedialContent.length) * 100 : 0;
            return sum + rate;
        }, 0) / progressWithRemedial.length,
        effectivenessByCourse
    };
}

async function getUserAnalytics() {
    const totalStudents = await Student.countDocuments();
    const totalInstructors = await Instructor.countDocuments();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeStudents = await ActivityLog.distinct('userId', {
        userRole: 'student',
        timestamp: { $gte: thirtyDaysAgo }
    });

    const onboardedStudents = await Student.countDocuments({ onboardingComplete: true });

    return {
        totals: {
            students: totalStudents,
            instructors: totalInstructors
        },
        active: {
            students: activeStudents.length,
            percentage: totalStudents > 0 ?
                ((activeStudents.length / totalStudents) * 100).toFixed(1) : 0
        },
        onboarding: {
            completed: onboardedStudents,
            rate: totalStudents > 0 ?
                ((onboardedStudents / totalStudents) * 100).toFixed(1) : 0
        }
    };
}

async function getCourseAnalytics() {
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'Published' });

    const levelDistribution = await Course.aggregate([
        { $group: {
                _id: '$level',
                count: { $sum: 1 },
                enrollments: { $sum: { $size: '$studentsEnrolled' } }
            }}
    ]);

    const popularCourses = await Course.find()
        .sort({ studentsEnrolled: -1 })
        .limit(5)
        .populate('instructor', 'firstName lastName')
        .select('courseName level studentsEnrolled')
        .lean();

    return {
        totals: {
            total: totalCourses,
            published: publishedCourses,
            publishedRate: totalCourses > 0 ?
                ((publishedCourses / totalCourses) * 100).toFixed(1) : 0
        },
        levelDistribution: levelDistribution.map(l => ({
            level: l._id || 'Unknown',
            count: l.count,
            enrollments: l.enrollments
        })),
        popularCourses: popularCourses.map(c => ({
            name: c.courseName,
            level: c.level,
            instructor: c.instructor ?
                `${c.instructor.firstName} ${c.instructor.lastName}` : 'Unknown',
            enrollments: c.studentsEnrolled?.length || 0
        }))
    };
}

async function getEngagementAnalytics() {
    const allProgress = await CourseProgress.find().lean();

    if (allProgress.length === 0) {
        return {
            averages: {
                timeSpent: '0s',
                quizScore: '0',
                passRate: '0'
            },
            totals: {
                totalAttempts: 0,
                totalPassed: 0,
                studentsInRemedial: 0,
                remedialRate: '0'
            }
        };
    }

    const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0);
    const avgTimeSpentSeconds = totalTimeSpent / allProgress.length;

    const quizAttempts = allProgress.flatMap(p => p.quizAttempts || []);
    const totalQuizScore = quizAttempts.reduce((sum, q) => sum + (q.percentage || 0), 0);
    const avgQuizScore = quizAttempts.length > 0 ? totalQuizScore / quizAttempts.length : 0;

    const passedQuizzes = quizAttempts.filter(q => q.passed).length;
    const passRate = quizAttempts.length > 0 ? (passedQuizzes / quizAttempts.length) * 100 : 0;

    const remedialUsage = allProgress.filter(p => p.remedialContent?.length > 0).length;

    return {
        averages: {
            timeSpent: ReportService.formatDuration(avgTimeSpentSeconds),
            quizScore: avgQuizScore.toFixed(1),
            passRate: passRate.toFixed(1)
        },
        totals: {
            totalAttempts: quizAttempts.length,
            totalPassed: passedQuizzes,
            studentsInRemedial: remedialUsage,
            remedialRate: allProgress.length > 0 ?
                ((remedialUsage / allProgress.length) * 100).toFixed(1) : 0
        }
    };
}

async function getPerformanceTrends() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const completions = await CourseProgress.aggregate([
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

    const months = [];
    const completionsData = [];

    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.unshift(date.toLocaleString('default', { month: 'short' }));

        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const completion = completions.find(c =>
            c._id.month === month && c._id.year === year
        );
        completionsData.unshift(completion ? completion.count : 0);
    }

    return {
        labels: months,
        completions: completionsData
    };
}