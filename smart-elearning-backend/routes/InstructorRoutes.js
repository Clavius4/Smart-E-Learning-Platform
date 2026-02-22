const express = require('express');
const router = express.Router();

//controller from controller students
const {
    signup,
    login,
     verifyOTP,
    changePassword
}=require('../controllers/authInstructor');

// Resetpassword controllers
const {
    resetPasswordToken,
    resetPassword,
} = require('../controllers/resetPassword');


//Middleware 
// const {auth }=require('../../middleware/auth')
// const authorize=require('./../../middleware/authorize');
const authenticate = require('../middleware/authenticate');

//Routes for instructor signup
router.post('/instructor/signup', signup);
router.post('/instructor/login',login);
router.post('/instructor/verify-otp', verifyOTP);
router.post('/instructor/change-password', authenticate, changePassword);


// Route for generating a reset password token
router.post('/reset-password-token', resetPasswordToken);

// Route for resetting instructor's password after verification
router.post("/reset-password", resetPassword)
module.exports=router

