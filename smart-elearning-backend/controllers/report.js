// controllers/instructorController.js
const Course = require("../models/course");
const CourseProgress = require("../models/courseProgress");
const Student = require("../models/StudentModels/studentModels");
const PDFDocument = require("pdfkit");

// ================== GET DASHBOARD DATA ==================
exports.getInstructorDashboardData = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ instructor: instructorId })
      .populate("studentsEnrolled")
      .lean();

    const dashboardData = [];

    for (let course of courses) {
      const progressRecords = await CourseProgress.find({ courseID: course._id })
        .populate("userId", "firstName lastName")
        .lean();

      const totalStudents = course.studentsEnrolled.length;
      const completedCount = progressRecords.filter(
        p => p.completionStatus === "completed"
      ).length;

      // ✅ Average quiz score
      const avgQuizScore =
        progressRecords.length > 0
          ? (
            progressRecords.reduce((acc, record) => {
              if (!record.quizAttempts || record.quizAttempts.length === 0) return acc;
              const totalScore = record.quizAttempts.reduce(
                (sum, quiz) => sum + (quiz.percentage || 0),
                0
              );
              return acc + totalScore / record.quizAttempts.length;
            }, 0) / progressRecords.length
          ).toFixed(1)
          : 0;

      // ✅ Average time spent (in minutes instead of hours)
      const avgTimeSpent =
        progressRecords.length > 0
          ? (
            progressRecords.reduce(
              (acc, record) => acc + (record.totalTimeSpent || 0),
              0
            ) /
            progressRecords.length /
            60 // seconds → minutes
          ).toFixed(1)
          : 0;

      dashboardData.push({
        courseId: course._id,
        courseName: course.courseName,
        totalStudents,
        completionRate:
          totalStudents > 0
            ? ((completedCount / totalStudents) * 100).toFixed(1)
            : 0,
        avgQuizScore,
        avgTimeSpent,
        status: course.level
      });
    }

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Helper: translate course.status to Swahili level
function translateLevel(level) {
  switch (level.toLowerCase()) {
    case "advanced":
      return "Ngumu";
    case "beginner":
      return "Mwanzo";
    case "intermediate":
      return "Kati";
    default:
      return level;
  }
}

// Helper: draw a well-structured table with proper spacing
function drawTable(doc, headers, data, startY) {
  const tableX = 50;
  const pageWidth = 595; // A4 width in points
  const availableWidth = pageWidth - 100; // 50px margin on each side
  const colWidths = [35, 140, 65, 55, 70, 65, 65]; // Optimized for A4 width (total: 495px)
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  const rowHeight = 35; // Slightly increased for better text fit

  let currentY = startY;

  doc.fillColor('black').strokeColor('black');

  // Draw complete table border first
  doc.rect(tableX, currentY, tableWidth, rowHeight * (data.length + 1)).stroke();

  // Draw header row
  let currentX = tableX;

  // Draw header background and borders
  doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();

  // Draw vertical lines for header
  currentX = tableX;
  for (let i = 0; i < colWidths.length - 1; i++) {
    currentX += colWidths[i];
    doc.moveTo(currentX, currentY).lineTo(currentX, currentY + rowHeight).stroke();
  }

  // Add header text
  doc.fontSize(9).font('Times-Bold'); // Reduced font size for better fit
  currentX = tableX;

  headers.forEach((header, i) => {
    const cellCenterX = currentX + (colWidths[i] / 2);
    const textY = currentY + (rowHeight / 2) - 4; // Center vertically

    // Handle long header text with wrapping
    if (header.length > 12 && colWidths[i] < 80) {
      const words = header.split(' ');
      if (words.length > 1) {
        // Multi-line header
        doc.text(words[0], currentX + 2, textY - 6, { width: colWidths[i] - 4, align: 'center' });
        doc.text(words.slice(1).join(' '), currentX + 2, textY + 4, { width: colWidths[i] - 4, align: 'center' });
      } else {
        doc.text(header, currentX + 2, textY, { width: colWidths[i] - 4, align: 'center' });
      }
    } else {
      doc.text(header, cellCenterX - (doc.widthOfString(header) / 2), textY);
    }
    currentX += colWidths[i];
  });

  currentY += rowHeight;

  // Draw data rows
  doc.fontSize(8).font('Times-Roman'); // Reduced font size for data

  data.forEach((row, rowIndex) => {
    // Draw horizontal line for this row
    doc.moveTo(tableX, currentY).lineTo(tableX + tableWidth, currentY).stroke();

    // Draw vertical lines for this row
    currentX = tableX;
    for (let i = 0; i < colWidths.length - 1; i++) {
      currentX += colWidths[i];
      doc.moveTo(currentX, currentY).lineTo(currentX, currentY + rowHeight).stroke();
    }

    // Add row data
    currentX = tableX;

    row.forEach((cell, i) => {
      const cellText = String(cell || '');
      const textY = currentY + (rowHeight / 2) - 3; // Center vertically

      if (i === 0) {
        // Center align for row numbers
        const cellCenterX = currentX + (colWidths[i] / 2);
        doc.text(cellText, cellCenterX - (doc.widthOfString(cellText) / 2), textY);
      } else if (i > 2) {
        // Center align for numerical data
        const cellCenterX = currentX + (colWidths[i] / 2);
        doc.text(cellText, cellCenterX - (doc.widthOfString(cellText) / 2), textY);
      } else {
        // Left align for text data with padding and text wrapping
        if (cellText.length > 20 && i === 1) {
          // Handle long course names with wrapping
          const words = cellText.split(' ');
          let line1 = '';
          let line2 = '';

          for (let word of words) {
            if ((line1 + word).length < 22) {
              line1 += (line1 ? ' ' : '') + word;
            } else {
              line2 += (line2 ? ' ' : '') + word;
            }
          }

          doc.text(line1, currentX + 2, textY - 6);
          if (line2) doc.text(line2, currentX + 2, textY + 6);
        } else {
          doc.text(cellText, currentX + 3, textY, {
            width: colWidths[i] - 6,
            ellipsis: true
          });
        }
      }

      currentX += colWidths[i];
    });

    currentY += rowHeight;
  });

  // Draw final bottom border
  doc.moveTo(tableX, currentY).lineTo(tableX + tableWidth, currentY).stroke();

  return currentY;
}

// Helper: create statistics cards layout
function createStatsSection(doc, stats, startY) {
  const cardWidth = 120;
  const cardHeight = 60;
  const margin = 10;

  let x = 50;
  let y = startY;

  stats.forEach((stat, index) => {
    // Card border
    doc.rect(x, y, cardWidth, cardHeight).stroke();

    // Title
    doc.fontSize(9).font('Times-Roman');
    doc.text(stat.label, x + 10, y + 10, {
      width: cardWidth - 20,
      align: 'center'
    });

    // Value
    doc.fontSize(16).font('Times-Bold');
    doc.text(stat.value, x + 10, y + 30, {
      width: cardWidth - 20,
      align: 'center'
    });

    x += cardWidth + margin;

    // Move to next row if needed
    if ((index + 1) % 4 === 0) {
      x = 50;
      y += cardHeight + margin;
    }
  });

  return y + cardHeight + 20;
}




exports.generateInstructorReportPDF = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ instructor: instructorId })
      .populate("studentsEnrolled")
      .lean();

    const reportData = [];
    let totalStudentsAcrossAll = 0;
    let totalCompletedAcrossAll = 0;
    let totalAvgQuizScore = 0;
    let totalAvgTimeSpent = 0;

    for (let course of courses) {
      const progressRecords = await CourseProgress.find({ courseID: course._id })
        .populate("userId", "firstName lastName")
        .lean();

      const totalStudents = course.studentsEnrolled.length;
      const completedCount = progressRecords.filter(
        p => p.completionStatus === "completed"
      ).length;

      totalStudentsAcrossAll += totalStudents;
      totalCompletedAcrossAll += completedCount;

      // ✅ Average quiz score
      const avgQuizScore =
        progressRecords.length > 0
          ? (
            progressRecords.reduce((acc, record) => {
              if (!record.quizAttempts || record.quizAttempts.length === 0) return acc;
              const totalScore = record.quizAttempts.reduce(
                (sum, quiz) => sum + (quiz.percentage || 0),
                0
              );
              return acc + totalScore / record.quizAttempts.length;
            }, 0) / progressRecords.length
          )
          : 0;

      // ✅ Average time spent (minutes instead of hours)
      const avgTimeSpent =
        progressRecords.length > 0
          ? (
            progressRecords.reduce(
              (acc, record) => acc + (record.totalTimeSpent || 0),
              0
            ) /
            progressRecords.length /
            60 // seconds → minutes
          )
          : 0;

      totalAvgQuizScore += avgQuizScore;
      totalAvgTimeSpent += avgTimeSpent;

      // ✅ Student performance from quizAttempts
      const studentsPerformance = progressRecords.map(r => {
        const avgScore =
          r.quizAttempts && r.quizAttempts.length > 0
            ? r.quizAttempts.reduce((sum, q) => sum + (q.percentage || 0), 0) /
            r.quizAttempts.length
            : 0;

        return {
          name: r.userId
            ? `${r.userId.firstName} ${r.userId.lastName}`
            : "Haijulikani",
          avgScore,
          timeSpent: (r.totalTimeSpent || 0) / 60 // ✅ minutes
        };
      });

      const topStudent =
        studentsPerformance.sort((a, b) => b.avgScore - a.avgScore)[0] || null;
      const lowStudent =
        studentsPerformance.sort((a, b) => a.avgScore - b.avgScore)[0] || null;
      const mostEngaged =
        studentsPerformance.sort((a, b) => b.timeSpent - a.timeSpent)[0] || null;
      const leastEngaged =
        studentsPerformance.sort((a, b) => a.timeSpent - b.timeSpent)[0] || null;

      reportData.push({
        courseName: course.courseName,
        level: translateLevel(course.level),
        totalStudents,
        completionRate:
          totalStudents > 0 ? completedCount / totalStudents * 100 : 0,
        avgQuizScore,
        avgTimeSpent,
        topStudent,
        lowStudent,
        mostEngaged,
        leastEngaged
      });
    }

    // === Overall stats ===
    const overallCompletionRate =
      totalStudentsAcrossAll > 0
        ? (totalCompletedAcrossAll / totalStudentsAcrossAll) * 100
        : 0;
    const overallAvgQuizScore =
      reportData.length > 0 ? totalAvgQuizScore / reportData.length : 0;
    const overallAvgTimeSpent =
      reportData.length > 0 ? totalAvgTimeSpent / reportData.length : 0;

    if (reportData.length === 0) {
      reportData.push({
        courseName: "Hakuna kozi zilizopatikana au hakuna data ya maendeleo",
        level: "",
        totalStudents: 0,
        completionRate: 0,
        avgQuizScore: 0,
        avgTimeSpent: 0
      });
    }

    // === PDF generation ===
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Ripoti_Mwalimu.pdf"
    );
    doc.pipe(res);

    doc.fillColor("black")
      .fontSize(20)
      .font("Times-Bold")
      .text("Ripoti ya Dashibodi ya Mwalimu", { align: "center" });

    doc.moveDown(2);

    doc.fontSize(12).font("Times-Roman");
    doc.text(`Kitambulisho cha Mwalimu: ${instructorId}`, 50);
    doc.text(
      `Imetengenezwa: ${new Date().toLocaleString("sw-KE")}`,
      50
    );
    doc.moveDown(2);

    doc.fontSize(16).font("Times-Bold");
    doc.text("MUHTASARI WA TAKWIMU", 50);
    doc.moveDown(1);

    const stats = [
      { label: "Jumla ya Masomo", value: reportData.length },
      { label: "Jumla ya Wanafunzi kwa Somo", value: totalStudentsAcrossAll },
      { label: "Kiwango cha Kukamilisha", value: `${overallCompletionRate.toFixed(1)}%` },
      { label: "Alama ya Wastani", value: `${overallAvgQuizScore.toFixed(1)}%` },
      { label: "Muda wa Wastani (dakika)", value: overallAvgTimeSpent.toFixed(1) }
    ];

    const nextY = createStatsSection(doc, stats, doc.y);
    doc.y = nextY;

    doc.fontSize(16).font("Times-Bold");
    doc.text("MAELEZO YA SOMO", 50);
    doc.moveDown(1);

    const tableHeaders = [
      "Namba",
      "Jina la Somo",
      "Kiwango",
      "Wanafunzi",
      "Kukamilisha (%)",
      "Alama (%)",
      "Muda (dakika)"
    ];

    const tableData = reportData.map((course, index) => [
      index + 1,
      course.courseName,
      course.level,
      course.totalStudents,
      `${course.completionRate.toFixed(1)}%`,
      `${course.avgQuizScore.toFixed(1)}%`,
      course.avgTimeSpent.toFixed(1)
    ]);

    const tableEndY = drawTable(doc, tableHeaders, tableData, doc.y);
    doc.y = tableEndY + 20;

    if (doc.y > 650) doc.addPage();

    doc.fontSize(16).font("Times-Bold");
    doc.text("UCHAMBUZI WA KINA WA SOMO", 50);
    doc.moveDown(1.5);

    reportData.forEach((course, index) => {
      if (doc.y > 680) {
        doc.addPage();
        doc.y = 50;
      }

      doc.fontSize(14).font("Times-Bold");
      doc.text(`Somo ${index + 1}: ${course.courseName}`, 50);
      doc.moveDown(0.5);

      doc.fontSize(11).font("Times-Roman");
      doc.text(`Kiwango: ${course.level}`, 70);
      doc.text(`Jumla ya Wanafunzi: ${course.totalStudents}`, 70);
      doc.text(`Kiwango cha Kukamilisha: ${course.completionRate.toFixed(1)}%`, 70);
      doc.text(`Alama ya Wastani: ${course.avgQuizScore.toFixed(1)}%`, 70);
      doc.text(`Muda wa Wastani: ${course.avgTimeSpent.toFixed(1)} dakika`, 70);
      doc.moveDown(1);

      if (course.topStudent) {
        doc.fontSize(12).font("Times-Bold");
        doc.text("Utendaji wa Wanafunzi:", 70);
        doc.moveDown(0.5);

        doc.fontSize(10).font("Times-Roman");
        doc.text(
          `Mwanafunzi Bora: ${course.topStudent.name} (${course.topStudent.avgScore.toFixed(1)}%)`,
          90
        );
        if (course.lowStudent)
          doc.text(
            `Mwanafunzi Mdogo: ${course.lowStudent.name} (${course.lowStudent.avgScore.toFixed(1)}%)`,
            90
          );
        if (course.mostEngaged)
          doc.text(
            `Mwanafunzi Aliyejishughulisha Zaidi: ${course.mostEngaged.name} (${course.mostEngaged.timeSpent.toFixed(1)} dakika)`,
            90
          );
        if (course.leastEngaged)
          doc.text(
            `Mwanafunzi Aliyejishughulisha Kidogo: ${course.leastEngaged.name} (${course.leastEngaged.timeSpent.toFixed(1)} dakika)`,
            90
          );
      }

      doc.moveDown(2);
    });

    doc.addPage();
    doc.fontSize(18).font('Times-Bold').text('Mapendekezo na Maarifa', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).font('Times-Roman');
    doc.text('Kulingana na data iliyotolewa, zingatia yafuatayo:', 50);
    doc.moveDown(1);

    const recommendations = ['Kagua moduli zilizo na alama za chini kwenye mtihani', 'Toa msaada zaidi kwa wanafunzi wenye alama za chini', 'Ongeza ushiriki kupitia maudhui ya mwingiliano', 'Tambua wanafunzi bora ili kuhimiza ushiriki'];

    recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`, 70);
      doc.moveDown(0.7);
    });

    doc.moveDown(2);
    doc.fontSize(10).font('Times-Roman');
    doc.text('Ripoti hii imetengenezwa kiotomatiki kutoka kwenye data ya mfumo wa usimamizi wa masomo.', { align: 'center' });
    doc.text(`Imetengenezwa mnamo: ${new Date().toLocaleString("sw-KE")}`, { align: 'center' });
    doc.end();
  } catch (error) {
    console.error("Error generating report PDF", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Helper function to fetch report data (Single Source of Truth)
const fetchStudentReportData = async (instructorId) => {
  const PASS_MARK = 80;
  const INACTIVITY_DAYS = 14;

  const courses = await Course.find({ instructor: instructorId })
    .populate({
      path: "studentsEnrolled",
      select: "firstName lastName email",
    })
    .lean();

  if (!courses.length) return [];

  const courseIds = courses.map(c => c._id.toString());
  const studentMap = new Map();
  const coursesByStudent = new Map();

  for (const c of courses) {
    for (const s of (c.studentsEnrolled || [])) {
      const sid = s._id.toString();
      if (!studentMap.has(sid)) {
        studentMap.set(sid, {
          _id: s._id,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email
        });
      }
      if (!coursesByStudent.has(sid)) coursesByStudent.set(sid, []);
      coursesByStudent.get(sid).push({
        courseId: c._id.toString(),
        courseName: c.courseName,
        level: c.level || "Unknown"
      });
    }
  }
  const studentIds = Array.from(studentMap.keys());

  const progressRecords = await CourseProgress.find({
    courseID: { $in: courseIds },
    userId: { $in: studentIds },
  })
    .populate("quizAttempts.quizId", "title")
    .lean();

  const report = [];

  const determineSubject = (courseName) => {
    const lower = courseName.toLowerCase();
    if (lower.includes("math") || lower.includes("hesabu") || lower.includes("arithmetic") || lower.includes("namba") || lower.includes("count")) {
      return "Kuhesabu";
    }
    return "Kusoma";
  };

  for (const sid of studentIds) {
    const student = studentMap.get(sid);
    const enrolledCourses = coursesByStudent.get(sid);
    const studentProgress = progressRecords.filter(p => String(p.userId) === sid);

    let totalScore = 0;
    let quizCount = 0;
    let strugglingSubjects = new Set();
    let strugglingCourses = [];
    const strugglingCourseKeys = new Set();
    let challenges = new Set();
    let specificChallengesDetailed = [];
    const specificChallengeKeys = new Set();
    let levels = new Set();

    for (const courseInfo of enrolledCourses) {
      levels.add(courseInfo.level);
      const p = studentProgress.find(r => r.courseID.toString() === courseInfo.courseId);

      let courseAvg = 0;
      if (p && p.quizAttempts && p.quizAttempts.length > 0) {
        const sum = p.quizAttempts.reduce((acc, q) => acc + (q.percentage || 0), 0);
        courseAvg = sum / p.quizAttempts.length;
        totalScore += sum;
        quizCount += p.quizAttempts.length;
      }

      const subject = determineSubject(courseInfo.courseName);

      if (courseAvg < PASS_MARK) {
        strugglingSubjects.add(subject);
        const key = `${subject}||${courseInfo.courseName}`;
        if (!strugglingCourseKeys.has(key)) {
          strugglingCourseKeys.add(key);
          strugglingCourses.push({ subject, course: courseInfo.courseName });
        }
        if (subject === "Kuhesabu") {
          challenges.add("Basic arithmetic");
          challenges.add("Number recognition");
          const mathKey1 = `${courseInfo.courseName}||Basic arithmetic`;
          if (!specificChallengeKeys.has(mathKey1)) {
            specificChallengeKeys.add(mathKey1);
            specificChallengesDetailed.push({ course: courseInfo.courseName, challenge: "Basic arithmetic" });
          }
          const mathKey2 = `${courseInfo.courseName}||Number recognition`;
          if (!specificChallengeKeys.has(mathKey2)) {
            specificChallengeKeys.add(mathKey2);
            specificChallengesDetailed.push({ course: courseInfo.courseName, challenge: "Number recognition" });
          }
        } else {
          challenges.add("Reading comprehension");
          challenges.add("Vocabulary");
          const readKey1 = `${courseInfo.courseName}||Reading comprehension`;
          if (!specificChallengeKeys.has(readKey1)) {
            specificChallengeKeys.add(readKey1);
            specificChallengesDetailed.push({ course: courseInfo.courseName, challenge: "Reading comprehension" });
          }
          const readKey2 = `${courseInfo.courseName}||Vocabulary`;
          if (!specificChallengeKeys.has(readKey2)) {
            specificChallengeKeys.add(readKey2);
            specificChallengesDetailed.push({ course: courseInfo.courseName, challenge: "Vocabulary" });
          }
        }
      }

      if (p && p.lastAccessed) {
        const days = (Date.now() - new Date(p.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
        if (days > INACTIVITY_DAYS) {
          challenges.add("Consistent attendance");
          const inactiveKey = `${courseInfo.courseName}||Consistent attendance`;
          if (!specificChallengeKeys.has(inactiveKey)) {
            specificChallengeKeys.add(inactiveKey);
            specificChallengesDetailed.push({ course: courseInfo.courseName, challenge: "Consistent attendance" });
          }
        }
      } else if (!p) {
        challenges.add("Not started");
        const notStartedKey = `${courseInfo.courseName}||Not started`;
        if (!specificChallengeKeys.has(notStartedKey)) {
          specificChallengeKeys.add(notStartedKey);
          specificChallengesDetailed.push({ course: courseInfo.courseName, challenge: "Not started" });
        }
      }
    }

    const overallAvg = quizCount > 0 ? (totalScore / quizCount) : 0;

    let status = "Needs Support";
    if (overallAvg >= 80) status = "Good";
    else if (overallAvg >= 50) status = "Average";

    const recommendations = [];
    if (strugglingSubjects.has("Kuhesabu")) recommendations.push("Assign extra practice exercises in counting and basic math.");
    if (strugglingSubjects.has("Kusoma")) recommendations.push("Encourage daily reading sessions to improve comprehension.");
    if (status === "Needs Support") recommendations.push("Schedule a one-on-one review session.");
    else if (status === "Good") recommendations.push("Provide advanced material to maintain engagement.");
    if (recommendations.length === 0) recommendations.push("Continue with current learning plan.");

    report.push({
      studentName: `${student.firstName} ${student.lastName}`,
      level: Array.from(levels).join(", "),
      quizMarks: Math.round(overallAvg),
      strugglingAreas: Array.from(strugglingSubjects),
      strugglingCourses,
      specificChallenges: Array.from(challenges),
      specificChallengesDetailed,
      status: status,
      recommendations: recommendations
    });
  }

  return report;
};

exports.getInstructorStudentsReport = async (req, res) => {
  try {
    const report = await fetchStudentReportData(req.user.id);
    return res.status(200).json({ success: true, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
};

exports.generateStudentReportPDF = async (req, res) => {
  try {
    const report = await fetchStudentReportData(req.user.id);

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Ripoti_Mwanafunzi.pdf");
    doc.pipe(res);

    doc.fontSize(20).font("Times-Bold").text("Ripoti ya Maendeleo ya Mwanafunzi", { align: "center" });
    doc.moveDown();

    report.forEach((student, i) => {
      if (doc.y > 650) doc.addPage();

      doc.rect(30, doc.y, 535, 120).stroke();
      let y = doc.y + 10;

      doc.fontSize(12).font("Times-Bold").text(`Jina: ${student.studentName}`, 40, y);
      doc.font("Times-Roman").text(`Kiwango: ${student.level}`, 300, y);
      y += 20;

      doc.text(`Alama za Maswali: ${student.quizMarks}%`, 40, y);
      doc.text(`Hali: ${student.status}`, 300, y);
      y += 20;

      doc.text(`Maeneo yanayohitaji juhudi: ${student.strugglingAreas.join(", ") || "Hakuna"}`, 40, y);
      y += 20;

      doc.text(`Changamoto Mahususi: ${student.specificChallenges.join(", ") || "-"}`, 40, y);
      y += 20;

      doc.font("Times-Bold").text("Mapendekezo:", 40, y);
      doc.font("Times-Roman").text(student.recommendations.join(". "), 150, y, { width: 400 });

      doc.y = y + 40;
      doc.moveDown(1);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hitilafu katika kutengeneza PDF", error: err.message });
  }
};

exports.generateStudentReportExcel = async (req, res) => {
  try {
    const report = await fetchStudentReportData(req.user.id);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Maendeleo ya Wanafunzi');

    sheet.columns = [
      { header: 'Jina la Mwanafunzi', key: 'name', width: 25 },
      { header: 'Kiwango', key: 'level', width: 15 },
      { header: 'Alama za Maswali (%)', key: 'marks', width: 15 },
      { header: 'Maeneo yanayohitaji juhudi', key: 'struggles', width: 25 },
      { header: 'Changamoto Mahususi', key: 'challenges', width: 30 },
      { header: 'Hali', key: 'status', width: 15 },
      { header: 'Mapendekezo', key: 'recs', width: 50 }
    ];

    // Style headers
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    report.forEach(s => {
      const row = sheet.addRow({
        name: s.studentName,
        level: s.level,
        marks: s.quizMarks,
        struggles: s.strugglingAreas.join(", "),
        challenges: s.specificChallenges.join(", "),
        status: s.status,
        recs: s.recommendations.join(". ")
      });

      if (s.status === 'Needs Support') {
        row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } };
      } else if (s.status === 'Good') {
        row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } };
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Ripoti_Mwanafunzi.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hitilafu katika kutengeneza Excel", error: err.message });
  }
};
