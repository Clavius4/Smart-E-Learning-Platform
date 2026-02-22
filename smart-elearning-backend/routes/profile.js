const express = require("express");
const router = express.Router();
// =======middleware ========
const authorize = require('./../middleware/authorize');
const authenticate = require('./../middleware/authenticate');
//const { auth, isInstructor } = require("../middleware/auth");

// controllers
const {
    updateProfile,
    updateUserProfileImage,
    getUserDetails,
    getEnrolledCourses,
    deleteAccount,
    instructorDashboard,
    enrollStudents,
    onBoardDetails,
    ChildReport,
    updateLearningStyle,
    updateDifficultyLevel
} = require('../controllers/profile');


// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delete User Account
router.delete('/deleteProfile', authenticate, deleteAccount);
router.put('/updateProfile', authenticate, updateProfile);
router.get('/getUserDetails', authenticate, getUserDetails);


// Get Enrolled Courses
router.get('/getEnrolledCourses', authenticate, getEnrolledCourses);
router.post('/enroll', authenticate, enrollStudents)

// update profile image
router.put('/updateUserProfileImage', authenticate, updateUserProfileImage);

// instructor Dashboard Details
router.get('/instructorDashboard', authenticate,
    authorize(['instructor'])
    , instructorDashboard);

//onBoard details for Students
router.post("/onboarding", authenticate, onBoardDetails);
router.get('/report/:childId', ChildReport);

// Update learning style
router.put('/update-learning-style', authenticate, updateLearningStyle);

// Update difficulty level
router.put('/update-difficulty-level', authenticate, updateDifficultyLevel);

module.exports = router;
