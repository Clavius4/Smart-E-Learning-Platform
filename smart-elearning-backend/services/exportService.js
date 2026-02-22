const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const ChartJSImage = require('chart.js-image');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ExportService {

    /**
     * Generate PDF report with charts
     */
    static async generatePDF(reportData, reportType, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 50,
                    size: 'A4',
                    info: {
                        Title: `${reportType} Report`,
                        Author: 'Smart Learning Platform',
                        Subject: 'Student Progress Report',
                        Keywords: 'education, learning, progress',
                        CreationDate: new Date()
                    }
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Add header
                this.addPDFHeader(doc, reportType, options);

                // Add content based on report type
                switch(reportType) {
                    case 'student-progress':
                        this.addStudentProgressPDF(doc, reportData);
                        break;
                    case 'instructor-dashboard':
                        this.addInstructorDashboardPDF(doc, reportData);
                        break;
                    case 'platform-overview':
                        this.addPlatformOverviewPDF(doc, reportData);
                        break;
                    default:
                        this.addGenericPDF(doc, reportData);
                }

                // Add footer
                this.addPDFFooter(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generate Excel report with multiple sheets
     */
    static async generateExcel(reportData, reportType) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Smart Learning Platform';
        workbook.created = new Date();
        workbook.modified = new Date();

        switch(reportType) {
            case 'student-progress':
                await this.addStudentProgressExcel(workbook, reportData);
                break;
            case 'instructor-dashboard':
                await this.addInstructorDashboardExcel(workbook, reportData);
                break;
            case 'platform-overview':
                await this.addPlatformOverviewExcel(workbook, reportData);
                break;
            case 'comparative-analytics':
                await this.addComparativeAnalyticsExcel(workbook, reportData);
                break;
            default:
                await this.addGenericExcel(workbook, reportData);
        }

        return workbook;
    }

    /**
     * Generate CSV from data
     */
    static generateCSV(data, headers) {
        const rows = [];

        // Add headers
        rows.push(headers.join(','));

        // Add data rows
        data.forEach(item => {
            const row = headers.map(h => {
                const value = this.getNestedValue(item, h);
                return this.formatCSVValue(value);
            });
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    // ==================== PDF Helpers ====================

    static addPDFHeader(doc, reportType, options) {
        // Add logo (if available)
        // doc.image('path/to/logo.png', 50, 45, { width: 50 });

        doc.fontSize(20)
            .font('Times-Bold')
            .fillColor('#1f3b87')
            .text(this.getReportTitle(reportType), { align: 'center' });

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font('Times-Roman')
            .fillColor('#666')
            .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

        if (options.studentName) {
            doc.text(`Student: ${options.studentName}`, { align: 'center' });
        }

        if (options.instructorName) {
            doc.text(`Instructor: ${options.instructorName}`, { align: 'center' });
        }

        doc.moveDown(2);

        // Add separator line
        doc.strokeColor('#ccc')
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke();

        doc.moveDown(2);
    }

    static addPDFFooter(doc) {
        const bottom = 750;

        doc.fontSize(10)
            .font('Times-Italic')
            .fillColor('#999')
            .text(
                'Smart Learning Platform - Empowering Education for All',
                50,
                bottom,
                { align: 'center', width: 500 }
            );

        doc.text(
            `Page ${doc.page}`,
            50,
            bottom + 15,
            { align: 'center', width: 500 }
        );
    }

    static getReportTitle(reportType) {
        const titles = {
            'student-progress': 'Student Progress Report',
            'instructor-dashboard': 'Instructor Dashboard Report',
            'platform-overview': 'Platform Overview Report',
            'comparative-analytics': 'Comparative Analytics Report',
            'remedial-effectiveness': 'Remedial Effectiveness Report'
        };
        return titles[reportType] || 'Smart Learning Report';
    }

    // ==================== Student Progress PDF ====================

    static addStudentProgressPDF(doc, data) {
        const { student, overallStats, courseProgress, badges } = data;

        // Student Info Section
        doc.fontSize(14)
            .font('Times-Bold')
            .fillColor('#000')
            .text('Student Information', { underline: true });

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font('Times-Roman')
            .fillColor('#333');

        doc.text(`Name: ${student.name}`);
        doc.text(`Level: ${student.level}`);
        doc.text(`Learning Style: ${student.learningStyle}`);
        doc.text(`Sign Language: ${student.signLanguage || 'Not specified'}`);
        doc.text(`Stars: ${student.stars} ⭐`);

        doc.moveDown(1);

        // Overall Stats Section
        doc.fontSize(14)
            .font('Times-Bold')
            .fillColor('#000')
            .text('Overall Statistics', { underline: true });

        doc.moveDown(0.5);

        // Create stats boxes
        const stats = [
            { label: 'Courses', value: overallStats.totalCourses },
            { label: 'Completed', value: overallStats.completedCourses },
            { label: 'In Progress', value: overallStats.inProgressCourses },
            { label: 'Quiz Avg', value: `${overallStats.averageQuizScore}%` },
            { label: 'Time Spent', value: overallStats.totalTimeSpent },
            { label: 'Videos', value: overallStats.totalVideosWatched }
        ];

        let x = 50;
        let y = doc.y;

        stats.forEach((stat, index) => {
            // Box
            doc.rect(x, y, 80, 60).stroke();

            // Label
            doc.fontSize(9)
                .font('Times-Roman')
                .fillColor('#666')
                .text(stat.label, x + 5, y + 5, { width: 70, align: 'center' });

            // Value
            doc.fontSize(14)
                .font('Times-Bold')
                .fillColor('#1f3b87')
                .text(stat.value.toString(), x + 5, y + 25, { width: 70, align: 'center' });

            x += 90;
            if ((index + 1) % 3 === 0) {
                x = 50;
                y += 80;
                doc.y = y + 60;
            }
        });

        doc.y = y + 80;
        doc.moveDown(2);

        // Badges Section
        if (badges && badges.length > 0) {
            doc.fontSize(14)
                .font('Times-Bold')
                .fillColor('#000')
                .text('Badges Earned', { underline: true });

            doc.moveDown(0.5);

            badges.slice(0, 10).forEach(badge => {
                doc.fontSize(12)
                    .font('Times-Roman')
                    .fillColor('#333')
                    .text(`${badge.icon} ${badge.name} - ${badge.description || ''} (${badge.earnedAtFormatted})`);
            });

            doc.moveDown(1);
        }

        // Course Progress Section
        doc.fontSize(14)
            .font('Times-Bold')
            .fillColor('#000')
            .text('Course Progress', { underline: true });

        doc.moveDown(1);

        courseProgress.forEach((course, index) => {
            if (doc.y > 700) {
                doc.addPage();
            }

            doc.fontSize(12)
                .font('Times-Bold')
                .fillColor('#000')
                .text(`${index + 1}. ${course.courseName} (${course.level})`);

            doc.fontSize(10)
                .font('Times-Roman')
                .fillColor('#333');

            doc.text(`Status: ${course.status}`);
            doc.text(`Progress: ${course.metrics.videoCompletion}% (${course.metrics.completedVideos}/${course.metrics.totalVideos} videos)`);
            doc.text(`Quiz Avg: ${course.metrics.averageQuizScore}% - Pass Rate: ${course.metrics.quizPassRate}%`);
            doc.text(`Time Spent: ${course.metrics.timeSpent}`);

            if (course.lastActivity) {
                doc.text(`Last Activity: ${new Date(course.lastActivity.date).toLocaleDateString()}`);
            }

            doc.moveDown(0.5);

            // Add progress bar
            const barX = 70;
            const barY = doc.y - 10;
            const barWidth = 200;
            const barHeight = 10;
            const fillWidth = (course.metrics.videoCompletion / 100) * barWidth;

            doc.rect(barX, barY, barWidth, barHeight).stroke('#ccc');
            doc.rect(barX, barY, fillWidth, barHeight).fill(this.getProgressColor(course.metrics.videoCompletion));

            doc.moveDown(1.5);
        });

        // Next Milestone
        if (data.nextMilestone) {
            doc.moveDown(1);
            doc.fontSize(14)
                .font('Times-Bold')
                .fillColor('#000')
                .text('Next Milestone', { underline: true });

            doc.moveDown(0.5);

            doc.fontSize(12)
                .font('Times-Roman')
                .fillColor('#333')
                .text(`${data.nextMilestone.description}`);

            if (data.nextMilestone.type === 'course' && data.nextMilestone.progress) {
                doc.text(`Current Progress: ${data.nextMilestone.progress}%`);
            }
        }
    }

    static getProgressColor(percentage) {
        if (percentage >= 80) return '#4caf50'; // Green
        if (percentage >= 50) return '#ff9800'; // Orange
        return '#f44336'; // Red
    }

    // ==================== Instructor Dashboard PDF ====================

    static addInstructorDashboardPDF(doc, data) {
        const { basicMetrics, atRiskStudents, remedialEffectiveness } = data;

        // Summary Stats
        doc.fontSize(14)
            .font('Times-Bold')
            .fillColor('#000')
            .text('Course Summary', { underline: true });

        doc.moveDown(0.5);

        // Create table
        const tableTop = doc.y;
        const tableHeaders = ['Course', 'Students', 'Completion', 'Quiz Avg', 'At Risk'];
        const columnWidths = [150, 70, 80, 70, 70];

        // Draw headers
        let x = 50;
        doc.fontSize(10).font('Times-Bold');
        tableHeaders.forEach((header, i) => {
            doc.text(header, x, tableTop, { width: columnWidths[i], align: 'center' });
            x += columnWidths[i];
        });

        doc.moveDown(1);
        let y = doc.y;

        // Draw rows
        basicMetrics.forEach((course, index) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            x = 50;
            doc.fontSize(9).font('Times-Roman');

            doc.text(course.courseName, x, y, { width: columnWidths[0] - 5 });
            x += columnWidths[0];

            doc.text(course.totalStudents.toString(), x, y, { width: columnWidths[1], align: 'center' });
            x += columnWidths[1];

            doc.text(`${course.completionRate}%`, x, y, { width: columnWidths[2], align: 'center' });
            x += columnWidths[2];

            doc.text(`${course.avgQuizScore}%`, x, y, { width: columnWidths[3], align: 'center' });
            x += columnWidths[3];

            doc.text(course.atRiskStudents.toString(), x, y, { width: columnWidths[4], align: 'center' });

            y += 20;
            doc.y = y;
        });

        doc.moveDown(2);

        // At-Risk Students
        if (atRiskStudents && atRiskStudents.length > 0) {
            doc.fontSize(14)
                .font('Times-Bold')
                .fillColor('#000')
                .text('At-Risk Students', { underline: true });

            doc.moveDown(0.5);

            atRiskStudents.slice(0, 10).forEach(student => {
                if (doc.y > 700) doc.addPage();

                doc.fontSize(11)
                    .font('Times-Bold')
                    .fillColor(this.getRiskColor(student.riskLevel))
                    .text(`${student.student.name} - ${student.riskLevel.toUpperCase()} RISK`);

                doc.fontSize(10)
                    .font('Times-Roman')
                    .fillColor('#333');

                student.warnings.forEach(warning => {
                    doc.text(`  • ${warning}`, { indent: 20 });
                });

                doc.text(`  Recommended: ${student.recommendedAction}`, { indent: 20 });
                doc.moveDown(0.5);
            });
        }

        // Remedial Effectiveness
        if (remedialEffectiveness) {
            doc.addPage();

            doc.fontSize(14)
                .font('Times-Bold')
                .fillColor('#000')
                .text('Remedial Effectiveness', { underline: true });

            doc.moveDown(1);

            doc.fontSize(12)
                .font('Times-Roman')
                .fillColor('#333');

            doc.text(`Students in Remedial: ${remedialEffectiveness.totalStudentsWithRemedial}`);
            doc.text(`Average Completion Rate: ${remedialEffectiveness.averageCompletionRate.toFixed(1)}%`);
            doc.text(`Improvement Rate: ${remedialEffectiveness.improvementRate}%`);

            doc.moveDown(1);

            if (remedialEffectiveness.effectivenessByCourse) {
                doc.fontSize(12).font('Times-Bold').text('By Course:');
                doc.moveDown(0.5);

                remedialEffectiveness.effectivenessByCourse.forEach(course => {
                    doc.fontSize(10).font('Times-Roman').text(
                        `${course.courseName}: ${course.averageCompletionRate}% completion (${course.completedRemedial}/${course.totalRemedial} remedials)`
                    );
                });
            }
        }
    }

    static getRiskColor(riskLevel) {
        switch(riskLevel) {
            case 'high': return '#f44336'; // Red
            case 'medium': return '#ff9800'; // Orange
            case 'low': return '#ffc107'; // Yellow
            default: return '#333';
        }
    }

    // ==================== Platform Overview PDF ====================

    static addPlatformOverviewPDF(doc, data) {
        const { userMetrics, courseMetrics, engagementMetrics, trends } = data;

        // User Metrics
        doc.fontSize(14)
            .font('Times-Bold')
            .fillColor('#000')
            .text('User Overview', { underline: true });

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font('Times-Roman')
            .fillColor('#333');

        doc.text(`Total Students: ${userMetrics.totals.students}`);
        doc.text(`Total Instructors: ${userMetrics.totals.instructors}`);
        doc.text(`Active Students (30d): ${userMetrics.active.students} (${userMetrics.active.percentage}%)`);
        doc.text(`Onboarding Rate: ${userMetrics.onboarding.rate}%`);

        doc.moveDown(1);

        // Course Metrics
        doc.fontSize(14)
            .font('Times-Bold')
            .fillColor('#000')
            .text('Course Overview', { underline: true });

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font('Times-Roman')
            .fillColor('#333');

        doc.text(`Total Courses: ${courseMetrics.totals.total}`);
        doc.text(`Published: ${courseMetrics.totals.published} (${courseMetrics.totals.publishedRate}%)`);

        doc.moveDown(0.5);

        doc.fontSize(12).font('Times-Bold').text('Distribution by Level:');
        courseMetrics.levelDistribution.forEach(level => {
            doc.fontSize(10).font('Times-Roman').text(
                `  ${level.level}: ${level.count} courses, ${level.enrollments} enrollments`
            );
        });

        doc.moveDown(1);

        // Engagement Metrics
        doc.fontSize(14)
            .font('Times-Bold')
            .fillColor('#000')
            .text('Engagement Overview', { underline: true });

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font('Times-Roman')
            .fillColor('#333');

        doc.text(`Average Time Spent: ${engagementMetrics.averages.timeSpent}`);
        doc.text(`Average Quiz Score: ${engagementMetrics.averages.quizScore}%`);
        doc.text(`Overall Pass Rate: ${engagementMetrics.averages.passRate}%`);
        doc.text(`Students in Remedial: ${engagementMetrics.totals.studentsInRemedial} (${engagementMetrics.totals.remedialRate}%)`);

        doc.moveDown(1);

        // Popular Courses
        if (courseMetrics.popularCourses && courseMetrics.popularCourses.length > 0) {
            doc.fontSize(14)
                .font('Times-Bold')
                .fillColor('#000')
                .text('Popular Courses', { underline: true });

            doc.moveDown(0.5);

            courseMetrics.popularCourses.slice(0, 5).forEach((course, index) => {
                doc.fontSize(11)
                    .font('Times-Roman')
                    .fillColor('#333')
                    .text(`${index + 1}. ${course.name} - ${course.enrollments} enrollments (Instructor: ${course.instructor})`);
            });
        }
    }

    // ==================== Excel Generators ====================

    static async addStudentProgressExcel(workbook, data) {
        const { student, overallStats, courseProgress, badges, recentActivity } = data;

        // Summary Sheet
        const summarySheet = workbook.addWorksheet('Summary');

        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        summarySheet.addRow({ metric: 'Student Name', value: student.name });
        summarySheet.addRow({ metric: 'Current Level', value: student.level });
        summarySheet.addRow({ metric: 'Learning Style', value: student.learningStyle });
        summarySheet.addRow({ metric: 'Total Stars', value: student.stars });
        summarySheet.addRow({ metric: 'Total Courses', value: overallStats.totalCourses });
        summarySheet.addRow({ metric: 'Completed Courses', value: overallStats.completedCourses });
        summarySheet.addRow({ metric: 'In Progress Courses', value: overallStats.inProgressCourses });
        summarySheet.addRow({ metric: 'Average Quiz Score', value: `${overallStats.averageQuizScore}%` });
        summarySheet.addRow({ metric: 'Total Time Spent', value: overallStats.totalTimeSpent });
        summarySheet.addRow({ metric: 'Videos Watched', value: overallStats.totalVideosWatched });
        summarySheet.addRow({ metric: 'Quizzes Passed', value: overallStats.totalQuizzesPassed });
        summarySheet.addRow({ metric: 'Quiz Pass Rate', value: `${overallStats.overallQuizPassRate}%` });

        // Style header
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Courses Sheet
        const coursesSheet = workbook.addWorksheet('Courses');

        coursesSheet.columns = [
            { header: 'Course Name', key: 'name', width: 30 },
            { header: 'Level', key: 'level', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Progress %', key: 'progress', width: 12 },
            { header: 'Videos Completed', key: 'videos', width: 15 },
            { header: 'Quiz Avg', key: 'quizAvg', width: 12 },
            { header: 'Quiz Pass Rate', key: 'passRate', width: 12 },
            { header: 'Time Spent', key: 'timeSpent', width: 15 },
            { header: 'Last Activity', key: 'lastActivity', width: 20 }
        ];

        courseProgress.forEach(course => {
            coursesSheet.addRow({
                name: course.courseName,
                level: course.level,
                status: course.status,
                progress: course.metrics.videoCompletion,
                videos: `${course.metrics.completedVideos}/${course.metrics.totalVideos}`,
                quizAvg: course.metrics.averageQuizScore,
                passRate: course.metrics.quizPassRate,
                timeSpent: course.metrics.timeSpent,
                lastActivity: course.lastActivity ?
                    new Date(course.lastActivity.date).toLocaleDateString() : 'N/A'
            });
        });

        coursesSheet.getRow(1).font = { bold: true };
        coursesSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Color code progress
        coursesSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const progress = row.getCell(4).value;
                if (progress >= 80) {
                    row.getCell(4).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFCCFFCC' } // Light green
                    };
                } else if (progress >= 50) {
                    row.getCell(4).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFCC' } // Light yellow
                    };
                } else {
                    row.getCell(4).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFCCCC' } // Light red
                    };
                }
            }
        });

        // Badges Sheet
        if (badges && badges.length > 0) {
            const badgesSheet = workbook.addWorksheet('Badges');

            badgesSheet.columns = [
                { header: 'Badge', key: 'name', width: 30 },
                { header: 'Description', key: 'description', width: 40 },
                { header: 'Earned Date', key: 'date', width: 20 },
                { header: 'Type', key: 'type', width: 20 }
            ];

            badges.forEach(badge => {
                badgesSheet.addRow({
                    name: `${badge.icon} ${badge.name}`,
                    description: badge.description || '',
                    date: new Date(badge.earnedAt).toLocaleDateString(),
                    type: badge.type || ''
                });
            });

            badgesSheet.getRow(1).font = { bold: true };
            badgesSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        }

        // Activity Sheet
        if (recentActivity && recentActivity.length > 0) {
            const activitySheet = workbook.addWorksheet('Recent Activity');

            activitySheet.columns = [
                { header: 'Date', key: 'date', width: 25 },
                { header: 'Activity', key: 'activity', width: 40 },
                { header: 'Details', key: 'details', width: 30 }
            ];

            recentActivity.forEach(activity => {
                activitySheet.addRow({
                    date: new Date(activity.timestamp).toLocaleString(),
                    activity: activity.description,
                    details: JSON.stringify(activity.metadata || {})
                });
            });

            activitySheet.getRow(1).font = { bold: true };
            activitySheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        }
    }

    static async addInstructorDashboardExcel(workbook, data) {
        const { basicMetrics, atRiskStudents, remedialEffectiveness } = data;

        // Course Summary Sheet
        const summarySheet = workbook.addWorksheet('Course Summary');

        summarySheet.columns = [
            { header: 'Course', key: 'course', width: 30 },
            { header: 'Level', key: 'level', width: 15 },
            { header: 'Students', key: 'students', width: 10 },
            { header: 'Completion %', key: 'completion', width: 12 },
            { header: 'Quiz Avg', key: 'quizAvg', width: 12 },
            { header: 'At Risk', key: 'atRisk', width: 10 },
            { header: 'Avg Time', key: 'time', width: 15 }
        ];

        basicMetrics.forEach(course => {
            summarySheet.addRow({
                course: course.courseName,
                level: course.level,
                students: course.totalStudents,
                completion: course.completionRate,
                quizAvg: course.avgQuizScore,
                atRisk: course.atRiskStudents,
                time: course.avgTimeSpent
            });
        });

        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // At-Risk Students Sheet
        if (atRiskStudents && atRiskStudents.length > 0) {
            const riskSheet = workbook.addWorksheet('At-Risk Students');

            riskSheet.columns = [
                { header: 'Student', key: 'name', width: 25 },
                { header: 'Course', key: 'course', width: 25 },
                { header: 'Risk Level', key: 'level', width: 12 },
                { header: 'Risk Score', key: 'score', width: 10 },
                { header: 'Last Accessed', key: 'lastAccessed', width: 15 },
                { header: 'Progress %', key: 'progress', width: 12 },
                { header: 'Recommendation', key: 'rec', width: 40 }
            ];

            atRiskStudents.forEach(student => {
                riskSheet.addRow({
                    name: student.student.name,
                    course: student.course.name,
                    level: student.riskLevel.toUpperCase(),
                    score: student.riskScore,
                    lastAccessed: student.lastAccessed ?
                        new Date(student.lastAccessed).toLocaleDateString() : 'Never',
                    progress: student.progress,
                    rec: student.recommendedAction
                });
            });

            riskSheet.getRow(1).font = { bold: true };
            riskSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Color code risk levels
            riskSheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    const level = row.getCell(3).value;
                    if (level === 'HIGH') {
                        row.getCell(3).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFCCCC' } // Light red
                        };
                    } else if (level === 'MEDIUM') {
                        row.getCell(3).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFE0B2' } // Light orange
                        };
                    }
                }
            });
        }

        // Remedial Effectiveness Sheet
        if (remedialEffectiveness && remedialEffectiveness.effectivenessByCourse) {
            const remedialSheet = workbook.addWorksheet('Remedial Effectiveness');

            remedialSheet.columns = [
                { header: 'Course', key: 'course', width: 30 },
                { header: 'Students', key: 'students', width: 12 },
                { header: 'Total Remedials', key: 'total', width: 15 },
                { header: 'Completed', key: 'completed', width: 15 },
                { header: 'Completion %', key: 'rate', width: 15 }
            ];

            remedialSheet.addRow({
                course: 'OVERALL',
                students: remedialEffectiveness.totalStudentsWithRemedial,
                total: '-',
                completed: '-',
                rate: `${remedialEffectiveness.averageCompletionRate.toFixed(1)}%`
            });

            remedialSheet.addRow({});

            remedialEffectiveness.effectivenessByCourse.forEach(course => {
                remedialSheet.addRow({
                    course: course.courseName,
                    students: course.studentsCount,
                    total: course.totalRemedial,
                    completed: course.completedRemedial,
                    rate: course.averageCompletionRate
                });
            });

            remedialSheet.getRow(1).font = { bold: true };
            remedialSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        }
    }

    static async addPlatformOverviewExcel(workbook, data) {
        const { userMetrics, courseMetrics, engagementMetrics, trends } = data;

        // User Metrics Sheet
        const userSheet = workbook.addWorksheet('User Analytics');

        userSheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        userSheet.addRow({ metric: 'Total Students', value: userMetrics.totals.students });
        userSheet.addRow({ metric: 'Total Instructors', value: userMetrics.totals.instructors });
        userSheet.addRow({ metric: 'Total Admins', value: userMetrics.totals.admins });
        userSheet.addRow({ metric: 'Total Users', value: userMetrics.totals.total });
        userSheet.addRow({});
        userSheet.addRow({ metric: 'New Students (30d)', value: userMetrics.new.students });
        userSheet.addRow({ metric: 'New Instructors (30d)', value: userMetrics.new.instructors });
        userSheet.addRow({});
        userSheet.addRow({ metric: 'Active Students (30d)', value: userMetrics.active.students });
        userSheet.addRow({ metric: 'Active Rate', value: `${userMetrics.active.percentage}%` });
        userSheet.addRow({});
        userSheet.addRow({ metric: 'Onboarded Students', value: userMetrics.onboarding.completed });
        userSheet.addRow({ metric: 'Onboarding Rate', value: `${userMetrics.onboarding.rate}%` });

        userSheet.getRow(1).font = { bold: true };
        userSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Course Metrics Sheet
        const courseSheet = workbook.addWorksheet('Course Analytics');

        courseSheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        courseSheet.addRow({ metric: 'Total Courses', value: courseMetrics.totals.total });
        courseSheet.addRow({ metric: 'Published Courses', value: courseMetrics.totals.published });
        courseSheet.addRow({ metric: 'Draft Courses', value: courseMetrics.totals.draft });
        courseSheet.addRow({ metric: 'Published Rate', value: `${courseMetrics.totals.publishedRate}%` });
        courseSheet.addRow({});

        courseSheet.addRow({ metric: 'COURSES BY LEVEL', value: '' });
        courseMetrics.levelDistribution.forEach(level => {
            courseSheet.addRow({
                metric: `  ${level.level}`,
                value: `${level.count} courses, ${level.enrollments} enrollments`
            });
        });

        courseSheet.getRow(1).font = { bold: true };
        courseSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Popular Courses Sheet
        const popularSheet = workbook.addWorksheet('Popular Courses');

        popularSheet.columns = [
            { header: 'Rank', key: 'rank', width: 8 },
            { header: 'Course', key: 'name', width: 35 },
            { header: 'Instructor', key: 'instructor', width: 25 },
            { header: 'Level', key: 'level', width: 15 },
            { header: 'Enrollments', key: 'enrollments', width: 12 }
        ];

        courseMetrics.popularCourses.forEach((course, index) => {
            popularSheet.addRow({
                rank: index + 1,
                name: course.name,
                instructor: course.instructor,
                level: course.level,
                enrollments: course.enrollments
            });
        });

        popularSheet.getRow(1).font = { bold: true };
        popularSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Engagement Sheet
        const engagementSheet = workbook.addWorksheet('Engagement');

        engagementSheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        engagementSheet.addRow({ metric: 'Average Time Spent', value: engagementMetrics.averages.timeSpent });
        engagementSheet.addRow({ metric: 'Average Quiz Score', value: `${engagementMetrics.averages.quizScore}%` });
        engagementSheet.addRow({ metric: 'Overall Pass Rate', value: `${engagementMetrics.averages.passRate}%` });
        engagementSheet.addRow({ metric: 'Total Quiz Attempts', value: engagementMetrics.totals.totalAttempts });
        engagementSheet.addRow({ metric: 'Total Passed Quizzes', value: engagementMetrics.totals.totalPassed });
        engagementSheet.addRow({ metric: 'Students in Remedial', value: engagementMetrics.totals.studentsInRemedial });
        engagementSheet.addRow({ metric: 'Remedial Rate', value: `${engagementMetrics.totals.remedialRate}%` });

        engagementSheet.getRow(1).font = { bold: true };
        engagementSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Daily Active Users Sheet
        if (engagementMetrics.dailyActive && engagementMetrics.dailyActive.length > 0) {
            const dailySheet = workbook.addWorksheet('Daily Active Users');

            dailySheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Day', key: 'day', width: 10 },
                { header: 'Active Users', key: 'count', width: 15 }
            ];

            engagementMetrics.dailyActive.forEach(day => {
                dailySheet.addRow({
                    date: day.date,
                    day: day.dayName,
                    count: day.count
                });
            });

            dailySheet.getRow(1).font = { bold: true };
            dailySheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        }
    }

    static async addComparativeAnalyticsExcel(workbook, data) {
        const { courseInfo, classStats, studentComparisons, distribution } = data;

        // Summary Sheet
        const summarySheet = workbook.addWorksheet('Summary');

        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        summarySheet.addRow({ metric: 'Course', value: courseInfo.name });
        summarySheet.addRow({ metric: 'Level', value: courseInfo.level });
        summarySheet.addRow({ metric: 'Total Students', value: courseInfo.totalStudents });
        summarySheet.addRow({});
        summarySheet.addRow({ metric: 'Average Quiz Score', value: `${classStats.averageQuizScore}%` });
        summarySheet.addRow({ metric: 'Average Completion', value: `${classStats.averageCompletion}%` });
        summarySheet.addRow({ metric: 'Average Time Spent', value: classStats.averageTimeSpent });
        summarySheet.addRow({ metric: 'Pass Rate', value: `${classStats.passRate}%` });

        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Student Comparison Sheet
        const comparisonSheet = workbook.addWorksheet('Student Comparison');

        comparisonSheet.columns = [
            { header: 'Rank', key: 'rank', width: 8 },
            { header: 'Student', key: 'name', width: 25 },
            { header: 'Quiz Score %', key: 'quizScore', width: 12 },
            { header: 'Completion %', key: 'completion', width: 12 },
            { header: 'Time Spent', key: 'time', width: 15 },
            { header: 'Quiz Percentile', key: 'quizPerc', width: 15 },
            { header: 'Time Percentile', key: 'timePerc', width: 15 },
            { header: 'Status', key: 'status', width: 12 }
        ];

        studentComparisons.forEach((student, index) => {
            comparisonSheet.addRow({
                rank: index + 1,
                name: student.student.name,
                quizScore: student.metrics.quizScore,
                completion: student.metrics.completion,
                time: student.metrics.timeSpent,
                quizPerc: `${student.percentiles.quizPercentile}%`,
                timePerc: `${student.percentiles.timePercentile}%`,
                status: student.status
            });
        });

        comparisonSheet.getRow(1).font = { bold: true };
        comparisonSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Distribution Sheet
        const distSheet = workbook.addWorksheet('Score Distribution');

        distSheet.columns = [
            { header: 'Score Range', key: 'range', width: 15 },
            { header: 'Students', key: 'count', width: 12 },
            { header: 'Percentage', key: 'percentage', width: 12 }
        ];

        distribution.forEach(bin => {
            distSheet.addRow({
                range: bin.range,
                count: bin.count,
                percentage: `${bin.percentage}%`
            });
        });

        distSheet.getRow(1).font = { bold: true };
        distSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
    }

    // Helper: Get nested value from object using dot notation
    static getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) =>
            current && current[key] !== undefined ? current[key] : '', obj);
    }

    // Helper: Format value for CSV
    static formatCSVValue(value) {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}

module.exports = ExportService;