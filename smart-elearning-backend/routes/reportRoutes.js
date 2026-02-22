// routes/instructorRoutes.js
const express = require("express");
const {
    getInstructorDashboardData,
    generateInstructorReportPDF,
    getInstructorStudentsReport,
    generateStudentReportPDF,
    generateStudentReportExcel
} = require("../controllers/report");

const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get("/dashboard", authenticate, getInstructorDashboardData);
router.get("/student", authenticate, getInstructorStudentsReport);

router.get("/dashboard/pdf", authenticate, generateInstructorReportPDF);
router.get("/student/pdf", authenticate, generateStudentReportPDF);
router.get("/student/excel", authenticate, generateStudentReportExcel);

module.exports = router;
