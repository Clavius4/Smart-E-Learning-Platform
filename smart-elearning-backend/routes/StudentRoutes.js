const express = require('express');
const router = express.Router();

//controller from controller students
const {
    signup,
    login,
    verifyOTP,
    resendOtp,
    changePassword,
    updateProfile,
    logout,
    resetStudentPassword,
    resetStudentPasswordToken,
    updatePersonalization
}=require('../controllers/authStudent');

//Middleware 
//const {auth}=require('../../middleware/studentMW')
const authenticate = require('../middleware/authenticate');
//Routes for student signup
router.post('/student/signup', signup);
router.post('/student/update',authenticate, updateProfile);

router.post('/student/login', login);

router.post("/logout", logout);

router.post('/student/verify-otp', verifyOTP);
router.post('/student/resend-otp', resendOtp);

router.post('/student/change-password', authenticate, changePassword);

router.post('/reset-password-token', resetStudentPasswordToken);

// Route for resetting instructor's password after verification
router.post("/reset-password", resetStudentPassword)


router.post('/personalize',authenticate,updatePersonalization);
router.post('/student/personalize', authenticate, updatePersonalization);


module.exports=router
