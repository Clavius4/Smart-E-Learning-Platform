const mongoose = require('mongoose');
const CourseProgress = require('../models/courseProgress');
const Student = require('../models/StudentModels/studentModels');
const Course = require('../models/course');
const Quiz = require('../models/quiz');
const Assessment = require('../models/assessment');
const ActivityLog = require('../models/ActivityLog');
const ReportCache = require('../models/ReportCache');
const QuestionPerformance = require('../models/QuestionPerformance');

class ReportService {

    /**
     * Calculate overall statistics from progress records
     */
    static calculateOverallStats(progressRecords) {
        if (!progressRecords || progressRecords.length === 0) {
            return {
                totalCourses: 0,
                completedCourses: 0,
                inProgressCourses: 0,
                notStartedCourses: 0,
                averageQuizScore: 0,
                totalTimeSpent: 0,
                totalVideosWatched: 0,
                totalQuizzesPassed: 0
            };
        }

        let totalQuizScore = 0;
        let quizCount = 0;
        let totalVideosWatched = 0;
        let totalQuizzesPassed = 0;
        let totalTimeSpent = 0;
        let completedCourses = 0;
        let inProgressCourses = 0;
        let notStartedCourses = 0;

        progressRecords.forEach(p => {
            // Course status
            if (p.isCourseCompleted) {
                completedCourses++;
            } else if (p.completedVideos && p.completedVideos.length > 0) {
                inProgressCourses++;
            } else {
                notStartedCourses++;
            }

            // Videos
            totalVideosWatched += p.completedVideos?.length || 0;

            // Quiz attempts
            if (p.quizAttempts && p.quizAttempts.length > 0) {
                p.quizAttempts.forEach(q => {
                    totalQuizScore += q.percentage || 0;
                    quizCount++;
                    if (q.passed) totalQuizzesPassed++;
                });
            }

            // Time
            totalTimeSpent += p.totalTimeSpent || 0;
        });

        return {
            totalCourses: progressRecords.length,
            completedCourses,
            inProgressCourses,
            notStartedCourses,
            averageQuizScore: quizCount > 0 ? (totalQuizScore / quizCount).toFixed(1) : 0,
            totalTimeSpent: this.formatDuration(totalTimeSpent),
            totalTimeSpentSeconds: totalTimeSpent,
            totalVideosWatched,
            totalQuizzesPassed,
            totalQuizzesAttempted: quizCount,
            overallQuizPassRate: quizCount > 0 ?
                ((totalQuizzesPassed / quizCount) * 100).toFixed(1) : 0
        };
    }

    /**
     * Format course progress for display
     */
    static formatCourseProgress(progress) {
        const course = progress.courseID || {};

        // Calculate video completion
        const totalVideos = this.countVideosInCourse(course);
        const completedVideos = progress.completedVideos?.length || 0;
        const videoCompletion = totalVideos > 0 ?
            ((completedVideos / totalVideos) * 100).toFixed(1) : 0;

        // Calculate quiz performance
        let quizScore = 0;
        let quizCount = 0;
        let quizzesPassed = 0;

        if (progress.quizAttempts && progress.quizAttempts.length > 0) {
            progress.quizAttempts.forEach(q => {
                quizScore += q.percentage || 0;
                quizCount++;
                if (q.passed) quizzesPassed++;
            });
        }

        const averageQuizScore = quizCount > 0 ? (quizScore / quizCount).toFixed(1) : 0;

        // Get last activity
        const lastActivity = this.getLastActivity(progress);

        return {
            courseId: course._id,
            courseName: course.courseName || 'Unknown Course',
            level: course.level || 'Unknown',
            category: course.category?.name || 'Unknown',
            enrolledAt: course.createdAt,
            status: progress.completionStatus,
            isCompleted: progress.isCourseCompleted || false,
            needsRemedial: progress.needsRemedial || false,
            metrics: {
                videoCompletion: parseFloat(videoCompletion),
                completedVideos,
                totalVideos,
                averageQuizScore: parseFloat(averageQuizScore),
                quizzesPassed,
                totalQuizzes: quizCount,
                quizPassRate: quizCount > 0 ?
                    ((quizzesPassed / quizCount) * 100).toFixed(1) : 0,
                timeSpent: this.formatDuration(progress.totalTimeSpent || 0),
                timeSpentSeconds: progress.totalTimeSpent || 0
            },
            lastActivity,
            remedialContent: progress.remedialContent?.length || 0
        };
    }

    /**
     * Count total videos in a course
     */
    static countVideosInCourse(course) {
        if (!course.courseContent) return 0;

        return course.courseContent.reduce((total, section) => {
            return total + (section.subSection?.length || 0);
        }, 0);
    }

    /**
     * Get last activity from progress
     */
    static getLastActivity(progress) {
        const activities = [];

        if (progress.lastAccessed) {
            activities.push({ type: 'access', date: progress.lastAccessed });
        }

        if (progress.completedVideos && progress.completedVideos.length > 0) {
            const lastVideo = progress.completedVideos
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
            if (lastVideo) {
                activities.push({ type: 'video', date: lastVideo.completedAt });
            }
        }

        if (progress.quizAttempts && progress.quizAttempts.length > 0) {
            const lastQuiz = progress.quizAttempts
                .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))[0];
            if (lastQuiz) {
                activities.push({ type: 'quiz', date: lastQuiz.attemptedAt });
            }
        }

        if (activities.length === 0) return null;

        return activities.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }

    /**
     * Determine next milestone for student
     */
    static determineNextMilestone(student, progressRecords) {
        const currentLevel = student.difficultyPreference;
        const learningStyle = student.learningStyle;

        // Find incomplete courses at current level
        const incompleteCourses = progressRecords.filter(p =>
            !p.isCourseCompleted &&
            p.courseID?.level?.toLowerCase() === currentLevel
        );

        if (incompleteCourses.length > 0) {
            // Next course to complete
            const nextCourse = incompleteCourses.sort((a, b) => {
                const orderA = a.courseID?.order || 999;
                const orderB = b.courseID?.order || 999;
                return orderA - orderB;
            })[0];

            return {
                type: 'course',
                target: nextCourse.courseID?.courseName,
                description: `Complete ${nextCourse.courseID?.courseName}`,
                progress: this.calculateCourseProgress(nextCourse)
            };
        }

        // Check if ready for next level
        const nextLevel = this.getNextLevel(currentLevel);
        if (nextLevel) {
            return {
                type: 'level',
                target: nextLevel,
                description: `Advance to ${nextLevel} level`,
                requiresAssessment: true
            };
        }

        return {
            type: 'complete',
            target: 'graduation',
            description: 'All levels completed!'
        };
    }

    /**
     * Calculate progress percentage for a course
     */
    static calculateCourseProgress(progress) {
        const totalVideos = this.countVideosInCourse(progress.courseID);
        const completedVideos = progress.completedVideos?.length || 0;

        if (totalVideos === 0) return 100;
        return Math.round((completedVideos / totalVideos) * 100);
    }

    /**
     * Get next level name
     */
    static getNextLevel(currentLevel) {
        const levels = ['beginner', 'intermediate', 'advanced'];
        const index = levels.indexOf(currentLevel?.toLowerCase());
        return index >= 0 && index < levels.length - 1 ? levels[index + 1] : null;
    }

    /**
     * Format duration from seconds to human readable
     */
    static formatDuration(seconds) {
        if (!seconds || seconds < 60) return `${Math.round(seconds || 0)}s`;

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    }

    /**
     * Get recent activity timeline
     */
    static async getRecentActivity(studentId, days = 7) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const activities = await ActivityLog.find({
            userId: studentId,
            userRole: 'student',
            timestamp: { $gte: since }
        })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        return activities.map(a => ({
            action: a.action,
            timestamp: a.timestamp,
            description: this.formatActivityDescription(a),
            metadata: a.metadata
        }));
    }

    /**
     * Format activity for display
     */
    static formatActivityDescription(activity) {
        const actionMap = {
            'login': 'Logged in',
            'video_complete': 'Completed a video lesson',
            'video_progress': 'Watched video',
            'quiz_pass': 'Passed a quiz',
            'quiz_fail': 'Failed a quiz',
            'course_enroll': 'Enrolled in a course',
            'course_complete': 'Completed a course',
            'assessment_pass': 'Passed level assessment',
            'assessment_fail': 'Failed level assessment'
        };

        let description = actionMap[activity.action] || activity.action;

        // Add course name if available
        if (activity.metadata?.courseName) {
            description += ` in ${activity.metadata.courseName}`;
        } else if (activity.courseId) {
            description += ` (Course ID: ${activity.courseId})`;
        }

        return description;
    }

    /**
     * Identify at-risk students based on inactivity and poor performance
     */
    static async identifyAtRiskStudents(instructorId, courseId = null) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        // Build query for progress records
        const query = {};
        if (instructorId) query.instructor = instructorId;
        if (courseId) query.courseID = courseId;

        const progressRecords = await CourseProgress.find(query)
            .populate('userId', 'firstName lastName email')
            .populate('courseID', 'courseName level');

        const atRiskStudents = [];

        for (const record of progressRecords) {
            const warnings = [];
            const riskFactors = [];
            let riskScore = 0;

            // Check inactivity
            if (!record.lastAccessed || record.lastAccessed < fourteenDaysAgo) {
                const daysInactive = record.lastAccessed ?
                    Math.floor((Date.now() - record.lastAccessed) / (24 * 60 * 60 * 1000)) : 30;
                warnings.push(`No activity for ${daysInactive} days`);
                riskFactors.push('inactivity');
                riskScore += daysInactive > 30 ? 3 : 2;
            }

            // Check quiz performance
            if (record.quizAttempts && record.quizAttempts.length > 0) {
                const recentQuizzes = record.quizAttempts
                    .filter(q => new Date(q.attemptedAt) > thirtyDaysAgo);

                if (recentQuizzes.length > 0) {
                    const passRate = recentQuizzes.filter(q => q.passed).length / recentQuizzes.length;
                    if (passRate < 0.5) {
                        warnings.push('Failed more than 50% of recent quizzes');
                        riskFactors.push('poor_performance');
                        riskScore += 3;
                    } else if (passRate < 0.7) {
                        warnings.push('Struggling with quizzes');
                        riskFactors.push('struggling');
                        riskScore += 1;
                    }
                }
            }

            // Check if in remedial mode
            if (record.needsRemedial) {
                warnings.push('Currently in remedial mode');
                riskFactors.push('remedial');
                riskScore += 2;

                // Check if remedial content is being completed
                if (record.remedialContent && record.remedialContent.length > 0) {
                    const completedRemedial = record.remedialContent.filter(r => r.completed).length;
                    if (completedRemedial === 0) {
                        warnings.push('Not completing assigned remedial content');
                        riskFactors.push('remedial_incomplete');
                        riskScore += 2;
                    }
                }
            }

            if (warnings.length > 0) {
                atRiskStudents.push({
                    student: {
                        id: record.userId?._id,
                        name: record.userId ?
                            `${record.userId.firstName} ${record.userId.lastName}` : 'Unknown',
                        email: record.userId?.email
                    },
                    course: {
                        id: record.courseID?._id,
                        name: record.courseID?.courseName
                    },
                    warnings,
                    riskFactors,
                    riskScore,
                    riskLevel: riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low',
                    lastAccessed: record.lastAccessed,
                    progress: this.calculateCourseProgress(record),
                    recommendedAction: this.generateRecommendation(riskFactors, record)
                });
            }
        }

        // Sort by risk score (highest first)
        return atRiskStudents.sort((a, b) => b.riskScore - a.riskScore);
    }

    /**
     * Generate recommendation based on risk factors
     */
    static generateRecommendation(riskFactors, record) {
        if (riskFactors.includes('inactivity')) {
            return 'Send reminder email and check if student needs technical support';
        }
        if (riskFactors.includes('poor_performance')) {
            return 'Schedule one-on-one review session';
        }
        if (riskFactors.includes('remedial') && riskFactors.includes('remedial_incomplete')) {
            return 'Check if remedial content is appropriate and provide additional guidance';
        }
        if (riskFactors.includes('struggling')) {
            return 'Assign additional practice exercises';
        }
        return 'Monitor progress closely';
    }

    /**
     * Generate class statistics for comparative analytics
     */
    static calculateClassStats(progressRecords) {
        if (!progressRecords || progressRecords.length === 0) {
            return {
                studentCount: 0,
                averageQuizScore: 0,
                averageCompletion: 0,
                averageTimeSpent: 0,
                passRate: 0,
                distribution: {
                    excellent: 0,
                    good: 0,
                    average: 0,
                    struggling: 0
                }
            };
        }

        let totalQuizScore = 0;
        let quizCount = 0;
        let totalCompletion = 0;
        let totalTimeSpent = 0;
        let totalPassed = 0;

        const distribution = {
            excellent: 0, // >= 90%
            good: 0,      // 75-89%
            average: 0,    // 60-74%
            struggling: 0  // < 60%
        };

        progressRecords.forEach(p => {
            // Quiz scores
            if (p.quizAttempts && p.quizAttempts.length > 0) {
                const studentAvg = p.quizAttempts.reduce((sum, q) => sum + (q.percentage || 0), 0) /
                    p.quizAttempts.length;
                totalQuizScore += studentAvg;
                quizCount++;

                // Distribution
                if (studentAvg >= 90) distribution.excellent++;
                else if (studentAvg >= 75) distribution.good++;
                else if (studentAvg >= 60) distribution.average++;
                else distribution.struggling++;

                // Pass rate
                const passedQuizzes = p.quizAttempts.filter(q => q.passed).length;
                totalPassed += (passedQuizzes / p.quizAttempts.length) * 100;
            }

            // Completion
            const completion = this.calculateCourseProgress(p);
            totalCompletion += completion;

            // Time
            totalTimeSpent += p.totalTimeSpent || 0;
        });

        return {
            studentCount: progressRecords.length,
            averageQuizScore: quizCount > 0 ? (totalQuizScore / quizCount).toFixed(1) : 0,
            averageCompletion: (totalCompletion / progressRecords.length).toFixed(1),
            averageTimeSpent: this.formatDuration(totalTimeSpent / progressRecords.length),
            averageTimeSpentSeconds: totalTimeSpent / progressRecords.length,
            passRate: (totalPassed / progressRecords.length).toFixed(1),
            distribution
        };
    }

    /**
     * Calculate percentile rank
     */
    static calculatePercentile(record, allRecords, metric) {
        if (!record || !allRecords || allRecords.length === 0) return 50;

        let value;
        if (metric === 'quiz') {
            value = this.averageQuizScore(record);
        } else if (metric === 'time') {
            value = record.totalTimeSpent || 0;
        } else {
            value = this.calculateCourseProgress(record);
        }

        const values = allRecords.map(r => {
            if (metric === 'quiz') return this.averageQuizScore(r);
            if (metric === 'time') return r.totalTimeSpent || 0;
            return this.calculateCourseProgress(r);
        });

        values.sort((a, b) => a - b);
        const index = values.findIndex(v => v >= value);
        return Math.round((index / values.length) * 100);
    }

    /**
     * Calculate average quiz score for a student
     */
    static averageQuizScore(progress) {
        if (!progress.quizAttempts || progress.quizAttempts.length === 0) return 0;
        const sum = progress.quizAttempts.reduce((acc, q) => acc + (q.percentage || 0), 0);
        return sum / progress.quizAttempts.length;
    }

    /**
     * Calculate rank
     */
    static calculateRank(record, allRecords, metric) {
        if (!record || !allRecords || allRecords.length === 0) return 0;

        let value;
        if (metric === 'quiz') {
            value = this.averageQuizScore(record);
        } else {
            value = this.calculateCourseProgress(record);
        }

        const betterThan = allRecords.filter(r => {
            const compare = metric === 'quiz' ?
                this.averageQuizScore(r) : this.calculateCourseProgress(r);
            return compare < value;
        }).length;

        return betterThan + 1;
    }

    /**
     * Generate distribution graph data
     */
    static createDistributionGraph(progressRecords, metric = 'quiz') {
        const bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        const distribution = bins.map(bin => ({
            range: `${bin}-${bin + 10}`,
            count: 0,
            percentage: 0
        }));

        progressRecords.forEach(r => {
            let value;
            if (metric === 'quiz') {
                value = this.averageQuizScore(r);
            } else {
                value = this.calculateCourseProgress(r);
            }

            const binIndex = Math.min(Math.floor(value / 10), 9);
            if (binIndex >= 0 && binIndex < distribution.length) {
                distribution[binIndex].count++;
            }
        });

        const total = progressRecords.length;
        distribution.forEach(bin => {
            bin.percentage = total > 0 ? (bin.count / total * 100).toFixed(1) : 0;
        });

        return distribution;
    }
}

module.exports = ReportService;