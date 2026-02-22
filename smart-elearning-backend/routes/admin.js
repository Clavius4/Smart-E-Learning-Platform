const express = require("express");
const router = express.Router();


// categories Controllers
const {
  createCategory,
  showAllCategories,
  getCategoryPageDetails,
  deleteCategory
} = require('../controllers/category');

//middleware
const authorize = require('../middleware/authorize');
const authenticate = require('../middleware/authenticate');
const {
  getDashboardStats, // Next step will add this
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  adminLogin
} = require("../controllers/admin");
const { getAllCourses, deleteCourse } = require("../controllers/course")
// Admin login
router.post("/login", adminLogin);

// Dashboard Stats
router.get("/dashboard-stats", authenticate, authorize(['admin']), getDashboardStats);

router.get("/allcourse", authenticate, authorize(['admin']), getAllCourses);
router.delete("/deleteCourse", authenticate, authorize(['admin']), deleteCourse)

// Student CRUD
router.get("/getstudents", authenticate, authorize(['admin']), getAllStudents);
router.post("/students", authenticate, createStudent);
router.post("/students/:id", authenticate, updateStudent);
router.delete("/students/:id", authenticate, deleteStudent);

// Instructor CRUD
router.get("/instructors", authenticate, authorize(['admin']), getAllInstructors);
router.post("/instructors", authenticate, authorize(['admin']), createInstructor);
router.post("/instructors/:id", authenticate, authorize(['admin']), updateInstructor);
router.delete("/instructors/:id", authenticate, authorize(['admin']), deleteInstructor);



router.post('/createCategory', authenticate, authorize(['admin']), createCategory);
router.get('/showAllCategories', authenticate, showAllCategories);
router.post("/getCategoryPageDetails", authenticate, authorize(['admin']), getCategoryPageDetails)
router.post("/deleteCategory/:id", authenticate, authorize(['admin']), deleteCategory)



module.exports = router;