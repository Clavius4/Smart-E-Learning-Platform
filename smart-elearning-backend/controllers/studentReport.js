const Student = require('../models/StudentModels/studentModels');
const CourseProgress = require('../models/courseProgress');
const { assessmentCategoryOfStyle } = require('../utils/levelAccess');
const ReportService = require('../services/reportService');
const ReportCache = require('../models/ReportCache');
const ActivityLog = require('../models/ActivityLog');

/**
 * GET /api/report/student/my-progress
 * Get comprehensive progress report for the logged-in student
 */
exports.getMyProgressReport = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Generate cache key
        const cacheKey = ReportCache.generateKey('student-progress', studentId);

        const { data, fromCache } = await ReportCache.getOrSet(
            cacheKey,
            300, // 5 minutes TTL
            async () => {
                // Fetch student with enrolled courses
                const student = await Student.findById(studentId)
                    .populate({
                        path: 'courses',
                        populate: {
                            path: 'category',
                            select: 'name'
                        }
                    })
                    .lean();

                if (!student) {
                    throw new Error('Student not found');
                }

                // Fetch all progress records
                const progressRecords = await CourseProgress.find({
                    userId: studentId
                })
                    .populate({
                        path: 'courseID',
                        populate: { path: 'category' }
                    })
                    .lean();

                // Format course progress
                const courseProgress = progressRecords.map(p =>
                    ReportService.formatCourseProgress(p)
                );

                // Get recent activity
                const recentActivity = await ReportService.getRecentActivity(studentId, 30);

                // Determine next milestone
                const nextMilestone = ReportService.determineNextMilestone(student, progressRecords);

                // Calculate overall stats
                const overallStats = ReportService.calculateOverallStats(progressRecords);

                // Get badge details with icons
                const badges = (student.badges || []).map(b => ({
                    ...b,
                    icon: this.getBadgeIcon(b.type, b.name),
                    earnedAtFormatted: new Date(b.earnedAt).toLocaleDateString()
                }));

                // Generate performance trend (last 30 days)
                const performanceTrend = await this.getPerformanceTrend(studentId, 30);

                // Get level progress
                const levelProgress = await this.getLevelProgress(student, progressRecords);

                return {
                    student: {
                        id: student._id,
                        name: `${student.firstName} ${student.lastName}`,
                        email: student.email,
                        level: student.difficultyPreference || 'beginner',
                        learningStyle: student.learningStyle,
                        signLanguage: student.signLanguage,
                        avatar: student.avatar,
                        onboardingComplete: student.onboardingComplete,
                        stars: student.stars || 0,
                        badges,
                        levelStatus: student.levelStatus || {}
                    },
                    overallStats,
                    courseProgress,
                    recentActivity,
                    nextMilestone,
                    performanceTrend,
                    levelProgress,
                    reportGeneratedAt: new Date().toISOString()
                };
            }
        );

        // Log report view
        ActivityLog.log({
            userId: studentId,
            userModel: 'students',
            userRole: 'student',
            action: 'report_view',
            metadata: {
                reportType: 'my-progress',
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
        console.error('Error generating student progress report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate progress report',
            error: error.message
        });
    }
};

/**
 * Get icon for badge based on type
 */
getBadgeIcon = (type, name) => {
    const iconMap = {
        'course_completion': '📚',
        'level_completion': '🏆',
        'perfect_score': '💯',
        'streak': '🔥',
        'beginner master': '🥉',
        'intermediate master': '🥈',
        'advanced master': '🥇'
    };

    // Try to match by type first
    if (iconMap[type]) return iconMap[type];

    // Then try by name
    const lowerName = name?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerName.includes(key)) return icon;
    }

    return '🎖️';
};

/**
 * Get performance trend over time
 */
exports.getPerformanceTrend = async (studentId, days = 30) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get quiz attempts in date range
    const progressRecords = await CourseProgress.find({
        userId: studentId
    }).lean();

    // Collect all quiz attempts with dates
    const allAttempts = [];
    progressRecords.forEach(p => {
        if (p.quizAttempts && p.quizAttempts.length > 0) {
            p.quizAttempts.forEach(q => {
                if (new Date(q.attemptedAt) > since) {
                    allAttempts.push({
                        date: q.attemptedAt,
                        score: q.percentage || 0,
                        passed: q.passed,
                        courseId: p.courseID
                    });
                }
            });
        }
    });

    // Sort by date
    allAttempts.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by week
    const weeklyData = [];
    const weeklyMap = new Map();

    allAttempts.forEach(attempt => {
        const date = new Date(attempt.date);
        const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

        if (!weeklyMap.has(weekKey)) {
            weeklyMap.set(weekKey, {
                week: weekKey,
                attempts: [],
                totalScore: 0,
                passedCount: 0
            });
        }

        const week = weeklyMap.get(weekKey);
        week.attempts.push(attempt);
        week.totalScore += attempt.score;
        if (attempt.passed) week.passedCount++;
    });

    weeklyMap.forEach((value, key) => {
        weeklyData.push({
            week: key,
            averageScore: (value.totalScore / value.attempts.length).toFixed(1),
            passRate: ((value.passedCount / value.attempts.length) * 100).toFixed(1),
            attemptCount: value.attempts.length
        });
    });

    return weeklyData;
};

/**
 * Get level progress
 */
exports.getLevelProgress = async (student, progressRecords) => {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const levelProgress = [];

    // Read completion flags for the student's CURRENT category (Kusoma/Kuhesabu).
    const cat = assessmentCategoryOfStyle(student.learningStyle);
    const ls = student.levelStatus?.[cat] || {};

    for (const level of levels) {
        // Find all courses at this level that the student is enrolled in
        const levelCourses = progressRecords.filter(p =>
            p.courseID?.level?.toLowerCase() === level
        );

        const totalCourses = levelCourses.length;
        const completedCourses = levelCourses.filter(p => p.isCourseCompleted).length;

        // Check if level is unlocked (within this category)
        let unlocked = false;
        if (level === 'beginner') {
            unlocked = true;
        } else if (level === 'intermediate') {
            unlocked = ls.beginner || false;
        } else if (level === 'advanced') {
            unlocked = ls.intermediate || false;
        }

        // Check if level is completed (within this category)
        const completed = ls[level] || false;

        levelProgress.push({
            level,
            displayName: level.charAt(0).toUpperCase() + level.slice(1),
            totalCourses,
            completedCourses,
            progress: totalCourses > 0 ?
                Math.round((completedCourses / totalCourses) * 100) : 0,
            unlocked,
            completed,
            requiresAssessment: level !== 'beginner' && !unlocked &&
                student.desiredLevel === level
        });
    }

    return levelProgress;
};

/**
 * GET /api/report/student/badges
 * Get all badges earned by student
 */
exports.getStudentBadges = async (req, res) => {
    try {
        const studentId = req.user.id;

        const student = await Student.findById(studentId)
            .select('badges stars firstName lastName')
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const badges = (student.badges || []).map(b => ({
            ...b,
            icon: getBadgeIcon(b.type, b.name),
            earnedAtFormatted: new Date(b.earnedAt).toLocaleDateString()
        }));

        res.json({
            success: true,
            data: {
                stars: student.stars || 0,
                badges,
                totalBadges: badges.length
            }
        });

    } catch (error) {
        console.error('Error fetching student badges:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch badges',
            error: error.message
        });
    }
};

/**
 * GET /api/report/student/course/:courseId
 * Get detailed progress for a specific course
 */
exports.getCourseProgressDetail = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { courseId } = req.params;

        const progress = await CourseProgress.findOne({
            userId: studentId,
            courseID: courseId
        })
            .populate({
                path: 'courseID',
                populate: {
                    path: 'courseContent',
                    populate: { path: 'subSection' }
                }
            })
            .lean();

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'No progress found for this course'
            });
        }

        const course = progress.courseID;
        const sections = [];
        let totalVideos = 0;
        let completedVideos = 0;

        // Build section-wise progress
        course.courseContent?.forEach(section => {
            const sectionVideos = section.subSection || [];
            const sectionCompleted = sectionVideos.filter(v =>
                progress.completedVideos?.some(cv =>
                    cv.subsectionId?.toString() === v._id.toString()
                )
            ).length;

            totalVideos += sectionVideos.length;
            completedVideos += sectionCompleted;

            sections.push({
                sectionId: section._id,
                sectionName: section.sectionName || `Section ${section._id}`,
                totalVideos: sectionVideos.length,
                completedVideos: sectionCompleted,
                progress: sectionVideos.length > 0 ?
                    Math.round((sectionCompleted / sectionVideos.length) * 100) : 100,
                videos: sectionVideos.map(v => ({
                    videoId: v._id,
                    title: v.title,
                    duration: v.timeDuration,
                    completed: progress.completedVideos?.some(cv =>
                        cv.subsectionId?.toString() === v._id.toString()
                    ),
                    completedAt: progress.completedVideos?.find(cv =>
                        cv.subsectionId?.toString() === v._id.toString()
                    )?.completedAt,
                    isRemedial: v.isRemedial || false
                }))
            });
        });

        // Get quiz performance
        const quizPerformance = (progress.quizAttempts || []).map(q => ({
            quizId: q.quizId,
            attemptedAt: q.attemptedAt,
            score: q.percentage,
            passed: q.passed,
            level: q.level
        }));

        res.json({
            success: true,
            data: {
                courseName: course.courseName,
                level: course.level,
                overallProgress: totalVideos > 0 ?
                    Math.round((completedVideos / totalVideos) * 100) : 0,
                completedVideos,
                totalVideos,
                sections,
                quizPerformance,
                timeSpent: ReportService.formatDuration(progress.totalTimeSpent || 0),
                lastAccessed: progress.lastAccessed,
                needsRemedial: progress.needsRemedial || false,
                remedialContent: progress.remedialContent?.length || 0,
                isCompleted: progress.isCourseCompleted || false
            }
        });

    } catch (error) {
        console.error('Error fetching course progress detail:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course progress',
            error: error.message
        });
    }
};