const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getAllAssessmentsByInstructor,
  accessAssessmentByLevel,
  updateAssessment,
  deleteAssessment,
  submitAssessment
} = require('../controllers/assessmentController');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// ============ Instructor Routes ============

// Create new assessment (by level)
router.post('/create', authenticate, 
  //authorize(['instructor'])
  createAssessment);

// Get all assessments (for management)
router.get('/', authenticate, 
  //authorize(['instructor']),
   getAllAssessmentsByInstructor);

// update the assessment (for management)
router.post('/update/:assessmentId', authenticate, 
 // authorize(['instructor']),
   updateAssessment);


//delete the assessment
router.post('/del/:assessmentId', authenticate, 
 // authorize(['instructor']),
   deleteAssessment);

// ============ Student Routes ============

// Get assessment by level (for student to take)
router.get('/level/:level', authenticate,accessAssessmentByLevel);

// Submit assessment answers
router.post('/submit/:assessmentId', authenticate, submitAssessment);

module.exports = router;
