const express = require('express');
const router = express.Router();
const { createQuiz,
     getAllQuizzesByInstructor,
     getQuizById,
     updateQuiz,
     deleteQuiz,
     submitQuiz,
     accessQuiz
      } = require('../controllers/quizCourse');

// =======middleware ========
const authorize=require('./../middleware/authorize');
const authenticate = require('../middleware/authenticate');


// POST quizcreate
router.post('/createQuiz', authenticate, 
     authorize(['instructor']), createQuiz);

router.get("/", authenticate,authorize(['instructor']), getAllQuizzesByInstructor);
router.get("/:quizId",authenticate,authorize(['instructor']), getQuizById );
router.post("/:quizId",authenticate,authorize(['instructor']), updateQuiz);
router.delete("/:quizId",authenticate,authorize(['instructor']), deleteQuiz);


// =========student management on quiz ==========
router.post("/submit-quiz/:quizId", authenticate, submitQuiz);
router.get('/quiz/:courseId', authenticate, accessQuiz);

module.exports = router;
